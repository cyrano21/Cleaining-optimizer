import { NextRequest } from 'next/server'
import { GET } from '@/app/api/public/stores/active/route'

// Mock MongoDB connection
jest.mock('@/lib/dbConnect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({})
}))

// Mock Store model
jest.mock('@/models/Store', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    countDocuments: jest.fn()
  }
}))

import Store from '@/models/Store'

describe('/api/public/stores/active API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return active stores successfully', async () => {
    const mockStores = [
      {
        _id: '1',
        name: 'Test Store 1',
        slug: 'test-store-1',
        isActive: true,
        subscription: { plan: 'BASIC' }
      },
      {
        _id: '2',
        name: 'Test Store 2',
        slug: 'test-store-2',
        isActive: true,
        subscription: { plan: 'PREMIUM' }
      }
    ]

    ;(Store.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockResolvedValue(mockStores)
          })
        })
      })
    })
    ;(Store.countDocuments as jest.Mock).mockResolvedValue(2)

    const request = new NextRequest('http://localhost:3000/api/public/stores/active')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.stores).toHaveLength(2)
    expect(data.stores[0].name).toBe('Test Store 1')
    expect(data.pagination.total).toBe(2)
  })

  it('should handle pagination correctly', async () => {
    const mockStores = [{ _id: '1', name: 'Store 1', slug: 'store-1' }]
    
    ;(Store.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockResolvedValue(mockStores)
          })
        })
      })
    })
    ;(Store.countDocuments as jest.Mock).mockResolvedValue(25)

    const request = new NextRequest('http://localhost:3000/api/public/stores/active?page=2&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.pagination.page).toBe(2)
    expect(data.pagination.limit).toBe(10)
    expect(data.pagination.total).toBe(25)
    expect(data.pagination.totalPages).toBe(3)
  })

  it('should handle database errors', async () => {
    ;(Store.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      })
    })

    const request = new NextRequest('http://localhost:3000/api/public/stores/active')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Erreur lors de la récupération des stores')
  })

  it('should filter by search query', async () => {
    const mockStores = [{ _id: '1', name: 'Electronics Store', slug: 'electronics-store' }]
    
    ;(Store.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            skip: jest.fn().mockResolvedValue(mockStores)
          })
        })
      })
    })
    ;(Store.countDocuments as jest.Mock).mockResolvedValue(1)

    const request = new NextRequest('http://localhost:3000/api/public/stores/active?search=electronics')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Store.find).toHaveBeenCalledWith({
      isActive: true,
      $or: [
        { name: { $regex: 'electronics', $options: 'i' } },
        { description: { $regex: 'electronics', $options: 'i' } }
      ]
    })
  })
})