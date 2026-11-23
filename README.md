# AgriGuard AI – Real-Time Crop Disease Detection & Multilingual Voice Advisory Platform

**Final Year B.Tech AI & Data Science Capstone Project**

---

## 🌾 Project Overview
AgriGuard AI is an advanced, production-ready AI-powered SaaS application designed for modern agricultural monitoring and advisory. The system targets early disease diagnosis in major crops (Tomato, Potato, Corn, and Rice) using Deep Learning (CNNs), provides intelligent fertilizer recommendations based on soil N-P-K assays, delivers multilingual voice-based chatbot assistance, and lists online crop care ecommerce vendors along with geographic mapping of nearby local seed/fertilizer dealers.

---

## 🛠 Tech Stack
* **Frontend**: HTML5, CSS3 (Vanilla glassmorphic variables, dark/light modes), Bootstrap 5, JavaScript (ES6, AJAX, Chart.js for data visualization, and Google Maps API).
* **Backend**: Python Flask, Flask-SQLAlchemy.
* **Database**: MySQL (running locally on `localhost:3306`), with dynamic automatic failover to SQLite (`agriguard.db`) for out-of-the-box operation.
* **Machine Learning**:
  * **Computer Vision**: TensorFlow & Keras (CNN architecture detecting 12 healthy and diseased crop states).
  * **Soil Analytics**: Scikit-Learn (Random Forest Classifier trained on `Fertilizer Prediction.csv`).
* **Speech AI**: Browser-side Web Speech API (`webkitSpeechRecognition`) + Backend `gTTS` (Google Text-to-Speech) for audio read-outs.
* **Translation**: `deep-translator` package (Google Translate API wrapper).
* **Generative AI**: Google Gemini API (`google-generativeai`) with a robust rule-based advisory template engine fallback.

---

## 📂 Project Structure
```
AgriGuard AI/
├── app.py                      # Main Flask application server
├── config.py                   # App configurations (Database URL, API Keys)
├── models.py                   # SQLAlchemy database schemas
├── requirements.txt            # Python environment dependencies
├── database.sql                # MySQL schema definition script
├── train_disease_model.py      # Script to train CNN on synthetic leaf pattern dataset
├── train_fertilizer_model.py   # Script to train RF model on Fertilizer Prediction.csv
├── Fertilizer Prediction.csv   # Target fertilizer dataset (100,000 records)
├── README.md                   # Complete documentation and user manual
├── models/                     # Saved binary model models
│   ├── crop_disease_model.h5   # Trained CNN model file
│   ├── crop_disease_classes.pkl# Serialized CNN category names
│   ├── fertilizer_model.pkl    # Trained Random Forest classifier
│   └── fertilizer_encoders.pkl # Serialized Soil & Crop encoder objects
├── static/                     # Static media directories
│   ├── css/
│   │   └── style.css           # Global custom glassmorphism stylesheet
│   ├── js/
│   │   ├── main.js             # General theme, widgets and Speech API binds
│   │   └── dashboard.js        # Geolocation, Weather API binds and Chart.js
│   ├── uploads/                # Directory for uploaded leaf images
│   └── tts/                    # Directory for generated speech MP3 voice files
└── templates/                  # Jinja2 HTML templates
    ├── base.html               # Parent navigation header and footer
    ├── landing.html            # AI SaaS style landing page
    ├── login.html              # Farmer login page
    ├── register.html           # Farmer registration form
    ├── forgot_password.html    # Password update page
    ├── dashboard.html          # Main control panel containing weather & widgets
    ├── disease_detection.html  # Live leaf scanner (Webcam or upload)
    ├── fertilizer_recommender.html # Soil N-P-K recommendation dashboard
    ├── nearby_shops.html       # Google Maps locator for offline stores
    ├── profile.html            # Profile, preferred language and API key inputs
    ├── admin.html              # Admin statistics directory and user control
    └── report.html             # Print-friendly lab diagnostic report
```

---

## ⚙ Installation & Configuration Guide

### Prerequisites
1. **Python 3.10+** registered in PATH.
2. **MySQL Server** (optional; the application will automatically configure and run on SQLite if MySQL is not running).

### Setup Steps
1. **Clone or Navigate to Project Directory**
   Ensure your workspace path is set to the folder containing this code:
   ```bash
   cd "c:\Users\GSR\OneDrive\Desktop\AgriGuard AI"
   ```

2. **Create and Activate a Virtual Environment (Recommended)**
   ```bash
   py -m venv venv
   venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   py -m pip install -r requirements.txt
   ```

4. **Train Machine Learning Models**
   Run the respective training scripts. These scripts serialize and save model files to the `models/` folder:
   * **Fertilizer RF Classifier**:
     ```bash
     py train_fertilizer_model.py
     ```
   * **Crop Disease CNN**:
     ```bash
     py train_disease_model.py
     ```

5. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   SECRET_KEY=agriguard_secret_key_2026_btech
   DB_USER=root
   DB_PASSWORD=your_mysql_root_password
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=agriguard
   OPENWEATHER_API_KEY=your_openweather_key
   GEMINI_API_KEY=your_gemini_key
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```
   *Note: If no database credentials are supplied or MySQL cannot be reached, the application will automatically initialize a local SQLite file `agriguard.db` instead.*

6. **Launch the Server**
   Start the Flask application:
   ```bash
   py app.py
   ```
   The application will boot at **`http://localhost:5000`**.

---

## 🔑 Default Credentials
* **Administrator Panel**:
  * **Username**: `admin`
  * **Password**: `admin123`
  * **URL**: `http://localhost:5000/admin`
* *Note: Farmers can sign up for new accounts directly on the landing page.*

---

## 🔒 Verification & Testing Checklist
1. **Aesthetics & Modes**: Load the landing page at `http://localhost:5000`. Toggle the moon icon at the top right to verify transition to light mode and back to dark mode.
2. **User Authentication**: Register a new farmer. Fill out profile details (e.g. choose language as Hindi or Telugu). Logout and re-login to verify user session persistence.
3. **Weather Intelligence**: Geolocation coordinates will trigger immediately on dashboard loading, outputting temperature, humidity, rain logs, and dynamic, translated AI alerts.
4. **Leaf Scanning**: Upload a leaf photo on the Scanner tab or capture a photo using your Webcam. Check the output detail boxes (symptoms, causes), play the voice advisory, and click the PDF button to trigger the print dialog page.
5. **Soil Advice**: Open the Fertilizer page, input NPK soil ratings, check recommended fertilizers and online purchase links.
6. **Voice chatbot**: Open the floating assistant widget at the bottom right. Click the microphone, speak into it, and verify that it transcribes, responds, and speaks back in your selected local language.
