import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    include: ['src/__tests__/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}']
  }
})
