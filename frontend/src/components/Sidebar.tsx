import type { NdviResponse } from "../types";

export interface FormState {
  start: string;
  end: string;
  maxCloud: number;
}

interface Props {
  hasAoi: boolean;
  form: FormState;
  onForm: (f: FormState) => void;
  loading: boolean;
  error: string | null;
  result: NdviResponse | null;
  opacity: number;
  onOpacity: (v: number) => void;
  onGenerate: () => void;
}

const fmt = (v: number | null) => (v === null ? "—" : v.toFixed(2));

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-mono text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

/**
 * Sidebar Component
 * 
 * Job: Renders the left-hand panel of the application. Manages the form inputs for generating NDVI,
 *      displays the loading state, and renders the statistical results and timestamps returned by the backend.
 * 
 * Inputs (Props):
 *  - hasAoi: Boolean indicating if a polygon has been drawn.
 *  - form: The current state of the start date, end date, and max cloud cover inputs.
 *  - onForm: Callback to update the form state.
 *  - loading: Boolean indicating if the API request is in progress.
 *  - error: Error message string to display, or null.
 *  - result: The NDVI result data returned from the backend (stats, dates, tile_url), or null.
 *  - opacity: Current opacity level of the map overlay.
 *  - onOpacity: Callback to update the opacity level.
 *  - onGenerate: Callback triggered when the "Generate NDVI" button is clicked.
 * 
 * Output:
 *  - Returns a React JSX Element containing the sidebar UI.
 */
export default function Sidebar(p: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const canRun = p.hasAoi && !p.loading && p.form.start && p.form.end;

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-5 overflow-y-auto border-r border-gray-200 bg-white p-4">
      <section>
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">AOI</h2>
        <p className="text-sm text-gray-700">
          {p.hasAoi
            ? "Area selected"
            : "Use the polygon / rectangle tool (top-left of map) to draw your area."}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">From</span>
          <input
            type="date"
            max={today}
            value={p.form.start}
            onChange={(e) => p.onForm({ ...p.form, start: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">To</span>
          <input
            type="date"
            max={today}
            value={p.form.end}
            onChange={(e) => p.onForm({ ...p.form, end: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            Max cloud cover: {p.form.maxCloud}%
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={p.form.maxCloud}
            onChange={(e) => p.onForm({ ...p.form, maxCloud: Number(e.target.value) })}
            className="w-full"
          />
        </label>
      </section>

      <button
        onClick={p.onGenerate}
        disabled={!canRun}
        className="rounded bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {p.loading ? "Processing in Earth Engine…" : "Generate NDVI"}
      </button>

      {p.error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {p.error}
        </div>
      )}

      {p.result && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Statistics</h2>
            <Stat label="Mean" value={fmt(p.result.stats.mean)} />
            <Stat label="Min" value={fmt(p.result.stats.min)} />
            <Stat label="Max" value={fmt(p.result.stats.max)} />
            <p className="text-xs text-gray-500">
              {p.result.image_count} Sentinel-2 scenes · {p.result.area_km2} km²
            </p>
            {p.result.image_dates && p.result.image_dates.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 max-h-32 overflow-y-auto border border-gray-100 p-2 rounded bg-gray-50">
                <strong>Image Timestamps:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {p.result.image_dates.map((date) => (
                    <li key={date}>{date}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-gray-700">
              Layer opacity: {Math.round(p.opacity * 100)}%
            </span>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={p.opacity}
              onChange={(e) => p.onOpacity(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </>
      )}
    </aside>
  );
}
