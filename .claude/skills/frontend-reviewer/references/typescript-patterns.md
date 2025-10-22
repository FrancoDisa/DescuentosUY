# TypeScript Patterns for DescuentosUY

TypeScript best practices and patterns specific to the DescuentosUY project.

## Supabase Type Generation

### Generate Types from Database

```bash
# Generate TypeScript types from Supabase schema
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

### Use Generated Types

```typescript
import { Database } from '@/types/supabase'

// Table row types
type Store = Database['public']['Tables']['stores']['Row']
type Branch = Database['public']['Tables']['branches']['Row']
type Promotion = Database['public']['Tables']['promotions']['Row']

// Insert types (for creating new records)
type StoreInsert = Database['public']['Tables']['stores']['Insert']

// Update types (for partial updates)
type StoreUpdate = Database['public']['Tables']['stores']['Update']

// Function return types
type SearchStoresResult = Database['public']['Functions']['search_stores']['Returns']
```

## Component Props Typing

### Server Components

```typescript
// ✅ CORRECT: Async Server Component with typed props
import { Database } from '@/types/supabase'

type Store = Database['public']['Tables']['stores']['Row']

interface StorePageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function StorePage({
  params,
  searchParams
}: StorePageProps): Promise<JSX.Element> {
  const store: Store | null = await fetchStore(params.id)

  if (!store) {
    return <div>Store not found</div>
  }

  return <StoreDetail store={store} />
}
```

### Client Components

```typescript
// ✅ CORRECT: Client Component with typed props
'use client'

import { Database } from '@/types/supabase'

type Store = Database['public']['Tables']['stores']['Row']

interface StoreCardProps {
  store: Store
  onSelect?: (storeId: string) => void
  className?: string
}

export function StoreCard({ store, onSelect, className }: StoreCardProps) {
  return (
    <div className={className} onClick={() => onSelect?.(store.id)}>
      {store.name}
    </div>
  )
}
```

## Avoiding `any`

### Common `any` Replacements

```typescript
// ❌ WRONG: Using any
function handleClick(event: any) {
  console.log(event.target.value)
}

// ✅ CORRECT: Specific event type
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  const target = event.currentTarget
  console.log(target.value)
}

// ❌ WRONG: any for unknown structure
function processData(data: any) {
  return data.results.map((item: any) => item.name)
}

// ✅ CORRECT: Define the structure
interface ApiResponse {
  results: Array<{ name: string; id: number }>
}

function processData(data: ApiResponse) {
  return data.results.map(item => item.name)
}

// ✅ ALTERNATIVE: Use unknown and type guard
function processData(data: unknown) {
  if (isApiResponse(data)) {
    return data.results.map(item => item.name)
  }
  throw new Error('Invalid data structure')
}

function isApiResponse(data: unknown): data is ApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    Array.isArray((data as any).results)
  )
}
```

## React Hook Typing

### useState

```typescript
// ✅ Type inferred from initial value
const [count, setCount] = useState(0) // number

// ✅ Explicit type when initial value is null
const [store, setStore] = useState<Store | null>(null)

// ✅ For complex state
interface LocationState {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

const [location, setLocation] = useState<LocationState | null>(null)
```

### useRef

```typescript
// ✅ For DOM elements
const inputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  inputRef.current?.focus()
}, [])

// ✅ For mutable values
const watchIdRef = useRef<number | null>(null)

watchIdRef.current = navigator.geolocation.watchPosition(/* ... */)
```

### useEffect

```typescript
// ✅ Cleanup function properly typed
useEffect(() => {
  const controller = new AbortController()

  fetchData(controller.signal)

  return () => {
    controller.abort()
  }
}, [])
```

### Custom Hooks

```typescript
// ✅ CORRECT: Typed custom hook
interface UseLocationReturn {
  location: GeolocationCoordinates | null
  error: GeolocationPositionError | null
  loading: boolean
}

function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null)
  const [error, setError] = useState<GeolocationPositionError | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ...
  }, [])

  return { location, error, loading }
}
```

## Utility Types

### Extract types from arrays

```typescript
const SORT_OPTIONS = ['distance', 'rating', 'discount'] as const
type SortOption = typeof SORT_OPTIONS[number] // 'distance' | 'rating' | 'discount'
```

### Pick and Omit

```typescript
// ✅ Create subset of Store type
type StorePreview = Pick<Store, 'id' | 'name' | 'logo_url'>

// ✅ Exclude sensitive fields
type PublicStore = Omit<Store, 'internal_notes' | 'created_by'>
```

### Partial and Required

```typescript
// ✅ Make all fields optional (for updates)
type StoreUpdate = Partial<Store>

// ✅ Make all fields required
type CompleteStore = Required<Store>
```

### Record

```typescript
// ✅ Map of store IDs to stores
type StoreMap = Record<string, Store>

const storeMap: StoreMap = {
  'store-1': { id: 'store-1', name: 'Store 1', /* ... */ },
  'store-2': { id: 'store-2', name: 'Store 2', /* ... */ },
}
```

## Function Typing

### Regular Functions

```typescript
// ✅ CORRECT: Typed parameters and return value
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  // ...
  return distance
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}
```

### Arrow Functions

```typescript
// ✅ CORRECT: Typed arrow function
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}
```

### Async Functions

```typescript
// ✅ CORRECT: Async function with return type
async function fetchStore(id: string): Promise<Store | null> {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}
```

### Generic Functions

```typescript
// ✅ CORRECT: Generic function for array deduplication
function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter(item => {
    if (seen.has(item.id)) {
      return false
    }
    seen.add(item.id)
    return true
  })
}

// Usage
const uniqueStores = deduplicateById(stores)
const uniqueBranches = deduplicateById(branches)
```

## Type Guards

```typescript
// ✅ Create type guards for runtime checks
function isStore(value: unknown): value is Store {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'logo_url' in value
  )
}

// Usage
function processData(data: unknown) {
  if (isStore(data)) {
    // TypeScript knows data is Store here
    console.log(data.name)
  }
}
```

## Discriminated Unions

```typescript
// ✅ CORRECT: Use discriminated unions for state
type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: GeolocationCoordinates }
  | { status: 'error'; error: GeolocationPositionError }

function LocationStatus({ state }: { state: LocationState }) {
  switch (state.status) {
    case 'idle':
      return <div>Presiona para obtener ubicación</div>
    case 'loading':
      return <div>Obteniendo ubicación...</div>
    case 'success':
      return <div>Ubicación: {state.data.latitude}, {state.data.longitude}</div>
    case 'error':
      return <div>Error: {state.error.message}</div>
  }
}
```

## API Response Typing

```typescript
// ✅ Type API responses properly
interface SupabaseResponse<T> {
  data: T | null
  error: {
    message: string
    details: string
    hint: string
  } | null
}

type StoresResponse = SupabaseResponse<Store[]>

async function fetchStores(): Promise<Store[]> {
  const supabase = createPublicClient()
  const response: StoresResponse = await supabase
    .from('stores')
    .select('*')

  if (response.error) {
    throw new Error(response.error.message)
  }

  return response.data || []
}
```

## Intersection Types

```typescript
// ✅ Combine types
type StoreWithDistance = Store & {
  distance: number
  nearest_branch: Branch
}

// ✅ Combine props
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
}

function Button({ variant, size, ...props }: ButtonProps) {
  return <button {...props} className={`btn-${variant} btn-${size}`} />
}
```

## Enum Alternatives

```typescript
// ❌ AVOID: Traditional enums (they generate runtime code)
enum SortOption {
  Distance = 'distance',
  Rating = 'rating',
  Discount = 'discount'
}

// ✅ PREFER: Union types (no runtime cost)
type SortOption = 'distance' | 'rating' | 'discount'

// ✅ OR: const object with as const
const SORT_OPTIONS = {
  DISTANCE: 'distance',
  RATING: 'rating',
  DISCOUNT: 'discount'
} as const

type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS]
```

## tsconfig.json Strict Settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Common Pitfalls

### Pitfall 1: Indexing with unknown keys

```typescript
// ❌ WRONG: No runtime safety
const value = obj[key] // Could be undefined

// ✅ CORRECT: Check before accessing
if (key in obj) {
  const value = obj[key as keyof typeof obj]
}

// ✅ OR: Use optional chaining
const value = obj?.[key]
```

### Pitfall 2: Type assertions

```typescript
// ❌ WRONG: Unsafe type assertion
const store = data as Store

// ✅ CORRECT: Validate first
function isValidStore(data: unknown): data is Store {
  // Proper validation logic
}

if (isValidStore(data)) {
  const store = data // Type is narrowed safely
}
```

### Pitfall 3: Non-null assertions

```typescript
// ❌ RISKY: Assumes value is not null
const name = store!.name

// ✅ BETTER: Handle null case
const name = store?.name ?? 'Unknown'

// ✅ OR: Throw if null (when you're certain)
if (!store) {
  throw new Error('Store is required')
}
const name = store.name
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/generating-types)
- [Total TypeScript](https://www.totaltypescript.com/)
