#!/usr/bin/env python3
"""
Comprehensive Intelligent Content Analyzer
Analyzes ALL content and creates intelligent categories without removing duplicates
"""

import json
import os
import re
from collections import defaultdict, Counter
from typing import Dict, List, Any, Set

class ComprehensiveContentAnalyzer:
    def __init__(self):
        self.transcription_data = {}
        self.content_analysis = {}
        self.medical_categories = {}
        
    def load_transcription_data(self):
        """Load all transcription data"""
        print("📄 Loading transcription data...")
        
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
        
        print(f"✅ Loaded {len(self.transcription_data)} total content items")
    
    def analyze_content_patterns(self):
        """Analyze content patterns and identify medical specialties"""
        print("🔍 Analyzing content patterns...")
        
        # Medical specialty keywords
        medical_specialties = {
            'cardiovascular': ['cardiac', 'heart', 'vascular', 'ecmo', 'cpr', 'circulation'],
            'respiratory': ['lung', 'pulmonary', 'respiratory', 'breathing', 'oxygen'],
            'gastrointestinal': ['gi', 'gastrointestinal', 'stomach', 'intestine', 'bowel', 'appendectomy', 'cholecystectomy'],
            'neurological': ['brain', 'neurological', 'neural', 'cns'],
            'urological': ['kidney', 'renal', 'urinary', 'bladder', 'urological'],
            'orthopedic': ['bone', 'joint', 'muscle', 'orthopedic', 'fracture'],
            'neonatal': ['neonatal', 'newborn', 'infant', 'nicu', 'premature'],
            'pediatric': ['pediatric', 'child', 'children', 'pediatric'],
            'surgical': ['surgery', 'surgical', 'operation', 'procedure', 'laparoscopic'],
            'critical_care': ['critical', 'icu', 'emergency', 'trauma', 'life support'],
            'anesthesia': ['anesthesia', 'sedation', 'pain', 'analgesia'],
            'infectious_disease': ['infection', 'antibiotic', 'sepsis', 'bacterial'],
            'oncology': ['cancer', 'tumor', 'oncology', 'chemotherapy'],
            'endocrinology': ['diabetes', 'hormone', 'endocrine', 'insulin']
        }
        
        # Procedure keywords
        procedure_keywords = {
            'cannulation': ['cannulation', 'cannula', 'line placement'],
            'decannulation': ['decannulation', 'line removal'],
            'tracheostomy': ['tracheostomy', 'trach'],
            'gastrostomy': ['gastrostomy', 'g-tube', 'feeding tube'],
            'hernia_repair': ['hernia', 'hernia repair'],
            'appendectomy': ['appendectomy', 'appendix'],
            'cholecystectomy': ['cholecystectomy', 'gallbladder'],
            'laparoscopic': ['laparoscopic', 'laparoscopy', 'minimally invasive'],
            'thoracoscopic': ['thoracoscopic', 'thoracoscopy'],
            'vascular_access': ['vascular access', 'central line', 'iv line'],
            'wound_care': ['wound', 'dressing', 'healing'],
            'medication': ['medication', 'drug', 'dosing', 'pharmacology']
        }
        
        # Analyze each content item
        for item_id, item_data in self.transcription_data.items():
            data = item_data['data']
            title = data.get('title', '').lower()
            
            # Find matching specialties
            matched_specialties = []
            for specialty, keywords in medical_specialties.items():
                if any(keyword in title for keyword in keywords):
                    matched_specialties.append(specialty)
            
            # Find matching procedures
            matched_procedures = []
            for procedure, keywords in procedure_keywords.items():
                if any(keyword in title for keyword in keywords):
                    matched_procedures.append(procedure)
            
            # Store analysis
            self.content_analysis[item_id] = {
                'title': data.get('title', ''),
                'type': item_data['type'],
                'specialties': matched_specialties,
                'procedures': matched_procedures,
                'fileUrl': data.get('fileUrl', item_id)
            }
        
        print(f"✅ Analyzed {len(self.content_analysis)} content items")
    
    def create_comprehensive_categories(self):
        """Create comprehensive medical categories including ALL content"""
        print("🧠 Creating comprehensive medical categories...")
        
        # Group content by specialties and procedures
        specialty_groups = defaultdict(list)
        procedure_groups = defaultdict(list)
        
        for item_id, analysis in self.content_analysis.items():
            # Add to specialty groups
            if analysis['specialties']:
                for specialty in analysis['specialties']:
                    specialty_groups[specialty].append(item_id)
            else:
                specialty_groups['general'].append(item_id)
            
            # Add to procedure groups
            if analysis['procedures']:
                for procedure in analysis['procedures']:
                    procedure_groups[procedure].append(item_id)
            else:
                procedure_groups['general'].append(item_id)
        
        # Create space cards based on medical specialties
        space_cards = []
        
        # 1. Critical Care & Life Support
        critical_care_items = []
        for specialty in ['critical_care', 'cardiovascular']:
            critical_care_items.extend(specialty_groups[specialty])
        
        # Remove duplicates but keep all items
        critical_care_items = list(set(critical_care_items))
        
        space_cards.append({
            'id': 'critical-care-life-support',
            'title': '🚨 Critical Care & Life Support',
            'color': '#dc2626',
            'description': 'Life-saving procedures and critical care management',
            'priority': 'highest',
            'content_count': len(critical_care_items),
            'collections': [
                {
                    'id': 'ecmo-management',
                    'title': 'ECMO Management',
                    'description': 'ECMO cannulation, decannulation, and management',
                    'items': [self._create_content_item(item_id) for item_id in critical_care_items if 'ecmo' in self.content_analysis[item_id]['title'].lower()]
                },
                {
                    'id': 'emergency-procedures',
                    'title': 'Emergency Procedures',
                    'description': 'Emergency trauma surgery and life-saving procedures',
                    'items': [self._create_content_item(item_id) for item_id in critical_care_items if any(term in self.content_analysis[item_id]['title'].lower() for term in ['emergency', 'trauma', 'cpr'])]
                },
                {
                    'id': 'vascular-access',
                    'title': 'Vascular Access',
                    'description': 'Central line placement and vascular procedures',
                    'items': [self._create_content_item(item_id) for item_id in critical_care_items if any(term in self.content_analysis[item_id]['title'].lower() for term in ['vascular', 'central line', 'cannulation'])]
                },
                {
                    'id': 'critical-care-general',
                    'title': 'Critical Care General',
                    'description': 'Other critical care procedures and protocols',
                    'items': [self._create_content_item(item_id) for item_id in critical_care_items if not any(term in self.content_analysis[item_id]['title'].lower() for term in ['ecmo', 'emergency', 'trauma', 'cpr', 'vascular', 'central line', 'cannulation'])]
                }
            ]
        })
        
        # 2. Surgical Procedures
        surgical_items = []
        for specialty in ['surgical', 'gastrointestinal']:
            surgical_items.extend(specialty_groups[specialty])
        
        surgical_items = list(set(surgical_items))
        
        space_cards.append({
            'id': 'surgical-procedures',
            'title': '🔪 Surgical Procedures',
            'color': '#7c3aed',
            'description': 'General and specialized surgical procedures',
            'priority': 'high',
            'content_count': len(surgical_items),
            'collections': [
                {
                    'id': 'general-surgery',
                    'title': 'General Surgery',
                    'description': 'Appendectomy, cholecystectomy, hernia repair',
                    'items': [self._create_content_item(item_id) for item_id in surgical_items if any(term in self.content_analysis[item_id]['title'].lower() for term in ['appendectomy', 'cholecystectomy', 'hernia'])]
                },
                {
                    'id': 'minimally-invasive',
                    'title': 'Minimally Invasive Surgery',
                    'description': 'Laparoscopic and thoracoscopic procedures',
                    'items': [self._create_content_item(item_id) for item_id in surgical_items if any(term in self.content_analysis[item_id]['title'].lower() for term in ['laparoscopic', 'thoracoscopic', 'minimally invasive'])]
                },
                {
                    'id': 'specialized-surgery',
                    'title': 'Specialized Surgery',
                    'description': 'Complex surgical procedures',
                    'items': [self._create_content_item(item_id) for item_id in surgical_items if not any(term in self.content_analysis[item_id]['title'].lower() for term in ['appendectomy', 'cholecystectomy', 'hernia', 'laparoscopic', 'thoracoscopic', 'minimally invasive'])]
                }
            ]
        })
        
        # 3. Neonatal & Pediatric Care
        neonatal_items = []
        for specialty in ['neonatal', 'pediatric']:
            neonatal_items.extend(specialty_groups[specialty])
        
        neonatal_items = list(set(neonatal_items))
        
        space_cards.append({
            'id': 'neonatal-pediatric-care',
            'title': '👶 Neonatal & Pediatric Care',
            'color': '#059669',
            'description': 'Specialized care for newborns and children',
            'priority': 'high',
            'content_count': len(neonatal_items),
            'collections': [
                {
                    'id': 'neonatal-surgery',
                    'title': 'Neonatal Surgery',
                    'description': 'Surgical procedures for newborns',
                    'items': [self._create_content_item(item_id) for item_id in neonatal_items if 'neonatal' in self.content_analysis[item_id]['title'].lower()]
                },
                {
                    'id': 'pediatric-surgery',
                    'title': 'Pediatric Surgery',
                    'description': 'Surgical procedures for children',
                    'items': [self._create_content_item(item_id) for item_id in neonatal_items if 'pediatric' in self.content_analysis[item_id]['title'].lower()]
                },
                {
                    'id': 'feeding-nutrition',
                    'title': 'Feeding & Nutrition',
                    'description': 'Gastrostomy and feeding procedures',
                    'items': [self._create_content_item(item_id) for item_id in neonatal_items if any(term in self.content_analysis[item_id]['title'].lower() for term in ['feeding', 'gastrostomy', 'nutrition', 'g-tube'])]
                },
                {
                    'id': 'neonatal-pediatric-general',
                    'title': 'Neonatal & Pediatric General',
                    'description': 'Other neonatal and pediatric procedures',
                    'items': [self._create_content_item(item_id) for item_id in neonatal_items if not any(term in self.content_analysis[item_id]['title'].lower() for term in ['neonatal', 'pediatric', 'feeding', 'gastrostomy', 'nutrition', 'g-tube'])]
                }
            ]
        })
        
        # 4. Clinical Guidelines & Protocols
        guideline_items = []
        for item_id, analysis in self.content_analysis.items():
            if analysis['type'] == 'guideline':
                guideline_items.append(item_id)
        
        space_cards.append({
            'id': 'clinical-guidelines',
            'title': '📋 Clinical Guidelines & Protocols',
            'color': '#0891b2',
            'description': 'Clinical protocols and evidence-based guidelines',
            'priority': 'high',
            'content_count': len(guideline_items),
            'collections': [
                {
                    'id': 'critical-care-guidelines',
                    'title': 'Critical Care Guidelines',
                    'description': 'ECMO, sepsis, and critical care protocols',
                    'items': [self._create_content_item(item_id) for item_id in guideline_items if any(term in self.content_analysis[item_id]['title'].lower() for term in ['ecmo', 'sepsis', 'critical', 'cpr'])]
                },
                {
                    'id': 'surgical-guidelines',
                    'title': 'Surgical Guidelines',
                    'description': 'Surgical protocols and procedures',
                    'items': [self._create_content_item(item_id) for item_id in guideline_items if any(term in self.content_analysis[item_id]['title'].lower() for term in ['surgical', 'surgery', 'appendectomy', 'antibiotic'])]
                },
                {
                    'id': 'neonatal-guidelines',
                    'title': 'Neonatal Guidelines',
                    'description': 'Neonatal and pediatric care protocols',
                    'items': [self._create_content_item(item_id) for item_id in guideline_items if any(term in self.content_analysis[item_id]['title'].lower() for term in ['neonatal', 'nicu', 'pediatric', 'dosing'])]
                },
                {
                    'id': 'general-guidelines',
                    'title': 'General Guidelines',
                    'description': 'Other clinical guidelines and protocols',
                    'items': [self._create_content_item(item_id) for item_id in guideline_items if not any(term in self.content_analysis[item_id]['title'].lower() for term in ['ecmo', 'sepsis', 'critical', 'cpr', 'surgical', 'surgery', 'appendectomy', 'antibiotic', 'neonatal', 'nicu', 'pediatric', 'dosing'])]
                }
            ]
        })
        
        # 5. Education & Training
        education_items = []
        for item_id, analysis in self.content_analysis.items():
            if analysis['type'] == 'document':
                education_items.append(item_id)
        
        space_cards.append({
            'id': 'education-training',
            'title': '📚 Education & Training',
            'color': '#be185d',
            'description': 'Educational materials and training resources',
            'priority': 'medium',
            'content_count': len(education_items),
            'collections': [
                {
                    'id': 'resident-training',
                    'title': 'Resident Training',
                    'description': 'Resident curriculum and training materials',
                    'items': [self._create_content_item(item_id) for item_id in education_items if any(term in self.content_analysis[item_id]['title'].lower() for term in ['resident', 'curriculum', 'training'])]
                },
                {
                    'id': 'fellowship-program',
                    'title': 'Fellowship Program',
                    'description': 'Fellowship training and case requirements',
                    'items': [self._create_content_item(item_id) for item_id in education_items if any(term in self.content_analysis[item_id]['title'].lower() for term in ['fellow', 'fellowship', 'case', 'requirements'])]
                },
                {
                    'id': 'competency-assessment',
                    'title': 'Competency Assessment',
                    'description': 'Goals, objectives, and competency tracking',
                    'items': [self._create_content_item(item_id) for item_id in education_items if any(term in self.content_analysis[item_id]['title'].lower() for term in ['goals', 'objectives', 'competencies', 'tracked'])]
                },
                {
                    'id': 'general-education',
                    'title': 'General Education',
                    'description': 'Other educational materials and documents',
                    'items': [self._create_content_item(item_id) for item_id in education_items if not any(term in self.content_analysis[item_id]['title'].lower() for term in ['resident', 'curriculum', 'training', 'fellow', 'fellowship', 'case', 'requirements', 'goals', 'objectives', 'competencies', 'tracked'])]
                }
            ]
        })
        
        # 6. Additional Medical Specialties - Catch ALL remaining content
        remaining_items = []
        used_items = set()
        
        # Collect all used items
        for space_card in space_cards:
            for collection in space_card['collections']:
                for item in collection['items']:
                    used_items.add(item['id'])
        
        # Find remaining items
        for item_id in self.content_analysis:
            if item_id not in used_items:
                remaining_items.append(item_id)
        
        if remaining_items:
            space_cards.append({
                'id': 'additional-specialties',
                'title': '🏥 Additional Medical Specialties',
                'color': '#6b7280',
                'description': 'Other medical specialties and procedures',
                'priority': 'medium',
                'content_count': len(remaining_items),
                'collections': [
                    {
                        'id': 'additional-procedures',
                        'title': 'Additional Procedures',
                        'description': 'Other medical procedures and specialties',
                        'items': [self._create_content_item(item_id) for item_id in remaining_items]
                    }
                ]
            })
        
        return space_cards
    
    def _create_content_item(self, item_id):
        """Create a content item from analysis data"""
        analysis = self.content_analysis[item_id]
        return {
            'id': item_id,
            'title': analysis['title'],
            'type': analysis['type'],
            'specialty': analysis['specialties'][0] if analysis['specialties'] else 'general',
            'urgency': 'routine',
            'fileUrl': analysis['fileUrl']
        }
    
    def generate_comprehensive_structure(self):
        """Generate the complete comprehensive structure"""
        print("🚀 Starting Comprehensive Content Analysis...")
        
        self.load_transcription_data()
        self.analyze_content_patterns()
        space_cards = self.create_comprehensive_categories()
        
        # Recalculate counts
        total_content = 0
        for space_card in space_cards:
            space_card_total = 0
            for collection in space_card['collections']:
                space_card_total += len(collection['items'])
            space_card['content_count'] = space_card_total
            total_content += space_card_total
        
        structure = {
            'space_cards': space_cards,
            'total_content': total_content,
            'analysis_summary': {
                'total_items_analyzed': len(self.content_analysis),
                'total_items_included': total_content,
                'categories_created': len(space_cards),
                'collections_created': sum(len(sc['collections']) for sc in space_cards)
            }
        }
        
        print(f"✅ Generated comprehensive structure with {total_content} items")
        print(f"📊 All {len(self.content_analysis)} analyzed items included")
        
        return structure
    
    def save_structure(self, structure):
        """Save the comprehensive structure"""
        print("💾 Saving comprehensive structure...")
        
        with open('intelligent_space_structure.json', 'w') as f:
            json.dump(structure, f, indent=2)
        
        print("✅ Comprehensive structure saved")

if __name__ == "__main__":
    analyzer = ComprehensiveContentAnalyzer()
    structure = analyzer.generate_comprehensive_structure()
    analyzer.save_structure(structure)
    print("🎉 Comprehensive content analysis complete!")
