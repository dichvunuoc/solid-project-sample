import path from 'path'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    server: { port: 3000, strictPort: true },
    preview: { port: 3000, strictPort: true },
    plugins: [
      tanstackRouter({
        target: 'solid',
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
        autoCodeSplitting: true,
      }),
      solid(),
      isProduction &&
        visualizer({
          open: false,
          gzipSize: true,
          brotliSize: true,
          filename: 'dist/stats.html',
          template: 'treemap',
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/app': path.resolve(__dirname, './src/app'),
        '@/pages': path.resolve(__dirname, './src/pages'),
        '@/widgets': path.resolve(__dirname, './src/widgets'),
        '@/features': path.resolve(__dirname, './src/features'),
        '@/entities': path.resolve(__dirname, './src/entities'),
        '@/shared': path.resolve(__dirname, './src/shared'),
        // Strip mock auth from production builds
        ...(isProduction
          ? {
              './shared/lib/mock-auth': path.resolve(
                __dirname,
                './src/shared/lib/mock-auth.prod-stub.ts',
              ),
            }
          : {}),
      },
    },
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            'solid-core': ['solid-js', 'solid-js/web', 'solid-js/store'],
            router: ['@tanstack/solid-router'],
            query: ['@tanstack/solid-query'],
            'ui-kobalte': ['@kobalte/core'],
            forms: ['@modular-forms/solid', 'zod'],
            auth: ['keycloak-js'],
          },
        },
      },
    },
  }
})
