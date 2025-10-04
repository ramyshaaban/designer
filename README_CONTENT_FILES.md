# CCHMC Content Metadata Files

This directory contains comprehensive metadata for all 345 content items from the CCHMC Pediatric Surgery space.

## Files Created

### 📊 Excel File (Recommended)
- **`CCHMC_Content_Metadata.xlsx`** - Complete Excel workbook with multiple sheets
  - **All Content**: All 345 items with full metadata
  - **Content Type Summary**: Statistics by content type (guideline, video, document, image)
  - **Category Summary**: Statistics by medical category (ECMO, Neonatal, Surgical, etc.)
  - **Date Summary**: Statistics by upload date
  - **Large Files**: Files larger than 1MB

### 📄 CSV Files
- **`cchmc_content_with_headers.csv`** - Basic CSV with headers
- **`cchmc_content_detailed_with_headers.csv`** - Detailed CSV with additional columns
- **`content_summary.csv`** - Summary statistics by content type

### 📋 Data Files
- **`content_data.json`** - Raw JSON data from API
- **`create_excel.py`** - Python script used to generate Excel file

## Content Statistics

### Total Content: 345 items
- **Guidelines**: 163 items
- **Videos**: 152 items  
- **Documents**: 26 items
- **Images**: 4 items

### Category Distribution:
- **Surgical**: 65 items
- **Medication**: 58 items
- **ECMO**: 58 items
- **Education**: 57 items
- **Neonatal**: 55 items
- **Emergency**: 52 items

## Column Descriptions

### Main Columns
- **ID**: Unique content identifier
- **Title**: Cleaned content title
- **Type**: Content type (guideline, video, document, image)
- **Category**: Medical category assignment
- **File Name**: Original filename
- **Folder ID**: S3 folder identifier
- **Size (bytes)**: File size in bytes
- **Size (KB)**: File size in kilobytes
- **Size (MB)**: File size in megabytes
- **Date**: Upload date
- **Time**: Upload time
- **Last Modified**: Full timestamp
- **File URL**: S3 file path

## Usage

### Opening in Excel
1. Open `CCHMC_Content_Metadata.xlsx` in Microsoft Excel or Google Sheets
2. Navigate between sheets using the tabs at the bottom
3. Use filters and sorting to analyze the data

### Opening CSV Files
1. Open any `.csv` file in Excel, Google Sheets, or any spreadsheet application
2. The files are comma-separated and include headers

### Data Analysis
- Use the summary sheets for quick statistics
- Filter by content type or category for focused analysis
- Sort by size to identify large files
- Group by date to see upload patterns

## File Locations
All files are located in: `/Users/ramyshaaban/lab/designer/`

## Notes
- All content items are included (345 total)
- Categories are assigned based on the current categorization logic
- File sizes are calculated from S3 metadata
- Dates are parsed from S3 last modified timestamps
- The Excel file provides the most comprehensive view with multiple analysis sheets

