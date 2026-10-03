# GeoNDVI: Cloud-Native Vegetation Monitoring Platform

## Overview
GeoNDVI is a high-performance web application designed to monitor vegetation health through the Normalized Difference Vegetation Index (NDVI). By leveraging the massive computing power of Google Earth Engine and the high-resolution optical imagery from the Sentinel-2 satellite constellation, GeoNDVI allows users to instantly analyze vegetation across any drawn Area of Interest (AOI) on the globe.

## Key Features
- **Interactive Geospatial Interface**: A modern, responsive React frontend integrated with Leaflet for precise AOI drawing and map interaction.
- **On-The-Fly Processing**: Integrates directly with the Google Earth Engine Python API to process gigabytes of satellite imagery in seconds.
- **Robust Cloud Masking**: Employs rigorous bit-wise QA band masking to eliminate clouds, shadows, and snow, ensuring accurate vegetation readings.
- **Microservices Architecture**: Clean separation of concerns with a FastAPI backend and an Nginx-served React frontend, all orchestrated via Docker Compose.
- **Secure by Design**: Fully supports GCP Service Account authentication with strictly scoped IAM privileges.

## Getting Started

### Prerequisites
- Docker and Docker Compose
- A Google Cloud Platform Project with Earth Engine API enabled
- A Service Account JSON key (`key.json`)

### Configuration
1. Create a `secrets` directory in the `backend` folder and place your `key.json` there:
   ```bash
   mkdir -p backend/secrets
   # Copy your key.json into this folder
   ```
2. Create a `.env` file in the `backend` folder:
   ```bash
   touch backend/.env
   ```
3. Add the following to `.env`:
   ```env
   GEE_PROJECT=your-gcp-project-id
   GEE_SERVICE_ACCOUNT=your-service-account@your-gcp-project-id.iam.gserviceaccount.com
   GEE_PRIVATE_KEY_FILE=./secrets/key.json
   MAX_AREA_KM2=2000
   ```

### Running the Application
```bash
docker compose up --build
```
Navigate to `http://localhost:8080` in your browser.

## Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed, 400+ line breakdown of the system architecture.
