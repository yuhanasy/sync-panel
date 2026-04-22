import { useMutation } from '@tanstack/react-query'
import type { SyncChange } from '@/types'

const SYNC_URL = 'https://portier-takehometest.onrender.com/api/v1/data/sync'

interface SyncApiResponse {
  code: string
  data: {
    sync_approval: {
      application_name: string
      changes: SyncChange[]
    }
  }
}

function classifyError(status: number): string {
  if (status === 502) return 'Gateway error — could not reach the sync server.'
  if (status >= 500) return 'Internal server error — please try again later.'
  if (status >= 400) return 'Configuration error — check your integration settings.'
  return `Unexpected error (${status}).`
}

async function fetchSync(applicationId: string): Promise<SyncChange[]> {
  let response: Response
  try {
    response = await fetch(`${SYNC_URL}?application_id=${encodeURIComponent(applicationId)}`)
  } catch {
    throw new Error('Connection error — unable to reach the sync server.')
  }
  if (!response.ok) {
    throw new Error(classifyError(response.status))
  }
  const json: SyncApiResponse = await response.json()
  return json.data.sync_approval.changes
}

export function useSyncNow() {
  return useMutation({ mutationFn: fetchSync })
}
