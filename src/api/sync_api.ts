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
  if (status === 502) {
    return 'We had trouble reaching the sync server. This is usually temporary—please try again in a moment.'
  }
  if (status === 401 || status === 403) {
    return 'Authentication failed. Please check your integration credentials and try again.'
  }
  if (status === 404) {
    return "The requested integration could not be found. It may have been moved or deleted."
  }
  if (status >= 500) {
    return "Something went wrong on our end while processing the sync. We've been notified and are looking into it."
  }
  if (status >= 400) {
    return "The sync request couldn't be completed. Please check your integration settings and try again."
  }
  return 'An unexpected error occurred. Please try again or contact support if the issue persists.'
}

async function fetchSync(applicationId: string): Promise<SyncChange[]> {
  let response: Response
  try {
    response = await fetch(`${SYNC_URL}?application_id=${encodeURIComponent(applicationId)}`)
  } catch {
    throw new Error('Connection error. Please check your internet connection and try again.')
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
