# Performance Checklist for DescuentosUY

A comprehensive checklist for optimizing React and Next.js performance in the DescuentosUY application.

## React Performance

### Unnecessary Re-renders

**Check for:**
- [ ] Components re-rendering when props haven't changed
- [ ] Parent component updates causing all children to re-render
- [ ] Context value changes triggering unnecessary updates

**Solutions:**
```typescript
// ✅ Use React.memo for expensive components
const StoreCard = React.memo(({ store }: { store: Store }) => {
  return <div>{/* ... */}</div>
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.store.id === nextProps.store.id
})

// ✅ Use useMemo for expensive computations
const sortedStores = useMemo(() => {
  return stores.sort((a, b) => a.distance - b.distance)
}, [stores])

// ✅ Use useCallback for functions passed as props
const handleStoreClick = useCallback((storeId: string) => {
  router.push(`/local/${storeId}`)
}, [router])
```

### Heavy Computations

**Check for:**
- [ ] Sorting/filtering large arrays on every render
- [ ] Complex calculations without memoization
- [ ] Data transformations repeated unnecessarily

**Solutions:**
```typescript
// ❌ WRONG: Recalculates on every render
function StoreList({ stores }) {
  const deduplicatedStores = stores.reduce(/* complex logic */)
  const nearestStores = deduplicatedStores.filter(/* ... */)
  return <div>{/* ... */}</div>
}

// ✅ CORRECT: Memoized calculations
function StoreList({ stores }) {
  const deduplicatedStores = useMemo(() => {
    return stores.reduce(/* complex logic */)
  }, [stores])

  const nearestStores = useMemo(() => {
    return deduplicatedStores.filter(s => s.distance < 5)
  }, [deduplicatedStores])

  return <div>{/* ... */}</div>
}
```

### List Rendering

**Check for:**
- [ ] Long lists rendering all items at once
- [ ] Missing keys in list items
- [ ] Keys using array index instead of stable IDs

**Solutions:**
```typescript
// ✅ Use proper keys (never index)
{stores.map((store) => (
  <StoreCard key={store.id} store={store} />
))}

// ✅ Consider virtualization for very long lists (100+ items)
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={stores.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <StoreCard store={stores[index]} />
    </div>
  )}
</FixedSizeList>
```

### Memory Leaks

**Check for:**
- [ ] useEffect without cleanup functions
- [ ] Timers/intervals not cleared
- [ ] Event listeners not removed
- [ ] Subscriptions not unsubscribed

**Solutions:**
```typescript
// ✅ CORRECT: Cleanup in useEffect
useEffect(() => {
  const watchId = navigator.geolocation.watchPosition(callback)

  return () => {
    navigator.geolocation.clearWatch(watchId)
  }
}, [])

// ✅ CORRECT: Clear timers
useEffect(() => {
  const timerId = setTimeout(() => {/* ... */}, 1000)

  return () => clearTimeout(timerId)
}, [])
```

## Next.js Optimization

### Image Optimization

**Check for:**
- [ ] Using `<img>` instead of `next/image`
- [ ] Missing width/height causing layout shift
- [ ] Not using appropriate image sizes
- [ ] Loading images that are off-screen

**Solutions:**
```typescript
// ✅ CORRECT: Optimized images
import Image from 'next/image'

<Image
  src={store.logo_url}
  alt={store.name}
  width={48}
  height={48}
  className="rounded-full"
  loading="lazy" // Lazy load off-screen images
  placeholder="blur" // Optional: show blur while loading
/>

// ✅ For dynamic images from Supabase Storage
<Image
  src={store.logo_url}
  alt={store.name}
  width={48}
  height={48}
  unoptimized={false} // Let Next.js optimize
/>
```

### Code Splitting

**Check for:**
- [ ] Large client components loaded eagerly
- [ ] Heavy libraries imported but rarely used
- [ ] Map/chart libraries loaded on initial render

**Solutions:**
```typescript
// ✅ Dynamic import for heavy components
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <MapSkeleton />
})

// ✅ Dynamic import for heavy libraries
const generatePDF = async () => {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  // ...
}
```

### Bundle Size

**Check for:**
- [ ] Large dependencies (use `npm run build` to analyze)
- [ ] Importing entire libraries instead of specific functions
- [ ] Duplicate dependencies

**Solutions:**
```typescript
// ❌ WRONG: Imports entire lodash
import _ from 'lodash'
_.debounce(fn, 300)

// ✅ CORRECT: Import specific function
import debounce from 'lodash/debounce'
debounce(fn, 300)

// ✅ Even better: Use native alternatives when possible
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
```

### Caching Strategy

**Check for:**
- [ ] Appropriate cache settings for static data
- [ ] Revalidation intervals for dynamic data
- [ ] Using proper fetch cache options

**Solutions:**
```typescript
// ✅ Static data - cache aggressively
const { data: categories } = await supabase
  .from('categories')
  .select('*')
// Add to page: export const revalidate = 86400 // 24 hours

// ✅ Dynamic data - short cache or no cache
export const dynamic = 'force-dynamic' // For real-time data

// ✅ Periodic revalidation
export const revalidate = 3600 // Revalidate every hour
```

## Core Web Vitals

### Largest Contentful Paint (LCP)

**Target: < 2.5 seconds**

**Check for:**
- [ ] Large images without optimization
- [ ] Blocking resources in critical path
- [ ] Slow server response times

**Solutions:**
- Use `priority` prop on above-the-fold images
- Preload critical resources
- Optimize Supabase queries (indexes, select only needed columns)

```typescript
// ✅ Priority loading for hero image
<Image
  src="/hero.jpg"
  priority
  width={1200}
  height={600}
  alt="Hero"
/>
```

### First Input Delay (FID) / Interaction to Next Paint (INP)

**Target: < 100ms (FID), < 200ms (INP)**

**Check for:**
- [ ] Long-running JavaScript blocking main thread
- [ ] Heavy event handlers
- [ ] Synchronous operations on user interaction

**Solutions:**
- Break up long tasks with `setTimeout` or `requestIdleCallback`
- Debounce/throttle frequent events
- Use Web Workers for heavy computations

```typescript
// ✅ Debounce search input
const debouncedSearch = useMemo(
  () =>
    debounce((value: string) => {
      router.push(`/?query=${value}`)
    }, 300),
  [router]
)
```

### Cumulative Layout Shift (CLS)

**Target: < 0.1**

**Check for:**
- [ ] Images without dimensions
- [ ] Content inserted above existing content
- [ ] Fonts causing layout shifts (FOUT/FOIT)

**Solutions:**
```typescript
// ✅ Reserve space for dynamic content
<div className="min-h-[400px]">
  <Suspense fallback={<Skeleton height={400} />}>
    <DynamicContent />
  </Suspense>
</div>

// ✅ Use font-display swap in Tailwind config
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
}
```

## Data Fetching Performance

### Supabase Query Optimization

**Check for:**
- [ ] Selecting all columns when only few needed
- [ ] N+1 query problems
- [ ] Missing database indexes
- [ ] Inefficient PostGIS queries

**Solutions:**
```typescript
// ❌ WRONG: Select everything
const { data } = await supabase.from('stores').select('*')

// ✅ CORRECT: Select only needed columns
const { data } = await supabase
  .from('stores')
  .select('id, name, logo_url, branches(latitude, longitude)')

// ✅ Use RPC for complex queries
const { data } = await supabase.rpc('search_stores', {
  search_query: query,
  user_lat: lat,
  user_lon: lon,
  sort_by: 'distance'
})
```

### Parallel Data Fetching

**Check for:**
- [ ] Sequential awaits when data is independent
- [ ] Waterfalls in data fetching

**Solutions:**
```typescript
// ❌ WRONG: Sequential fetching (slow)
const stores = await fetchStores()
const promotions = await fetchPromotions()
const categories = await fetchCategories()

// ✅ CORRECT: Parallel fetching (fast)
const [stores, promotions, categories] = await Promise.all([
  fetchStores(),
  fetchPromotions(),
  fetchCategories()
])
```

## Third-Party Scripts

### Google Maps Performance

**Check for:**
- [ ] Loading Maps API on pages that don't need it
- [ ] Not using dynamic imports for map components
- [ ] Loading too many markers at once

**Solutions:**
```typescript
// ✅ Load only on map page
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <MapSkeleton />
})

// ✅ Cluster markers when there are many
import MarkerClusterer from '@googlemaps/markerclusterer'

const clusterer = new MarkerClusterer({ map, markers })
```

## Monitoring Performance

### Use React DevTools Profiler

```bash
# In development, use the Profiler tab in React DevTools to:
- Identify components that re-render frequently
- Find components with long render times
- Detect commit waterfalls
```

### Use Next.js Speed Insights

```typescript
// Add Vercel Speed Insights to track real user metrics
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Lighthouse Audits

```bash
# Run Lighthouse audits regularly
npm run build
npm run start
# Then run Lighthouse in Chrome DevTools
```

## Performance Budget

Set performance budgets for:

- [ ] **Bundle Size:** Main bundle < 200KB gzipped
- [ ] **Total Page Weight:** < 1MB for initial load
- [ ] **LCP:** < 2.5s
- [ ] **FID/INP:** < 100ms / < 200ms
- [ ] **CLS:** < 0.1
- [ ] **Time to Interactive:** < 3.5s

## Quick Wins Checklist

Common optimizations that provide immediate improvements:

- [ ] Enable Next.js Image optimization for all images
- [ ] Add `React.memo` to list item components
- [ ] Use `useMemo` for sorted/filtered data
- [ ] Dynamic import for Map component
- [ ] Add proper `key` props to all lists
- [ ] Implement Suspense boundaries for async components
- [ ] Use `useCallback` for event handlers passed to children
- [ ] Optimize Supabase queries (select only needed fields)
- [ ] Add loading skeletons instead of spinners
- [ ] Preload critical fonts
- [ ] Enable compression on Vercel (automatic)
- [ ] Use SWR or React Query for client-side caching (if needed)

## Resources

- [Next.js Performance Documentation](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web.dev Performance](https://web.dev/performance/)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
