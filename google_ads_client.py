#!/usr/bin/env python3
"""
Google Ads API client for fetching campaign data
"""

import yaml
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
import json
import sys
import os
from datetime import datetime, timedelta

def load_config():
    """Load Google Ads API configuration"""
    try:
        # Get the directory of the current script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        config_path = os.path.join(script_dir, "google-ads.yaml")
        
        with open(config_path, "r") as f:
            config = yaml.safe_load(f)
        return config
    except Exception as e:
        print(f"Error loading config: {e}")
        return None

def list_accessible_customers(mcc_customer_id):
    """List all accessible customer IDs under a given MCC ID"""
    config = load_config()
    if not config:
        return None

    try:
        client = GoogleAdsClient.load_from_dict(config)
        ga_service = client.get_service("GoogleAdsService")
        
        # Query to get direct client accounts under the MCC
        query = f"""
            SELECT
                customer_client.client_customer,
                customer_client.id,
                customer_client.descriptive_name
            FROM customer_client
            WHERE customer_client.manager = FALSE
        """
        
        # Execute the query against the MCC customer ID
        response = ga_service.search(customer_id=mcc_customer_id, query=query)
        
        client_customer_ids = []
        for row in response:
            # The client_customer field contains the resource name of the client customer
            # We need to extract the ID from the resource name
            client_id = str(row.customer_client.id)
            client_name = row.customer_client.descriptive_name
            client_customer_ids.append({"id": client_id, "name": client_name})
        
        return client_customer_ids

    except GoogleAdsException as ex:
        print(f"Request failed with status {ex.error.code().name} and includes the following errors:")
        for error in ex.failure.errors:
            print(f"\tError with message: {error.message}")
            if error.location:
                for field_path_element in error.location.field_path_elements:
                    print(f"\t\tOn field: {field_path_element.field_name}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def get_campaigns(customer_id, start_date, end_date):
    """Fetch campaigns data from Google Ads API"""
    config = load_config()
    if not config:
        return None
    
    try:
        # Initialize the Google Ads client
        client = GoogleAdsClient.load_from_dict(config)
        
        # Get the GoogleAdsService
        ga_service = client.get_service("GoogleAdsService")
        
        # Query to get campaigns with metrics
        query = f"""
            SELECT
                campaign.id,
                campaign.name,
                campaign.status,
                metrics.impressions,
                metrics.clicks,
                metrics.ctr,
                metrics.cost_micros,
                metrics.conversions,
                metrics.search_impression_share,
                metrics.search_top_impression_share,
                metrics.search_absolute_top_impression_share
            FROM campaign
            WHERE segments.date BETWEEN \'{start_date}\' AND \'{end_date}\'
            AND campaign.status = 'ENABLED'
        """
        
        # Execute the query
        response = ga_service.search(customer_id=customer_id, query=query)
        
        campaigns_data = []
        for row in response:
            campaign_data = {
                'id': row.campaign.id,
                'name': row.campaign.name,
                'status': row.campaign.status.name,
                'impressions': row.metrics.impressions,
                'clicks': row.metrics.clicks,
                'ctr': row.metrics.ctr,
                'cost': row.metrics.cost_micros / 1000000,  # Convert micros to currency
                'conversions': row.metrics.conversions,
                'search_impression_share': row.metrics.search_impression_share,
                'search_top_impression_share': row.metrics.search_top_impression_share,
                'search_absolute_top_impression_share': row.metrics.search_absolute_top_impression_share
            }
            campaigns_data.append(campaign_data)
        
        return campaigns_data
        
    except GoogleAdsException as ex:
        print(f"Request failed for customer {customer_id} with status {ex.error.code().name} and includes the following errors:")
        for error in ex.failure.errors:
            print(f"\tError with message: {error.message}")
            if error.location:
                for field_path_element in error.location.field_path_elements:
                    print(f"\t\tOn field: {field_path_element.field_name}")
        return None
    except Exception as e:
        print(f"An error occurred for customer {customer_id}: {e}")
        return None

def get_auction_insights(customer_id, start_date, end_date):
    """Fetch auction insights data from Google Ads API"""
    config = load_config()
    if not config:
        return None
    
    try:
        # Initialize the Google Ads client
        client = GoogleAdsClient.load_from_dict(config)
        
        # Get the GoogleAdsService
        ga_service = client.get_service("GoogleAdsService")
        
        # Query to get auction insights metrics
        query = f"""
            SELECT
                metrics.search_impression_share,
                metrics.search_top_impression_share,
                metrics.search_absolute_top_impression_share,
                metrics.search_rank_lost_impression_share,
                metrics.search_budget_lost_impression_share,
                metrics.search_exact_match_impression_share
            FROM campaign
            WHERE segments.date BETWEEN \'{start_date}\' AND \'{end_date}\'
            AND campaign.status = 'ENABLED'
        """
        
        # Execute the query
        response = ga_service.search(customer_id=customer_id, query=query)
        
        # Aggregate the data
        total_impression_share = 0
        total_top_impression_share = 0
        total_absolute_top_impression_share = 0
        total_rank_lost_impression_share = 0
        total_budget_lost_impression_share = 0
        total_exact_match_impression_share = 0
        count = 0
        
        for row in response:
            if row.metrics.search_impression_share > 0:
                total_impression_share += row.metrics.search_impression_share
                total_top_impression_share += row.metrics.search_top_impression_share
                total_absolute_top_impression_share += row.metrics.search_absolute_top_impression_share
                total_rank_lost_impression_share += row.metrics.search_rank_lost_impression_share
                total_budget_lost_impression_share += row.metrics.search_budget_lost_impression_share
                total_exact_match_impression_share += row.metrics.search_exact_match_impression_share
                count += 1
        
        if count > 0:
            auction_insights = {
                'impression_share': round((total_impression_share / count) * 100, 2),
                'top_impression_share': round((total_top_impression_share / count) * 100, 2),
                'absolute_top_impression_share': round((total_absolute_top_impression_share / count) * 100, 2),
                'rank_lost_impression_share': round((total_rank_lost_impression_share / count) * 100, 2),
                'budget_lost_impression_share': round((total_budget_lost_impression_share / count) * 100, 2),
                'exact_match_impression_share': round((total_exact_match_impression_share / count) * 100, 2)
            }
            return auction_insights
        else:
            return None
        
    except GoogleAdsException as ex:
        print(f"Request failed for customer {customer_id} with status {ex.error.code().name} and includes the following errors:")
        for error in ex.failure.errors:
            print(f"\tError with message: {error.message}")
            if error.location:
                for field_path_element in error.location.field_path_elements:
                    print(f"\t\tOn field: {field_path_element.field_name}")
        return None
    except Exception as e:
        print(f"An error occurred for customer {customer_id}: {e}")
        return None

def get_audience_demographics(customer_id, start_date, end_date):
    """Fetch audience demographics data from Google Ads API"""
    config = load_config()
    if not config:
        return None
    
    try:
        client = GoogleAdsClient.load_from_dict(config)
        ga_service = client.get_service("GoogleAdsService")

        # Query for age range demographics
        age_query = f"""
            SELECT
                age_range_view.resource_name,
                metrics.impressions,
                metrics.clicks,
                metrics.ctr
            FROM age_range_view
            WHERE segments.date BETWEEN \'{start_date}\' AND \'{end_date}\'
            AND campaign.status = 'ENABLED'
            AND ad_group.status = 'ENABLED'
        """
        age_response = ga_service.search(customer_id=customer_id, query=age_query)

        age_demographics_data = []
        for row in age_response:
            age_demographics_data.append({
                'age_range': row.age_range_view.resource_name.split('/')[-1] if row.age_range_view.resource_name else 'UNKNOWN',
                'impressions': row.metrics.impressions,
                'clicks': row.metrics.clicks,
                'ctr': row.metrics.ctr
            })

        # Query for gender demographics
        gender_query = f"""
            SELECT
                gender_view.resource_name,
                metrics.impressions,
                metrics.clicks,
                metrics.ctr
            FROM gender_view
            WHERE segments.date BETWEEN \'{start_date}\' AND \'{end_date}\'
            AND campaign.status = 'ENABLED'
            AND ad_group.status = 'ENABLED'
        """
        gender_response = ga_service.search(customer_id=customer_id, query=gender_query)

        gender_demographics_data = []
        for row in gender_response:
            gender_demographics_data.append({
                'gender': row.gender_view.resource_name.split('/')[-1] if row.gender_view.resource_name else 'UNKNOWN',
                'impressions': row.metrics.impressions,
                'clicks': row.metrics.clicks,
                'ctr': row.metrics.ctr
            })

        return {
            'age_demographics': age_demographics_data,
            'gender_demographics': gender_demographics_data
        }

    except GoogleAdsException as ex:
        print(f"Request failed for customer {customer_id} with status {ex.error.code().name} and includes the following errors:")
        for error in ex.failure.errors:
            print(f"\tError with message: {error.message}")
            if error.location:
                for field_path_element in error.location.field_path_elements:
                    print(f"\t\tOn field: {field_path_element.field_name}")
        return None
    except Exception as e:
        print(f"An error occurred for customer {customer_id}: {e}")
        return None

def pull_all_client_data(mcc_customer_id, start_date, end_date):
    """Pulls all data for all client accounts under the given MCC ID"""
    client_accounts = list_accessible_customers(mcc_customer_id)
    if not client_accounts:
        print(f"No client accounts found under MCC: {mcc_customer_id}")
        return

    print(f"Found {len(client_accounts)} client accounts under MCC {mcc_customer_id}. Pulling data...")

    for client_info in client_accounts:
        client_id = client_info["id"]
        client_name = client_info["name"].replace(" ", "_").replace("/", "_") # Sanitize name for filename
        print(f"\n--- Pulling data for client: {client_name} ({client_id}) ---")

        # Pull Campaigns data
        campaigns_data = get_campaigns(client_id, start_date, end_date)
        if campaigns_data:
            with open(f"/home/ubuntu/data/{client_id}_{client_name}_campaigns.json", "w") as f:
                json.dump(campaigns_data, f, indent=2)
            print(f"Saved campaigns data for {client_id} to /home/ubuntu/data/{client_id}_{client_name}_campaigns.json")
        else:
            print(f"No campaigns data retrieved for {client_id}")

        # Pull Auction Insights data
        auction_insights_data = get_auction_insights(client_id, start_date, end_date)
        if auction_insights_data:
            with open(f"/home/ubuntu/data/{client_id}_{client_name}_auction_insights.json", "w") as f:
                json.dump(auction_insights_data, f, indent=2)
            print(f"Saved auction insights data for {client_id} to /home/ubuntu/data/{client_id}_{client_name}_auction_insights.json")
        else:
            print(f"No auction insights data retrieved for {client_id}")

        # Pull Audience Demographics data
        audience_demographics_data = get_audience_demographics(client_id, start_date, end_date)
        if audience_demographics_data:
            with open(f"/home/ubuntu/data/{client_id}_{client_name}_audience_demographics.json", "w") as f:
                json.dump(audience_demographics_data, f, indent=2)
            print(f"Saved audience demographics data for {client_id} to /home/ubuntu/data/{client_id}_{client_name}_audience_demographics.json")
        else:
            print(f"No audience demographics data retrieved for {client_id}")


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: python google_ads_client.py <customer_id> <data_type> <start_date> <end_date>")
        print("data_type: campaigns, auction_insights, audience_demographics, list_clients, or all_clients_data")
        print("Date format: YYYY-MM-DD")
        sys.exit(1)
    
    customer_id = sys.argv[1]
    data_type = sys.argv[2]
    start_date = sys.argv[3]
    end_date = sys.argv[4]
    
    if data_type == "campaigns":
        data = get_campaigns(customer_id, start_date, end_date)
        if data:
            print(json.dumps(data, indent=2))
        else:
            print("No data retrieved")
    elif data_type == "auction_insights":
        data = get_auction_insights(customer_id, start_date, end_date)
        if data:
            print(json.dumps(data, indent=2))
        else:
            print("No data retrieved")
    elif data_type == "audience_demographics":
        data = get_audience_demographics(customer_id, start_date, end_date)
        if data:
            print(json.dumps(data, indent=2))
        else:
            print("No data retrieved")
    elif data_type == "list_clients":
        # This will be called with MCC ID as customer_id
        data = list_accessible_customers(customer_id)
        if data:
            print(json.dumps(data, indent=2))
        else:
            print("No data retrieved")
    elif data_type == "all_clients_data":
        # This will be called with MCC ID as customer_id
        pull_all_client_data(customer_id, start_date, end_date)
    else:
        print("Invalid data_type. Use 'campaigns', 'auction_insights', 'audience_demographics', 'list_clients', or 'all_clients_data'")
        sys.exit(1)
