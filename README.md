# 🏆 Premier Tournament 2026 - Simple & Clean Dashboard

Ek simple, readable aur modern sports tournament management website jisme clean HTML, simple CSS aur aasaan JavaScript ka upyog kiya gaya hai.

---

## 📁 File Structure (Super Simple - Option 1)

```text
tournament/
├── index.html        # Simple, readable HTML layout
├── style.css         # Modern, clean CSS styles (Single CSS file)
├── script.js         # Easy-to-understand tournament logic (Single JS file)
└── README.md         # Documentation
```

Koi duplicate file ya extra folder nahi hai! Sirf 3 main files me poora project chalta hai.

---

## ✨ Features (Kya-kya features hain)

1. **📊 Dynamic Points Table (Standings)**:
   - Matches khele jaane par Played ($P$), Won ($W$), Draw ($D$), Loss ($L$), Goals For ($GF$), Goals Against ($GA$), Goal Difference ($GD$), aur Points ($PTS$) automatically calculate hote hain.
   - Top 2 qualifiers highlight hote hain.

2. **⚔️ Match Fixtures & Results**:
   - Sabhi matches ki list with team icons aur live scores.
   - Filter options: **All**, **Finished**, **Upcoming**.
   - Kisi bhi match ka score **"Edit Score"** button daba kar change kar sakte hain.

3. **🎲 Quick Simulator**:
   - **"Simulate Next Match"** button dabate hi unplayed match ka realistic score generate ho jata hai aur Points Table turant update ho jati hai.

4. **➕ Add Match Fixture**:
   - Naye matches schedule karne ke liye simple popup form.

5. **🛡️ Teams Showcase**:
   - Sabhi participating teams ke cards with city, played matches aur points.

6. **💾 LocalStorage & Reset**:
   - Browser refresh karne par data save rehta hai.
   - **"Reset"** button dabakar tournament ko default state me wapas laa sakte hain.

---

## 🚀 How to Run Locally

Kisi bhi browser me `index.html` double-click karke open karein ya python server chalayein:

```bash
python -m http.server 3000
```
Open `http://localhost:3000` in your browser.
