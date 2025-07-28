import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

// Middleware
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`)
  await next()
})

// Routes
app.get('/', (c) => {
  return c.json({
    message: 'Hello from Hono!',
    timestamp: new Date().toISOString()
  })
})

app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

app.get('/api/users', (c) => {
  return c.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]
  })
})

app.post('/api/users', async (c) => {
  const body = await c.req.json()
  return c.json({
    message: 'User created successfully',
    user: {
      id: Date.now(),
      ...body
    }
  }, 201)
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

const port = process.env.PORT || 3000

console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})