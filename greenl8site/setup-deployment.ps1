# Setup script for Render.com deployment preparation (PowerShell)
Write-Host "🚀 Setting up Greenl8site for Render.com deployment..." -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not found. Please run 'git init' first." -ForegroundColor Red
    exit 1
}

# Generate a secure token key (32 characters)
Write-Host "🔑 Generating secure TOKEN_KEY..." -ForegroundColor Yellow
$TokenKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "Generated TOKEN_KEY: (redacted)" -ForegroundColor Cyan

# Generate a secure admin password (16 characters)
Write-Host "🔐 Generating secure admin password..." -ForegroundColor Yellow
$AdminPassword = -join ((65..90) + (97..122) + (48..57) + (33,35,36,37,38,42,43,45,61,63,64) | Get-Random -Count 16 | ForEach-Object {[char]$_})
Write-Host "Generated ADMIN_PASSWORD: (redacted)" -ForegroundColor Cyan

Write-Host ""
Write-Host "📝 Environment Variables for Render.com:" -ForegroundColor Magenta
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host "ASPNETCORE_ENVIRONMENT=Production"
Write-Host "ASPNETCORE_URLS=http://+:8080"
Write-Host "DATABASE_URL=YOUR_RAILWAY_POSTGRESQL_URL_HERE"
Write-Host "TOKEN_KEY=(redacted)"
Write-Host "ADMIN_USERNAME=admin"
Write-Host "ADMIN_EMAIL=admin@yourdomain.com"
Write-Host "ADMIN_PASSWORD=(redacted)"
Write-Host "BASE_URL=https://your-service-name.onrender.com"
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Blue
Write-Host "==============" -ForegroundColor Blue
Write-Host "1. Create a Railway PostgreSQL database"
Write-Host "2. Get the connection URL from Railway"
Write-Host "3. Replace 'YOUR_RAILWAY_POSTGRESQL_URL_HERE' with the actual URL"
Write-Host "4. Replace 'your-service-name.onrender.com' with your actual Render URL"
Write-Host "5. Copy these environment variables to your Render.com dashboard"
Write-Host "6. Deploy your application to Render.com"
Write-Host ""

Write-Host "💡 Pro tip: Save these credentials in a secure location!" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Setup complete! Ready for deployment to Render.com + Railway PostgreSQL" -ForegroundColor Green

# Optional: Save to file
$envVars = @"
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
DATABASE_URL=YOUR_RAILWAY_POSTGRESQL_URL_HERE
TOKEN_KEY=REPLACE_WITH_SECURE_TOKEN
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=REPLACE_WITH_SECURE_PASSWORD
BASE_URL=https://your-service-name.onrender.com
"@

$envVars | Out-File -FilePath "deployment-env-vars.txt" -Encoding UTF8
Write-Host "📄 Environment variables saved to 'deployment-env-vars.txt'" -ForegroundColor Green 