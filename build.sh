/** @type {import('next').NextConfig} */
const nextConfig = {
  // Since you're serving static HTML, disable Next.js features you don't need
  output: 'export', // Static export for Vercel
  trailingSlash: true, // Better for static hosting
  
  // Environment variables that will be exposed to the browser
  env: {
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    NEXT_PUBLIC_ADSENSE_BANNER_SLOT: process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT,
    NEXT_PUBLIC_ADSENSE_CONTENT_SLOT: process.env.NEXT_PUBLIC_ADSENSE_CONTENT_SLOT,
    NEXT_PUBLIC_OPEN_METEO_URL: process.env.NEXT_PUBLIC_OPEN_METEO_URL || 'https://api.open-meteo.com/v1/forecast',
    NEXT_PUBLIC_AIR_QUALITY_URL: process.env.NEXT_PUBLIC_AIR_QUALITY_URL || 'https://air-quality-api.open-meteo.com/v1/air-quality',
    NEXT_PUBLIC_GEOCODING_URL: process.env.NEXT_PUBLIC_GEOCODING_URL || 'https://geocoding-api.open-meteo.com/v1/search',
  },
  
  // Disable image optimization since we're using CDN icons
  images: {
    unoptimized: true,
  },
  
  // Redirects for better PWA support
  async redirects() {
    return [
      {
        source: '/',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json; charset=utf-8',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;#!/bin/bash
# build.sh - Build script for SkyCast PWA
# This script injects environment variables into the HTML file

echo "🚀 Building SkyCast Weather PWA..."
echo "===================================="

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found!"
    exit 1
fi

# Display current environment (for debugging)
echo "📋 Environment Variables:"
echo "------------------------"
echo "NEXT_PUBLIC_ADSENSE_CLIENT_ID: ${NEXT_PUBLIC_ADSENSE_CLIENT_ID:0:20}..."  # Show first 20 chars for security
echo "NEXT_PUBLIC_ADSENSE_BANNER_SLOT: $NEXT_PUBLIC_ADSENSE_BANNER_SLOT"
echo "NEXT_PUBLIC_ADSENSE_CONTENT_SLOT: $NEXT_PUBLIC_ADSENSE_CONTENT_SLOT"
echo ""

# Create a backup of original index.html
echo "💾 Creating backup of index.html..."
cp index.html index.html.backup

echo "🔧 Injecting environment variables into index.html..."

# Temporary file for processing
TEMP_FILE="index.temp.html"

# Copy original to temp
cp index.html $TEMP_FILE

# Replace AdSense Client ID (with fallback)
if [ ! -z "$NEXT_PUBLIC_ADSENSE_CLIENT_ID" ]; then
    echo "✅ Injecting AdSense Client ID..."
    sed -i "s/ca-pub-XXXXXXXXXXXXXXXX/$NEXT_PUBLIC_ADSENSE_CLIENT_ID/g" $TEMP_FILE
else
    echo "⚠️  AdSense Client ID not set, using placeholder"
fi

# Replace Banner Ad Slot (with fallback)
if [ ! -z "$NEXT_PUBLIC_ADSENSE_BANNER_SLOT" ]; then
    echo "✅ Injecting Banner Ad Slot..."
    sed -i "s/data-ad-slot=\"1234567890\"/data-ad-slot=\"$NEXT_PUBLIC_ADSENSE_BANNER_SLOT\"/g" $TEMP_FILE
else
    echo "⚠️  Banner Ad Slot not set, using placeholder"
fi

# Replace Content Ad Slot (with fallback)
if [ ! -z "$NEXT_PUBLIC_ADSENSE_CONTENT_SLOT" ]; then
    echo "✅ Injecting Content Ad Slot..."
    sed -i "s/data-ad-slot=\"0987654321\"/data-ad-slot=\"$NEXT_PUBLIC_ADSENSE_CONTENT_SLOT\"/g" $TEMP_FILE
else
    echo "⚠️  Content Ad Slot not set, using placeholder"
fi

# Update site URL if provided
if [ ! -z "$VERCEL_URL" ]; then
    echo "✅ Updating site URL to: $VERCEL_URL"
    sed -i "s|https://your-domain.vercel.app|https://$VERCEL_URL|g" $TEMP_FILE
fi

# Replace the original file with the processed one
mv $TEMP_FILE index.html

# Copy necessary files to output directory
echo "📁 Copying project files..."
cp -r ./* $VERCEL_OUTPUT_DIR/ 2>/dev/null || true

# Make sure the icons directory exists
if [ ! -d "$VERCEL_OUTPUT_DIR/icon" ]; then
    echo "📁 Creating icons directory..."
    mkdir -p $VERCEL_OUTPUT_DIR/icon
fi

# Copy icon files if they exist
if [ -f "icon/icon-192.png" ]; then
    cp icon/icon-192.png $VERCEL_OUTPUT_DIR/icon/
fi
if [ -f "icon/icon-512.png" ]; then
    cp icon/icon-512.png $VERCEL_OUTPUT_DIR/icon/
fi

echo ""
echo "✅ Build completed successfully!"
echo "📊 Output directory: $VERCEL_OUTPUT_DIR"
echo ""
echo "🎉 SkyCast PWA is ready for deployment!"
echo "========================================="