"""
Environment Checker - فاحص البيئة الشامل
يفحص جميع متغيرات البيئة والمكتبات المطلوبة
"""
import os
import sys
import importlib
import logging
from typing import Dict, Any, List, Tuple
from datetime import datetime

# إعداد التسجيل
logger = logging.getLogger(__name__)

class EnvironmentChecker:
    """فاحص شامل لبيئة التطبيق"""
    
    def __init__(self):
        self.results = {}
        self.issues = []
        self.recommendations = []
    
    def check_python_version(self) -> Dict[str, Any]:
        """فحص إصدار Python"""
        try:
            version_info = sys.version_info
            version_str = f"{version_info.major}.{version_info.minor}.{version_info.micro}"
            
            # التحقق من الحد الأدنى للإصدار
            min_version = (3, 8)
            is_supported = version_info[:2] >= min_version
            
            result = {
                'version': version_str,
                'major': version_info.major,
                'minor': version_info.minor,
                'micro': version_info.micro,
                'is_supported': is_supported,
                'minimum_required': f"{min_version[0]}.{min_version[1]}",
                'status': 'ok' if is_supported else 'warning'
            }
            
            if not is_supported:
                self.issues.append(f"إصدار Python {version_str} قديم، يُنصح بـ {min_version[0]}.{min_version[1]}+")
                self.recommendations.append("قم بتحديث Python إلى إصدار أحدث")
            
            return result
            
        except Exception as e:
            logger.error(f"خطأ في فحص إصدار Python: {e}")
            return {'status': 'error', 'error': str(e)}
    
    def check_required_packages(self) -> Dict[str, Any]:
        """فحص المكتبات المطلوبة"""
        required_packages = {
            'flask': 'Flask web framework',
            'redis': 'Redis client',
            'requests': 'HTTP requests library',
            'pyyaml': 'YAML parser',
            'google-ads': 'Google Ads API client',
            'google-auth': 'Google authentication',
            'google-auth-oauthlib': 'Google OAuth library',
            'sqlalchemy': 'SQL toolkit',
            'pymongo': 'MongoDB driver',
            'celery': 'Task queue',
            'aiohttp': 'Async HTTP client'
        }
        
        package_status = {}
        missing_packages = []
        
        for package, description in required_packages.items():
            try:
                # محاولة استيراد المكتبة
                if package == 'google-ads':
                    importlib.import_module('google.ads.googleads')
                elif package == 'google-auth':
                    importlib.import_module('google.auth')
                elif package == 'google-auth-oauthlib':
                    importlib.import_module('google_auth_oauthlib')
                elif package == 'pyyaml':
                    importlib.import_module('yaml')
                else:
                    importlib.import_module(package)
                
                package_status[package] = {
                    'available': True,
                    'description': description,
                    'status': 'ok'
                }
                
            except ImportError:
                package_status[package] = {
                    'available': False,
                    'description': description,
                    'status': 'missing'
                }
                missing_packages.append(package)
        
        if missing_packages:
            self.issues.extend([f"مكتبة مفقودة: {pkg}" for pkg in missing_packages])
            self.recommendations.append(f"قم بتثبيت المكتبات المفقودة: pip install {' '.join(missing_packages)}")
        
        return {
            'packages': package_status,
            'total_packages': len(required_packages),
            'available_packages': len([p for p in package_status.values() if p['available']]),
            'missing_packages': missing_packages,
            'status': 'ok' if not missing_packages else 'warning'
        }
    
    def check_environment_variables(self) -> Dict[str, Any]:
        """فحص متغيرات البيئة"""
        env_groups = {
            'google_ads': {
                'GOOGLE_ADS_DEVELOPER_TOKEN': 'Google Ads Developer Token',
                'GOOGLE_ADS_CLIENT_ID': 'Google Ads Client ID',
                'GOOGLE_ADS_CLIENT_SECRET': 'Google Ads Client Secret',
                'GOOGLE_ADS_REFRESH_TOKEN': 'Google Ads Refresh Token',
                'GOOGLE_ADS_LOGIN_CUSTOMER_ID': 'Google Ads Login Customer ID'
            },
            'oauth': {
                'GOOGLE_CLIENT_ID': 'Google OAuth Client ID',
                'GOOGLE_CLIENT_SECRET': 'Google OAuth Client Secret',
                'GOOGLE_REDIRECT_URI': 'Google OAuth Redirect URI'
            },
            'redis': {
                'REDIS_HOST': 'Redis Host',
                'REDIS_PORT': 'Redis Port',
                'REDIS_DB': 'Redis Database',
                'REDIS_PASSWORD': 'Redis Password'
            },
            'database': {
                'DATABASE_URL': 'Database URL',
                'DB_HOST': 'Database Host',
                'DB_PORT': 'Database Port',
                'DB_NAME': 'Database Name',
                'DB_USER': 'Database User',
                'DB_PASSWORD': 'Database Password'
            },
            'app': {
                'FLASK_ENV': 'Flask Environment',
                'SECRET_KEY': 'Flask Secret Key',
                'DEBUG': 'Debug Mode'
            }
        }
        
        env_status = {}
        missing_critical = []
        
        for group_name, variables in env_groups.items():
            group_status = {}
            group_missing = []
            
            for var_name, description in variables.items():
                value = os.getenv(var_name)
                is_set = bool(value)
                
                group_status[var_name] = {
                    'set': is_set,
                    'description': description,
                    'value_length': len(value) if value else 0,
                    'status': 'ok' if is_set else 'missing'
                }
                
                if not is_set:
                    group_missing.append(var_name)
                    
                    # متغيرات حرجة
                    if group_name == 'google_ads' and var_name in ['GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_CLIENT_ID']:
                        missing_critical.append(var_name)
            
            env_status[group_name] = {
                'variables': group_status,
                'total_variables': len(variables),
                'set_variables': len([v for v in group_status.values() if v['set']]),
                'missing_variables': group_missing,
                'status': 'ok' if not group_missing else 'warning'
            }
        
        if missing_critical:
            self.issues.extend([f"متغير بيئة حرج مفقود: {var}" for var in missing_critical])
            self.recommendations.append("قم بتعيين متغيرات البيئة الحرجة في ملف .env")
        
        return {
            'groups': env_status,
            'missing_critical': missing_critical,
            'status': 'ok' if not missing_critical else 'error'
        }
    
    def check_file_permissions(self) -> Dict[str, Any]:
        """فحص صلاحيات الملفات"""
        important_paths = [
            '.',
            'logs',
            'config',
            'services',
            'routes'
        ]
        
        permissions_status = {}
        permission_issues = []
        
        for path in important_paths:
            try:
                if os.path.exists(path):
                    is_readable = os.access(path, os.R_OK)
                    is_writable = os.access(path, os.W_OK)
                    is_executable = os.access(path, os.X_OK)
                    
                    permissions_status[path] = {
                        'exists': True,
                        'readable': is_readable,
                        'writable': is_writable,
                        'executable': is_executable,
                        'status': 'ok' if (is_readable and is_writable) else 'warning'
                    }
                    
                    if not (is_readable and is_writable):
                        permission_issues.append(f"صلاحيات غير كافية لـ {path}")
                else:
                    permissions_status[path] = {
                        'exists': False,
                        'status': 'missing'
                    }
                    
            except Exception as e:
                permissions_status[path] = {
                    'exists': False,
                    'error': str(e),
                    'status': 'error'
                }
        
        if permission_issues:
            self.issues.extend(permission_issues)
            self.recommendations.append("تحقق من صلاحيات الملفات والمجلدات")
        
        return {
            'paths': permissions_status,
            'issues': permission_issues,
            'status': 'ok' if not permission_issues else 'warning'
        }
    
    def check_network_connectivity(self) -> Dict[str, Any]:
        """فحص الاتصال بالشبكة"""
        test_urls = [
            'https://www.google.com',
            'https://accounts.google.com',
            'https://googleads.googleapis.com',
            'https://oauth2.googleapis.com'
        ]
        
        connectivity_status = {}
        connection_issues = []
        
        try:
            import requests
            
            for url in test_urls:
                try:
                    response = requests.get(url, timeout=10)
                    connectivity_status[url] = {
                        'accessible': True,
                        'status_code': response.status_code,
                        'response_time': response.elapsed.total_seconds(),
                        'status': 'ok' if response.status_code == 200 else 'warning'
                    }
                    
                except requests.RequestException as e:
                    connectivity_status[url] = {
                        'accessible': False,
                        'error': str(e),
                        'status': 'error'
                    }
                    connection_issues.append(f"فشل الاتصال بـ {url}")
                    
        except ImportError:
            return {
                'status': 'error',
                'error': 'مكتبة requests غير متاحة لفحص الاتصال'
            }
        
        if connection_issues:
            self.issues.extend(connection_issues)
            self.recommendations.append("تحقق من اتصال الإنترنت وإعدادات الجدار الناري")
        
        return {
            'urls': connectivity_status,
            'issues': connection_issues,
            'status': 'ok' if not connection_issues else 'warning'
        }
    
    def run_comprehensive_check(self) -> Dict[str, Any]:
        """تشغيل فحص شامل للبيئة"""
        logger.info("🔍 بدء الفحص الشامل للبيئة...")
        
        # إعادة تعيين النتائج
        self.results = {}
        self.issues = []
        self.recommendations = []
        
        # تشغيل جميع الفحوصات
        checks = {
            'python_version': self.check_python_version,
            'packages': self.check_required_packages,
            'environment_variables': self.check_environment_variables,
            'file_permissions': self.check_file_permissions,
            'network_connectivity': self.check_network_connectivity
        }
        
        for check_name, check_function in checks.items():
            try:
                logger.info(f"🔍 فحص {check_name}...")
                self.results[check_name] = check_function()
            except Exception as e:
                logger.error(f"❌ خطأ في فحص {check_name}: {e}")
                self.results[check_name] = {
                    'status': 'error',
                    'error': str(e)
                }
        
        # تحديد الحالة العامة
        overall_status = self._determine_overall_status()
        
        # إنشاء التقرير النهائي
        final_report = {
            'timestamp': datetime.utcnow().isoformat(),
            'overall_status': overall_status,
            'checks': self.results,
            'issues': self.issues,
            'recommendations': self.recommendations,
            'summary': self._generate_summary()
        }
        
        logger.info(f"✅ انتهى الفحص الشامل - الحالة العامة: {overall_status}")
        return final_report
    
    def _determine_overall_status(self) -> str:
        """تحديد الحالة العامة"""
        statuses = []
        for check_result in self.results.values():
            if isinstance(check_result, dict) and 'status' in check_result:
                statuses.append(check_result['status'])
        
        if 'error' in statuses:
            return 'error'
        elif 'warning' in statuses:
            return 'warning'
        else:
            return 'ok'
    
    def _generate_summary(self) -> Dict[str, Any]:
        """إنشاء ملخص النتائج"""
        total_checks = len(self.results)
        ok_checks = len([r for r in self.results.values() if r.get('status') == 'ok'])
        warning_checks = len([r for r in self.results.values() if r.get('status') == 'warning'])
        error_checks = len([r for r in self.results.values() if r.get('status') == 'error'])
        
        return {
            'total_checks': total_checks,
            'ok_checks': ok_checks,
            'warning_checks': warning_checks,
            'error_checks': error_checks,
            'success_rate': (ok_checks / total_checks * 100) if total_checks > 0 else 0,
            'total_issues': len(self.issues),
            'total_recommendations': len(self.recommendations)
        }

# إنشاء مثيل عام
environment_checker = EnvironmentChecker()

# دوال مساعدة
def check_environment() -> Dict[str, Any]:
    """تشغيل فحص شامل للبيئة"""
    return environment_checker.run_comprehensive_check()

def quick_health_check() -> Dict[str, Any]:
    """فحص سريع للصحة العامة"""
    try:
        python_check = environment_checker.check_python_version()
        env_check = environment_checker.check_environment_variables()
        
        return {
            'python_ok': python_check.get('is_supported', False),
            'env_ok': env_check.get('status') == 'ok',
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }

# تصدير الكلاسات والدوال
__all__ = [
    'EnvironmentChecker',
    'environment_checker',
    'check_environment',
    'quick_health_check'
]

# تسجيل حالة التحميل
logger.info("🔍 تم تحميل Environment Checker")

