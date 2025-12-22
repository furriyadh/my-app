import logging
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional
from google.ads.googleads.client import GoogleAdsClient
from services.google_ads_client import GoogleAdsClientManager

logger = logging.getLogger(__name__)

class YouTubeIntegrationService:
    """Service to handle YouTube Channel integration with Google Ads"""

    def __init__(self):
        self.ads_manager = GoogleAdsClientManager()

    def get_user_channels(self, access_token: str) -> Dict[str, Any]:
        """
        Fetches the user's YouTube channels using the YouTube Data API.
        Requires 'https://www.googleapis.com/auth/youtube.readonly' scope.
        """
        if not access_token:
            return {"success": False, "message": "Access token is required"}

        try:
            url = "https://www.googleapis.com/youtube/v3/channels"
            params = {
                "part": "snippet,statistics,contentDetails",
                "mine": "true",
                "maxResults": 50
            }
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json"
            }

            response = requests.get(url, params=params, headers=headers)
            
            if response.status_code == 401:
                return {"success": False, "message": "Unauthorized: Invalid or expired token", "error_code": "TokenExpired"}
            
            if response.status_code != 200:
                logger.error(f"YouTube API Error: {response.text}")
                return {"success": False, "message": f"Failed to fetch channels: {response.reason}"}

            data = response.json()
            items = data.get("items", [])
            
            channels = []
            for item in items:
                snippet = item.get("snippet", {})
                statistics = item.get("statistics", {})
                
                channels.append({
                    "id": item.get("id"),
                    "title": snippet.get("title"),
                    "description": snippet.get("description"),
                    "thumbnail": snippet.get("thumbnails", {}).get("default", {}).get("url"),
                    "customUrl": snippet.get("customUrl"),
                    "subscriberCount": statistics.get("subscriberCount"),
                    "videoCount": statistics.get("videoCount"),
                    "viewCount": statistics.get("viewCount")
                })

            return {"success": True, "channels": channels}

        except Exception as e:
            logger.error(f"Error fetching YouTube channels: {str(e)}")
            return {"success": False, "message": str(e)}

    def link_channel_to_ads_account(self, customer_id: str, channel_id: str, access_token: str = None) -> Dict[str, Any]:
        """
        Links a YouTube channel to a Google Ads account using Browser Automation.
        
        Since Google Ads API does NOT support YouTube channel linking programmatically,
        we use Selenium to automate YouTube Studio linking process.
        """
        try:
            # Validate Customer ID format
            clean_customer_id = customer_id.replace("-", "")
            formatted_customer_id = f"{clean_customer_id[:3]}-{clean_customer_id[3:6]}-{clean_customer_id[6:]}"
            
            logger.info(f"🤖 بدء أتمتة ربط قناة YouTube {channel_id} بحساب {formatted_customer_id}")
            
            # Import and use browser automation
            from services.youtube_browser_automation import get_youtube_automation
            
            automation = get_youtube_automation(headless=True)
            result = automation.link_channel_via_youtube_studio(
                channel_id=channel_id,
                customer_id=clean_customer_id,
                access_token=access_token or "",
                link_name=f"Link-{clean_customer_id[:6]}"
            )
            
            if result.get("success"):
                logger.info(f"✅ تم ربط القناة بنجاح!")
                return {
                    "success": True,
                    "message": result.get("message", "YouTube channel linked successfully"),
                    "channel_id": channel_id,
                    "customer_id": formatted_customer_id
                }
            elif result.get("requires_auth"):
                # User needs to authenticate first
                logger.warning("⚠️ المستخدم غير مسجل الدخول")
                return {
                    "success": False,
                    "requires_auth": True,
                    "message": "User must be logged in to YouTube. Please authenticate.",
                    "auth_url": result.get("auth_url")
                }
            else:
                logger.error(f"❌ فشل الربط: {result.get('message')}")
                return {
                    "success": False,
                    "message": result.get("message", "Linking failed")
                }

        except ImportError as e:
            logger.error(f"Browser automation module not available: {e}")
            # Fallback to URL redirect
            link_url = f"https://studio.youtube.com/channel/{channel_id}/settings"
            return {
                "success": True,
                "message": "Please complete linking manually",
                "link_url": link_url,
                "requires_manual_linking": True
            }
        except Exception as e:
            error_message = str(e)
            logger.error(f"Error in automation: {error_message}")
            return {"success": False, "message": f"Error: {error_message}"}

    def get_linked_channels(self, customer_id: str) -> Dict[str, Any]:
        """
        Retrieves currently linked YouTube channels for the Google Ads account.
        Queries multiple resources to find linked YouTube channels.
        """
        client = self.ads_manager.get_client()
        if not client:
             return {"success": False, "message": "Google Ads Client not initialized"}
             
        try:
            customer_id = customer_id.replace("-", "")
            ga_service = client.get_service("GoogleAdsService")
            
            linked_channels = []
            
            # Method 1: Try querying youtube_video_link resource
            try:
                query = """
                    SELECT
                        youtube_video_link.resource_name,
                        youtube_video_link.channel_id
                    FROM
                        youtube_video_link
                """
                stream = ga_service.search_stream(customer_id=customer_id, query=query)
                
                seen_channels = set()
                for batch in stream:
                    for row in batch.results:
                        channel_id = row.youtube_video_link.channel_id
                        if channel_id and channel_id not in seen_channels:
                            seen_channels.add(channel_id)
                            linked_channels.append({
                                "resource_name": row.youtube_video_link.resource_name,
                                "channel_id": channel_id,
                                "status": "ENABLED",
                                "source": "youtube_video_link"
                            })
            except Exception as e:
                logger.debug(f"youtube_video_link query failed: {e}")
            
            # Method 2: Try querying data_link for VIDEO type
            try:
                query = """
                    SELECT
                        data_link.resource_name,
                        data_link.youtube_video.channel_id,
                        data_link.youtube_video.video_id,
                        data_link.type,
                        data_link.status
                    FROM
                        data_link
                    WHERE
                        data_link.type = 'VIDEO'
                """
                stream = ga_service.search_stream(customer_id=customer_id, query=query)
                
                for batch in stream:
                    for row in batch.results:
                        channel_id = row.data_link.youtube_video.channel_id
                        if channel_id:
                            # Check if we already have this channel
                            existing = [c for c in linked_channels if c.get('channel_id') == channel_id]
                            if not existing:
                                linked_channels.append({
                                    "resource_name": row.data_link.resource_name,
                                    "channel_id": channel_id,
                                    "video_id": row.data_link.youtube_video.video_id,
                                    "status": row.data_link.status.name if hasattr(row.data_link.status, 'name') else str(row.data_link.status),
                                    "source": "data_link"
                                })
            except Exception as e:
                logger.debug(f"data_link query failed: {e}")
                    
            logger.info(f"✅ تم جلب {len(linked_channels)} قناة مرتبطة للحساب {customer_id}")
            return {"success": True, "linked_channels": linked_channels}
            
        except Exception as e:
            logger.error(f"Error fetching linked channels: {str(e)}")
            return {"success": False, "message": str(e), "linked_channels": []}

    def get_linking_help(self, customer_id: str, channel_id: str = None) -> Dict[str, Any]:
        """
        Returns help information for manually linking YouTube channel to Google Ads.
        Based on official Google documentation.
        """
        clean_customer_id = customer_id.replace("-", "")
        formatted_customer_id = f"{clean_customer_id[:3]}-{clean_customer_id[3:6]}-{clean_customer_id[6:]}"
        
        # Direct URL to Google Ads Data Manager - YouTube section
        # Using the format that opens YouTube linking directly
        google_ads_linking_url = f"https://ads.google.com/aw/linkedservices/youtube?ocid={clean_customer_id}"
        
        # YouTube Studio URL if channel_id provided
        youtube_studio_url = None
        if channel_id:
            youtube_studio_url = f"https://studio.youtube.com/channel/{channel_id}/settings"
        
        return {
            "success": True,
            "customer_id": formatted_customer_id,
            "channel_id": channel_id,
            "google_ads_url": google_ads_linking_url,
            "youtube_studio_url": youtube_studio_url,
            "steps_google_ads": [
                "1. Open Google Ads account",
                "2. Click Tools icon (⚙️) in top right",
                "3. Click 'Data Manager'",
                "4. Click 'Connect Product'",
                "5. Find 'YouTube' and click 'Add Channel'",
                "6. Search for your channel or enter its URL",
                "7. If you own the channel, select 'I own the channel'",
                "8. Choose permissions and click 'Link'"
            ],
            "steps_youtube_studio": [
                "1. Open YouTube Studio",
                "2. Click Settings → Channel → Advanced Settings",
                "3. Click 'Link Account'",
                f"4. Enter Customer ID: {formatted_customer_id}",
                "5. Choose permissions (view counts, remarketing, engagement)",
                "6. Click 'Done' then 'Save'"
            ],
            "documentation_url": "https://support.google.com/youtube/answer/3063482"
        }
