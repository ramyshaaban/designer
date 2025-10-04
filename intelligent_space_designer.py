#!/usr/bin/env python3
"""
Intelligent Space Structure Designer for CCHMC
Analyzes transcription data to create medically accurate space structure
"""

import json
import os
from collections import defaultdict, Counter
from typing import Dict, List, Any, Tuple
import re

class IntelligentSpaceDesigner:
    def __init__(self):
        self.api_base = "http://localhost:3000"
        self.transcription_data = {}
        self.medical_insights = {}
        self.new_structure = {}
        
    def load_transcription_data(self):
        """Load all transcription data and real content from API"""
        print("📄 Loading transcription data and real content...")
        
        # Load video transcriptions
        video_files = os.listdir('content_transcriptions/videos/')
        for file in video_files:
            if file.endswith('.json'):
                with open(f'content_transcriptions/videos/{file}', 'r') as f:
                    data = json.load(f)
                    self.transcription_data[data['video_id']] = {
                        'type': 'video',
                        'data': data
                    }
        
        # Load document extractions
        doc_files = os.listdir('content_transcriptions/documents/')
        for file in doc_files:
            if file.endswith('.json'):
                with open(f'content_transcriptions/documents/{file}', 'r') as f:
                    data = json.load(f)
                    self.transcription_data[data['document_id']] = {
                        'type': 'document',
                        'data': data
                    }
        
        # Load guideline extractions
        guideline_files = os.listdir('content_transcriptions/guidelines/')
        for file in guideline_files:
            if file.endswith('.json'):
                with open(f'content_transcriptions/guidelines/{file}', 'r') as f:
                    data = json.load(f)
                    self.transcription_data[data['document_id']] = {
                        'type': 'guideline',
                        'data': data
                    }
        
        # Load real content from API
        try:
            import requests
            response = requests.get(f"{self.api_base}/api/space-content?spaceId=4")
            if response.ok:
                api_data = response.json()
                real_content = api_data.get('content', [])
                
                # Add real content to transcription data (avoid duplicates)
                for item in real_content:
                    content_id = item.get('id', '')
                    if content_id not in self.transcription_data:
                        # Create transcription-like data from real content
                        self.transcription_data[content_id] = {
                            'type': item.get('type', 'document'),
                            'data': {
                                'title': item.get('title', ''),
                                'specialty': 'unknown',  # Will be determined by analysis
                                'complexity': 'moderate',  # Default complexity
                                'fileUrl': item.get('fileUrl', ''),
                                'content_type': item.get('type', 'document')
                            }
                        }
                    else:
                        # Update existing transcription data with real fileUrl if missing
                        if 'fileUrl' not in self.transcription_data[content_id]['data']:
                            self.transcription_data[content_id]['data']['fileUrl'] = item.get('fileUrl', '')
                
                print(f"✅ Added {len(real_content)} real content items from API")
        except Exception as e:
            print(f"⚠️ Could not load real content from API: {e}")
        
        print(f"✅ Loaded {len(self.transcription_data)} total content items")
    
    def remove_duplicates(self, items):
        """Remove duplicate items based on ID"""
        seen_ids = set()
        unique_items = []
        for item in items:
            if item['id'] not in seen_ids:
                seen_ids.add(item['id'])
                unique_items.append(item)
        return unique_items
    
    def assign_content_to_collection(self, content_pool, keywords, used_ids, collection_name):
        """Assign content to a collection, avoiding duplicates across all collections"""
        matching_items = []
        for item in content_pool:
            if item['id'] not in used_ids:
                if any(keyword in item['title'].lower() for keyword in keywords):
                    matching_items.append(item)
                    used_ids.add(item['id'])
        
        print(f"📋 {collection_name}: {len(matching_items)} items assigned")
        return matching_items
    
    def extract_medical_insights(self):
        """Extract medical insights from transcription data"""
        print("🔍 Extracting medical insights...")
        
        insights = {
            'procedures': defaultdict(int),
            'specialties': defaultdict(int),
            'complexity_levels': defaultdict(int),
            'medical_terms': defaultdict(int),
            'content_types': defaultdict(int),
            'urgency_levels': defaultdict(int),
            'procedure_specialty_mapping': defaultdict(list),
            'complexity_procedure_mapping': defaultdict(list),
            'video_procedures': [],
            'document_categories': [],
            'guideline_categories': []
        }
        
        for item_id, item_data in self.transcription_data.items():
            data = item_data['data']
            content_type = item_data['type']
            
            # Extract basic info
            title = data.get('title', '')
            specialty = data.get('specialty', 'unknown')
            complexity = data.get('complexity', 'unknown')
            urgency = data.get('urgency', 'routine')
            
            insights['content_types'][content_type] += 1
            insights['specialties'][specialty] += 1
            insights['complexity_levels'][complexity] += 1
            insights['urgency_levels'][urgency] += 1
            
            # Extract procedures and medical terms
            if content_type == 'video':
                procedure_type = data.get('procedure_type', 'unknown')
                if procedure_type != 'unknown':
                    insights['procedures'][procedure_type] += 1
                    insights['video_procedures'].append({
                        'title': title,
                        'procedure': procedure_type,
                        'specialty': specialty,
                        'complexity': complexity
                    })
                    insights['procedure_specialty_mapping'][procedure_type].append(specialty)
                    insights['complexity_procedure_mapping'][complexity].append(procedure_type)
            
            elif content_type in ['document', 'guideline']:
                content_type_doc = data.get('content_type', 'unknown')
                if content_type_doc != 'unknown':
                    insights['document_categories'].append({
                        'title': title,
                        'category': content_type_doc,
                        'specialty': specialty,
                        'urgency': urgency
                    })
            
            # Extract medical terms
            medical_terms = data.get('medical_terms_found', [])
            for term in medical_terms:
                insights['medical_terms'][term] += 1
        
        self.medical_insights = insights
        print("✅ Medical insights extracted")
    
    def analyze_procedure_patterns(self):
        """Analyze patterns in procedures and specialties"""
        print("📊 Analyzing procedure patterns...")
        
        # Group procedures by specialty
        specialty_procedures = defaultdict(list)
        for procedure, specialties in self.medical_insights['procedure_specialty_mapping'].items():
            most_common_specialty = Counter(specialties).most_common(1)[0][0]
            specialty_procedures[most_common_specialty].append(procedure)
        
        # Group by complexity
        complexity_groups = defaultdict(list)
        for complexity, procedures in self.medical_insights['complexity_procedure_mapping'].items():
            complexity_groups[complexity].extend(procedures)
        
        # Identify high-priority procedures
        high_priority_procedures = []
        for procedure, count in self.medical_insights['procedures'].items():
            if count >= 3:  # Procedures that appear multiple times
                high_priority_procedures.append((procedure, count))
        
        high_priority_procedures.sort(key=lambda x: x[1], reverse=True)
        
        return {
            'specialty_procedures': dict(specialty_procedures),
            'complexity_groups': dict(complexity_groups),
            'high_priority_procedures': high_priority_procedures
        }
    
    def design_intelligent_structure(self):
        """Design new intelligent space structure based on medical insights"""
        print("🧠 Designing intelligent space structure...")
        
        patterns = self.analyze_procedure_patterns()
        
        # Create medically accurate space cards
        space_cards = []
        
        # Track used content IDs to prevent duplicates across collections
        used_content_ids = set()
        
        # 1. Critical Care & Life Support
        critical_care_procedures = [
            'ECMO cannulation', 'ECMO decannulation', 'Central line placement',
            'Tracheostomy procedure', 'Emergency trauma surgery'
        ]
        
        critical_care_content = self._find_content_by_procedures(critical_care_procedures)
        
        # Assign content to collections without duplicates
        ecmo_items = self.assign_content_to_collection(critical_care_content, ['ecmo'], used_content_ids, 'ECMO Management')
        emergency_items = self.assign_content_to_collection(critical_care_content, ['emergency', 'trauma'], used_content_ids, 'Emergency Procedures')
        access_items = self.assign_content_to_collection(critical_care_content, ['central line', 'tracheostomy'], used_content_ids, 'Critical Access')
        
        space_cards.append({
            'id': 'critical-care-life-support',
            'title': '🚨 Critical Care & Life Support',
            'color': '#dc2626',
            'description': 'Life-saving procedures and critical care protocols',
            'priority': 'highest',
            'content_count': len(ecmo_items) + len(emergency_items) + len(access_items),
            'collections': [
                {
                    'id': 'ecmo-management',
                    'title': 'ECMO Management',
                    'description': 'ECMO cannulation, decannulation, and management protocols',
                    'items': ecmo_items
                },
                {
                    'id': 'emergency-procedures',
                    'title': 'Emergency Procedures',
                    'description': 'Emergency trauma surgery and life-saving procedures',
                    'items': emergency_items
                },
                {
                    'id': 'critical-access',
                    'title': 'Critical Access',
                    'description': 'Central line placement and tracheostomy procedures',
                    'items': access_items
                }
            ]
        })
        
        # 2. Surgical Procedures
        surgical_procedures = [
            'Appendectomy procedure', 'Cholecystectomy surgery', 'Hernia repair surgery',
            'Laparoscopic surgery', 'Thoracoscopic procedure', 'Intestinal resection'
        ]
        
        surgical_content = self._find_content_by_procedures(surgical_procedures)
        space_cards.append({
            'id': 'surgical-procedures',
            'title': '🔪 Surgical Procedures',
            'color': '#7c3aed',
            'description': 'General and specialized surgical procedures',
            'priority': 'high',
            'content_count': len(surgical_content),
            'collections': [
                {
                    'id': 'general-surgery',
                    'title': 'General Surgery',
                    'description': 'Appendectomy, cholecystectomy, hernia repair',
                    'items': self.remove_duplicates([item for item in surgical_content if any(proc in item['title'].lower() for proc in ['appendectomy', 'cholecystectomy', 'hernia'])])
                },
                {
                    'id': 'minimally-invasive',
                    'title': 'Minimally Invasive Surgery',
                    'description': 'Laparoscopic and thoracoscopic procedures',
                    'items': self.remove_duplicates([item for item in surgical_content if any(proc in item['title'].lower() for proc in ['laparoscopic', 'thoracoscopic'])])
                },
                {
                    'id': 'specialized-surgery',
                    'title': 'Specialized Surgery',
                    'description': 'Intestinal resection and complex procedures',
                    'items': self.remove_duplicates([item for item in surgical_content if any(proc in item['title'].lower() for proc in ['intestinal', 'resection'])])
                }
            ]
        })
        
        # 3. Neonatal & Pediatric Care
        neonatal_procedures = [
            'Neonatal surgery', 'Pediatric surgery', 'Gastrostomy tube placement'
        ]
        
        neonatal_content = self._find_content_by_procedures(neonatal_procedures)
        space_cards.append({
            'id': 'neonatal-pediatric-care',
            'title': '👶 Neonatal & Pediatric Care',
            'color': '#059669',
            'description': 'Specialized care for newborns and children',
            'priority': 'high',
            'content_count': len(neonatal_content),
            'collections': [
                {
                    'id': 'neonatal-surgery',
                    'title': 'Neonatal Surgery',
                    'description': 'Surgical procedures for newborns',
                    'items': self.remove_duplicates([item for item in neonatal_content if 'neonatal' in item['title'].lower()])
                },
                {
                    'id': 'pediatric-surgery',
                    'title': 'Pediatric Surgery',
                    'description': 'Surgical procedures for children',
                    'items': self.remove_duplicates([item for item in neonatal_content if 'pediatric' in item['title'].lower()])
                },
                {
                    'id': 'pediatric-procedures',
                    'title': 'Pediatric Procedures',
                    'description': 'Gastrostomy tube placement and other procedures',
                    'items': self.remove_duplicates([item for item in neonatal_content if 'gastrostomy' in item['title'].lower()])
                }
            ]
        })
        
        # 4. Specialty Surgery
        specialty_procedures = [
            'Cardiac surgery', 'Pulmonary surgery', 'Urological surgery',
            'Orthopedic surgery', 'Gastrointestinal surgery'
        ]
        
        specialty_content = self._find_content_by_procedures(specialty_procedures)
        space_cards.append({
            'id': 'specialty-surgery',
            'title': '🏥 Specialty Surgery',
            'color': '#0891b2',
            'description': 'Specialized surgical procedures by organ system',
            'priority': 'medium',
            'content_count': len(specialty_content),
            'collections': [
                {
                    'id': 'cardiothoracic',
                    'title': 'Cardiothoracic Surgery',
                    'description': 'Cardiac and pulmonary surgical procedures',
                    'items': self.remove_duplicates([item for item in specialty_content if any(proc in item['title'].lower() for proc in ['cardiac', 'pulmonary'])])
                },
                {
                    'id': 'gastrointestinal',
                    'title': 'Gastrointestinal Surgery',
                    'description': 'GI surgical procedures',
                    'items': self.remove_duplicates([item for item in specialty_content if 'gastrointestinal' in item['title'].lower()])
                },
                {
                    'id': 'urological-orthopedic',
                    'title': 'Urological & Orthopedic',
                    'description': 'Urological and orthopedic surgical procedures',
                    'items': self.remove_duplicates([item for item in specialty_content if any(proc in item['title'].lower() for proc in ['urological', 'orthopedic'])])
                }
            ]
        })
        
        # 5. Clinical Guidelines & Protocols
        guideline_content = self._find_content_by_type(['guideline'])
        space_cards.append({
            'id': 'clinical-guidelines',
            'title': '📋 Clinical Guidelines & Protocols',
            'color': '#6b7280',
            'description': 'Clinical guidelines, protocols, and best practices',
            'priority': 'high',
            'content_count': len(guideline_content),
            'collections': [
                {
                    'id': 'critical-care-guidelines',
                    'title': 'Critical Care Guidelines',
                    'description': 'ECMO, sepsis, and critical care protocols',
                    'items': self.remove_duplicates([item for item in guideline_content if any(term in item['title'].lower() for term in ['ecmo', 'sepsis', 'critical', 'cpr'])])
                },
                {
                    'id': 'surgical-guidelines',
                    'title': 'Surgical Guidelines',
                    'description': 'Surgical protocols and procedures',
                    'items': self.remove_duplicates([item for item in guideline_content if any(term in item['title'].lower() for term in ['surgical', 'surgery', 'appendectomy', 'antibiotic'])])
                },
                {
                    'id': 'neonatal-guidelines',
                    'title': 'Neonatal Guidelines',
                    'description': 'Neonatal and pediatric care protocols',
                    'items': self.remove_duplicates([item for item in guideline_content if any(term in item['title'].lower() for term in ['neonatal', 'nicu', 'pediatric', 'dosing'])])
                }
            ]
        })
        
        # 6. Education & Training
        education_content = self._find_content_by_type(['document'])
        space_cards.append({
            'id': 'education-training',
            'title': '📚 Education & Training',
            'color': '#be185d',
            'description': 'Educational materials and training resources',
            'priority': 'medium',
            'content_count': len(education_content),
            'collections': [
                {
                    'id': 'resident-training',
                    'title': 'Resident Training',
                    'description': 'Resident curriculum and training materials',
                    'items': self.remove_duplicates([item for item in education_content if any(term in item['title'].lower() for term in ['resident', 'curriculum', 'training'])])
                },
                {
                    'id': 'fellowship-program',
                    'title': 'Fellowship Program',
                    'description': 'Fellowship training and case requirements',
                    'items': self.remove_duplicates([item for item in education_content if any(term in item['title'].lower() for term in ['fellow', 'fellowship', 'case', 'requirements'])])
                },
                {
                    'id': 'competency-assessment',
                    'title': 'Competency Assessment',
                    'description': 'Goals, objectives, and competency tracking',
                    'items': self.remove_duplicates([item for item in education_content if any(term in item['title'].lower() for term in ['goals', 'objectives', 'competencies', 'tracked'])])
                }
            ]
        })
        
        # 7. Additional Content - Catch remaining content
        remaining_content = []
        used_content_ids = set()
        
        # Collect all used content IDs
        for space_card in space_cards:
            for collection in space_card['collections']:
                for item in collection['items']:
                    used_content_ids.add(item['id'])
        
        # Find remaining content
        for item_id, item_data in self.transcription_data.items():
            if item_id not in used_content_ids:
                data = item_data['data']
                remaining_content.append({
                    'id': item_id,
                    'title': data.get('title', ''),
                    'type': item_data['type'],
                    'specialty': data.get('specialty', 'unknown'),
                    'urgency': data.get('urgency', 'routine'),
                    'fileUrl': data.get('fileUrl', item_id)
                })
        
        if remaining_content:
            space_cards.append({
                'id': 'additional-content',
                'title': '📁 Additional Content',
                'color': '#6b7280',
                'description': 'Additional medical content and resources',
                'priority': 'low',
                'content_count': len(remaining_content),
                'collections': [
                    {
                        'id': 'additional-items',
                        'title': 'Additional Items',
                        'description': 'Other medical content and resources',
                        'items': remaining_content
                    }
                ]
            })
        
        self.new_structure = {
            'space_cards': space_cards,
            'total_content': len(self.transcription_data),
            'medical_insights': self.medical_insights,
            'patterns': patterns
        }
        
        print("✅ Intelligent structure designed")
        
        # Recalculate content counts after deduplication
        self.recalculate_content_counts()
    
    def recalculate_content_counts(self):
        """Recalculate content counts after deduplication"""
        print("🔢 Recalculating content counts...")
        
        total_content = 0
        for space_card in self.new_structure['space_cards']:
            space_card_total = 0
            for collection in space_card['collections']:
                collection_items = len(collection['items'])
                space_card_total += collection_items
            
            # Update space card content count
            space_card['content_count'] = space_card_total
            total_content += space_card_total
        
        # Update total content
        self.new_structure['total_content'] = total_content
        
        print(f"✅ Content counts recalculated: {total_content} total items")
    
    def _find_content_by_procedures(self, procedures: List[str]) -> List[Dict]:
        """Find content items that match specific procedures"""
        matching_content = []
        
        for item_id, item_data in self.transcription_data.items():
            data = item_data['data']
            title = data.get('title', '').lower()
            
            for procedure in procedures:
                if procedure.lower() in title:
                    matching_content.append({
                        'id': item_id,
                        'title': data.get('title', ''),
                        'type': item_data['type'],
                        'specialty': data.get('specialty', 'unknown'),
                        'complexity': data.get('complexity', 'unknown'),
                        'procedure': procedure,
                        'fileUrl': data.get('fileUrl', item_id)  # Use item_id as fallback for fileUrl
                    })
                    break
        
        return matching_content
    
    def _find_content_by_type(self, types: List[str]) -> List[Dict]:
        """Find content items by type"""
        matching_content = []
        
        for item_id, item_data in self.transcription_data.items():
            if item_data['type'] in types:
                data = item_data['data']
                matching_content.append({
                    'id': item_id,
                    'title': data.get('title', ''),
                    'type': item_data['type'],
                    'specialty': data.get('specialty', 'unknown'),
                    'urgency': data.get('urgency', 'routine'),
                    'fileUrl': data.get('fileUrl', item_id)  # Use item_id as fallback for fileUrl
                })
        
        return matching_content
    
    def save_intelligent_structure(self):
        """Save the new intelligent structure"""
        print("💾 Saving intelligent structure...")
        
        with open('intelligent_space_structure.json', 'w') as f:
            json.dump(self.new_structure, f, indent=2, default=str)
        
        # Create summary report
        summary = {
            'total_space_cards': len(self.new_structure['space_cards']),
            'total_content_items': self.new_structure['total_content'],
            'space_card_summary': [
                {
                    'id': card['id'],
                    'title': card['title'],
                    'content_count': card['content_count'],
                    'priority': card['priority'],
                    'collections': len(card['collections'])
                }
                for card in self.new_structure['space_cards']
            ],
            'medical_insights_summary': {
                'procedures_identified': len(self.medical_insights['procedures']),
                'specialties_identified': len(self.medical_insights['specialties']),
                'complexity_levels': len(self.medical_insights['complexity_levels']),
                'top_procedures': dict(Counter(self.medical_insights['procedures']).most_common(10)),
                'top_specialties': dict(Counter(self.medical_insights['specialties']).most_common(5))
            }
        }
        
        with open('intelligent_structure_summary.json', 'w') as f:
            json.dump(summary, f, indent=2, default=str)
        
        print("✅ Intelligent structure saved")

def main():
    print("🚀 Starting Intelligent Space Structure Design...")
    
    designer = IntelligentSpaceDesigner()
    
    # Load transcription data
    designer.load_transcription_data()
    
    # Extract medical insights
    designer.extract_medical_insights()
    
    # Design intelligent structure
    designer.design_intelligent_structure()
    
    # Save results
    designer.save_intelligent_structure()
    
    print("🎉 Intelligent space structure design complete!")
    print("📁 Generated files:")
    print("  - intelligent_space_structure.json")
    print("  - intelligent_structure_summary.json")

if __name__ == "__main__":
    main()
