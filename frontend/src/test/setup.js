import { cleanup } from '@solidjs/testing-library'
import { afterEach, vi } from 'vitest'

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
})

afterEach(() => {
  cleanup()
})
