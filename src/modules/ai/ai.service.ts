import { GenAI } from '@google/genai'
import * as dotenv from 'dotenv'

dotenv.config()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '' // API key untuk Gemini

const genAI = new GenAI({ apiKey: GEMINI_API_KEY })

export class AiService {
    static async classifyImage(image: Buffer): Promise<any> {
        try {
            const response = await genAI.classifyImage(image)
            return response.data
        } catch (error) {
            console.error('Error classifying image:', error)
            throw new Error('Failed to classify image')
        }
    }
}
