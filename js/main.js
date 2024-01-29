document.addEventListener("DOMContentLoaded", function () {
  const apiKey = "3ad31ff726014559a2a20337242601";
  const inputText = document.getElementById("input_text");
  const searchButton = document.querySelector(".searchButton");

  searchButton.addEventListener("click", async function () {
    const city = inputText.value.trim();
    await updateWeather(city);
  });

  async function getWeather(city) {
    const currentUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
    const forecastUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=6`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
    ]);

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    const filteredForecast = forecastData?.forecast?.forecastday.slice(1) || [];

    return { current: currentData, forecast: filteredForecast };
  }

  function displayWeather(data) {
    const cityNameElement = document.querySelector(".cityName h1");
    const currentDateElement = document.querySelector(".day-info .day");
    const currentTempCElement = document.querySelector(
      ".day-info .temp .cel span"
    );
    const currentTempFElement = document.querySelector(
      ".day-info .temp .feh span"
    );
    const currentDescElement = document.querySelector(".day-info .desc p");
    const currentIconElement = document.getElementById("currentWeatherIcon");

    cityNameElement.textContent =
      data.current?.location?.name || "San Francisco";
    currentDateElement.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });
    currentTempCElement.textContent = data.current?.current?.temp_c || "N/A";
    currentTempFElement.textContent = data.current?.current?.temp_f || "N/A";
    currentDescElement.textContent =
      data.current?.current?.condition?.text || "N/A";

    const iconCode = data.current?.current?.condition?.icon;
    const iconUrl = `http:${iconCode}`;
    currentIconElement.innerHTML = `<img src="${iconUrl}" alt="Weather Icon">`;
  }

  function displayFiveDayForecast(forecast) {
    const forecastContainer = document.querySelector(".side-info");

    if (!forecastContainer) {
      console.error("Forecast container not found in the HTML");
      return;
    }

    forecastContainer.innerHTML = "";

    for (let i = 0; i < forecast.length; i++) {
      const dayForecast = forecast[i] || {};
      const dayElement = document.createElement("div");
      dayElement.classList.add("forecast-container");

      if (dayForecast) {
        const dayOfWeek = new Date(dayForecast.date).toLocaleDateString(
          "en-US",
          { weekday: "short" }
        );
        const forecastDate = new Date(dayForecast.date);
        const month = forecastDate.toLocaleDateString("en-US", {
          month: "short",
        });
        const dayOfMonth = forecastDate.getDate();

        const iconCode = dayForecast.day?.condition?.icon;
        const iconUrl = `http:${iconCode}`;

        dayElement.innerHTML = `
                    <img src="${iconUrl}" alt="Weather Icon">
                    <div class="forecast-des">
                        <span class="dayofWeek">${dayOfWeek}</span>
                        <span class="date">${dayOfMonth} ${month}</span>
                        <p class="f-temp"><span>${dayForecast.day?.maxtemp_c}</span> °C</p>
                    </div>`;
      }

      forecastContainer.appendChild(dayElement);
    }
  }

  function setupAutoComplete() {
    inputText.addEventListener(
      "input",
      debounce(async function () {
        const city = inputText.value.trim();

        if (city.length > 0) {
          const suggestions = await getAutoCompleteSuggestions(city);
          console.log("Suggestions:", suggestions);
        } else {
          console.log("Query is empty. No autocomplete suggestions.");
        }
      }, 300)
    );
  }

  async function getAutoCompleteSuggestions(query) {
    try {
      if (!query.trim()) {
        console.error("Error: Query is empty.");
        return [];
      }

      const apiUrl = `http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(
        query
      )}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
      return [];
    }
  }

  function saveLastLocation(location) {
    localStorage.setItem("lastLocation", location);
  }

  function loadLastLocation() {
    return localStorage.getItem("lastLocation") || "San Francisco";
  }

  function debounce(func, delay) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, delay);
    };
  }

  async function updateWeather(city) {
    try {
      const weatherData = await getWeather(city);

      if (
        weatherData &&
        weatherData.forecast &&
        weatherData.forecast.length > 0
      ) {
        console.log("Weather Data:", weatherData);
        displayWeather(weatherData);
        displayFiveDayForecast(weatherData.forecast);
        saveLastLocation(city);
      } else {
        throw new Error("Forecast data is missing or invalid");
      }
    } catch (error) {
      console.error(`Error updating weather: ${error.message}`);
    }
  }

  async function init() {
    const defaultLocation = loadLastLocation();
    const weatherData = await getWeather(defaultLocation);
    displayWeather(weatherData);
    displayFiveDayForecast(weatherData.forecast);
    setupAutoComplete();
  }

  init();
});
