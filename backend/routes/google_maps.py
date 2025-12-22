"""
Google Maps API Routes - Direct implementation from @googlemaps/google-maps-services-js
Based on the official GitHub repository: https://github.com/googlemaps/google-maps-services-js
"""

from flask import Blueprint, request, jsonify
from services.google_maps_client import client
import logging

# Create blueprint
google_maps_bp = Blueprint('google_maps', __name__)

@google_maps_bp.route('/api/google-maps/search', methods=['POST'])
def search_locations():
    """
    Search for locations using Google Places Autocomplete
    Following the JS library pattern
    """
    try:
        data = request.get_json()
        query = data.get('query', '')
        types = data.get('types')
        
        if not query:
            return jsonify({"error": "Query parameter is required"}), 400
        
        results = client.search_locations(query, types)
        
        return jsonify({
            "status": "success",
            "results": results,
            "count": len(results)
        })
        
    except Exception as e:
        logging.error(f"Error in search_locations: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/details/<place_id>', methods=['GET'])
def get_location_details(place_id):
    """
    Get detailed information about a location
    Following the JS library pattern
    """
    try:
        if not place_id:
            return jsonify({"error": "Place ID is required"}), 400
        
        details = client.get_location_details(place_id)
        
        if details:
            return jsonify({
                "status": "success",
                "result": details
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Location not found"
            }), 404
            
    except Exception as e:
        logging.error(f"Error in get_location_details: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/geocode', methods=['POST'])
def geocode_address():
    """
    Geocode an address
    Following the JS library pattern
    """
    try:
        data = request.get_json()
        address = data.get('address', '')
        country_code = data.get('country_code')
        
        if not address:
            return jsonify({"error": "Address parameter is required"}), 400
        
        result = client.geocode({'address': address, 'components': f'country:{country_code}' if country_code else None})
        
        return jsonify({
            "status": "success",
            "result": result
        })
        
    except Exception as e:
        logging.error(f"Error in geocode_address: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/country-boundaries', methods=['POST'])
def get_country_boundaries():
    """
    Get country boundaries
    Following the enhanced pattern from the JS library
    """
    try:
        data = request.get_json()
        country_name = data.get('country_name', '')
        country_code = data.get('country_code', '')
        place_id = data.get('place_id', '')
        
        # If place_id is provided, get country info from it first
        if place_id and not country_name:
            try:
                place_details = client.get_location_details(place_id)
                if place_details:
                    country_name = place_details.get('country', '')
                    country_code = place_details.get('country_code', '')
                    logging.info(f"Got country info from place_id {place_id}: {country_name} ({country_code})")
            except Exception as e:
                logging.warning(f"Could not get place details for {place_id}: {e}")
        
        # Log the request parameters
        logging.info(f"Country boundaries request: name='{country_name}', code='{country_code}', place_id='{place_id}'")
        
        if not country_name and not country_code:
            return jsonify({"error": "Country name, code, or place_id is required"}), 400
        
        boundaries = client.get_country_boundaries(country_name, country_code)
        
        if boundaries:
            return jsonify({
                "status": "success",
                "result": {
                    "name": boundaries.get('name'),
                    "country_code": boundaries.get('country_code'),
                    "geometry": boundaries.get('geometry'),
                    "properties": boundaries.get('properties')
                }
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Country boundaries not found"
            }), 404
            
    except Exception as e:
        logging.error(f"Error in get_country_boundaries: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    Following the JS library pattern
    """
    try:
        return jsonify(client.health_check())
        
    except Exception as e:
        logging.error(f"Error in health_check: {e}")
        return jsonify({"error": str(e)}), 500

# ===== ADDITIONAL APIs FROM THE ORIGINAL LIBRARY =====

@google_maps_bp.route('/api/google-maps/directions', methods=['POST'])
def directions():
    """
    Directions API - following the original library method signature
    """
    try:
        data = request.get_json()
        result = client.directions(data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        logging.error(f"Error in directions: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/distancematrix', methods=['POST'])
def distance_matrix():
    """
    Distance Matrix API - following the original library method signature
    """
    try:
        data = request.get_json()
        result = client.distancematrix(data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        logging.error(f"Error in distance_matrix: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/elevation', methods=['POST'])
def elevation():
    """
    Elevation API - following the original library method signature
    """
    try:
        data = request.get_json()
        result = client.elevation(data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        logging.error(f"Error in elevation: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/places/autocomplete', methods=['POST'])
def place_autocomplete():
    """
    Places Autocomplete API - following the original library method signature
    """
    try:
        data = request.get_json()
        result = client.place_autocomplete(data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        logging.error(f"Error in place_autocomplete: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/places/details', methods=['POST'])
def place_details():
    """
    Places Details API - following the original library method signature
    """
    try:
        data = request.get_json()
        result = client.place_details(data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        logging.error(f"Error in place_details: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/places/nearby', methods=['POST'])
def places_nearby():
    """
    Places Nearby API - following the original library method signature
    """
    try:
        data = request.get_json()
        result = client.places_nearby(data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        logging.error(f"Error in places_nearby: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/places/textsearch', methods=['POST'])
def text_search():
    """
    Places Text Search API - following the original library method signature
    """
    try:
        data = request.get_json()
        result = client.text_search(data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        logging.error(f"Error in text_search: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/timezone', methods=['POST'])
def timezone():
    """
    Time Zone API - following the original library method signature
    """
    try:
        data = request.get_json()
        result = client.timezone(data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        logging.error(f"Error in timezone: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/roads/nearest', methods=['POST'])
def nearest_roads():
    """
    Nearest Roads API - following the original library method signature
    """
    try:
        data = request.get_json()
        result = client.nearest_roads(data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        logging.error(f"Error in nearest_roads: {e}")
        return jsonify({"error": str(e)}), 500

@google_maps_bp.route('/api/google-maps/roads/snap', methods=['POST'])
def snap_to_roads():
    """
    Snap to Roads API - following the original library method signature
    """
    try:
        data = request.get_json()
        result = client.snap_to_roads(data)
        return jsonify({"status": "success", "result": result})
    except Exception as e:
        logging.error(f"Error in snap_to_roads: {e}")
        return jsonify({"error": str(e)}), 500
