import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv


load_dotenv()


SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_otp_email(
    recipient_email: str,
    otp: str,
) -> None:

    message = EmailMessage()

    message["Subject"] = "Your ResearchAI verification code"
    message["From"] = SMTP_USERNAME
    message["To"] = recipient_email

    message.set_content(
        f"""
Hello,

Your ResearchAI verification code is:

{otp}

This code will expire in 10 minutes.

If you did not create a ResearchAI account, you can safely ignore this email.

Regards,
ResearchAI
""".strip()
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(message)