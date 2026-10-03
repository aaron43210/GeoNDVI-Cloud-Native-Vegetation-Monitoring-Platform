from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class PolygonGeometry(BaseModel):
    type: Literal["Polygon"]
    coordinates: list[list[list[float]]]


class NDVIRequest(BaseModel):
    geometry: PolygonGeometry
    start_date: date
    end_date: date
    max_cloud: int = Field(30, ge=0, le=100, description="Max scene cloud % ")

    @model_validator(mode="after")
    def check_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class Stats(BaseModel):
    mean: float | None
    min: float | None
    max: float | None


class Vis(BaseModel):
    min: float
    max: float
    palette: list[str]


class NDVIResponse(BaseModel):
    tile_url: str
    stats: Stats
    vis: Vis
    image_count: int
    image_dates: list[str]
    area_km2: float
