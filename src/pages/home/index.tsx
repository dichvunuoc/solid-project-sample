import { Link } from '@tanstack/solid-router'

export function HomePage() {
  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="container mx-auto px-4 py-16">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Risk Opportunity Assessment</h1>
        <p class="text-lg text-gray-700 mb-8">
          Vite + Solid SPA with TanStack Solid Router/Query, Kobalte UI, và Feature-Sliced Design.
        </p>
        <div class="flex flex-wrap gap-4">
          <Link
            to="/risk-dashboard"
            class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Risk Dashboard
          </Link>
          <Link
            to="/risk/new"
            class="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Đánh giá cơ hội mới
          </Link>
          <Link
            to="/login"
            class="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Login
          </Link>
          <Link
            to="/dashboard"
            class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Legacy Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
