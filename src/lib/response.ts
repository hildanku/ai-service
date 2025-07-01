import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export const appResponse = <T>(c: Context, message: string, status: ContentfulStatusCode, results: T) =>
	c.json({ message, results }, status)
