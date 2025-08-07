#!/bin/bash

# Setup script for Render.com deployment preparation
echo "🚀 Setting up Greenl8site for Render.com deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run 'git init' first."
    exit 1
fi

# Generate a secure token key
echo "🔑 Generating secure TOKEN_KEY..."
TOKEN_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "Generated TOKEN_KEY: $TOKEN_KEY"

# Generate a secure admin password
echo "🔐 Generating secure admin password..."
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/")
echo "Generated ADMIN_PASSWORD: $ADMIN_PASSWORD"

echo ""
echo "📝 Environment Variables for Render.com:"
echo "========================================="
echo "ASPNETCORE_ENVIRONMENT=Production"
echo "ASPNETCORE_URLS=http://+:8080"
echo "DATABASE_URL=YOUR_RAILWAY_POSTGRESQL_URL_HERE"
echo "TOKEN_KEY=$TOKEN_KEY"
echo "ADMIN_USERNAME=admin"
echo "ADMIN_EMAIL=admin@yourdomain.com"
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD"
echo "BASE_URL=https://your-service-name.onrender.com"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo "1. Create a Railway PostgreSQL database"
echo "2. Get the connection URL from Railway"
echo "3. Replace 'YOUR_RAILWAY_POSTGRESQL_URL_HERE' with the actual URL"
echo "4. Replace 'your-service-name.onrender.com' with your actual Render URL"
echo "5. Copy these environment variables to your Render.com dashboard"
echo "6. Deploy your application to Render.com"
echo ""

echo "💡 Pro tip: Save these credentials in a secure location!"
echo ""
echo "✅ Setup complete! Ready for deployment to Render.com + Railway PostgreSQL" 