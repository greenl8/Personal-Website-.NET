# Deployment Guide - Render.com + Railway PostgreSQL

This guide covers deploying your ASP.NET Core application with Angular frontend to Render.com while using Railway for PostgreSQL database hosting.

## Architecture Overview

- **Web Application**: Deployed on Render.com using Docker
- **Database**: PostgreSQL hosted on Railway
- **File Storage**: Container filesystem (consider external storage for production)

## Prerequisites

1. Git repository with your code
2. [Render.com](https://render.com) account
3. [Railway](https://railway.app) account

## Step 1: Set Up Railway PostgreSQL Database

### 1.1 Create Railway Project
1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Name your project (e.g., "greenl8site-db")

### 1.2 Get Database Connection Details
1. In your Railway project dashboard, click on the PostgreSQL service
2. Go to the "Connect" tab
3. Copy the "Postgres Connection URL" - it will look like:
   ```
   
postgresql://postgres:MHJDNikCqhnKtrmczOQZttUlWdzcDdRi@postgres.railway.internal:5432/railway
   ```
4. Save this URL for the next step

## Step 2: Deploy to Render.com

### 2.1 Connect Your Repository
1. Go to [Render.com](https://render.com) and sign in
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Select the repository containing your application

### 2.2 Configure Web Service
1. **Name**: `greenl8site` (or your preferred name)
2. **Region**: Choose closest to your users (e.g., Oregon)
3. **Branch**: `main` (or your default branch)
4. **Root Directory**: `greenl8site` (if your app is in a subdirectory)
5. **Environment**: `Docker`
6. **Dockerfile Path**: `./Dockerfile`

### 2.3 Set Environment Variables
In the Render.com dashboard, add these environment variables:

#### Required Variables
```bash
# Application Environment
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080

# Database (use the Railway PostgreSQL URL from Step 1.2)
DATABASE_URL=
postgresql://postgres:MHJDNikCqhnKtrmczOQZttUlWdzcDdRi@switchyard.proxy.rlwy.net:46150/railway

# JWT Security (generate a secure 32+ character key)
TOKEN_KEY=#g<*dnSC>wrr2V|Yk3o;VHa!wm'9^Z@M

# Admin User (customize these values)
ADMIN_USERNAME=greenl8
ADMIN_EMAIL=judeasmith4@gmail.com
ADMIN_PASSWORD=5m1th4445m5!Q

# File Storage Base URL (update with your actual Render URL)
BASE_URL=https://greenl8site.onrender.com
```

#### Generating Secure Values
- **TOKEN_KEY**: Use a password generator for 32+ characters
- **ADMIN_PASSWORD**: Use a strong password for admin access

### 2.4 Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the build logs for any issues

## Step 3: Alternative - Using render.yaml (Infrastructure as Code)

Instead of manual configuration, you can use the included `render.yaml` file:

### 3.1 Update render.yaml
Edit the `render.yaml` file in your project root:

```yaml
services:
  - type: web
    name: greenl8site
    env: docker
    dockerfilePath: ./Dockerfile
    plan: starter
    region: oregon
    branch: main
    envVars:
      - key: ASPNETCORE_ENVIRONMENT
        value: Production
      - key: ASPNETCORE_URLS
        value: http://+:8080
      - key: DATABASE_URL
        value: YOUR_RAILWAY_POSTGRESQL_URL_HERE
      - key: TOKEN_KEY
        value: YOUR_SECURE_TOKEN_KEY_HERE
      - key: ADMIN_USERNAME
        value: admin
      - key: ADMIN_EMAIL
        value: admin@yourdomain.com
      - key: ADMIN_PASSWORD
        value: YOUR_ADMIN_PASSWORD_HERE
      - key: BASE_URL
        value: https://your-service-name.onrender.com
```

### 3.2 Deploy with render.yaml
1. In Render dashboard, click "New +" and select "Blueprint"
2. Connect your repository
3. Render will read the `render.yaml` file and create services automatically

## Step 4: Post-Deployment Configuration

### 4.1 Verify Deployment
1. Check that your application is accessible at the Render URL
2. Monitor the application logs in Render dashboard
3. Test the admin login with your configured credentials

### 4.2 Custom Domain (Optional)
1. In Render dashboard, go to your web service
2. Click "Settings" → "Custom Domains"
3. Add your domain and configure DNS as instructed

### 4.3 SSL Certificate
Render automatically provides SSL certificates for all deployed applications.

## Step 5: Application Features

### 5.1 Admin User
- An admin user is automatically created on first startup
- Login credentials are set via environment variables
- No sample/test data is created in production

### 5.2 Database Migrations
- Migrations run automatically on application startup
- The app will create necessary tables if they don't exist

### 5.3 File Uploads
- Files are stored in the container's filesystem at `wwwroot/uploads`
- **Important**: Container storage is ephemeral on Render
- Consider using cloud storage (AWS S3, Cloudinary, etc.) for production

## Monitoring and Management

### Viewing Logs
In Render dashboard:
1. Go to your web service
2. Click "Logs" to view application logs
3. Monitor for any errors or issues

### Scaling
1. In Render dashboard, go to "Settings"
2. Upgrade your plan if you need more resources
3. Render handles scaling automatically based on traffic

### Railway Database Management
1. Access Railway dashboard to monitor database usage
2. View connection metrics and performance
3. Backup and restore options available

## Troubleshooting

### Common Issues

#### Build Failures
- Check that Node.js and npm are properly installed in Dockerfile
- Ensure Angular build completes successfully
- Verify all dependencies are properly restored

#### Database Connection Issues
- Verify `DATABASE_URL` is correctly set
- Check Railway database is running and accessible
- Ensure SSL configuration is correct for Railway

#### Environment Variable Issues
- All variables must be set in Render dashboard
- Variable names are case-sensitive
- No quotes needed around values in Render UI

### Getting Help
- Check application logs in Render dashboard
- Monitor Railway database logs
- Verify environment variables are properly set

## Production Considerations

### Security
- Use strong, unique passwords for admin account
- Rotate JWT token key periodically
- Consider implementing rate limiting
- Regular security updates

### Performance
- Monitor application performance in Render
- Consider upgrading plans based on usage
- Implement caching strategies
- Optimize database queries

### Backup
- Railway provides automated backups
- Consider implementing application-level backup strategies
- Document your deployment configuration

## Cost Optimization

### Render.com Plans
- **Starter Plan**: $7/month (512 MB RAM, 0.1 CPU)
- **Standard Plan**: $25/month (2 GB RAM, 1 CPU)
- Free tier available with limitations

### Railway Plans
- **Developer Plan**: $5/month with $5 usage credit
- **Pro Plan**: $20/month with $20 usage credit
- Pay-per-use for database resources

---

Your application is now deployed and ready for production use! 🚀 