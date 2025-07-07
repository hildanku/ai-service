import { GoogleGenAI } from '@google/genai'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Buffer } from 'buffer'
import sharp from 'sharp'
import { appResponse } from './lib/response.js'

const ai = new GoogleGenAI({
  apiKey: ''
})

const app = new Hono()

app.get('/api/healthcheck', (c) => {
  return c.text('API is running!')
})

app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as FormDataEntryValue

    if (!file || !(file instanceof File)) {
      return appResponse(c, 'No file uploaded or invalid file format', 400, null)
    }

    const originalBuffer = await file.arrayBuffer()
    const sharpInput = sharp(Buffer.from(originalBuffer))

    const processedBuffer = await sharpInput
      .resize(512, 512, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer()

    const metadata = await sharp(processedBuffer).metadata()
    const { dominant } = await sharp(processedBuffer).stats()

    const brightness = dominant
      ? (dominant.r + dominant.g + dominant.b) / 3
      : 0

    if (brightness < 30) {
      return appResponse(
        c,
        'Gambar terlalu gelap. Harap unggah gambar yang lebih terang.',
        400,
        null
      )
    }

    const grayscaleBuffer = await sharp(processedBuffer)
      .grayscale()
      .jpeg({ quality: 80 })
      .toBuffer()
    const grayscaleBase64 = grayscaleBuffer.toString('base64')

    const base64String = processedBuffer.toString('base64')

    const promptConfig = [
      {
        text: "Identify the type of building material in this image and describe it in no more than 3 words. Please answer in Bahasa Indonesia."
      },
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

    const aiDescriptionRaw = result.text?.trim().toLowerCase() || 'unknown'
    const aiDescription = aiDescriptionRaw.replace(/[\n\r]/g, '')

    return appResponse(c, 'Image processed successfully!', 200, {
      description: aiDescription,
      metadata: {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
      },
      // grayscalePreviewBase64: grayscaleBase64
    })

  } catch (error) {
    console.error('Error processing image:', error)
    return appResponse(c, 'Failed to process image', 500, null)
  }
})

serve(
  { fetch: app.fetch, port: 3008 },
  (info) => console.log(`Server is running on http://localhost:${info.port}`)
)
