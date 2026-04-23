import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Shell } from '@/components/layout/Shell'
import { IntegrationsList } from '@/pages/IntegrationsList'
import { IntegrationDetail } from '@/pages/IntegrationDetail'
import { ReviewSync } from '@/pages/ReviewSync'
import { LocalData } from '@/pages/LocalData'
import { SyncHistory } from '@/pages/SyncHistory'
import { HistoryDetail } from '@/pages/HistoryDetail'
import { NotFound } from '@/pages/NotFound'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<IntegrationsList />} />
            <Route path="/local-data" element={<LocalData />} />
            <Route path="/integrations/:id" element={<IntegrationDetail />} />
            <Route path="/integrations/:id/review" element={<ReviewSync />} />
            <Route path="/integrations/:id/history" element={<SyncHistory />} />
            <Route path="/integrations/:id/history/:version" element={<HistoryDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
