# Pokémon TCG Pack Simulator

A web application that simulates Pokémon TCG booster pack openings with realistic odds. Users can explore single or bulk pack openings, track collection value, and analyze ROI across multiple sets.

---

## Features

- Simulate **single** or **bulk** pack openings
- **Slow reveal**, **open until value**, and **open until card** modes
- ROI and cost visualizations to evaluate spending versus card value
- Supports **15+ TCG sets** with 250+ cards per set
- Fetches and categorizes cards from the **Pokémon TCG API**

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend/Utilities:** Node.js for simulation logic
- **Data:** Pokémon TCG API + JSON datasets
- **Deployment:** Vercel / Netlify (optional)

---

## Demo

*(Add a GIF or screenshots here. Example:)*

![Pack Opening Demo](src/assets/demo.gif)

---

## Installation & Usage

Run the following commands in your terminal to set up and run the project locally:

```bash
# Clone the repository
git clone https://github.com/Vhalwan/pokemon-tcg-pack-simulator.git

# Navigate into the project folder
cd pokemon-tcg-pack-simulator

# Install dependencies
npm install

# Start the development server
npm run dev

# Open your browser at:
# http://localhost:5173
