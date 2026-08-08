import { describe, expect, it } from 'vitest'
import paoImageApi from '../../api/pao-image'

describe('PAO image API boundary', () => {
  it('rejects unsupported methods before doing any work', async () => {
    const response = await paoImageApi.fetch(new Request('https://loci.test/api/pao-image'))
    expect(response.status).toBe(405)
  })

  it('requires a signed-in Firebase user', async () => {
    const response = await paoImageApi.fetch(new Request('https://loci.test/api/pao-image', { method: 'DELETE' }))
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Authentication required.' })
  })
})
