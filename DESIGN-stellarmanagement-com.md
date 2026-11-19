# Design System Inspired by Stellar Management

> Auto-extracted from `https://www.stellarmanagement.com/` on 2026-11-01

## 1. Visual Theme & Atmosphere

Clean, minimal, and product-focused with deliberate use of whitespace.

The hero section leads with "We help New Yorkers find home" followed by "Since 1985, creating, investing, developing & living NYC real estate.".

**Key Characteristics:**
- General Sans Variable as the heading font (custom web font loaded via @font-face)
- General Sans Variable as the body font for all running text
- Heading weight 500, letter-spacing -3.0735px
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#06184f` used for CTAs and brand highlights
- Sharp corners (0-2px) for a precise, technical aesthetic
- Tags: light, sharp, monochrome, bold-typography, sans-serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#06184f`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#000000`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text
- **Text Primary** (`#181513`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#727272`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#cdcdcd`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#ffffff` | `--palette-1` | block | large | text-dark |
| 2 | `#000000` | `--palette-2` | block | medium | text-light |
| 3 | `#06184f` | `--palette-3` | button | medium | text-light |
| 4 | `#cdcdcd` | `--palette-4` | badge | small | text-dark |
| 5 | `#727272` | `--palette-5` | badge | small | text-light |

## 3. Typography Rules

- **Heading Font:** `General Sans Variable` (web font)
- **Body Font:** `General Sans Variable` (web font)

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H1 | General Sans Variable | 76.8375px | 500 | 69.1537px | -3.0735px |
| H2 | General Sans Variable | 66.5925px | 500 | 73.2518px | -1.99778px |
| H3 | General Sans Variable | 20.49px | 500 | 25.6125px | -0.2049px |
| H4 | General Sans Variable | 15.3675px | 500 | 23.0513px | normal |
| Body | General Sans Variable | 15.3675px | 500 | 23.0513px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `80.6794px` | headings |
| H1 | `76.8375px` | headings |
| H2 | `66.5925px` | headings |
| H3 | `51.225px` | headings |
| H4 | `27.32px` | headings |
| Body L | `20.49px` | body / supporting text |
| Body | `15.3675px` | body / supporting text |
| Small | `13.66px` | body / supporting text |
| XS | `11.9525px` | body / supporting text |
| Caption | `8.5375px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #181513;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 8.5375px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #ffffff;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 13.66px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #06184f;
  color: #ffffff;
  border-radius: 0px;
  padding: 12px 24px;
  font-size: 13.66px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Filled Button 2

```css
.btn-filled-2 {
  background: #ffffff;
  color: #181513;
  border-radius: 0px;
  padding: 12px 24px;
  font-size: 13.66px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

### Outline Button

```css
.btn-outline {
  background: transparent;
  color: #181513;
  border-radius: 0px;
  padding: 12px 24px;
  font-size: 13.66px;
  font-weight: 500;
  border: 1px solid rgb(205, 205, 205);
  cursor: pointer;
}
```

### Ghost Button 2

```css
.btn-ghost-2 {
  background: transparent;
  color: #cdcdcd;
  border-radius: 0px;
  padding: 0px 0px;
  font-size: 13.66px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}
```

## 5. Layout Principles

- **Base spacing unit:** `12px` — use multiples (24px, 36px, 48px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `12px` | element |
| spacing-2 | `102.45px` | section |
| spacing-3 | `20px` | element |
| spacing-4 | `6px` | element |
| spacing-5 | `61.47px` | section |
| spacing-6 | `59.7625px` | card |
| spacing-7 | `17.075px` | element |
| spacing-8 | `40.98px` | card |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|

## 6. Depth & Elevation

No prominent box-shadows detected. This design likely uses flat surfaces with borders or background color changes for depth.

## 7. Do's and Don'ts

### Do
- Use `#ffffff` as the primary background color
- Use `General Sans Variable` for all headings and `General Sans Variable` for body text
- Use `#06184f` as the single dominant accent/CTA color
- Maintain `12px` as the base spacing unit — all gaps should be multiples
- Keep corners sharp (0-2px radius) for a precise, technical feel
- Make headlines large and bold — typography is the hero element
- Stick to grayscale + `#06184f` accent — avoid color overload
- Use weight 500 for headings to match the brand's typographic voice

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute General Sans Variable/General Sans Variable with generic alternatives
- Don't use irregular spacing — stick to 12px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use large border-radius — keep everything crisp and geometric
- Don't add additional saturated colors beyond the primary accent
- Don't use pure black (#000000) for text — use `#181513` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 12px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #181513
Accent:      #06184f
Border:      #cdcdcd
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `General Sans Variable` heading in `#181513`, and a `#06184f` CTA button with 0px radius."
2. "Create a pricing card using background `#000000`, border `#cdcdcd`, `General Sans Variable` for text, and 36px padding."
3. "Design a navigation bar — `#ffffff` background, `#181513` links, `#06184f` for active state."
4. "Build a feature grid with 3 columns, 36px gap, each card using the card component style."
5. "Create a footer with `#181513` background, `#ffffff` text, and 24px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Check responsive behavior — test mobile and tablet layouts
7. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 70 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--white` | `#fff` |
| `--black` | `#181513` |
| `--grey` | `#cdcdcd` |
| `--grey-light` | `#f5f5f5` |
| `--grey-medium` | `#9e9e9e` |
| `--grey-dark` | `#727272` |
| `--grey-skeleton` | `#ebebeb` |
| `--grey-hover` | `#f0f0f0` |
| `--dark-blue` | `#06184f` |
| `--sky-blue` | `#dee9ff` |
| `--sky-blue-60` | `#ebf2ff` |
| `--sky-blue-25` | `#f7faff` |
| `--red` | `#e90000` |
| `--green` | `#0d4f06` |
| `--green-light` | `#def2df` |
| `--black-opacity-l` | `rgba(0,0,0,.8)` |
| `--black-opacity-m` | `rgba(0,0,0,.6)` |
| `--black-opacity-s` | `rgba(0,0,0,.5)` |
| `--gray-opacity-s` | `hsla(0,0%,80%,.3)` |
| `--border-line-transparent` | `1px solid hsla(0,0%,100%,.3)` |
| `--box-shadow-footer-mob` | `0 -2px 15px -2px #dbdbdb` |
| `--swiper-theme-color` | `#007aff` |

### Spacing Variables

| Variable | Value |
|---|---|
| `--container-spacer` | `4rem` |
| `--grid-spacer` | `2rem` |
| `--section-spacer-l` | `25rem` |
| `--first-padding-bottom` | `6rem` |
| `--block-width-m` | `74rem` |
| `--search-sidebar-width` | `26rem` |
| `--link-spacer` | `.4rem` |
| `--fixed-padding` | `1.5rem` |
| `--property-hero-height` | `49rem` |
| `--property-desc-w` | `88%` |
| `--property-title-spacer-m` | `1.6rem` |
| `--property-title-spacer-l` | `2.4rem` |
| `--property-title-spacer-xl` | `3.2rem` |
| `--modal-large-spacer-x` | `3.2rem` |
| `--modal-large-spacer-y` | `2.4rem` |
| `--search-controls-spacer-bottom` | `1.8rem` |
| `--arrow-size-m` | `1.6rem` |
| `--arrow-size-2xl` | `2.8rem` |
| `--size` | `1600` |
| `--swiper-navigation-size` | `44px` |

### Typography Variables

| Variable | Value |
|---|---|
| `--font-default` | `"General Sans Variable",Arial,sans-serif` |
| `--font-italic` | `"Playfair Display",sans-serif` |
| `--input-font-size-mob` | `max(16px,1.4rem)` |
| `--text-image-width` | `11rem` |
| `--text-image-height` | `7.5rem` |

### Other Variables

| Variable | Value |
|---|---|
| `--transition-speed` | `cubic-bezier(.28,.11,.32,1)` |
| `--transition-fast` | `.21s var(--transition-speed)` |
| `--transition-default` | `.42s var(--transition-speed)` |
| `--transition-slow` | `1.32s var(--transition-speed)` |
| `--transition-themeChange` | `2.32s var(--transition-speed)` |
| `--border-line` | `1px solid var(--grey)` |
| `--border-line-s` | `.5px solid var(--grey)` |
| `--border-line-light` | `1px solid var(--grey-light)` |
| `--border-line-medium` | `1px solid var(--grey-medium)` |
| `--border-line-medium-s` | `.5px solid var(--grey-medium)` |
| `--header-height` | `max(50px,7rem)` |
| `--border-radius` | `max(8px,1.2rem)` |
| `--border-radius-s` | `max(4px,.6rem)` |
| `--border-radius-xs` | `max(4px,.4rem)` |
| `--block-width-l` | `max(520px,112rem)` |
| ... | *(8 more)* |
