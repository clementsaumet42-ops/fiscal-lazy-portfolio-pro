#!/usr/bin/env python3
"""
Startup script for Fiscal Lazy Portfolio Pro API.

Usage:
    python run_api.py

The API will be available at http://localhost:8000
Documentation at http://localhost:8000/docs
"""

import sys
from pathlib import Path

# Add backend/src to Python path
backend_dir = Path(__file__).parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))

# Now import and run the FastAPI app
import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting Fiscal Lazy Portfolio Pro API")
    print("=" * 60)
    print()
    print("📍 API: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("❤️  For French Experts-Comptables")
    print()
    print("=" * 60)
    
    # Run uvicorn with the app
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
