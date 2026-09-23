from app.services.email_service import send_otp_email


send_otp_email(
    "vernitgoyal76@gmail.com",
    "123456",
)

print("Test email sent successfully!")