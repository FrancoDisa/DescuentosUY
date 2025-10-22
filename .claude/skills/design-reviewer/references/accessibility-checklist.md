# WCAG 2.1 Accessibility Checklist

Complete Web Content Accessibility Guidelines (WCAG) 2.1 Level AA checklist for DescuentosUY.

## Quick Reference

**Conformance Levels:**
- **Level A:** Minimum accessibility (must meet)
- **Level AA:** Recommended accessibility (should meet)
- **Level AAA:** Enhanced accessibility (nice to have)

**Priority for DescuentosUY:** Level AA compliance

## 1. Perceivable

### 1.1 Text Alternatives

**1.1.1 Non-text Content (A)**
- [ ] All images have alt text
- [ ] Decorative images use `alt=""` or `aria-hidden="true"`
- [ ] Icons have accessible labels
- [ ] Logo has descriptive alt text

```tsx
// ✅ Informative image
<Image src="/logo.png" alt="DescuentosUY - Discounts in Montevideo" />

// ✅ Decorative image
<div className="bg-pattern" aria-hidden="true" />

// ✅ Icon button
<button aria-label="Close modal">
  <XIcon />
</button>
```

### 1.2 Time-based Media

**Not applicable** (DescuentosUY doesn't currently use video/audio)

### 1.3 Adaptable

**1.3.1 Info and Relationships (A)**
- [ ] Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<article>`)
- [ ] Headings create logical structure
- [ ] Lists use `<ul>`, `<ol>`, or `<dl>`
- [ ] Forms use `<label>` elements

**1.3.2 Meaningful Sequence (A)**
- [ ] Content order makes sense when CSS is disabled
- [ ] Tab order follows visual order
- [ ] Reading order is logical

**1.3.3 Sensory Characteristics (A)**
- [ ] Instructions don't rely solely on shape, size, or location
- [ ] Don't use "click the red button" (specify button purpose)

**1.3.4 Orientation (AA)**
- [ ] Content not locked to portrait or landscape
- [ ] Works in both orientations

**1.3.5 Identify Input Purpose (AA)**
- [ ] Form inputs use `autocomplete` attribute where applicable

```tsx
<input
  type="email"
  name="email"
  autocomplete="email"
/>
```

### 1.4 Distinguishable

**1.4.1 Use of Color (A)**
- [ ] Color is not the only means of conveying information
- [ ] Links distinguishable from text (underline, icon, etc.)

```tsx
// ✅ Error shown with color AND icon
<p className="text-red-600 flex items-center gap-2">
  <ErrorIcon /> Invalid email
</p>

// ❌ Color only
<p className="text-red-600">Invalid email</p>
```

**1.4.3 Contrast (Minimum) (AA)**
- [ ] Text contrast ratio ≥ 4.5:1
- [ ] Large text (18pt+) contrast ratio ≥ 3:1
- [ ] UI components contrast ratio ≥ 3:1

**Common Tailwind Colors That Pass:**
- `text-gray-700` on white: ~4.5:1 ✅
- `text-gray-600` on white: ~3.7:1 ❌ (use for large text only)
- `text-blue-600` on white: ~4.5:1 ✅
- `text-green-600` on white: ~3.8:1 ❌

**1.4.4 Resize Text (AA)**
- [ ] Text can be resized to 200% without loss of functionality
- [ ] Use relative units (rem, em) not pixels

**1.4.5 Images of Text (AA)**
- [ ] Use real text instead of text in images (except logos)

**1.4.10 Reflow (AA)**
- [ ] Content works at 320px width without horizontal scrolling
- [ ] Responsive design works on mobile

**1.4.11 Non-text Contrast (AA)**
- [ ] UI components have 3:1 contrast (buttons, form borders, etc.)
- [ ] Graphical objects have 3:1 contrast

**1.4.12 Text Spacing (AA)**
- [ ] Content readable with increased spacing
- [ ] No overlap when line-height is 1.5x font size

**1.4.13 Content on Hover or Focus (AA)**
- [ ] Hover/focus content is dismissible
- [ ] Hover/focus content doesn't disappear when pointer moves to it
- [ ] Hover/focus content remains until dismissed

## 2. Operable

### 2.1 Keyboard Accessible

**2.1.1 Keyboard (A)**
- [ ] All functionality available via keyboard
- [ ] No keyboard traps

```tsx
// ✅ Test: Can you Tab through all interactive elements?
// ✅ Test: Can you use Enter/Space to activate buttons?
// ✅ Test: Can you Escape to close modals?
```

**2.1.2 No Keyboard Trap (A)**
- [ ] Users can navigate away from all components using keyboard

**2.1.4 Character Key Shortcuts (A)**
- [ ] Single character shortcuts can be disabled or remapped (if used)

### 2.2 Enough Time

**2.2.1 Timing Adjustable (A)**
- [ ] No time limits, or user can extend/disable them

**2.2.2 Pause, Stop, Hide (A)**
- [ ] Auto-updating content can be paused
- [ ] Animations can be paused or disabled

```tsx
// ✅ Respect prefers-reduced-motion
<div className="motion-safe:animate-pulse">
  Loading...
</div>
```

### 2.3 Seizures and Physical Reactions

**2.3.1 Three Flashes or Below Threshold (A)**
- [ ] No content flashes more than 3 times per second

### 2.4 Navigable

**2.4.1 Bypass Blocks (A)**
- [ ] "Skip to main content" link provided

```tsx
// ✅ Skip link (visible on focus)
<a
  href="#main"
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0"
>
  Skip to main content
</a>
<main id="main">...</main>
```

**2.4.2 Page Titled (A)**
- [ ] Every page has a unique, descriptive title

```tsx
// ✅ Next.js metadata
export const metadata = {
  title: 'Descuentos en Montevideo | DescuentosUY',
  description: '...'
}
```

**2.4.3 Focus Order (A)**
- [ ] Tab order is logical and intuitive

**2.4.4 Link Purpose (In Context) (A)**
- [ ] Link text describes destination

```tsx
// ✅ Descriptive link
<a href="/local/123">Ver detalles de Tienda ABC</a>

// ❌ Generic link
<a href="/local/123">Click aquí</a>
```

**2.4.5 Multiple Ways (AA)**
- [ ] Multiple ways to find pages (navigation, search, sitemap)

**2.4.6 Headings and Labels (AA)**
- [ ] Headings and labels are descriptive

**2.4.7 Focus Visible (AA)**
- [ ] Keyboard focus indicator is visible

```tsx
// ✅ Visible focus ring
<button className="focus:ring-2 focus:ring-blue-500 focus:outline-none">
  Click me
</button>

// ❌ No focus indicator
<button className="focus:outline-none">
  Click me
</button>
```

### 2.5 Input Modalities

**2.5.1 Pointer Gestures (A)**
- [ ] No multipoint or path-based gestures required

**2.5.2 Pointer Cancellation (A)**
- [ ] Click events fire on mouseup/touchend (not mousedown)

**2.5.3 Label in Name (A)**
- [ ] Visible label matches accessible name

**2.5.4 Motion Actuation (A)**
- [ ] Device motion not required for functionality

## 3. Understandable

### 3.1 Readable

**3.1.1 Language of Page (A)**
- [ ] Page language is identified

```tsx
// ✅ In app/layout.tsx
<html lang="es">
```

**3.1.2 Language of Parts (AA)**
- [ ] Language changes marked with `lang` attribute

### 3.2 Predictable

**3.2.1 On Focus (A)**
- [ ] Focusing an element doesn't cause unexpected context change

**3.2.2 On Input (A)**
- [ ] Changing input value doesn't cause unexpected context change

```tsx
// ✅ Form submits on button click, not on input change
<form onSubmit={handleSubmit}>
  <input onChange={handleChange} />  // Doesn't auto-submit
  <button type="submit">Search</button>
</form>
```

**3.2.3 Consistent Navigation (AA)**
- [ ] Navigation is in same relative order across pages

**3.2.4 Consistent Identification (AA)**
- [ ] Components with same function have same identification

### 3.3 Input Assistance

**3.3.1 Error Identification (A)**
- [ ] Form errors are clearly identified
- [ ] Error messages describe what went wrong

```tsx
// ✅ Clear error message
{error && (
  <p className="text-red-600 text-sm mt-1" role="alert">
    Por favor ingrese un email válido
  </p>
)}
```

**3.3.2 Labels or Instructions (A)**
- [ ] Form labels and instructions are provided

**3.3.3 Error Suggestion (AA)**
- [ ] Error messages suggest how to fix

**3.3.4 Error Prevention (Legal, Financial, Data) (AA)**
- [ ] Submissions are reversible, checked, or confirmed

## 4. Robust

### 4.1 Compatible

**4.1.1 Parsing (A) [Deprecated in WCAG 2.2]**
- [ ] HTML is valid

**4.1.2 Name, Role, Value (A)**
- [ ] Custom components have appropriate ARIA

**4.1.3 Status Messages (AA)**
- [ ] Status messages use `role="status"` or `role="alert"`

```tsx
// ✅ Announce success message to screen readers
<div role="status" aria-live="polite">
  Promoción guardada exitosamente
</div>

// ✅ Announce error
<div role="alert" aria-live="assertive">
  Error: no se pudo guardar
</div>
```

## Testing Tools

### Automated Testing
- **axe DevTools:** Browser extension for automated checks
- **Lighthouse:** Chrome DevTools accessibility audit
- **WAVE:** Web accessibility evaluation tool

### Manual Testing
- **Keyboard navigation:** Tab through entire page
- **Screen reader:** Test with NVDA (Windows) or VoiceOver (Mac)
- **Color contrast:** Use browser DevTools or WebAIM contrast checker
- **Zoom:** Test at 200% zoom

### Browser Extensions
- axe DevTools
- WAVE Evaluation Tool
- Accessibility Insights

## Quick Wins for DescuentosUY

Priority improvements for maximum accessibility impact:

1. **Add alt text to all images** (especially logos)
2. **Fix color contrast** in navigation and footer
3. **Add focus indicators** to all interactive elements
4. **Use semantic HTML** (`<button>` not `<div onClick>`)
5. **Add skip link** for keyboard users
6. **Label all form inputs** with `<label>` elements
7. **Add ARIA labels** to icon-only buttons
8. **Test keyboard navigation** through entire app
9. **Add error messages** to form validations
10. **Set page language** to Spanish (`lang="es"`)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [a11y Project Checklist](https://www.a11yproject.com/checklist/)
- [React Accessibility](https://react.dev/learn/accessibility)
