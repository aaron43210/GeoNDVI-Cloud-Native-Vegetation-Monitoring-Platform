import { useState } from "react";
import MapView from "./components/MapView";
import Sidebar, { type FormState } from "./components/Sidebar";
import Legend from "./components/Legend";
import { generateNdvi } from "./api";
import type { NdviResponse, PolygonGeoJSON } from "./types";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

export default function App() {
  const [aoi, setAoi] = useState<PolygonGeoJSON | null>(null);
  const [form, setForm] = useState<FormState>({
    start: iso(daysAgo(30)),
    end: iso(new Date()),
    maxCloud: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NdviResponse | null>(null);
  const [opacity, setOpacity] = useState(0.85);

  const handleAoi = (g: PolygonGeoJSON | null) => {
    setAoi(g);
    setResult(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!aoi) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateNdvi({
        geometry: aoi,
        start_date: form.start,
        end_date: form.end,
        max_cloud: form.maxCloud,
      });
      setResult(res);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="bg-emerald-700 px-4 py-3 text-lg font-semibold text-white">
        🌱 GeoNDVI <span className="ml-2 text-sm font-normal opacity-80">Vegetation health from Sentinel-2</span>
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar
          hasAoi={!!aoi}
          form={form}
          onForm={setForm}
          loading={loading}
          error={error}
          result={result}
          opacity={opacity}
          onOpacity={setOpacity}
          onGenerate={handleGenerate}
        />
        <main className="relative flex-1">
          <MapView onAoiChange={handleAoi} tileUrl={result?.tile_url ?? null} opacity={opacity} />
          {result && <Legend title="NDVI" vis={result.vis} />}
        </main>
      </div>
    </div>
  );
}
