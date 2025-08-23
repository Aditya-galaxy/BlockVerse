#!/bin/bash

# BlockVerse Deployment Script

echo "🚀 Deploying BlockVerse to Internet Computer..."

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ dfx could not be found. Please install DFX first."
    echo "Visit: https://internetcomputer.org/docs/current/developer-docs/setup/install/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js could not be found. Please install Node.js first."
    exit 1
fi

# Start local Internet Computer replica
echo "🔄 Starting local Internet Computer replica..."
dfx start --background --clean

# Deploy Internet Identity canister (for local development)
echo "🔄 Deploying Internet Identity canister..."
dfx deploy internet_identity

# Deploy backend canister
echo "🔄 Building and deploying backend canister..."
cd backend
dfx deploy blockverse_backend

# Get canister IDs
BACKEND_CANISTER_ID=$(dfx canister id blockverse_backend)
II_CANISTER_ID=$(dfx canister id internet_identity)

echo "✅ Backend canister deployed with ID: $BACKEND_CANISTER_ID"
echo "✅ Internet Identity canister ID: $II_CANISTER_ID"

# Build frontend
echo "🔄 Building frontend..."
cd ../frontend

# Create environment file
cat > .env << EOF
REACT_APP_CANISTER_ID=$BACKEND_CANISTER_ID
REACT_APP_INTERNET_IDENTITY_CANISTER_ID=$II_CANISTER_ID
NODE_ENV=development
EOF

# Install dependencies and build
npm install
npm run build

echo "✅ Frontend built successfully!"

# Deploy to local network
echo "🔄 Deploying frontend assets..."
dfx deploy --network local

echo "🎉 BlockVerse deployed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   • Backend Canister ID: $BACKEND_CANISTER_ID"
echo "   • Internet Identity ID: $II_CANISTER_ID"
echo "   • Local URL: http://localhost:3000"
echo ""
echo "🔧 Next Steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Create your Internet Identity"
echo "   3. Start sharing on BlockVerse!"
echo ""