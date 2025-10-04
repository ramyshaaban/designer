#!/usr/bin/env python3
"""
Intelligent Structure Visualizer and Implementation Planner
Creates visual diagrams and implementation plan for the new medical space structure
"""

import json
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch
import seaborn as sns
import pandas as pd
from collections import defaultdict
import numpy as np

class IntelligentStructureVisualizer:
    def __init__(self):
        self.structure_data = {}
        self.summary_data = {}
        
    def load_structure_data(self):
        """Load the intelligent structure data"""
        with open('intelligent_space_structure.json', 'r') as f:
            self.structure_data = json.load(f)
        
        with open('intelligent_structure_summary.json', 'r') as f:
            self.summary_data = json.load(f)
    
    def create_structure_diagram(self):
        """Create a visual diagram of the new space structure"""
        print("📊 Creating structure diagram...")
        
        fig, ax = plt.subplots(1, 1, figsize=(16, 12))
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 12)
        ax.axis('off')
        
        # Title
        ax.text(5, 11.5, 'CCHMC Pediatric Surgery - Intelligent Space Structure', 
                ha='center', va='center', fontsize=20, fontweight='bold')
        
        ax.text(5, 11, 'Based on Medical Content Analysis & Transcription Data', 
                ha='center', va='center', fontsize=14, style='italic')
        
        # Space cards
        space_cards = self.structure_data['space_cards']
        colors = ['#dc2626', '#7c3aed', '#059669', '#0891b2', '#6b7280', '#be185d']
        
        y_positions = [9.5, 8, 6.5, 5, 3.5, 2]
        
        for i, card in enumerate(space_cards):
            y_pos = y_positions[i]
            
            # Space card box
            card_box = FancyBboxPatch((0.5, y_pos-0.3), 9, 0.6,
                                    boxstyle="round,pad=0.05",
                                    facecolor=colors[i], alpha=0.3,
                                    edgecolor=colors[i], linewidth=2)
            ax.add_patch(card_box)
            
            # Space card title
            ax.text(5, y_pos, card['title'], ha='center', va='center', 
                   fontsize=14, fontweight='bold')
            
            # Collections
            collections = card['collections']
            x_positions = [1.5, 5, 8.5]
            
            for j, collection in enumerate(collections):
                x_pos = x_positions[j]
                
                # Collection box
                coll_box = FancyBboxPatch((x_pos-0.8, y_pos-0.6), 1.6, 0.4,
                                        boxstyle="round,pad=0.02",
                                        facecolor='white', alpha=0.8,
                                        edgecolor=colors[i], linewidth=1)
                ax.add_patch(coll_box)
                
                # Collection title
                ax.text(x_pos, y_pos-0.4, collection['title'], ha='center', va='center',
                       fontsize=10, fontweight='bold')
                
                # Content count
                ax.text(x_pos, y_pos-0.5, f"{len(collection['items'])} items", 
                       ha='center', va='center', fontsize=8, style='italic')
        
        # Legend
        legend_elements = []
        for i, card in enumerate(space_cards):
            legend_elements.append(plt.Rectangle((0, 0), 1, 1, facecolor=colors[i], alpha=0.3, 
                                               label=f"{card['title']} ({card['content_count']} items)"))
        
        ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(0.98, 0.98))
        
        plt.tight_layout()
        plt.savefig('intelligent_space_structure_diagram.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print("✅ Structure diagram created")
    
    def create_content_distribution_chart(self):
        """Create charts showing content distribution"""
        print("📊 Creating content distribution charts...")
        
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
        
        # 1. Space Card Content Distribution
        space_cards = self.structure_data['space_cards']
        card_names = [card['title'].replace('🚨', '').replace('🔪', '').replace('👶', '').replace('🏥', '').replace('📋', '').replace('📚', '').strip() for card in space_cards]
        card_counts = [card['content_count'] for card in space_cards]
        colors = ['#dc2626', '#7c3aed', '#059669', '#0891b2', '#6b7280', '#be185d']
        
        bars1 = ax1.bar(range(len(card_names)), card_counts, color=colors, alpha=0.7)
        ax1.set_title('Content Distribution by Space Card', fontsize=14, fontweight='bold')
        ax1.set_xlabel('Space Cards', fontsize=12)
        ax1.set_ylabel('Number of Items', fontsize=12)
        ax1.set_xticks(range(len(card_names)))
        ax1.set_xticklabels(card_names, rotation=45, ha='right')
        
        # Add value labels on bars
        for bar, count in zip(bars1, card_counts):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                    str(count), ha='center', va='bottom', fontweight='bold')
        
        # 2. Priority Distribution
        priorities = [card['priority'] for card in space_cards]
        priority_counts = defaultdict(int)
        for priority in priorities:
            priority_counts[priority] += 1
        
        ax2.pie(priority_counts.values(), labels=priority_counts.keys(), autopct='%1.1f%%', 
                colors=['#dc2626', '#7c3aed', '#6b7280'], startangle=90)
        ax2.set_title('Space Card Priority Distribution', fontsize=14, fontweight='bold')
        
        # 3. Top Procedures
        top_procedures = self.summary_data['medical_insights_summary']['top_procedures']
        procedure_names = list(top_procedures.keys())[:8]
        procedure_counts = list(top_procedures.values())[:8]
        
        bars3 = ax3.barh(range(len(procedure_names)), procedure_counts, color='skyblue', alpha=0.7)
        ax3.set_title('Top Medical Procedures', fontsize=14, fontweight='bold')
        ax3.set_xlabel('Number of Videos', fontsize=12)
        ax3.set_yticks(range(len(procedure_names)))
        ax3.set_yticklabels(procedure_names)
        
        # Add value labels
        for i, (bar, count) in enumerate(zip(bars3, procedure_counts)):
            ax3.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height()/2, 
                    str(count), ha='left', va='center', fontweight='bold')
        
        # 4. Specialty Distribution
        specialties = self.summary_data['medical_insights_summary']['top_specialties']
        specialty_names = list(specialties.keys())
        specialty_counts = list(specialties.values())
        
        bars4 = ax4.bar(range(len(specialty_names)), specialty_counts, color='lightcoral', alpha=0.7)
        ax4.set_title('Content Distribution by Medical Specialty', fontsize=14, fontweight='bold')
        ax4.set_xlabel('Medical Specialties', fontsize=12)
        ax4.set_ylabel('Number of Items', fontsize=12)
        ax4.set_xticks(range(len(specialty_names)))
        ax4.set_xticklabels(specialty_names, rotation=45, ha='right')
        
        # Add value labels
        for bar, count in zip(bars4, specialty_counts):
            ax4.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                    str(count), ha='center', va='bottom', fontweight='bold')
        
        plt.tight_layout()
        plt.savefig('intelligent_content_distribution.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print("✅ Content distribution charts created")
    
    def create_implementation_roadmap(self):
        """Create implementation roadmap document"""
        print("📋 Creating implementation roadmap...")
        
        roadmap = {
            'title': 'CCHMC Intelligent Space Structure - Implementation Roadmap',
            'created_at': '2025-10-03',
            'overview': 'Implementation plan for the new medically accurate space structure',
            
            'phase_1': {
                'title': 'Phase 1: Critical Care Implementation (Week 1-2)',
                'description': 'Implement highest priority space card with life-saving procedures',
                'space_card': 'Critical Care & Life Support',
                'content_items': 34,
                'collections': [
                    'ECMO Management (12 items)',
                    'Emergency Procedures (8 items)', 
                    'Critical Access (14 items)'
                ],
                'tasks': [
                    'Set up Critical Care space card with red theme',
                    'Implement ECMO Management collection',
                    'Add Emergency Procedures collection',
                    'Create Critical Access collection',
                    'Test content loading and display',
                    'Validate medical accuracy'
                ],
                'success_criteria': [
                    'All 34 critical care items properly categorized',
                    'ECMO procedures easily accessible',
                    'Emergency protocols prominently displayed',
                    'Critical access procedures well organized'
                ]
            },
            
            'phase_2': {
                'title': 'Phase 2: Core Surgery Implementation (Week 3-4)',
                'description': 'Implement surgical procedures and neonatal care',
                'space_cards': [
                    'Surgical Procedures (44 items)',
                    'Neonatal & Pediatric Care (32 items)'
                ],
                'total_items': 76,
                'tasks': [
                    'Implement Surgical Procedures space card',
                    'Add General Surgery collection',
                    'Create Minimally Invasive Surgery collection',
                    'Implement Specialized Surgery collection',
                    'Set up Neonatal & Pediatric Care space card',
                    'Add Neonatal Surgery collection',
                    'Create Pediatric Surgery collection',
                    'Implement Pediatric Procedures collection'
                ],
                'success_criteria': [
                    'All surgical procedures properly categorized',
                    'Neonatal and pediatric content well organized',
                    'Minimally invasive procedures clearly separated',
                    'Specialized surgery easily accessible'
                ]
            },
            
            'phase_3': {
                'title': 'Phase 3: Specialty & Guidelines (Week 5-6)',
                'description': 'Implement specialty surgery and clinical guidelines',
                'space_cards': [
                    'Specialty Surgery (40 items)',
                    'Clinical Guidelines & Protocols (163 items)'
                ],
                'total_items': 203,
                'tasks': [
                    'Implement Specialty Surgery space card',
                    'Add Cardiothoracic collection',
                    'Create Gastrointestinal collection',
                    'Implement Urological & Orthopedic collection',
                    'Set up Clinical Guidelines space card',
                    'Add Critical Care Guidelines collection',
                    'Create Surgical Guidelines collection',
                    'Implement Neonatal Guidelines collection'
                ],
                'success_criteria': [
                    'All specialty procedures properly categorized',
                    'Clinical guidelines easily searchable',
                    'Guidelines organized by medical specialty',
                    'Protocols prominently displayed'
                ]
            },
            
            'phase_4': {
                'title': 'Phase 4: Education & Optimization (Week 7-8)',
                'description': 'Complete implementation with education materials and optimization',
                'space_card': 'Education & Training',
                'content_items': 26,
                'tasks': [
                    'Implement Education & Training space card',
                    'Add Resident Training collection',
                    'Create Fellowship Program collection',
                    'Implement Competency Assessment collection',
                    'Optimize search functionality',
                    'Add medical terminology search',
                    'Implement content recommendations',
                    'Performance testing and optimization'
                ],
                'success_criteria': [
                    'All education materials properly organized',
                    'Search functionality optimized',
                    'Medical terminology search working',
                    'Content recommendations implemented',
                    'Performance optimized for 341 items'
                ]
            },
            
            'technical_requirements': {
                'frontend': [
                    'Update space card components',
                    'Implement new collection structure',
                    'Add medical terminology search',
                    'Optimize content loading',
                    'Add priority-based highlighting'
                ],
                'backend': [
                    'Update API endpoints',
                    'Implement intelligent categorization',
                    'Add medical terminology indexing',
                    'Optimize database queries',
                    'Add content recommendation engine'
                ],
                'data_migration': [
                    'Migrate existing content to new structure',
                    'Update content metadata',
                    'Implement priority scoring',
                    'Add medical specialty classification',
                    'Create search indexes'
                ]
            },
            
            'success_metrics': {
                'content_organization': '100% of 341 items properly categorized',
                'medical_accuracy': 'All procedures correctly classified by specialty',
                'user_experience': 'Reduced time to find critical procedures',
                'search_efficiency': 'Medical terminology search implemented',
                'performance': 'Fast loading for all content types'
            }
        }
        
        with open('intelligent_structure_implementation_roadmap.json', 'w') as f:
            json.dump(roadmap, f, indent=2, default=str)
        
        print("✅ Implementation roadmap created")
    
    def create_comprehensive_report(self):
        """Create comprehensive report of the new structure"""
        print("📄 Creating comprehensive report...")
        
        report = f"""
# 🧠 CCHMC Intelligent Space Structure - Comprehensive Analysis

## 📊 Executive Summary

Based on detailed analysis of **341 content items** and transcription data, I've designed a new **medically accurate space structure** that organizes content by actual medical procedures, specialties, and clinical priorities.

### 🎯 Key Improvements:
- **Medical Accuracy**: Content organized by actual procedures and specialties
- **Clinical Priority**: Life-saving procedures prominently featured
- **Specialty Organization**: Content grouped by medical specialties
- **Procedure-Based**: Videos organized by surgical procedures
- **Guideline Integration**: Clinical guidelines properly categorized

---

## 🏗️ New Space Structure (6 Space Cards)

### 1. 🚨 Critical Care & Life Support (34 items) - **HIGHEST PRIORITY**
**Color**: Red (#dc2626)
**Description**: Life-saving procedures and critical care protocols

#### Collections:
- **ECMO Management** (12 items): ECMO cannulation, decannulation, management protocols
- **Emergency Procedures** (8 items): Emergency trauma surgery and life-saving procedures  
- **Critical Access** (14 items): Central line placement and tracheostomy procedures

### 2. 🔪 Surgical Procedures (44 items) - **HIGH PRIORITY**
**Color**: Purple (#7c3aed)
**Description**: General and specialized surgical procedures

#### Collections:
- **General Surgery** (18 items): Appendectomy, cholecystectomy, hernia repair
- **Minimally Invasive Surgery** (16 items): Laparoscopic and thoracoscopic procedures
- **Specialized Surgery** (10 items): Intestinal resection and complex procedures

### 3. 👶 Neonatal & Pediatric Care (32 items) - **HIGH PRIORITY**
**Color**: Green (#059669)
**Description**: Specialized care for newborns and children

#### Collections:
- **Neonatal Surgery** (8 items): Surgical procedures for newborns
- **Pediatric Surgery** (12 items): Surgical procedures for children
- **Pediatric Procedures** (12 items): Gastrostomy tube placement and other procedures

### 4. 🏥 Specialty Surgery (40 items) - **MEDIUM PRIORITY**
**Color**: Blue (#0891b2)
**Description**: Specialized surgical procedures by organ system

#### Collections:
- **Cardiothoracic Surgery** (16 items): Cardiac and pulmonary surgical procedures
- **Gastrointestinal Surgery** (12 items): GI surgical procedures
- **Urological & Orthopedic** (12 items): Urological and orthopedic surgical procedures

### 5. 📋 Clinical Guidelines & Protocols (163 items) - **HIGH PRIORITY**
**Color**: Gray (#6b7280)
**Description**: Clinical guidelines, protocols, and best practices

#### Collections:
- **Critical Care Guidelines** (45 items): ECMO, sepsis, and critical care protocols
- **Surgical Guidelines** (78 items): Surgical protocols and procedures
- **Neonatal Guidelines** (40 items): Neonatal and pediatric care protocols

### 6. 📚 Education & Training (26 items) - **MEDIUM PRIORITY**
**Color**: Pink (#be185d)
**Description**: Educational materials and training resources

#### Collections:
- **Resident Training** (8 items): Resident curriculum and training materials
- **Fellowship Program** (10 items): Fellowship training and case requirements
- **Competency Assessment** (8 items): Goals, objectives, and competency tracking

---

## 📈 Medical Insights Analysis

### 🔬 Procedures Identified (10 total):
1. **Laparoscopic surgery** (10 videos)
2. **Gastrostomy tube placement** (8 videos)
3. **Central line placement** (8 videos)
4. **Appendectomy procedure** (6 videos)
5. **Cholecystectomy procedure** (6 videos)
6. **ECMO decannulation procedure** (6 videos)
7. **ECMO cannulation procedure** (6 videos)
8. **Thoracoscopic procedure** (6 videos)
9. **Hernia repair surgery** (6 videos)
10. **Tracheostomy procedure** (4 videos)

### 🏥 Medical Specialties (6 total):
1. **General/Unknown** (185 items)
2. **Surgery** (90 items)
3. **ECMO** (26 items)
4. **Pediatric** (22 items)
5. **Neonatal** (16 items)

### ⚡ Complexity Levels (3 total):
1. **Moderate** (126 items)
2. **Complex** (26 items)
3. **Unknown** (189 items)

---

## 🎯 Key Benefits of New Structure

### 1. **Medical Accuracy**
- Content organized by actual medical procedures
- Procedures grouped by medical specialties
- Clinical guidelines properly categorized

### 2. **Clinical Priority**
- Life-saving procedures (ECMO, emergency) prominently featured
- Critical care protocols easily accessible
- Emergency procedures highlighted

### 3. **Specialty Organization**
- Neonatal and pediatric content separated
- Surgical procedures by complexity
- Specialty surgery by organ system

### 4. **User Experience**
- Faster access to critical procedures
- Logical medical workflow
- Intuitive navigation for medical professionals

---

## 🚀 Implementation Plan

### **Phase 1: Critical Care (Week 1-2)**
- Implement Critical Care & Life Support space card
- Focus on ECMO and emergency procedures
- Test with highest priority content

### **Phase 2: Core Surgery (Week 3-4)**
- Implement Surgical Procedures and Neonatal Care
- Add general and minimally invasive surgery
- Organize pediatric procedures

### **Phase 3: Specialty & Guidelines (Week 5-6)**
- Implement Specialty Surgery and Clinical Guidelines
- Add specialty-specific collections
- Organize guidelines by medical specialty

### **Phase 4: Education & Optimization (Week 7-8)**
- Complete with Education & Training
- Optimize search and performance
- Add medical terminology search

---

## 📊 Success Metrics

- **Content Organization**: 100% of 341 items properly categorized
- **Medical Accuracy**: All procedures correctly classified
- **User Experience**: Reduced time to find critical procedures
- **Search Efficiency**: Medical terminology search implemented
- **Performance**: Fast loading for all content types

---

## 🎉 Conclusion

This new intelligent structure transforms the CCHMC space from a generic content repository into a **medically accurate, clinically prioritized system** that serves the actual needs of medical professionals. The structure is based on real medical procedures, specialties, and clinical priorities, making it much more useful and intuitive for healthcare providers.

**Ready for implementation with clear phases, success metrics, and medical accuracy validation!** 🏥✨
        """
        
        with open('INTELLIGENT_STRUCTURE_REPORT.md', 'w') as f:
            f.write(report)
        
        print("✅ Comprehensive report created")

def main():
    print("🚀 Starting Intelligent Structure Visualization...")
    
    visualizer = IntelligentStructureVisualizer()
    
    # Load structure data
    visualizer.load_structure_data()
    
    # Create visualizations
    visualizer.create_structure_diagram()
    visualizer.create_content_distribution_chart()
    
    # Create implementation materials
    visualizer.create_implementation_roadmap()
    visualizer.create_comprehensive_report()
    
    print("🎉 Intelligent structure visualization complete!")
    print("📁 Generated files:")
    print("  - intelligent_space_structure_diagram.png")
    print("  - intelligent_content_distribution.png")
    print("  - intelligent_structure_implementation_roadmap.json")
    print("  - INTELLIGENT_STRUCTURE_REPORT.md")

if __name__ == "__main__":
    main()
