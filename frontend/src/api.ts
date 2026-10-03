import type { NdviRequest, NdviResponse } from "./types";

/**
 * generateNdvi
 * 
 * Job: Makes a POST request to the backend API to generate an NDVI map and calculate statistics
 *      for a given geographical polygon and date range.
 * 
 * Inputs:
 *  - body (NdviRequest): An object containing the GeoJSON geometry, start date, end date, and max cloud cover.
 * 
 * Output:
 *  - Returns a Promise that resolves to an NdviResponse object containing the statistics (min, max, mean),
 *    Earth Engine tile URL, visual parameters (vis), and image acquisition timestamps.
 * 
 * Throws:
 *  - An Error if the HTTP request fails, usually providing the error detail returned by the backend.
 */
export async function generateNdvi(body: NdviRequest): Promise<NdviResponse> {
  const res = await fetch("/api/ndvi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    let msg = `Request failed (${res.status})`;
    if (typeof err.detail === "string") msg = err.detail;
    else if (Array.isArray(err.detail) && err.detail[0]?.msg) msg = err.detail[0].msg;
    throw new Error(msg);
  }
  return res.json();
}
