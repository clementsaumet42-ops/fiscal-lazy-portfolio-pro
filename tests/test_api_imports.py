import sys
from pathlib import Path
import importlib.util

# Add backend to path to simulate Docker environment
backend_path = str(Path(__file__).parent.parent / "backend")
sys.path.insert(0, backend_path)

import pytest


class TestApiImports:
    """Test that API imports work correctly in Docker environment."""
    
    def test_api_main_module_can_be_found(self):
        """Test that api.main module can be found by Python import system.
        
        This verifies that the import statement fix (from api.routes instead of from routes)
        allows the module to be discoverable when backend/ is copied to /app in Docker.
        """
        spec = importlib.util.find_spec('api.main')
        assert spec is not None, "api.main module should be findable"
        assert spec.origin is not None, "api.main should have a valid origin"
        assert spec.origin.endswith('backend/api/main.py'), f"Expected backend/api/main.py, got {spec.origin}"
    
    def test_import_statement_uses_correct_path(self):
        """Test that main.py uses 'from api.routes import' instead of 'from routes import'.
        
        This is the core fix - ensuring the import statement is correct for Docker environment.
        """
        main_file = Path(backend_path) / "api" / "main.py"
        content = main_file.read_text()
        
        # Verify the correct import is used
        assert "from api.routes import" in content, \
            "main.py should use 'from api.routes import' for Docker compatibility"
        
        # Verify the incorrect import is NOT used
        assert "from routes import" not in content or "from api.routes import" in content.replace("from routes import", ""), \
            "main.py should not use 'from routes import' (old incorrect import)"
