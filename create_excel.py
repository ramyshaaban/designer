#!/usr/bin/env python3
"""
Script to create Excel file with CCHMC content metadata
"""

import json
import pandas as pd
from datetime import datetime
import os

def create_excel_file():
    # Read the content data
    with open('content_data.json', 'r') as f:
        content_data = json.load(f)
    
    # Create DataFrame
    df = pd.DataFrame(content_data)
    
    # Add additional columns
    df['Folder ID'] = df['fileUrl'].str.split('/').str[-2]
    df['File Name'] = df['fileUrl'].str.split('/').str[-1]
    df['Size (KB)'] = (df['size'] / 1024).round(2)
    df['Size (MB)'] = (df['size'] / (1024 * 1024)).round(3)
    
    # Parse dates
    df['Last Modified'] = pd.to_datetime(df['lastModified'])
    df['Date'] = df['Last Modified'].dt.date
    df['Time'] = df['Last Modified'].dt.time
    
    # Add content category based on current categorization logic
    def categorize_content(row):
        title = row['title'].lower()
        content_type = row['type']
        
        if content_type == 'video':
            # Videos are distributed by ID modulo 6
            video_id = int(row['id'].split('_')[0]) if '_' in row['id'] else 0
            categories = ['ECMO', 'Neonatal', 'Surgical', 'Emergency', 'Education', 'Medication']
            return categories[video_id % 6]
        
        # Keyword matching for other content types
        if any(keyword in title for keyword in ['ecmo', 'cdh', 'anticoagulation']):
            return 'ECMO'
        elif any(keyword in title for keyword in ['nicu', 'neonatal']) or ('pediatric' in title and 'dosing' in title):
            return 'Neonatal'
        elif any(keyword in title for keyword in ['surgery', 'surgical', 'appendectomy', 'antibiotic']):
            return 'Surgical'
        elif any(keyword in title for keyword in ['sepsis', 'emergency', 'trauma', 'cpr']):
            return 'Emergency'
        elif any(keyword in title for keyword in ['resident', 'curriculum', 'training', 'education']):
            return 'Education'
        elif any(keyword in title for keyword in ['dosing', 'medication', 'drug']):
            return 'Medication'
        else:
            # Fallback distribution by ID modulo
            content_id = int(row['id'].split('_')[0]) if '_' in row['id'] else 0
            categories = ['ECMO', 'Neonatal', 'Surgical', 'Emergency', 'Education', 'Medication']
            return categories[content_id % 6]
    
    df['Category'] = df.apply(categorize_content, axis=1)
    
    # Reorder columns for better readability
    columns = [
        'id', 'title', 'type', 'Category', 'File Name', 'Folder ID',
        'size', 'Size (KB)', 'Size (MB)', 'Date', 'Time', 'lastModified', 'fileUrl'
    ]
    df = df[columns]
    
    # Rename columns for better display
    df.columns = [
        'ID', 'Title', 'Type', 'Category', 'File Name', 'Folder ID',
        'Size (bytes)', 'Size (KB)', 'Size (MB)', 'Date', 'Time', 'Last Modified', 'File URL'
    ]
    
    # Create Excel file with multiple sheets
    with pd.ExcelWriter('CCHMC_Content_Metadata.xlsx', engine='openpyxl') as writer:
        # Main content sheet
        df.to_excel(writer, sheet_name='All Content', index=False)
        
        # Summary by content type
        type_summary = df.groupby('Type').agg({
            'ID': 'count',
            'Size (bytes)': 'sum',
            'Size (KB)': 'sum',
            'Size (MB)': 'sum'
        }).rename(columns={'ID': 'Count'})
        type_summary.to_excel(writer, sheet_name='Content Type Summary')
        
        # Summary by category
        category_summary = df.groupby('Category').agg({
            'ID': 'count',
            'Size (bytes)': 'sum',
            'Size (KB)': 'sum',
            'Size (MB)': 'sum'
        }).rename(columns={'ID': 'Count'})
        category_summary.to_excel(writer, sheet_name='Category Summary')
        
        # Summary by date
        date_summary = df.groupby('Date').agg({
            'ID': 'count',
            'Size (bytes)': 'sum'
        }).rename(columns={'ID': 'Count'})
        date_summary.to_excel(writer, sheet_name='Date Summary')
        
        # Large files (> 1MB)
        large_files = df[df['Size (MB)'] > 1].sort_values('Size (MB)', ascending=False)
        large_files.to_excel(writer, sheet_name='Large Files (>1MB)', index=False)
    
    print(f"Excel file created with {len(df)} content items")
    print(f"Content types: {df['Type'].value_counts().to_dict()}")
    print(f"Categories: {df['Category'].value_counts().to_dict()}")

if __name__ == "__main__":
    create_excel_file()
