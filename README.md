# Express API

A lightweight Express.js API with Docker and Google Cloud Run deployment.

## Local Development

```bash
# With Docker (recommended)
docker compose --profile dev up api-dev --build

# Without Docker
npm install
npm run dev
```

Visit `http://localhost:3000`

## Endpoints

| Method | Path    | Description         |
|--------|---------|---------------------|
| GET    | /health | Health check        |
| GET    | /api    | API welcome message |

---

## Deployment Setup (Google Cloud Run)

### One-Time Setup

1. **Create Google Cloud Project**
   ```bash
   # Install gcloud CLI: https://cloud.google.com/sdk/docs/install
   gcloud projects create YOUR_PROJECT_ID
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Create Service Account for GitHub Actions**
   ```bash
   # Create service account
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions"

   # Grant permissions
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/run.admin"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.admin"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"

   # Download key
   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Add GitHub Secrets**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add `GCP_PROJECT_ID`: your project ID
   - Add `GCP_SA_KEY`: contents of `key.json` file

### Workflow

```
git push origin staging   → Deploys to staging  (https://express-api-staging-xxx.run.app)
git push origin master    → Deploys to production (https://express-api-prod-xxx.run.app)
```

### Manual Deploy (without GitHub Actions)

```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/express-api

# Deploy
gcloud run deploy express-api \
  --image gcr.io/YOUR_PROJECT_ID/express-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Cost Estimate

| Service | Staging | Production |
|---------|---------|------------|
| Cloud Run | $0-5/mo | $5-20/mo |
| Container Registry | ~$0.10/mo | ~$0.10/mo |

**Why so cheap?**
- Cloud Run scales to **zero** when no traffic
- Free tier: 2M requests/month, 360,000 GB-seconds
- You only pay for actual usage

---

## Environment Variables

| Variable | Default     | Description      |
|----------|-------------|------------------|
| PORT     | 3000        | Server port      |
| NODE_ENV | development | Environment mode |

