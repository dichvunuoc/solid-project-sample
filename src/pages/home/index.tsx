export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to TanStack Start
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Built with Feature-Sliced Design architecture
        </p>
        <div className="flex gap-4">
          <a
            href="/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

