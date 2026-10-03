# Google Cloud & Earth Engine Setup Guide

This guide walks you through setting up a Google Cloud Project and generating the necessary credentials to run this Earth Engine application.

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project dropdown at the top of the page.
3. Click **NEW PROJECT** in the top-right corner of the modal window.
4. Name your project (e.g., `geondvi-app`) and click **Create**.
5. Once created, make sure you have selected the new project from the top dropdown.

## 2. Enable & Register Earth Engine
1. In the top search bar, type **Earth Engine API** and select it from the results.
2. Click the blue **Enable** button.
3. Navigate to the Earth Engine Registration page: [Earth Engine Configuration](https://console.cloud.google.com/earth-engine/configuration)
4. Ensure your new project is selected at the top.
5. Click **Register** (select "Noncommercial/Research" if applicable) and accept the terms.

## 3. Create a Service Account
1. In the Google Cloud Console search bar, type **Service Accounts** and select it.
2. Click **+ CREATE SERVICE ACCOUNT** at the top.
3. Name it (e.g., `ee-service`) and click **Create and Continue**.
4. In the "Grant this service account access to project" step, assign the following roles:
   - **Earth Engine Admin** (or Editor)
   - **Service Usage Consumer**
5. Click **Done**.

## 4. Generate the JSON Key
1. In the Service Accounts list, click the email address of the service account you just created.
2. Go to the **Keys** tab at the top.
3. Click **Add Key** -> **Create new key**.
4. Select **JSON** and click **Create**.
5. The file will automatically download to your computer.

## 5. Configure the Application
1. Rename the downloaded JSON file to `key.json`.
2. Move `key.json` into the `backend/secrets/` folder of this project.
3. Open the `backend/.env` file.
4. Update the environment variables to match your new project and service account:

```env
GEE_PROJECT=your-new-project-id
GEE_SERVICE_ACCOUNT=ee-service@your-new-project-id.iam.gserviceaccount.com
GEE_PRIVATE_KEY_FILE=./secrets/key.json
```

5. Restart your Docker containers:
```bash
docker compose down
docker compose up --build
```
