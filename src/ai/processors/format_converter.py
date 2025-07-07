# Google Ads AI Platform - Format Converter
# Advanced data format conversion and standardization

import logging
import asyncio
import re
import json
import csv
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import pandas as pd
import numpy as np
from io import StringIO, BytesIO

logger = logging.getLogger(__name__)

class DataFormat(Enum):
    """Supported data formats"""
    JSON = "json"
    CSV = "csv"
    XML = "xml"
    EXCEL = "excel"
    GOOGLE_ADS_API = "google_ads_api"
    FACEBOOK_ADS = "facebook_ads"
    MICROSOFT_ADS = "microsoft_ads"
    PLAIN_TEXT = "plain_text"
    HTML = "html"
    YAML = "yaml"

class ConversionType(Enum):
    """Types of conversions"""
    CAMPAIGN_DATA = "campaign_data"
    KEYWORD_DATA = "keyword_data"
    AD_DATA = "ad_data"
    PERFORMANCE_DATA = "performance_data"
    AUDIENCE_DATA = "audience_data"
    BUSINESS_DATA = "business_data"

@dataclass
class ConversionResult:
    """Format conversion result"""
    success: bool
    source_format: DataFormat
    target_format: DataFormat
    conversion_type: ConversionType
    converted_data: Any
    metadata: Dict[str, Any]
    errors: List[str]
    warnings: List[str]
    conversion_time: float
    timestamp: str

class FormatConverter:
    """
    Advanced data format conversion engine
    
    Converts data between various formats:
    - JSON ↔ CSV ↔ XML ↔ Excel
    - Google Ads API format
    - Facebook Ads format
    - Microsoft Ads format
    - Custom business formats
    - Performance data formats
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize format converter"""
        self.config = config or {}
        
        # Conversion configuration
        self.conversion_config = {
            "preserve_types": self.config.get("preserve_types", True),
            "handle_nulls": self.config.get("handle_nulls", True),
            "validate_output": self.config.get("validate_output", True),
            "encoding": self.config.get("encoding", "utf-8"),
            "date_format": self.config.get("date_format", "%Y-%m-%d"),
            "decimal_places": self.config.get("decimal_places", 2),
            "max_file_size": self.config.get("max_file_size", 100 * 1024 * 1024)  # 100MB
        }
        
        # Google Ads API field mappings
        self.google_ads_mappings = {
            "campaign": {
                "name": "campaign.name",
                "status": "campaign.status",
                "budget": "campaign_budget.amount_micros",
                "bidding_strategy": "campaign.bidding_strategy_type",
                "start_date": "campaign.start_date",
                "end_date": "campaign.end_date"
            },
            "ad_group": {
                "name": "ad_group.name",
                "status": "ad_group.status",
                "cpc_bid": "ad_group.cpc_bid_micros",
                "campaign_id": "ad_group.campaign"
            },
            "keyword": {
                "text": "ad_group_criterion.keyword.text",
                "match_type": "ad_group_criterion.keyword.match_type",
                "bid": "ad_group_criterion.cpc_bid_micros",
                "status": "ad_group_criterion.status"
            },
            "ad": {
                "headlines": "ad.responsive_search_ad.headlines",
                "descriptions": "ad.responsive_search_ad.descriptions",
                "path1": "ad.responsive_search_ad.path1",
                "path2": "ad.responsive_search_ad.path2",
                "status": "ad.status"
            }
        }
        
        # Facebook Ads field mappings
        self.facebook_ads_mappings = {
            "campaign": {
                "name": "name",
                "objective": "objective",
                "status": "status",
                "daily_budget": "daily_budget",
                "lifetime_budget": "lifetime_budget"
            },
            "adset": {
                "name": "name",
                "campaign_id": "campaign_id",
                "targeting": "targeting",
                "billing_event": "billing_event",
                "optimization_goal": "optimization_goal"
            },
            "ad": {
                "name": "name",
                "adset_id": "adset_id",
                "creative": "creative",
                "status": "status"
            }
        }
        
        # Microsoft Ads field mappings
        self.microsoft_ads_mappings = {
            "campaign": {
                "name": "Name",
                "status": "Status",
                "budget_type": "BudgetType",
                "daily_budget": "DailyBudget",
                "campaign_type": "CampaignType"
            },
            "ad_group": {
                "name": "Name",
                "campaign_name": "CampaignName",
                "status": "Status",
                "cpc_bid": "CpcBid"
            },
            "keyword": {
                "text": "Keyword",
                "match_type": "MatchType",
                "bid": "Bid",
                "status": "Status"
            }
        }
        
        # Conversion statistics
        self.conversion_stats = {
            "total_conversions": 0,
            "successful_conversions": 0,
            "failed_conversions": 0,
            "average_conversion_time": 0.0,
            "formats_converted": {}
        }
    
    async def convert_data(self,
                          data: Any,
                          source_format: DataFormat,
                          target_format: DataFormat,
                          conversion_type: ConversionType = ConversionType.CAMPAIGN_DATA,
                          options: Dict[str, Any] = None) -> ConversionResult:
        """
        Convert data from one format to another
        
        Args:
            data: Source data to convert
            source_format: Source data format
            target_format: Target data format
            conversion_type: Type of data being converted
            options: Additional conversion options
            
        Returns:
            ConversionResult with converted data
        """
        start_time = datetime.now()
        errors = []
        warnings = []
        
        try:
            logger.info(f"Converting {conversion_type.value} from {source_format.value} to {target_format.value}")
            
            # Validate input data
            validation_result = await self._validate_input_data(data, source_format)
            if not validation_result["valid"]:
                errors.extend(validation_result["errors"])
                warnings.extend(validation_result["warnings"])
            
            # Parse source data
            parsed_data = await self._parse_source_data(data, source_format)
            
            # Normalize data structure
            normalized_data = await self._normalize_data_structure(
                parsed_data, conversion_type
            )
            
            # Apply format-specific transformations
            transformed_data = await self._apply_format_transformations(
                normalized_data, source_format, target_format, conversion_type
            )
            
            # Convert to target format
            converted_data = await self._convert_to_target_format(
                transformed_data, target_format, options or {}
            )
            
            # Validate output
            if self.conversion_config["validate_output"]:
                output_validation = await self._validate_output_data(
                    converted_data, target_format
                )
                if not output_validation["valid"]:
                    warnings.extend(output_validation["warnings"])
            
            # Calculate conversion time
            conversion_time = (datetime.now() - start_time).total_seconds()
            
            # Create result
            result = ConversionResult(
                success=len(errors) == 0,
                source_format=source_format,
                target_format=target_format,
                conversion_type=conversion_type,
                converted_data=converted_data,
                metadata={
                    "source_size": self._calculate_data_size(data),
                    "target_size": self._calculate_data_size(converted_data),
                    "conversion_options": options or {},
                    "data_quality": self._assess_conversion_quality(parsed_data, converted_data)
                },
                errors=errors,
                warnings=warnings,
                conversion_time=conversion_time,
                timestamp=datetime.now().isoformat()
            )
            
            # Update statistics
            self.conversion_stats["total_conversions"] += 1
            if result.success:
                self.conversion_stats["successful_conversions"] += 1
            else:
                self.conversion_stats["failed_conversions"] += 1
            
            self._update_average_conversion_time(conversion_time)
            self._update_format_stats(source_format, target_format)
            
            logger.info(f"Conversion completed in {conversion_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Data conversion failed: {str(e)}")
            conversion_time = (datetime.now() - start_time).total_seconds()
            
            return ConversionResult(
                success=False,
                source_format=source_format,
                target_format=target_format,
                conversion_type=conversion_type,
                converted_data=None,
                metadata={},
                errors=[f"Conversion failed: {str(e)}"],
                warnings=warnings,
                conversion_time=conversion_time,
                timestamp=datetime.now().isoformat()
            )
    
    async def convert_to_google_ads_format(self,
                                         campaign_data: Dict[str, Any],
                                         entity_type: str = "campaign") -> Dict[str, Any]:
        """
        Convert data to Google Ads API format
        
        Args:
            campaign_data: Campaign data to convert
            entity_type: Type of entity (campaign, ad_group, keyword, ad)
            
        Returns:
            Data in Google Ads API format
        """
        try:
            logger.info(f"Converting to Google Ads format: {entity_type}")
            
            if entity_type not in self.google_ads_mappings:
                raise ValueError(f"Unsupported entity type: {entity_type}")
            
            mappings = self.google_ads_mappings[entity_type]
            google_ads_data = {}
            
            for source_field, target_field in mappings.items():
                if source_field in campaign_data:
                    value = campaign_data[source_field]
                    
                    # Apply Google Ads specific transformations
                    if "micros" in target_field and isinstance(value, (int, float)):
                        # Convert to micros (multiply by 1,000,000)
                        value = int(value * 1_000_000)
                    elif target_field.endswith(".status"):
                        # Normalize status values
                        value = self._normalize_google_ads_status(value)
                    elif target_field.endswith(".match_type"):
                        # Normalize match type values
                        value = self._normalize_google_ads_match_type(value)
                    
                    # Set nested field value
                    self._set_nested_field(google_ads_data, target_field, value)
            
            logger.info(f"Google Ads format conversion completed for {entity_type}")
            return google_ads_data
            
        except Exception as e:
            logger.error(f"Google Ads format conversion failed: {str(e)}")
            return {}
    
    async def convert_to_facebook_ads_format(self,
                                           campaign_data: Dict[str, Any],
                                           entity_type: str = "campaign") -> Dict[str, Any]:
        """
        Convert data to Facebook Ads format
        
        Args:
            campaign_data: Campaign data to convert
            entity_type: Type of entity (campaign, adset, ad)
            
        Returns:
            Data in Facebook Ads format
        """
        try:
            logger.info(f"Converting to Facebook Ads format: {entity_type}")
            
            if entity_type not in self.facebook_ads_mappings:
                raise ValueError(f"Unsupported entity type: {entity_type}")
            
            mappings = self.facebook_ads_mappings[entity_type]
            facebook_ads_data = {}
            
            for source_field, target_field in mappings.items():
                if source_field in campaign_data:
                    value = campaign_data[source_field]
                    
                    # Apply Facebook Ads specific transformations
                    if target_field == "objective":
                        value = self._normalize_facebook_objective(value)
                    elif target_field == "optimization_goal":
                        value = self._normalize_facebook_optimization_goal(value)
                    elif target_field in ["daily_budget", "lifetime_budget"]:
                        # Facebook budget is in cents
                        value = int(value * 100) if isinstance(value, (int, float)) else value
                    
                    facebook_ads_data[target_field] = value
            
            logger.info(f"Facebook Ads format conversion completed for {entity_type}")
            return facebook_ads_data
            
        except Exception as e:
            logger.error(f"Facebook Ads format conversion failed: {str(e)}")
            return {}
    
    async def convert_to_csv(self,
                           data: Union[List[Dict], Dict[str, Any]],
                           options: Dict[str, Any] = None) -> str:
        """
        Convert data to CSV format
        
        Args:
            data: Data to convert
            options: CSV conversion options
            
        Returns:
            CSV formatted string
        """
        try:
            logger.info("Converting data to CSV format")
            
            options = options or {}
            delimiter = options.get("delimiter", ",")
            include_headers = options.get("include_headers", True)
            
            # Convert to DataFrame for easier CSV generation
            if isinstance(data, list):
                df = pd.DataFrame(data)
            elif isinstance(data, dict):
                # Flatten nested dictionaries
                flattened_data = self._flatten_dict(data)
                df = pd.DataFrame([flattened_data])
            else:
                raise ValueError("Data must be a list of dictionaries or a dictionary")
            
            # Handle null values
            if self.conversion_config["handle_nulls"]:
                df = df.fillna("")
            
            # Convert to CSV
            csv_buffer = StringIO()
            df.to_csv(
                csv_buffer,
                sep=delimiter,
                index=False,
                header=include_headers,
                encoding=self.conversion_config["encoding"]
            )
            
            csv_content = csv_buffer.getvalue()
            csv_buffer.close()
            
            logger.info("CSV conversion completed")
            return csv_content
            
        except Exception as e:
            logger.error(f"CSV conversion failed: {str(e)}")
            return ""
    
    async def convert_to_json(self,
                            data: Any,
                            options: Dict[str, Any] = None) -> str:
        """
        Convert data to JSON format
        
        Args:
            data: Data to convert
            options: JSON conversion options
            
        Returns:
            JSON formatted string
        """
        try:
            logger.info("Converting data to JSON format")
            
            options = options or {}
            indent = options.get("indent", 2)
            sort_keys = options.get("sort_keys", False)
            
            # Handle special data types
            def json_serializer(obj):
                if isinstance(obj, datetime):
                    return obj.isoformat()
                elif isinstance(obj, np.integer):
                    return int(obj)
                elif isinstance(obj, np.floating):
                    return float(obj)
                elif isinstance(obj, np.ndarray):
                    return obj.tolist()
                elif hasattr(obj, '__dict__'):
                    return obj.__dict__
                return str(obj)
            
            json_content = json.dumps(
                data,
                indent=indent,
                sort_keys=sort_keys,
                default=json_serializer,
                ensure_ascii=False
            )
            
            logger.info("JSON conversion completed")
            return json_content
            
        except Exception as e:
            logger.error(f"JSON conversion failed: {str(e)}")
            return ""
    
    async def convert_to_xml(self,
                           data: Union[Dict, List],
                           root_name: str = "data",
                           options: Dict[str, Any] = None) -> str:
        """
        Convert data to XML format
        
        Args:
            data: Data to convert
            root_name: Name of the root XML element
            options: XML conversion options
            
        Returns:
            XML formatted string
        """
        try:
            logger.info("Converting data to XML format")
            
            options = options or {}
            encoding = options.get("encoding", self.conversion_config["encoding"])
            
            # Create root element
            root = ET.Element(root_name)
            
            # Convert data to XML elements
            if isinstance(data, list):
                for i, item in enumerate(data):
                    item_element = ET.SubElement(root, f"item_{i}")
                    self._dict_to_xml(item, item_element)
            elif isinstance(data, dict):
                self._dict_to_xml(data, root)
            else:
                root.text = str(data)
            
            # Convert to string
            xml_content = ET.tostring(
                root,
                encoding=encoding,
                method="xml"
            ).decode(encoding)
            
            # Add XML declaration
            xml_declaration = f'<?xml version="1.0" encoding="{encoding}"?>\n'
            xml_content = xml_declaration + xml_content
            
            logger.info("XML conversion completed")
            return xml_content
            
        except Exception as e:
            logger.error(f"XML conversion failed: {str(e)}")
            return ""
    
    async def convert_to_excel(self,
                             data: Union[List[Dict], Dict[str, List[Dict]]],
                             options: Dict[str, Any] = None) -> bytes:
        """
        Convert data to Excel format
        
        Args:
            data: Data to convert
            options: Excel conversion options
            
        Returns:
            Excel file as bytes
        """
        try:
            logger.info("Converting data to Excel format")
            
            options = options or {}
            sheet_name = options.get("sheet_name", "Sheet1")
            include_index = options.get("include_index", False)
            
            # Create Excel buffer
            excel_buffer = BytesIO()
            
            with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
                if isinstance(data, list):
                    # Single sheet with list of dictionaries
                    df = pd.DataFrame(data)
                    df.to_excel(writer, sheet_name=sheet_name, index=include_index)
                    
                elif isinstance(data, dict):
                    # Multiple sheets or single sheet with dictionary
                    if all(isinstance(v, list) for v in data.values()):
                        # Multiple sheets
                        for sheet, sheet_data in data.items():
                            df = pd.DataFrame(sheet_data)
                            df.to_excel(writer, sheet_name=sheet, index=include_index)
                    else:
                        # Single sheet with flattened dictionary
                        flattened_data = self._flatten_dict(data)
                        df = pd.DataFrame([flattened_data])
                        df.to_excel(writer, sheet_name=sheet_name, index=include_index)
            
            excel_content = excel_buffer.getvalue()
            excel_buffer.close()
            
            logger.info("Excel conversion completed")
            return excel_content
            
        except Exception as e:
            logger.error(f"Excel conversion failed: {str(e)}")
            return b""
    
    async def _validate_input_data(self,
                                 data: Any,
                                 source_format: DataFormat) -> Dict[str, Any]:
        """Validate input data"""
        errors = []
        warnings = []
        
        try:
            # Check data size
            data_size = self._calculate_data_size(data)
            if data_size > self.conversion_config["max_file_size"]:
                errors.append(f"Data size ({data_size} bytes) exceeds maximum ({self.conversion_config['max_file_size']} bytes)")
            
            # Format-specific validation
            if source_format == DataFormat.JSON:
                if isinstance(data, str):
                    try:
                        json.loads(data)
                    except json.JSONDecodeError as e:
                        errors.append(f"Invalid JSON format: {str(e)}")
                elif not isinstance(data, (dict, list)):
                    warnings.append("JSON data should be a dictionary or list")
            
            elif source_format == DataFormat.CSV:
                if isinstance(data, str):
                    try:
                        pd.read_csv(StringIO(data))
                    except Exception as e:
                        errors.append(f"Invalid CSV format: {str(e)}")
            
            return {
                "valid": len(errors) == 0,
                "errors": errors,
                "warnings": warnings
            }
            
        except Exception as e:
            return {
                "valid": False,
                "errors": [f"Validation failed: {str(e)}"],
                "warnings": warnings
            }
    
    async def _parse_source_data(self, data: Any, source_format: DataFormat) -> Any:
        """Parse source data based on format"""
        try:
            if source_format == DataFormat.JSON:
                if isinstance(data, str):
                    return json.loads(data)
                return data
            
            elif source_format == DataFormat.CSV:
                if isinstance(data, str):
                    return pd.read_csv(StringIO(data)).to_dict('records')
                return data
            
            elif source_format == DataFormat.XML:
                if isinstance(data, str):
                    root = ET.fromstring(data)
                    return self._xml_to_dict(root)
                return data
            
            elif source_format == DataFormat.EXCEL:
                if isinstance(data, bytes):
                    df = pd.read_excel(BytesIO(data))
                    return df.to_dict('records')
                return data
            
            else:
                return data
                
        except Exception as e:
            logger.error(f"Source data parsing failed: {str(e)}")
            return data
    
    async def _normalize_data_structure(self,
                                      data: Any,
                                      conversion_type: ConversionType) -> Any:
        """Normalize data structure based on conversion type"""
        try:
            if conversion_type == ConversionType.CAMPAIGN_DATA:
                return self._normalize_campaign_structure(data)
            elif conversion_type == ConversionType.KEYWORD_DATA:
                return self._normalize_keyword_structure(data)
            elif conversion_type == ConversionType.AD_DATA:
                return self._normalize_ad_structure(data)
            elif conversion_type == ConversionType.PERFORMANCE_DATA:
                return self._normalize_performance_structure(data)
            else:
                return data
                
        except Exception as e:
            logger.error(f"Data structure normalization failed: {str(e)}")
            return data
    
    def _normalize_campaign_structure(self, data: Any) -> Any:
        """Normalize campaign data structure"""
        if isinstance(data, dict):
            normalized = {
                "campaign_id": data.get("id") or data.get("campaign_id"),
                "name": data.get("name") or data.get("campaign_name"),
                "status": data.get("status"),
                "budget": data.get("budget") or data.get("daily_budget"),
                "bidding_strategy": data.get("bidding_strategy") or data.get("bid_strategy"),
                "start_date": data.get("start_date"),
                "end_date": data.get("end_date"),
                "targeting": data.get("targeting"),
                "ad_groups": data.get("ad_groups") or data.get("adgroups"),
                "keywords": data.get("keywords"),
                "ads": data.get("ads")
            }
            return {k: v for k, v in normalized.items() if v is not None}
        return data
    
    def _normalize_keyword_structure(self, data: Any) -> Any:
        """Normalize keyword data structure"""
        if isinstance(data, list):
            normalized_keywords = []
            for keyword in data:
                if isinstance(keyword, dict):
                    normalized = {
                        "keyword_id": keyword.get("id") or keyword.get("keyword_id"),
                        "text": keyword.get("text") or keyword.get("keyword"),
                        "match_type": keyword.get("match_type") or keyword.get("type"),
                        "bid": keyword.get("bid") or keyword.get("cpc_bid"),
                        "status": keyword.get("status"),
                        "quality_score": keyword.get("quality_score"),
                        "ad_group_id": keyword.get("ad_group_id") or keyword.get("adgroup_id")
                    }
                    normalized_keywords.append({k: v for k, v in normalized.items() if v is not None})
            return normalized_keywords
        return data
    
    def _normalize_ad_structure(self, data: Any) -> Any:
        """Normalize ad data structure"""
        if isinstance(data, dict):
            normalized = {
                "ad_id": data.get("id") or data.get("ad_id"),
                "type": data.get("type") or data.get("ad_type"),
                "status": data.get("status"),
                "headlines": data.get("headlines") or data.get("headline"),
                "descriptions": data.get("descriptions") or data.get("description"),
                "paths": data.get("paths") or data.get("display_url"),
                "final_url": data.get("final_url") or data.get("landing_page"),
                "ad_group_id": data.get("ad_group_id") or data.get("adgroup_id")
            }
            return {k: v for k, v in normalized.items() if v is not None}
        return data
    
    def _normalize_performance_structure(self, data: Any) -> Any:
        """Normalize performance data structure"""
        if isinstance(data, dict):
            normalized = {
                "date": data.get("date") or data.get("day"),
                "impressions": data.get("impressions"),
                "clicks": data.get("clicks"),
                "conversions": data.get("conversions"),
                "cost": data.get("cost") or data.get("spend"),
                "ctr": data.get("ctr") or data.get("click_through_rate"),
                "cpc": data.get("cpc") or data.get("cost_per_click"),
                "conversion_rate": data.get("conversion_rate"),
                "cost_per_conversion": data.get("cost_per_conversion")
            }
            return {k: v for k, v in normalized.items() if v is not None}
        return data
    
    async def _apply_format_transformations(self,
                                          data: Any,
                                          source_format: DataFormat,
                                          target_format: DataFormat,
                                          conversion_type: ConversionType) -> Any:
        """Apply format-specific transformations"""
        try:
            # Apply source format cleanup
            if source_format == DataFormat.CSV:
                data = self._clean_csv_data(data)
            elif source_format == DataFormat.EXCEL:
                data = self._clean_excel_data(data)
            
            # Apply target format preparation
            if target_format == DataFormat.GOOGLE_ADS_API:
                data = await self._prepare_for_google_ads(data, conversion_type)
            elif target_format == DataFormat.FACEBOOK_ADS:
                data = await self._prepare_for_facebook_ads(data, conversion_type)
            elif target_format == DataFormat.MICROSOFT_ADS:
                data = await self._prepare_for_microsoft_ads(data, conversion_type)
            
            return data
            
        except Exception as e:
            logger.error(f"Format transformation failed: {str(e)}")
            return data
    
    def _clean_csv_data(self, data: Any) -> Any:
        """Clean CSV-specific data issues"""
        if isinstance(data, list):
            cleaned_data = []
            for row in data:
                if isinstance(row, dict):
                    cleaned_row = {}
                    for key, value in row.items():
                        # Clean column names
                        clean_key = str(key).strip().replace(' ', '_').lower()
                        # Handle null values
                        if pd.isna(value) or value == '':
                            cleaned_row[clean_key] = None
                        else:
                            cleaned_row[clean_key] = value
                    cleaned_data.append(cleaned_row)
            return cleaned_data
        return data
    
    def _clean_excel_data(self, data: Any) -> Any:
        """Clean Excel-specific data issues"""
        if isinstance(data, list):
            cleaned_data = []
            for row in data:
                if isinstance(row, dict):
                    cleaned_row = {}
                    for key, value in row.items():
                        # Handle Excel date formats
                        if isinstance(value, pd.Timestamp):
                            cleaned_row[key] = value.strftime(self.conversion_config["date_format"])
                        elif pd.isna(value):
                            cleaned_row[key] = None
                        else:
                            cleaned_row[key] = value
                    cleaned_data.append(cleaned_row)
            return cleaned_data
        return data
    
    async def _prepare_for_google_ads(self, data: Any, conversion_type: ConversionType) -> Any:
        """Prepare data for Google Ads API format"""
        if conversion_type == ConversionType.CAMPAIGN_DATA:
            return await self.convert_to_google_ads_format(data, "campaign")
        elif conversion_type == ConversionType.KEYWORD_DATA:
            if isinstance(data, list):
                return [await self.convert_to_google_ads_format(item, "keyword") for item in data]
        elif conversion_type == ConversionType.AD_DATA:
            return await self.convert_to_google_ads_format(data, "ad")
        return data
    
    async def _prepare_for_facebook_ads(self, data: Any, conversion_type: ConversionType) -> Any:
        """Prepare data for Facebook Ads format"""
        if conversion_type == ConversionType.CAMPAIGN_DATA:
            return await self.convert_to_facebook_ads_format(data, "campaign")
        elif conversion_type == ConversionType.AD_DATA:
            return await self.convert_to_facebook_ads_format(data, "ad")
        return data
    
    async def _prepare_for_microsoft_ads(self, data: Any, conversion_type: ConversionType) -> Any:
        """Prepare data for Microsoft Ads format"""
        # Similar to Google Ads but with Microsoft-specific field mappings
        return data
    
    async def _convert_to_target_format(self,
                                      data: Any,
                                      target_format: DataFormat,
                                      options: Dict[str, Any]) -> Any:
        """Convert data to target format"""
        try:
            if target_format == DataFormat.JSON:
                return await self.convert_to_json(data, options)
            elif target_format == DataFormat.CSV:
                return await self.convert_to_csv(data, options)
            elif target_format == DataFormat.XML:
                root_name = options.get("root_name", "data")
                return await self.convert_to_xml(data, root_name, options)
            elif target_format == DataFormat.EXCEL:
                return await self.convert_to_excel(data, options)
            elif target_format in [DataFormat.GOOGLE_ADS_API, DataFormat.FACEBOOK_ADS, DataFormat.MICROSOFT_ADS]:
                return data  # Already converted in transformation step
            else:
                return data
                
        except Exception as e:
            logger.error(f"Target format conversion failed: {str(e)}")
            return data
    
    async def _validate_output_data(self,
                                  data: Any,
                                  target_format: DataFormat) -> Dict[str, Any]:
        """Validate output data"""
        warnings = []
        
        try:
            if target_format == DataFormat.JSON:
                if isinstance(data, str):
                    try:
                        json.loads(data)
                    except json.JSONDecodeError:
                        warnings.append("Output JSON is not valid")
            
            elif target_format == DataFormat.CSV:
                if isinstance(data, str):
                    try:
                        pd.read_csv(StringIO(data))
                    except Exception:
                        warnings.append("Output CSV is not valid")
            
            elif target_format == DataFormat.XML:
                if isinstance(data, str):
                    try:
                        ET.fromstring(data)
                    except ET.ParseError:
                        warnings.append("Output XML is not valid")
            
            return {
                "valid": len(warnings) == 0,
                "warnings": warnings
            }
            
        except Exception as e:
            return {
                "valid": False,
                "warnings": [f"Output validation failed: {str(e)}"]
            }
    
    def _flatten_dict(self, data: Dict[str, Any], parent_key: str = "", sep: str = "_") -> Dict[str, Any]:
        """Flatten nested dictionary"""
        items = []
        for key, value in data.items():
            new_key = f"{parent_key}{sep}{key}" if parent_key else key
            if isinstance(value, dict):
                items.extend(self._flatten_dict(value, new_key, sep).items())
            elif isinstance(value, list) and value and isinstance(value[0], dict):
                for i, item in enumerate(value):
                    items.extend(self._flatten_dict(item, f"{new_key}_{i}", sep).items())
            else:
                items.append((new_key, value))
        return dict(items)
    
    def _dict_to_xml(self, data: Dict[str, Any], parent: ET.Element):
        """Convert dictionary to XML elements"""
        for key, value in data.items():
            # Clean key name for XML
            clean_key = re.sub(r'[^a-zA-Z0-9_]', '_', str(key))
            
            if isinstance(value, dict):
                child = ET.SubElement(parent, clean_key)
                self._dict_to_xml(value, child)
            elif isinstance(value, list):
                for i, item in enumerate(value):
                    child = ET.SubElement(parent, f"{clean_key}_{i}")
                    if isinstance(item, dict):
                        self._dict_to_xml(item, child)
                    else:
                        child.text = str(item)
            else:
                child = ET.SubElement(parent, clean_key)
                child.text = str(value) if value is not None else ""
    
    def _xml_to_dict(self, element: ET.Element) -> Dict[str, Any]:
        """Convert XML element to dictionary"""
        result = {}
        
        # Add attributes
        if element.attrib:
            result.update(element.attrib)
        
        # Add text content
        if element.text and element.text.strip():
            if len(element) == 0:  # No children
                return element.text.strip()
            result['text'] = element.text.strip()
        
        # Add children
        for child in element:
            child_data = self._xml_to_dict(child)
            if child.tag in result:
                if not isinstance(result[child.tag], list):
                    result[child.tag] = [result[child.tag]]
                result[child.tag].append(child_data)
            else:
                result[child.tag] = child_data
        
        return result
    
    def _set_nested_field(self, data: Dict[str, Any], field_path: str, value: Any):
        """Set value in nested dictionary using dot notation"""
        keys = field_path.split('.')
        current = data
        
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        current[keys[-1]] = value
    
    def _normalize_google_ads_status(self, status: str) -> str:
        """Normalize status for Google Ads"""
        status_mapping = {
            "active": "ENABLED",
            "enabled": "ENABLED",
            "paused": "PAUSED",
            "disabled": "PAUSED",
            "removed": "REMOVED",
            "deleted": "REMOVED"
        }
        return status_mapping.get(str(status).lower(), "ENABLED")
    
    def _normalize_google_ads_match_type(self, match_type: str) -> str:
        """Normalize match type for Google Ads"""
        match_type_mapping = {
            "exact": "EXACT",
            "phrase": "PHRASE",
            "broad": "BROAD",
            "broad_match": "BROAD",
            "modified_broad": "BROAD"
        }
        return match_type_mapping.get(str(match_type).lower(), "BROAD")
    
    def _normalize_facebook_objective(self, objective: str) -> str:
        """Normalize objective for Facebook Ads"""
        objective_mapping = {
            "traffic": "LINK_CLICKS",
            "conversions": "CONVERSIONS",
            "leads": "LEAD_GENERATION",
            "awareness": "BRAND_AWARENESS",
            "reach": "REACH",
            "engagement": "ENGAGEMENT",
            "app_installs": "APP_INSTALLS"
        }
        return objective_mapping.get(str(objective).lower(), "LINK_CLICKS")
    
    def _normalize_facebook_optimization_goal(self, goal: str) -> str:
        """Normalize optimization goal for Facebook Ads"""
        goal_mapping = {
            "clicks": "LINK_CLICKS",
            "conversions": "CONVERSIONS",
            "impressions": "IMPRESSIONS",
            "reach": "REACH",
            "landing_page_views": "LANDING_PAGE_VIEWS"
        }
        return goal_mapping.get(str(goal).lower(), "LINK_CLICKS")
    
    def _calculate_data_size(self, data: Any) -> int:
        """Calculate approximate data size in bytes"""
        try:
            if isinstance(data, str):
                return len(data.encode('utf-8'))
            elif isinstance(data, bytes):
                return len(data)
            elif isinstance(data, (dict, list)):
                return len(json.dumps(data, default=str).encode('utf-8'))
            else:
                return len(str(data).encode('utf-8'))
        except Exception:
            return 0
    
    def _assess_conversion_quality(self, source_data: Any, target_data: Any) -> Dict[str, Any]:
        """Assess conversion quality"""
        try:
            quality_metrics = {
                "data_preservation": 1.0,
                "structure_integrity": 1.0,
                "type_consistency": 1.0,
                "completeness": 1.0
            }
            
            # Simple quality assessment
            if isinstance(source_data, dict) and isinstance(target_data, dict):
                source_keys = set(source_data.keys())
                target_keys = set(target_data.keys()) if isinstance(target_data, dict) else set()
                
                if source_keys and target_keys:
                    quality_metrics["completeness"] = len(target_keys & source_keys) / len(source_keys)
            
            overall_quality = sum(quality_metrics.values()) / len(quality_metrics)
            quality_metrics["overall"] = overall_quality
            
            return quality_metrics
            
        except Exception as e:
            logger.error(f"Quality assessment failed: {str(e)}")
            return {"overall": 0.5}
    
    def _update_average_conversion_time(self, conversion_time: float):
        """Update average conversion time"""
        total = self.conversion_stats["total_conversions"]
        current_avg = self.conversion_stats["average_conversion_time"]
        
        new_avg = ((current_avg * (total - 1)) + conversion_time) / total
        self.conversion_stats["average_conversion_time"] = new_avg
    
    def _update_format_stats(self, source_format: DataFormat, target_format: DataFormat):
        """Update format conversion statistics"""
        conversion_key = f"{source_format.value}_to_{target_format.value}"
        if conversion_key not in self.conversion_stats["formats_converted"]:
            self.conversion_stats["formats_converted"][conversion_key] = 0
        self.conversion_stats["formats_converted"][conversion_key] += 1
    
    def get_conversion_statistics(self) -> Dict[str, Any]:
        """Get conversion statistics"""
        return self.conversion_stats.copy()
    
    def reset_statistics(self):
        """Reset conversion statistics"""
        self.conversion_stats = {
            "total_conversions": 0,
            "successful_conversions": 0,
            "failed_conversions": 0,
            "average_conversion_time": 0.0,
            "formats_converted": {}
        }
        logger.info("Conversion statistics reset")

