# Google Ads AI Platform - Business Information Extractor
# Extract business information from websites for Google Ads campaigns

import re
import logging
from typing import Dict, Any, List, Optional, Set
from bs4 import BeautifulSoup, Tag
from urllib.parse import urlparse
import json

from .config import ScrapeConfig

logger = logging.getLogger(__name__)

class BusinessInfoExtractor:
    """
    Business information extraction from websites
    
    Extracts comprehensive business information including:
    - Company name and description
    - Contact information (phone, email, address)
    - Business hours and location
    - Services and products offered
    - Social media profiles
    - Business category and industry
    - Team and about information
    """
    
    def __init__(self, config: ScrapeConfig):
        """Initialize business info extractor with configuration"""
        self.config = config
        
        # Phone number patterns (international formats)
        self.phone_patterns = [
            r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',  # US format
            r'\+?([0-9]{1,4})[-.\s]?([0-9]{1,4})[-.\s]?([0-9]{1,4})[-.\s]?([0-9]{1,4})',  # International
            r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',  # Simple US format
            r'\b\d{10,15}\b'  # Simple number format
        ]
        
        # Email patterns
        self.email_patterns = [
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        ]
        
        # Address patterns
        self.address_patterns = [
            r'\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Circle|Cir|Court|Ct|Place|Pl)',
            r'\d+\s+[A-Za-z0-9\s,.-]+,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}',  # US format
            r'[A-Za-z0-9\s,.-]+,\s*[A-Za-z\s]+\s*\d{5}[-\d]*'  # Postal code format
        ]
        
        # Business hour patterns
        self.hours_patterns = [
            r'(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)[\s:]*(?:\d{1,2}:\d{2}|\d{1,2})\s*(?:AM|PM|am|pm)?[\s-]*(?:to|-)?\s*(?:\d{1,2}:\d{2}|\d{1,2})\s*(?:AM|PM|am|pm)?',
            r'(?:Open|Hours?)[\s:]*(?:\d{1,2}:\d{2}|\d{1,2})\s*(?:AM|PM|am|pm)?[\s-]*(?:to|-)?\s*(?:\d{1,2}:\d{2}|\d{1,2})\s*(?:AM|PM|am|pm)?'
        ]
        
        # Social media domains
        self.social_domains = {
            'facebook.com': 'facebook',
            'twitter.com': 'twitter',
            'instagram.com': 'instagram',
            'linkedin.com': 'linkedin',
            'youtube.com': 'youtube',
            'tiktok.com': 'tiktok',
            'pinterest.com': 'pinterest',
            'snapchat.com': 'snapchat'
        }
        
        # Business category keywords
        self.business_categories = {
            'restaurant': ['restaurant', 'cafe', 'diner', 'bistro', 'eatery', 'food', 'dining', 'kitchen', 'grill', 'bar'],
            'retail': ['shop', 'store', 'boutique', 'market', 'retail', 'shopping', 'merchandise', 'goods'],
            'healthcare': ['doctor', 'clinic', 'hospital', 'medical', 'health', 'dental', 'pharmacy', 'therapy'],
            'professional_services': ['lawyer', 'attorney', 'accountant', 'consultant', 'advisor', 'agency', 'firm'],
            'beauty': ['salon', 'spa', 'beauty', 'hair', 'nail', 'massage', 'cosmetic', 'skincare'],
            'automotive': ['auto', 'car', 'vehicle', 'repair', 'garage', 'mechanic', 'dealership'],
            'real_estate': ['real estate', 'property', 'realtor', 'homes', 'housing', 'rental'],
            'education': ['school', 'university', 'college', 'education', 'training', 'course', 'academy'],
            'technology': ['software', 'tech', 'IT', 'computer', 'digital', 'web', 'app', 'development'],
            'fitness': ['gym', 'fitness', 'workout', 'exercise', 'training', 'sports', 'yoga', 'pilates']
        }
    
    async def extract_business_info(self, soup: BeautifulSoup, url: str) -> Dict[str, Any]:
        """
        Extract comprehensive business information from webpage
        
        Args:
            soup: BeautifulSoup object of the HTML page
            url: Website URL
            
        Returns:
            Dictionary containing business information
        """
        try:
            logger.info("Starting business information extraction")
            
            business_info = {
                "url": url,
                "extraction_timestamp": __import__('time').time()
            }
            
            # Extract basic business information
            business_info["name"] = await self._extract_business_name(soup, url)
            business_info["description"] = await self._extract_business_description(soup)
            business_info["category"] = await self._determine_business_category(soup)
            
            # Extract contact information
            contact_info = await self._extract_contact_info(soup)
            business_info["contact_info"] = contact_info
            
            # Extract location information
            location_info = await self._extract_location_info(soup)
            business_info["location_info"] = location_info
            
            # Extract business hours
            business_info["business_hours"] = await self._extract_business_hours(soup)
            
            # Extract services/products
            business_info["services"] = await self._extract_services(soup)
            business_info["products"] = await self._extract_products_overview(soup)
            
            # Extract social media profiles
            business_info["social_media"] = await self._extract_social_media(soup)
            
            # Extract team/about information
            business_info["about"] = await self._extract_about_info(soup)
            business_info["team"] = await self._extract_team_info(soup)
            
            # Extract structured business data
            structured_data = await self._extract_structured_business_data(soup)
            if structured_data:
                business_info["structured_data"] = structured_data
            
            # Calculate completeness score
            business_info["completeness_score"] = self._calculate_completeness_score(business_info)
            
            # Generate business summary
            business_info["summary"] = self._generate_business_summary(business_info)
            
            logger.info("Business information extraction completed")
            return business_info
            
        except Exception as e:
            logger.error(f"Business information extraction failed: {str(e)}")
            return {"error": str(e)}
    
    async def _extract_business_name(self, soup: BeautifulSoup, url: str) -> str:
        """Extract business name from various sources"""
        try:
            # Priority order for business name extraction
            name_sources = [
                # 1. Structured data
                lambda: self._get_structured_data_field(soup, 'name'),
                # 2. Meta tags
                lambda: self._get_meta_content(soup, 'og:site_name'),
                lambda: self._get_meta_content(soup, 'application-name'),
                # 3. Title tag (cleaned)
                lambda: self._clean_business_name_from_title(soup.find('title')),
                # 4. Logo alt text
                lambda: self._get_logo_alt_text(soup),
                # 5. Header text
                lambda: self._get_header_business_name(soup),
                # 6. Domain name (fallback)
                lambda: self._extract_name_from_domain(url)
            ]
            
            for source in name_sources:
                try:
                    name = source()
                    if name and len(name.strip()) > 1:
                        return name.strip()
                except Exception:
                    continue
            
            return ""
            
        except Exception as e:
            logger.error(f"Business name extraction failed: {str(e)}")
            return ""
    
    async def _extract_business_description(self, soup: BeautifulSoup) -> str:
        """Extract business description"""
        try:
            # Priority order for description extraction
            description_sources = [
                # 1. Meta description
                lambda: self._get_meta_content(soup, 'description'),
                lambda: self._get_meta_content(soup, 'og:description'),
                # 2. Structured data description
                lambda: self._get_structured_data_field(soup, 'description'),
                # 3. About section
                lambda: self._get_about_section_text(soup),
                # 4. First paragraph in main content
                lambda: self._get_first_main_paragraph(soup),
                # 5. Header subtitle
                lambda: self._get_header_subtitle(soup)
            ]
            
            for source in description_sources:
                try:
                    description = source()
                    if description and len(description.strip()) > 20:
                        return description.strip()
                except Exception:
                    continue
            
            return ""
            
        except Exception as e:
            logger.error(f"Business description extraction failed: {str(e)}")
            return ""
    
    async def _extract_contact_info(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract contact information"""
        try:
            contact_info = {
                "phones": [],
                "emails": [],
                "addresses": [],
                "website": "",
                "contact_page": ""
            }
            
            # Get all text content
            text_content = soup.get_text()
            
            # Extract phone numbers
            for pattern in self.phone_patterns:
                matches = re.findall(pattern, text_content, re.IGNORECASE)
                for match in matches:
                    if isinstance(match, tuple):
                        phone = ''.join(match)
                    else:
                        phone = match
                    
                    # Clean and validate phone number
                    phone = re.sub(r'[^\d+]', '', phone)
                    if len(phone) >= 10:
                        contact_info["phones"].append(phone)
            
            # Extract email addresses
            for pattern in self.email_patterns:
                matches = re.findall(pattern, text_content, re.IGNORECASE)
                contact_info["emails"].extend(matches)
            
            # Extract addresses
            for pattern in self.address_patterns:
                matches = re.findall(pattern, text_content, re.IGNORECASE)
                contact_info["addresses"].extend(matches)
            
            # Look for contact page links
            contact_links = soup.find_all('a', href=True)
            for link in contact_links:
                href = link.get('href', '').lower()
                text = link.get_text().lower()
                if any(keyword in href or keyword in text for keyword in ['contact', 'reach', 'touch']):
                    contact_info["contact_page"] = link.get('href')
                    break
            
            # Remove duplicates
            contact_info["phones"] = list(set(contact_info["phones"]))
            contact_info["emails"] = list(set(contact_info["emails"]))
            contact_info["addresses"] = list(set(contact_info["addresses"]))
            
            return contact_info
            
        except Exception as e:
            logger.error(f"Contact info extraction failed: {str(e)}")
            return {}
    
    async def _extract_location_info(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract location and geographic information"""
        try:
            location_info = {
                "addresses": [],
                "city": "",
                "state": "",
                "country": "",
                "postal_code": "",
                "coordinates": {},
                "service_areas": []
            }
            
            # Extract from structured data
            structured_location = self._get_structured_location_data(soup)
            if structured_location:
                location_info.update(structured_location)
            
            # Extract from text content
            text_content = soup.get_text()
            
            # Extract city, state, country patterns
            location_patterns = [
                r'\b([A-Z][a-z]+),\s*([A-Z]{2})\s*(\d{5})\b',  # City, State ZIP
                r'\b([A-Z][a-z]+),\s*([A-Z][a-z]+)\b',  # City, State/Country
                r'\bserving\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',  # Service areas
                r'\blocated\s+in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b'  # Located in
            ]
            
            for pattern in location_patterns:
                matches = re.findall(pattern, text_content)
                for match in matches:
                    if isinstance(match, tuple) and len(match) >= 2:
                        if not location_info["city"]:
                            location_info["city"] = match[0]
                        if not location_info["state"] and len(match) > 1:
                            location_info["state"] = match[1]
                        if len(match) > 2 and match[2].isdigit():
                            location_info["postal_code"] = match[2]
            
            # Extract service areas
            service_area_keywords = ['serving', 'coverage', 'areas', 'locations', 'cities']
            for keyword in service_area_keywords:
                pattern = rf'\b{keyword}\s+([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*)\b'
                matches = re.findall(pattern, text_content, re.IGNORECASE)
                for match in matches:
                    areas = [area.strip() for area in match.split(',')]
                    location_info["service_areas"].extend(areas)
            
            # Remove duplicates
            location_info["service_areas"] = list(set(location_info["service_areas"]))
            
            return location_info
            
        except Exception as e:
            logger.error(f"Location info extraction failed: {str(e)}")
            return {}
    
    async def _extract_business_hours(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract business hours"""
        try:
            business_hours = {}
            text_content = soup.get_text()
            
            # Look for structured hours data first
            structured_hours = self._get_structured_hours_data(soup)
            if structured_hours:
                return structured_hours
            
            # Extract from text using patterns
            for pattern in self.hours_patterns:
                matches = re.findall(pattern, text_content, re.IGNORECASE)
                for match in matches:
                    # Parse the match to extract day and hours
                    hours_text = match if isinstance(match, str) else ' '.join(match)
                    parsed_hours = self._parse_hours_text(hours_text)
                    business_hours.update(parsed_hours)
            
            # Look for common hours sections
            hours_sections = soup.find_all(['div', 'section', 'span'], 
                                         class_=re.compile(r'hours?|time|schedule', re.I))
            for section in hours_sections:
                section_text = section.get_text()
                parsed_hours = self._parse_hours_text(section_text)
                business_hours.update(parsed_hours)
            
            return business_hours
            
        except Exception as e:
            logger.error(f"Business hours extraction failed: {str(e)}")
            return {}
    
    async def _extract_services(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract services offered"""
        try:
            services = []
            
            # Look for services sections
            service_sections = soup.find_all(['div', 'section', 'ul'], 
                                           class_=re.compile(r'service|offering|what.*do', re.I))
            
            for section in service_sections:
                # Extract list items
                list_items = section.find_all('li')
                for item in list_items:
                    service_text = item.get_text(strip=True)
                    if len(service_text) > 5:
                        services.append({
                            "name": service_text,
                            "description": "",
                            "category": "service"
                        })
                
                # Extract from headings and paragraphs
                headings = section.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                for heading in headings:
                    heading_text = heading.get_text(strip=True)
                    if len(heading_text) > 5 and len(heading_text) < 100:
                        # Look for description in next sibling
                        description = ""
                        next_elem = heading.find_next_sibling(['p', 'div'])
                        if next_elem:
                            description = next_elem.get_text(strip=True)[:200]
                        
                        services.append({
                            "name": heading_text,
                            "description": description,
                            "category": "service"
                        })
            
            # Remove duplicates
            seen_services = set()
            unique_services = []
            for service in services:
                service_key = service["name"].lower()
                if service_key not in seen_services:
                    seen_services.add(service_key)
                    unique_services.append(service)
            
            return unique_services[:20]  # Limit to top 20 services
            
        except Exception as e:
            logger.error(f"Services extraction failed: {str(e)}")
            return []
    
    async def _extract_products_overview(self, soup: BeautifulSoup) -> List[str]:
        """Extract general product categories/types"""
        try:
            products = []
            
            # Look for product-related sections
            product_sections = soup.find_all(['div', 'section'], 
                                           class_=re.compile(r'product|item|catalog|inventory', re.I))
            
            for section in product_sections:
                # Extract category names from headings
                headings = section.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                for heading in headings:
                    heading_text = heading.get_text(strip=True)
                    if len(heading_text) > 3 and len(heading_text) < 50:
                        products.append(heading_text)
            
            # Look for navigation menu items that might indicate product categories
            nav_items = soup.find_all(['nav', 'ul'], class_=re.compile(r'menu|nav', re.I))
            for nav in nav_items:
                links = nav.find_all('a')
                for link in links:
                    link_text = link.get_text(strip=True)
                    if any(keyword in link_text.lower() for keyword in ['product', 'shop', 'store', 'catalog']):
                        products.append(link_text)
            
            # Remove duplicates and clean
            products = list(set([p for p in products if len(p) > 2]))
            return products[:15]  # Limit to top 15 product categories
            
        except Exception as e:
            logger.error(f"Products overview extraction failed: {str(e)}")
            return []
    
    async def _extract_social_media(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract social media profiles"""
        try:
            social_media = {}
            
            # Find all links
            links = soup.find_all('a', href=True)
            
            for link in links:
                href = link.get('href', '')
                
                # Check if link matches social media domains
                for domain, platform in self.social_domains.items():
                    if domain in href:
                        social_media[platform] = href
                        break
            
            return social_media
            
        except Exception as e:
            logger.error(f"Social media extraction failed: {str(e)}")
            return {}
    
    async def _extract_about_info(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract about/company information"""
        try:
            about_info = {
                "company_story": "",
                "mission": "",
                "values": [],
                "founded": "",
                "employees": "",
                "certifications": []
            }
            
            # Look for about sections
            about_sections = soup.find_all(['div', 'section'], 
                                         class_=re.compile(r'about|company|story|mission', re.I))
            
            for section in about_sections:
                section_text = section.get_text(strip=True)
                
                # Extract company story (longest paragraph)
                if len(section_text) > len(about_info["company_story"]):
                    about_info["company_story"] = section_text[:500]
                
                # Look for mission statement
                if any(keyword in section_text.lower() for keyword in ['mission', 'purpose', 'goal']):
                    about_info["mission"] = section_text[:300]
                
                # Extract founding year
                year_match = re.search(r'\b(19|20)\d{2}\b', section_text)
                if year_match and not about_info["founded"]:
                    about_info["founded"] = year_match.group()
            
            return about_info
            
        except Exception as e:
            logger.error(f"About info extraction failed: {str(e)}")
            return {}
    
    async def _extract_team_info(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extract team member information"""
        try:
            team_members = []
            
            # Look for team sections
            team_sections = soup.find_all(['div', 'section'], 
                                        class_=re.compile(r'team|staff|member|employee', re.I))
            
            for section in team_sections:
                # Look for individual team member cards/divs
                member_cards = section.find_all(['div', 'article'], 
                                              class_=re.compile(r'member|person|staff', re.I))
                
                for card in member_cards:
                    member_info = {
                        "name": "",
                        "title": "",
                        "bio": ""
                    }
                    
                    # Extract name (usually in heading)
                    name_elem = card.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                    if name_elem:
                        member_info["name"] = name_elem.get_text(strip=True)
                    
                    # Extract title (usually in span or small text)
                    title_elem = card.find(['span', 'small', 'em'], 
                                         class_=re.compile(r'title|position|role', re.I))
                    if title_elem:
                        member_info["title"] = title_elem.get_text(strip=True)
                    
                    # Extract bio (paragraph text)
                    bio_elem = card.find('p')
                    if bio_elem:
                        member_info["bio"] = bio_elem.get_text(strip=True)[:200]
                    
                    if member_info["name"]:
                        team_members.append(member_info)
            
            return team_members[:10]  # Limit to top 10 team members
            
        except Exception as e:
            logger.error(f"Team info extraction failed: {str(e)}")
            return []
    
    async def _extract_structured_business_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract structured business data (JSON-LD, microdata)"""
        try:
            structured_data = {}
            
            # Extract JSON-LD data
            json_ld_scripts = soup.find_all('script', type='application/ld+json')
            for script in json_ld_scripts:
                try:
                    if script.string:
                        data = json.loads(script.string.strip())
                        
                        # Look for business-related schema types
                        if isinstance(data, dict):
                            schema_type = data.get('@type', '').lower()
                            if any(biz_type in schema_type for biz_type in 
                                  ['organization', 'localbusiness', 'corporation', 'company']):
                                structured_data['json_ld'] = data
                                break
                        elif isinstance(data, list):
                            for item in data:
                                if isinstance(item, dict):
                                    schema_type = item.get('@type', '').lower()
                                    if any(biz_type in schema_type for biz_type in 
                                          ['organization', 'localbusiness', 'corporation']):
                                        structured_data['json_ld'] = item
                                        break
                except json.JSONDecodeError:
                    continue
            
            # Extract microdata
            business_microdata = soup.find(attrs={'itemtype': re.compile(r'schema\.org.*(Organization|LocalBusiness)', re.I)})
            if business_microdata:
                microdata = {}
                props = business_microdata.find_all(attrs={'itemprop': True})
                for prop in props:
                    prop_name = prop.get('itemprop')
                    prop_value = prop.get('content') or prop.get_text(strip=True)
                    if prop_name and prop_value:
                        microdata[prop_name] = prop_value
                
                if microdata:
                    structured_data['microdata'] = microdata
            
            return structured_data
            
        except Exception as e:
            logger.error(f"Structured business data extraction failed: {str(e)}")
            return {}
    
    async def _determine_business_category(self, soup: BeautifulSoup) -> str:
        """Determine business category based on content"""
        try:
            text_content = soup.get_text().lower()
            title = soup.find('title')
            title_text = title.get_text().lower() if title else ""
            
            combined_text = f"{title_text} {text_content}"
            
            # Score each category
            category_scores = {}
            for category, keywords in self.business_categories.items():
                score = 0
                for keyword in keywords:
                    # Count occurrences with different weights
                    title_count = title_text.count(keyword)
                    content_count = combined_text.count(keyword)
                    
                    score += title_count * 3  # Higher weight for title
                    score += content_count * 1
                
                category_scores[category] = score
            
            # Return category with highest score
            if category_scores:
                best_category = max(category_scores, key=category_scores.get)
                if category_scores[best_category] > 0:
                    return best_category
            
            return "general"
            
        except Exception as e:
            logger.error(f"Business category determination failed: {str(e)}")
            return "unknown"
    
    def _calculate_completeness_score(self, business_info: Dict[str, Any]) -> float:
        """Calculate completeness score for business information"""
        try:
            score = 0
            max_score = 100
            
            # Name (20 points)
            if business_info.get("name"):
                score += 20
            
            # Description (15 points)
            if business_info.get("description") and len(business_info["description"]) > 20:
                score += 15
            
            # Contact info (25 points)
            contact_info = business_info.get("contact_info", {})
            if contact_info.get("phones"):
                score += 10
            if contact_info.get("emails"):
                score += 10
            if contact_info.get("addresses"):
                score += 5
            
            # Location info (15 points)
            location_info = business_info.get("location_info", {})
            if location_info.get("city"):
                score += 8
            if location_info.get("state"):
                score += 4
            if location_info.get("addresses"):
                score += 3
            
            # Business hours (10 points)
            if business_info.get("business_hours"):
                score += 10
            
            # Services/Products (10 points)
            if business_info.get("services") or business_info.get("products"):
                score += 10
            
            # Social media (5 points)
            if business_info.get("social_media"):
                score += 5
            
            return min(score, max_score)
            
        except Exception as e:
            logger.error(f"Completeness score calculation failed: {str(e)}")
            return 0
    
    def _generate_business_summary(self, business_info: Dict[str, Any]) -> Dict[str, Any]:
        """Generate business summary"""
        try:
            summary = {
                "name": business_info.get("name", "Unknown Business"),
                "category": business_info.get("category", "general"),
                "has_contact_info": bool(business_info.get("contact_info", {}).get("phones") or 
                                       business_info.get("contact_info", {}).get("emails")),
                "has_location": bool(business_info.get("location_info", {}).get("city")),
                "has_hours": bool(business_info.get("business_hours")),
                "service_count": len(business_info.get("services", [])),
                "social_media_count": len(business_info.get("social_media", {})),
                "completeness_score": business_info.get("completeness_score", 0)
            }
            
            # Generate description summary
            description = business_info.get("description", "")
            if description:
                # Take first 100 characters
                summary["short_description"] = description[:100] + "..." if len(description) > 100 else description
            
            return summary
            
        except Exception as e:
            logger.error(f"Business summary generation failed: {str(e)}")
            return {}
    
    # Helper methods
    def _get_structured_data_field(self, soup: BeautifulSoup, field: str) -> Optional[str]:
        """Get field from structured data"""
        try:
            json_ld_scripts = soup.find_all('script', type='application/ld+json')
            for script in json_ld_scripts:
                if script.string:
                    data = json.loads(script.string.strip())
                    if isinstance(data, dict) and field in data:
                        return str(data[field])
                    elif isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and field in item:
                                return str(item[field])
        except (json.JSONDecodeError, Exception):
            pass
        return None
    
    def _get_meta_content(self, soup: BeautifulSoup, name: str) -> Optional[str]:
        """Get content from meta tag"""
        meta_tag = soup.find('meta', attrs={'name': name}) or soup.find('meta', attrs={'property': name})
        return meta_tag.get('content') if meta_tag else None
    
    def _clean_business_name_from_title(self, title_tag: Optional[Tag]) -> Optional[str]:
        """Clean business name from title tag"""
        if not title_tag:
            return None
        
        title_text = title_tag.get_text().strip()
        
        # Remove common suffixes
        suffixes = [' - Home', ' | Home', ' - Official Site', ' | Official Site', 
                   ' - Welcome', ' | Welcome', ' Homepage']
        
        for suffix in suffixes:
            if title_text.endswith(suffix):
                title_text = title_text[:-len(suffix)]
        
        # Take first part if separated by common delimiters
        for delimiter in [' - ', ' | ', ' :: ', ' — ']:
            if delimiter in title_text:
                title_text = title_text.split(delimiter)[0]
                break
        
        return title_text.strip() if len(title_text.strip()) > 1 else None
    
    def _get_logo_alt_text(self, soup: BeautifulSoup) -> Optional[str]:
        """Get business name from logo alt text"""
        logo_selectors = [
            'img[alt*="logo" i]',
            'img[src*="logo" i]',
            'img[class*="logo" i]',
            '.logo img',
            '#logo img'
        ]
        
        for selector in logo_selectors:
            logo_img = soup.select_one(selector)
            if logo_img and logo_img.get('alt'):
                alt_text = logo_img.get('alt').strip()
                if len(alt_text) > 1:
                    return alt_text
        
        return None
    
    def _get_header_business_name(self, soup: BeautifulSoup) -> Optional[str]:
        """Get business name from header"""
        header_selectors = [
            'header h1',
            '.header h1',
            '#header h1',
            '.site-title',
            '.brand',
            '.company-name'
        ]
        
        for selector in header_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text().strip()
                if len(text) > 1 and len(text) < 100:
                    return text
        
        return None
    
    def _extract_name_from_domain(self, url: str) -> Optional[str]:
        """Extract business name from domain"""
        try:
            domain = urlparse(url).netloc
            if domain.startswith('www.'):
                domain = domain[4:]
            
            # Remove TLD
            name = domain.split('.')[0]
            
            # Clean up common patterns
            name = name.replace('-', ' ').replace('_', ' ')
            name = ' '.join(word.capitalize() for word in name.split())
            
            return name if len(name) > 1 else None
            
        except Exception:
            return None
    
    def _get_about_section_text(self, soup: BeautifulSoup) -> Optional[str]:
        """Get text from about section"""
        about_selectors = [
            '.about',
            '#about',
            '[class*="about"]',
            '.company-info',
            '.description'
        ]
        
        for selector in about_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                if len(text) > 20:
                    return text[:500]
        
        return None
    
    def _get_first_main_paragraph(self, soup: BeautifulSoup) -> Optional[str]:
        """Get first substantial paragraph from main content"""
        main_selectors = ['main', '.main', '.content', '.main-content', 'article']
        
        for selector in main_selectors:
            main_element = soup.select_one(selector)
            if main_element:
                paragraphs = main_element.find_all('p')
                for p in paragraphs:
                    text = p.get_text(strip=True)
                    if len(text) > 50:
                        return text[:300]
        
        # Fallback to any paragraph
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = p.get_text(strip=True)
            if len(text) > 50:
                return text[:300]
        
        return None
    
    def _get_header_subtitle(self, soup: BeautifulSoup) -> Optional[str]:
        """Get subtitle from header"""
        subtitle_selectors = [
            'header h2',
            'header .subtitle',
            '.header .tagline',
            '.hero .subtitle'
        ]
        
        for selector in subtitle_selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(strip=True)
                if len(text) > 10:
                    return text
        
        return None
    
    def _get_structured_location_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Get location data from structured data"""
        try:
            json_ld_scripts = soup.find_all('script', type='application/ld+json')
            for script in json_ld_scripts:
                if script.string:
                    data = json.loads(script.string.strip())
                    
                    # Look for address in structured data
                    address_data = {}
                    if isinstance(data, dict):
                        address = data.get('address', {})
                        if isinstance(address, dict):
                            address_data = {
                                "city": address.get('addressLocality', ''),
                                "state": address.get('addressRegion', ''),
                                "country": address.get('addressCountry', ''),
                                "postal_code": address.get('postalCode', '')
                            }
                    
                    return address_data
        except (json.JSONDecodeError, Exception):
            pass
        
        return {}
    
    def _get_structured_hours_data(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Get business hours from structured data"""
        try:
            json_ld_scripts = soup.find_all('script', type='application/ld+json')
            for script in json_ld_scripts:
                if script.string:
                    data = json.loads(script.string.strip())
                    
                    if isinstance(data, dict) and 'openingHours' in data:
                        hours_data = data['openingHours']
                        if isinstance(hours_data, list):
                            hours = {}
                            for hour_spec in hours_data:
                                # Parse format like "Mo-Fr 09:00-17:00"
                                if '-' in hour_spec and ':' in hour_spec:
                                    parts = hour_spec.split(' ')
                                    if len(parts) >= 2:
                                        days = parts[0]
                                        time_range = parts[1]
                                        hours[days] = time_range
                            return hours
        except (json.JSONDecodeError, Exception):
            pass
        
        return {}
    
    def _parse_hours_text(self, hours_text: str) -> Dict[str, str]:
        """Parse hours text into structured format"""
        hours = {}
        
        # Simple parsing for common formats
        day_patterns = {
            'monday': ['monday', 'mon'],
            'tuesday': ['tuesday', 'tue'],
            'wednesday': ['wednesday', 'wed'],
            'thursday': ['thursday', 'thu'],
            'friday': ['friday', 'fri'],
            'saturday': ['saturday', 'sat'],
            'sunday': ['sunday', 'sun']
        }
        
        hours_text_lower = hours_text.lower()
        
        # Look for time patterns
        time_pattern = r'(\d{1,2}:\d{2}|\d{1,2})\s*(am|pm)?\s*[-to]*\s*(\d{1,2}:\d{2}|\d{1,2})\s*(am|pm)?'
        time_matches = re.findall(time_pattern, hours_text_lower)
        
        if time_matches:
            time_range = f"{time_matches[0][0]}{time_matches[0][1]} - {time_matches[0][2]}{time_matches[0][3]}"
            
            # Check which days this applies to
            for day, patterns in day_patterns.items():
                if any(pattern in hours_text_lower for pattern in patterns):
                    hours[day] = time_range
        
        return hours

