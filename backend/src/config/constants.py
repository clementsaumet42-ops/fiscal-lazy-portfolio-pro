"""
Configuration constants for the application.
"""

# Portfolio allocation thresholds for recommendations
ALLOCATION_THRESHOLD_PEA = 0.30  # 30% minimum recommended for PEA
ALLOCATION_THRESHOLD_AV = 0.20   # 20% minimum recommended for Assurance-Vie

# Diversification scoring
DIVERSIFICATION_MAX_CLASSES = 8  # Maximum number of asset classes for perfect diversification

# Eligibility thresholds (CGI)
PEA_ACTIONS_THRESHOLD = 75.0     # ≥75% actions UE required for PEA eligibility
IS_OPCVM_THRESHOLD = 90.0        # ≥90% actions required for IS OPCVM Actions

# Fiscal rates
FLAT_TAX_RATE = 0.30             # 30% (12.8% IR + 17.2% PS)
PRELEVEMENTS_SOCIAUX = 0.172     # 17.2%
PEA_PS_RATE = 0.172              # PEA >5 ans: 17.2% PS only

# ETF universe path (can be overridden with environment variable ETF_UNIVERSE_PATH)
DEFAULT_ETF_UNIVERSE_PATH = "data/etfs/universe.json"
