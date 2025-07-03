import { GoogleGenAI, Models } from '@google/genai'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Buffer } from 'buffer'
import { appResponse } from './lib/response.js'

const ai = new GoogleGenAI({ apiKey: '' })

const app = new Hono()

app.get('/api/healthcheck', (c) => {
    return c.text('API is running!')
})

app.post('/api/upload', async (c) => {
    try {
        const formData = await c.req.formData()
        const file = formData.get('file') as FormDataEntryValue

        if (!file || !(file instanceof File)) {
            // return c.json({ error: 'No file uploaded or invalid file format' }, 400)
            return appResponse(c, 'No file uploaded or invalid file format', 400, null)
        }
        const buffer = await file.arrayBuffer()
        const base64String = Buffer.from(buffer).toString('base64')

        const promptConfig = [
            { text: "Identify the type of building material in this image and describe it in no more than 3 words. Please answer in Bahasa Indonesia." },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64String,
                },
            },
        ]

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptConfig,
        })

        const aiDescription = result.text

        return appResponse(c, 'Image processed successfully!', 200, { description: aiDescription })

    } catch (error) {
        console.error('Error processing image:', error)
        return appResponse(c, 'Failed to process image', 500, null)
    }
})

serve({
    fetch: app.fetch,
    port: 3008
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})
