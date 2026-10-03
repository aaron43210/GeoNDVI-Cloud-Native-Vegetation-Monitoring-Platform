import ee

from .config import settings


def init_gee() -> None:
    """Initialise Earth Engine with a service account, or fall back to
    credentials from `earthengine authenticate`."""
    if settings.gee_service_account and settings.gee_private_key_file:
        creds = ee.ServiceAccountCredentials(
            settings.gee_service_account, settings.gee_private_key_file
        )
        ee.Initialize(credentials=creds, project=settings.gee_project)
    else:
        ee.Initialize(project=settings.gee_project)
