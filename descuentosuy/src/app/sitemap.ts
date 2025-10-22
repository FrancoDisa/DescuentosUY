import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/utils/supabase/server'

type StoreRow = {
  id: string
  updated_at: string | null
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient()
  
  // Obtener todos los stores
  const { data: stores = [] } = await supabase
    .from('stores')
    .select('id, updated_at')

  const storeEntries: MetadataRoute.Sitemap = (stores || []).map((store: StoreRow) => ({
    url: `https://descuentosuy.vercel.app/local/${store.id}`,
    lastModified: store.updated_at ? new Date(store.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: 'https://descuentosuy.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://descuentosuy.vercel.app/mapa',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...storeEntries,
  ]
}
