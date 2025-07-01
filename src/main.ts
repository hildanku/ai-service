import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/api/healthcheck', (c) => {
    return c.text('API is running!')
})

app.post('/api/upload', async (c) => {
    const body = await c.req.parseBody()
    const data = body['file']
    return c.json({
        message: 'File received successfully!',
        fileName: data.name,
        fileSize: data.size,
        fileType: data.type
    })
})

serve({
    fetch: app.fetch,
    port: 3008
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})
