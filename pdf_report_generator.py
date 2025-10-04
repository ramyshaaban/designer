#!/usr/bin/env python3
"""
Comprehensive PDF Report Generator for CCHMC Content Analysis
Creates a professional PDF document with detailed analysis, content mapping, and visualizations
"""

import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics import renderPDF
from datetime import datetime
import os
from collections import Counter, defaultdict

class PDFReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
        self.analysis_data = {}
        self.categorization_data = {}
        
    def setup_custom_styles(self):
        """Setup custom styles for the PDF"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.darkblue,
            borderWidth=1,
            borderColor=colors.lightblue,
            borderPadding=5
        ))
        
        # Subsection style
        self.styles.add(ParagraphStyle(
            name='Subsection',
            parent=self.styles['Heading3'],
            fontSize=14,
            spaceAfter=8,
            spaceBefore=12,
            textColor=colors.darkgreen
        ))
        
        # Custom body text style
        self.styles.add(ParagraphStyle(
            name='CustomBodyText',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            alignment=TA_JUSTIFY
        ))
        
        # Bullet point style
        self.styles.add(ParagraphStyle(
            name='BulletPoint',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=4,
            leftIndent=20,
            bulletIndent=10
        ))
        
        # Table header style
        self.styles.add(ParagraphStyle(
            name='TableHeader',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            textColor=colors.white,
            backColor=colors.darkblue
        ))
        
        # Table cell style
        self.styles.add(ParagraphStyle(
            name='TableCell',
            parent=self.styles['Normal'],
            fontSize=9,
            alignment=TA_LEFT
        ))
    
    def load_analysis_data(self):
        """Load analysis data from JSON files"""
        print("📄 Loading analysis data...")
        
        # Load detailed analysis
        with open('detailed_content_analysis.json', 'r') as f:
            self.analysis_data = json.load(f)
        
        # Load intelligent categorization
        with open('intelligent_categorization.json', 'r') as f:
            self.categorization_data = json.load(f)
        
        print(f"✅ Loaded analysis for {len(self.analysis_data)} items")
        print(f"✅ Loaded {len(self.categorization_data)} space cards")
    
    def create_charts(self):
        """Create visualizations for the PDF"""
        print("📊 Creating charts and visualizations...")
        
        # Set style
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
        
        # 1. Content Type Distribution Pie Chart
        content_types = defaultdict(int)
        for item_id, analysis in self.analysis_data.items():
            content_types[analysis['type']] += 1
        
        plt.figure(figsize=(8, 6))
        plt.pie(content_types.values(), labels=content_types.keys(), autopct='%1.1f%%', startangle=90)
        plt.title('Content Type Distribution', fontsize=16, fontweight='bold')
        plt.axis('equal')
        plt.tight_layout()
        plt.savefig('content_type_distribution.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 2. Category Distribution Bar Chart
        categories = defaultdict(int)
        for item_id, analysis in self.analysis_data.items():
            categories[analysis['recommended_category']] += 1
        
        plt.figure(figsize=(12, 6))
        bars = plt.bar(range(len(categories)), list(categories.values()))
        plt.title('Content Distribution by Category', fontsize=16, fontweight='bold')
        plt.xlabel('Categories', fontsize=12)
        plt.ylabel('Number of Items', fontsize=12)
        plt.xticks(range(len(categories)), list(categories.keys()), rotation=45, ha='right')
        
        # Add value labels on bars
        for bar, value in zip(bars, categories.values()):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                    str(value), ha='center', va='bottom', fontweight='bold')
        
        plt.tight_layout()
        plt.savefig('category_distribution.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 3. Priority Score Distribution
        priority_scores = [analysis['priority_score'] for analysis in self.analysis_data.values()]
        
        plt.figure(figsize=(10, 6))
        plt.hist(priority_scores, bins=20, alpha=0.7, color='skyblue', edgecolor='black')
        plt.title('Priority Score Distribution', fontsize=16, fontweight='bold')
        plt.xlabel('Priority Score', fontsize=12)
        plt.ylabel('Frequency', fontsize=12)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig('priority_score_distribution.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 4. Top Keywords Word Cloud (simplified bar chart)
        all_keywords = []
        for analysis in self.analysis_data.values():
            all_keywords.extend(analysis['keywords'])
        
        keyword_counts = Counter(all_keywords)
        top_keywords = dict(keyword_counts.most_common(15))
        
        plt.figure(figsize=(12, 8))
        bars = plt.barh(range(len(top_keywords)), list(top_keywords.values()))
        plt.title('Top 15 Medical Keywords', fontsize=16, fontweight='bold')
        plt.xlabel('Frequency', fontsize=12)
        plt.ylabel('Keywords', fontsize=12)
        plt.yticks(range(len(top_keywords)), list(top_keywords.keys()))
        
        # Add value labels
        for i, (bar, value) in enumerate(zip(bars, top_keywords.values())):
            plt.text(bar.get_width() + 0.1, bar.get_y() + bar.get_height()/2, 
                    str(value), ha='left', va='center', fontweight='bold')
        
        plt.tight_layout()
        plt.savefig('top_keywords.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print("✅ Charts created successfully")
    
    def create_space_card_table(self):
        """Create a table showing space card structure"""
        table_data = [['Space Card', 'Items', 'Collections', 'Description']]
        
        for space_card in self.categorization_data:
            table_data.append([
                space_card['title'],
                str(space_card['total_items']),
                str(len(space_card['collections'])),
                f"Medical specialty focusing on {space_card['title'].lower()}"
            ])
        
        return table_data
    
    def create_top_priority_table(self):
        """Create a table of top priority items"""
        # Sort by priority score
        sorted_items = sorted(self.analysis_data.items(), 
                            key=lambda x: x[1]['priority_score'], reverse=True)
        
        table_data = [['Title', 'Type', 'Category', 'Priority Score', 'Keywords']]
        
        for item_id, analysis in sorted_items[:20]:  # Top 20
            keywords_str = ', '.join(analysis['keywords'][:3])  # First 3 keywords
            table_data.append([
                analysis['title'][:50] + '...' if len(analysis['title']) > 50 else analysis['title'],
                analysis['type'],
                analysis['recommended_category'],
                str(analysis['priority_score']),
                keywords_str
            ])
        
        return table_data
    
    def create_collection_structure_table(self):
        """Create a table showing collection structure"""
        table_data = [['Space Card', 'Collection', 'Items', 'Content Types']]
        
        for space_card in self.categorization_data:
            for collection in space_card['collections']:
                content_types = defaultdict(int)
                for item in collection['items']:
                    content_types[item['type']] += 1
                
                types_str = ', '.join([f"{k}({v})" for k, v in content_types.items()])
                table_data.append([
                    space_card['title'],
                    collection['title'],
                    str(len(collection['items'])),
                    types_str
                ])
        
        return table_data
    
    def generate_pdf(self):
        """Generate the comprehensive PDF report"""
        print("📄 Generating comprehensive PDF report...")
        
        # Create PDF document
        doc = SimpleDocTemplate(
            "CCHMC_Comprehensive_Analysis_Report.pdf",
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Create story (content list)
        story = []
        
        # Title page
        story.append(Paragraph("CCHMC Pediatric Surgery", self.styles['CustomTitle']))
        story.append(Paragraph("Comprehensive Content Analysis Report", self.styles['CustomTitle']))
        story.append(Spacer(1, 20))
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", 
                              self.styles['CustomBodyText']))
        story.append(Spacer(1, 30))
        
        # Executive Summary
        story.append(Paragraph("Executive Summary", self.styles['SectionHeader']))
        story.append(Paragraph(
            f"This comprehensive analysis examines all 345 content items in the CCHMC Pediatric Surgery space. "
            f"The analysis reveals a well-structured medical content repository with clear specialization areas: "
            f"General Medical (55%), Surgical Procedures (26%), Critical Care & ECMO (8%), Neonatal & NICU (5%), "
            f"and Pediatric Care (6%). The content spans clinical guidelines, training videos, reference documents, "
            f"and visual resources, providing comprehensive coverage of pediatric surgical care.",
            self.styles['CustomBodyText']
        ))
        story.append(Spacer(1, 20))
        
        # Content Type Distribution
        story.append(Paragraph("Content Type Distribution", self.styles['SectionHeader']))
        story.append(Image('content_type_distribution.png', width=6*inch, height=4.5*inch))
        story.append(Spacer(1, 20))
        
        # Category Distribution
        story.append(Paragraph("Content Distribution by Category", self.styles['SectionHeader']))
        story.append(Image('category_distribution.png', width=7*inch, height=4*inch))
        story.append(Spacer(1, 20))
        
        # Space Card Structure
        story.append(Paragraph("Space Card Structure", self.styles['SectionHeader']))
        space_card_table = self.create_space_card_table()
        table = Table(space_card_table, colWidths=[2*inch, 0.8*inch, 0.8*inch, 3*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(table)
        story.append(Spacer(1, 20))
        
        # Page break
        story.append(PageBreak())
        
        # Priority Score Distribution
        story.append(Paragraph("Priority Score Distribution", self.styles['SectionHeader']))
        story.append(Image('priority_score_distribution.png', width=6*inch, height=4*inch))
        story.append(Spacer(1, 20))
        
        # Top Keywords
        story.append(Paragraph("Top Medical Keywords", self.styles['SectionHeader']))
        story.append(Image('top_keywords.png', width=7*inch, height=5*inch))
        story.append(Spacer(1, 20))
        
        # Top Priority Items
        story.append(Paragraph("Top Priority Content Items", self.styles['SectionHeader']))
        priority_table = self.create_top_priority_table()
        table = Table(priority_table, colWidths=[2.5*inch, 0.8*inch, 1.2*inch, 0.8*inch, 1.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))
        story.append(table)
        story.append(Spacer(1, 20))
        
        # Page break
        story.append(PageBreak())
        
        # Collection Structure
        story.append(Paragraph("Collection Structure Details", self.styles['SectionHeader']))
        collection_table = self.create_collection_structure_table()
        table = Table(collection_table, colWidths=[1.5*inch, 2*inch, 0.6*inch, 2.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))
        story.append(table)
        story.append(Spacer(1, 20))
        
        # Detailed Analysis by Category
        story.append(Paragraph("Detailed Analysis by Category", self.styles['SectionHeader']))
        
        for space_card in self.categorization_data:
            story.append(Paragraph(f"{space_card['title']} ({space_card['total_items']} items)", 
                                 self.styles['Subsection']))
            
            # Category description
            category_desc = f"This category contains {space_card['total_items']} items organized into " \
                          f"{len(space_card['collections'])} collections. "
            
            if space_card['title'] == 'General Medical':
                category_desc += "Focuses on general clinical guidelines, protocols, and standard procedures."
            elif space_card['title'] == 'Surgical Procedures':
                category_desc += "Covers surgical procedures, operative guidelines, and surgical protocols."
            elif space_card['title'] == 'Critical Care & ECMO':
                category_desc += "Specializes in ECMO management, critical care protocols, and ICU procedures."
            elif space_card['title'] == 'Neonatal & NICU':
                category_desc += "Addresses neonatal care, NICU protocols, and newborn procedures."
            elif space_card['title'] == 'Pediatric Care':
                category_desc += "Focuses on pediatric-specific care, child procedures, and pediatric protocols."
            
            story.append(Paragraph(category_desc, self.styles['CustomBodyText']))
            
            # Collections in this category
            story.append(Paragraph("Collections:", self.styles['CustomBodyText']))
            for collection in space_card['collections']:
                story.append(Paragraph(f"• {collection['title']}: {len(collection['items'])} items", 
                                   self.styles['BulletPoint']))
            
            story.append(Spacer(1, 15))
        
        # Page break
        story.append(PageBreak())
        
        # Implementation Recommendations
        story.append(Paragraph("Implementation Recommendations", self.styles['SectionHeader']))
        
        recommendations = [
            "Phase 1 - Core Structure: Implement the 5 main space cards based on intelligent categorization",
            "Phase 2 - Enhanced Features: Add advanced search with medical terminology and priority-based highlighting",
            "Phase 3 - Advanced Analytics: Implement content usage tracking and dynamic priority adjustments",
            "Priority Focus: Highlight ECMO protocols, sepsis algorithms, and emergency procedures for quick access",
            "Training Emphasis: Organize surgical procedure videos by specialty for better educational value",
            "Reference Organization: Structure handbooks and guides by medical specialty for easy reference"
        ]
        
        for rec in recommendations:
            story.append(Paragraph(rec, self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Technical Specifications
        story.append(Paragraph("Technical Specifications", self.styles['SectionHeader']))
        
        tech_specs = [
            f"Total Content Items: {len(self.analysis_data)}",
            f"Space Cards: {len(self.categorization_data)}",
            f"Total Collections: {sum(len(sc['collections']) for sc in self.categorization_data)}",
            f"Medical Keywords Identified: {len(set().union(*[analysis['keywords'] for analysis in self.analysis_data.values()]))}",
            f"Content Types: {len(set(analysis['type'] for analysis in self.analysis_data.values()))}",
            f"Priority Score Range: {min(analysis['priority_score'] for analysis in self.analysis_data.values())} - {max(analysis['priority_score'] for analysis in self.analysis_data.values())}"
        ]
        
        for spec in tech_specs:
            story.append(Paragraph(spec, self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Conclusion
        story.append(Paragraph("Conclusion", self.styles['SectionHeader']))
        story.append(Paragraph(
            "This comprehensive analysis provides a data-driven foundation for optimizing the CCHMC Pediatric Surgery "
            "space structure. The intelligent categorization ensures medical accuracy while the priority scoring system "
            "enables quick access to critical content. The recommended implementation phases will create a highly "
            "organized, user-friendly environment that maximizes the educational and clinical value of all 345 content items.",
            self.styles['CustomBodyText']
        ))
        
        # Build PDF
        doc.build(story)
        print("✅ PDF report generated successfully!")
    
    def cleanup_temp_files(self):
        """Clean up temporary chart files"""
        temp_files = [
            'content_type_distribution.png',
            'category_distribution.png', 
            'priority_score_distribution.png',
            'top_keywords.png'
        ]
        
        for file in temp_files:
            if os.path.exists(file):
                os.remove(file)
        
        print("🧹 Cleaned up temporary files")

def main():
    print("🚀 Starting PDF Report Generation...")
    
    generator = PDFReportGenerator()
    
    # Load analysis data
    generator.load_analysis_data()
    
    # Create visualizations
    generator.create_charts()
    
    # Generate PDF
    generator.generate_pdf()
    
    # Cleanup
    generator.cleanup_temp_files()
    
    print("🎉 PDF report generation complete!")
    print("📄 Generated: CCHMC_Comprehensive_Analysis_Report.pdf")

if __name__ == "__main__":
    main()
