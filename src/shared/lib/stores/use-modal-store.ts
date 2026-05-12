/**
 * Modal Manager Store
 *
 * Global state management for modals throughout the application.
 * Provides a centralized way to open, close, and manage multiple modals.
 *
 * Usage:
 * ```tsx
 * const { open, close, isOpen } = useModalStore()
 *
 * // Open a modal
 * open('confirmDelete')
 *
 * // Check if modal is open
 * if (isOpen('confirmDelete')) { ... }
 *
 * // Close a modal
 * close('confirmDelete')
 * ```
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type ModalId = string

interface ModalState {
  isOpen: boolean
  data?: unknown
}

interface ModalStore {
  modals: Map<ModalId, ModalState>

  // Actions
  open: (id: ModalId, data?: unknown) => void
  close: (id: ModalId) => void
  closeAll: () => void
  isOpen: (id: ModalId) => boolean
  getData: <T = unknown>(id: ModalId) => T | undefined
  setData: (id: ModalId, data: unknown) => void
}

export const useModalStore = create<ModalStore>()(
  devtools(
    (set, get) => ({
      modals: new Map(),

      open: (id, data) => {
        set(
          state => {
            const newModals = new Map(state.modals)
            newModals.set(id, { isOpen: true, data })
            return { modals: newModals }
          },
          false,
          `modal/${id}/open`
        )
      },

      close: id => {
        set(
          state => {
            const newModals = new Map(state.modals)
            newModals.set(id, { isOpen: false, data: undefined })
            return { modals: newModals }
          },
          false,
          `modal/${id}/close`
        )
      },

      closeAll: () => {
        set(
          state => {
            const newModals = new Map(state.modals)
            newModals.forEach((_, key) => {
              newModals.set(key, { isOpen: false, data: undefined })
            })
            return { modals: newModals }
          },
          false,
          'modal/closeAll'
        )
      },

      isOpen: id => {
        return get().modals.get(id)?.isOpen ?? false
      },

      getData: <T>(id: ModalId): T | undefined => {
        return get().modals.get(id)?.data as T | undefined
      },

      setData: (id, data) => {
        set(
          state => {
            const newModals = new Map(state.modals)
            const current = newModals.get(id)
            if (current) {
              newModals.set(id, { ...current, data })
            }
            return { modals: newModals }
          },
          false,
          `modal/${id}/setData`
        )
      },
    }),
    { name: 'ModalStore' }
  )
)

/**
 * Hook for managing a specific modal
 *
 * @param id - Unique identifier for the modal
 * @returns Modal control functions
 *
 * @example
 * ```tsx
 * function DeleteConfirmModal() {
 *   const { isOpen, close, data } = useModal<{ itemId: string }>('deleteConfirm')
 *
 *   if (!isOpen) return null
 *
 *   return (
 *     <Dialog open={isOpen} onOpenChange={close}>
 *       <DialogContent>
 *         <p>Delete item {data?.itemId}?</p>
 *         <Button onClick={close}>Cancel</Button>
 *       </DialogContent>
 *     </Dialog>
 *   )
 * }
 *
 * // Open the modal from anywhere
 * function ItemList() {
 *   const { open } = useModal('deleteConfirm')
 *
 *   return (
 *     <button onClick={() => open({ itemId: '123' })}>
 *       Delete
 *     </button>
 *   )
 * }
 * ```
 */
export function useModal<T = unknown>(id: ModalId) {
  const store = useModalStore()

  return {
    isOpen: store.isOpen(id),
    open: (data?: T) => store.open(id, data),
    close: () => store.close(id),
    data: store.getData<T>(id),
    setData: (data: T) => store.setData(id, data),
  }
}

/**
 * Common modal IDs
 * Define your application's modal IDs here for type safety
 */
export const MODAL_IDS = {
  CONFIRM_DELETE: 'confirmDelete',
  CONFIRM_ACTION: 'confirmAction',
  USER_PROFILE: 'userProfile',
  SETTINGS: 'settings',
  CREATE_POST: 'createPost',
  EDIT_POST: 'editPost',
} as const

export type CommonModalId = (typeof MODAL_IDS)[keyof typeof MODAL_IDS]
