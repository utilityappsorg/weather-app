async function getWeather() {
  const city = document.getElementById("cityInput").value;

  window.lastCity = city; // Save for unit toggle
  const apiKey = "d93ac9850368ef32ae6d5817e2826b26"; // Replace with your OpenWeatherMap API key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`;

  showLoading();
  try {
    const response = await fetch(url);
    if (!response.ok) {
      document.getElementById("weatherResult").innerHTML = "City not found.";
      hideLoading();
      return;
    }

    const data = await response.json();
    const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
    const weatherHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <p><strong>Temperature:</strong> ${data.main.temp}${unitSymbol}</p>
      <p><strong>Weather:</strong> ${data.weather[0].main}</p>
      <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
      <p><strong>Wind:</strong> ${data.wind.speed} m/s</p>
    `;
    document.getElementById("weatherResult").innerHTML = weatherHTML;

    const weatherMain = data.weather[0].main;
    const isNight = data.dt < data.sys.sunrise || data.dt > data.sys.sunset;
    setWeatherBackground(weatherMain, isNight);
  } catch (error) {
    document.getElementById("weatherResult").innerHTML = "An error occurred.";
    console.error("Error fetching weather data:", error);
  } finally {
    hideLoading();
  }
}

window.onload = function() {
  // Theme toggle
  const themeToggle = document.getElementById("themeToggle");
  const slider = document.querySelector('.switch .slider');
  if (themeToggle && slider) {
    // Ensure slider is clickable
    slider.addEventListener('click', function() {
      themeToggle.checked = !themeToggle.checked;
      document.body.classList.toggle("dark-mode", themeToggle.checked);
      document.querySelector('.weather-app').classList.toggle("dark-mode", themeToggle.checked);
    });
    // Sync toggle if checkbox is changed (keyboard, etc)
    themeToggle.addEventListener("change", function() {
      document.body.classList.toggle("dark-mode", this.checked);
      document.querySelector('.weather-app').classList.toggle("dark-mode", this.checked);
    });
  }

  // Geolocation code...
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
      },
      function(error) {
        console.log("Geolocation error:", error);
      }
    );
  } else {
    console.log("Geolocation not supported.");
  }
};

function getWeatherByCoords(lat, lon) {
  window.lastCoords = { lat, lon }; // Save for unit toggle
  const apiKey = "d93ac9850368ef32ae6d5817e2826b26"; // Replace with your OpenWeatherMap API key
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`;

  showLoading();
  fetch(url)
    .then(response => {
      if (!response.ok) {
        document.getElementById("weatherResult").innerHTML = "Location not found.";
        hideLoading();
        return;
      }
      return response.json();
    })
    .then(data => {
      if (!data) return;
      const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
      const weatherHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p><strong>Temperature:</strong> ${data.main.temp}${unitSymbol}</p>
        <p><strong>Weather:</strong> ${data.weather[0].main}</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind:</strong> ${data.wind.speed} m/s</p>
      `;
      document.getElementById("weatherResult").innerHTML = weatherHTML;

      const weatherMain = data.weather[0].main;
      const isNight = data.dt < data.sys.sunrise || data.dt > data.sys.sunset;
      setWeatherBackground(weatherMain, isNight);
    })
    .catch(error => {
      document.getElementById("weatherResult").innerHTML = "An error occurred.";
      console.error("Error fetching weather data:", error);
    })
    .finally(() => {
      hideLoading();
    });
}

let currentUnit = "metric"; // "metric" for °C, "imperial" for °F

document.addEventListener("DOMContentLoaded", function() {
  const unitToggle = document.getElementById("unitToggle");
  const unitLabel = document.getElementById("unitLabel");
  if (unitToggle) {
    unitToggle.addEventListener("change", function() {
      currentUnit = this.checked ? "imperial" : "metric";
      unitLabel.textContent = this.checked ? "Show °C" : "Show °F";
      // Refresh weather if already loaded
      if (window.lastCity) getWeather();
      if (window.lastCoords) getWeatherByCoords(window.lastCoords.lat, window.lastCoords.lon);
    });
  }
});

function setWeatherBackground(weather, isNight) {
  console.log("Raw weather input:", weather);

  // Normalize
  weather = weather.charAt(0).toUpperCase() + weather.slice(1).toLowerCase();

  document.body.classList.remove("sunny", "rainy", "cloudy", "night");
  document.getElementById("rainEffect").classList.remove("active");
  document.getElementById("snowEffect").classList.remove("active");

  // Remove previous sun/rain elements
  const oldSun = document.querySelector('.sun');
  if (oldSun) oldSun.remove();
  const oldRain = document.querySelector('.rain');
  if (oldRain) oldRain.remove();

  if (isNight) {
    document.body.classList.add("night");
  } else if (weather === "Clear") {
    document.body.classList.add("sunny");
    const sun = document.createElement('div');
    sun.className = 'sun';
    document.querySelector('.weather-app').appendChild(sun);
  } else if (["Rain", "Drizzle", "Thunderstorm"].includes(weather)) {
    document.body.classList.add("rainy");
    document.getElementById("rainEffect").classList.add("active");
    const rain = document.createElement('div');
    rain.className = 'rain';
    for (let i = 0; i < 5; i++) {
      const drop = document.createElement('div');
      drop.className = 'drop';
      drop.style.animationDelay = `${i * 0.3}s`;
      rain.appendChild(drop);
    }
    document.querySelector('.weather-app').appendChild(rain);
  } else if (weather === "Snow") {
    document.body.classList.add("cloudy");
    document.getElementById("snowEffect").classList.add("active");
  } else if (weather === "Clouds") {
    document.body.classList.add("cloudy");
  } else if (
    ["Mist", "Fog", "Haze", "Smoke", "Dust", "Sand"].includes(weather)
  ) {
    document.body.classList.add("cloudy");
  } else {
    console.warn("Unrecognized weather type:", weather);
    document.body.classList.add("cloudy");
  }
}

function showLoading() {
  const loading = document.querySelector('.loading');
  if (loading) loading.style.display = 'block';
}

function hideLoading() {
  const loading = document.querySelector('.loading');
  if (loading) loading.style.display = 'none';
}