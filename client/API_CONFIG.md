# API Configuration Guide

## 🎯 Centralized API Endpoint Management

All API calls in this client application are now configured to use a single environment variable for easy management.

## 📝 How to Change API Endpoint

### 1. **For Development:**
Edit the `.env` file in the client root:
```bash
VITE_API_URL=http://localhost:5000/api
```

### 2. **For Production:**
Update your deployment platform's environment variables:
```bash
VITE_API_URL=https://your-production-api.com/api
```

### 3. **For Different Environments:**
Create environment-specific files:
- `.env.development` - for development
- `.env.production` - for production  
- `.env.staging` - for staging

## 🔧 What Was Changed

### ✅ **Centralized Configuration:**
- **`src/services/api.ts`** - Now reads from `VITE_API_URL` environment variable
- **`getServerUrl()`** helper function added for static file URLs

### ✅ **Updated Files:**
1. **`src/services/api.ts`** - Main API configuration
2. **`src/services/submissionService.ts`** - Image URL generation
3. **`src/components/SubmissionCard.tsx`** - Static file URLs

### ✅ **Fallback Protection:**
If `VITE_API_URL` is not set, the app defaults to `http://localhost:5000/api`

## 🚀 Usage Examples

### Change to Production API:
```bash
# In .env file
VITE_API_URL=https://your-vercel-app.vercel.app/api
```

### Change to Local Development:
```bash
# In .env file  
VITE_API_URL=http://localhost:5000/api
```

### Change to Different Port:
```bash
# In .env file
VITE_API_URL=http://localhost:3000/api
```

## ⚠️ Important Notes

1. **Restart Required:** Changes to `.env` require restarting the development server
2. **Build Time:** Environment variables are embedded at build time for production
3. **VITE Prefix:** All Vite environment variables must start with `VITE_`

## 🧪 Testing Configuration

To verify your API URL is correct:
```bash
# Check what URL the app is using
console.log('API Base URL:', import.meta.env.VITE_API_URL);
```

---

**Now you can change the API endpoint in just one place! 🎉**