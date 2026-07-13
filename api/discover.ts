import {
  createDiscoverInvalidJsonResponse,
  handleDiscoverRequest,
} from '../server/discoverApi.js'

const createJsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
    status,
  })

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return createJsonResponse(
        {
          error: {
            code: 'METHOD_NOT_ALLOWED',
            hint: 'Use POST /api/discover.',
            message: 'Only POST is supported on this endpoint.',
          },
        },
        405,
      )
    }

    let requestBody: unknown
    try {
      requestBody = await request.json()
    } catch {
      const result = createDiscoverInvalidJsonResponse()
      return createJsonResponse(result.body, result.status)
    }

    const result = await handleDiscoverRequest(requestBody)
    return createJsonResponse(result.body, result.status)
  },
}
