export interface PolygonGeoJSON {
  type: "Polygon";
  coordinates: number[][][];
}

export interface NdviRequest {
  geometry: PolygonGeoJSON;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  max_cloud: number;
}

export interface Stats {
  mean: number | null;
  min: number | null;
  max: number | null;
}

export interface Vis {
  min: number;
  max: number;
  palette: string[];
}

export interface NdviResponse {
  tile_url: string;
  stats: Stats;
  vis: Vis;
  image_count: number;
  image_dates: string[];
  area_km2: number;
}
