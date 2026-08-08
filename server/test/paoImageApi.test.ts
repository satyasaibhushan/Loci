import { describe, expect, it } from 'vitest'
import paoImageApi, { handlePaoImageDelete, handlePaoImagePost, type PaoImageStore } from '../../api/pao-image'

function uploadRequest(previousCustomId = 'loci-user-123-91-old'): Request {
  const form = new FormData()
  form.set('code', '91')
  form.set('previousCustomId', previousCustomId)
  form.set('image', new File(['prepared-image'], 'pao-91.webp', { type: 'image/webp' }))
  return new Request('https://loci.test/api/pao-image', { method: 'POST', body: form })
}

function successfulStore(calls: string[]): PaoImageStore {
  return {
    getUsageInfo: async () => ({ totalBytes: 1_000, appTotalBytes: 1_000, filesUploaded: 1, limitBytes: 2_000_000 }),
    uploadFiles: async (file: { customId?: string }) => {
      calls.push(`upload:${file.customId}`)
      return {
        data: {
          key: 'new-file-key', url: 'https://ufs.example/new', appUrl: 'https://ufs.example/new', ufsUrl: 'https://ufs.example/new',
          lastModified: Date.now(), name: 'pao-91.webp', size: 14, type: 'image/webp', customId: file.customId ?? null, fileHash: 'hash',
        },
        error: null,
      }
    },
    deleteFiles: async (keys: string | string[]) => {
      calls.push(`delete:${Array.isArray(keys) ? keys.join(',') : keys}`)
      return { success: true, deletedCount: 1 }
    },
  } as unknown as PaoImageStore
}

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

  it('uploads with a fresh identity before deleting the previous image', async () => {
    const calls: string[] = []
    const response = await handlePaoImagePost(uploadRequest(), 'user-123', successfulStore(calls))
    const result = await response.json() as { imageCustomId: string; imageUrl: string }

    expect(response.status).toBe(200)
    expect(result.imageCustomId).toMatch(/^loci-user-123-91-/)
    expect(result.imageCustomId).not.toBe('loci-user-123-91-old')
    expect(result.imageUrl).toBe('https://ufs.example/new')
    expect(calls).toEqual([`upload:${result.imageCustomId}`, 'delete:loci-user-123-91-old'])
  })

  it('keeps the previous image when the replacement upload fails', async () => {
    const calls: string[] = []
    const store = successfulStore(calls)
    store.uploadFiles = (async () => ({
      data: null,
      error: { code: 'UPLOAD_FAILED', message: 'Failed to upload file', data: undefined },
    })) as unknown as PaoImageStore['uploadFiles']

    const response = await handlePaoImagePost(uploadRequest(), 'user-123', store)

    expect(response.status).toBe(502)
    expect(calls).toEqual([])
  })

  it('deletes the exact current image identity', async () => {
    const calls: string[] = []
    const request = new Request('https://loci.test/api/pao-image?code=91&customId=loci-user-123-91-current', { method: 'DELETE' })

    const response = await handlePaoImageDelete(request, 'user-123', successfulStore(calls))

    expect(response.status).toBe(200)
    expect(calls).toEqual(['delete:loci-user-123-91-current'])
  })

  it('still deletes legacy images that have no saved identity', async () => {
    const calls: string[] = []
    const request = new Request('https://loci.test/api/pao-image?code=91', { method: 'DELETE' })

    const response = await handlePaoImageDelete(request, 'user-123', successfulStore(calls))

    expect(response.status).toBe(200)
    expect(calls).toEqual(['delete:loci-user-123-91'])
  })

  it('rejects an image identity owned by another user', async () => {
    const calls: string[] = []
    const request = new Request('https://loci.test/api/pao-image?code=91&customId=loci-other-user-91-current', { method: 'DELETE' })

    const response = await handlePaoImageDelete(request, 'user-123', successfulStore(calls))

    expect(response.status).toBe(400)
    expect(calls).toEqual([])
  })
})
