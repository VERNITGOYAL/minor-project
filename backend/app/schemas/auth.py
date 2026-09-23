import re

from pydantic import BaseModel, EmailStr, field_validator


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Name is required.")

        # Only English letters and single spaces between names
        if not re.fullmatch(r"[A-Za-z]+(?: [A-Za-z]+)*", value):
            raise ValueError(
                "Name can contain only letters and spaces."
            )

        return value

class UpdateProfileRequest(BaseModel):
    id: int
    name: str
    email: EmailStr

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Name is required.")

        if not re.fullmatch(r"[A-Za-z]+(?: [A-Za-z]+)*", value):
            raise ValueError(
                "Name can contain only letters and spaces."
            )

        return value

class VerifyEmailChangeRequest(BaseModel):
    user_id: int
    new_email: EmailStr
    otp: str

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value: str) -> str:
        value = value.strip()

        if not re.fullmatch(r"\d{6}", value):
            raise ValueError("OTP must be exactly 6 digits.")

        return value

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    email: EmailStr
    otp: str
    password: str

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value: str) -> str:
        value = value.strip()

        if not re.fullmatch(r"\d{6}", value):
            raise ValueError("OTP must be exactly 6 digits.")

        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters.")

        return value


class GoogleLoginRequest(BaseModel):
    credential: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value: str) -> str:
        value = value.strip()

        if not re.fullmatch(r"\d{6}", value):
            raise ValueError("OTP must be exactly 6 digits.")

        return value


class ResendOTPRequest(BaseModel):
    email: EmailStr


# --------------------------------
# CHANGE EMAIL
# --------------------------------

class RequestEmailChangeOTPRequest(BaseModel):
    user_id: int
    new_email: EmailStr


