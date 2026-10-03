from datetime import date, timedelta, datetime

import ee

from .config import settings

S2_COLLECTION = "COPERNICUS/S2_SR_HARMONIZED"

NDVI_VIS = {
    "min": -1,
    "max": 1,
    "palette": [
        "#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b",
        "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837",
    ],
}


class NoImageryError(Exception):
    pass


class AreaTooLargeError(Exception):
    pass


def _mask_s2_clouds(img: ee.Image) -> ee.Image:
    """
    Job: Masks (removes) pixels containing cloud shadow, clouds, cirrus, and snow 
         from a Sentinel-2 image using the Scene Classification (SCL) band.
         
    Inputs:
        img (ee.Image): A single Earth Engine image from the Sentinel-2 SR collection.
        
    Outputs:
        ee.Image: The same image but with the cloudy/snowy pixels masked out so they don't affect calculations.
    """
    scl = img.select("SCL")
    good = (
        scl.neq(3)    # cloud shadow
        .And(scl.neq(8))   # cloud medium probability
        .And(scl.neq(9))   # cloud high probability
        .And(scl.neq(10))  # thin cirrus
        .And(scl.neq(11))  # snow / ice
    )
    return img.updateMask(good)


def _to_ndvi(img: ee.Image) -> ee.Image:
    """
    Job: Calculates the Normalized Difference Vegetation Index (NDVI) for a given image.
         The formula is (NIR - Red) / (NIR + Red). For Sentinel-2, NIR is Band 8 (B8) and Red is Band 4 (B4).
         
    Inputs:
        img (ee.Image): A Sentinel-2 Earth Engine image.
        
    Outputs:
        ee.Image: A new 1-band image containing only the calculated NDVI values, named "NDVI".
    """
    return img.normalizedDifference(["B8", "B4"]).rename("NDVI")


def compute_ndvi(geojson: dict, start: date, end: date, max_cloud: int) -> dict:
    """
    Job: The main engine of the application. It takes a user-drawn shape and date range, fetches the 
         relevant Sentinel-2 satellite imagery from Google Earth Engine, calculates the median NDVI, 
         computes statistics (min, max, mean), and generates a map tile URL for the frontend.
         
    Inputs:
        geojson (dict): A GeoJSON Polygon dictionary representing the Area of Interest (AOI).
        start (date): The start date of the time window.
        end (date): The end date of the time window.
        max_cloud (int): The maximum acceptable cloud cover percentage (0-100) for scenes to be included.
        
    Outputs:
        dict: A dictionary containing:
            - tile_url (str): The URL pattern Leaflet uses to fetch the generated NDVI map tiles.
            - stats (dict): The min, max, and mean NDVI values across the AOI.
            - vis (dict): The visualization parameters (palette, min, max) used for coloring.
            - image_count (int): The number of Sentinel-2 scenes stitched together.
            - image_dates (list): A list of unique formatted timestamps for when the scenes were captured.
            - area_km2 (float): The total area of the AOI in square kilometers.
    """
    aoi = ee.Geometry(geojson)

    area_km2 = aoi.area(maxError=1).divide(1e6).getInfo()
    if area_km2 > settings.max_area_km2:
        raise AreaTooLargeError(
            f"AOI is {area_km2:.0f} km²; the limit is {settings.max_area_km2:.0f} km²."
        )

    # filterDate end is exclusive, so add one day to include `end`
    collection = (
        ee.ImageCollection(S2_COLLECTION)
        .filterBounds(aoi)
        .filterDate(start.isoformat(), (end + timedelta(days=1)).isoformat())
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", max_cloud))
    )

    count = collection.size().getInfo()
    if count == 0:
        raise NoImageryError(
            "No Sentinel-2 scenes found for this area/date range. "
            "Try a longer range or a higher cloud threshold."
        )

    times = collection.aggregate_array('system:time_start').getInfo()
    image_dates = sorted(list(set(datetime.utcfromtimestamp(t / 1000.0).strftime('%Y-%m-%d %H:%M UTC') for t in times)))

    ndvi = collection.map(_mask_s2_clouds).map(_to_ndvi).median().clip(aoi)

    reducer = (
        ee.Reducer.mean()
        .combine(ee.Reducer.min(), sharedInputs=True)
        .combine(ee.Reducer.max(), sharedInputs=True)
    )
    raw = ndvi.reduceRegion(
        reducer=reducer,
        geometry=aoi,
        scale=10,
        maxPixels=1e9,
        bestEffort=True,
    ).getInfo()

    def _r(v):
        return None if v is None else round(float(v), 3)

    stats = {
        "mean": _r(raw.get("NDVI_mean")),
        "min": _r(raw.get("NDVI_min")),
        "max": _r(raw.get("NDVI_max")),
    }

    map_id = ndvi.getMapId(NDVI_VIS)
    tile_url = map_id["tile_fetcher"].url_format

    return {
        "tile_url": tile_url,
        "stats": stats,
        "vis": NDVI_VIS,
        "image_count": count,
        "image_dates": image_dates,
        "area_km2": round(area_km2, 2),
    }
