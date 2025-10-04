#!/usr/bin/env python3
"""
Intelligent Structure File URL Mapper
Maps intelligent structure content to actual S3 file URLs from the original API
"""

import json
import requests
from typing import Dict, List, Any

class IntelligentStructureMapper:
    def __init__(self):
        self.api_base = "http://localhost:3000"
        self.original_content = []
        self.intelligent_structure = {}
        
    def load_original_content(self):
        """Load original content from the API to get file URLs"""
        print("📡 Loading original content from API...")
        
        try:
            response = requests.get(f"{self.api_base}/api/space-content?spaceId=4")
            response.raise_for_status()
            data = response.json()
            self.original_content = data.get('content', [])
            print(f"✅ Loaded {len(self.original_content)} original content items")
        except Exception as e:
            print(f"❌ Error loading original content: {e}")
            return False
        return True
    
    def load_intelligent_structure(self):
        """Load the intelligent structure"""
        print("📄 Loading intelligent structure...")
        
        try:
            with open('intelligent_space_structure.json', 'r') as f:
                self.intelligent_structure = json.load(f)
            print(f"✅ Loaded intelligent structure with {len(self.intelligent_structure.get('space_cards', []))} space cards")
        except Exception as e:
            print(f"❌ Error loading intelligent structure: {e}")
            return False
        return True
    
    def create_id_to_fileurl_mapping(self) -> Dict[str, str]:
        """Create mapping from content ID to file URL"""
        print("🔗 Creating ID to file URL mapping...")
        
        mapping = {}
        
        for item in self.original_content:
            content_id = item.get('id', '')
            file_url = item.get('fileUrl', '')
            
            if content_id and file_url:
                mapping[content_id] = file_url
        
        print(f"✅ Created mapping for {len(mapping)} content items")
        return mapping
    
    def map_intelligent_structure_to_fileurls(self, id_mapping: Dict[str, str]):
        """Map intelligent structure content to file URLs"""
        print("🗺️ Mapping intelligent structure to file URLs...")
        
        mapped_count = 0
        total_count = 0
        
        for space_card in self.intelligent_structure.get('space_cards', []):
            for collection in space_card.get('collections', []):
                for item in collection.get('items', []):
                    total_count += 1
                    item_id = item.get('id', '')
                    
                    # Try to find matching file URL
                    if item_id in id_mapping:
                        item['fileUrl'] = id_mapping[item_id]
                        mapped_count += 1
                    else:
                        # Try alternative matching strategies
                        file_url = self._find_alternative_match(item_id, id_mapping)
                        if file_url:
                            item['fileUrl'] = file_url
                            mapped_count += 1
                        else:
                            # Use item_id as fallback (will need to be handled in frontend)
                            item['fileUrl'] = item_id
                            print(f"⚠️ No file URL found for {item_id}")
        
        print(f"✅ Mapped {mapped_count}/{total_count} items to file URLs")
    
    def _find_alternative_match(self, item_id: str, id_mapping: Dict[str, str]) -> str:
        """Try alternative matching strategies"""
        
        # Strategy 1: Extract filename from item_id and match
        if '_' in item_id:
            filename = item_id.split('_', 1)[1]  # Get everything after first underscore
            for mapped_id, file_url in id_mapping.items():
                if filename in mapped_id:
                    return file_url
        
        # Strategy 2: Match by partial filename
        if '.' in item_id:
            base_name = item_id.split('.')[0]
            for mapped_id, file_url in id_mapping.items():
                if base_name in mapped_id:
                    return file_url
        
        return ""
    
    def save_mapped_structure(self):
        """Save the mapped intelligent structure"""
        print("💾 Saving mapped intelligent structure...")
        
        with open('intelligent_space_structure.json', 'w') as f:
            json.dump(self.intelligent_structure, f, indent=2, default=str)
        
        print("✅ Mapped intelligent structure saved")
    
    def run_mapping(self):
        """Run the complete mapping process"""
        print("🚀 Starting Intelligent Structure File URL Mapping...")
        
        # Load data
        if not self.load_original_content():
            return False
        
        if not self.load_intelligent_structure():
            return False
        
        # Create mapping
        id_mapping = self.create_id_to_fileurl_mapping()
        
        # Map intelligent structure
        self.map_intelligent_structure_to_fileurls(id_mapping)
        
        # Save results
        self.save_mapped_structure()
        
        print("🎉 Intelligent structure mapping complete!")
        return True

def main():
    mapper = IntelligentStructureMapper()
    mapper.run_mapping()

if __name__ == "__main__":
    main()
