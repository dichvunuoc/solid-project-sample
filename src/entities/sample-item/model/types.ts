export interface SampleItem {
  id: string
  title: string
  status: 'draft' | 'active' | 'archived'
  updatedAt: string
}

export interface SampleItemsResponse {
  items: SampleItem[]
  total: number
}
