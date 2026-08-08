import { decodeProtectedHeader, importX509, jwtVerify } from 'jose'

const FIREBASE_CERTIFICATES_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'

interface CertificateCache {
  certificates: Record<string, string>
  expiresAt: number
}

let certificateCache: CertificateCache | undefined

export function bearerToken(authorization: string | null): string | undefined {
  if (!authorization) return undefined
  const [scheme, token] = authorization.split(' ')
  return scheme?.toLowerCase() === 'bearer' && token ? token : undefined
}

async function getCertificate(keyId: string): Promise<string | undefined> {
  if (!certificateCache || certificateCache.expiresAt <= Date.now()) {
    const response = await fetch(FIREBASE_CERTIFICATES_URL)
    if (!response.ok) throw new Error('Could not load Firebase signing certificates.')
    const cacheControl = response.headers.get('cache-control') ?? ''
    const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] ?? 300)
    certificateCache = {
      certificates: await response.json() as Record<string, string>,
      expiresAt: Date.now() + maxAge * 1000,
    }
  }
  return certificateCache.certificates[keyId]
}

export async function requireFirebaseUser(request: Request): Promise<{ uid: string }> {
  const token = bearerToken(request.headers.get('authorization'))
  if (!token) throw new Error('Authentication required.')

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID
  if (!projectId) throw new Error('Firebase project configuration is missing.')

  const header = decodeProtectedHeader(token)
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Invalid authentication token.')
  const certificate = await getCertificate(header.kid)
  if (!certificate) throw new Error('Invalid authentication token.')

  const publicKey = await importX509(certificate, 'RS256')
  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ['RS256'],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  })
  const now = Math.floor(Date.now() / 1000)
  if (!payload.sub || typeof payload.auth_time !== 'number' || payload.auth_time > now) {
    throw new Error('Invalid authentication token.')
  }
  return { uid: payload.sub }
}
