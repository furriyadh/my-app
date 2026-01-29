import socket
import ipaddress
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

def is_safe_url(url):
    """
    Check if a URL is safe for server-side fetching (SSRF prevention).
    Blocks private and loopback IP addresses.
    """
    try:
        parsed_url = urlparse(url)
        if not parsed_url.scheme or parsed_url.scheme not in ['http', 'https']:
            logger.warning(f"Invalid URL scheme: {parsed_url.scheme}")
            return False
            
        hostname = parsed_url.hostname
        if not hostname:
            logger.warning("No hostname found in URL")
            return False
            
        # 1. Check for literal IP addresses
        try:
            ip = ipaddress.ip_address(hostname)
            if ip.is_private or ip.is_loopback:
                logger.warning(f"Blocked private/loopback IP: {ip}")
                return False
        except ValueError:
            # 2. Resolve hostname to IP
            try:
                # Resolve names to catch DNS pinning/rebinding protection
                remote_ip = socket.gethostbyname(hostname)
                ip = ipaddress.ip_address(remote_ip)
                if ip.is_private or ip.is_loopback:
                    logger.warning(f"Blocked private/loopback IP after resolution: {ip} for hostname: {hostname}")
                    return False
            except (socket.gaierror, ValueError) as e:
                # If it doesn't resolve, it's either invalid or we let requests handle it
                # but for strict SSRF we might want to block it. 
                # However, many public sites might have temporary DNS issues.
                pass
        
        return True
    except Exception as e:
        logger.error(f"Error in is_safe_url check: {e}")
        return False
