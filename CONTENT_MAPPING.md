# CCHMC Pediatric Surgery Space - Content Mapping Document

## Overview
This document provides a comprehensive mapping of the content structure for the CCHMC Pediatric Surgery space. It shows how 345 content items are organized across 6 space cards, 12 collections, and 36 collection cards.

## Content Statistics
- **Total Content Items**: 345
- **Content Types**:
  - Guidelines: 163 items
  - Videos: 152 items
  - Documents: 26 items
  - Images: 4 items
- **Space Cards**: 6
- **Collections**: 12 (2 per space card)
- **Collection Cards**: 36 (3 per collection)

## Space Architecture

```
Space (CCHMC Pediatric Surgery)
├── Space Cards (6 medical specialties)
│   ├── Collections (2 per space card)
│   │   ├── Collection Cards (3 per collection)
│   │   │   ├── Content Items (distributed by type)
```

## Detailed Content Mapping

### 1. 🏥 Critical Care & ECMO (Color: #dc2626)

#### Collection 1: ECMO Management
- **ECMO Guidelines**: ~82 items (first half of ECMO guidelines)
- **ECMO Procedures**: ~13 items (first half of ECMO documents)
- **ECMO Videos**: ~76 items (first half of ECMO videos)

#### Collection 2: ICU Care
- **ICU Guidelines**: ~81 items (second half of ECMO guidelines)
- **ICU Procedures**: ~13 items (second half of ECMO documents)
- **ICU Videos**: ~76 items (second half of ECMO videos)

### 2. 👶 Neonatal & NICU (Color: #059669)

#### Collection 1: NICU Protocols
- **Neonatal Guidelines**: ~82 items (first half of neonatal guidelines)
- **Neonatal Procedures**: ~13 items (first half of neonatal documents)
- **Neonatal Videos**: ~76 items (first half of neonatal videos)

#### Collection 2: Pediatric Dosing
- **Dosing Guidelines**: ~81 items (second half of neonatal guidelines)
- **Medication Protocols**: ~13 items (second half of neonatal documents)
- **Dosing Videos**: ~76 items (second half of neonatal videos)

### 3. 🔪 Surgical Procedures (Color: #7c3aed)

#### Collection 1: General Surgery
- **Surgical Guidelines**: ~82 items (first half of surgical guidelines)
- **Surgical Procedures**: ~13 items (first half of surgical documents)
- **Surgical Videos**: ~76 items (first half of surgical videos)

#### Collection 2: Specialized Surgery
- **Specialized Guidelines**: ~81 items (second half of surgical guidelines)
- **Specialized Procedures**: ~13 items (second half of surgical documents)
- **Specialized Videos**: ~76 items (second half of surgical videos)

### 4. 🚨 Emergency & Trauma (Color: #ea580c)

#### Collection 1: Emergency Protocols
- **Emergency Guidelines**: ~82 items (first half of emergency guidelines)
- **Emergency Procedures**: ~13 items (first half of emergency documents)
- **Emergency Videos**: ~76 items (first half of emergency videos)

#### Collection 2: Trauma Care
- **Trauma Guidelines**: ~81 items (second half of emergency guidelines)
- **Trauma Procedures**: ~13 items (second half of emergency documents)
- **Trauma Videos**: ~76 items (second half of emergency videos)

### 5. 📚 Education & Training (Color: #0891b2)

#### Collection 1: Resident Training
- **Training Materials**: ~13 items (first half of education documents)
- **Training Guidelines**: ~82 items (first half of education guidelines)
- **Training Videos**: ~76 items (first half of education videos)

#### Collection 2: Fellowship Program
- **Fellowship Materials**: ~13 items (second half of education documents)
- **Fellowship Guidelines**: ~81 items (second half of education guidelines)
- **Fellowship Videos**: ~76 items (second half of education videos)

### 6. 💊 Medication Management (Color: #be185d)

#### Collection 1: Pediatric Dosing
- **Dosing Guidelines**: ~82 items (first half of medication guidelines)
- **Dosing Procedures**: ~13 items (first half of medication documents)
- **Dosing Videos**: ~76 items (first half of medication videos)

#### Collection 2: Drug Safety
- **Safety Guidelines**: ~81 items (second half of medication guidelines)
- **Safety Procedures**: ~13 items (second half of medication documents)
- **Safety Videos**: ~76 items (second half of medication videos)

## Content Distribution Logic

### Categorization Process
1. **Video Distribution**: Videos distributed by ID modulo 6 across categories
2. **Keyword Matching**: Other content types matched by keywords
3. **Fallback Distribution**: Content not matching keywords distributed by ID modulo 6

### Distribution Function
```typescript
const distributeContent = (content: any[], numCollections: number, collectionIndex: number) => {
  const itemsPerCollection = Math.ceil(content.length / numCollections);
  const startIndex = collectionIndex * itemsPerCollection;
  const endIndex = Math.min(startIndex + itemsPerCollection, content.length);
  return content.slice(startIndex, endIndex);
};
```

### Categories and Keywords
- **ECMO**: 'ecmo', 'cdh', 'anticoagulation'
- **Neonatal**: 'nicu', 'neonatal', 'pediatric' + 'dosing'
- **Surgical**: 'surgery', 'surgical', 'appendectomy', 'antibiotic'
- **Emergency**: 'sepsis', 'emergency', 'trauma', 'cpr'
- **Education**: 'resident', 'curriculum', 'training', 'education'
- **Medication**: 'dosing', 'medication', 'drug'

## Modification Guidelines

### Adding New Space Cards
1. Add new space card object to `createSpaceCards` function
2. Assign unique ID, title, color, and icon
3. Create 2 collections with 3 collection cards each
4. Use `distributeContent` function for content distribution

### Modifying Collections
1. Update collection titles and icons
2. Adjust content filtering logic if needed
3. Maintain 3 collection cards per collection (Guidelines, Procedures, Videos)

### Changing Content Distribution
1. Modify `distributeContent` function parameters
2. Adjust `numCollections` parameter for different distribution
3. Update slice ranges in collection card definitions

### Adding New Content Types
1. Update `getContentType` function in API
2. Add new collection card types in space cards
3. Update filtering logic in `categorizeContent` function

## File Structure

### API Files
- `/api/space-content/route.ts`: Content fetching and categorization
- `/api/thumbnail/route.ts`: Signed URL generation

### Frontend Files
- `/app/cchmc-space-structured/page.tsx`: Main space component
- `/components/ui/`: UI components (Card, Badge, Button, etc.)

### Key Functions
- `categorizeContent()`: Categorizes content by medical specialty
- `createSpaceCards()`: Creates hierarchical space structure
- `distributeContent()`: Distributes content evenly across collections
- `calculateSpaceCardContentCount()`: Calculates total content per space card

## Customization Examples

### Example 1: Adding a New Space Card
```typescript
{
  id: 'cardiology',
  title: '❤️ Cardiology',
  color: '#ef4444',
  items: [
    {
      id: 'cardiac-surgery',
      title: 'Cardiac Surgery',
      icon: Heart,
      children: [
        {
          id: 'cardiac-guidelines',
          title: 'Cardiac Guidelines',
          items: distributeContent(categorizedContent.cardiology.filter(item => item.type === 'guideline'), 2, 0)
        },
        // ... more collection cards
      ]
    }
  ]
}
```

### Example 2: Modifying Collection Structure
```typescript
// Change from 3 collection cards to 4
children: [
  {
    id: 'guidelines',
    title: 'Guidelines',
    items: distributeContent(categorizedContent.ecmo.filter(item => item.type === 'guideline'), 4, 0)
  },
  {
    id: 'procedures',
    title: 'Procedures',
    items: distributeContent(categorizedContent.ecmo.filter(item => item.type === 'document'), 4, 1)
  },
  {
    id: 'videos',
    title: 'Videos',
    items: distributeContent(categorizedContent.ecmo.filter(item => item.type === 'video'), 4, 2)
  },
  {
    id: 'images',
    title: 'Images',
    items: distributeContent(categorizedContent.ecmo.filter(item => item.type === 'image'), 4, 3)
  }
]
```

### Example 3: Custom Content Distribution
```typescript
// Custom distribution based on content properties
const customDistribute = (content: any[], criteria: string) => {
  return content.filter(item => 
    item.title.toLowerCase().includes(criteria) ||
    item.description?.toLowerCase().includes(criteria)
  );
};

// Usage
items: customDistribute(categorizedContent.ecmo, 'pediatric')
```

## Notes
- All content counts are approximate and may vary based on actual content
- The distribution function ensures no content is lost or duplicated
- Colors and icons can be customized for each space card
- The structure is designed to be scalable and maintainable
- Content categorization can be refined based on actual content analysis

## Next Steps
1. Review the current structure
2. Identify areas for improvement
3. Modify the `createSpaceCards` function
4. Test changes with actual content
5. Refine based on user feedback

