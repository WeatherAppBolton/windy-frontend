// Updated script.js with bug fixes, improved UX, per-user storage and better drag handling

const lambdaUrl = "https://j69ymxtksk.execute-api.eu-north-1.amazonaws.com/weather";
const username = localStorage.getItem("username") || "User";
const userEmail = localStorage.getItem("loggedInUser");
document.getElementById("username").innerText = username;

const cityInput = document.getElementById("city");
const savedCitiesEl = document.getElementById("savedCities");
const weatherResult = document.getElementById("weatherResult");
const saveFavBtn = document.getElementById("saveFavBtn");
const favCountEl = document.getElementById("favCount");
let lastSearchedCity = "";

function getUserKey() {
  return `savedCities_${userEmail}`;
}

let saved = JSON.parse(localStorage.getItem(getUserKey()) || "[]");

function getIcon(condition = "") {
  condition = condition.toLowerCase();
  if (condition.includes("cloud")) return "☁️";
  if (condition.includes("rain")) return "🌧️";
  if (condition.includes("sun") || condition.includes("clear")) return "☀️";
  if (condition.includes("snow")) return "❄️";
  if (condition.includes("storm") || condition.includes("thunder")) return "⛈️";
  return "🌈";
}

function renderSaved() {
    const savedCitiesEl = document.getElementById("savedCities");
    const favCountEl = document.getElementById("favCount");
    if (!savedCitiesEl || !favCountEl) return;
  
    savedCitiesEl.innerHTML = "";
    favCountEl.textContent = `${saved.length}/3`;
  
    saved.forEach((city, i) => {
      fetch(`${lambdaUrl}?location=${city}`)
        .then(res => res.json())
        .then(data => {
          const icon = getIcon(data.condition);
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
  el.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", e.target.dataset.index);
  });

  el.addEventListener("dragover", e => {
    e.preventDefault();
    e.target.style.background = "rgba(255,255,255,0.25)";
  });

  el.addEventListener("dragleave", e => {
    e.target.style.background = "";
  });

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

function checkWeather() {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a city.");
  fetch(`${lambdaUrl}?location=${city}`)
    .then(res => res.json())
    .then(data => {
      const icon = getIcon(data.condition);
      weatherResult.innerHTML = `<div style="font-size: 1.2rem;">${icon} <strong>${city}</strong>: <strong>${data.temperature}°C</strong> - ${data.condition || ''}</div>`;
      saveFavBtn.style.display = saved.length < 3 && !saved.includes(city) ? "inline-block" : "none";
      lastSearchedCity = city;
    })
    .catch(() => {
      weatherResult.innerHTML = `<span style='color:#ffdddd;'>⚠️ City not found.</span>`;
      saveFavBtn.style.display = "none";
    });
}

function saveToFavorites() {
  if (!lastSearchedCity || saved.includes(lastSearchedCity) || saved.length >= 3) return;
  saved.push(lastSearchedCity);
  localStorage.setItem(getUserKey(), JSON.stringify(saved));
  renderSaved();
  alert(`⭐ '${lastSearchedCity}' saved to favorites!`);
  saveFavBtn.style.display = "none";
}

function updateProfile() {
    const newName = document.getElementById("editName").value.trim();
    const newEmail = document.getElementById("editEmail").value.trim().toLowerCase();
  
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
      document.getElementById("username").innerText = newName;
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
  
    alert("✅ Profile updated successfully!");
  }
  

  function changeTheme() {
    const select = document.getElementById("themeSelect");
    if (!select) return; // Prevent error if element doesn't exist
  
    const theme = select.value;
    switch (theme) {
      case "sunset":
        document.body.style.setProperty('--bg-gradient', 'linear-gradient(to top, rgb(214, 125, 31), rgb(4, 5, 4))');
        localStorage.setItem("theme", "sunset");
        break;
      case "night":
        document.body.style.setProperty('--bg-gradient', 'linear-gradient(to top, rgb(0, 5, 13), rgb(13, 13, 14))');
        localStorage.setItem("theme", "night");
        break;
      default:
        document.body.style.setProperty('--bg-gradient', 'linear-gradient(to top, rgb(101, 127, 188), rgb(38, 53, 188))');
        localStorage.setItem("theme", "default");
    }
  }
  

function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "default";
    const themeSelect = document.getElementById("themeSelect");
    if (themeSelect) {
      themeSelect.value = savedTheme;
    }
    changeTheme(); // Still safe to run with added check
  }
  
function logoutUser() {
  localStorage.removeItem("username");
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

function continueAsGuest() {
  const userName = document.getElementById("username").value.trim();
  const userLocation = document.getElementById("location").value.trim();

  if (!userName || !userLocation) {
    alert('Please fill in both fields.');
    return;
  }

  localStorage.setItem("username", userName);
  localStorage.setItem("location", userLocation);
  localStorage.setItem("loggedInUser", `guest_${Date.now()}`);

  window.location.href = "page2.html";
}

renderSaved();
loadTheme();
setInterval(renderSaved, 5 * 60 * 1000);
