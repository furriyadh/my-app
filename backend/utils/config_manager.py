import os
import yaml
import base64
from pathlib import Path
from typing import Dict, Any
from cryptography.fernet import Fernet
from cerberus import Validator
from rich.console import Console

class ConfigManager:
    """مدير الإعدادات المتقدم مع التشفير والتحقق"""
    
    def __init__(self, config_file: str = "ads_config.yaml"):
        self.config_file = config_file
        self.config = {}
        self.encryption_key = None
        self.validator = None
        self.console = Console()
        self._setup_encryption()
        self._setup_validator()
        self.load_config()
    
    def _setup_encryption(self):
        """إعداد التشفير للبيانات الحساسة"""
        try:
            key_file = "config_encryption.key"
            if os.path.exists(key_file):
                with open(key_file, 'rb') as f:
                    self.encryption_key = f.read()
            else:
                self.encryption_key = Fernet.generate_key()
                with open(key_file, 'wb') as f:
                    f.write(self.encryption_key)
            self.cipher = Fernet(self.encryption_key)
        except Exception as e:
            self.console.print(f"[yellow]Warning: Encryption setup failed: {e}[/yellow]")
            self.encryption_key = None
    
    def _setup_validator(self):
        """إعداد مُحقق الإعدادات"""
        schema = {
            'account': {
                'type': 'dict',
                'required': True,
                'schema': {
                    'customer_id': {'type': 'string', 'required': True},
                    'developer_token': {'type': 'string', 'required': True}
                }
            },
            'oauth2': {
                'type': 'dict',
                'required': True,
                'schema': {
                    'client_id': {'type': 'string', 'required': True},
                    'client_secret': {'type': 'string', 'required': True},
                    'refresh_token': {'type': 'string', 'required': True}
                }
            }
        }
        self.validator = Validator(schema)
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """تشفير البيانات الحساسة"""
        if self.encryption_key and data:
            try:
                encrypted = self.cipher.encrypt(data.encode())
                return base64.b64encode(encrypted).decode()
            except Exception:
                return data
        return data
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """فك تشفير البيانات الحساسة"""
        if self.encryption_key and encrypted_data:
            try:
                decoded = base64.b64decode(encrypted_data.encode())
                decrypted = self.cipher.decrypt(decoded)
                return decrypted.decode()
            except Exception:
                return encrypted_data
        return encrypted_data
    
    def load_config(self) -> Dict:
        """تحميل الإعدادات من الملف"""
        try:
            if not os.path.exists(self.config_file):
                self.console.print(f"[red]❌ Configuration file not found: {self.config_file}[/red]")
                self._create_default_config()
                return self.config
            
            with open(self.config_file, 'r', encoding='utf-8') as f:
                self.config = yaml.safe_load(f)
            
            # فك تشفير البيانات الحساسة
            self._decrypt_config()
            
            # التحقق من صحة الإعدادات
            if self.validator and not self.validator.validate(self.config):
                self.console.print(f"[yellow]⚠️ Configuration validation warnings: {self.validator.errors}[/yellow]")
            
            self.console.print("[green]✅ Configuration loaded successfully[/green]")
            return self.config
            
        except Exception as e:
            self.console.print(f"[red]❌ Error loading configuration: {e}[/red]")
            self._create_default_config()
            return self.config
    
    def _decrypt_config(self):
        """فك تشفير الإعدادات الحساسة"""
        sensitive_fields = [
            'account.developer_token',
            'oauth2.client_secret',
            'oauth2.refresh_token'
        ]
        
        for field_path in sensitive_fields:
            try:
                keys = field_path.split('.')
                current = self.config
                for key in keys[:-1]:
                    current = current.get(key, {})
                
                if keys[-1] in current:
                    current[keys[-1]] = self.decrypt_sensitive_data(current[keys[-1]])
            except Exception:
                continue
    
    def _create_default_config(self):
        """إنشاء ملف إعدادات افتراضي"""
        default_config = {
            'account': {
                'customer_id': 'YOUR_MCC_CUSTOMER_ID',
                'developer_token': 'YOUR_DEVELOPER_TOKEN'
            },
            'oauth2': {
                'client_id': 'YOUR_CLIENT_ID',
                'client_secret': 'YOUR_CLIENT_SECRET',
                'refresh_token': 'YOUR_REFRESH_TOKEN'
            },
            'logging': {
                'level': 'INFO',
                'format': 'text'
            },
            'api_requests': {
                'timeout_seconds': 120,
                'max_retries': 3
            }
        }
        
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                yaml.dump(default_config, f, default_flow_style=False, allow_unicode=True)
            self.config = default_config
            self.console.print(f"[yellow]📝 Created default configuration file: {self.config_file}[/yellow]")
            self.console.print("[yellow]Please update the configuration with your actual credentials[/yellow]")
        except Exception as e:
            self.console.print(f"[red]❌ Error creating default configuration: {e}[/red]")
    
    def get(self, key_path: str, default=None):
        """الحصول على قيمة من الإعدادات باستخدام مسار النقاط"""
        try:
            keys = key_path.split('.')
            current = self.config
            for key in keys:
                current = current[key]
            return current
        except (KeyError, TypeError):
            return default
    
    def set(self, key_path: str, value):
        """تعيين قيمة في الإعدادات باستخدام مسار النقاط"""
        keys = key_path.split('.')
        current = self.config
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        current[keys[-1]] = value
    
    def save_config(self):
        """حفظ الإعدادات في الملف"""
        try:
            # تشفير البيانات الحساسة قبل الحفظ
            config_to_save = self.config.copy()
            self._encrypt_config_for_save(config_to_save)
            
            with open(self.config_file, 'w', encoding='utf-8') as f:
                yaml.dump(config_to_save, f, default_flow_style=False, allow_unicode=True)
            
            self.console.print("[green]✅ Configuration saved successfully[/green]")
        except Exception as e:
            self.console.print(f"[red]❌ Error saving configuration: {e}[/red]")
    
    def _encrypt_config_for_save(self, config):
        """تشفير الإعدادات الحساسة للحفظ"""
        sensitive_fields = [
            'account.developer_token',
            'oauth2.client_secret',
            'oauth2.refresh_token'
        ]
        
        for field_path in sensitive_fields:
            try:
                keys = field_path.split('.')
                current = config
                for key in keys[:-1]:
                    current = current.get(key, {})
                
                if keys[-1] in current:
                    current[keys[-1]] = self.encrypt_sensitive_data(current[keys[-1]])
            except Exception:
                continue
