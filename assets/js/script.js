// Lambda URLs for different functions
const weatherLambdaUrl = 'https://qhn8b1r3k7.execute-api.eu-north-1.amazonaws.com/prod/weather';
const saveFavUrl = 'https://your-save-fav-lambda-url';
const updateUserUrl = 'https://your-update-user-lambda-url';

const username = localStorage.getItem("username") || "User";
const userEmail = localStorage.getItem("loggedInUser");
let saved = JSON.parse(localStorage.getItem(getUserKey()) || "[]");
let lastSearchedCity = "";


// In script.js



// Global helper functions
function applyTemperatureTheme(temp) {
  const body = document.body;
  if (temp < 10) {
    body.style.background = "linear-gradient(135deg, #83a4d4, #b6fbff)";
  } else if (temp <= 20) {
    body.style.background = "linear-gradient(135deg, #43cea2, #185a9d)";
  } else if (temp <= 30) {
    body.style.background = "linear-gradient(135deg, #f6d365, #fda085)";
  } else {
    body.style.background = "linear-gradient(135deg, #f83600, #f9d423)";
  }
}

function getWeatherIcon(condition = "") {
  condition = condition.toLowerCase();
  if (condition.includes("cloud")) return "☁️";
  if (condition.includes("rain")) return "🌧️";
  if (condition.includes("sun") || condition.includes("clear")) return "☀️";
  if (condition.includes("snow")) return "❄️";
  if (condition.includes("storm") || condition.includes("thunder")) return "⛈️";
  return "🌈";
}

function getUserKey() {
  return `savedCities_${userEmail}`;
}

// Scroll animation (only runs if elements exist)
document.addEventListener('DOMContentLoaded', () => {
  const text = document.getElementById('text');
  const text1 = document.getElementById('text1');
  const leaf = document.getElementById('leaf');
  const hill1 = document.getElementById('hill1');
  const hill4 = document.getElementById('hill4');
  const hill5 = document.getElementById('hill5');

  window.addEventListener('scroll', () => {
    const value = window.scrollY;
    if (text) text.style.marginTop = value * 2.5 + 'px';
    if (text1) text1.style.marginTop = value * 2.5 + 'px';
    if (leaf) {
      leaf.style.top = value * -1.5 + 'px';
      leaf.style.left = value * 1.5 + 'px';
    }
    if (hill5) hill5.style.left = value * 1.5 + 'px';
    if (hill4) hill4.style.left = value * -1.5 + 'px';
    if (hill1) hill1.style.top = value * 1 + 'px';
  });
});

function fetchWeather(lat, lon) {
  fetch(`${weatherLambdaUrl}?lat=${lat}&lon=${lon}`)
    .then(res => {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(data => {
      displayWeather(data);
    })
    .catch(() => {
      document.getElementById("weather").textContent = 'Unable to retrieve weather data.';
    });
}

function getLocation() {
  if (localStorage.getItem('userLocation')) {
    const savedLocation = JSON.parse(localStorage.getItem('userLocation'));
    fetchWeather(savedLocation.lat, savedLocation.lon);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const location = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      localStorage.setItem('userLocation', JSON.stringify(location));
      fetchWeather(location.lat, location.lon);
    }, () => {
      document.getElementById("weather").textContent = 'Location access denied.';
    });
  } else {
    document.getElementById("weather").textContent = 'Geolocation not supported.';
  }
}


function displayWeather(data) {
  document.getElementById("weather").innerHTML = `
    <h3>${data.city}, ${data.country}</h3>
    <p>🌡️ ${data.temp}°C</p>
    <p>🌬️ ${data.wind_speed} m/s</p>
    <p>☁️ ${data.condition}</p>`;
}

function checkWeather() {
  const cityInput = document.getElementById("cityInput");
  const weatherResult = document.getElementById("weatherResult");
  const saveFavBtn = document.getElementById("saveFavBtn");
  if (!cityInput || !weatherResult || !saveFavBtn) return;

  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a city.");

  fetch(`${weatherLambdaUrl}?location=${city}`)
    .then(res => res.json())
    .then(data => {
      const icon = getWeatherIcon(data.condition);
      weatherResult.innerHTML = `<div style="font-size: 1.2rem;">${icon} <strong>${city}</strong>: <strong>${data.temperature}°C</strong> - ${data.condition || ''}</div>`;
      saveFavBtn.style.display = saved.length < 3 && !saved.includes(city) ? "inline-block" : "none";
      lastSearchedCity = city;
    })
    .catch(() => {
      weatherResult.innerHTML = `<span style='color:#ffdddd;'>⚠️ City not found.</span>`;
      saveFavBtn.style.display = "none";
    });
}

function renderSaved() {
  const savedCitiesEl = document.getElementById("savedCities");
  const favCountEl = document.getElementById("favCount");
  if (!savedCitiesEl || !favCountEl) return;

  savedCitiesEl.innerHTML = "";
  favCountEl.textContent = `${saved.length}/3`;

  saved.forEach((city, i) => {
    fetch(`${weatherLambdaUrl}?location=${city}`)
      .then(res => res.json())
      .then(data => {
        const icon = getWeatherIcon(data.condition);
        const li = document.createElement("li");
        li.className = "fav-item";
        li.setAttribute("draggable", "true");
        li.setAttribute("data-index", i);
        li.innerHTML = `
          ${icon} <strong>${city}</strong>: ${data.temperature}°C - ${data.condition || ''}
          <button class="remove-btn" onclick="removeFavorite(${i})">✖</button>
        `;
        addDragEvents(li);
        savedCitiesEl.appendChild(li);
      });
  });
}

function addDragEvents(el) {
  el.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", e.target.dataset.index));
  el.addEventListener("dragover", e => { e.preventDefault(); e.target.style.background = "rgba(255,255,255,0.25)"; });
  el.addEventListener("dragleave", e => e.target.style.background = "");
  el.addEventListener("drop", e => {
    e.preventDefault();
    e.target.style.background = "";
    const from = +e.dataTransfer.getData("text/plain");
    const to = +e.target.closest("li").dataset.index;
    if (from === to || isNaN(from) || isNaN(to)) return;
    const moved = saved.splice(from, 1)[0];
    saved.splice(to, 0, moved);
    localStorage.setItem(getUserKey(), JSON.stringify(saved));
    renderSaved();
  });
}

function removeFavorite(index) {
  saved.splice(index, 1);
  localStorage.setItem(getUserKey(), JSON.stringify(saved));
  renderSaved();
}

function saveToFavorites() {
  if (!lastSearchedCity || saved.includes(lastSearchedCity) || saved.length >= 3) return;
  saved.push(lastSearchedCity);
  localStorage.setItem(getUserKey(), JSON.stringify(saved));
  renderSaved();

  fetch(saveFavUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail, city: lastSearchedCity })
  })
  .then(res => res.json())
  .then(() => {
    alert(`⭐ '${lastSearchedCity}' saved to favorites!`);
    const saveFavBtn = document.getElementById("saveFavBtn");
    if (saveFavBtn) saveFavBtn.style.display = "none";
  })
  .catch(error => {
    console.error("Error saving to favorites", error);
    alert('⚠️ Unable to save city to favorites.');
  });
}

function updateProfile() {
  const newName = document.getElementById("editName")?.value.trim();
  const newEmail = document.getElementById("editEmail")?.value.trim().toLowerCase();
  const currentEmail = localStorage.getItem("loggedInUser");

  if (!currentEmail || currentEmail === "guest") {
    alert("⚠️ Profile updates are only available for registered users.");
    return;
  }

  const userKey = `user_${currentEmail}`;
  const storedUser = localStorage.getItem(userKey);
  if (!storedUser) {
    alert("⚠️ User not found.");
    return;
  }

  const userObj = JSON.parse(storedUser);
  if (newName) {
    userObj.name = newName;
    localStorage.setItem("username", newName);
    const nameEl = document.getElementById("username");
    if (nameEl) nameEl.innerText = newName;
  }

  if (newEmail && newEmail !== currentEmail) {
    if (localStorage.getItem(`user_${newEmail}`)) {
      alert("⚠️ This email is already registered with another account.");
      return;
    }
    localStorage.setItem(`user_${newEmail}`, JSON.stringify(userObj));
    localStorage.removeItem(userKey);
    localStorage.setItem("loggedInUser", newEmail);
  } else {
    localStorage.setItem(userKey, JSON.stringify(userObj));
  }

  fetch(updateUserUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => res.json())
  .then(() => alert("Profile updated successfully!"))
  .catch(error => {
    console.error("Error updating profile", error);
    alert("⚠️ Unable to update profile.");
  });
}

function continueAsGuest() {
  const userName = document.getElementById("username")?.value.trim();
  const userLocation = document.getElementById("location")?.value.trim();

  if (!userName || !userLocation) {
    alert('Please fill in both fields.');
    return;
  }

  localStorage.setItem("username", userName);
  localStorage.setItem("location", userLocation);
  localStorage.setItem("loggedInUser", `guest_${Date.now()}`);
  window.location.href = "page2.html";
}

// ---------- Guest Dashboard Logic ----------
// ✅ Utility to extract query parameter from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  // ✅ This runs ONLY on guest_dashboard.html
  function initGuestDashboard() {
    const lambdaUrl = "https://j69ymxtksk.execute-api.eu-north-1.amazonaws.com/prod/weather";
    const username = localStorage.getItem("username") || "Guest";
    const city = getQueryParam("location");  // <-- fetch city from URL
  
    const greeting = document.getElementById("greeting");
  
    if (!greeting) return;
  
    if (!city) {
      greeting.innerHTML = "⚠️ Could not determine city from URL.";
      return;
    }
  
    // ✅ Call Lambda (which uses OpenWeatherMap)
    fetch(`${lambdaUrl}?location=${city}`)
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        const temp = data.temperature;
        const condition = data.condition;
        const icon = getWeatherIcon(condition);
  
        greeting.innerHTML = `
          <h2>👋 Hello, <span class="highlight">${username}</span>!</h2>
          <p>Weather in <strong>${data.location}</strong>:</p>
          <p style="font-size: 1.8rem;">${icon} <strong>${temp}°C</strong></p>
          <p><em>${condition}</em></p>
        `;
        applyTemperatureTheme(temp);
      })
      .catch(error => {
        greeting.innerHTML = `<div class="error-message">⚠️ Error: ${error.message}</div>`;
      });
  }
  
  // ✅ Automatically run this on guest_dashboard.html only
  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "weather") {
      initGuestDashboard();
    }
  });  
    
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "weather") {
    initGuestDashboard();
  }
  renderSaved();
  setInterval(renderSaved, 5 * 60 * 1000);
});
