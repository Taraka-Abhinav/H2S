# 🌿 EcoStep – Professional Scope 1, 2 & 3 Carbon Audit Platform

EcoStep is an **academic-grade full-stack carbon accounting platform** designed to calculate and track **personal and commercial transportation emissions** with high scientific accuracy.

Unlike traditional carbon calculators that rely on generic distance-based estimates, EcoStep prioritizes **fuel-based accounting** and derives actual fuel or electricity consumption whenever possible. The platform follows the **Tier 3 Fuel-Based Methodology** within a comprehensive **Well-to-Wheel (WTW)** emissions boundary framework.

---

## 🚀 Key Features

* ✅ Scope 1, Scope 2, and Scope 3 carbon accounting
* ✅ Tier 3 fuel-based emission calculations
* ✅ Well-to-Wheel (WTW) lifecycle assessment
* ✅ Support for gasoline, diesel, aviation fuel, and electricity
* ✅ Payload-adjusted fuel consumption modeling
* ✅ FastAPI backend with React + Tailwind frontend
* ✅ Scientifically referenced emission factors
* ✅ Personal and commercial transport auditing

---

# 📊 Scientific Framework

## 1. Well-to-Wheel (WTW) Boundary

EcoStep separates emissions into two distinct stages:

### Well-to-Tank (WTT)

Emissions generated during:

* Fuel extraction
* Refining
* Transportation
* Electricity generation and grid losses

### Tank-to-Wheel (TTW)

Direct emissions produced during vehicle operation and fuel combustion.

### Formula

```text
WTW Emission Factor = WTT Emission Factor + TTW Emission Factor
```

---

## 2. Tier 3 Fuel-Based Carbon Accounting

To account for multiple greenhouse gases including:

* Carbon Dioxide (CO₂)
* Methane (CH₄)
* Nitrous Oxide (N₂O)

EcoStep converts emissions into **Carbon Dioxide Equivalent (CO₂e)** using **IPCC AR5 100-Year Global Warming Potentials**.

### Formula

```text
Total CO₂e (kg) =
Σ [ Fuel Consumed (L or kWh) × WTW Emission Factor ]
```

---

## 3. Distance-Based Fuel Derivation

When direct fuel data is unavailable, EcoStep estimates fuel consumption using validated efficiency models.

### Formula

```text
Fuel Volume (L) =
(Distance (km) × Fuel Efficiency (L/100km)) / 100
```

This allows distance-only inputs to be converted into scientifically meaningful fuel-based emissions.

---

# 🧪 Emission Factors Reference

Emission factors are based on:

* UK DEFRA 2025 Guidelines
* US EPA Greenhouse Gas Emissions Hub

| Fuel Type             | TTW Factor (kg CO₂e/L) | WTT Factor (kg CO₂e/L) | Total WTW (kg CO₂e/L) |
| --------------------- | ---------------------- | ---------------------- | --------------------- |
| Gasoline (E10)        | 2.20311                | 0.61280                | 2.81591               |
| Diesel (B7)           | 2.51214                | 0.64150                | 3.15364               |
| Jet A-1 Aviation Fuel | 2.54000                | 0.78500                | 3.32500               |

### Electricity

| Energy Source             | TTW Factor | WTT Factor | Total WTW |
| ------------------------- | ---------- | ---------- | --------- |
| Electricity (kg CO₂e/kWh) | 0.00000    | 0.38550    | 0.38550   |

---

# 🏗️ Tech Stack

### Frontend

* React
* Tailwind CSS
* JavaScript

### Backend

* FastAPI
* Python
* Pydantic
* HTTPX
* Uvicorn

---

# ⚙️ Installation & Setup

## Backend (FastAPI)

### Create Virtual Environment

```bash
cd backend

python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install fastapi uvicorn httpx pydantic
```

### Run Backend

```bash
python main.py
```

---

## Frontend (React + Tailwind)

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run start
```

---

# 🎯 Mission

EcoStep aims to make **professional-grade carbon accounting accessible to everyone** by combining scientific rigor, transparent methodologies, and modern web technologies.

By using fuel-based calculations, lifecycle emission boundaries, and verified emission factors, EcoStep delivers results that are significantly more accurate than traditional distance-only carbon calculators.

---

**Built for sustainability, transparency, and data-driven climate action. 🌍**
