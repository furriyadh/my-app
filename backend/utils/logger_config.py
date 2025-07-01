import logging
import logging.handlers
from pathlib import Path
from typing import Dict
from datetime import datetime
from rich.console import Console
from rich.logging import RichHandler

class LoggerManager:
    """مدير التسجيل المتقدم مع دعم الملفات و Rich Console"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger("GoogleAdsFetcher")
        self.logger.setLevel(self._get_log_level())
        self.console = Console()
        self._setup_handlers()

    def _get_log_level(self):
        """الحصول على مستوى التسجيل من الإعدادات"""
        level_str = self.config.get("logging.level", "INFO").upper()
        return getattr(logging, level_str, logging.INFO)

    def _setup_handlers(self):
        """إعداد معالجات التسجيل (ملف وكونسول)"""
        # إزالة المعالجات الموجودة لتجنب التكرار
        if self.logger.handlers:
            for handler in self.logger.handlers[:]:
                self.logger.removeHandler(handler)
                handler.close()

        # معالج الملف
        log_dir = Path("logs")
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file = log_dir / f"google_ads_fetcher_{datetime.now().strftime("%Y%m%d")}.log"
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10 * 1024 * 1024,  # 10 MB
            backupCount=5,
            encoding="utf-8"
        )
        file_formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        file_handler.setFormatter(file_formatter)
        self.logger.addHandler(file_handler)

        # معالج الكونسول (Rich Console)
        console_handler = RichHandler(console=self.console, show_time=True, show_level=True, show_path=False)
        console_formatter = logging.Formatter(
            "%(message)s"
        )
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)

    def get_logger(self):
        """إرجاع كائن المسجل"""
        return self.logger
