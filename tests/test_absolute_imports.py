import sys
from pathlib import Path
import pytest

# Add backend/src to path to simulate Docker environment
backend_path = str(Path(__file__).parent.parent / "backend")
src_path = str(Path(__file__).parent.parent / "backend" / "src")
sys.path.insert(0, backend_path)
sys.path.insert(0, src_path)


class TestAbsoluteImports:
    """Test that all backend/src modules use absolute imports and work in Docker environment."""
    
    def test_optimization_imports(self):
        """Test that optimization modules can be imported with absolute imports."""
        from optimization.asset_allocation import AssetAllocator, StrategieAllocation
        from optimization.asset_location import AssetLocator
        from optimization.lifecycle_investing import LifecycleInvestor
        from optimization.rebalancing import RebalancingEngine
        from optimization.withdrawal import WithdrawalOptimizer
        from optimization.tax_loss_harvesting import TaxLossHarvester
        
        assert AssetAllocator is not None
        assert AssetLocator is not None
        assert LifecycleInvestor is not None
        assert RebalancingEngine is not None
        assert WithdrawalOptimizer is not None
        assert TaxLossHarvester is not None
    
    def test_legal_imports(self):
        """Test that legal modules can be imported with absolute imports."""
        from legal.fiscal_rules import FiscalRules
        from legal.compliance_engine import ComplianceEngine
        
        assert FiscalRules is not None
        assert ComplianceEngine is not None
    
    def test_models_imports(self):
        """Test that models can be imported with absolute imports."""
        from models.enveloppe import EnveloppeType
        from models.etf import ETF
        
        assert EnveloppeType is not None
        assert ETF is not None
    
    def test_utils_imports(self):
        """Test that utils modules can be imported with absolute imports."""
        from utils.fiscal import FiscalUtils
        
        assert FiscalUtils is not None
    
    def test_data_imports(self):
        """Test that data modules can be imported with absolute imports."""
        from data.market_data import MarketDataProvider
        
        assert MarketDataProvider is not None
    
    def test_providers_imports(self):
        """Test that providers modules can be imported with absolute imports."""
        from providers.comparator import ProviderComparator
        
        assert ProviderComparator is not None
    
    def test_api_routes_imports(self):
        """Test that API routes can import all optimization modules."""
        from api.routes import optimization
        
        assert optimization is not None
        assert hasattr(optimization, 'router')
    
    def test_no_relative_imports_in_src(self):
        """Verify that no relative imports remain in backend/src/ files."""
        import glob
        
        src_dir = Path(__file__).parent.parent / "backend" / "src"
        python_files = glob.glob(str(src_dir / "**" / "*.py"), recursive=True)
        
        files_with_relative_imports = []
        
        for file_path in python_files:
            if "__pycache__" in file_path:
                continue
                
            with open(file_path, 'r') as f:
                lines = f.readlines()
                for i, line in enumerate(lines, 1):
                    # Check for relative imports (from . or from ..)
                    if line.strip().startswith("from .") and not line.strip().startswith("from ._"):
                        files_with_relative_imports.append((file_path, i, line.strip()))
        
        assert len(files_with_relative_imports) == 0, \
            f"Found relative imports in:\n" + "\n".join(
                f"{path}:{line_num} - {line}" 
                for path, line_num, line in files_with_relative_imports
            )
