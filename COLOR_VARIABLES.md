# Color Variables Reference

All colors are now defined in `tailwind.config.ts` under the `brand` namespace.

## Usage

Replace hardcoded hex colors with Tailwind classes using the `brand-*` prefix:

### Backgrounds

```tsx
// ❌ Old (hardcoded)
<div className="bg-[#f5f0eb]">

// ✅ New (variable)
<div className="bg-brand-bg-primary">
```

**Available background colors:**
- `bg-brand-bg-primary` → `#f5f0eb` (main page background)
- `bg-brand-bg-secondary` → `#faf6f2` (card backgrounds)
- `bg-brand-bg-tertiary` → `#fbf8f4` (alternate sections)
- `bg-brand-bg-warm` → `#fff7f4` (warm sections)
- `bg-brand-bg-dark` → `#211914` (dark hero backgrounds)
- `bg-brand-bg-darker` → `#1b1511` (darker overlays)
- `bg-brand-bg-darkest` → `#17110d` (darkest overlays)

### Text Colors

```tsx
// ❌ Old (hardcoded)
<p className="text-[#1b1511]">

// ✅ New (variable)
<p className="text-brand-text-primary">
```

**Available text colors:**
- `text-brand-text-primary` → `#1b1511` (main text)
- `text-brand-text-secondary` → `#6b5f55` (secondary text)
- `text-brand-text-tertiary` → `#7a6e65` (tertiary text)
- `text-brand-text-muted` → `#9a8d82` (muted text)
- `text-brand-text-light` → `#f4e9dc` (light text on dark)
- `text-brand-text-lighter` → `#ead7c3` (lighter text on dark)
- `text-brand-text-accent` → `#9a6b4e` (accent/labels)

### Border Colors

```tsx
// ❌ Old (hardcoded)
<div className="border border-[#d9cfc6]">

// ✅ New (variable)
<div className="border border-brand-border-primary">
```

**Available border colors:**
- `border-brand-border-primary` → `#d9cfc6` (main borders)
- `border-brand-border-secondary` → `#c4b5a8` (secondary borders)
- `border-brand-border-light` → `#e4d9d0` (light borders)
- `border-brand-border-lighter` → `#eadfd4` (lighter borders)

### Gradient Overlays

For gradient overlays, use CSS custom properties or Tailwind's arbitrary values:

```tsx
// Dark gradient overlay
<div className="bg-gradient-to-r from-brand-overlay-dark via-brand-overlay-medium to-brand-overlay-light">
```

## Migration Guide

### Step 1: Find and Replace

Search for hardcoded colors and replace with variables:

```bash
# Example: Replace background colors
#f5f0eb → bg-brand-bg-primary
#faf6f2 → bg-brand-bg-secondary
#1b1511 → text-brand-text-primary or bg-brand-bg-darker
```

### Step 2: Update Components

Update all component files to use the new color variables instead of hardcoded hex values.

### Step 3: Verify

Run the dev server and verify all colors render correctly:

```bash
npm run dev
```

## Benefits

✅ **Consistency** — All colors defined in one place
✅ **Maintainability** — Easy to update the entire color scheme
✅ **Readability** — Semantic names instead of hex codes
✅ **Theming** — Easy to create dark mode or alternate themes
✅ **Type Safety** — Tailwind IntelliSense autocomplete

## Example Component

```tsx
export default function ExampleCard() {
  return (
    <article className="bg-brand-bg-secondary border border-brand-border-primary">
      <div className="p-4">
        <p className="text-brand-text-accent text-xs uppercase">
          Label
        </p>
        <h2 className="text-brand-text-primary text-2xl font-display">
          Heading
        </h2>
        <p className="text-brand-text-secondary text-sm">
          Description text
        </p>
      </div>
    </article>
  );
}
```
