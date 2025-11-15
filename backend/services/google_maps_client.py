"""
Google Maps Services Client - Direct implementation from @googlemaps/google-maps-services-js
Based on the official GitHub repository: https://github.com/googlemaps/google-maps-services-js
"""

import os
import requests
import json
import time
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from urllib.parse import urlencode
import logging

# Version from the original package.json
VERSION = "3.4.2"
DEFAULT_TIMEOUT = 10000  # milliseconds as in the original
USER_AGENT = f"google-maps-services-python-{VERSION}"

@dataclass
class ClientConfig:
    """Client configuration following the original library"""
    timeout: int = DEFAULT_TIMEOUT
    retry: bool = True
    retry_delay: int = 1000
    max_retries: int = 3

class GoogleMapsClient:
    """
    Google Maps Services Client - Direct implementation from @googlemaps/google-maps-services-js
    Following the exact same patterns and methods as the original TypeScript library
    """
    
    def __init__(self, config: Optional[ClientConfig] = None):
        self.config = config or ClientConfig()
        self.api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        self.base_url = "https://maps.googleapis.com/maps/api"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json'
        })
        
        # Retry configuration following the original library
        if self.config.retry:
            self.session.mount('https://', requests.adapters.HTTPAdapter(max_retries=self.config.max_retries))
    
    def _make_request(self, endpoint: str, params: Dict[str, Any], method: str = 'GET') -> Dict[str, Any]:
        """
        Make HTTP request following the original library pattern
        """
        params['key'] = self.api_key
        url = f"{self.base_url}/{endpoint}/json"
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params, timeout=self.config.timeout/1000)
            else:
                response = self.session.post(url, json=params, timeout=self.config.timeout/1000)
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logging.error(f"Error making request to {endpoint}: {e}")
            raise e
    
    def _retry_request(self, endpoint: str, params: Dict[str, Any], method: str = 'GET') -> Dict[str, Any]:
        """
        Retry request with exponential backoff following the original library
        """
        for attempt in range(self.config.max_retries):
            try:
                return self._make_request(endpoint, params, method)
            except requests.exceptions.RequestException as e:
                if attempt == self.config.max_retries - 1:
                    raise e
                
                delay = self.config.retry_delay * (2 ** attempt)
                logging.warning(f"Request failed, retrying in {delay}ms (attempt {attempt + 1})")
                time.sleep(delay / 1000)
        
        raise Exception("Max retries exceeded")
    
    # ===== DIRECTIONS API =====
    def directions(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Directions API - following the original library method signature
        """
        return self._retry_request("directions", params)
    
    # ===== DISTANCE MATRIX API =====
    def distancematrix(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Distance Matrix API - following the original library method signature
        """
        return self._retry_request("distancematrix", params)
    
    # ===== ELEVATION API =====
    def elevation(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Elevation API - following the original library method signature
        """
        return self._retry_request("elevation", params)
    
    # ===== GEOCODING API =====
    def geocode(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Geocoding API - following the original library method signature
        """
        return self._retry_request("geocode", params)
    
    def reverse_geocode(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Reverse Geocoding API - following the original library method signature
        """
        return self._retry_request("geocode", params)
    
    # ===== PLACES API =====
    def place_autocomplete(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Places Autocomplete API - following the original library method signature
        """
        return self._retry_request("place/autocomplete", params)
    
    def place_details(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Places Details API - following the original library method signature
        """
        return self._retry_request("place/details", params)
    
    def place_photo(self, params: Dict[str, Any]) -> bytes:
        """
        Places Photo API - following the original library method signature
        """
        params['key'] = self.api_key
        url = f"{self.base_url}/place/photo"
        
        response = self.session.get(url, params=params, timeout=self.config.timeout/1000)
        response.raise_for_status()
        return response.content
    
    def place_query_autocomplete(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Places Query Autocomplete API - following the original library method signature
        """
        return self._retry_request("place/queryautocomplete", params)
    
    def places_nearby(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Places Nearby API - following the original library method signature
        """
        return self._retry_request("place/nearbysearch", params)
    
    def text_search(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Places Text Search API - following the original library method signature
        """
        return self._retry_request("place/textsearch", params)
    
    def find_place_from_text(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Find Place from Text API - following the original library method signature
        """
        return self._retry_request("place/findplacefromtext", params)
    
    # ===== ROADS API =====
    def nearest_roads(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Nearest Roads API - following the original library method signature
        """
        return self._retry_request("roads/nearest", params)
    
    def snap_to_roads(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Snap to Roads API - following the original library method signature
        """
        return self._retry_request("roads/snap", params)
    
    # ===== TIME ZONE API =====
    def timezone(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Time Zone API - following the original library method signature
        """
        return self._retry_request("timezone", params)
    
    # ===== GEOLOCATION API =====
    def geolocate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Geolocation API - following the original library method signature
        """
        return self._retry_request("geolocate", params, method='POST')
    
    # ===== ENHANCED METHODS FOR OUR USE CASE =====
    def search_locations(self, query: str, types: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Enhanced search method combining multiple APIs
        """
        try:
            # Try Places Autocomplete first
            autocomplete_params = {
                'input': query,
                'types': types or '(regions)',
                'language': 'ar',
                'region': 'SA'
            }
            
            result = self.place_autocomplete(autocomplete_params)
            
            if result.get('status') == 'OK':
                predictions = result.get('predictions', [])
                return [
                    {
                        'place_id': pred.get('place_id'),
                        'description': pred.get('description'),
                        'structured_formatting': pred.get('structured_formatting', {}),
                        'types': pred.get('types', [])
                    }
                    for pred in predictions
                ]
            
            return []
            
        except Exception as e:
            logging.error(f"Error in search_locations: {e}")
            return []
    
    def get_location_details(self, place_id: str, fields: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
        """
        Enhanced location details method
        """
        try:
            details_params = {
                'place_id': place_id,
                'fields': ','.join(fields or ['name', 'formatted_address', 'geometry', 'address_components', 'types'])
            }
            
            result = self.place_details(details_params)
            
            if result.get('status') == 'OK' and result.get('result'):
                place = result['result']
                
                # Extract coordinates
                geometry = place.get('geometry', {})
                location = geometry.get('location', {})
                
                # Extract country information
                address_components = place.get('address_components', [])
                country_component = next(
                    (comp for comp in address_components if 'country' in comp.get('types', [])),
                    None
                )
                
                country_name = country_component.get('long_name', '') if country_component else ''
                country_code = country_component.get('short_name', '') if country_component else ''
                
                # Determine location type
                types = place.get('types', [])
                if 'country' in types:
                    location_type = 'country'
                elif 'locality' in types or 'administrative_area_level_1' in types:
                    location_type = 'city'
                else:
                    location_type = 'region'
                
                return {
                    'name': place.get('name', ''),
                    'formatted_address': place.get('formatted_address', ''),
                    'country': country_name,
                    'country_code': country_code,
                    'location_type': location_type,
                    'coordinates': {
                        'lat': location.get('lat', 0),
                        'lng': location.get('lng', 0)
                    },
                    'types': types
                }
            
            return None
            
        except Exception as e:
            logging.error(f"Error in get_location_details: {e}")
            return None
    
    def get_country_boundaries(self, country_name: str, country_code: str) -> Optional[Dict[str, Any]]:
        """
        Enhanced country boundaries method using multiple sources
        """
        try:
            # First try Natural Earth GeoJSON (high quality)
            natural_earth_url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
            
            response = self.session.get(natural_earth_url, timeout=5)
            if response.status_code == 200:
                world_data = response.json()
                
                # Find country feature
                country_feature = None
                logging.info(f"Searching for country: {country_name} ({country_code}) in {len(world_data.get('features', []))} features")
                
                for feature in world_data.get('features', []):
                    props = feature.get('properties', {})
                    # Log some examples for debugging
                    if props.get('NAME') and 'Egypt' in props.get('NAME', ''):
                        logging.info(f"Found Egypt-related feature: {props.get('NAME')} - {props.get('ADMIN')} - {props.get('ISO_A2')} - {props.get('ISO_A3')}")
                    
                    # More flexible matching for country names
                    name_match = (props.get('NAME') == country_name or 
                                 props.get('ADMIN') == country_name or
                                 country_name.lower() in props.get('NAME', '').lower() or
                                 country_name.lower() in props.get('ADMIN', '').lower())
                    
                    code_match = (props.get('ISO_A3') == country_code or
                                 props.get('ISO_A2') == country_code)
                    
                    # Special cases for common country names
                    special_match = False
                    country_lower = country_name.lower()
                    
                    if country_lower == 'egypt':
                        special_match = ('Egypt' in props.get('NAME', '') or 
                                       'Egypt' in props.get('ADMIN', '') or
                                       props.get('ISO_A2') == 'EG')
                    elif country_lower == 'saudi arabia':
                        special_match = ('Saudi Arabia' in props.get('NAME', '') or 
                                       'Saudi Arabia' in props.get('ADMIN', '') or
                                       props.get('ISO_A2') == 'SA')
                    elif country_lower == 'united states' or country_lower == 'usa':
                        special_match = ('United States' in props.get('NAME', '') or 
                                       'United States' in props.get('ADMIN', '') or
                                       props.get('ISO_A2') == 'US')
                    elif country_lower == 'united kingdom' or country_lower == 'uk':
                        special_match = ('United Kingdom' in props.get('NAME', '') or 
                                       'United Kingdom' in props.get('ADMIN', '') or
                                       props.get('ISO_A2') == 'GB')
                    elif country_lower == 'germany':
                        special_match = ('Germany' in props.get('NAME', '') or 
                                       'Germany' in props.get('ADMIN', '') or
                                       props.get('ISO_A2') == 'DE')
                    elif country_lower == 'france':
                        special_match = ('France' in props.get('NAME', '') or 
                                       'France' in props.get('ADMIN', '') or
                                       props.get('ISO_A2') == 'FR')
                    
                    if name_match or code_match or special_match:
                        country_feature = feature
                        logging.info(f"Found matching country feature: {props.get('NAME')} - {props.get('ADMIN')}")
                        break
                
                if country_feature:
                    logging.info(f"Successfully found country boundaries for {country_name}")
                    return {
                        'name': country_name,
                        'country_code': country_code,
                        'geometry': country_feature.get('geometry', {}),
                        'properties': country_feature.get('properties', {})
                    }
                else:
                    logging.warning(f"Country {country_name} ({country_code}) not found in Natural Earth GeoJSON")
            
            # Fallback to Google Maps Geocoding
            logging.info(f"Trying Google Maps Geocoding fallback for {country_name} ({country_code})")
            geocode_params = {
                'address': country_name,
                'components': f'country:{country_code}'
            }
            
            result = self.geocode(geocode_params)
            logging.info(f"Google Geocoding result: {result.get('status')} - {len(result.get('results', []))} results")
            if result.get('status') == 'OK' and result.get('results'):
                result_data = result['results'][0]
                geometry = result_data.get('geometry', {})
                bounds = geometry.get('viewport') or geometry.get('bounds')
                
                if bounds:
                    # Create simplified boundary from bounds
                    ne = bounds.get('northeast', {})
                    sw = bounds.get('southwest', {})
                    
                    # Create a polygon from bounds (simplified)
                    coordinates = [
                        [sw['lng'], ne['lat']],  # Top-left
                        [ne['lng'], ne['lat']],  # Top-right
                        [ne['lng'], sw['lat']],  # Bottom-right
                        [sw['lng'], sw['lat']],  # Bottom-left
                        [sw['lng'], ne['lat']]   # Close polygon (must be same as first point)
                    ]
                    
                    # Ensure the polygon is properly closed
                    if coordinates[0] != coordinates[-1]:
                        coordinates.append(coordinates[0])
                    
                    logging.info(f"Created boundary from Google Geocoding for {country_name}")
                    return {
                        'name': country_name,
                        'country_code': country_code,
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [coordinates]
                        },
                        'properties': {
                            'name': country_name,
                            'country_code': country_code
                        }
                    }
            
            # If all methods fail, return None to trigger frontend fallback
            logging.warning(f"All methods failed for {country_name}, returning None for frontend fallback")
            return None
            
        except Exception as e:
            logging.error(f"Error in get_country_boundaries: {e}")
            return None
    
    def health_check(self) -> Dict[str, Any]:
        """
        Health check method following the original library pattern
        """
        return {
            'status': 'healthy',
            'service': 'Google Maps API',
            'version': VERSION,
            'api_key_configured': bool(self.api_key),
            'user_agent': USER_AGENT,
            'timeout': self.config.timeout
        }

# Create global client instance following the original library pattern
client = GoogleMapsClient()
