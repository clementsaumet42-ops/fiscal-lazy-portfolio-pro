from .clients import router as clients_router
from .portfolios import router as portfolios_router
from .optimization import router as optimization_router
from .backtests import router as backtests_router
from .compliance import router as compliance_router
from .providers import router as providers_router

__all__ = [
    "clients_router",
    "portfolios_router",
    "optimization_router",
    "backtests_router",
    "compliance_router",
    "providers_router"
]
