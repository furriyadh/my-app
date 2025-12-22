"""
Google Ads Database Manager
مدير قاعدة البيانات لـ Google Ads
=====================================================

يوفر وظائف قاعدة البيانات لـ:
- إدارة حسابات Google Ads
- حفظ واسترجاع رموز OAuth
- إدارة ربط الحسابات بـ MCC
- تتبع حالة الحسابات والمزامنة

Author: Google Ads AI Platform Team
Version: 1.0.0
"""

import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import os

# محاولة استيراد مكتبات قاعدة البيانات
try:
    import sqlite3
    SQLITE_AVAILABLE = True
except ImportError:
    SQLITE_AVAILABLE = False

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    POSTGRESQL_AVAILABLE = True
except ImportError:
    POSTGRESQL_AVAILABLE = False

logger = logging.getLogger(__name__)

class GoogleAdsDatabaseManager:
    """مدير قاعدة البيانات لـ Google Ads"""
    
    def __init__(self, db_type: str = "auto"):
        """تهيئة مدير قاعدة البيانات"""
        self.db_type = db_type
        self.connection = None
        self.supabase_client = None
        
        # تحديد نوع قاعدة البيانات
        if db_type == "auto":
            self.db_type = self._detect_database_type()
        
        # تهيئة الاتصال
        self._initialize_connection()
        
        # إنشاء الجداول إذا لم تكن موجودة
        self._create_tables()
        
        logger.info(f"✅ تم تهيئة GoogleAdsDatabaseManager مع {self.db_type}")
    
    def _detect_database_type(self) -> str:
        """اكتشاف نوع قاعدة البيانات المتاح"""
        # التحقق من Supabase أولاً
        if SUPABASE_AVAILABLE and os.getenv('SUPABASE_URL') and (os.getenv('SUPABASE_ANON_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY')):
            return "supabase"
        
        # التحقق من PostgreSQL
        if POSTGRESQL_AVAILABLE and os.getenv('DATABASE_URL'):
            return "postgresql"
        
        # استخدام SQLite كخيار افتراضي
        if SQLITE_AVAILABLE:
            return "sqlite"
        
        raise Exception("لا توجد قاعدة بيانات متاحة")
    
    def _initialize_connection(self):
        """تهيئة اتصال قاعدة البيانات"""
        try:
            if self.db_type == "supabase":
                self._initialize_supabase()
            elif self.db_type == "postgresql":
                self._initialize_postgresql()
            elif self.db_type == "sqlite":
                self._initialize_sqlite()
            else:
                raise Exception(f"نوع قاعدة البيانات غير مدعوم: {self.db_type}")
                
        except Exception as e:
            logger.error(f"خطأ في تهيئة قاعدة البيانات: {str(e)}")
            raise
    
    def _initialize_supabase(self):
        """تهيئة Supabase"""
        try:
            url = os.getenv('SUPABASE_URL')
            key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')
            
            if not url or not key:
                raise Exception("متغيرات Supabase غير مكونة")
            
            self.supabase_client = create_client(url, key)
            logger.info("✅ تم الاتصال بـ Supabase")
            
        except Exception as e:
            logger.error(f"خطأ في الاتصال بـ Supabase: {str(e)}")
            raise
    
    def _initialize_postgresql(self):
        """تهيئة PostgreSQL"""
        try:
            database_url = os.getenv('DATABASE_URL')
            if not database_url:
                raise Exception("DATABASE_URL غير مكون")
            
            self.connection = psycopg2.connect(
                database_url,
                cursor_factory=RealDictCursor
            )
            logger.info("✅ تم الاتصال بـ PostgreSQL")
            
        except Exception as e:
            logger.error(f"خطأ في الاتصال بـ PostgreSQL: {str(e)}")
            raise
    
    def _initialize_sqlite(self):
        """تهيئة SQLite"""
        try:
            db_path = os.getenv('SQLITE_DB_PATH', '/home/ubuntu/my-app/backend/data/google_ads.db')
            
            # إنشاء مجلد البيانات إذا لم يكن موجوداً
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            
            self.connection = sqlite3.connect(db_path, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row
            logger.info(f"✅ تم الاتصال بـ SQLite: {db_path}")
            
        except Exception as e:
            logger.error(f"خطأ في الاتصال بـ SQLite: {str(e)}")
            raise
    
    def _create_tables(self):
        """إنشاء الجداول المطلوبة"""
        try:
            if self.db_type == "supabase":
                self._create_supabase_tables()
            elif self.db_type in ["postgresql", "sqlite"]:
                self._create_sql_tables()
                
        except Exception as e:
            logger.error(f"خطأ في إنشاء الجداول: {str(e)}")
            raise
    
    def _create_supabase_tables(self):
        """إنشاء جداول Supabase"""
        # في Supabase، الجداول يتم إنشاؤها عبر واجهة الويب أو SQL
        # هنا نتحقق فقط من وجود الجداول
        try:
            # التحقق من جدول google_ads_accounts
            result = self.supabase_client.table('google_ads_accounts').select('*').limit(1).execute()
            logger.info("✅ جدول google_ads_accounts موجود")
        except Exception:
            logger.warning("⚠️ جدول google_ads_accounts غير موجود في Supabase")
        
        try:
            # التحقق من جدول oauth_tokens
            result = self.supabase_client.table('oauth_tokens').select('*').limit(1).execute()
            logger.info("✅ جدول oauth_tokens موجود")
        except Exception:
            logger.warning("⚠️ جدول oauth_tokens غير موجود في Supabase")
    
    def _create_sql_tables(self):
        """إنشاء جداول SQL"""
        try:
            cursor = self.connection.cursor()
            
            # جدول حسابات Google Ads
            google_ads_accounts_table = """
            CREATE TABLE IF NOT EXISTS google_ads_accounts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                customer_id TEXT NOT NULL,
                descriptive_name TEXT,
                currency_code TEXT DEFAULT 'USD',
                time_zone TEXT DEFAULT 'UTC',
                manager BOOLEAN DEFAULT FALSE,
                test_account BOOLEAN DEFAULT FALSE,
                auto_tagging_enabled BOOLEAN DEFAULT FALSE,
                conversion_tracking_id TEXT,
                status TEXT DEFAULT 'ACTIVE',
                account_type TEXT DEFAULT 'STANDARD',
                is_primary BOOLEAN DEFAULT FALSE,
                linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, customer_id)
            )
            """
            
            # جدول رموز OAuth
            oauth_tokens_table = """
            CREATE TABLE IF NOT EXISTS oauth_tokens (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                customer_id TEXT,
                access_token TEXT NOT NULL,
                refresh_token TEXT,
                token_type TEXT DEFAULT 'Bearer',
                scope TEXT,
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_refreshed TIMESTAMP,
                refresh_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                metadata TEXT,
                UNIQUE(user_id, customer_id)
            )
            """
            
            # جدول ربط MCC
            mcc_links_table = """
            CREATE TABLE IF NOT EXISTS mcc_links (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                customer_id TEXT NOT NULL,
                mcc_customer_id TEXT NOT NULL,
                link_status TEXT DEFAULT 'PENDING',
                linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                link_type TEXT DEFAULT 'INVITATION',
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(customer_id, mcc_customer_id)
            )
            """
            
            # جدول سجل المزامنة
            sync_log_table = """
            CREATE TABLE IF NOT EXISTS sync_log (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                customer_id TEXT,
                sync_type TEXT NOT NULL,
                sync_status TEXT DEFAULT 'PENDING',
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                error_message TEXT,
                records_processed INTEGER DEFAULT 0,
                metadata TEXT
            )
            """
            
            # تنفيذ إنشاء الجداول
            cursor.execute(google_ads_accounts_table)
            cursor.execute(oauth_tokens_table)
            cursor.execute(mcc_links_table)
            cursor.execute(sync_log_table)
            
            # إنشاء فهارس
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_google_ads_accounts_user_id ON google_ads_accounts(user_id)",
                "CREATE INDEX IF NOT EXISTS idx_google_ads_accounts_customer_id ON google_ads_accounts(customer_id)",
                "CREATE INDEX IF NOT EXISTS idx_google_ads_accounts_is_primary ON google_ads_accounts(user_id, is_primary)",
                "CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON oauth_tokens(user_id)",
                "CREATE INDEX IF NOT EXISTS idx_oauth_tokens_customer_id ON oauth_tokens(customer_id)",
                "CREATE INDEX IF NOT EXISTS idx_oauth_tokens_is_active ON oauth_tokens(user_id, is_active)",
                "CREATE INDEX IF NOT EXISTS idx_mcc_links_customer_id ON mcc_links(customer_id)",
                "CREATE INDEX IF NOT EXISTS idx_sync_log_user_id ON sync_log(user_id)"
            ]
            
            for index in indexes:
                cursor.execute(index)
            
            self.connection.commit()
            logger.info("✅ تم إنشاء جداول قاعدة البيانات")
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء جداول SQL: {str(e)}")
            if self.connection:
                self.connection.rollback()
            raise
    
    # ==================== وظائف حسابات Google Ads ====================
    
    def save_google_ads_account(self, account_data: Dict[str, Any]) -> bool:
        """حفظ حساب Google Ads"""
        try:
            if self.db_type == "supabase":
                return self._save_account_supabase(account_data)
            else:
                return self._save_account_sql(account_data)
                
        except Exception as e:
            logger.error(f"خطأ في حفظ حساب Google Ads: {str(e)}")
            return False
    
    def remove_google_ads_account(self, customer_id: str) -> bool:
        """حذف حساب Google Ads من قاعدة البيانات (عند إلغاء الربط)"""
        try:
            if self.db_type == "supabase":
                return self._remove_account_supabase(customer_id)
            else:
                return self._remove_account_sql(customer_id)
                
        except Exception as e:
            logger.error(f"خطأ في حذف حساب Google Ads: {str(e)}")
            return False
    
    def _remove_account_supabase(self, customer_id: str) -> bool:
        """حذف حساب من Supabase"""
        try:
            result = self.supabase.table('google_ads_accounts').delete().eq('customer_id', customer_id).execute()
            
            if hasattr(result, 'data') and result.data:
                logger.info(f"✅ تم حذف حساب Google Ads من Supabase: {customer_id}")
                return True
            else:
                logger.warning(f"⚠️ لم يتم العثور على حساب لحذفه: {customer_id}")
                return False
                
        except Exception as e:
            logger.error(f"خطأ في حذف حساب من Supabase: {str(e)}")
            return False
    
    def _remove_account_sql(self, customer_id: str) -> bool:
        """حذف حساب من قاعدة بيانات SQL"""
        try:
            cursor = self.connection.cursor()
            
            # حذف الحساب
            cursor.execute("DELETE FROM google_ads_accounts WHERE customer_id = ?", (customer_id,))
            
            rows_affected = cursor.rowcount
            self.connection.commit()
            
            if rows_affected > 0:
                logger.info(f"✅ تم حذف حساب Google Ads من SQL: {customer_id}")
                return True
            else:
                logger.warning(f"⚠️ لم يتم العثور على حساب لحذفه: {customer_id}")
                return False
                
        except Exception as e:
            logger.error(f"خطأ في حذف حساب من SQL: {str(e)}")
            return False
    
    def check_account_exists(self, customer_id: str) -> bool:
        """فحص وجود حساب في قاعدة البيانات"""
        try:
            if self.db_type == "supabase":
                result = self.supabase.table('google_ads_accounts').select('customer_id').eq('customer_id', customer_id).execute()
                return bool(result.data)
            else:
                cursor = self.connection.cursor()
                cursor.execute("SELECT customer_id FROM google_ads_accounts WHERE customer_id = ?", (customer_id,))
                return cursor.fetchone() is not None
                
        except Exception as e:
            logger.error(f"خطأ في فحص وجود الحساب: {str(e)}")
            return False
    
    def _save_account_supabase(self, account_data: Dict[str, Any]) -> bool:
        """حفظ حساب في Supabase"""
        try:
            # تنسيق البيانات لتتوافق مع هيكل الجدول الموجود
            formatted_data = {
                'customer_id': account_data.get('customer_id'),
                'account_name': account_data.get('account_name') or account_data.get('descriptive_name'),
                'currency_code': account_data.get('currency_code', 'USD'),
                'time_zone': account_data.get('time_zone', 'UTC'),
                'status': account_data.get('status', 'ACTIVE'),
                'is_manager_account': account_data.get('is_manager_account', False),
                'is_test_account': account_data.get('is_test_account', False)
            }
            
            # إزالة القيم الفارغة
            formatted_data = {k: v for k, v in formatted_data.items() if v is not None}
            
            result = self.supabase_client.table('google_ads_accounts').upsert(formatted_data, on_conflict='customer_id').execute()
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"خطأ في حفظ حساب Supabase: {str(e)}")
            return False
    
    def _save_account_sql(self, account_data: Dict[str, Any]) -> bool:
        """حفظ حساب في SQL"""
        try:
            cursor = self.connection.cursor()
            
            # تحويل metadata إلى JSON
            if 'metadata' in account_data and isinstance(account_data['metadata'], dict):
                account_data['metadata'] = json.dumps(account_data['metadata'])
            
            # إعداد الاستعلام
            columns = list(account_data.keys())
            placeholders = ['?' if self.db_type == 'sqlite' else '%s'] * len(columns)
            
            query = f"""
            INSERT OR REPLACE INTO google_ads_accounts ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            """ if self.db_type == 'sqlite' else f"""
            INSERT INTO google_ads_accounts ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            ON CONFLICT (user_id, customer_id) DO UPDATE SET
            {', '.join([f"{col} = EXCLUDED.{col}" for col in columns if col not in ['id', 'user_id', 'customer_id']])}
            """
            
            cursor.execute(query, list(account_data.values()))
            self.connection.commit()
            
            return cursor.rowcount > 0
            
        except Exception as e:
            logger.error(f"خطأ في حفظ حساب SQL: {str(e)}")
            if self.connection:
                self.connection.rollback()
            return False
    
    def get_user_google_ads_accounts(self, user_id: str) -> List[Dict[str, Any]]:
        """جلب حسابات Google Ads للمستخدم"""
        try:
            if self.db_type == "supabase":
                return self._get_accounts_supabase(user_id)
            else:
                return self._get_accounts_sql(user_id)
                
        except Exception as e:
            logger.error(f"خطأ في جلب حسابات المستخدم: {str(e)}")
            return []
    
    def _get_accounts_supabase(self, user_id: str) -> List[Dict[str, Any]]:
        """جلب حسابات من Supabase"""
        try:
            # استخدام الجدول الصحيح من مخطط قاعدة البيانات
            result = self.supabase_client.table('google_ads_accounts').select('*').eq('user_id', user_id).execute()
            
            accounts = []
            for account in result.data:
                # تحويل البيانات إلى التنسيق المطلوب
                formatted_account = {
                    'id': account.get('id'),
                    'user_id': account.get('user_id'),
                    'account_id': account.get('account_id'),
                    'account_name': account.get('account_name'),
                    'currency_code': account.get('currency_code', 'USD'),
                    'time_zone': account.get('time_zone', 'UTC'),
                    'is_manager_account': account.get('is_manager_account', False),
                    'is_default': account.get('is_default', False),
                    'is_active': account.get('is_active', True),
                    'last_sync_at': account.get('last_sync_at'),
                    'sync_status': account.get('sync_status', 'pending'),
                    'created_at': account.get('created_at'),
                    'updated_at': account.get('updated_at')
                }
                accounts.append(formatted_account)
            
            logger.info(f"✅ تم جلب {len(accounts)} حساب من Supabase للمستخدم {user_id}")
            return accounts
            
        except Exception as e:
            logger.error(f"خطأ في جلب حسابات Supabase: {str(e)}")
            return []
    
    def _get_accounts_sql(self, user_id: str) -> List[Dict[str, Any]]:
        """جلب حسابات من SQL"""
        try:
            cursor = self.connection.cursor()
            
            query = "SELECT * FROM google_ads_accounts WHERE user_id = ? ORDER BY is_primary DESC, linked_at DESC"
            if self.db_type == 'postgresql':
                query = query.replace('?', '%s')
            
            cursor.execute(query, (user_id,))
            rows = cursor.fetchall()
            
            accounts = []
            for row in rows:
                account = dict(row)
                # تحويل metadata من JSON
                if account.get('metadata'):
                    try:
                        account['metadata'] = json.loads(account['metadata'])
                    except:
                        account['metadata'] = {}
                accounts.append(account)
            
            return accounts
            
        except Exception as e:
            logger.error(f"خطأ في جلب حسابات SQL: {str(e)}")
            return []
    
    def get_primary_google_ads_account(self, user_id: str) -> Optional[Dict[str, Any]]:
        """جلب الحساب الرئيسي للمستخدم"""
        try:
            if self.db_type == "supabase":
                result = self.supabase_client.table('google_ads_accounts').select('*').eq('user_id', user_id).eq('is_primary', True).limit(1).execute()
                
                if result.data:
                    account = result.data[0]
                    if account.get('metadata'):
                        try:
                            account['metadata'] = json.loads(account['metadata'])
                        except:
                            account['metadata'] = {}
                    return account
                    
            else:
                cursor = self.connection.cursor()
                
                query = "SELECT * FROM google_ads_accounts WHERE user_id = ? AND is_primary = ? LIMIT 1"
                if self.db_type == 'postgresql':
                    query = query.replace('?', '%s')
                
                cursor.execute(query, (user_id, True))
                row = cursor.fetchone()
                
                if row:
                    account = dict(row)
                    if account.get('metadata'):
                        try:
                            account['metadata'] = json.loads(account['metadata'])
                        except:
                            account['metadata'] = {}
                    return account
            
            return None
            
        except Exception as e:
            logger.error(f"خطأ في جلب الحساب الرئيسي: {str(e)}")
            return None
    
    def set_primary_google_ads_account(self, user_id: str, customer_id: str) -> bool:
        """تعيين حساب كحساب رئيسي"""
        try:
            if self.db_type == "supabase":
                # إزالة الحساب الرئيسي الحالي
                self.supabase_client.table('google_ads_accounts').update({'is_primary': False}).eq('user_id', user_id).execute()
                
                # تعيين الحساب الجديد كرئيسي
                result = self.supabase_client.table('google_ads_accounts').update({'is_primary': True}).eq('user_id', user_id).eq('customer_id', customer_id).execute()
                
                return len(result.data) > 0
                
            else:
                cursor = self.connection.cursor()
                
                # إزالة الحساب الرئيسي الحالي
                query1 = "UPDATE google_ads_accounts SET is_primary = ? WHERE user_id = ?"
                if self.db_type == 'postgresql':
                    query1 = query1.replace('?', '%s')
                
                cursor.execute(query1, (False, user_id))
                
                # تعيين الحساب الجديد كرئيسي
                query2 = "UPDATE google_ads_accounts SET is_primary = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND customer_id = ?"
                if self.db_type == 'postgresql':
                    query2 = query2.replace('?', '%s')
                
                cursor.execute(query2, (True, user_id, customer_id))
                self.connection.commit()
                
                return cursor.rowcount > 0
                
        except Exception as e:
            logger.error(f"خطأ في تعيين الحساب الرئيسي: {str(e)}")
            if self.connection:
                self.connection.rollback()
            return False
    
    # ==================== وظائف رموز OAuth ====================
    
    def save_oauth_token(self, token_data: Dict[str, Any]) -> bool:
        """حفظ رمز OAuth"""
        try:
            if self.db_type == "supabase":
                return self._save_token_supabase(token_data)
            else:
                return self._save_token_sql(token_data)
                
        except Exception as e:
            logger.error(f"خطأ في حفظ رمز OAuth: {str(e)}")
            return False
    
    def _save_token_supabase(self, token_data: Dict[str, Any]) -> bool:
        """حفظ رمز في Supabase"""
        try:
            # تحويل metadata إلى JSON
            if 'metadata' in token_data and isinstance(token_data['metadata'], dict):
                token_data['metadata'] = json.dumps(token_data['metadata'])
            
            result = self.supabase_client.table('oauth_tokens').upsert(token_data).execute()
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"خطأ في حفظ رمز Supabase: {str(e)}")
            return False
    
    def _save_token_sql(self, token_data: Dict[str, Any]) -> bool:
        """حفظ رمز في SQL"""
        try:
            cursor = self.connection.cursor()
            
            # تحويل metadata إلى JSON
            if 'metadata' in token_data and isinstance(token_data['metadata'], dict):
                token_data['metadata'] = json.dumps(token_data['metadata'])
            
            # إعداد الاستعلام
            columns = list(token_data.keys())
            placeholders = ['?' if self.db_type == 'sqlite' else '%s'] * len(columns)
            
            query = f"""
            INSERT OR REPLACE INTO oauth_tokens ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            """ if self.db_type == 'sqlite' else f"""
            INSERT INTO oauth_tokens ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            ON CONFLICT (user_id, customer_id) DO UPDATE SET
            {', '.join([f"{col} = EXCLUDED.{col}" for col in columns if col not in ['id', 'user_id', 'customer_id']])}
            """
            
            cursor.execute(query, list(token_data.values()))
            self.connection.commit()
            
            return cursor.rowcount > 0
            
        except Exception as e:
            logger.error(f"خطأ في حفظ رمز SQL: {str(e)}")
            if self.connection:
                self.connection.rollback()
            return False
    
    def get_user_oauth_tokens(self, user_id: str) -> List[Dict[str, Any]]:
        """جلب رموز OAuth للمستخدم"""
        try:
            if self.db_type == "supabase":
                result = self.supabase_client.table('oauth_tokens').select('*').eq('user_id', user_id).execute()
                
                tokens = []
                for token in result.data:
                    if token.get('metadata'):
                        try:
                            token['metadata'] = json.loads(token['metadata'])
                        except:
                            token['metadata'] = {}
                    tokens.append(token)
                
                return tokens
                
            else:
                cursor = self.connection.cursor()
                
                query = "SELECT * FROM oauth_tokens WHERE user_id = ? ORDER BY created_at DESC"
                if self.db_type == 'postgresql':
                    query = query.replace('?', '%s')
                
                cursor.execute(query, (user_id,))
                rows = cursor.fetchall()
                
                tokens = []
                for row in rows:
                    token = dict(row)
                    if token.get('metadata'):
                        try:
                            token['metadata'] = json.loads(token['metadata'])
                        except:
                            token['metadata'] = {}
                    tokens.append(token)
                
                return tokens
                
        except Exception as e:
            logger.error(f"خطأ في جلب رموز OAuth: {str(e)}")
            return []
    
    def get_active_oauth_tokens(self, user_id: str) -> List[Dict[str, Any]]:
        """جلب رموز OAuth النشطة للمستخدم"""
        try:
            if self.db_type == "supabase":
                result = self.supabase_client.table('oauth_tokens').select('*').eq('user_id', user_id).eq('is_active', True).execute()
                
                tokens = []
                for token in result.data:
                    if token.get('metadata'):
                        try:
                            token['metadata'] = json.loads(token['metadata'])
                        except:
                            token['metadata'] = {}
                    tokens.append(token)
                
                return tokens
                
            else:
                cursor = self.connection.cursor()
                
                query = "SELECT * FROM oauth_tokens WHERE user_id = ? AND is_active = ? ORDER BY created_at DESC"
                if self.db_type == 'postgresql':
                    query = query.replace('?', '%s')
                
                cursor.execute(query, (user_id, True))
                rows = cursor.fetchall()
                
                tokens = []
                for row in rows:
                    token = dict(row)
                    if token.get('metadata'):
                        try:
                            token['metadata'] = json.loads(token['metadata'])
                        except:
                            token['metadata'] = {}
                    tokens.append(token)
                
                return tokens
                
        except Exception as e:
            logger.error(f"خطأ في جلب رموز OAuth النشطة: {str(e)}")
            return []
    
    def delete_user_oauth_tokens(self, user_id: str) -> bool:
        """حذف رموز OAuth للمستخدم"""
        try:
            if self.db_type == "supabase":
                result = self.supabase_client.table('oauth_tokens').delete().eq('user_id', user_id).execute()
                return True
                
            else:
                cursor = self.connection.cursor()
                
                query = "DELETE FROM oauth_tokens WHERE user_id = ?"
                if self.db_type == 'postgresql':
                    query = query.replace('?', '%s')
                
                cursor.execute(query, (user_id,))
                self.connection.commit()
                
                return True
                
        except Exception as e:
            logger.error(f"خطأ في حذف رموز OAuth: {str(e)}")
            if self.connection:
                self.connection.rollback()
            return False
    
    def deactivate_user_google_ads_accounts(self, user_id: str) -> bool:
        """إلغاء تفعيل حسابات Google Ads للمستخدم"""
        try:
            if self.db_type == "supabase":
                result = self.supabase_client.table('google_ads_accounts').update({
                    'status': 'INACTIVE',
                    'is_primary': False,
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('user_id', user_id).execute()
                
                return True
                
            else:
                cursor = self.connection.cursor()
                
                query = "UPDATE google_ads_accounts SET status = ?, is_primary = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?"
                if self.db_type == 'postgresql':
                    query = query.replace('?', '%s')
                
                cursor.execute(query, ('INACTIVE', False, user_id))
                self.connection.commit()
                
                return True
                
        except Exception as e:
            logger.error(f"خطأ في إلغاء تفعيل الحسابات: {str(e)}")
            if self.connection:
                self.connection.rollback()
            return False
    
    def close_connection(self):
        """إغلاق اتصال قاعدة البيانات"""
        try:
            if self.connection:
                self.connection.close()
                logger.info("تم إغلاق اتصال قاعدة البيانات")
                
        except Exception as e:
            logger.error(f"خطأ في إغلاق الاتصال: {str(e)}")

# إنشاء مثيل مشترك
google_ads_db = GoogleAdsDatabaseManager()

# تصدير الكلاسات والوظائف
__all__ = ['GoogleAdsDatabaseManager', 'google_ads_db']


"""
Google Ads Database Manager

This module provides a robust and flexible database management layer for
Google Ads related data, including:
- Storing and retrieving Google Ads account information
- Managing OAuth tokens securely
- Handling user-specific Google Ads data
- Supporting various database backends (SQLite, PostgreSQL, Supabase)

It's designed to abstract database operations, allowing for easy switching
between different storage solutions without affecting the core application logic.

Author: Google Ads AI Platform Team
Version: 1.1.0
"""

import os
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json

# محاولة استيراد الخدمات المطلوبة مع معالجة أخطاء متقدمة
SERVICES_STATUS = {
    'sqlite': False,
    'postgresql': False,
    'supabase': False,
    'redis': False,
    'helpers': False
}

try:
    import sqlite3
    SERVICES_STATUS['sqlite'] = True
except ImportError:
    logging.warning("SQLite3 غير متاح.")

try:
    import psycopg2
    SERVICES_STATUS['postgresql'] = True
except ImportError:
    logging.warning("Psycopg2 (PostgreSQL) غير متاح.")

try:
    from supabase import create_client, Client
    SERVICES_STATUS['supabase'] = True
except ImportError:
    logging.warning("Supabase غير متاح.")

try:
    from utils.redis_config import redis_config, cache_set, cache_get, cache_delete
    SERVICES_STATUS['redis'] = True
except ImportError:
    logging.warning("Redis غير متاح.")

try:
    from utils.helpers import generate_unique_id, encrypt_token, decrypt_token
    SERVICES_STATUS['helpers'] = True
except ImportError:
    logging.warning("Helpers غير متاح.")

logger = logging.getLogger(__name__)

class GoogleAdsDatabaseManager:
    """
    مدير قاعدة البيانات لبيانات Google Ads.
    يدعم SQLite، PostgreSQL، و Supabase.
    """
    def __init__(self, db_type: Optional[str] = None):
        self.db_type = db_type or os.getenv("DATABASE_TYPE", "sqlite").lower()
        self.conn = None
        
    def check_account_exists(self, customer_id: str) -> bool:
        """فحص وجود حساب في قاعدة البيانات"""
        try:
            if self.db_type == "supabase":
                result = self.supabase.table('google_ads_accounts').select('customer_id').eq('customer_id', customer_id).execute()
                return bool(result.data)
            else:
                cursor = self.connection.cursor()
                cursor.execute("SELECT customer_id FROM google_ads_accounts WHERE customer_id = ?", (customer_id,))
                return cursor.fetchone() is not None
                
        except Exception as e:
            logger.error(f"خطأ في فحص وجود الحساب: {str(e)}")
            return False
    
    def remove_google_ads_account(self, customer_id: str) -> bool:
        """حذف حساب Google Ads من قاعدة البيانات (عند إلغاء الربط)"""
        try:
            if self.db_type == "supabase":
                result = self.supabase.table('google_ads_accounts').delete().eq('customer_id', customer_id).execute()
                if hasattr(result, 'data') and result.data:
                    logger.info(f"✅ تم حذف حساب Google Ads من Supabase: {customer_id}")
                    return True
                else:
                    logger.warning(f"⚠️ لم يتم العثور على حساب لحذفه: {customer_id}")
                    return False
            else:
                cursor = self.connection.cursor()
                cursor.execute("DELETE FROM google_ads_accounts WHERE customer_id = ?", (customer_id,))
                rows_affected = cursor.rowcount
                self.connection.commit()
                
                if rows_affected > 0:
                    logger.info(f"✅ تم حذف حساب Google Ads من SQL: {customer_id}")
                    return True
                else:
                    logger.warning(f"⚠️ لم يتم العثور على حساب لحذفه: {customer_id}")
                    return False
                
        except Exception as e:
            logger.error(f"خطأ في حذف حساب Google Ads: {str(e)}")
            return False
        self.supabase_client: Optional[Client] = None
        self._initialize_db_connection()

    def _initialize_db_connection(self):
        """
        يقوم بتهيئة اتصال قاعدة البيانات بناءً على النوع المحدد.
        """
        if self.db_type == "sqlite":
            if SERVICES_STATUS['sqlite']:
                db_path = os.getenv("SQLITE_DB_PATH", "./google_ads.db")
                self.conn = sqlite3.connect(db_path, check_same_thread=False)
                self._create_sqlite_tables()
                logger.info(f"✅ تم الاتصال بقاعدة بيانات SQLite: {db_path}")
            else:
                logger.error("❌ SQLite غير متاح. يرجى تثبيت sqlite3.")
                self.db_type = None
        elif self.db_type == "postgresql":
            if SERVICES_STATUS['postgresql']:
                try:
                    self.conn = psycopg2.connect(
                        host=os.getenv("POSTGRES_HOST"),
                        database=os.getenv("POSTGRES_DB"),
                        user=os.getenv("POSTGRES_USER"),
                        password=os.getenv("POSTGRES_PASSWORD"),
                        port=os.getenv("POSTGRES_PORT", 5432)
                    )
                    self._create_postgresql_tables()
                    logger.info("✅ تم الاتصال بقاعدة بيانات PostgreSQL.")
                except Exception as e:
                    logger.error(f"❌ فشل الاتصال بـ PostgreSQL: {e}")
                    self.db_type = None
            else:
                logger.error("❌ Psycopg2 غير متاح. يرجى تثبيت psycopg2-binary.")
                self.db_type = None
        elif self.db_type == "supabase":
            if SERVICES_STATUS['supabase']:
                try:
                    url = os.getenv("SUPABASE_URL")
                    key = os.getenv("SUPABASE_KEY")
                    if not url or not key:
                        raise ValueError("SUPABASE_URL و SUPABASE_KEY يجب أن يكونا معرفين.")
                    self.supabase_client = create_client(url, key)
                    logger.info("✅ تم الاتصال بـ Supabase.")
                except Exception as e:
                    logger.error(f"❌ فشل الاتصال بـ Supabase: {e}")
                    self.db_type = None
            else:
                logger.error("❌ Supabase غير متاح. يرجى تثبيت supabase-py.")
                self.db_type = None
        else:
            logger.error(f"❌ نوع قاعدة البيانات غير مدعوم: {self.db_type}")
            self.db_type = None

        if not self.db_type:
            logger.error("لا توجد قاعدة بيانات مهيأة بنجاح. وظائف قاعدة البيانات لن تعمل.")

    def _create_sqlite_tables(self):
        """
        ينشئ الجداول المطلوبة في قاعدة بيانات SQLite.
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS google_ads_accounts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                customer_id TEXT NOT NULL UNIQUE,
                descriptive_name TEXT,
                currency_code TEXT,
                time_zone TEXT,
                manager BOOLEAN,
                test_account BOOLEAN,
                auto_tagging_enabled BOOLEAN,
                conversion_tracking_id TEXT,
                status TEXT,
                account_type TEXT,
                is_primary BOOLEAN,
                linked_at TEXT,
                last_sync TEXT,
                metadata JSONB
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS oauth_tokens (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                customer_id TEXT,
                access_token TEXT NOT NULL,
                refresh_token TEXT,
                token_type TEXT,
                scope TEXT,
                expires_at TEXT,
                created_at TEXT,
                last_refreshed TEXT,
                is_active BOOLEAN,
                metadata JSONB
            );
        """)
        self.conn.commit()

    def _create_postgresql_tables(self):
        """
        ينشئ الجداول المطلوبة في قاعدة بيانات PostgreSQL.
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS google_ads_accounts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                customer_id TEXT NOT NULL UNIQUE,
                descriptive_name TEXT,
                currency_code TEXT,
                time_zone TEXT,
                manager BOOLEAN,
                test_account BOOLEAN,
                auto_tagging_enabled BOOLEAN,
                conversion_tracking_id TEXT,
                status TEXT,
                account_type TEXT,
                is_primary BOOLEAN,
                linked_at TEXT,
                last_sync TEXT,
                metadata JSONB
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS oauth_tokens (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                customer_id TEXT,
                access_token TEXT NOT NULL,
                refresh_token TEXT,
                token_type TEXT,
                scope TEXT,
                expires_at TEXT,
                created_at TEXT,
                last_refreshed TEXT,
                is_active BOOLEAN,
                metadata JSONB
            );
        """)
        self.conn.commit()

    def save_google_ads_account(self, account_data: Dict[str, Any]) -> bool:
        """
        يحفظ أو يحدث معلومات حساب Google Ads في قاعدة البيانات.
        """
        if not self.db_type:
            return False

        try:
            if self.db_type == "sqlite" or self.db_type == "postgresql":
                cursor = self.conn.cursor()
                metadata_json = json.dumps(account_data.get("metadata", {}))
                
                # التحقق مما إذا كان الحساب موجودًا بالفعل
                cursor.execute("SELECT id FROM google_ads_accounts WHERE customer_id = ?", (account_data["customer_id"],))
                existing_account = cursor.fetchone()

                if existing_account:
                    # تحديث الحساب الموجود
                    cursor.execute("""
                        UPDATE google_ads_accounts SET
                            user_id = ?, descriptive_name = ?, currency_code = ?,
                            time_zone = ?, manager = ?, test_account = ?,
                            auto_tagging_enabled = ?, conversion_tracking_id = ?,
                            status = ?, account_type = ?, is_primary = ?,
                            linked_at = ?, last_sync = ?, metadata = ?
                        WHERE customer_id = ?;
                    """, (
                        account_data["user_id"], account_data.get("descriptive_name"),
                        account_data.get("currency_code"), account_data.get("time_zone"),
                        account_data.get("manager"), account_data.get("test_account"),
                        account_data.get("auto_tagging_enabled"), account_data.get("conversion_tracking_id"),
                        account_data.get("status"), account_data.get("account_type"),
                        account_data.get("is_primary"), account_data.get("linked_at"),
                        account_data.get("last_sync"), metadata_json,
                        account_data["customer_id"]
                    ))
                    logger.info(f"تم تحديث حساب Google Ads: {account_data['customer_id']}")
                else:
                    # إدراج حساب جديد
                    cursor.execute("""
                        INSERT INTO google_ads_accounts (
                            id, user_id, customer_id, descriptive_name, currency_code,
                            time_zone, manager, test_account, auto_tagging_enabled,
                            conversion_tracking_id, status, account_type, is_primary,
                            linked_at, last_sync, metadata
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                    """, (
                        account_data["id"], account_data["user_id"], account_data["customer_id"],
                        account_data.get("descriptive_name"), account_data.get("currency_code"),
                        account_data.get("time_zone"), account_data.get("manager"),
                        account_data.get("test_account"), account_data.get("auto_tagging_enabled"),
                        account_data.get("conversion_tracking_id"), account_data.get("status"),
                        account_data.get("account_type"), account_data.get("is_primary"),
                        account_data.get("linked_at"), account_data.get("last_sync"), metadata_json
                    ))
                    logger.info(f"تم حفظ حساب Google Ads جديد: {account_data['customer_id']}")
                self.conn.commit()
                return True
            elif self.db_type == "supabase":
                response = self.supabase_client.table("google_ads_accounts").upsert(account_data).execute()
                if response.data:
                    logger.info(f"تم حفظ/تحديث حساب Google Ads في Supabase: {account_data['customer_id']}")
                    return True
                else:
                    logger.error(f"فشل حفظ/تحديث حساب Google Ads في Supabase: {response.error}")
                    return False
        except Exception as e:
            logger.error(f"خطأ في حفظ حساب Google Ads: {e}")
            return False

    def get_user_google_ads_accounts(self, user_id: str) -> List[Dict[str, Any]]:
        """
        يجلب جميع حسابات Google Ads المرتبطة بمستخدم معين.
        """
        if not self.db_type:
            return []

        try:
            if self.db_type == "sqlite" or self.db_type == "postgresql":
                cursor = self.conn.cursor()
                cursor.execute("SELECT * FROM google_ads_accounts WHERE user_id = ?", (user_id,))
                columns = [description[0] for description in cursor.description]
                accounts = []
                for row in cursor.fetchall():
                    account = dict(zip(columns, row))
                    if "metadata" in account and account["metadata"]:
                        account["metadata"] = json.loads(account["metadata"])
                    accounts.append(account)
                return accounts
            elif self.db_type == "supabase":
                response = self.supabase_client.table("google_ads_accounts").select("*").eq("user_id", user_id).execute()
                if response.data:
                    return response.data
                else:
                    logger.error(f"فشل جلب حسابات Google Ads من Supabase: {response.error}")
                    return []
        except Exception as e:
            logger.error(f"خطأ في جلب حسابات Google Ads للمستخدم: {e}")
            return []

    def get_google_ads_account_by_customer_id(self, user_id: str, customer_id: str) -> Optional[Dict[str, Any]]:
        """
        يجلب حساب Google Ads معينًا بواسطة معرف العميل ومعرف المستخدم.
        """
        if not self.db_type:
            return None

        try:
            if self.db_type == "sqlite" or self.db_type == "postgresql":
                cursor = self.conn.cursor()
                cursor.execute("SELECT * FROM google_ads_accounts WHERE user_id = ? AND customer_id = ?", (user_id, customer_id))
                columns = [description[0] for description in cursor.description]
                row = cursor.fetchone()
                if row:
                    account = dict(zip(columns, row))
                    if "metadata" in account and account["metadata"]:
                        account["metadata"] = json.loads(account["metadata"])
                    return account
                return None
            elif self.db_type == "supabase":
                response = self.supabase_client.table("google_ads_accounts").select("*").eq("user_id", user_id).eq("customer_id", customer_id).single().execute()
                if response.data:
                    return response.data
                else:
                    logger.error(f"فشل جلب حساب Google Ads من Supabase: {response.error}")
                    return None
        except Exception as e:
            logger.error(f"خطأ في جلب حساب Google Ads بواسطة معرف العميل: {e}")
            return None

    def get_primary_google_ads_account(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        يجلب الحساب الرئيسي لـ Google Ads لمستخدم معين.
        """
        if not self.db_type:
            return None

        try:
            if self.db_type == "sqlite" or self.db_type == "postgresql":
                cursor = self.conn.cursor()
                cursor.execute("SELECT * FROM google_ads_accounts WHERE user_id = ? AND is_primary = TRUE", (user_id,))
                columns = [description[0] for description in cursor.description]
                row = cursor.fetchone()
                if row:
                    account = dict(zip(columns, row))
                    if "metadata" in account and account["metadata"]:
                        account["metadata"] = json.loads(account["metadata"])
                    return account
                return None
            elif self.db_type == "supabase":
                response = self.supabase_client.table("google_ads_accounts").select("*").eq("user_id", user_id).eq("is_primary", True).single().execute()
                if response.data:
                    return response.data
                else:
                    logger.error(f"فشل جلب الحساب الرئيسي من Supabase: {response.error}")
                    return None
        except Exception as e:
            logger.error(f"خطأ في جلب الحساب الرئيسي: {e}")
            return None

    def set_primary_google_ads_account(self, user_id: str, customer_id: str) -> bool:
        """
        يعين حساب Google Ads معينًا كحساب رئيسي لمستخدم.
        يقوم أولاً بإلغاء تعيين أي حساب رئيسي حالي.
        """
        if not self.db_type:
            return False

        try:
            # إلغاء تعيين الحساب الرئيسي الحالي
            self.unset_primary_google_ads_account(user_id)

            if self.db_type == "sqlite" or self.db_type == "postgresql":
                cursor = self.conn.cursor()
                cursor.execute("UPDATE google_ads_accounts SET is_primary = TRUE WHERE user_id = ? AND customer_id = ?", (user_id, customer_id))
                self.conn.commit()
                logger.info(f"تم تعيين الحساب {customer_id} كحساب رئيسي للمستخدم {user_id}")
                return True
            elif self.db_type == "supabase":
                response = self.supabase_client.table("google_ads_accounts").update({"is_primary": True}).eq("user_id", user_id).eq("customer_id", customer_id).execute()
                if response.data:
                    logger.info(f"تم تعيين الحساب {customer_id} كحساب رئيسي في Supabase للمستخدم {user_id}")
                    return True
                else:
                    logger.error(f"فشل تعيين الحساب الرئيسي في Supabase: {response.error}")
                    return False
        except Exception as e:
            logger.error(f"خطأ في تعيين الحساب الرئيسي: {e}")
            return False

    def unset_primary_google_ads_account(self, user_id: str) -> bool:
        """
        يزيل تعيين أي حساب رئيسي حالي لمستخدم معين.
        """
        if not self.db_type:
            return False

        try:
            if self.db_type == "sqlite" or self.db_type == "postgresql":
                cursor = self.conn.cursor()
                cursor.execute("UPDATE google_ads_accounts SET is_primary = FALSE WHERE user_id = ? AND is_primary = TRUE", (user_id,))
                self.conn.commit()
                logger.info(f"تم إلغاء تعيين الحساب الرئيسي الحالي للمستخدم {user_id}")
                return True
            elif self.db_type == "supabase":
                response = self.supabase_client.table("google_ads_accounts").update({"is_primary": False}).eq("user_id", user_id).eq("is_primary", True).execute()
                if response.data:
                    logger.info(f"تم إلغاء تعيين الحساب الرئيسي في Supabase للمستخدم {user_id}")
                    return True
                else:
                    logger.error(f"فشل إلغاء تعيين الحساب الرئيسي في Supabase: {response.error}")
                    return False
        except Exception as e:
            logger.error(f"خطأ في إلغاء تعيين الحساب الرئيسي: {e}")
            return False

    def deactivate_user_google_ads_accounts(self, user_id: str) -> bool:
        """
        يقوم بتعطيل جميع حسابات Google Ads المرتبطة بمستخدم معين.
        """
        if not self.db_type:
            return False

        try:
            if self.db_type == "sqlite" or self.db_type == "postgresql":
                cursor = self.conn.cursor()
                cursor.execute("UPDATE google_ads_accounts SET status = ?, is_primary = FALSE WHERE user_id = ?", ("INACTIVE", user_id))
                self.conn.commit()
                logger.info(f"تم تعطيل جميع حسابات Google Ads للمستخدم {user_id}")
                return True
            elif self.db_type == "supabase":
                response = self.supabase_client.table("google_ads_accounts").update({"status": "INACTIVE", "is_primary": False}).eq("user_id", user_id).execute()
                if response.data:
                    logger.info(f"تم تعطيل جميع حسابات Google Ads في Supabase للمستخدم {user_id}")
                    return True
                else:
                    logger.error(f"فشل تعطيل حسابات Google Ads في Supabase: {response.error}")
                    return False
        except Exception as e:
            logger.error(f"خطأ في تعطيل حسابات Google Ads: {e}")
            return False

    def save_oauth_token(self, token_data: Dict[str, Any]) -> bool:
        """
        يحفظ أو يحدث رمز OAuth في قاعدة البيانات.
        """
        if not self.db_type:
            return False

        try:
            if self.db_type == "sqlite" or self.db_type == "postgresql":
                cursor = self.conn.cursor()
                metadata_json = json.dumps(token_data.get("metadata", {}))
                
                # التحقق مما إذا كان الرمز موجودًا بالفعل
                cursor.execute("SELECT id FROM oauth_tokens WHERE user_id = ? AND customer_id = ?", (token_data["user_id"], token_data.get("customer_id")))
                existing_token = cursor.fetchone()

                if existing_token:
                    # تحديث الرمز الموجود
                    cursor.execute("""
                        UPDATE oauth_tokens SET
                            access_token = ?, refresh_token = ?, token_type = ?,
                            scope = ?, expires_at = ?, created_at = ?,
                            last_refreshed = ?, is_active = ?, metadata = ?
                        WHERE user_id = ? AND customer_id = ?;
                    """, (
                        token_data.get("access_token"), token_data.get("refresh_token"),
                        token_data.get("token_type"), token_data.get("scope"),
                        token_data.get("expires_at"), token_data.get("created_at"),
                        token_data.get("last_refreshed"), token_data.get("is_active"),
                        metadata_json, token_data["user_id"], token_data.get("customer_id")
                    ))
                    logger.info(f"تم تحديث رمز OAuth للمستخدم {token_data['user_id']}")
                else:
                    # إدراج رمز جديد
                    cursor.execute("""
                        INSERT INTO oauth_tokens (
                            id, user_id, customer_id, access_token, refresh_token,
                            token_type, scope, expires_at, created_at, last_refreshed,
                            is_active, metadata
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                    """, (
                        token_data["id"], token_data["user_id"], token_data.get("customer_id"),
                        token_data.get("access_token"), token_data.get("refresh_token"),
                        token_data.get("token_type"), token_data.get("scope"),
                        token_data.get("expires_at"), token_data.get("created_at"),
                        token_data.get("last_refreshed"), token_data.get("is_active"),
                        metadata_json
                    ))
                    logger.info(f"تم حفظ رمز OAuth جديد للمستخدم {token_data['user_id']}")
                self.conn.commit()
                return True
            elif self.db_type == "supabase":
                response = self.supabase_client.table("oauth_tokens").upsert(token_data).execute()
                if response.data:
                    logger.info(f"تم حفظ/تحديث رمز OAuth في Supabase: {token_data['user_id']}")
                    return True
                else:
                    logger.error(f"فشل حفظ/تحديث رمز OAuth في Supabase: {response.error}")
                    return False
        except Exception as e:
            logger.error(f"خطأ في حفظ رمز OAuth: {e}")
            return False

    def get_user_oauth_tokens(self, user_id: str) -> List[Dict[str, Any]]:
        """
        يجلب جميع رموز OAuth المرتبطة بمستخدم معين.
        """
        if not self.db_type:
            return []

        try:
            if self.db_type == "sqlite" or self.db_type == "postgresql":
                cursor = self.conn.cursor()
                cursor.execute("SELECT * FROM oauth_tokens WHERE user_id = ?", (user_id,))
                columns = [description[0] for description in cursor.description]
                tokens = []
                for row in cursor.fetchall():
                    token = dict(zip(columns, row))
                    if "metadata" in token and token["metadata"]:
                        token["metadata"] = json.loads(token["metadata"])
                    tokens.append(token)
                return tokens
            elif self.db_type == "supabase":
                response = self.supabase_client.table("oauth_tokens").select("*").eq("user_id", user_id).execute()
                if response.data:
                    return response.data
                else:
                    logger.error(f"فشل جلب رموز OAuth من Supabase: {response.error}")
                    return []
        except Exception as e:
            logger.error(f"خطأ في جلب رموز OAuth للمستخدم: {e}")
            return []

    def get_active_oauth_tokens(self, user_id: str) -> List[Dict[str, Any]]:
        """
        يجلب رموز OAuth النشطة لمستخدم معين.
        """
        if not self.db_type:
            return []

        try:
            current_time = datetime.utcnow().isoformat()
            if self.db_type == "sqlite" or self.db_type == "postgresql":
                cursor = self.conn.cursor()
                cursor.execute("SELECT * FROM oauth_tokens WHERE user_id = ? AND is_active = TRUE AND expires_at > ?", (user_id, current_time))
                columns = [description[0] for description in cursor.description]
                tokens = []
                for row in cursor.fetchall():
                    token = dict(zip(columns, row))
                    if "metadata" in token and token["metadata"]:
                        token["metadata"] = json.loads(token["metadata"])
                    tokens.append(token)
                return tokens
            elif self.db_type == "supabase":
                response = self.supabase_client.table("oauth_tokens").select("*").eq("user_id", user_id).eq("is_active", True).gt("expires_at", current_time).execute()
                if response.data:
                    return response.data
                else:
                    logger.error(f"فشل جلب رموز OAuth النشطة من Supabase: {response.error}")
                    return []
        except Exception as e:
            logger.error(f"خطأ في جلب رموز OAuth النشطة: {e}")
            return []

    def delete_user_oauth_tokens(self, user_id: str) -> bool:
        """
        يحذف جميع رموز OAuth المرتبطة بمستخدم معين.
        """
        if not self.db_type:
            return False

        try:
            if self.db_type == "sqlite" or self.db_type == "postgresql":
                cursor = self.conn.cursor()
                cursor.execute("DELETE FROM oauth_tokens WHERE user_id = ?", (user_id,))
                self.conn.commit()
                logger.info(f"تم حذف جميع رموز OAuth للمستخدم {user_id}")
                return True
            elif self.db_type == "supabase":
                response = self.supabase_client.table("oauth_tokens").delete().eq("user_id", user_id).execute()
                if response.data:
                    logger.info(f"تم حذف جميع رموز OAuth في Supabase للمستخدم {user_id}")
                    return True
                else:
                    logger.error(f"فشل حذف رموز OAuth في Supabase: {response.error}")
                    return False
        except Exception as e:
            logger.error(f"خطأ في حذف رموز OAuth: {e}")
            return False

    def close_connection(self):
        """
        يغلق اتصال قاعدة البيانات.
        """
        if self.db_type == "sqlite" or self.db_type == "postgresql":
            if self.conn:
                self.conn.close()
                logger.info("تم إغلاق اتصال قاعدة البيانات.")
        elif self.db_type == "supabase":
            # Supabase client doesn't have a close method, connection is managed internally
            pass

# إنشاء مثيل مشترك من مدير قاعدة البيانات
google_ads_db = GoogleAdsDatabaseManager()

logger.info("✅ تم تحميل Google Ads Database Manager")


