from setuptools import setup, find_packages

setup(
    name="fiscal-lazy-portfolio-pro",
    version="1.0.0",
    description="B2B Platform for French Accountants - Tax Optimization & Asset Allocation",
    author="Fiscal Lazy Portfolio Pro Team",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.11",
    install_requires=[
        "fastapi>=0.109.0",
        "uvicorn[standard]>=0.27.0",
        "pydantic>=2.5.3",
        "sqlalchemy>=2.0.25",
        "yfinance>=0.2.36",
        "pandas>=2.1.4",
        "numpy>=1.26.3",
        "scipy>=1.11.4",
    ],
)
