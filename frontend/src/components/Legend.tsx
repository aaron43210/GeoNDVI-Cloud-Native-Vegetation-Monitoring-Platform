import type { Vis } from "../types";

interface Props {
  title: string;
  vis: Vis;
  unit?: string;
}

export default function Legend({ title, vis, unit = "" }: Props) {
  const gradient = `linear-gradient(to right, ${vis.palette.join(",")})`;
  return (
    <div className="absolute bottom-6 right-4 z-[1000] w-56 rounded-lg bg-white/95 p-3 shadow-lg">
      <div className="mb-1 text-xs font-semibold text-gray-700">{title}</div>
      <div className="h-3 w-full rounded" style={{ background: gradient }} />
      <div className="mt-1 flex justify-between text-xs text-gray-600">
        <span>{vis.min}{unit}</span>
        <span>{vis.max}{unit}</span>
      </div>
    </div>
  );
}
