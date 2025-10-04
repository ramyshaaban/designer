# CCHMC Pediatric Surgery Space - Visual Structure Diagram

## Hierarchical Structure

```
CCHMC Pediatric Surgery Space
│
├── 🏥 Critical Care & ECMO (#dc2626)
│   ├── ECMO Management
│   │   ├── ECMO Guidelines (~82 items)
│   │   ├── ECMO Procedures (~13 items)
│   │   └── ECMO Videos (~76 items)
│   └── ICU Care
│       ├── ICU Guidelines (~81 items)
│       ├── ICU Procedures (~13 items)
│       └── ICU Videos (~76 items)
│
├── 👶 Neonatal & NICU (#059669)
│   ├── NICU Protocols
│   │   ├── Neonatal Guidelines (~82 items)
│   │   ├── Neonatal Procedures (~13 items)
│   │   └── Neonatal Videos (~76 items)
│   └── Pediatric Dosing
│       ├── Dosing Guidelines (~81 items)
│       ├── Medication Protocols (~13 items)
│       └── Dosing Videos (~76 items)
│
├── 🔪 Surgical Procedures (#7c3aed)
│   ├── General Surgery
│   │   ├── Surgical Guidelines (~82 items)
│   │   ├── Surgical Procedures (~13 items)
│   │   └── Surgical Videos (~76 items)
│   └── Specialized Surgery
│       ├── Specialized Guidelines (~81 items)
│       ├── Specialized Procedures (~13 items)
│       └── Specialized Videos (~76 items)
│
├── 🚨 Emergency & Trauma (#ea580c)
│   ├── Emergency Protocols
│   │   ├── Emergency Guidelines (~82 items)
│   │   ├── Emergency Procedures (~13 items)
│   │   └── Emergency Videos (~76 items)
│   └── Trauma Care
│       ├── Trauma Guidelines (~81 items)
│       ├── Trauma Procedures (~13 items)
│       └── Trauma Videos (~76 items)
│
├── 📚 Education & Training (#0891b2)
│   ├── Resident Training
│   │   ├── Training Materials (~13 items)
│   │   ├── Training Guidelines (~82 items)
│   │   └── Training Videos (~76 items)
│   └── Fellowship Program
│       ├── Fellowship Materials (~13 items)
│       ├── Fellowship Guidelines (~81 items)
│       └── Fellowship Videos (~76 items)
│
└── 💊 Medication Management (#be185d)
    ├── Pediatric Dosing
    │   ├── Dosing Guidelines (~82 items)
    │   ├── Dosing Procedures (~13 items)
    │   └── Dosing Videos (~76 items)
    └── Drug Safety
        ├── Safety Guidelines (~81 items)
        ├── Safety Procedures (~13 items)
        └── Safety Videos (~76 items)
```

## Content Flow Diagram

```
S3 Content (345 items)
│
├── API Processing
│   ├── Content Type Detection
│   ├── Title Extraction
│   └── Metadata Generation
│
├── Frontend Categorization
│   ├── Video Distribution (ID modulo 6)
│   ├── Keyword Matching
│   └── Fallback Distribution
│
├── Space Card Creation
│   ├── 6 Medical Specialties
│   ├── 12 Collections (2 per card)
│   └── 36 Collection Cards (3 per collection)
│
└── Content Distribution
    ├── Guidelines: 163 items → ~82 + ~81 per collection
    ├── Videos: 152 items → ~76 + ~76 per collection
    ├── Documents: 26 items → ~13 + ~13 per collection
    └── Images: 4 items → ~2 + ~2 per collection
```

## Distribution Logic Flow

```
Content Item
│
├── Is it a video?
│   ├── Yes → Distribute by ID modulo 6
│   └── No → Check keywords
│
├── Keyword Matching
│   ├── ECMO keywords → ECMO category
│   ├── Neonatal keywords → Neonatal category
│   ├── Surgical keywords → Surgical category
│   ├── Emergency keywords → Emergency category
│   ├── Education keywords → Education category
│   ├── Medication keywords → Medication category
│   └── No match → Distribute by ID modulo 6
│
└── Collection Distribution
    ├── Collection 0 → First half of category content
    └── Collection 1 → Second half of category content
```

## Modification Points

### 1. Space Card Level
- Add/remove space cards
- Change colors and icons
- Modify titles and descriptions

### 2. Collection Level
- Add/remove collections per space card
- Change collection names and icons
- Modify collection structure

### 3. Collection Card Level
- Add/remove collection cards per collection
- Change content type distribution
- Modify filtering criteria

### 4. Content Level
- Modify categorization keywords
- Change content type detection
- Adjust distribution algorithms

## Key Configuration Files

### API Configuration
- `src/app/api/space-content/route.ts`
  - `getContentType()`: Content type detection
  - `extractTitleFromFileName()`: Title extraction
  - `getSpaceContent()`: Content fetching

### Frontend Configuration
- `src/app/cchmc-space-structured/page.tsx`
  - `categorizeContent()`: Content categorization
  - `createSpaceCards()`: Space structure creation
  - `distributeContent()`: Content distribution

### UI Configuration
- `src/components/ui/`: UI components
- Color schemes and styling
- Icon mappings and layouts

