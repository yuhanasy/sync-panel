import { Skeleton } from './Skeleton'

interface Props {
  label: string
  value: string | number
  sub?: string
  isLoading?: boolean
}

export function StatCard({ label, value, sub, isLoading }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex flex-col justify-center min-h-[90px]">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      {isLoading ? (
        <Skeleton className="h-8 w-1/2 mt-1" />
      ) : (
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      )}
      {sub && !isLoading && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
