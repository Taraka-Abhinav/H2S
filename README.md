EcoStep: Professional Scope 1, 2 & 3 Carbon Audit Platform 🌿

An academic-grade, full-stack application built to track and calculate personal and commercial transport emissions with maximum mathematical precision. It uses the Tier 3 Fuel-Based Method under a comprehensive Well-to-Wheel (WTW) boundary framework.

📊 Scientific Framework & Mathematical Models

EcoStep completely avoids generic distance-based proxies, instead prioritizing direct fuel metrics or deriving exact fuel/electricity volume from raw travel streams.

1. The Well-to-Wheel (WTW) Boundary

Every calculation separates emissions into:

Well-to-Tank (WTT): Upstream emissions from fuel extraction, refining, transport, and grid distribution losses.

Tank-to-Wheel (TTW): Direct tailpipe emissions from combustion during vehicle operation.

$$\text{WTW Emission Factor } (EF_{\text{WTW}}) = EF_{\text{WTT}} + EF_{\text{TTW}}$$

2. Tier 3 Fuel-Based Equation

To account for $CO_2$, $CH_4$, and $N_2O$, we compute Carbon Dioxide Equivalents ($CO_2e$) using IPCC AR5 100-year Global Warming Potentials:

$$\text{Total } CO_2e \text{ (kg)} = \sum \left[ \text{Fuel Consumed } (L \text{ or } kWh) \times EF_{\text{WTW, i}} \right]$$

3. Derived Fuel Volume (Distance Fallback)

If the user provides only distance, EcoStep applies payload-adjusted consumption curves to derive the raw fuel volume:

$$\text{Fuel Volume (L)} = \left( \frac{\text{Distance (km)} \times \text{Fuel Efficiency (L/100km)}}{100} \right)$$

🧪 Emission Factors (EF) Reference Table

All calculations in the FastAPI backend utilize the following vetted values (UK DEFRA 2025 & US EPA GHG Hub):

Fuel Type

TTW Factor ($kg\ CO_2e/L$)

WTT Factor ($kg\ CO_2e/L$)

Total WTW ($kg\ CO_2e/L$)

Gasoline (E10)

$2.20311$

$0.61280$

$2.81591$

Diesel (B7)

$2.51214$

$0.64150$

$3.15364$

Jet A-1 Aviation

$2.54000$

$0.78500$

$3.32500$

Electricity ($kg\ CO_2e/kWh$)

$0.00000$ (Tailpipe)

$0.38550$ (Grid WTW)

$0.38550$

🛠️ Installation & Setup

Backend (FastAPI)

Initialize Python environment:

cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn httpx pydantic


Start the service:

python main.py


Frontend (React & Tailwind)

Install dependencies and start:

npm install
npm run start
