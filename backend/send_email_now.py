import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email config
sender_email = "ads@furriyadh.com"
sender_password = "fejcxbvyxdrizjit"
recipient = "maxon272000@gmail.com"

# Create message
msg = MIMEMultipart('alternative')
msg['Subject'] = '✅ Furriyadh - Video Campaign Request Received'
msg['From'] = sender_email
msg['To'] = recipient

html = """
<html>
<body style="background:#000;padding:40px;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#111;border-radius:16px;overflow:hidden;border:1px solid #333;">
<div style="height:4px;background:linear-gradient(90deg,#ef4444,#f97316,#ef4444);"></div>
<div style="padding:40px;text-align:center;">
<h1 style="color:#fff;margin:0 0 16px;">Request Received ✅</h1>
<p style="color:#888;">Your video campaign is under review and will be uploaded within 24-48 hours.</p>
<p style="color:#666;font-size:14px;">Customer ID: 775-449-8227</p>
<a href="https://furriyadh.com/dashboard" style="display:inline-block;margin-top:24px;padding:12px 32px;background:#fff;color:#000;text-decoration:none;border-radius:8px;font-weight:bold;">Go to Dashboard</a>
</div>
<div style="padding:20px;background:#050505;border-top:1px solid #222;text-align:center;">
<p style="color:#666;margin:0;font-size:12px;">© 2024 Furriyadh Inc.</p>
</div>
</div>
</body>
</html>
"""

msg.attach(MIMEText(html, 'html'))

print("Connecting to SMTP server...")
try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    print("TLS started, logging in...")
    server.login(sender_email, sender_password)
    print("Login successful, sending email...")
    server.sendmail(sender_email, recipient, msg.as_string())
    server.quit()
    print("✅ Email sent successfully to", recipient)
except Exception as e:
    print(f"❌ Error: {e}")
