/**
 * Pagination Utilities
 *
 * Reusable utilities and hooks for implementing pagination in your application.
 * Works with TanStack Query and other data fetching libraries.
 *
 * Usage:
 * ```tsx
 * const { page, pageSize, setPage, setPageSize } = usePagination()
 * const range = getPaginationRange(page, totalPages)
 * ```
 */

import { useState, useCallback, useMemo } from 'react'

/**
 * Pagination state interface
 */
export interface PaginationState {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * Pagination metadata returned from APIs
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

/**
 * Calculate pagination metadata
 *
 * @param total - Total number of items
 * @param page - Current page (1-indexed)
 * @param pageSize - Items per page
 * @returns Pagination metadata
 */
export function calculatePaginationMeta(
  total: number,
  page: number,
  pageSize: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize)

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  }
}

/**
 * Get pagination range for displaying page numbers
 *
 * Returns an array of page numbers and ellipsis indicators.
 * Example: [1, '...', 5, 6, 7, '...', 20]
 *
 * @param currentPage - Current page (1-indexed)
 * @param totalPages - Total number of pages
 * @param delta - Number of pages to show on each side of current page
 * @returns Array of page numbers and ellipsis
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  delta: number = 2
): (number | '...')[] {
  const range: (number | '...')[] = []

  if (totalPages <= 1) {
    return [1]
  }

  // Always show first page
  range.push(1)

  // Calculate start and end of middle range
  const start = Math.max(2, currentPage - delta)
  const end = Math.min(totalPages - 1, currentPage + delta)

  // Add left ellipsis if needed
  if (start > 2) {
    range.push('...')
  }

  // Add middle range
  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  // Add right ellipsis if needed
  if (end < totalPages - 1) {
    range.push('...')
  }

  // Always show last page (if there is more than one page)
  if (totalPages > 1) {
    range.push(totalPages)
  }

  return range
}

/**
 * Calculate offset for database queries
 *
 * @param page - Current page (1-indexed)
 * @param pageSize - Items per page
 * @returns Offset value (0-indexed)
 */
export function getOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize
}

/**
 * Get items for current page from an array
 *
 * @param items - Array of items
 * @param page - Current page (1-indexed)
 * @param pageSize - Items per page
 * @returns Paginated items
 */
export function paginateArray<T>(items: T[], page: number, pageSize: number): T[] {
  const offset = getOffset(page, pageSize)
  return items.slice(offset, offset + pageSize)
}

/**
 * Hook for managing pagination state
 *
 * @param initialPage - Initial page number (default: 1)
 * @param initialPageSize - Initial page size (default: 10)
 * @returns Pagination controls and state
 *
 * @example
 * ```tsx
 * function UserList() {
 *   const { page, pageSize, setPage, nextPage, prevPage, reset } = usePagination()
 *
 *   const { data } = useQuery({
 *     queryKey: ['users', page, pageSize],
 *     queryFn: () => fetchUsers(page, pageSize),
 *   })
 *
 *   return (
 *     <div>
 *       <button onClick={prevPage} disabled={page === 1}>Previous</button>
 *       <span>Page {page}</span>
 *       <button onClick={nextPage}>Next</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function usePagination(initialPage: number = 1, initialPageSize: number = 10) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1)
  }, [])

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1))
  }, [])

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage))
  }, [])

  const reset = useCallback(() => {
    setPage(initialPage)
    setPageSize(initialPageSize)
  }, [initialPage, initialPageSize])

  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }, [])

  return {
    page,
    pageSize,
    setPage: goToPage,
    setPageSize: changePageSize,
    nextPage,
    prevPage,
    reset,
  }
}

/**
 * Hook for managing pagination with total count
 *
 * Includes calculated metadata like totalPages, hasNext, hasPrevious
 *
 * @param total - Total number of items
 * @param initialPage - Initial page number (default: 1)
 * @param initialPageSize - Initial page size (default: 10)
 * @returns Pagination controls and metadata
 *
 * @example
 * ```tsx
 * function ProductList() {
 *   const { data } = useQuery(['products'], fetchProducts)
 *   const pagination = usePaginationWithMeta(
 *     data?.total ?? 0,
 *     1,
 *     20
 *   )
 *
 *   return (
 *     <div>
 *       <ProductGrid items={pagination.currentItems} />
 *       <div>
 *         Page {pagination.page} of {pagination.totalPages}
 *       </div>
 *       <button onClick={pagination.prevPage} disabled={!pagination.hasPrevious}>
 *         Previous
 *       </button>
 *       <button onClick={pagination.nextPage} disabled={!pagination.hasNext}>
 *         Next
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function usePaginationWithMeta(
  total: number,
  initialPage: number = 1,
  initialPageSize: number = 10
) {
  const pagination = usePagination(initialPage, initialPageSize)

  const meta = useMemo(
    () => calculatePaginationMeta(total, pagination.page, pagination.pageSize),
    [total, pagination.page, pagination.pageSize]
  )

  const paginationRange = useMemo(
    () => getPaginationRange(pagination.page, meta.totalPages),
    [pagination.page, meta.totalPages]
  )

  const safeNextPage = useCallback(() => {
    if (meta.hasNext) {
      pagination.nextPage()
    }
  }, [meta.hasNext, pagination])

  const safePrevPage = useCallback(() => {
    if (meta.hasPrevious) {
      pagination.prevPage()
    }
  }, [meta.hasPrevious, pagination])

  const goToLastPage = useCallback(() => {
    pagination.setPage(meta.totalPages)
  }, [pagination, meta.totalPages])

  const goToFirstPage = useCallback(() => {
    pagination.setPage(1)
  }, [pagination])

  return {
    ...pagination,
    ...meta,
    paginationRange,
    nextPage: safeNextPage,
    prevPage: safePrevPage,
    goToLastPage,
    goToFirstPage,
  }
}

/**
 * Hook for client-side pagination of an array
 *
 * Useful when you have all data loaded and want to paginate it client-side.
 *
 * @param items - Array of items to paginate
 * @param initialPageSize - Initial page size (default: 10)
 * @returns Pagination controls and current page items
 *
 * @example
 * ```tsx
 * function SearchResults({ results }) {
 *   const {
 *     currentItems,
 *     page,
 *     totalPages,
 *     nextPage,
 *     prevPage,
 *     hasNext,
 *     hasPrevious,
 *   } = useClientPagination(results, 20)
 *
 *   return (
 *     <div>
 *       {currentItems.map(item => <Item key={item.id} {...item} />)}
 *       <Pagination
 *         page={page}
 *         totalPages={totalPages}
 *         onNext={nextPage}
 *         onPrev={prevPage}
 *       />
 *     </div>
 *   )
 * }
 * ```
 */
export function useClientPagination<T>(items: T[], initialPageSize: number = 10) {
  const pagination = usePaginationWithMeta(items.length, 1, initialPageSize)

  const currentItems = useMemo(() => {
    return paginateArray(items, pagination.page, pagination.pageSize)
  }, [items, pagination.page, pagination.pageSize])

  return {
    ...pagination,
    currentItems,
  }
}

/**
 * Common page size options
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

/**
 * Default page size
 */
export const DEFAULT_PAGE_SIZE = 10

/**
 * Default page
 */
export const DEFAULT_PAGE = 1
