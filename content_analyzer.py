#!/usr/bin/env python3
"""
Advanced Content Analysis System for CCHMC Space
Reads and analyzes all content to extract keywords, descriptions, and create intelligent categorization
"""

import json
import requests
import re
import os
from collections import Counter, defaultdict
from datetime import datetime
import pandas as pd
from typing import Dict, List, Any, Optional
import time

class ContentAnalyzer:
    def __init__(self):
        self.api_base = "http://localhost:3000"
        self.content_data = []
        self.analysis_results = {}
        self.keywords_by_category = defaultdict(list)
        self.medical_terms = self._load_medical_terms()
        
    def _load_medical_terms(self):
        """Load comprehensive medical terminology for better analysis"""
        return {
            'procedures': [
                'appendectomy', 'cholecystectomy', 'hernia repair', 'ecmo cannulation', 
                'ecmo decannulation', 'central line placement', 'tracheostomy', 
                'gastrostomy tube', 'intestinal resection', 'laparoscopic surgery',
                'thoracoscopic procedure', 'vascular access', 'trauma surgery',
                'pediatric surgery', 'neonatal surgery', 'cardiac surgery',
                'pulmonary surgery', 'gastrointestinal surgery', 'urological surgery',
                'orthopedic surgery', 'neurosurgery', 'plastic surgery'
            ],
            'conditions': [
                'congenital diaphragmatic hernia', 'cdh', 'tracheoesophageal fistula',
                'tef', 'necrotizing enterocolitis', 'nec', 'respiratory distress',
                'sepsis', 'shock', 'hypoxia', 'bradycardia', 'tachycardia',
                'hypotension', 'hypertension', 'fever', 'hypothermia'
            ],
            'medications': [
                'epinephrine', 'norepinephrine', 'dopamine', 'dobutamine',
                'fentanyl', 'morphine', 'midazolam', 'propofol', 'ketamine',
                'vancomycin', 'cefazolin', 'gentamicin', 'ampicillin',
                'heparin', 'warfarin', 'aspirin', 'acetaminophen', 'ibuprofen'
            ],
            'equipment': [
                'ecmo', 'ventilator', 'cpap', 'bipap', 'oxygen', 'suction',
                'monitor', 'defibrillator', 'pacemaker', 'catheter', 'iv',
                'central line', 'arterial line', 'chest tube', 'drain'
            ],
            'departments': [
                'nicu', 'picu', 'icu', 'emergency', 'trauma', 'surgery',
                'cardiology', 'pulmonology', 'gastroenterology', 'urology',
                'orthopedics', 'neurology', 'oncology', 'hematology'
            ],
            'protocols': [
                'guideline', 'protocol', 'policy', 'procedure', 'algorithm',
                'pathway', 'checklist', 'standard', 'best practice', 'protocol'
            ]
        }
    
    def fetch_all_content(self):
        """Fetch all content from the API"""
        print("🔄 Fetching all content from API...")
        try:
            response = requests.get(f"{self.api_base}/api/space-content?spaceId=4")
            response.raise_for_status()
            data = response.json()
            self.content_data = data.get('content', [])
            print(f"✅ Fetched {len(self.content_data)} content items")
            return True
        except Exception as e:
            print(f"❌ Error fetching content: {e}")
            return False
    
    def get_signed_url(self, file_key: str) -> Optional[str]:
        """Get signed URL for S3 content"""
        try:
            response = requests.get(f"{self.api_base}/api/thumbnail?key={file_key}")
            response.raise_for_status()
            data = response.json()
            return data.get('url')
        except Exception as e:
            print(f"⚠️ Could not get signed URL for {file_key}: {e}")
            return None
    
    def extract_text_from_pdf(self, pdf_url: str) -> str:
        """Extract text from PDF using requests and basic text extraction"""
        try:
            response = requests.get(pdf_url, timeout=30)
            response.raise_for_status()
            
            # For now, we'll use filename analysis since PDF text extraction requires additional libraries
            # In a production environment, you'd use PyPDF2, pdfplumber, or similar
            return ""
        except Exception as e:
            print(f"⚠️ Could not extract text from PDF {pdf_url}: {e}")
            return ""
    
    def analyze_filename(self, filename: str) -> Dict[str, Any]:
        """Analyze filename to extract keywords and context"""
        analysis = {
            'keywords': [],
            'medical_terms': [],
            'content_type': 'unknown',
            'specialty': 'unknown',
            'urgency': 'routine',
            'description': ''
        }
        
        filename_lower = filename.lower()
        
        # Extract medical terms
        for category, terms in self.medical_terms.items():
            for term in terms:
                if term in filename_lower:
                    analysis['medical_terms'].append(term)
                    analysis['keywords'].append(term)
        
        # Determine content type
        if 'guideline' in filename_lower:
            analysis['content_type'] = 'guideline'
        elif 'protocol' in filename_lower:
            analysis['content_type'] = 'protocol'
        elif 'procedure' in filename_lower:
            analysis['content_type'] = 'procedure'
        elif 'policy' in filename_lower:
            analysis['content_type'] = 'policy'
        elif 'checklist' in filename_lower:
            analysis['content_type'] = 'checklist'
        
        # Determine specialty
        if any(dept in filename_lower for dept in ['nicu', 'neonatal']):
            analysis['specialty'] = 'neonatal'
        elif any(dept in filename_lower for dept in ['picu', 'pediatric']):
            analysis['specialty'] = 'pediatric'
        elif any(dept in filename_lower for dept in ['icu', 'critical']):
            analysis['specialty'] = 'critical_care'
        elif any(dept in filename_lower for dept in ['surgery', 'surgical']):
            analysis['specialty'] = 'surgery'
        elif any(dept in filename_lower for dept in ['emergency', 'trauma']):
            analysis['specialty'] = 'emergency'
        elif any(dept in filename_lower for dept in ['ecmo']):
            analysis['specialty'] = 'ecmo'
        
        # Determine urgency
        if any(term in filename_lower for term in ['emergency', 'urgent', 'stat', 'critical']):
            analysis['urgency'] = 'urgent'
        elif any(term in filename_lower for term in ['routine', 'standard', 'normal']):
            analysis['urgency'] = 'routine'
        
        # Generate description
        analysis['description'] = self._generate_description(filename, analysis)
        
        return analysis
    
    def _generate_description(self, filename: str, analysis: Dict[str, Any]) -> str:
        """Generate a human-readable description based on analysis"""
        parts = []
        
        # Add specialty context
        if analysis['specialty'] != 'unknown':
            specialty_map = {
                'neonatal': 'Neonatal care',
                'pediatric': 'Pediatric care',
                'critical_care': 'Critical care',
                'surgery': 'Surgical procedures',
                'emergency': 'Emergency care',
                'ecmo': 'ECMO management'
            }
            parts.append(specialty_map.get(analysis['specialty'], analysis['specialty']))
        
        # Add content type
        if analysis['content_type'] != 'unknown':
            parts.append(f"{analysis['content_type']} document")
        
        # Add medical terms
        if analysis['medical_terms']:
            parts.append(f"covering {', '.join(analysis['medical_terms'][:3])}")
        
        # Add urgency
        if analysis['urgency'] == 'urgent':
            parts.append("(urgent/critical)")
        
        return " - ".join(parts) if parts else "Medical content document"
    
    def analyze_video_content(self, video_item: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze video content based on metadata and filename patterns"""
        analysis = {
            'keywords': [],
            'medical_terms': [],
            'procedure_type': 'unknown',
            'specialty': 'unknown',
            'description': '',
            'estimated_duration': 'unknown',
            'complexity': 'unknown'
        }
        
        filename = video_item.get('fileUrl', '').split('/')[-1]
        title = video_item.get('title', '')
        
        # Extract procedure information from title
        title_lower = title.lower()
        
        # Map common surgical procedures
        procedure_mapping = {
            'appendectomy': 'Appendectomy procedure',
            'cholecystectomy': 'Cholecystectomy procedure', 
            'hernia': 'Hernia repair surgery',
            'ecmo cannulation': 'ECMO cannulation procedure',
            'ecmo decannulation': 'ECMO decannulation procedure',
            'central line': 'Central line placement',
            'tracheostomy': 'Tracheostomy procedure',
            'gastrostomy': 'Gastrostomy tube placement',
            'laparoscopic': 'Laparoscopic surgery',
            'thoracoscopic': 'Thoracoscopic procedure'
        }
        
        for key, description in procedure_mapping.items():
            if key in title_lower:
                analysis['procedure_type'] = description
                analysis['keywords'].append(key)
                break
        
        # Determine specialty based on procedure
        if any(term in title_lower for term in ['ecmo', 'cannulation', 'decannulation']):
            analysis['specialty'] = 'ecmo'
        elif any(term in title_lower for term in ['neonatal', 'nicu']):
            analysis['specialty'] = 'neonatal'
        elif any(term in title_lower for term in ['pediatric', 'child']):
            analysis['specialty'] = 'pediatric'
        elif any(term in title_lower for term in ['surgery', 'surgical']):
            analysis['specialty'] = 'surgery'
        elif any(term in title_lower for term in ['emergency', 'trauma']):
            analysis['specialty'] = 'emergency'
        
        # Estimate complexity based on procedure type
        complex_procedures = ['ecmo', 'cannulation', 'tracheostomy', 'laparoscopic']
        if any(term in title_lower for term in complex_procedures):
            analysis['complexity'] = 'complex'
        else:
            analysis['complexity'] = 'moderate'
        
        # Generate description
        analysis['description'] = f"{analysis['procedure_type']} - {analysis['specialty']} specialty"
        
        return analysis
    
    def analyze_all_content(self):
        """Analyze all content items"""
        print("🔍 Starting comprehensive content analysis...")
        
        for i, item in enumerate(self.content_data):
            print(f"📄 Analyzing item {i+1}/{len(self.content_data)}: {item.get('title', 'Unknown')[:50]}...")
            
            analysis = {
                'id': item.get('id'),
                'title': item.get('title'),
                'type': item.get('type'),
                'file_url': item.get('fileUrl'),
                'size': item.get('size'),
                'last_modified': item.get('lastModified'),
                'filename_analysis': {},
                'content_analysis': {},
                'recommended_category': 'unknown',
                'priority_score': 0,
                'keywords': [],
                'description': ''
            }
            
            # Analyze filename
            filename = item.get('fileUrl', '').split('/')[-1]
            analysis['filename_analysis'] = self.analyze_filename(filename)
            
            # Type-specific analysis
            if item.get('type') == 'video':
                analysis['content_analysis'] = self.analyze_video_content(item)
            elif item.get('type') in ['document', 'guideline']:
                # For PDFs, we'd extract text here in a production environment
                analysis['content_analysis'] = analysis['filename_analysis']
            
            # Combine analysis results
            analysis['keywords'] = list(set(
                analysis['filename_analysis'].get('keywords', []) +
                analysis['content_analysis'].get('keywords', [])
            ))
            
            analysis['description'] = analysis['content_analysis'].get('description', 
                analysis['filename_analysis'].get('description', ''))
            
            # Determine recommended category
            analysis['recommended_category'] = self._determine_category(analysis)
            
            # Calculate priority score
            analysis['priority_score'] = self._calculate_priority_score(analysis)
            
            self.analysis_results[item.get('id')] = analysis
            
            # Small delay to avoid overwhelming the API
            time.sleep(0.1)
        
        print(f"✅ Analysis complete for {len(self.analysis_results)} items")
    
    def _determine_category(self, analysis: Dict[str, Any]) -> str:
        """Determine the best category for content based on analysis"""
        specialty = analysis['content_analysis'].get('specialty', 
                   analysis['filename_analysis'].get('specialty', 'unknown'))
        
        # Map specialties to our main categories
        category_mapping = {
            'neonatal': 'Neonatal & NICU',
            'pediatric': 'Pediatric Care',
            'critical_care': 'Critical Care & ECMO',
            'surgery': 'Surgical Procedures',
            'emergency': 'Emergency & Trauma',
            'ecmo': 'Critical Care & ECMO'
        }
        
        return category_mapping.get(specialty, 'General Medical')
    
    def _calculate_priority_score(self, analysis: Dict[str, Any]) -> int:
        """Calculate priority score based on content analysis"""
        score = 0
        
        # Base score by content type
        type_scores = {
            'guideline': 10,
            'protocol': 9,
            'procedure': 8,
            'video': 7,
            'document': 6,
            'image': 5
        }
        
        score += type_scores.get(analysis['type'], 5)
        
        # Urgency bonus
        urgency = analysis['filename_analysis'].get('urgency', 'routine')
        if urgency == 'urgent':
            score += 5
        
        # Medical terms bonus
        medical_terms_count = len(analysis['filename_analysis'].get('medical_terms', []))
        score += min(medical_terms_count * 2, 10)
        
        # Specialty bonus
        specialty = analysis['content_analysis'].get('specialty', 'unknown')
        if specialty != 'unknown':
            score += 3
        
        return min(score, 20)  # Cap at 20
    
    def generate_intelligent_categorization(self):
        """Generate intelligent categorization based on analysis"""
        print("🧠 Generating intelligent categorization...")
        
        # Group content by recommended categories
        category_groups = defaultdict(list)
        for item_id, analysis in self.analysis_results.items():
            category = analysis['recommended_category']
            category_groups[category].append(analysis)
        
        # Sort each category by priority score
        for category in category_groups:
            category_groups[category].sort(key=lambda x: x['priority_score'], reverse=True)
        
        # Generate space card structure
        space_cards = []
        
        for category, items in category_groups.items():
            if not items:
                continue
                
            # Determine color based on category
            color_mapping = {
                'Critical Care & ECMO': '#dc2626',
                'Neonatal & NICU': '#059669', 
                'Surgical Procedures': '#7c3aed',
                'Emergency & Trauma': '#ea580c',
                'Pediatric Care': '#0891b2',
                'General Medical': '#6b7280'
            }
            
            space_card = {
                'id': category.lower().replace(' ', '-').replace('&', 'and'),
                'title': category,
                'color': color_mapping.get(category, '#6b7280'),
                'total_items': len(items),
                'priority_items': items[:10],  # Top 10 priority items
                'collections': self._create_collections_for_category(category, items)
            }
            
            space_cards.append(space_card)
        
        return space_cards
    
    def _create_collections_for_category(self, category: str, items: List[Dict]) -> List[Dict]:
        """Create collections within a category based on content analysis"""
        collections = []
        
        # Group by content type
        type_groups = defaultdict(list)
        for item in items:
            content_type = item['type']
            type_groups[content_type].append(item)
        
        # Create collections for each content type
        collection_mapping = {
            'guideline': 'Clinical Guidelines',
            'video': 'Training Videos', 
            'document': 'Reference Documents',
            'image': 'Visual Resources'
        }
        
        for content_type, type_items in type_groups.items():
            if not type_items:
                continue
                
            collection = {
                'id': f"{category.lower().replace(' ', '-')}-{content_type}",
                'title': collection_mapping.get(content_type, f"{content_type.title()} Collection"),
                'items': type_items[:20],  # Limit to top 20 items
                'total_count': len(type_items),
                'description': f"Collection of {len(type_items)} {content_type} items for {category}"
            }
            
            collections.append(collection)
        
        return collections
    
    def save_analysis_results(self):
        """Save analysis results to files"""
        print("💾 Saving analysis results...")
        
        # Save detailed analysis
        with open('detailed_content_analysis.json', 'w') as f:
            json.dump(self.analysis_results, f, indent=2, default=str)
        
        # Generate intelligent categorization
        intelligent_categorization = self.generate_intelligent_categorization()
        
        with open('intelligent_categorization.json', 'w') as f:
            json.dump(intelligent_categorization, f, indent=2, default=str)
        
        # Create comprehensive Excel report
        self._create_comprehensive_excel()
        
        print("✅ Analysis results saved!")
    
    def _create_comprehensive_excel(self):
        """Create comprehensive Excel report with analysis results"""
        print("📊 Creating comprehensive Excel report...")
        
        # Prepare data for Excel
        excel_data = []
        
        for item_id, analysis in self.analysis_results.items():
            row = {
                'ID': analysis['id'],
                'Title': analysis['title'],
                'Type': analysis['type'],
                'Recommended Category': analysis['recommended_category'],
                'Priority Score': analysis['priority_score'],
                'Keywords': ', '.join(analysis['keywords']),
                'Description': analysis['description'],
                'Specialty': analysis['content_analysis'].get('specialty', 'unknown'),
                'Content Type': analysis['filename_analysis'].get('content_type', 'unknown'),
                'Urgency': analysis['filename_analysis'].get('urgency', 'routine'),
                'Medical Terms': ', '.join(analysis['filename_analysis'].get('medical_terms', [])),
                'File URL': analysis['file_url'],
                'Size (bytes)': analysis['size'],
                'Last Modified': analysis['last_modified']
            }
            excel_data.append(row)
        
        # Create DataFrame and save to Excel
        df = pd.DataFrame(excel_data)
        
        with pd.ExcelWriter('Comprehensive_Content_Analysis.xlsx', engine='openpyxl') as writer:
            # Main analysis sheet
            df.to_excel(writer, sheet_name='Content Analysis', index=False)
            
            # Priority analysis
            priority_df = df.nlargest(50, 'Priority Score')
            priority_df.to_excel(writer, sheet_name='Top Priority Items', index=False)
            
            # Category summary
            category_summary = df.groupby('Recommended Category').agg({
                'ID': 'count',
                'Priority Score': 'mean',
                'Size (bytes)': 'sum'
            }).rename(columns={'ID': 'Count', 'Priority Score': 'Avg Priority'})
            category_summary.to_excel(writer, sheet_name='Category Summary')
            
            # Keyword analysis
            all_keywords = []
            for keywords_str in df['Keywords']:
                if keywords_str:
                    all_keywords.extend([kw.strip() for kw in keywords_str.split(',')])
            
            keyword_counts = Counter(all_keywords)
            keyword_df = pd.DataFrame([
                {'Keyword': kw, 'Count': count} 
                for kw, count in keyword_counts.most_common(50)
            ])
            keyword_df.to_excel(writer, sheet_name='Top Keywords', index=False)
        
        print("✅ Comprehensive Excel report created!")

def main():
    print("🚀 Starting Comprehensive Content Analysis...")
    
    analyzer = ContentAnalyzer()
    
    # Fetch all content
    if not analyzer.fetch_all_content():
        print("❌ Failed to fetch content. Exiting.")
        return
    
    # Analyze all content
    analyzer.analyze_all_content()
    
    # Save results
    analyzer.save_analysis_results()
    
    print("🎉 Analysis complete! Check the generated files:")
    print("📄 detailed_content_analysis.json - Raw analysis data")
    print("🧠 intelligent_categorization.json - Smart categorization")
    print("📊 Comprehensive_Content_Analysis.xlsx - Complete Excel report")

if __name__ == "__main__":
    main()

