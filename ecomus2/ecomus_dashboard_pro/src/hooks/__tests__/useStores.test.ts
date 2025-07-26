import { renderHook, act, waitFor } from '@testing-library/react'
import { useStores } from '@/hooks/useStores'

// Mock fetch
global.fetch = jest.fn()

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('useStores Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful response by default
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ stores: [] })
    })
  })

  it('should initialize with loading state', async () => {
    const { result } = renderHook(() => useStores())
    
    expect(result.current.stores).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(null)
    
    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should fetch stores successfully', async () => {
    const mockStores = [
      { id: '1', name: 'Store 1', slug: 'store-1', isActive: true },
      { id: '2', name: 'Store 2', slug: 'store-2', isActive: true }
    ]

    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ stores: mockStores })
    })

    const { result } = renderHook(() => useStores())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stores).toEqual(mockStores)
    expect(result.current.error).toBe(null)
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch stores'
    ;(fetch as jest.Mock).mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useStores())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stores).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })

  it('should set loading state during fetch', async () => {
    let resolvePromise: (value: any) => void
    const fetchPromise = new Promise(resolve => {
      resolvePromise = resolve
    })
    
    ;(fetch as jest.Mock).mockReturnValue(fetchPromise)

    const { result } = renderHook(() => useStores())

    // Initially loading should be true
    expect(result.current.loading).toBe(true)
    
    // Resolve the promise
    act(() => {
      resolvePromise({ ok: true, json: async () => ({ stores: [] }) })
    })
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should refetch stores when fetchStores is called', async () => {
    const mockStores = [
      { id: '1', name: 'Store 1', slug: 'store-1', isActive: true }
    ]

    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ stores: mockStores })
    })

    const { result } = renderHook(() => useStores())

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Call fetchStores manually
    await act(async () => {
      await result.current.fetchStores()
    })

    expect(result.current.stores).toEqual(mockStores)
    expect(result.current.error).toBe(null)
  })
})