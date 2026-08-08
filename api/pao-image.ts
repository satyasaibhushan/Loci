import { UTApi, UTFile } from 'uploadthing/server'
import { requireFirebaseUser } from '../server/firebaseAuth.js'
import { hasStorageCapacity, isOwnedPaoImageCustomId, isPaoCode, MAX_STORED_IMAGE_BYTES, paoImageCustomId } from '../server/paoImageLimits.js'

export type PaoImageStore = Pick<UTApi, 'deleteFiles' | 'getUsageInfo' | 'uploadFiles'>

function json(body: object, status = 200): Response {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } })
}

function getUploadThing(): UTApi {
  const token = process.env.UPLOADTHING_TOKEN
  if (!token) throw new Error('UploadThing is not configured.')
  return new UTApi({ token })
}

export async function handlePaoImagePost(request: Request, uid: string, utapi: PaoImageStore): Promise<Response> {
  const form = await request.formData()
  const code = form.get('code')
  const image = form.get('image')
  const previousCustomId = form.get('previousCustomId')
  if (typeof code !== 'string' || !isPaoCode(code)) return json({ error: 'Choose a valid PAO number.' }, 400)
  if (!(image instanceof File) || image.type !== 'image/webp') return json({ error: 'Only prepared WebP images are accepted.' }, 400)
  if (image.size > MAX_STORED_IMAGE_BYTES) return json({ error: 'The prepared image exceeds the 384 KB storage limit.' }, 413)
  if (previousCustomId !== null && (typeof previousCustomId !== 'string' || !isOwnedPaoImageCustomId(previousCustomId, uid, code))) {
    return json({ error: 'The previous image does not belong to this PAO number.' }, 400)
  }

  const usage = await utapi.getUsageInfo()
  if (!hasStorageCapacity(usage.totalBytes, image.size, usage.limitBytes)) {
    return json({ error: 'The image reserve is full. Remove an existing image before uploading another.' }, 507)
  }

  const legacyCustomId = paoImageCustomId(uid, code)
  const customId = paoImageCustomId(uid, code, crypto.randomUUID())
  const file = new UTFile([await image.arrayBuffer()], `pao-${code}.webp`, { type: 'image/webp', customId })
  const uploaded = await utapi.uploadFiles(file)
  if (uploaded.error) return json({ error: uploaded.error.message }, 502)

  const staleCustomId = previousCustomId ?? legacyCustomId
  let cleanupPending = false
  try {
    await utapi.deleteFiles(staleCustomId, { keyType: 'customId' })
  } catch {
    cleanupPending = true
  }
  return json({ imageUrl: uploaded.data.ufsUrl, imageCustomId: customId, cleanupPending })
}

export async function handlePaoImageDelete(request: Request, uid: string, utapi: PaoImageStore): Promise<Response> {
  const parameters = new URL(request.url).searchParams
  const code = parameters.get('code') ?? ''
  const customId = parameters.get('customId')
  if (!isPaoCode(code)) return json({ error: 'Choose a valid PAO number.' }, 400)
  if (customId && !isOwnedPaoImageCustomId(customId, uid, code)) {
    return json({ error: 'The image does not belong to this PAO number.' }, 400)
  }
  await utapi.deleteFiles(customId ?? paoImageCustomId(uid, code), { keyType: 'customId' })
  return json({ success: true })
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST' && request.method !== 'DELETE') return json({ error: 'Method not allowed.' }, 405)
    try {
      const { uid } = await requireFirebaseUser(request)
      const utapi = getUploadThing()
      return request.method === 'POST' ? await handlePaoImagePost(request, uid, utapi) : await handlePaoImageDelete(request, uid, utapi)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Image service unavailable.'
      const status = message === 'Authentication required.' || message === 'Invalid authentication token.' ? 401 : 503
      return json({ error: message }, status)
    }
  },
}
