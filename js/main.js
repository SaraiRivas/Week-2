document.addEventListener("DOMContentLoaded", async function () {
  const apiKey = "3ad31ff726014559a2a20337242601";
  const inputText = document.getElementById("input_text");
  const searchButton = document.querySelector(".searchButton");
  const suggestionsList = document.querySelector(".suggestions-list");

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

  async function setupAutoComplete() {
    inputText.addEventListener(
      "input",
      debounce(async function () {
        const city = inputText.value.trim();

        if (city.length > 0) {
          const suggestions = await getAutoCompleteSuggestions(city);
          displaySuggestions(suggestions);
        } else {
          suggestionsList.innerHTML = "";
        }
      }, 300)
    );
  }

  async function handleSearchButtonClick() {
    const city = inputText.value.trim();
    await updateWeather(city);
  }

  async function handleInputTextChange() {
    const city = inputText.value.trim();

    if (city.length > 0) {
      const suggestions = await getAutoCompleteSuggestions(city);
      displaySuggestions(suggestions);
    } else {
      console.log("Query is empty. No autocomplete suggestions.");
    }
  }

  function handleInputTextFocus() {
    suggestionsList.style.display = "block";
  }

  function handleInputTextBlur() {
    setTimeout(() => {
      suggestionsList.style.display = "none";
    }, 200);
  }

  function handleSuggestionsListClick(event) {
    if (event.target.tagName === "LI") {
      const selectedCity = event.target.textContent;
      inputText.value = selectedCity;
      suggestionsList.innerHTML = "";
      updateWeather(selectedCity);
    }
  }

  searchButton.addEventListener("click", handleSearchButtonClick);

  inputText.addEventListener("input", debounce(handleInputTextChange, 300));
  inputText.addEventListener("focus", handleInputTextFocus);
  inputText.addEventListener("blur", handleInputTextBlur);

  if (suggestionsList) {
    suggestionsList.addEventListener("click", handleSuggestionsListClick);
  }

  async function getAutoCompleteSuggestions(query) {
    try {
      if (!query.trim()) {
        console.error("Error: Query is empty.");
        return [];
      }

      const apiUrl = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(
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

  function displaySuggestions(suggestions) {
    if (suggestionsList) {
      suggestionsList.innerHTML = "";

      suggestions.forEach((city) => {
        const suggestionItem = document.createElement("li");
        suggestionItem.textContent = `${city.name}, ${city.country}`;
        suggestionsList.appendChild(suggestionItem);
      });

      suggestionsList.style.display = "block";
    } else {
      console.error("Suggestions list element not found in the HTML");
    }
  }

  async function getWeather(city) {
    const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=6`;

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
    const iconUrl = `https:${iconCode}`;
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
        const iconUrl = `https:${iconCode}`;

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

  function saveLastLocation(location) {
    localStorage.setItem("lastLocation", location);
  }

  function loadLastLocation() {
    return localStorage.getItem("lastLocation") || "San Francisco";
  }

  async function init() {
    await setupAutoComplete();
    const defaultLocation = loadLastLocation();
    const weatherData = await getWeather(defaultLocation);
    displayWeather(weatherData);
    displayFiveDayForecast(weatherData.forecast);
  }

  init();
});

