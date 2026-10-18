// Thin wrapper around the Luraph API (https://lura.ph) — used to protect published
// scripts. Requires a Luraph plan with API access and a LURAPH_API_KEY env var.
// Docs: https://lura.ph/dashboard/documents/apidoc

const BASE = 'https://api.lura.ph/v1/'

export class LuraphError extends Error {}

async function call<T>(path: string, apiKey: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'Luraph-API-Key': apiKey, 'Content-Type': 'application/json', ...(init?.headers as Record<string, string> | undefined) },
  })
  let data: any = null
  try { data = await res.json() } catch { /* no body */ }
  if (!res.ok) {
    const msg = data?.errors?.map((e: any) => e.message).filter(Boolean).join(', ') || data?.error || `Luraph API error (${res.status})`
    throw new LuraphError(msg)
  }
  return data as T
}

export async function getRecommendedNode(apiKey: string) {
  const data = await call<{ recommendedId: string | null; nodes: Record<string, unknown> }>('obfuscate/nodes', apiKey)
  const id = data.recommendedId || Object.keys(data.nodes)[0]
  if (!id) throw new LuraphError('No Luraph node is available right now.')
  return id
}

export async function queueJob(apiKey: string, node: string, source: string, fileName: string) {
  const data = await call<{ jobId: string }>('obfuscate/new', apiKey, {
    method: 'POST',
    // enforceSettings: false so we don't have to mirror every option Luraph's nodes expose.
    body: JSON.stringify({ node, script: Buffer.from(source, 'utf8').toString('base64'), fileName, options: {}, enforceSettings: false }),
  })
  return data.jobId
}

// getJobStatus long-polls on Luraph's side and does not return until the job is
// done (up to ~60s per call). It can be called a maximum of 3 times per job.
export async function waitForJob(apiKey: string, jobId: string, attempts = 3) {
  let last: { success: boolean; error: string | null } | null = null
  for (let i = 0; i < attempts; i++) {
    last = await call<{ success: boolean; error: string | null }>(`obfuscate/status/${jobId}`, apiKey)
    if (last.success || last.error) return last
  }
  return last ?? { success: false, error: 'Timed out waiting for the obfuscation job.' }
}

export async function downloadJob(apiKey: string, jobId: string) {
  const data = await call<{ fileName: string; data: string }>(`obfuscate/download/${jobId}`, apiKey)
  return data.data
}