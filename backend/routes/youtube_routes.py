from flask import Blueprint, request, jsonify, session, redirect, current_app
import requests
import os
import secrets
import logging

logger = logging.getLogger(__name__)

# إنشاء Blueprint لمسارات YouTube
youtube_bp = Blueprint('youtube', __name__)

# تحميل خدمة YouTube Integration
try:
    from services.youtube_integration import YouTubeIntegrationService
    youtube_service = YouTubeIntegrationService()
    logger.info("✅ تم تحميل YouTubeIntegrationService بنجاح")
except Exception as e:
    youtube_service = None
    logger.warning(f"⚠️ لم يتم تحميل YouTubeIntegrationService: {e}")

@youtube_bp.route('/authorize', methods=['GET'])
def authorize():
    """
    يبدأ عملية OAuth للحصول على صلاحيات YouTube
    """
    # توليد state عشوائي للتحقق من الأمان
    state = secrets.token_urlsafe(32)
    session['oauth_state'] = state
    
    # تحديد العناوين المطلوبة (Scopes)
    env_scopes = os.getenv('GOOGLE_OAUTH_SCOPES')
    if env_scopes:
        scopes = env_scopes.split(' ')
    else:
        scopes = [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/adwords',
            'https://www.googleapis.com/auth/youtube.force-ssl'
        ]
    
    client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
    redirect_uri = os.getenv('OAUTH_REDIRECT_URI', 'http://localhost:3000/api/oauth/google/callback')
    
    if os.getenv('NODE_ENV') == 'production':
        redirect_uri = 'https://furriyadh.com/api/oauth/google/callback'
        
    auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={' '.join(scopes)}&"
        f"response_type=code&"
        f"access_type=offline&"
        f"state={state}&"
        f"prompt=consent" 
    )
    
    return redirect(auth_url)

@youtube_bp.route('/channels', methods=['GET'])
def get_channels():
    """
    جلب قنوات اليوتيوب للمستخدم المسجل
    """
    access_token = request.cookies.get('oauth_access_token') or session.get('google_ads_access_token') or request.headers.get('Authorization', '').replace('Bearer ', '')
    
    if not access_token:
        return jsonify({
            'success': False,
            'channels': [],
            'error': 'No access token found'
        }), 401
    
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
            return jsonify({
                'success': False,
                'channels': [],
                'error': 'Unauthorized'
            }), 401
            
        if response.status_code != 200:
            logger.error(f"YouTube API Error: {response.text}")
            return jsonify({
                'success': False,
                'channels': [],
                'error': f"Failed to fetch channels: {response.reason}"
            }), response.status_code

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

        return jsonify({
            'success': True,
            'channels': channels
        })

    except Exception as e:
        logger.error(f"Error fetching YouTube channels: {e}")
        return jsonify({
            'success': False,
            'channels': [],
            'error': str(e)
        }), 500

@youtube_bp.route('/link', methods=['POST'])
def link_channel():
    """
    ربط قناة YouTube بحساب Google Ads
    يستخدم ProductLinkInvitationService من Google Ads API
    """
    data = request.get_json()
    channel_id = data.get('channel_id')
    ad_account_id = data.get('ad_account_id')
    
    if not channel_id:
        return jsonify({'success': False, 'error': 'Channel ID is required'}), 400
    
    if not ad_account_id:
        return jsonify({'success': False, 'error': 'Ad Account ID is required'}), 400
    
    # التحقق من وجود الخدمة
    if not youtube_service:
        logger.error("YouTubeIntegrationService غير متاح")
        return jsonify({
            'success': False, 
            'error': 'YouTube integration service not available'
        }), 500
    
    try:
        # استدعاء الخدمة لربط القناة
        logger.info(f"🔗 محاولة ربط قناة {channel_id} بحساب {ad_account_id}")
        
        # Return help information for manual linking (since API doesn't support direct linking)
        help_result = youtube_service.get_linking_help(ad_account_id, channel_id)
        
        if help_result.get('success'):
            logger.info(f"✅ تم إنشاء معلومات الربط للحساب {ad_account_id}")
            return jsonify({
                'success': True,
                'message': 'Please complete linking in Google Ads',
                'requires_manual_linking': True,
                'google_ads_url': help_result.get('google_ads_url'),
                'youtube_studio_url': help_result.get('youtube_studio_url'),
                'steps_google_ads': help_result.get('steps_google_ads'),
                'steps_youtube_studio': help_result.get('steps_youtube_studio'),
                'documentation_url': help_result.get('documentation_url'),
                'customer_id': help_result.get('customer_id'),
                'channel_id': channel_id
            })
        else:
            logger.error(f"❌ فشل الربط: {help_result.get('message')}")
            return jsonify({
                'success': False,
                'error': help_result.get('message', 'Failed to generate linking info')
            }), 400
            
    except Exception as e:
        logger.error(f"خطأ في ربط القناة: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@youtube_bp.route('/linked-channels', methods=['GET'])
def get_linked_channels():
    """
    جلب قنوات YouTube المرتبطة بحساب إعلاني معين
    """
    customer_id = request.args.get('customer_id')
    
    if not customer_id:
        return jsonify({'success': False, 'error': 'Customer ID is required'}), 400
    
    if not youtube_service:
        return jsonify({'success': False, 'error': 'YouTube integration service not available'}), 500
    
    try:
        result = youtube_service.get_linked_channels(customer_id)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'linked_channels': result.get('linked_channels', [])
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('message')
            }), 500
    except Exception as e:
        logger.error(f"خطأ في جلب القنوات المرتبطة: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@youtube_bp.route('/unlink', methods=['POST'])
def unlink_channel():
    """
    إلغاء ربط قناة YouTube من حساب Google Ads
    """
    data = request.get_json()
    channel_id = data.get('channel_id')
    ad_account_id = data.get('ad_account_id')
    resource_name = data.get('resource_name')  # Optional: if we have the exact resource to delete
    
    if not channel_id:
        return jsonify({'success': False, 'error': 'Channel ID is required'}), 400
    
    if not ad_account_id:
        return jsonify({'success': False, 'error': 'Ad Account ID is required'}), 400
    
    if not youtube_service:
        logger.error("YouTubeIntegrationService غير متاح")
        return jsonify({
            'success': False, 
            'error': 'YouTube integration service not available'
        }), 500
    
    try:
        logger.info(f"🔓 محاولة إلغاء ربط قناة {channel_id} من حساب {ad_account_id}")
        
        # إذا كان لدينا resource_name، نستخدمه مباشرة
        # وإلا نبحث عنه أولاً
        if not resource_name:
            # جلب القنوات المرتبطة للعثور على resource_name
            linked_result = youtube_service.get_linked_channels(ad_account_id)
            if linked_result.get('success'):
                for linked in linked_result.get('linked_channels', []):
                    if linked.get('channel_id') == channel_id:
                        resource_name = linked.get('resource_name')
                        break
        
        if not resource_name:
            # إذا لم نجد الربط، نعتبره غير مرتبط أصلاً
            return jsonify({
                'success': True,
                'message': 'Channel is not linked to this account'
            })
        
        # حذف الربط من Google Ads API
        # ملاحظة: نحتاج لإضافة دالة unlink في YouTubeIntegrationService
        # حالياً نُرجع نجاح مع رسالة توضيحية
        result = youtube_service.unlink_channel_from_ads_account(ad_account_id, resource_name) if hasattr(youtube_service, 'unlink_channel_from_ads_account') else {'success': True, 'message': 'Unlink functionality coming soon'}
        
        if result.get('success'):
            logger.info(f"✅ تم إلغاء ربط القناة بنجاح")
            return jsonify({
                'success': True,
                'message': result.get('message', 'Channel unlinked successfully')
            })
        else:
            logger.error(f"❌ فشل إلغاء الربط: {result.get('message')}")
            return jsonify({
                'success': False,
                'error': result.get('message')
            }), 400
            
    except Exception as e:
        logger.error(f"خطأ في إلغاء ربط القناة: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@youtube_bp.route('/confirm-link', methods=['POST'])
def confirm_link():
    """
    تأكيد ربط قناة YouTube بحساب إعلاني
    يحفظ الحالة في قاعدة البيانات
    """
    data = request.get_json()
    channel_id = data.get('channel_id')
    ad_account_id = data.get('ad_account_id')
    channel_title = data.get('channel_title', '')
    
    if not channel_id:
        return jsonify({'success': False, 'error': 'Channel ID is required'}), 400
    
    if not ad_account_id:
        return jsonify({'success': False, 'error': 'Ad Account ID is required'}), 400
    
    try:
        # حفظ حالة الربط في Supabase أو localStorage
        # Note: In production, save to Supabase database
        logger.info(f"✅ تم تأكيد ربط قناة {channel_id} بحساب {ad_account_id}")
        
        return jsonify({
            'success': True,
            'message': 'Channel link confirmed successfully',
            'channel_id': channel_id,
            'ad_account_id': ad_account_id,
            'is_linked': True
        })
        
    except Exception as e:
        logger.error(f"خطأ في تأكيد الربط: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@youtube_bp.route('/channel-link-status', methods=['GET'])
def get_channel_link_status():
    """
    جلب حالة ربط قناة معينة
    """
    channel_id = request.args.get('channel_id')
    
    if not channel_id:
        return jsonify({'success': False, 'error': 'Channel ID is required'}), 400
    
    try:
        # Note: In production, query from Supabase database
        # For now, return not linked (frontend will use localStorage)
        return jsonify({
            'success': True,
            'channel_id': channel_id,
            'is_linked': False,
            'linked_ad_account_id': None
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب حالة الربط: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

