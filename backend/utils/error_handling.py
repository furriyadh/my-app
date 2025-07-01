import logging
from typing import Dict
import pybreaker
from google.ads.googleads.errors import GoogleAdsException

class GoogleAdsCircuitBreaker(pybreaker.CircuitBreaker):
    """Circuit Breaker مخصص لـ Google Ads API"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logging.getLogger("GoogleAdsFetcher")

    def call(self, func, *args, **kwargs):
        try:
            return super().call(func, *args, **kwargs)
        except pybreaker.CircuitBreakerError:
            self.logger.error("Circuit breaker is OPEN! Preventing further calls to Google Ads API.")
            raise
        except Exception as e:
            self.logger.error(f"Call failed, attempting to break circuit: {e}")
            self.fail()
            raise

class ErrorHandler:
    """معالج الأخطاء مع إعادة المحاولة الذكية"""
    def __init__(self, config: Dict, logger: logging.Logger):
        self.config = config
        self.logger = logger
        self.max_retries = self.config.get("error_handling.max_retry_attempts", 5)
        self.initial_delay = self.config.get("error_handling.initial_retry_delay_seconds", 1)
        self.max_delay = self.config.get("error_handling.max_retry_delay_seconds", 300)
        self.retry_on_errors = self.config.get("error_handling.retry_on_errors", [])
        self.circuit_breaker_enabled = self.config.get("circuit_breaker.enabled", False)
        
        if self.circuit_breaker_enabled:
            self.circuit_breaker = GoogleAdsCircuitBreaker(
                fail_max=self.config.get("circuit_breaker.failure_threshold", 5),
                reset_timeout=self.config.get("circuit_breaker.recovery_timeout_seconds", 300),
                exclude=[GoogleAdsException] # لا تكسر الدائرة إذا كان الخطأ من GoogleAdsException
            )
        else:
            self.circuit_breaker = None # يجب تهيئته بقيمة None إذا لم يكن مفعلاً

    def handle_error(self, func, *args, **kwargs):
        """معالجة الأخطاء مع إعادة المحاولة"""
        retries = 0
        while retries < self.max_retries:
            try:
                if self.circuit_breaker_enabled and self.circuit_breaker:
                    return self.circuit_breaker.call(func, *args, **kwargs)
                else:
                    return func(*args, **kwargs)
            except Exception as e:
                self.logger.error(f"Attempt {retries + 1} failed: {e}")
                retries += 1
                if retries < self.max_retries:
                    delay = min(self.initial_delay * (2 ** (retries - 1)), self.max_delay)
                    self.logger.info(f"Retrying in {delay} seconds...")
                    import time
                    time.sleep(delay)
                else:
                    self.logger.error("Max retries exceeded.")
                    raise
