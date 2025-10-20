#!/bin/bash

echo "🔍 IntelliQuant - System Check"
echo "================================"
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js $(node --version)"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm $(npm --version)"
else
    echo "❌ npm not found"
    exit 1
fi

# Check pnpm (for Envio)
echo ""
echo "📦 Checking pnpm (for Envio)..."
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm $(pnpm --version)"
else
    echo "⚠️  pnpm not found - install with: npm install -g pnpm"
fi

# Check Envio CLI
echo ""
echo "📦 Checking Envio CLI..."
if command -v envio &> /dev/null; then
    echo "✅ Envio CLI installed"
else
    echo "⚠️  Envio CLI not found - install with: npm install -g envio"
fi

# Check backend dependencies
echo ""
echo "📦 Checking backend..."
if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  Backend dependencies missing - run: cd backend && npm install"
fi

# Check frontend dependencies
echo ""
echo "📦 Checking frontend..."
if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  Frontend dependencies missing - run: cd frontend && npm install"
fi

# Check .env file
echo ""
echo "⚙️  Checking configuration..."
if [ -f "backend/.env" ]; then
    echo "✅ Backend .env exists"
    
    if grep -q "CRESTAL_API_KEY=your_" backend/.env; then
        echo "⚠️  CRESTAL_API_KEY not configured"
    else
        echo "✅ CRESTAL_API_KEY configured"
    fi
    
    if grep -q "ENVIO_PORTFOLIO_ENDPOINT=http://localhost" backend/.env; then
        echo "⚠️  ENVIO endpoint is localhost - deploy indexer first!"
    else
        echo "✅ ENVIO endpoint configured"
    fi
else
    echo "⚠️  backend/.env not found - copy from .env.example"
fi

# Check Envio indexer
echo ""
echo "📊 Checking Envio indexers..."
if [ -d "envio-indexers/portfolio-indexer/node_modules" ]; then
    echo "✅ Portfolio indexer dependencies installed"
else
    echo "⚠️  Portfolio indexer dependencies missing"
    echo "   Run: cd envio-indexers/portfolio-indexer && pnpm install"
fi

echo ""
echo "================================"
echo "🎯 Next Steps:"
echo ""
echo "1. Deploy Envio:"
echo "   cd envio-indexers/portfolio-indexer"
echo "   envio deploy"
echo ""
echo "2. Update backend/.env with Envio endpoint"
echo ""
echo "3. Start backend:"
echo "   cd backend && npm start"
echo ""
echo "4. Start frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "5. Open http://localhost:5173"
echo ""
echo "💰 FOCUS: Deploy Envio for $1K prize!"
