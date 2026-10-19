// Pulls executor/exploit status from WEAO (https://weao.xyz) for the /exe page.
// Docs: https://docs.weao.xyz — requires the "WEAO-3PService" user-agent.

export type Exploit = {
  _id: string
  title: string
  version?: string
  updatedDate?: string
  uncStatus?: boolean
  free?: boolean
  detected?: boolean
  updateStatus?: boolean
  websitelink?: string
  discordlink?: string
  purchaselink?: string
  platform?: string
  type?: string
  cost?: string
  suncPercentage?: number
  uncPercentage?: number
  hidden?: boolean
  index?: number
}

export async function getExploits(): Promise<Exploit[]> {
  const res = await fetch('https://weao.xyz/api/status/exploits', {
    headers: { 'User-Agent': 'WEAO-3PService' },
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`WEAO API error (${res.status})`)
  const data = await res.json()
  const list: Exploit[] = Array.isArray(data) ? data : (data.exploits ?? [])
  return list
    .filter(e => !e.hidden)
    .sort((a, b) => (b.index ?? -1) - (a.index ?? -1))
}

export const typeLabel = (t?: string) => (t ? t.replace(/^[a-z]/, '').trim() || t : null) // "wexecutor" -> "executor"
