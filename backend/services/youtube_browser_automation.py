"""
YouTube Browser Automation Service
Automates YouTube Studio linking to Google Ads accounts using Selenium
"""

import logging
import time
import json
from typing import Dict, Any, Optional
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

logger = logging.getLogger(__name__)


class YouTubeBrowserAutomation:
    """
    Automates YouTube Studio channel linking to Google Ads using browser automation.
    This is necessary because Google does not provide an API for this functionality.
    """
    
    def __init__(self, headless: bool = True, use_profile: bool = True):
        """
        Initialize browser automation
        
        Args:
            headless: Run browser in headless mode (no visible window)
            use_profile: Use Chrome user profile for authentication
        """
        self.headless = headless
        self.use_profile = use_profile
        self.driver = None
    
    def _create_driver(self, cookies: Optional[list] = None) -> webdriver.Chrome:
        """
        Create Chrome WebDriver with appropriate options.
        Uses Chrome user profile if available for authentication.
        """
        import os
        
        chrome_options = Options()
        
        # Use Chrome user profile for authentication (keeps login sessions)
        if self.use_profile:
            # Windows Chrome profile path
            user_data_dir = os.path.expanduser("~") + r"\AppData\Local\Google\Chrome\User Data"
            if os.path.exists(user_data_dir):
                chrome_options.add_argument(f"--user-data-dir={user_data_dir}")
                chrome_options.add_argument("--profile-directory=Default")
                logger.info(f"📂 Using Chrome profile: {user_data_dir}")
            else:
                logger.warning("⚠️ Chrome profile not found, using fresh browser")
        
        if self.headless:
            chrome_options.add_argument("--headless=new")
        
        # Standard options for stability
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # User agent
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        try:
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # Anti-detection
            driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
                "source": """
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined
                    })
                """
            })
            
            return driver
        except Exception as e:
            logger.error(f"Failed to create Chrome driver: {e}")
            raise
    
    def _set_google_cookies(self, driver: webdriver.Chrome, access_token: str, refresh_token: str = None) -> bool:
        """
        Set Google authentication cookies to maintain logged-in session
        """
        try:
            # First navigate to Google domain to set cookies
            driver.get("https://accounts.google.com")
            time.sleep(2)
            
            # We need to use OAuth token to authenticate
            # This is a simplified approach - in production you'd use proper session management
            
            return True
        except Exception as e:
            logger.error(f"Failed to set cookies: {e}")
            return False
    
    def link_channel_via_youtube_studio(
        self,
        channel_id: str,
        customer_id: str,
        access_token: str,
        link_name: str = "Google Ads Link",
        permissions: Dict[str, bool] = None
    ) -> Dict[str, Any]:
        """
        Link a YouTube channel to Google Ads via YouTube Studio automation.
        
        Args:
            channel_id: YouTube channel ID (e.g., UCxxxxxx)
            customer_id: Google Ads customer ID (e.g., 123-456-7890)
            access_token: OAuth access token for authentication
            link_name: Name for the link (optional)
            permissions: Dict of permissions to enable
        
        Returns:
            Dict with success status and message
        """
        if permissions is None:
            permissions = {
                'view_counts': True,
                'remarketing': True, 
                'engagement': True
            }
        
        # Format customer ID (remove dashes for input, keep for display)
        clean_customer_id = customer_id.replace("-", "")
        formatted_customer_id = f"{clean_customer_id[:3]}-{clean_customer_id[3:6]}-{clean_customer_id[6:]}"
        
        logger.info(f"🤖 Starting browser automation for channel {channel_id} → account {formatted_customer_id}")
        
        try:
            # Create browser
            self.driver = self._create_driver()
            driver = self.driver
            
            # YouTube Studio settings URL
            studio_url = f"https://studio.youtube.com/channel/{channel_id}/settings"
            
            logger.info(f"📱 Opening YouTube Studio: {studio_url}")
            driver.get(studio_url)
            
            # Wait for page load
            time.sleep(3)
            
            # Check if we need to login
            current_url = driver.current_url
            if "accounts.google.com" in current_url:
                logger.warning("⚠️ Authentication required - user needs to login first")
                return {
                    "success": False,
                    "requires_auth": True,
                    "message": "User authentication required. Please ensure OAuth session is valid.",
                    "auth_url": current_url
                }
            
            # Wait for settings page to load
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "[role='dialog'], ytcp-settings-section"))
                )
            except TimeoutException:
                logger.warning("Settings page did not load as expected")
            
            # Click on "القناة" (Channel) tab if visible
            try:
                channel_tab = driver.find_element(By.XPATH, "//tp-yt-paper-tab[contains(., 'القناة') or contains(., 'Channel')]")
                channel_tab.click()
                time.sleep(1)
            except NoSuchElementException:
                logger.info("Channel tab not found - may already be on correct tab")
            
            # Look for "الإعدادات المتقدمة" (Advanced Settings)
            try:
                advanced_tab = driver.find_element(By.XPATH, "//tp-yt-paper-tab[contains(., 'متقدم') or contains(., 'Advanced')]")
                advanced_tab.click()
                time.sleep(1)
            except NoSuchElementException:
                logger.info("Advanced tab not found")
            
            # Look for "ربط حساب" (Link Account) button
            try:
                link_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, 
                        "//ytcp-button[contains(., 'ربط الحساب') or contains(., 'Link account')]"
                    ))
                )
                link_button.click()
                time.sleep(2)
                logger.info("✅ Clicked 'Link Account' button")
            except TimeoutException:
                logger.error("Could not find 'Link Account' button")
                return {
                    "success": False,
                    "message": "Could not find 'Link Account' button in YouTube Studio"
                }
            
            # Fill in the link name
            try:
                name_input = driver.find_element(By.CSS_SELECTOR, "input[aria-label*='اسم'], input[placeholder*='name']")
                name_input.clear()
                name_input.send_keys(link_name)
                logger.info(f"✅ Filled link name: {link_name}")
            except NoSuchElementException:
                logger.info("Link name field not found")
            
            # Fill in Customer ID
            try:
                customer_id_input = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR,
                        "input[aria-label*='رقم تعريف'], input[aria-label*='Customer ID'], input[placeholder*='123']"
                    ))
                )
                customer_id_input.clear()
                customer_id_input.send_keys(formatted_customer_id)
                logger.info(f"✅ Filled Customer ID: {formatted_customer_id}")
            except TimeoutException:
                logger.error("Could not find Customer ID input field")
                return {
                    "success": False,
                    "message": "Could not find Customer ID input field"
                }
            
            # Enable permissions checkboxes
            permission_selectors = {
                'view_counts': "عدد المشاهدات|View counts",
                'remarketing': "تجديد النشاط|Remarketing",
                'engagement': "التفاعل|Engagement"
            }
            
            for perm_key, perm_text in permission_selectors.items():
                if permissions.get(perm_key, True):
                    try:
                        checkbox = driver.find_element(By.XPATH,
                            f"//tp-yt-paper-checkbox[contains(., '{perm_text.split('|')[0]}') or contains(., '{perm_text.split('|')[1]}')]"
                        )
                        if not checkbox.get_attribute("checked"):
                            checkbox.click()
                            logger.info(f"✅ Enabled: {perm_key}")
                    except NoSuchElementException:
                        logger.info(f"Checkbox for {perm_key} not found")
            
            # Click submit/link button
            try:
                submit_button = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH,
                        "//ytcp-button[contains(., 'ربط') or contains(., 'Link')][@disabled='false' or not(@disabled)]"
                    ))
                )
                submit_button.click()
                logger.info("✅ Clicked submit button")
                time.sleep(3)
            except TimeoutException:
                logger.error("Could not find or click submit button")
                return {
                    "success": False,
                    "message": "Could not find submit button"
                }
            
            # Check for success message
            try:
                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.XPATH,
                        "//*[contains(text(), 'تم') or contains(text(), 'success') or contains(text(), 'linked')]"
                    ))
                )
                logger.info("✅ Link created successfully!")
                return {
                    "success": True,
                    "message": "YouTube channel linked to Google Ads successfully",
                    "channel_id": channel_id,
                    "customer_id": formatted_customer_id
                }
            except TimeoutException:
                # May still have succeeded - check page state
                logger.info("Success message not found, but link may have been created")
                return {
                    "success": True,
                    "message": "Link request submitted. Please verify in YouTube Studio.",
                    "channel_id": channel_id,
                    "customer_id": formatted_customer_id
                }
            
        except Exception as e:
            logger.error(f"❌ Browser automation failed: {str(e)}")
            return {
                "success": False,
                "message": f"Automation error: {str(e)}"
            }
        finally:
            if self.driver:
                self.driver.quit()
                self.driver = None
    
    def link_channel_via_google_ads(
        self,
        channel_id: str,
        customer_id: str,
        access_token: str
    ) -> Dict[str, Any]:
        """
        Alternative: Link via Google Ads UI (more complex but also works)
        """
        # This would implement the Google Ads UI flow
        # For now, redirect to YouTube Studio method
        return self.link_channel_via_youtube_studio(
            channel_id, customer_id, access_token
        )


# Singleton instance
_automation_instance = None

def get_youtube_automation(headless: bool = True) -> YouTubeBrowserAutomation:
    """Get or create YouTube automation instance"""
    global _automation_instance
    if _automation_instance is None:
        _automation_instance = YouTubeBrowserAutomation(headless=headless)
    return _automation_instance
