import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailSender:
    def __init__(self):
        self.sender_email = os.getenv("EMAIL_SENDER_EMAIL")
        self.sender_password = os.getenv("EMAIL_SENDER_PASSWORD")
        self.smtp_server = os.getenv("EMAIL_SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("EMAIL_SMTP_PORT", 587))

    def send_email(self, to_email, subject, body, is_html=False):
        if not self.sender_email or not self.sender_password:
            print("خطأ: لم يتم تكوين معلومات المرسل للبريد الإلكتروني.")
            return False

        msg = MIMEMultipart("alternative")
        msg["From"] = self.sender_email
        msg["To"] = to_email
        msg["Subject"] = subject

        if is_html:
            part = MIMEText(body, "html", "utf-8")
        else:
            part = MIMEText(body, "plain", "utf-8")
        msg.attach(part)

        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.sender_email, self.sender_password)
            server.sendmail(self.sender_email, to_email, msg.as_string())
            server.quit()
            print(f"تم إرسال البريد الإلكتروني بنجاح إلى {to_email}")
            return True
        except Exception as e:
            print(f"خطأ في إرسال البريد الإلكتروني: {e}")
            return False
