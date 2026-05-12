# Implementation Guide: Building Features with All Utilities

**Project:** frontend-sample  
**Last Updated:** 2025-12-31

---

## 📚 Overview

This guide demonstrates how to implement a complete feature using **all the utilities, patterns, and tools** available in the `frontend-sample` project. We'll build a real-world example: a **Blog Post Management Feature** that showcases every pattern documented in this project.

**What You'll Learn:**

- ✅ Feature-Sliced Design (FSD) architecture
- ✅ TanStack Query for server state
- ✅ Zustand for client state
- ✅ Event Bus for cross-feature communication
- ✅ Shadcn UI components
- ✅ Form validation with React Hook Form + Zod
- ✅ Permissions and RBAC
- ✅ Error handling and loading states
- ✅ Testing strategies
- ✅ TypeScript best practices

---

## 🎯 Example Feature: Blog Post Management

We'll implement:

- **Entity:** Post entity with types and queries
- **Features:** Create post, edit post, delete post
- **UI Components:** Post card, post form
- **State Management:** Server state (TanStack Query) + Modal state (Zustand)
- **Events:** Post created/updated/deleted events
- **Permissions:** Role-based access control
- **Testing:** Unit and E2E tests

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Define Data Models](#step-1-define-data-models)
3. [Step 2: Create Entity Layer](#step-2-create-entity-layer)
4. [Step 3: Create Feature - Create Post](#step-3-create-feature---create-post)
5. [Step 4: Create Feature - Edit Post](#step-4-create-feature---edit-post)
6. [Step 5: Create Feature - Delete Post](#step-5-create-feature---delete-post)
7. [Step 6: Event Integration](#step-6-event-integration)
8. [Step 7: Add Permissions](#step-7-add-permissions)
9. [Step 8: Create Page](#step-8-create-page)
10. [Step 9: Add Route](#step-9-add-route)
11. [Step 10: Testing](#step-10-testing)
12. [Best Practices Checklist](#best-practices-checklist)

---

## Prerequisites

Before starting, ensure you understand:

- [Feature-Sliced Design](./architectural-strictness-analysis.md)
- [State Management Patterns](./state-management-patterns.md)
- [API Contracts](./api-contracts.md)
- [UI Component Inventory](./ui-component-inventory.md)

---

## Step 1: Define Data Models

### 1.1 Add Prisma Schema

**Location:** `prisma/schema.prisma`

```prisma
// Add to existing schema
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  authorId  String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  likes  PostLike[]

  @@index([authorId])
  @@index([published])
}

model PostLike {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
}

// Don't forget to update User model
model User {
  // ... existing fields
  posts Post[]
  postLikes PostLike[]
}
```

**Run migration:**

```bash
npx prisma migrate dev --name add_posts
npx prisma generate
```

### 1.2 Create TypeScript Types

**Location:** `src/entities/post/model/types.ts`

```typescript
/**
 * Post Entity Types
 *
 * FSD Rule: Entities contain domain types and business logic.
 */

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  author?: {
    id: string
    name: string
    email: string
  }
  published: boolean
  likesCount: number
  isLikedByCurrentUser: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePostInput {
  title: string
  content: string
  published?: boolean
}

export interface UpdatePostInput {
  title?: string
  content?: string
  published?: boolean
}

export interface PostLike {
  id: string
  postId: string
  userId: string
  createdAt: string
}

export interface PostsResponse {
  posts: Post[]
  total: number
  page: number
  pageSize: number
}
```

### 1.3 Create Validation Schemas

**Location:** `src/entities/post/model/validation.ts`

```typescript
/**
 * Post Validation Schemas
 * Using Zod for runtime validation
 */

import { z } from 'zod'

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(10000, 'Content must be less than 10000 characters'),
  published: z.boolean().optional().default(false),
})

export const updatePostSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be less than 200 characters')
      .optional(),
    content: z
      .string()
      .min(10, 'Content must be at least 10 characters')
      .max(10000, 'Content must be less than 10000 characters')
      .optional(),
    published: z.boolean().optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: 'At least one field must be provided' })

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
```

---

## Step 2: Create Entity Layer

### 2.1 Create API Queries

**Location:** `src/entities/post/api/queries.ts`

```typescript
/**
 * Post Entity API Queries
 *
 * FSD Rule: Entities handle data fetching and business logic.
 * Uses TanStack Query for server state management.
 */

import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/shared/api/http-client'
import { queryKeys } from '@/shared/api/query-keys'
import type { Post, PostsResponse, CreatePostInput, UpdatePostInput } from '../model/types'

// ============================================
// Query Options (for reusable queries)
// ============================================

export const postsQueryOptions = (page = 1, pageSize = 10) =>
  queryOptions({
    queryKey: queryKeys.post.list(page, pageSize),
    queryFn: async (): Promise<PostsResponse> => {
      return httpClient.get(`/api/posts?page=${page}&pageSize=${pageSize}`)
    },
    staleTime: 1000 * 60, // 1 minute
  })

export const postQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: queryKeys.post.detail(postId),
    queryFn: async (): Promise<Post> => {
      return httpClient.get(`/api/posts/${postId}`)
    },
    staleTime: 1000 * 60, // 1 minute
  })

export const myPostsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.post.myPosts(),
    queryFn: async (): Promise<Post[]> => {
      return httpClient.get('/api/posts/my-posts')
    },
    staleTime: 1000 * 60, // 1 minute
  })

// ============================================
// Mutation Hooks
// ============================================

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePostInput): Promise<Post> => {
      return httpClient.post('/api/posts', input)
    },
    onSuccess: newPost => {
      // Invalidate posts list
      queryClient.invalidateQueries({
        queryKey: queryKeys.post.all(),
      })

      // Optimistically add to cache
      queryClient.setQueryData(queryKeys.post.detail(newPost.id), newPost)
    },
  })
}

export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdatePostInput): Promise<Post> => {
      return httpClient.patch(`/api/posts/${postId}`, input)
    },
    onMutate: async input => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.post.detail(postId),
      })

      // Snapshot previous value
      const previousPost = queryClient.getQueryData<Post>(queryKeys.post.detail(postId))

      // Optimistically update
      if (previousPost) {
        queryClient.setQueryData(queryKeys.post.detail(postId), { ...previousPost, ...input })
      }

      return { previousPost }
    },
    onError: (err, input, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.post.detail(postId), context.previousPost)
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.post.all(),
      })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string): Promise<void> => {
      return httpClient.delete(`/api/posts/${postId}`)
    },
    onSuccess: (_, postId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.post.detail(postId),
      })

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.post.all(),
      })
    },
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string): Promise<void> => {
      return httpClient.post(`/api/posts/${postId}/like`)
    },
    onSuccess: (_, postId) => {
      // Invalidate post to refetch likes
      queryClient.invalidateQueries({
        queryKey: queryKeys.post.detail(postId),
      })

      queryClient.invalidateQueries({
        queryKey: queryKeys.post.likes(postId),
      })
    },
  })
}
```

### 2.2 Update Query Keys

**Location:** `src/shared/api/query-keys.ts`

```typescript
// Add to existing query keys
export const queryKeys = {
  // ... existing keys

  post: {
    all: () => ['posts'] as const,
    lists: () => [...queryKeys.post.all(), 'list'] as const,
    list: (page: number, pageSize: number) => [...queryKeys.post.lists(), page, pageSize] as const,
    details: () => [...queryKeys.post.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.post.details(), id] as const,
    likes: (id: string) => [...queryKeys.post.detail(id), 'likes'] as const,
    myPosts: () => [...queryKeys.post.all(), 'my-posts'] as const,
  },
}
```

### 2.3 Create UI Components

**Location:** `src/entities/post/ui/post-card.tsx`

```typescript
/**
 * Post Card Component
 *
 * FSD Rule: Entity UI components display entity data.
 */

import { formatDistanceToNow } from 'date-fns'
import { Heart, Edit2, Trash2, User } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/ui/shadcn/card'
import { Button } from '@/shared/ui/shadcn/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar'
import { Badge } from '@/shared/ui/shadcn/badge'
import type { Post } from '../model/types'

interface PostCardProps {
  post: Post
  onLike?: () => void
  onEdit?: () => void
  onDelete?: () => void
  isLiking?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function PostCard({
  post,
  onLike,
  onEdit,
  onDelete,
  isLiking = false,
  canEdit = false,
  canDelete = false,
}: PostCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author?.image} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{post.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                by {post.author?.name || 'Anonymous'} •{' '}
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.published ? (
              <Badge>Published</Badge>
            ) : (
              <Badge variant="outline">Draft</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {post.content}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          disabled={isLiking}
          className="gap-2"
        >
          <Heart
            className={`h-4 w-4 ${
              post.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''
            }`}
          />
          {post.likesCount}
        </Button>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
```

**Location:** `src/entities/post/ui/post-form.tsx`

```typescript
/**
 * Post Form Component
 * Reusable form for creating and editing posts
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/ui/shadcn/button'
import { TextField } from '@/shared/ui/forms'
import { Textarea } from '@/shared/ui/forms/textarea'
import { Checkbox } from '@/shared/ui/forms/checkbox'
import type { CreatePostInput } from '../model/types'
import { createPostSchema } from '../model/validation'

interface PostFormProps {
  defaultValues?: Partial<CreatePostInput>
  onSubmit: (data: CreatePostInput) => void | Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
}

export function PostForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Submit',
}: PostFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        id="title"
        label="Title"
        placeholder="Enter post title..."
        error={errors.title?.message}
        required
        {...register('title')}
      />

      <Textarea
        id="content"
        label="Content"
        placeholder="Write your post content..."
        rows={10}
        error={errors.content?.message}
        required
        {...register('content')}
      />

      <Checkbox
        id="published"
        label="Publish immediately"
        {...register('published')}
      />

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
```

### 2.4 Create Public API

**Location:** `src/entities/post/index.ts`

```typescript
/**
 * Post Entity Public API
 *
 * FSD Rule: Export only what other layers need.
 */

// Types
export type { Post, CreatePostInput, UpdatePostInput, PostLike, PostsResponse } from './model/types'

// Validation
export { createPostSchema, updatePostSchema } from './model/validation'

// API
export {
  postsQueryOptions,
  postQueryOptions,
  myPostsQueryOptions,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useLikePost,
} from './api/queries'

// UI
export { PostCard } from './ui/post-card'
export { PostForm } from './ui/post-form'
```

---

## Step 3: Create Feature - Create Post

### 3.1 Create Feature Model

**Location:** `src/features/create-post/model/use-create-post.ts`

```typescript
/**
 * Create Post Feature Logic
 *
 * FSD Rule: Features orchestrate business logic.
 * Uses Entity API + Event Bus for cross-feature communication.
 */

import { useCreatePost as useCreatePostMutation } from '@/entities/post'
import { eventRegistry, POST_CREATED } from '@/shared/api/events'
import { toast } from '@/shared/lib/toast'
import { logger } from '@/shared/lib/logger'
import type { CreatePostInput, Post } from '@/entities/post'

export function useCreatePost() {
  const createPostMutation = useCreatePostMutation()

  const createPost = async (input: CreatePostInput): Promise<Post> => {
    try {
      const newPost = await createPostMutation.mutateAsync(input)

      // Emit event for other features to react
      eventRegistry.emit(POST_CREATED, {
        postId: newPost.id,
        authorId: newPost.authorId,
        published: newPost.published,
        timestamp: new Date().toISOString(),
      })

      logger.info('Post created:', newPost.id)

      toast.success(
        'Post created!',
        newPost.published ? 'Your post has been published' : 'Your draft has been saved'
      )

      return newPost
    } catch (error) {
      logger.error('Failed to create post:', error)

      toast.error(
        'Failed to create post',
        error instanceof Error ? error.message : 'Please try again'
      )

      throw error
    }
  }

  return {
    createPost,
    isCreating: createPostMutation.isPending,
    error: createPostMutation.error,
  }
}
```

### 3.2 Create Feature UI

**Location:** `src/features/create-post/ui/create-post-modal.tsx`

```typescript
/**
 * Create Post Modal Component
 *
 * FSD Rule: Feature UI orchestrates entity components and business logic.
 * Uses Zustand modal store for state management.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'
import { useModal } from '@/shared/lib/stores'
import { PostForm } from '@/entities/post'
import { useCreatePost } from '../model/use-create-post'
import type { CreatePostInput } from '@/entities/post'

export const CREATE_POST_MODAL_ID = 'create-post'

export function CreatePostModal() {
  const { isOpen, close } = useModal(CREATE_POST_MODAL_ID)
  const { createPost, isCreating } = useCreatePost()

  const handleSubmit = async (data: CreatePostInput) => {
    await createPost(data)
    close() // Close modal on success
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <PostForm
          onSubmit={handleSubmit}
          isSubmitting={isCreating}
          submitLabel="Create Post"
        />
      </DialogContent>
    </Dialog>
  )
}
```

**Location:** `src/features/create-post/ui/create-post-button.tsx`

```typescript
/**
 * Create Post Button - Trigger Component
 */

import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/shadcn/button'
import { useModal } from '@/shared/lib/stores'
import { CREATE_POST_MODAL_ID } from './create-post-modal'

export function CreatePostButton() {
  const { open } = useModal(CREATE_POST_MODAL_ID)

  return (
    <Button onClick={() => open()} className="gap-2">
      <Plus className="h-4 w-4" />
      Create Post
    </Button>
  )
}
```

### 3.3 Create Public API

**Location:** `src/features/create-post/index.ts`

```typescript
/**
 * Create Post Feature Public API
 */

export { useCreatePost } from './model/use-create-post'
export { CreatePostModal, CREATE_POST_MODAL_ID } from './ui/create-post-modal'
export { CreatePostButton } from './ui/create-post-button'
```

---

## Step 4: Create Feature - Edit Post

**Location:** `src/features/edit-post/`

```typescript
// model/use-edit-post.ts
import { useUpdatePost } from '@/entities/post'
import { eventRegistry, POST_UPDATED } from '@/shared/api/events'
import { toast } from '@/shared/lib/toast'
import type { UpdatePostInput } from '@/entities/post'

export function useEditPost(postId: string) {
  const updatePostMutation = useUpdatePost(postId)

  const editPost = async (input: UpdatePostInput) => {
    try {
      const updatedPost = await updatePostMutation.mutateAsync(input)

      eventRegistry.emit(POST_UPDATED, {
        postId: updatedPost.id,
        changes: input,
        timestamp: new Date().toISOString(),
      })

      toast.success('Post updated!', 'Your changes have been saved')

      return updatedPost
    } catch (error) {
      toast.error('Failed to update post', 'Please try again')
      throw error
    }
  }

  return {
    editPost,
    isEditing: updatePostMutation.isPending,
    error: updatePostMutation.error,
  }
}

// ui/edit-post-modal.tsx
export function EditPostModal() {
  const { isOpen, close, data } = useModal<{ postId: string }>('edit-post')
  const postId = data?.postId

  // ... implementation similar to create-post
}

// index.ts
export { useEditPost } from './model/use-edit-post'
export { EditPostModal } from './ui/edit-post-modal'
```

---

## Step 5: Create Feature - Delete Post

**Location:** `src/features/delete-post/`

```typescript
// model/use-delete-post.ts
import { useDeletePost as useDeletePostMutation } from '@/entities/post'
import { eventRegistry, POST_DELETED } from '@/shared/api/events'
import { toast } from '@/shared/lib/toast'

export function useDeletePost() {
  const deletePostMutation = useDeletePostMutation()

  const deletePost = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync(postId)

      eventRegistry.emit(POST_DELETED, {
        postId,
        timestamp: new Date().toISOString(),
      })

      toast.success('Post deleted', 'The post has been removed')
    } catch (error) {
      toast.error('Failed to delete post', 'Please try again')
      throw error
    }
  }

  return {
    deletePost,
    isDeleting: deletePostMutation.isPending,
  }
}

// ui/delete-post-dialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/shadcn/alert-dialog'
import { useModal } from '@/shared/lib/stores'
import { useDeletePost } from '../model/use-delete-post'

export function DeletePostDialog() {
  const { isOpen, close, data } = useModal<{ postId: string; title: string }>('delete-post')
  const { deletePost, isDeleting } = useDeletePost()

  const handleDelete = async () => {
    if (!data?.postId) return

    await deletePost(data.postId)
    close()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={close}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Post?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{data?.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// index.ts
export { useDeletePost } from './model/use-delete-post'
export { DeletePostDialog } from './ui/delete-post-dialog'
```

---

## Step 6: Event Integration

### 6.1 Define Events

**Location:** `src/shared/lib/events/events/post-events.ts`

```typescript
/**
 * Post Events
 * Type-safe events for cross-feature communication
 */

import { BaseEvent } from '../core/event.base'

export class PostCreatedEvent extends BaseEvent {
  constructor(
    public readonly postId: string,
    public readonly authorId: string,
    public readonly published: boolean
  ) {
    super('post:created')
  }
}

export class PostUpdatedEvent extends BaseEvent {
  constructor(
    public readonly postId: string,
    public readonly changes: Record<string, unknown>
  ) {
    super('post:updated')
  }
}

export class PostDeletedEvent extends BaseEvent {
  constructor(public readonly postId: string) {
    super('post:deleted')
  }
}

export class PostLikedEvent extends BaseEvent {
  constructor(
    public readonly postId: string,
    public readonly userId: string
  ) {
    super('post:liked')
  }
}
```

### 6.2 Register Events

**Location:** `src/shared/lib/events/registry.ts`

```typescript
// Add to ApplicationEvents interface
export interface ApplicationEvents {
  // ... existing events

  // Post events
  'post:created': PostCreatedEvent
  'post:updated': PostUpdatedEvent
  'post:deleted': PostDeletedEvent
  'post:liked': PostLikedEvent
}
```

### 6.3 Export Event Constants

**Location:** `src/shared/lib/events/event-key.ts`

```typescript
// Add event constants
export const POST_CREATED = 'post:created' as const
export const POST_UPDATED = 'post:updated' as const
export const POST_DELETED = 'post:deleted' as const
export const POST_LIKED = 'post:liked' as const
```

### 6.4 Create Event Listener Feature

**Location:** `src/features/post-analytics/model/use-post-analytics.ts`

```typescript
/**
 * Post Analytics Feature
 * Example: Listen to post events and track analytics
 */

import { useEffect } from 'react'
import {
  eventRegistry,
  POST_CREATED,
  POST_LIKED,
  type PostCreatedEvent,
  type PostLikedEvent,
} from '@/shared/api/events'
import { logger } from '@/shared/lib/logger'

export function usePostAnalytics() {
  useEffect(() => {
    const handlePostCreated = (event: PostCreatedEvent) => {
      logger.info('Analytics: Post created', {
        postId: event.postId,
        published: event.published,
      })

      // Send to analytics service
      // trackEvent('post_created', { postId: event.postId })
    }

    const handlePostLiked = (event: PostLikedEvent) => {
      logger.info('Analytics: Post liked', {
        postId: event.postId,
        userId: event.userId,
      })

      // Send to analytics service
      // trackEvent('post_liked', { postId: event.postId })
    }

    // Subscribe
    eventRegistry.on(POST_CREATED, handlePostCreated)
    eventRegistry.on(POST_LIKED, handlePostLiked)

    // Cleanup
    return () => {
      eventRegistry.off(POST_CREATED, handlePostCreated)
      eventRegistry.off(POST_LIKED, handlePostLiked)
    }
  }, [])
}
```

---

## Step 7: Add Permissions

### 7.1 Define Permissions

**Location:** `src/shared/lib/permissions.ts`

```typescript
// Add to existing permissions
export const PERMISSIONS = {
  // ... existing permissions

  // Post permissions
  'create:post': ['admin', 'moderator', 'user'],
  'edit:own-post': ['admin', 'moderator', 'user'],
  'edit:any-post': ['admin', 'moderator'],
  'delete:own-post': ['admin', 'moderator', 'user'],
  'delete:any-post': ['admin', 'moderator'],
  'publish:post': ['admin', 'moderator', 'user'],
  'view:draft-posts': ['admin', 'moderator'],
} as const
```

### 7.2 Use Permissions in Components

```typescript
import { usePermission, useRole } from '@/shared/lib/hooks/use-permission'
import { useSession } from '@/entities/session'

function PostCard({ post }: { post: Post }) {
  const { data: session } = useSession()
  const canEditOwn = usePermission('edit:own-post')
  const canEditAny = usePermission('edit:any-post')
  const canDeleteOwn = usePermission('delete:own-post')
  const canDeleteAny = usePermission('delete:any-post')

  const isAuthor = session?.user?.id === post.authorId
  const canEdit = isAuthor ? canEditOwn : canEditAny
  const canDelete = isAuthor ? canDeleteOwn : canDeleteAny

  return (
    <PostCard
      post={post}
      canEdit={canEdit}
      canDelete={canDelete}
      onEdit={() => {/* ... */}}
      onDelete={() => {/* ... */}}
    />
  )
}
```

---

## Step 8: Create Page

**Location:** `src/pages/blog/index.tsx`

```typescript
/**
 * Blog Page
 *
 * FSD Rule: Pages compose features and entities.
 */

import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { postsQueryOptions, PostCard, useLikePost } from '@/entities/post'
import { CreatePostButton, CreatePostModal } from '@/features/create-post'
import { EditPostModal } from '@/features/edit-post'
import { DeletePostDialog } from '@/features/delete-post'
import { useModal } from '@/shared/lib/stores'
import { usePermission } from '@/shared/lib/hooks/use-permission'
import { Button } from '@/shared/ui/shadcn/button'
import { Spinner } from '@/shared/ui/spinner'

export function BlogPage() {
  const canCreatePost = usePermission('create:post')
  const { data, isLoading, error } = useQuery(postsQueryOptions(1, 10))
  const { mutate: likePost, isPending: isLiking } = useLikePost()
  const { open: openEdit } = useModal('edit-post')
  const { open: openDelete } = useModal('delete-post')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="text-muted-foreground">
            Share your thoughts with the community
          </p>
        </div>

        {canCreatePost && <CreatePostButton />}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6">
        {data?.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => likePost(post.id)}
            onEdit={() => openEdit({ postId: post.id })}
            onDelete={() => openDelete({ postId: post.id, title: post.title })}
            isLiking={isLiking}
          />
        ))}
      </div>

      {/* Modals */}
      <CreatePostModal />
      <EditPostModal />
      <DeletePostDialog />
    </div>
  )
}
```

---

## Step 9: Add Route

**Location:** `src/routes/blog.tsx`

```typescript
/**
 * Blog Route
 * TanStack Router file-based routing
 */

import { createFileRoute } from '@tanstack/react-router'
import { postsQueryOptions } from '@/entities/post'
import { BlogPage } from '@/pages/blog'

export const Route = createFileRoute('/blog')({
  component: BlogPage,

  // Preload data before rendering
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(postsQueryOptions(1, 10))
  },

  // Optional: Add route protection
  beforeLoad: async ({ context }) => {
    const session = await context.authClient.getSession()

    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/blog',
        },
      })
    }
  },
})
```

---

## Step 10: Testing

### 10.1 Unit Tests - Entity

**Location:** `src/entities/post/api/queries.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreatePost } from './queries'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

describe('useCreatePost', () => {
  it('creates a post successfully', async () => {
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useCreatePost(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

    const input = {
      title: 'Test Post',
      content: 'Test content',
      published: true,
    }

    await waitFor(() => {
      result.current.mutate(input)
    })

    expect(result.current.isSuccess).toBe(true)
  })
})
```

### 10.2 Component Tests

**Location:** `src/entities/post/ui/post-card.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostCard } from './post-card'

const mockPost = {
  id: '1',
  title: 'Test Post',
  content: 'Test content',
  authorId: '1',
  author: { id: '1', name: 'Test User', email: 'test@example.com' },
  published: true,
  likesCount: 5,
  isLikedByCurrentUser: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('PostCard', () => {
  it('renders post information', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
    expect(screen.getByText(/Test User/)).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('calls onLike when like button is clicked', async () => {
    const user = userEvent.setup()
    const onLike = vi.fn()

    render(<PostCard post={mockPost} onLike={onLike} />)

    await user.click(screen.getByRole('button', { name: /5/i }))

    expect(onLike).toHaveBeenCalledTimes(1)
  })

  it('shows edit button when canEdit is true', () => {
    render(<PostCard post={mockPost} canEdit={true} />)

    expect(screen.getByText('Edit')).toBeInTheDocument()
  })
})
```

### 10.3 E2E Tests

**Location:** `e2e/blog.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Blog Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create a new post', async ({ page }) => {
    await page.goto('/blog')

    // Click create post button
    await page.click('text=Create Post')

    // Fill form
    await page.fill('input[name="title"]', 'My Test Post')
    await page.fill('textarea[name="content"]', 'This is test content')
    await page.check('input[name="published"]')

    // Submit
    await page.click('button[type="submit"]')

    // Verify post appears
    await expect(page.locator('text=My Test Post')).toBeVisible()
  })

  test('should like a post', async ({ page }) => {
    await page.goto('/blog')

    // Click like button on first post
    const likeButton = page.locator('button:has-text("0")').first()
    await likeButton.click()

    // Verify like count increased
    await expect(page.locator('button:has-text("1")')).toBeVisible()
  })

  test('should edit own post', async ({ page }) => {
    await page.goto('/blog')

    // Click edit on first post
    await page.click('text=Edit').first()

    // Update title
    await page.fill('input[name="title"]', 'Updated Title')
    await page.click('button:has-text("Save")')

    // Verify updated
    await expect(page.locator('text=Updated Title')).toBeVisible()
  })
})
```

---

## Best Practices Checklist

### ✅ FSD Architecture

- [ ] **Layer Boundaries**: No upward dependencies (shared → entities → features → pages → app)
- [ ] **Public API**: Each slice has `index.ts` exporting public API
- [ ] **Slice Structure**: Proper `/api/`, `/model/`, `/ui/` organization
- [ ] **Feature Isolation**: Features don't import from each other directly

### ✅ State Management

- [ ] **Server State**: Use TanStack Query for API data
- [ ] **Client State**: Use Zustand for global UI state
- [ ] **Events**: Use Event Bus for cross-feature communication
- [ ] **Local State**: Use useState for component-specific state

### ✅ API Integration

- [ ] **HTTP Client**: Use centralized `httpClient` from shared
- [ ] **Query Keys**: Add to `queryKeys` factory
- [ ] **Query Options**: Create reusable `queryOptions` for preloading
- [ ] **Optimistic Updates**: Implement where appropriate
- [ ] **Error Handling**: Proper error messages and toast notifications

### ✅ UI Components

- [ ] **Shadcn UI**: Use existing components when possible
- [ ] **Custom Components**: Only create when needed
- [ ] **Accessibility**: Proper labels, ARIA attributes, keyboard navigation
- [ ] **Responsive**: Mobile-first design with Tailwind
- [ ] **Loading States**: Show spinners during async operations
- [ ] **Error States**: Display error messages clearly

### ✅ Forms

- [ ] **React Hook Form**: Use for form state management
- [ ] **Zod Validation**: Create schemas in entity model layer
- [ ] **Error Display**: Show validation errors inline
- [ ] **Submit States**: Disable during submission

### ✅ Permissions

- [ ] **Permission Checks**: Use `usePermission` hook
- [ ] **Conditional Rendering**: Hide/show based on permissions
- [ ] **Server Validation**: Always validate on backend too

### ✅ Events

- [ ] **Type-Safe Events**: Define in `shared/lib/events/events/`
- [ ] **Event Registry**: Register in ApplicationEvents interface
- [ ] **Cleanup**: Always unsubscribe in useEffect return
- [ ] **Logging**: Log important events for debugging

### ✅ Testing

- [ ] **Unit Tests**: Test hooks and utilities
- [ ] **Component Tests**: Test UI components in isolation
- [ ] **Integration Tests**: Test feature workflows
- [ ] **E2E Tests**: Test critical user journeys

### ✅ TypeScript

- [ ] **Strict Types**: No `any` types
- [ ] **Interfaces**: Define for all data structures
- [ ] **Generics**: Use for reusable components
- [ ] **Type Exports**: Export types from entity public API

### ✅ Documentation

- [ ] **JSDoc Comments**: Document complex functions
- [ ] **README**: Update if adding major features
- [ ] **Examples**: Provide usage examples in comments

---

## Summary

You've now learned how to implement a complete feature using all the utilities in this project:

✅ **Feature-Sliced Design** - Proper layer organization  
✅ **TanStack Query** - Server state management  
✅ **Zustand** - Client state management  
✅ **Event Bus** - Cross-feature communication  
✅ **Shadcn UI** - Component library  
✅ **React Hook Form + Zod** - Form handling  
✅ **Permissions** - RBAC implementation  
✅ **Testing** - Unit, component, and E2E tests  
✅ **TypeScript** - Type safety throughout

**Next Steps:**

1. Implement the blog feature following this guide
2. Create your own features using the same patterns
3. Refer to specific documentation for deep dives
4. Maintain the architectural standards

---

**For more details on specific topics, see:**

- [Architectural Strictness Analysis](./architectural-strictness-analysis.md)
- [State Management Patterns](./state-management-patterns.md)
- [API Contracts](./api-contracts.md)
- [UI Component Inventory](./ui-component-inventory.md)
- [Data Models](./data-models.md)

---

**Last Updated:** 2025-12-31
