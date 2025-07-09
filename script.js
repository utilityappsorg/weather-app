async function getWeather() {
  const city = document.getElementById("cityInput").value;
  window.lastCity = city; // Save for unit toggle
  const apiKey = "d93ac9850368ef32ae6d5817e2826b26"; // Replace with your OpenWeatherMap API key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      document.getElementById("weatherResult").innerHTML = "City not found.";
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
  }
}

window.onload = function() {
  // Theme toggle
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("change", function() {
      document.body.classList.toggle("light-mode", this.checked);
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

  fetch(url)
    .then(response => {
      if (!response.ok) {
        document.getElementById("weatherResult").innerHTML = "Location not found.";
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
  document.body.classList.remove("sunny", "rainy", "cloudy", "night");
  document.getElementById("rainEffect").classList.remove("active");
  document.getElementById("snowEffect").classList.remove("active");

  if (isNight) {
    document.body.classList.add("night");
  } else if (weather === "Clear") {
    document.body.classList.add("sunny");
  } else if (weather === "Rain" || weather === "Drizzle" || weather === "Thunderstorm") {
    document.body.classList.add("rainy");
    document.getElementById("rainEffect").classList.add("active");
  } else if (weather === "Snow") {
    document.body.classList.add("cloudy");
    document.getElementById("snowEffect").classList.add("active");
  } else if (weather === "Clouds") {
    document.body.classList.add("cloudy");
  } else {
    document.body.classList.add("cloudy");
  }
}
