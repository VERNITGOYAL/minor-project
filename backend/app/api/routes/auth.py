import os
import secrets

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from dotenv import load_dotenv

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.database.connection import get_db
from app.database.models import User, EmailOTP
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    PasswordResetRequest,
    PasswordResetConfirmRequest,
    GoogleLoginRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
    UpdateProfileRequest,
    VerifyEmailChangeRequest,
)
from app.services.email_service import send_otp_email
from app.core.security import create_access_token

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# -----------------------------
# OTP Helpers
# -----------------------------

def generate_otp():
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str):
    return pwd_context.hash(otp)


def verify_otp(otp: str, otp_hash: str):
    return pwd_context.verify(otp, otp_hash)


# -----------------------------
# SIGNUP
# -----------------------------

@router.post("/signup")
def signup(
    data: SignupRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).strip().lower()

    # Check if user already exists
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:

        # Already verified
        if existing_user.is_verified:
            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists.",
            )

        # Existing but unverified user
        existing_user.name = data.name.strip()
        existing_user.password_hash = pwd_context.hash(
            data.password
        )

        user = existing_user

    else:

        # Create new user
        user = User(
            name=data.name.strip(),
            email=email,
            password_hash=pwd_context.hash(data.password),
            is_verified=False,
        )

        db.add(user)
        db.flush()

    # --------------------------------
    # Invalidate previous OTPs
    # --------------------------------

    db.query(EmailOTP).filter(
        EmailOTP.email == user.email,
        EmailOTP.used == False,
        EmailOTP.purpose == "signup"
    ).update(
        {"used": True},
        synchronize_session=False,
    )

    # Generate new OTP
    otp = generate_otp()

    # Create OTP record
    otp_record = EmailOTP(
    email=user.email,
    otp_hash=hash_otp(otp),
    expires_at=datetime.utcnow() + timedelta(minutes=10),
    attempts=0,
    used=False,
    purpose="signup",
)

    db.add(otp_record)
    db.commit()

    # --------------------------------
    # Send OTP email
    # --------------------------------

    try:
        send_otp_email(email, otp)

    except Exception:

        otp_record.used = True

        if existing_user:
            db.commit()
        else:
            db.delete(user)
            db.commit()

        raise HTTPException(
            status_code=500,
            detail="Unable to send verification email.",
        )

    return {
        "message": "Account created. Verification OTP sent to your email.",
        "email": email,
    }


# -----------------------------
# LOGIN
# -----------------------------

@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).strip().lower()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account exists for this email. Create an account first.",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before signing in.",
        )

    if not pwd_context.verify(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password.",
        )

    return {
        "message": "Login successful.",
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }


@router.post("/google")
def google_login(
    data: GoogleLoginRequest,
    db: Session = Depends(get_db),
):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="Google login is not configured.",
        )

    try:
        google_user = id_token.verify_oauth2_token(
            data.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential.",
        )

    google_id = google_user.get("sub")
    email = google_user.get("email")
    name = google_user.get("name")

    if not google_id or not email:
        raise HTTPException(
            status_code=400,
            detail="Google account information is incomplete.",
        )

    email = email.strip().lower()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        user = User(
            name=name or email.split("@")[0],
            email=email,
            password_hash="GOOGLE_ACCOUNT",
            is_verified=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    else:
        if name and user.name != name:
            user.name = name

        user.is_verified = True
        db.commit()

    return {
        "message": "Google login successful.",
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }

# -----------------------------
# VERIFY OTP
# -----------------------------

@router.post("/verify-otp")
def verify_email_otp(
    data: VerifyOTPRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).strip().lower()

    # Find user
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account exists for this email.",
        )

    # Already verified
    if user.is_verified:
        return {
            "message": "Email is already verified."
        }

    # Find latest active OTP
    otp_record = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == user.email,
            EmailOTP.used == False,
            EmailOTP.purpose == "signup",
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="No active verification code. Please request a new OTP.",
        )

    # Check expiry
    if datetime.utcnow() > otp_record.expires_at:

        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new one.",
        )

    # Check maximum attempts
    if otp_record.attempts >= 5:

        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Too many incorrect attempts. Please request a new OTP.",
        )

    # Verify OTP
    if not verify_otp(
        data.otp,
        otp_record.otp_hash,
    ):

        otp_record.attempts += 1
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Incorrect OTP.",
        )

    # --------------------------------
    # OTP correct
    # --------------------------------

    user.is_verified = True
    otp_record.used = True

    db.commit()

    return {
        "message": "Email verified successfully.",
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }

@router.put("/profile")
def update_profile(
    data: UpdateProfileRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.id == data.id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User account not found.",
        )

    new_email = str(data.email).strip().lower()

    # -----------------------------
    # NAME ONLY
    # -----------------------------

    if new_email == user.email:
        user.name = data.name.strip()

        db.commit()
        db.refresh(user)

        return {
            "message": "Profile updated successfully.",
            "email_changed": False,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
            },
        }

    # -----------------------------
    # EMAIL CHANGE
    # -----------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email == new_email,
            User.id != user.id,
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    # Invalidate previous email-change OTPs
    db.query(EmailOTP).filter(
        EmailOTP.email == new_email,
        EmailOTP.used == False,
        EmailOTP.purpose == "email_change",
    ).update(
        {"used": True},
        synchronize_session=False,
    )

    otp = generate_otp()

    otp_record = EmailOTP(
        email=new_email,
        otp_hash=hash_otp(otp),
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        attempts=0,
        used=False,
        purpose="email_change",
    )

    db.add(otp_record)

    # Save name now, email only after verification
    user.name = data.name.strip()

    db.commit()

    try:
        send_otp_email(new_email, otp)
    except Exception:
        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=500,
            detail="Unable to send verification email.",
        )

    return {
        "message": "Verification OTP sent to your new email.",
        "email_changed": True,
        "pending_email": new_email,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }

@router.post("/change-email")
def verify_email_change(
    data: VerifyEmailChangeRequest,
    db: Session = Depends(get_db),
):
    new_email = str(data.new_email).strip().lower()

    otp_record = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == new_email,
            EmailOTP.used == False,
            EmailOTP.purpose == "email_change",
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="No active email-change OTP found.",
        )

    if datetime.utcnow() > otp_record.expires_at:
        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new one.",
        )

    if otp_record.attempts >= 5:
        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Too many incorrect attempts. Please request a new OTP.",
        )

    if not verify_otp(
        data.otp,
        otp_record.otp_hash,
    ):
        otp_record.attempts += 1
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Incorrect OTP.",
        )

    user = (
        db.query(User)
        .filter(User.email != new_email)
        .filter(User.id == data.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User account not found.",
        )

    existing_user = (
        db.query(User)
        .filter(
            User.email == new_email,
            User.id != user.id,
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    user.email = new_email
    user.is_verified = True
    otp_record.used = True

    db.commit()
    db.refresh(user)

    return {
        "message": "Email address changed successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        },
    }


# -----------------------------
# RESEND OTP
# -----------------------------

@router.post("/resend-otp")
def resend_otp(
    data: ResendOTPRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).strip().lower()

    # Find user
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account exists for this email.",
        )

    # Already verified
    if user.is_verified:
        raise HTTPException(
            status_code=400,
            detail="This email is already verified.",
        )

    # Invalidate old OTPs
    db.query(EmailOTP).filter(
        EmailOTP.email == user.email,
        EmailOTP.used == False,
        EmailOTP.purpose == "signup",
    ).update(
        {"used": True},
        synchronize_session=False,
    )

    # Generate new OTP
    otp = generate_otp()

    # Save new OTP
    otp_record = EmailOTP(
        email=user.email,
        otp_hash=hash_otp(otp),
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        attempts=0,
        used=False,
        purpose="signup",
    )

    db.add(otp_record)
    db.commit()

    # Send email
    try:

        send_otp_email(email, otp)

    except Exception:

        otp_record.used = True
        db.commit()

        raise HTTPException(
            status_code=500,
            detail="Unable to send verification email.",
        )

    return {
        "message": "A new verification OTP has been sent.",
        "email": email,
    }


@router.post("/request-password-reset")
def request_password_reset(
    data: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account exists for this email.",
        )

    db.query(EmailOTP).filter(
        EmailOTP.email == email,
        EmailOTP.used == False,
        EmailOTP.purpose == "password_reset",
    ).update(
        {"used": True},
        synchronize_session=False,
    )

    otp = generate_otp()
    otp_record = EmailOTP(
        email=email,
        otp_hash=hash_otp(otp),
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        attempts=0,
        used=False,
        purpose="password_reset",
    )
    db.add(otp_record)
    db.commit()

    try:
        send_otp_email(email, otp)
    except Exception:
        otp_record.used = True
        db.commit()
        raise HTTPException(
            status_code=500,
            detail="Unable to send password reset email.",
        )

    return {
        "message": "A password reset code has been sent to your email.",
        "email": email,
    }


@router.post("/reset-password")
def reset_password(
    data: PasswordResetConfirmRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account exists for this email.",
        )

    otp_record = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == email,
            EmailOTP.used == False,
            EmailOTP.purpose == "password_reset",
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="No active password reset code. Request a new one.",
        )

    if datetime.utcnow() > otp_record.expires_at:
        otp_record.used = True
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Password reset code has expired. Request a new one.",
        )

    if otp_record.attempts >= 5:
        otp_record.used = True
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Too many incorrect attempts. Request a new code.",
        )

    if not verify_otp(data.otp, otp_record.otp_hash):
        otp_record.attempts += 1
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Incorrect password reset code.",
        )

    user.password_hash = pwd_context.hash(data.password)
    otp_record.used = True
    db.commit()

    return {"message": "Password reset successfully."}