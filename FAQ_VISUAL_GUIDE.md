# FAQ Section - Visual Guide

## 📱 Public Website - FAQ Component

### Desktop View (1024px+)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ═══════════════════════════════════════════════════   │
│                                                         │
│              COMMON QUESTIONS                          │
│  Frequently Asked Questions                            │
│  Find answers to common questions about our pottery    │
│                                                         │
│  ───────────────────────────────────────────────────   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ❓ What materials do you use?             ▼      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ❓ Do you offer custom pottery...         ▼      │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ Yes! We offer custom commissions...              │ │
│  │ Please contact us through our contact page...    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ❓ What is your typical turnaround...    ▼      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ❓ Do you offer workshops or classes?   ▼      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ❓ Are your products food-safe?         ▼      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Mobile View (375px)
```
┌──────────────────┐
│                  │
│ COMMON QUESTIONS │
│ Frequently Asked │
│ Questions        │
│                  │
│ Find answers...  │
│                  │
│ ┌──────────────┐ │
│ │ ❓ Materials? │ │
│ │         ▼    │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ ❓ Custom     │ │
│ │ pottery?   ▼ │ │
│ ├──────────────┤ │
│ │ Yes! We offer│ │
│ │ custom...    │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ ❓ Turnaround │ │
│ │ time?      ▼ │ │
│ └──────────────┘ │
│                  │
└──────────────────┘
```

---

## 🎯 Admin Dashboard - FAQs Management

### Main View
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  ADMIN DASHBOARD                                      │
│  FAQs                                                 │
│  Create and manage frequently asked questions...      │
│                                          [+ Add FAQ]  │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Search FAQs... 🔍                                    │
│                                                        │
│ ╔════════════════════════════════════════════════════╗ │
│ ║ Question           │ Status    │ Order │ Created   ║ │
│ ║────────────────────┼──────────┼────────┼──────────║ │
│ ║ What materials...? │ ✓ Active │  10   │ Jan 15   ║ │
│ ║                    │ Edit Del                      ║ │
│ ║────────────────────┼──────────┼────────┼──────────║ │
│ ║ Custom pottery...? │ ✓ Active │  20   │ Jan 14   ║ │
│ ║                    │ Edit Del                      ║ │
│ ║────────────────────┼──────────┼────────┼──────────║ │
│ ║ Turnaround time?   │ ✗ Inactive│  30   │ Jan 13   ║ │
│ ║                    │ Edit Del                      ║ │
│ ╚════════════════════════════════════════════════════╝ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Create/Edit Form
```
┌────────────────────────────────────────────────────────┐
│                                        [✕ Close]      │
│  Create FAQ                                           │
│  Add a new frequently asked question                 │
│                                                        │
│  Question*                                            │
│  ┌──────────────────────────────────────────────────┐ │
│  │ What materials do you use?                      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Answer*                                              │
│  ┌──────────────────────────────────────────────────┐ │
│  │ We work with high-quality ceramic clay...      │ │
│  │ ...                                              │ │
│  │ ...                                              │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Display Order                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 10                                              │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│         ┌─────────────────────────────────────────┐   │
│         │ ☑ Active                                │   │
│         │ Show this question on public site       │   │
│         └─────────────────────────────────────────┘   │
│                                                        │
│                         [Cancel] [Create FAQ]         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Styling

### Color Palette
```
Primary Dark:    #1b1511  ████████████████████████████
Secondary Text:  #665b4f  ████████████████████████████
Border:          #e4d9d0  ████████████████████████████
Background:      #fcfaf7  ████████████████████████████
Accent:          #9a6b4e  ████████████████████████████
Green (Active):  #10b981  ████████████████████████████
```

### Typography
```
Eyebrow:  10px uppercase, letter-spacing: 0.36em
Title:    48px serif display font
Body:     14px body font, line-height: 1.75
Subtext:  12px muted color
```

### Spacing
```
Section:     padding: 80px 24px (mobile), 112px 40px (desktop)
Container:   max-width: 672px (centered)
Gap:         12px between accordion items
Padding:     20px inside accordion items
```

### Rounded Corners
```
Accordion Items:     rounded-[32px]
Buttons:             rounded-full
Icons:               rounded-full (when used as button)
```

---

## 🔄 Animation Sequences

### Accordion Open
```
1. User clicks on closed FAQ
   ↓
2. Chevron icon rotates 180° (300ms)
   ↓
3. Answer container expands (300ms)
   ├─ height: 0 → auto
   └─ opacity: 0 → 1
   ↓
4. Answer text becomes visible
```

### Page Load
```
1. Page loads, skeleton shows
   ↓
2. FAQs fetch from API (loading...)
   ↓
3. Skeleton fades out
   ↓
4. FAQs fade in with stagger (100ms delay per item)
   ├─ Item 1: opacity: 0→1, y: 10→0 (500ms)
   ├─ Item 2: opacity: 0→1, y: 10→0 (600ms)
   ├─ Item 3: opacity: 0→1, y: 10→0 (700ms)
   └─ ...
   ↓
5. User can interact
```

---

## 📊 Data Structure

### Database Record
```
{
  id: "uuid-string",
  question: "What materials do you use?",
  answer: "We work with high-quality ceramic clay...",
  display_order: 10,
  is_active: true,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z"
}
```

### API Response (Public)
```json
{
  "faqs": [
    {
      "id": "uuid-1",
      "question": "Question 1?",
      "answer": "Answer 1...",
      "display_order": 10,
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    },
    {
      "id": "uuid-2",
      "question": "Question 2?",
      "answer": "Answer 2...",
      "display_order": 20,
      "is_active": true,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

---

## 🎯 User Interactions

### Desktop User Flow
```
1. User lands on page with FAQ section
   ↓
2. Sees 5-10 FAQ items stacked vertically
   ↓
3. Hovers over FAQ item → background lightens
   ↓
4. Clicks on FAQ item
   ↓
5. Chevron rotates, answer slides down
   ↓
6. User reads answer
   ↓
7. Clicks again or clicks another FAQ
   ↓
8. Current answer slides up, new one slides down
```

### Mobile User Flow
```
1. User lands on page with FAQ section
   ↓
2. Sees full-width FAQ items in a stack
   ↓
3. Taps on FAQ item
   ↓
4. Answer expands smoothly
   ↓
5. User reads (scroll if needed)
   ↓
6. Taps another FAQ or collapses current one
   ↓
7. Smooth animations throughout
```

---

## 🔐 Security Flow

### Public Access
```
User Request
    ↓
GET /api/faqs
    ↓
Check: is_active = true
    ↓
Return active FAQs only
    ↓
Display on public site
```

### Admin Access
```
Admin Login
    ↓
Auth check passed
    ↓
GET /api/admin/faqs
    ↓
Return ALL FAQs (active + inactive)
    ↓
Can create, edit, delete
    ↓
All changes logged
```

---

## 📈 Performance Metrics

### Ideal Performance
```
FAQ Load Time:        < 500ms
Accordion Animation:  60fps
API Response:         < 200ms
Component Render:     < 100ms
Total First Paint:    < 1000ms
```

### Optimization
```
✓ FAQs cached client-side
✓ Lazy animations
✓ Minimal re-renders
✓ Efficient DOM updates
✓ Optimized images/text
```

---

## 🎬 Example States

### No FAQs (Empty State)
```
┌──────────────────────────────┐
│                              │
│ (Component doesn't render)   │
│ Page continues normally      │
│                              │
└──────────────────────────────┘
```

### Loading State
```
┌──────────────────────────────┐
│ ─────────────────────────── │
│ ─────────────────────────── │
│ ─────────────────────────── │
│ ─────────────────────────── │
│ ─────────────────────────── │
│                              │
│ Loading FAQs...              │
│                              │
└──────────────────────────────┘
```

### All Inactive (Admin View)
```
┌──────────────────────────────┐
│ Question 1         ✗ Inactive │
│ Question 2         ✗ Inactive │
│ Question 3         ✗ Inactive │
│                              │
│ (Won't show on public site)  │
│                              │
└──────────────────────────────┘
```

---

## 🎨 Design Tokens

### Space Scale
```
0:   0px
1:   4px
2:   8px
3:   12px
4:   16px
6:   24px
8:   32px
12:  48px
20:  80px
28: 112px
```

### Font Scale
```
xs:  10px
sm:  12px
base: 14px
lg:  16px
xl:  20px
2xl: 24px
3xl: 30px
4xl: 36px
5xl: 48px
6xl: 60px
```

### Radius Scale
```
full:   9999px (round)
[32px]: 32px    (standard)
[24px]: 24px    (medium)
[10px]: 10px    (small)
```

---

## 🚀 Performance Visualization

### API Request Timeline
```
0ms ─────────────────────────────────────────── Total
    ├─ DNS Lookup: 50ms
    ├─ TCP Connection: 50ms
    ├─ Server Response: 100ms
    └─ Data Transfer: 50ms
```

### Component Lifecycle
```
0ms ─────────────────────────────────────────── Total
    ├─ Mount: 50ms
    ├─ API Call: 200ms
    ├─ Render: 50ms
    └─ First Paint: 100ms
```

---

## 📱 Responsive Breakpoints

```
Mobile (< 640px)
├─ Full width
├─ 24px padding
└─ Single column

Tablet (640px - 1024px)
├─ Full width
├─ 32px padding
└─ Single column

Desktop (> 1024px)
├─ max-width: 672px
├─ Centered container
└─ 40px padding
```

---

## ✨ Visual Consistency

All elements follow the existing Artytect design system:

- **Colors**: Brand palette consistent
- **Typography**: Serif display + body fonts
- **Spacing**: Consistent rhythm (multiples of 4)
- **Radius**: 32px primary, full for buttons
- **Shadows**: Subtle, used sparingly
- **Animations**: Smooth, purposeful
- **Icons**: Lucide React icons throughout

---

**This FAQ section is designed to feel like a natural part of Artytect! 🎨**
