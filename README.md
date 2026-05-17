# E-commerce App Monolith

This repository contains a MERN stack monolithic ecommerce application.

## Structure

- `backend/` - Express server, MongoDB models, API routes
- `frontend/` - React application

## Getting Started

1. Install all dependencies:
   ```bash
   npm run install-all
   ```
   Or install manually:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Start both backend and frontend:
   ```bash
   npm start
   ```

   This will run both servers concurrently:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

## Individual Commands

- Run only backend: `npm run server`
- Run only frontend: `npm run client`

## Product Image Uploads

The product media pipeline uses direct-to-S3 uploads with backend-generated
pre-signed URLs and CloudFront-ready public URLs.

Backend environment variables are documented in `backend/.env.example`.

Required AWS setup:

- S3 bucket with CORS allowing `PUT` from your frontend origin.
- IAM credentials limited to product image object write/delete permissions.
- Optional CloudFront distribution in front of the bucket.

Upload flow:

1. Admin selects up to 5 images.
2. Frontend validates file type, signature, and 5MB limit.
3. Frontend converts/resizes images to WebP, max 1200px.
4. Backend validates metadata/signature and returns pre-signed S3 URLs.
5. Frontend uploads directly to S3 with progress.
6. Product stores `images: [{ url, key, alt, isPrimary }]` in MongoDB.
