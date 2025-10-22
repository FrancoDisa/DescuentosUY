---
name: design-reviewer
description: Reviews UI/UX design including Tailwind CSS usage, accessibility (WCAG), responsive design, and design consistency. Ensures best practices for web standards and user experience.
---

# Design Reviewer

Perform comprehensive UI/UX design reviews for Tailwind CSS-based applications, focusing on accessibility, responsive design, visual consistency, and usability.

## When to Use This Skill

Invoke this skill when:
- Reviewing new UI components or pages
- Auditing accessibility compliance (WCAG 2.1)
- Checking responsive design across breakpoints
- Ensuring design system consistency
- Investigating UX issues or user complaints
- Before major design releases
- Performing design quality checks

## Review Workflow

### 1. Tailwind CSS Best Practices

Review Tailwind usage for consistency and maintainability:

**Utility-First Approach:**
```tsx
// ✅ CORRECT: Utility classes
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click me
</button>

// ❌ AVOID: Custom CSS when utilities exist
<button className="custom-button">
  Click me
</button>
/* custom-button { padding: 1rem; background: blue; } */
```

**Component Extraction:**
```tsx
// ❌ WRONG: Repeated classes everywhere
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">

// ✅ BETTER: Extract to component
function Button({ children, variant = 'primary' }: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg transition-colors"
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300"
  }

  return (
    <button className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  )
}
```

**Responsive Design:**
```tsx
// ✅ CORRECT: Mobile-first responsive
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Column 1</div>
  <div className="w-full md:w-1/2">Column 2</div>
</div>

// ❌ WRONG: Desktop-first (non-standard for Tailwind)
<div className="flex-row md:flex-col">  // Backwards!
```

**Reference:** See `references/tailwind-patterns.md` for project-specific patterns.

### 2. Accessibility Audit (WCAG 2.1)

Perform comprehensive accessibility review:

**Color Contrast (WCAG AA):**
- Minimum contrast ratio 4.5:1 for normal text
- Minimum contrast ratio 3:1 for large text (18pt+)
- Check all text/background combinations

```tsx
// ❌ FAIL: Low contrast (gray-400 on white ~2.5:1)
<p className="text-gray-400">Hard to read</p>

// ✅ PASS: Good contrast (gray-700 on white ~4.5:1)
<p className="text-gray-700">Easy to read</p>

// ✅ PASS: Large text can use lower contrast
<h1 className="text-3xl text-gray-600">Heading</h1>
```

**Keyboard Navigation:**
```tsx
// ✅ CORRECT: Focusable and accessible
<button
  className="focus:outline-none focus:ring-2 focus:ring-blue-500"
  aria-label="Close modal"
>
  <XIcon className="h-5 w-5" />
</button>

// ❌ WRONG: div as button (not focusable)
<div onClick={handleClick}>Click me</div>

// ❌ WRONG: No focus indicator
<button className="focus:outline-none">Click me</button>
```

**Screen Reader Support:**
```tsx
// ✅ CORRECT: Semantic HTML + ARIA
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// ✅ CORRECT: Alt text for images
<Image
  src="/logo.png"
  alt="DescuentosUY logo"
  width={48}
  height={48}
/>

// ❌ WRONG: Missing alt text
<img src="/logo.png" />

// ✅ CORRECT: Hide decorative images from screen readers
<div className="w-12 h-12 bg-blue-500 rounded-full" aria-hidden="true" />
```

**Form Accessibility:**
```tsx
// ✅ CORRECT: Labeled inputs
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Email
  </label>
  <input
    id="email"
    type="email"
    className="mt-1 block w-full"
    aria-describedby="email-error"
    aria-invalid={hasError}
  />
  {hasError && (
    <p id="email-error" className="text-red-600 text-sm">
      Invalid email
    </p>
  )}
</div>

// ❌ WRONG: No label
<input type="email" placeholder="Email" />
```

**Reference:** See `references/accessibility-checklist.md` for complete WCAG audit.

### 3. Responsive Design Review

Check responsive behavior across breakpoints:

**Tailwind Breakpoints:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

**Mobile-First Approach:**
```tsx
// ✅ CORRECT: Mobile-first (base styles = mobile)
<div className="
  text-sm          // Mobile: small text
  md:text-base     // Tablet: normal text
  lg:text-lg       // Desktop: large text
  px-4             // Mobile: small padding
  md:px-6          // Tablet: medium padding
  lg:px-8          // Desktop: large padding
">
  Responsive content
</div>
```

**Common Patterns:**
```tsx
// Navigation: Stack on mobile, horizontal on desktop
<nav className="flex flex-col md:flex-row gap-4">

// Grid: 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Hide/show elements
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

**Touch Targets:**
```tsx
// ✅ CORRECT: Minimum 44x44px touch target
<button className="min-h-[44px] min-w-[44px] p-3">
  Tap me
</button>

// ❌ WRONG: Too small on mobile
<button className="p-1 text-xs">Tiny button</button>
```

### 4. Visual Consistency

Audit design system adherence:

**Color Palette:**
- Check for colors outside defined palette
- Ensure consistent color usage (primary, secondary, etc.)
- Verify semantic colors (success, error, warning, info)

```tsx
// ✅ CORRECT: Using design system colors
<button className="bg-blue-600 hover:bg-blue-700">  // Primary brand color
<div className="text-green-600">Success!</div>      // Semantic color

// ❌ WRONG: Random colors
<button className="bg-[#4a5f99]">  // Arbitrary hex color
```

**Typography:**
```tsx
// ✅ CORRECT: Consistent text sizing
<h1 className="text-3xl md:text-4xl font-bold">Title</h1>
<h2 className="text-2xl md:text-3xl font-semibold">Subtitle</h2>
<p className="text-base">Body text</p>
<small className="text-sm text-gray-600">Caption</small>

// ❌ WRONG: Inconsistent sizing
<h1 className="text-[23px]">Title</h1>  // Arbitrary size
```

**Spacing:**
```tsx
// ✅ CORRECT: Consistent spacing scale
<div className="space-y-4">  // 1rem vertical spacing
  <div className="p-4">Content</div>
  <div className="mb-8">More content</div>
</div>

// ❌ WRONG: Arbitrary spacing
<div className="mb-[13px]">  // Not on spacing scale
```

**Reference:** See `references/design-system.md` for DescuentosUY design tokens.

### 5. Component Structure

Review component organization and markup:

**Semantic HTML:**
```tsx
// ✅ CORRECT: Semantic elements
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>

<footer>
  <p>&copy; 2024 DescuentosUY</p>
</footer>

// ❌ WRONG: Div soup
<div>
  <div>
    <div><a href="/">Home</a></div>
  </div>
</div>
```

**Heading Hierarchy:**
```tsx
// ✅ CORRECT: Logical heading order
<h1>Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection</h3>

// ❌ WRONG: Skipping levels
<h1>Page Title</h1>
  <h4>Section Title</h4>  // Skipped h2, h3
```

### 6. Loading States & Skeletons

Review loading UX:

```tsx
// ✅ CORRECT: Skeleton matching final layout
<div className="animate-pulse space-y-4">
  <div className="h-8 bg-gray-200 rounded w-3/4" />
  <div className="h-4 bg-gray-200 rounded w-full" />
  <div className="h-4 bg-gray-200 rounded w-5/6" />
</div>

// ✅ CORRECT: Suspense with skeleton
<Suspense fallback={<StoreCardSkeleton />}>
  <StoreCard store={store} />
</Suspense>

// ❌ WRONG: Generic spinner (doesn't match layout)
<div className="flex justify-center">
  <Spinner />
</div>
```

### 7. Interactive States

Audit button and link states:

```tsx
// ✅ CORRECT: All states covered
<button className="
  bg-blue-600              // Default
  hover:bg-blue-700        // Hover
  active:bg-blue-800       // Active/pressed
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500      // Focus
  disabled:opacity-50
  disabled:cursor-not-allowed  // Disabled
  transition-colors        // Smooth transitions
">
  Button
</button>

// ❌ WRONG: Missing states
<button className="bg-blue-600">
  Button
</button>
```

### 8. Dark Mode Readiness

Check dark mode support (if applicable):

```tsx
// ✅ CORRECT: Dark mode variants
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
">
  Content
</div>

// Configure in tailwind.config.js:
// darkMode: 'class' or 'media'
```

### 9. Performance & Optimization

Review visual performance:

**Layout Shift Prevention:**
```tsx
// ✅ CORRECT: Reserve space for images
<Image
  src={logo}
  width={48}
  height={48}
  alt="Logo"
  className="rounded-full"
/>

// ❌ WRONG: Unknown dimensions cause layout shift
<img src={logo} alt="Logo" className="rounded-full" />

// ✅ CORRECT: Reserve space for dynamic content
<div className="min-h-[200px]">
  <Suspense fallback={<Skeleton height={200} />}>
    <DynamicContent />
  </Suspense>
</div>
```

**Animation Performance:**
```tsx
// ✅ CORRECT: GPU-accelerated properties (transform, opacity)
<div className="
  transition-transform
  hover:scale-105
  transition-opacity
  hover:opacity-80
">
  Smooth animation
</div>

// ❌ AVOID: Animating layout properties (width, height, margin)
<div className="transition-all hover:w-full">  // Can cause jank
```

### 10. Generate Design Review Report

Provide a structured design review with:

1. **Summary:** Overall design quality rating
2. **Accessibility Issues:** WCAG violations with severity
3. **Responsive Issues:** Breakpoint problems, mobile UX
4. **Consistency Issues:** Design system deviations
5. **Usability Issues:** UX anti-patterns, confusing UI
6. **Performance Issues:** Layout shifts, slow animations
7. **Recommendations:** Prioritized improvements
8. **WCAG Compliance:** Checklist with pass/fail status

## Output Format

```markdown
## Design Review Report

### Summary
[Overall design rating: Excellent/Good/Needs Improvement/Poor]
[Key findings summary]

### Accessibility Issues (WCAG 2.1)
**Level A Violations (Must Fix):**
- [Issue: Missing alt text on logo image (file.tsx:15)]
- [Issue: Insufficient color contrast in footer (file.tsx:42)]

**Level AA Violations (Should Fix):**
- [Issue: No focus indicator on custom button (file.tsx:28)]

**Level AAA (Nice to Have):**
- [Issue: Contrast could be higher for readability]

### Responsive Design
**Mobile Issues:**
- [Issue: Touch target too small for close button]
- [Issue: Horizontal scroll on mobile due to fixed width]

**Tablet Issues:**
- [Issue: Awkward layout at 768px breakpoint]

### Visual Consistency
**Color Deviations:**
- [Using #4a5f99 instead of design system blue-600]

**Typography Issues:**
- [Inconsistent heading sizes across pages]

**Spacing Issues:**
- [Arbitrary margins not following spacing scale]

### Usability Issues
- [Issue: Form error messages too small to read]
- [Issue: No loading state while fetching data]
- [Issue: Ambiguous icon without label]

### Code Examples
#### Issue: Inaccessible Button
**Current:**
```tsx
<div onClick={handleClick}>Submit</div>
```

**Fixed:**
```tsx
<button
  onClick={handleClick}
  className="focus:ring-2 focus:ring-blue-500"
>
  Submit
</button>
```

**Why:** Divs are not keyboard accessible and not recognized as buttons by screen readers.

### WCAG 2.1 AA Compliance Checklist
- [x] 1.1.1 Non-text Content
- [ ] 1.4.3 Contrast (Minimum) - FAIL
- [x] 2.1.1 Keyboard
- [ ] 2.4.7 Focus Visible - FAIL
- [x] 3.1.1 Language of Page

### Recommended Actions
1. [Critical: Fix color contrast in navigation (WCAG violation)]
2. [High: Add focus indicators to all interactive elements]
3. [Medium: Improve mobile touch targets]
4. [Low: Unify button styles across app]
```

## Integration with Project

This skill is designed specifically for DescuentosUY and understands:
- Tailwind CSS configuration and customization
- Design system color palette and typography
- Component structure in `src/components/`
- Mobile-first responsive design approach
- Accessibility requirements for public-facing app

## Tools and References

**Local References:**
- `references/tailwind-patterns.md`: Project Tailwind conventions
- `references/accessibility-checklist.md`: Complete WCAG 2.1 audit guide
- `references/design-system.md`: Design tokens and component library

**External Tools:**
- Chrome DevTools: Lighthouse accessibility audit
- axe DevTools: Automated accessibility testing
- WAVE: Web accessibility evaluation tool
- Contrast Checker: Color contrast validation

## Example Usage

**User:** "Review the StoreCard component for accessibility"

**Workflow:**
1. Read StoreCard component file
2. Check color contrast ratios
3. Verify alt text on images
4. Check keyboard navigation and focus states
5. Review ARIA labels and semantic HTML
6. Test with screen reader expectations
7. Generate report with specific fixes

**User:** "Check if the new form is mobile-friendly"

**Workflow:**
1. Read form component
2. Check responsive breakpoints
3. Verify touch target sizes (44x44px minimum)
4. Review input field sizing on mobile
5. Check for horizontal scroll issues
6. Test form usability patterns
7. Generate report with mobile UX improvements
