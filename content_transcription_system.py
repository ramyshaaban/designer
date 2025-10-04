#!/usr/bin/env python3
"""
Comprehensive Content Transcription System for CCHMC Space
Extracts text from documents and creates transcription framework for videos
"""

import json
import requests
import os
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
import time
from pathlib import Path
from collections import defaultdict

class ContentTranscriptionSystem:
    def __init__(self):
        self.api_base = "http://localhost:3000"
        self.analysis_data = {}
        self.transcription_results = {}
        self.output_folder = "content_transcriptions"
        
        # Create output folder
        Path(self.output_folder).mkdir(exist_ok=True)
        
        # Subfolders for different content types
        Path(f"{self.output_folder}/videos").mkdir(exist_ok=True)
        Path(f"{self.output_folder}/documents").mkdir(exist_ok=True)
        Path(f"{self.output_folder}/guidelines").mkdir(exist_ok=True)
        Path(f"{self.output_folder}/images").mkdir(exist_ok=True)
        
    def load_analysis_data(self):
        """Load existing analysis data"""
        print("📄 Loading analysis data...")
        
        with open('detailed_content_analysis.json', 'r') as f:
            self.analysis_data = json.load(f)
        
        print(f"✅ Loaded analysis for {len(self.analysis_data)} items")
    
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
    
    def extract_text_from_pdf_url(self, pdf_url: str) -> str:
        """
        Extract text from PDF URL
        Note: This is a simplified version. In production, you'd use PyPDF2, pdfplumber, or similar
        """
        try:
            # For now, we'll return metadata-based text extraction
            # In a production environment, you'd implement actual PDF text extraction
            return "PDF text extraction not implemented in this demo version"
        except Exception as e:
            print(f"⚠️ Could not extract text from PDF {pdf_url}: {e}")
            return ""
    
    def create_video_transcription_framework(self, video_item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a transcription framework for video content
        Note: Actual video transcription requires speech-to-text services
        """
        transcription = {
            'video_id': video_item['id'],
            'title': video_item['title'],
            'file_url': video_item['file_url'],
            'analysis': video_item['content_analysis'],
            'transcription_status': 'framework_created',
            'transcription_method': 'manual_or_ai_service_required',
            'estimated_duration': 'unknown',
            'transcription_text': '',
            'key_timestamps': [],
            'medical_terms_found': video_item['content_analysis'].get('medical_terms', []),
            'procedure_type': video_item['content_analysis'].get('procedure_type', 'unknown'),
            'specialty': video_item['content_analysis'].get('specialty', 'unknown'),
            'complexity': video_item['content_analysis'].get('complexity', 'unknown'),
            'transcription_notes': self._generate_transcription_notes(video_item),
            'created_at': datetime.now().isoformat()
        }
        
        return transcription
    
    def _generate_transcription_notes(self, video_item: Dict[str, Any]) -> str:
        """Generate helpful notes for video transcription"""
        analysis = video_item['content_analysis']
        procedure_type = analysis.get('procedure_type', 'Unknown procedure')
        specialty = analysis.get('specialty', 'unknown')
        complexity = analysis.get('complexity', 'unknown')
        
        notes = f"""
TRANSCRIPTION NOTES FOR: {video_item['title']}

PROCEDURE TYPE: {procedure_type}
MEDICAL SPECIALTY: {specialty}
COMPLEXITY LEVEL: {complexity}

EXPECTED CONTENT:
- This appears to be a {procedure_type.lower()}
- Medical specialty: {specialty}
- Complexity: {complexity}

KEY MEDICAL TERMS TO LISTEN FOR:
{', '.join(analysis.get('medical_terms', []))}

TRANSCRIPTION GUIDELINES:
1. Note all medical terminology accurately
2. Include step-by-step procedure details
3. Note any safety warnings or precautions
4. Include equipment and medication names
5. Note timing for critical steps
6. Include any patient positioning instructions

RECOMMENDED TRANSCRIPTION METHOD:
- Use professional medical transcription service
- Consider AI speech-to-text with medical vocabulary
- Manual transcription by medical professional
- Review by specialty physician for accuracy
        """
        
        return notes.strip()
    
    def extract_document_text(self, document_item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract text from document content
        Note: This creates a framework for text extraction
        """
        extraction = {
            'document_id': document_item['id'],
            'title': document_item['title'],
            'file_url': document_item['file_url'],
            'analysis': document_item['filename_analysis'],
            'extraction_status': 'framework_created',
            'extraction_method': 'manual_or_pdf_library_required',
            'extracted_text': '',
            'key_sections': [],
            'medical_terms_found': document_item['filename_analysis'].get('medical_terms', []),
            'content_type': document_item['filename_analysis'].get('content_type', 'unknown'),
            'specialty': document_item['filename_analysis'].get('specialty', 'unknown'),
            'urgency': document_item['filename_analysis'].get('urgency', 'routine'),
            'extraction_notes': self._generate_extraction_notes(document_item),
            'created_at': datetime.now().isoformat()
        }
        
        return extraction
    
    def _generate_extraction_notes(self, document_item: Dict[str, Any]) -> str:
        """Generate helpful notes for document text extraction"""
        analysis = document_item['filename_analysis']
        content_type = analysis.get('content_type', 'unknown')
        specialty = analysis.get('specialty', 'unknown')
        urgency = analysis.get('urgency', 'routine')
        
        notes = f"""
TEXT EXTRACTION NOTES FOR: {document_item['title']}

DOCUMENT TYPE: {content_type}
MEDICAL SPECIALTY: {specialty}
URGENCY LEVEL: {urgency}

EXPECTED CONTENT:
- This appears to be a {content_type} document
- Medical specialty: {specialty}
- Urgency: {urgency}

KEY MEDICAL TERMS TO EXTRACT:
{', '.join(analysis.get('medical_terms', []))}

EXTRACTION GUIDELINES:
1. Extract all text content accurately
2. Preserve formatting and structure
3. Note section headers and subsections
4. Extract tables and lists
5. Include references and citations
6. Note version numbers and dates

RECOMMENDED EXTRACTION METHOD:
- Use PyPDF2 or pdfplumber for PDF files
- Use OCR for scanned documents
- Manual extraction for complex formatting
- Review by medical professional for accuracy
        """
        
        return notes.strip()
    
    def process_all_content(self):
        """Process all content items for transcription/extraction"""
        print("🔄 Processing all content for transcription/extraction...")
        
        video_count = 0
        document_count = 0
        guideline_count = 0
        image_count = 0
        
        for item_id, analysis in self.analysis_data.items():
            content_type = analysis['type']
            
            if content_type == 'video':
                video_count += 1
                print(f"📹 Processing video {video_count}/152: {analysis['title'][:50]}...")
                
                transcription = self.create_video_transcription_framework(analysis)
                self.transcription_results[item_id] = transcription
                
                # Save individual transcription file
                self._save_transcription_file(item_id, transcription, 'videos')
                
            elif content_type in ['document', 'guideline']:
                if content_type == 'document':
                    document_count += 1
                    print(f"📄 Processing document {document_count}/26: {analysis['title'][:50]}...")
                else:
                    guideline_count += 1
                    print(f"📋 Processing guideline {guideline_count}/163: {analysis['title'][:50]}...")
                
                extraction = self.extract_document_text(analysis)
                self.transcription_results[item_id] = extraction
                
                # Save individual extraction file
                folder = 'guidelines' if content_type == 'guideline' else 'documents'
                self._save_transcription_file(item_id, extraction, folder)
                
            elif content_type == 'image':
                image_count += 1
                print(f"🖼️ Processing image {image_count}/4: {analysis['title'][:50]}...")
                
                # For images, create metadata extraction
                image_extraction = {
                    'image_id': analysis['id'],
                    'title': analysis['title'],
                    'file_url': analysis['file_url'],
                    'extraction_status': 'metadata_only',
                    'extraction_method': 'ocr_required_for_text',
                    'extracted_text': '',
                    'image_description': f"Medical image: {analysis['title']}",
                    'ocr_notes': "OCR (Optical Character Recognition) required to extract text from image",
                    'created_at': datetime.now().isoformat()
                }
                
                self.transcription_results[item_id] = image_extraction
                self._save_transcription_file(item_id, image_extraction, 'images')
            
            # Small delay to avoid overwhelming the system
            time.sleep(0.1)
        
        print(f"✅ Processing complete!")
        print(f"📹 Videos processed: {video_count}")
        print(f"📄 Documents processed: {document_count}")
        print(f"📋 Guidelines processed: {guideline_count}")
        print(f"🖼️ Images processed: {image_count}")
    
    def _save_transcription_file(self, item_id: str, data: Dict[str, Any], folder: str):
        """Save individual transcription/extraction file"""
        filename = f"{item_id.replace('/', '_').replace(' ', '_')}.json"
        filepath = f"{self.output_folder}/{folder}/{filename}"
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def create_summary_reports(self):
        """Create summary reports for each content type"""
        print("📊 Creating summary reports...")
        
        # Video transcription summary
        video_transcriptions = {k: v for k, v in self.transcription_results.items() 
                              if v.get('transcription_status') == 'framework_created'}
        
        video_summary = {
            'total_videos': len(video_transcriptions),
            'transcription_status': 'frameworks_created',
            'next_steps': [
                'Implement speech-to-text service (e.g., AWS Transcribe, Google Speech-to-Text)',
                'Use medical vocabulary for better accuracy',
                'Manual review by medical professionals',
                'Create timestamp annotations for key procedures'
            ],
            'videos_by_specialty': self._group_by_specialty(video_transcriptions),
            'videos_by_complexity': self._group_by_complexity(video_transcriptions),
            'estimated_transcription_time': f"{len(video_transcriptions) * 2} hours (estimated 2 hours per video)"
        }
        
        with open(f"{self.output_folder}/video_transcription_summary.json", 'w') as f:
            json.dump(video_summary, f, indent=2, default=str)
        
        # Document extraction summary
        document_extractions = {k: v for k, v in self.transcription_results.items() 
                              if v.get('extraction_status') == 'framework_created'}
        
        document_summary = {
            'total_documents': len(document_extractions),
            'extraction_status': 'frameworks_created',
            'next_steps': [
                'Implement PDF text extraction (PyPDF2, pdfplumber)',
                'Use OCR for scanned documents',
                'Manual extraction for complex formatting',
                'Review by medical professionals'
            ],
            'documents_by_type': self._group_by_content_type(document_extractions),
            'documents_by_specialty': self._group_by_specialty(document_extractions),
            'estimated_extraction_time': f"{len(document_extractions) * 0.5} hours (estimated 30 minutes per document)"
        }
        
        with open(f"{self.output_folder}/document_extraction_summary.json", 'w') as f:
            json.dump(document_summary, f, indent=2, default=str)
        
        # Overall summary
        overall_summary = {
            'total_content_items': len(self.transcription_results),
            'videos': len(video_transcriptions),
            'documents': len(document_extractions),
            'images': len([k for k, v in self.transcription_results.items() 
                          if v.get('extraction_status') == 'metadata_only']),
            'transcription_status': 'frameworks_created',
            'created_at': datetime.now().isoformat(),
            'next_steps': [
                'Implement actual transcription services',
                'Set up PDF text extraction',
                'Configure OCR for images',
                'Establish review workflow',
                'Create searchable text database'
            ]
        }
        
        with open(f"{self.output_folder}/transcription_overview.json", 'w') as f:
            json.dump(overall_summary, f, indent=2, default=str)
        
        print("✅ Summary reports created")
    
    def _group_by_specialty(self, items: Dict[str, Any]) -> Dict[str, int]:
        """Group items by medical specialty"""
        specialties = defaultdict(int)
        for item in items.values():
            specialty = item.get('specialty', 'unknown')
            specialties[specialty] += 1
        return dict(specialties)
    
    def _group_by_complexity(self, items: Dict[str, Any]) -> Dict[str, int]:
        """Group items by complexity"""
        complexities = defaultdict(int)
        for item in items.values():
            complexity = item.get('complexity', 'unknown')
            complexities[complexity] += 1
        return dict(complexities)
    
    def _group_by_content_type(self, items: Dict[str, Any]) -> Dict[str, int]:
        """Group items by content type"""
        types = defaultdict(int)
        for item in items.values():
            content_type = item.get('content_type', 'unknown')
            types[content_type] += 1
        return dict(types)
    
    def create_implementation_guide(self):
        """Create implementation guide for actual transcription"""
        guide = {
            'title': 'CCHMC Content Transcription Implementation Guide',
            'created_at': datetime.now().isoformat(),
            'overview': 'This guide provides step-by-step instructions for implementing actual content transcription',
            
            'video_transcription': {
                'description': 'Transcribe 152 surgical and medical procedure videos',
                'recommended_services': [
                    'AWS Transcribe Medical',
                    'Google Speech-to-Text with medical vocabulary',
                    'Microsoft Azure Speech Services',
                    'Professional medical transcription services'
                ],
                'implementation_steps': [
                    'Set up cloud transcription service',
                    'Configure medical vocabulary',
                    'Process videos in batches',
                    'Review and correct transcriptions',
                    'Add timestamp annotations',
                    'Create searchable database'
                ],
                'estimated_cost': '$500-2000 for 152 videos',
                'estimated_time': '2-4 weeks'
            },
            
            'document_extraction': {
                'description': 'Extract text from 189 PDF documents and guidelines',
                'recommended_tools': [
                    'PyPDF2 for PDF text extraction',
                    'pdfplumber for complex PDFs',
                    'Tesseract OCR for scanned documents',
                    'Adobe Acrobat Pro for complex formatting'
                ],
                'implementation_steps': [
                    'Install PDF extraction libraries',
                    'Process documents in batches',
                    'Handle different PDF formats',
                    'Extract tables and formatting',
                    'Create searchable text database'
                ],
                'estimated_cost': '$200-500 for tools and processing',
                'estimated_time': '1-2 weeks'
            },
            
            'image_ocr': {
                'description': 'Extract text from 4 medical images',
                'recommended_tools': [
                    'Tesseract OCR',
                    'Google Cloud Vision API',
                    'AWS Textract',
                    'Azure Computer Vision'
                ],
                'implementation_steps': [
                    'Set up OCR service',
                    'Process images',
                    'Review extracted text',
                    'Integrate with search system'
                ],
                'estimated_cost': '$50-100',
                'estimated_time': '1-2 days'
            },
            
            'integration': {
                'description': 'Integrate all transcribed content into searchable system',
                'recommended_approach': [
                    'Create unified search index',
                    'Implement medical terminology search',
                    'Add content categorization',
                    'Create user interface for searching',
                    'Implement content recommendations'
                ],
                'estimated_time': '2-3 weeks'
            }
        }
        
        with open(f"{self.output_folder}/IMPLEMENTATION_GUIDE.json", 'w') as f:
            json.dump(guide, f, indent=2, default=str)
        
        print("✅ Implementation guide created")

def main():
    print("🚀 Starting Content Transcription System...")
    
    system = ContentTranscriptionSystem()
    
    # Load analysis data
    system.load_analysis_data()
    
    # Process all content
    system.process_all_content()
    
    # Create summary reports
    system.create_summary_reports()
    
    # Create implementation guide
    system.create_implementation_guide()
    
    print("🎉 Content transcription system setup complete!")
    print(f"📁 Transcription files saved in: {system.output_folder}/")
    print("📋 Next steps: Review implementation guide and set up actual transcription services")

if __name__ == "__main__":
    main()
