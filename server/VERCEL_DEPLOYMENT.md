# Vercel Deployment Guide

## 📋 Prerequisites

1. **MongoDB Atlas Account**: Set up a MongoDB Atlas cluster (Vercel doesn't support local MongoDB)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Push your server code to GitHub

## 🚀 Deployment Steps

### 1. Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a new cluster (free tier is sufficient for testing)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
5. Get your connection string from the "Connect" button

### 2. Environment Variables Setup

In your Vercel Dashboard, add these environment variables:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_production_jwt_secret_key_256_bits_minimum
COOKIE_SECRET=your_production_cookie_secret_key_256_bits_minimum
NODE_ENV=production
PORT=3000
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/jpg
PDF_OUTPUT_DIR=/tmp/reports
CLIENT_URL=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set the root directory to your server folder
5. Vercel will auto-detect it's a Node.js project
6. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
npm i -g vercel
cd project/server
vercel --prod
```

### 4. Post-Deployment Configuration

1. **Domain Setup**: Your API will be available at `https://your-project.vercel.app`
2. **CORS Update**: Update your client application to use the new API URL
3. **Environment Variables**: Double-check all environment variables are set correctly

## 📁 Files Created/Modified

### New Files:
- `vercel.json` - Vercel configuration
- `.env.production` - Production environment template
- `VERCEL_DEPLOYMENT.md` - This deployment guide

### Modified Files:
- `package.json` - Added vercel-build script and updated start script
- `src/middleware/upload.ts` - Updated for serverless environment compatibility

## ⚠️ Important Limitations

### File Upload Limitations
- **Temporary Storage**: Files uploaded to `/tmp` are temporary and will be deleted after request completion
- **Serverless Functions**: Each request runs in isolation
- **File Size**: Keep uploads under 10MB (Vercel limit)

### Recommended Solutions for File Storage:
1. **AWS S3**: Best for production file storage
2. **Cloudinary**: Good for image uploads with transformations
3. **Firebase Storage**: Easy integration with existing Firebase projects

## 🔧 Troubleshooting

### Common Issues:

1. **Build Errors**:
   - Ensure all TypeScript types are properly defined
   - Check that all dependencies are in `dependencies` not `devDependencies`

2. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist settings
   - Ensure database user has proper permissions

3. **Environment Variables**:
   - Double-check all variables are set in Vercel dashboard
   - Redeploy after adding new environment variables

4. **File Upload Issues**:
   - Remember that uploaded files are temporary in serverless environment
   - Consider implementing cloud storage for persistent file storage

### Logs:
- View logs in Vercel Dashboard under "Functions" tab
- Use `vercel logs <deployment-url>` for CLI access

## 🚀 Next Steps

1. **Set up cloud storage** (AWS S3, Cloudinary, etc.) for persistent file uploads
2. **Configure custom domain** in Vercel dashboard
3. **Set up monitoring** and error tracking
4. **Implement backup strategy** for your MongoDB Atlas database
5. **Configure CI/CD** for automatic deployments on git push

## 📚 Additional Resources

- [Vercel Node.js Documentation](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Note**: This deployment configuration uses Vercel's serverless functions. For applications requiring persistent file storage or long-running processes, consider traditional hosting solutions like Railway, Render, or DigitalOcean.