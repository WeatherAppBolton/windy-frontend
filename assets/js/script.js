// Lambda URLs for different functions
const weatherLambdaUrl = 'https://qhn8b1r3k7.execute-api.eu-north-1.amazonaws.com/prod/weather';  // Fetch weather
const saveFavUrl = 'https://your-save-fav-lambda-url';  // Save favorite cities
const updateUserUrl = 'https://your-update-user-lambda-url';  // Update user info

// Scroll Event for Parallax Effect
document.addEventListener('DOMContentLoaded', () => {
  const text = document.getElementById('text');
  const text1 = document.getElementById('text1');
  const leaf = document.getElementById('leaf');
  const hill1 = document.getElementById('hill1');
  const hill4 = document.getElementById('hill4');
  const hill5 = document.getElementById('hill5'); 

  window.addEventListener('scroll', () => {
      const value = window.scrollY; // Get current scroll position

      // Apply transformations based on the scroll position
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


// Fetch weather data based on latitude and longitude
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

// Function to get the user’s location
function getLocation() {
    if (localStorage.getItem('userLocation')) {
        const savedLocation = JSON.parse(localStorage.getItem('userLocation'));
        fetchWeather(savedLocation.lat, savedLocation.lon); // Use stored coordinates
    } else {
        if (navigator.geolocation) {
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
}

// Function to handle city search
function searchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) {
        alert("Please enter a city name.");
        return;
    }
    window.location.href = `page2.html?city=${encodeURIComponent(city)}`;
}

// Function to display the weather data
function displayWeather(data) {
    document.getElementById("weather").innerHTML = `
        <h3>${data.city}, ${data.country}</h3>
        <p>🌡️ ${data.temp}°C</p>
        <p>🌬️ ${data.wind_speed} m/s</p>
        <p>☁️ ${data.condition}</p>`;
}

// Function to apply temperature-based background theme
function applyTemperatureTheme(temp) {
    const body = document.body;
    if (temp < 10) {
        body.style.background = "linear-gradient(135deg, #83a4d4, #b6fbff)";
    } else if (temp >= 10 && temp <= 20) {
        body.style.background = "linear-gradient(135deg, #43cea2, #185a9d)";
    } else if (temp > 20 && temp <= 30) {
        body.style.background = "linear-gradient(135deg, #f6d365, #fda085)";
    } else {
        body.style.background = "linear-gradient(135deg, #f83600, #f9d423)";
    }
}

// Function to get weather icon based on condition
function getWeatherIcon(condition = "") {
    condition = condition.toLowerCase();
    if (condition.includes("cloud")) return "☁️";
    if (condition.includes("rain")) return "🌧️";
    if (condition.includes("sun") || condition.includes("clear")) return "☀️";
    if (condition.includes("snow")) return "❄️";
    if (condition.includes("storm") || condition.includes("thunder")) return "⛈️";
    return "🌈";
}

// Function to handle search and weather display in Dashboard
function checkWeather() {
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

// Saving cities to localStorage with drag functionality
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

// Add drag-and-drop events to the list items
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

// Remove a city from the saved list
function removeFavorite(index) {
    saved.splice(index, 1);
    localStorage.setItem(getUserKey(), JSON.stringify(saved));
    renderSaved();
}

// Save a city to favorites (if valid)
function saveToFavorites() {
    if (!lastSearchedCity || saved.includes(lastSearchedCity) || saved.length >= 3) return;
    saved.push(lastSearchedCity);
    localStorage.setItem(getUserKey(), JSON.stringify(saved));
    renderSaved();

    // Call Lambda function to save the favorite city
    fetch(saveFavUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, city: lastSearchedCity })
    })
    .then(res => res.json())
    .then(data => {
        alert(`⭐ '${lastSearchedCity}' saved to favorites!`);
        saveFavBtn.style.display = "none";
    })
    .catch(error => {
        console.error("Error saving to favorites", error);
        alert('⚠️ Unable to save city to favorites.');
    });
}

// Profile update logic
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

    // Call Lambda function to update user profile
    fetch(updateUserUrl, {
      method: 'POST',
           headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            alert("Profile updated successfully!");
        })
        .catch(error => {
            console.error("Error updating profile", error);
            alert("⚠️ Unable to update profile.");
        });
    }