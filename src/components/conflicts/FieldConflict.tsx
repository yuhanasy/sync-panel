import type { EnrichedChange } from "@/types";

interface Props {
  change: EnrichedChange;
  selected: boolean;
  onToggle: () => void;
  onResolve: (id: string, side: "local" | "external") => void;
}

function formatValue(value: string | undefined): string {
  return value === undefined || value === "" ? "—" : value;
}

const BADGE_STYLES: Record<EnrichedChange["change_type"], string> = {
  ADD: "bg-green-100 text-green-700 border-green-200",
  UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
  CONFLICT: "bg-amber-100 text-amber-700 border-amber-200",
};

export function FieldConflict({
  change,
  selected,
  onToggle,
  onResolve,
}: Props) {
  const fieldName = change.field_name.split(".").pop() ?? change.field_name;
  const isConflict = change.change_type === "CONFLICT";
  const isResolved = isConflict && (change.resolution ?? null) !== null;

  return (
    <div className="space-y-3 py-4 border-b border-gray-100 last:border-0">
      {/* Row header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-gray-400 cursor-pointer"
            aria-label={`Select ${fieldName}`}
          />

          <h3 className="text-sm font-semibold text-gray-900">{fieldName}</h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded border ${BADGE_STYLES[change.change_type]}`}
          >
            {change.change_type}
          </span>
          {isConflict && selected && !isResolved && (
            <span className="text-xs font-medium text-red-600">
              Resolution required
            </span>
          )}
        </div>
      </div>

      {/* ADD — show new value only */}
      {change.change_type === "ADD" && (
        <div className="ml-7 space-y-1.5">
          <span className="text-xs font-medium text-gray-500">New value</span>
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
            <p className="text-sm font-mono text-gray-800 break-all">
              {formatValue(change.new_value)}
            </p>
          </div>
        </div>
      )}

      {/* DELETE — show current value to be removed */}
      {change.change_type === "DELETE" && (
        <div className="ml-7 space-y-1.5">
          <span className="text-xs font-medium text-gray-500">
            Will be removed
          </span>
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-sm font-mono text-gray-800 break-all line-through">
              {formatValue(change.current_value)}
            </p>
          </div>
        </div>
      )}

      {/* UPDATE — show before → after */}
      {change.change_type === "UPDATE" && (
        <div className="ml-7 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-gray-500">Current</span>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-sm font-mono text-gray-800 break-all">
                {formatValue(change.current_value)}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-gray-500">New</span>
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-sm font-mono text-gray-800 break-all">
                {formatValue(change.new_value)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONFLICT — local vs external with "Use This" buttons */}
      {change.change_type === "CONFLICT" && (
        <div className="ml-7 grid grid-cols-2 gap-3">
          {/* Local side */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Local</span>
              <button
                onClick={() => onResolve(change.id, "local")}
                className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                  change.resolution === "local"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                Use This
              </button>
            </div>
            <div
              className={`rounded-lg border px-3 py-2 ${
                change.resolution === "local"
                  ? "border-amber-300 bg-amber-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <p className="text-sm font-mono text-gray-800 break-all">
                {formatValue(change.local_value)}
              </p>
            </div>
          </div>

          {/* External side */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                External
              </span>
              <button
                onClick={() => onResolve(change.id, "external")}
                className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                  change.resolution === "external"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                Use This
              </button>
            </div>
            <div
              className={`rounded-lg border px-3 py-2 ${
                change.resolution === "external"
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <p className="text-sm font-mono text-gray-800 break-all">
                {formatValue(change.external_value)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
