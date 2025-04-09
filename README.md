# 🌦️ Windy - Frontend

## 🚀 Project Overview
This is the **frontend** of the Windy Weather App — a **serverless weather forecast application** that fetches real-time weather data using the OpenWeather API.  
It is built with vanilla **HTML, CSS, and JavaScript** and hosted on **AWS S3** (static site), or optionally via **AWS Amplify** with CI/CD enabled.

### 🌍 Live Demo
[🔗 Visit the Live App](#) *(Replace with your deployed URL)*

---

## 🏗️ Project Structure

```
/windy-frontend
├── index.html               # Entry page (Choose: Register, Login, Guest)
├── login.html               # User login form
├── register.html            # User registration form
├── dashboard_user.html      # Dashboard after login (DynamoDB-connected)
├── dashboard_guest.html     # Dashboard for guest users (no login)
├── assets/
│   ├── css/
│   │   └── styles.css        # Main CSS styles
│   └── js/
│       └── main.js           # JS logic (API calls, routing)
```

---

## ⚡ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Weather API**: [OpenWeatherMap](https://openweathermap.org/api)
- **Hosting**: AWS S3 + CloudFront (static)
- **Optional CI/CD**: GitHub Actions or AWS Amplify

---

## 🛠️ Installation & Local Preview

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_ORG/weather-app-frontend.git
cd weather-app-frontend
```

### 2️⃣ Open with Live Server (VSCode)

- Install **Live Server** extension in VSCode
- Right-click `index.html` > **Open with Live Server**

---

## 📦 Deployment Options

- **S3 Static Website Hosting** (with public access + bucket policy)
- **AWS Amplify Hosting** (CI/CD with GitHub connected)

---

## 🙌 Contributors

- Antonio (Team Lead)
- Mohit, Bilal (Frontend)
- Prateek (CI/CD, DB)
- Raj (Documentation & GitOps)

---

## 📄 License

This project is licensed under the MIT License — feel free to use it for educational purposes!
