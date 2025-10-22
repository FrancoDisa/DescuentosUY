# Next.js Patterns for DescuentosUY

This document outlines Next.js 15 App Router patterns specific to the DescuentosUY project.

## Server vs Client Components Decision Tree

### Use Server Components (default) when:
- Displaying data fetched from Supabase
- Rendering static content
- Processing searchParams or route params
- No user interaction needed (display only)
- Examples: `StoreList`, page layouts, static cards

### Use Client Components when:
- Using React hooks (useState, useEffect, useCallback, etc.)
- Browser APIs needed (geolocation, localStorage, sessionStorage)
- Event handlers required (onClick, onChange, etc.)
- Third-party libraries that require browser context
- Examples: `LocationHandler`, `LocationStatus`, `Map`, `MapLoader`

## Project-Specific Patterns

### Pattern 1: Async Server Components for Data Fetching

```typescript
// ✅ CORRECT: Server Component fetches data
// app/local/[id]/page.tsx
export default async function StorePage({ params }: { params: { id: string } }) {
  const supabase = createPublicClient()
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', params.id)
    .single()

  return <StoreDetail store={store} />
}
```

### Pattern 2: Client Components for Interactivity

```typescript
// ✅ CORRECT: Client Component for browser APIs
'use client'

import { useEffect, useState } from 'react'

export function LocationHandler() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null)

  useEffect(() => {
    navigator.geolocation.watchPosition(/* ... */)
  }, [])

  return <LocationStatus location={location} />
}
```

### Pattern 3: Suspense Boundaries

```typescript
// ✅ CORRECT: Wrap async components in Suspense
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AsyncStoreList />
    </Suspense>
  )
}
```

### Pattern 4: Supabase Client Creation

```typescript
// ✅ CORRECT: Use appropriate client based on context

// Server Components - anonymous access
import { createPublicClient } from '@/utils/supabase/server'
const supabase = createPublicClient()

// Server Components - authenticated access
import { createClient } from '@/utils/supabase/server'
const supabase = await createClient()

// Client Components - use client-side utilities
import { createBrowserClient } from '@supabase/ssr'
```

### Pattern 5: searchParams Handling

```typescript
// ✅ CORRECT: Read searchParams in Server Components
export default async function StoreList({
  searchParams
}: {
  searchParams: { query?: string; lat?: string; lon?: string }
}) {
  const { query, lat, lon } = searchParams

  // Fetch data with params
  const stores = await fetchStores({ query, lat, lon })

  return <div>{/* Render stores */}</div>
}

// ❌ INCORRECT: Don't use useSearchParams() when you can use searchParams prop
```

### Pattern 6: Dynamic Imports for Heavy Components

```typescript
// ✅ CORRECT: Dynamically import heavy components
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false, // Disable SSR for browser-only components
  loading: () => <MapSkeleton />
})
```

## Common Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Fetching Data in Client Components

```typescript
// ❌ WRONG
'use client'
export function StoreList() {
  const [stores, setStores] = useState([])

  useEffect(() => {
    fetch('/api/stores').then(/* ... */)
  }, [])

  return <div>{/* render */}</div>
}

// ✅ CORRECT: Fetch in Server Component
export default async function StoreList() {
  const supabase = createPublicClient()
  const { data: stores } = await supabase.from('stores').select('*')

  return <StoreListClient stores={stores} />
}
```

### ❌ Anti-Pattern 2: Unnecessary 'use client'

```typescript
// ❌ WRONG: No need for 'use client' if just displaying data
'use client'
export function StoreCard({ store }: { store: Store }) {
  return <div>{store.name}</div>
}

// ✅ CORRECT: Keep it as Server Component
export function StoreCard({ store }: { store: Store }) {
  return <div>{store.name}</div>
}
```

### ❌ Anti-Pattern 3: Prop Drilling

```typescript
// ❌ WRONG: Passing props through many layers
<Parent location={loc}>
  <Child location={loc}>
    <GrandChild location={loc}>
      <GreatGrandChild location={loc} />
    </GrandChild>
  </Child>
</Parent>

// ✅ CORRECT: Use composition or URL params
// Location data lives in URL params and is read where needed
```

## Image Optimization

```typescript
// ✅ CORRECT: Use Next.js Image component
import Image from 'next/image'

<Image
  src={store.logo_url}
  alt={store.name}
  width={48}
  height={48}
  className="rounded-full"
/>

// ❌ WRONG: Regular img tag
<img src={store.logo_url} alt={store.name} />
```

## Loading States

```typescript
// ✅ CORRECT: Use loading.tsx for route-level loading
// app/local/[id]/loading.tsx
export default function Loading() {
  return <StoreDetailSkeleton />
}

// ✅ CORRECT: Use Suspense for component-level loading
<Suspense fallback={<Spinner />}>
  <AsyncComponent />
</Suspense>
```

## Error Handling

```typescript
// ✅ CORRECT: Use error.tsx for route-level errors
// app/local/[id]/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Algo salió mal</h2>
      <button onClick={reset}>Intentar de nuevo</button>
    </div>
  )
}
```

## TypeScript Integration

```typescript
// ✅ CORRECT: Proper typing for Server Components
import { Database } from '@/types/supabase'

type Store = Database['public']['Tables']['stores']['Row']

export default async function StoreList(): Promise<JSX.Element> {
  const stores: Store[] = await fetchStores()
  return <div>{/* ... */}</div>
}
```

## Performance Considerations

### 1. Streaming with Suspense
Break up large pages into smaller async chunks that stream independently.

### 2. Partial Prerendering (when stable)
Consider using Partial Prerendering for pages with both static and dynamic content.

### 3. Route Segment Config
Use route segment config to control caching behavior:

```typescript
// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Revalidate every hour
export const revalidate = 3600
```

## Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side-rendering)
