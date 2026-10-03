# GeoNDVI: Comprehensive Installation & GCP Setup Guide

This document provides a step-by-step, zero-to-production guide to configuring your Google Cloud Platform (GCP) environment and running the GeoNDVI platform locally using Docker.

---

## Phase 1: Google Cloud Platform (GCP) Configuration

GeoNDVI relies heavily on Google Earth Engine (GEE). You must configure a GCP project and a Service Account to authenticate the backend server.

### Step 1.1: Create a GCP Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your Google account.
3. In the top navigation bar, click the **Project Selector** dropdown.
4. Click **New Project** in the top right of the modal window.
5. Enter a Project Name (e.g., `geondvi-production`).
6. Select your Billing Account (Earth Engine requires a billing-enabled project, though typical usage falls under the free tier).
7. Click **Create** and wait for the project to provision.

### Step 1.2: Enable the Earth Engine API
1. Ensure your newly created project (`geondvi-production`) is selected in the top navigation bar.
2. Open the left sidebar menu (hamburger icon) and navigate to **APIs & Services > Library**.
3. In the search bar, type `Earth Engine API`.
4. Click on the **Google Earth Engine API** result.
5. Click the blue **Enable** button.

### Step 1.3: Register for Earth Engine
1. Go to the [Earth Engine Sign Up Page](https://signup.earthengine.google.com/).
2. Register your project for Earth Engine access. You must link the GCP project you just created.
3. Wait for the registration to be approved (often instantaneous if linked to a valid GCP project).

### Step 1.4: Create a Service Account
The backend uses a Service Account (a non-human robot account) to securely talk to GEE without requiring a human to log in.
1. In the Google Cloud Console, navigate to **IAM & Admin > Service Accounts**.
2. Click **+ Create Service Account** at the top.
3. **Service account details**:
   - Name: `geondvi-backend-sa`
   - Description: `Service account for GeoNDVI Earth Engine backend processing.`
   - Click **Create and Continue**.
4. **Grant this service account access to project**:
   - In the Role dropdown, select **Earth Engine > Earth Engine Resource Viewer**.
   - *(Optional: If you plan on exporting data back to Google Cloud Storage later, also add `Storage Object Admin`).*
   - Click **Continue**, then **Done**.

### Step 1.5: Generate and Download the JSON Key
1. In the Service Accounts list, click the email address of the `geondvi-backend-sa` account you just created.
2. Navigate to the **Keys** tab at the top.
3. Click **Add Key > Create new key**.
4. Key type: **JSON**.
5. Click **Create**.
6. The JSON file will automatically download to your computer. **Keep this file safe.** It grants access to your Earth Engine quota. Rename it to `key.json`.

---

## Phase 2: Local Application Setup

Now that GCP is configured, we will set up the local repository.

### Step 2.1: Clone the Repository
Open your terminal and navigate to your desired workspace, then clone the repository (if applicable) or navigate into the existing `geondvi` directory.
```bash
cd /Users/aaronr/Desktop/PROJECT/geondvi
```

### Step 2.2: Setup the Secrets Directory
The backend Docker container expects to find the Service Account key in a highly specific, secure folder that is excluded from Git.
1. Create the secrets directory:
   ```bash
   mkdir -p backend/secrets
   ```
2. Move the `key.json` file you downloaded in Step 1.5 into this folder:
   ```bash
   # Assuming the file downloaded to your Downloads folder
   mv ~/Downloads/key.json backend/secrets/key.json
   ```

### Step 2.3: Configure the Environment Variables
The application relies on an `.env` file to know which GCP project to bill and which credentials to use.
1. Create the `.env` file inside the backend directory:
   ```bash
   touch backend/.env
   ```
2. Open `backend/.env` in your code editor and paste the following exactly:
   ```env
   # Replace these values with your actual GCP Project ID and Service Account Email!
   GEE_PROJECT=geondvi-production
   GEE_SERVICE_ACCOUNT=geondvi-backend-sa@geondvi-production.iam.gserviceaccount.com
   
   # Leave these lines exactly as they are
   GEE_PRIVATE_KEY_FILE=./secrets/key.json
   CORS_ORIGINS=http://localhost:8080,http://localhost:5173
   MAX_AREA_KM2=2000
   ```

---

## Phase 3: Launching the Platform

### Step 3.1: Install Docker
Ensure you have Docker Desktop installed on your Mac. If not, download it from [Docker's official website](https://www.docker.com/products/docker-desktop/). Ensure the Docker daemon is running (you should see the whale icon in your Mac menu bar).

### Step 3.2: Build and Run the Containers
In your terminal, from the root of the `geondvi` directory (where the `docker-compose.yml` file is located), run:

```bash
docker compose up --build
```

### Step 3.3: Verify the Deployment
1. Watch the terminal logs. You should see Vite compiling the frontend, followed by the Python backend starting up.
2. Look for the message: `INFO: Application startup complete.`
3. Open your web browser and navigate to:
   - **http://localhost:8080**
4. The GeoNDVI interface should load immediately. Try drawing a small polygon and clicking "Calculate NDVI" to confirm the backend successfully authenticated with Google Earth Engine.

---

## Troubleshooting

- **Error: `ee.ee_exception.EEException: Project geondvi-production is not registered for Earth Engine`**
  - **Fix**: You missed Step 1.3. You must register the GCP project at signup.earthengine.google.com.
- **Error: `FileNotFoundError: [Errno 2] No such file or directory: './secrets/key.json'`**
  - **Fix**: You placed the `key.json` file in the root directory instead of inside the `backend/secrets/` folder.
- **Error: `413 Request Entity Too Large`**
  - **Fix**: You drew a polygon with far too many vertices (e.g., millions). The Nginx server is configured to block payloads larger than 50MB. Draw a simpler shape.
