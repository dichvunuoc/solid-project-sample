import { Link } from '@tanstack/solid-router'

export function HomePage() {
  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div class="container mx-auto px-4 py-16">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Frontend Template
        </h1>
        <p class="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Vite + Solid SPA with TanStack Router/Query, Kobalte UI, and Feature-Sliced Design.
        </p>
        <div class="flex flex-wrap gap-4">
          <Link
            to="/login"
            class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
