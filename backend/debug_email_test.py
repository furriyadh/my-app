import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Configure logging to file
log_file = Path('debug_email.log')
logging.basicConfig(
    filename=log_file,
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filemode='w'
)

console = logging.StreamHandler()
console.setLevel(logging.DEBUG)
logging.getLogger('').addHandler(console)

logging.info("🚀 Starting Email Debug Script")

# Load Env
env_path = Path('.env.development')
if env_path.exists():
    load_dotenv(env_path)
    logging.info(f"✅ Loaded .env.development from {env_path.absolute()}")
else:
    logging.warning(f"⚠️ .env.development not found at {env_path.absolute()}")

# Check Env Vars
sender_email = os.getenv('EMAIL_SENDER_EMAIL')
sender_password = os.getenv('EMAIL_SENDER_PASSWORD')
smtp_server = os.getenv('EMAIL_SMTP_SERVER')
smtp_port = os.getenv('EMAIL_SMTP_PORT')

logging.info(f"📧 Config: User={sender_email}, Server={smtp_server}:{smtp_port}, PwdSet={'Yes' if sender_password else 'No'}")

try:
    from services.email_notification_service import email_service
    logging.info("✅ Service imported successfully")
except Exception as e:
    logging.error(f"❌ Failed to import service: {e}")
    sys.exit(1)

# Test Data
target_email = 'hossam675r4e3@gmail.com'
test_data = {
    'campaign_name': 'Debug Video Campaign',
    'campaign_type': 'VIDEO',
    'daily_budget': 50,
    'currency': 'SAR',
    'customer_id': 'DEBUG-123',
    'youtube_video_id': 'dQw4w9WgXcQ',
    'video_ad_type': 'IN_STREAM_AD',
    'manual_upload': True
}

logging.info(f"Attempting to send to {target_email}...")

try:
    # Explicitly verify connection first
    import smtplib
    server = smtplib.SMTP(str(smtp_server), int(smtp_port))
    server.set_debuglevel(1)
    server.starttls()
    logging.info("✅ SMTP TLS Started")
    server.login(sender_email, sender_password)
    logging.info("✅ SMTP Login Successful")
    server.quit()
    
    # Now try service
    result = email_service.send_campaign_confirmation(target_email, test_data)
    if result:
        logging.info("✅ Service reported SUCCESS")
    else:
        logging.error("❌ Service reported FAILURE")

except Exception as e:
    logging.error(f"❌ SMTP/Service Exception: {e}", exc_info=True)
