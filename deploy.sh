#!/bin/bash
echo "🚀 Deploying SkyCast Weather PWA to Vercel..."

# Remove old cache
rm -rf .vercel
rm -rf node_modules

# Create necessary directories
mkdir -p api
mkdir -p icon

# Create placeholder icons if they don't exist
if [ ! -f "icon/favicon-32.png" ]; then
    echo "📝 Creating placeholder icons..."
    echo "Placeholder icon" > icon/favicon-32.png
    echo "Placeholder apple icon" > icon/apple-touch-icon.png
fi

# Check for required files
echo "🔍 Checking required files..."
[ -f "index.html" ] || { echo "❌ Error: index.html not found!"; exit 1; }
[ -f "api/ai-forecast.js" ] || { echo "❌ Error: api/ai-forecast.js not found!"; exit 1; }
[ -f "package.json" ] || { echo "❌ Error: package.json not found!"; exit 1; }
[ -f "vercel.json" ] || { echo "❌ Error: vercel.json not found!"; exit 1; }

echo "✅ All files present!"

# Deploy to Vercel
echo "🚀 Starting deployment..."
vercel --prod --yes

echo "🎉 Deployment complete!"