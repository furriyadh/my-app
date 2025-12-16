"""Test email sending for VIDEO Campaign - With Logo"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email Configuration
sender_email = "ads@furriyadh.com"
sender_password = "fejcxbvyxdrizjit"
smtp_server = "smtp.gmail.com"
smtp_port = 587

# Target email
target_email = "maxon272000@gmail.com"
customer_id = "775-449-8227"

# Logo URL from production site
logo_url = "https://furriyadh.com/images/logo-big.svg"

# HTML Email Template (Dark Mode Premium Design with Logo)
html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:16px;overflow:hidden;border:1px solid #333333;">
                    <!-- Top Gradient Line -->
                    <tr>
                        <td style="height:4px;background:linear-gradient(90deg,#ef4444,#f97316,#ef4444);"></td>
                    </tr>
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td style="padding:24px 32px;border-bottom:1px solid #222222;">
                            <table width="100%">
                                <tr>
                                    <td>
                                        <!-- Logo Image -->
                                        <img src="{logo_url}" alt="Furriyadh" style="height:32px;filter:brightness(0) invert(1);" />
                                    </td>
                                    <td align="right">
                                        <span style="background:#1a1a1a;color:#ef4444;padding:6px 12px;border-radius:20px;font-size:12px;border:1px solid #333;">● Video Campaign</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding:48px 32px;text-align:center;">
                            <!-- Success Icon with Glow Effect -->
                            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                                <tr>
                                    <td style="width:80px;height:80px;background:linear-gradient(135deg,#ef4444,#f97316);border-radius:50%;text-align:center;vertical-align:middle;">
                                        <span style="color:#ffffff;font-size:40px;font-weight:bold;">✓</span>
                                    </td>
                                </tr>
                            </table>
                            
                            <h1 style="color:#ffffff;font-size:32px;margin:0 0 16px;font-weight:bold;letter-spacing:-0.5px;">Request Received</h1>
                            
                            <p style="color:#888888;font-size:16px;margin:0 0 32px;line-height:1.6;">
                                Your video campaign is currently under review.<br>
                                Our team will process and upload it within <span style="color:#ffffff;font-weight:bold;">24-48 hours</span>.
                            </p>
                            
                            <!-- Info Card -->
                            <table width="100%" style="background:#1a1a1a;border-radius:12px;border:1px solid #333333;margin-bottom:32px;">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%">
                                            <tr>
                                                <td style="color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Customer ID</td>
                                                <td align="right" style="color:#ffffff;font-size:14px;font-weight:bold;font-family:monospace;">{customer_id}</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="height:16px;border-bottom:1px solid #333333;"></td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="height:16px;"></td>
                                            </tr>
                                            <tr>
                                                <td style="color:#666666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Campaign Type</td>
                                                <td align="right" style="color:#ef4444;font-size:14px;font-weight:bold;">YouTube Video</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <a href="https://furriyadh.com/dashboard" style="display:inline-block;padding:16px 48px;background:#ffffff;color:#000000;text-decoration:none;border-radius:12px;font-weight:bold;font-size:16px;box-shadow:0 4px 14px rgba(255,255,255,0.1);">Go to Dashboard →</a>
                        </td>
                    </tr>
                    
                    <!-- Next Steps Section -->
                    <tr>
                        <td style="padding:0 32px 32px;">
                            <table width="100%" style="background:#0a0a0a;border-radius:12px;border:1px solid #222222;">
                                <tr>
                                    <td style="padding:20px;">
                                        <p style="color:#ffffff;font-size:14px;font-weight:bold;margin:0 0 16px;">
                                            <span style="display:inline-block;width:3px;height:16px;background:#ef4444;border-radius:2px;margin-right:8px;vertical-align:middle;"></span>
                                            Next Steps
                                        </p>
                                        <table width="100%">
                                            <tr>
                                                <td style="color:#666666;font-size:13px;padding:8px 0;">1. Team review of campaign details</td>
                                            </tr>
                                            <tr>
                                                <td style="color:#666666;font-size:13px;padding:8px 0;">2. Upload to Google Ads</td>
                                            </tr>
                                            <tr>
                                                <td style="color:#666666;font-size:13px;padding:8px 0;">3. Email notification when live</td>
                                            </tr>
                                            <tr>
                                                <td style="color:#666666;font-size:13px;padding:8px 0;">4. Your ad starts showing on YouTube</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 32px;background:#050505;border-top:1px solid #222222;">
                            <table width="100%">
                                <tr>
                                    <td style="color:#666666;font-size:12px;">© 2024 Furriyadh Inc.</td>
                                    <td align="right">
                                        <a href="mailto:ads@furriyadh.com" style="color:#666666;font-size:12px;text-decoration:none;margin-right:16px;">Support</a>
                                        <a href="https://furriyadh.com" style="color:#666666;font-size:12px;text-decoration:none;">Privacy</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

# Create email message
msg = MIMEMultipart('alternative')
msg['Subject'] = '✅ Furriyadh - Video Campaign Request Received'
msg['From'] = sender_email
msg['To'] = target_email
msg.attach(MIMEText(html_content, 'html'))

# Send email
print(f"📤 Sending email to {target_email}...")
print(f"   Customer ID: {customer_id}")
print(f"   SMTP Server: {smtp_server}:{smtp_port}")
print()

try:
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    print("✅ TLS connection established")
    
    server.login(sender_email, sender_password)
    print("✅ Login successful")
    
    server.sendmail(sender_email, target_email, msg.as_string())
    print("✅ Email sent successfully!")
    
    server.quit()
    print()
    print(f"🎉 Done! Check inbox at: {target_email}")
    
except Exception as e:
    print(f"❌ Error: {e}")
