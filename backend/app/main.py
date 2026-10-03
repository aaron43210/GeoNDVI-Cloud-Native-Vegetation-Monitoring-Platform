from contextlib import asynccontextmanager

import ee
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .gee_client import init_gee
from .ndvi_service import AreaTooLargeError, NoImageryError, compute_ndvi
from .schemas import NDVIRequest, NDVIResponse


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_gee()
    yield


app = FastAPI(title="GeoNDVI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Plain `def` (not async): FastAPI runs it in a thread pool,
# so blocking GEE calls don't freeze the event loop.
@app.post("/api/ndvi", response_model=NDVIResponse)
def generate_ndvi(req: NDVIRequest):
    try:
        return compute_ndvi(
            req.geometry.model_dump(), req.start_date, req.end_date, req.max_cloud
        )
    except NoImageryError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except AreaTooLargeError as e:
        raise HTTPException(status_code=413, detail=str(e))
    except ee.EEException as e:
        raise HTTPException(status_code=502, detail=f"Earth Engine error: {e}")
