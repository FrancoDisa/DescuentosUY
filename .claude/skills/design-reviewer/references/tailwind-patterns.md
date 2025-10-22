# Tailwind CSS Patterns for DescuentosUY

Project-specific Tailwind CSS conventions and patterns.

## Design System

### Color Palette

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... blue scale
          600: '#2563eb',  // Primary brand color
          700: '#1d4ed8',
        },
        success: colors.green,
        error: colors.red,
        warning: colors.yellow,
        info: colors.blue,
      }
    }
  }
}
```

**Usage:**
```tsx
// ✅ Primary actions
<button className="bg-blue-600 hover:bg-blue-700">

// ✅ Semantic colors
<div className="text-green-600">Success!</div>
<div className="text-red-600">Error!</div>

// ❌ Avoid arbitrary colors
<div className="bg-[#2563eb]">  // Use bg-blue-600 instead
```

### Typography

```tsx
// Headings
<h1 className="text-3xl md:text-4xl font-bold">Page Title</h1>
<h2 className="text-2xl md:text-3xl font-semibold">Section Title</h2>
<h3 className="text-xl font-semibold">Subsection</h3>

// Body text
<p className="text-base">Normal paragraph</p>
<p className="text-sm text-gray-600">Caption or helper text</p>

// Emphasis
<strong className="font-semibold">Important</strong>
<em className="italic">Emphasized</em>
```

### Spacing Scale

Use Tailwind's default spacing (1 unit = 0.25rem = 4px):

```tsx
// Common spacings
gap-2   // 8px - tight spacing
gap-4   // 16px - default spacing
gap-6   // 24px - medium spacing
gap-8   // 32px - large spacing

p-4     // 16px padding
px-6    // 24px horizontal padding
py-3    // 12px vertical padding
```

## Component Patterns

### Buttons

```tsx
// Primary button
<button className="
  px-4 py-2
  bg-blue-600 hover:bg-blue-700
  text-white font-medium
  rounded-lg
  transition-colors
  focus:outline-none focus:ring-2 focus:ring-blue-500
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Primary Action
</button>

// Secondary button
<button className="
  px-4 py-2
  bg-gray-200 hover:bg-gray-300
  text-gray-900 font-medium
  rounded-lg
  transition-colors
">
  Secondary Action
</button>

// Icon button
<button
  aria-label="Close"
  className="
    p-2 rounded-full
    hover:bg-gray-100
    focus:ring-2 focus:ring-blue-500
  "
>
  <XIcon className="h-5 w-5" />
</button>
```

### Cards

```tsx
<div className="
  bg-white
  border border-gray-200
  rounded-lg
  shadow-sm
  p-6
  hover:shadow-md
  transition-shadow
">
  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-gray-600">Card content...</p>
</div>
```

### Forms

```tsx
<div className="space-y-4">
  <div>
    <label
      htmlFor="email"
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      Email
    </label>
    <input
      id="email"
      type="email"
      className="
        w-full px-3 py-2
        border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:bg-gray-100
      "
      placeholder="tu@email.com"
    />
  </div>
</div>
```

### Navigation

```tsx
// Desktop nav
<nav className="hidden md:flex items-center gap-6">
  <a
    href="/"
    className="text-gray-700 hover:text-blue-600 transition-colors"
  >
    Home
  </a>
  <a
    href="/mapa"
    className="text-gray-700 hover:text-blue-600 transition-colors"
  >
    Mapa
  </a>
</nav>

// Mobile menu button
<button
  className="md:hidden p-2"
  aria-label="Open menu"
  aria-expanded={isOpen}
>
  <MenuIcon className="h-6 w-6" />
</button>
```

## Responsive Patterns

### Mobile-First Breakpoints

```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">

// 1 col mobile, 2 cols tablet, 3 cols desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Hide/show based on screen size
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>

// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Responsive padding
<div className="px-4 md:px-6 lg:px-8">
```

### Container Widths

```tsx
// Full width on mobile, constrained on desktop
<div className="w-full max-w-7xl mx-auto px-4 md:px-6">
  Content
</div>

// Common max-widths
max-w-sm   // 24rem (384px) - narrow forms
max-w-2xl  // 42rem (672px) - text content
max-w-7xl  // 80rem (1280px) - full layout
```

## Layout Patterns

### Flexbox Layouts

```tsx
// Center content
<div className="flex items-center justify-center">
  Centered content
</div>

// Space between items
<div className="flex justify-between items-center">
  <div>Left</div>
  <div>Right</div>
</div>

// Vertical stack with spacing
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Grid Layouts

```tsx
// Equal columns
<div className="grid grid-cols-3 gap-4">
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
</div>

// Auto-fit columns (responsive)
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <div>Card</div>
  <div>Card</div>
  <div>Card</div>
</div>
```

## Utility Patterns

### Truncate Text

```tsx
// Single line truncate
<p className="truncate">Very long text that will be cut off...</p>

// Multi-line truncate (using line-clamp plugin)
<p className="line-clamp-3">
  Long text that will show max 3 lines...
</p>
```

### Aspect Ratios

```tsx
// 16:9 image container
<div className="aspect-video bg-gray-200">
  <Image src="..." fill className="object-cover" />
</div>

// 1:1 square
<div className="aspect-square">
  Content
</div>
```

### Animations

```tsx
// Pulse loading
<div className="animate-pulse bg-gray-200 h-4 rounded"></div>

// Spin loading
<div className="animate-spin border-2 border-t-blue-600 rounded-full w-6 h-6"></div>

// Respect motion preferences
<div className="motion-safe:animate-pulse">
  Only animates if user allows
</div>
```

## Accessibility Patterns

### Focus States

```tsx
// Always include visible focus
<a
  href="..."
  className="
    text-blue-600
    underline
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    focus:ring-offset-2
  "
>
  Link
</a>
```

### Screen Reader Only

```tsx
// Hide visually but keep for screen readers
<span className="sr-only">
  Additional context for screen readers
</span>

// Hide from screen readers
<div aria-hidden="true">
  Decorative element
</div>
```

## Performance Patterns

### Prevent Layout Shift

```tsx
// Reserve space for images
<div className="relative w-48 h-48">
  <Image
    src="..."
    fill
    className="object-cover"
    alt="..."
  />
</div>

// Reserve space for dynamic content
<div className="min-h-[200px]">
  <Suspense fallback={<Skeleton />}>
    <DynamicContent />
  </Suspense>
</div>
```

### Optimize Animations

```tsx
// ✅ GPU-accelerated (transform, opacity)
<div className="transition-transform hover:scale-105">

// ❌ Avoid (causes layout recalc)
<div className="transition-all hover:w-full">
```

## Dark Mode (Future)

```tsx
// When implementing dark mode:
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
">
  Content
</div>

// Configure in tailwind.config.js:
// darkMode: 'class'
```

## Common Anti-Patterns

### ❌ Avoid

```tsx
// Using arbitrary values when utilities exist
<div className="mt-[13px]">  // Use mt-3 or mt-4

// Too many utilities (extract to component)
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">

// Inline styles
<div style={{ marginTop: '16px' }}>  // Use mt-4

// Important modifier overuse
<div className="!mt-4">  // Avoid !important
```

### ✅ Better Approaches

```tsx
// Extract repeated patterns to component
function Button({ children, variant = 'primary' }) {
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-gray-200 hover:bg-gray-300"
  }

  return (
    <button className={`px-4 py-2 rounded-lg ${styles[variant]}`}>
      {children}
    </button>
  )
}

// Use spacing scale
<div className="mt-4">  // 16px

// Configure custom values in tailwind.config.js
extend: {
  spacing: {
    '128': '32rem',
  }
}
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com/) - Component examples
- [Headless UI](https://headlessui.com/) - Unstyled accessible components
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - VS Code extension
