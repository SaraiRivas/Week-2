document.addEventListener("DOMContentLoaded", function() {
    searchCity("San Francisco");

    let searchTimeout;

    const searchInput = document.querySelector(".city-input");
    const searchButton = document.querySelector(".searchButton");

    searchInput.addEventListener("input", function() {

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            const cityName = searchInput.value.trim();
            if (cityName !== "") {
                searchCity(cityName);
            }
        }, 500);
    });

    searchButton.addEventListener("click", function() {

        const cityName = searchInput.value.trim();
        if (cityName !== "") {
            searchCity(cityName);
        }
    });
});

async function searchCity(cityName) {
    try {
        const apiKey = "3ad31ff726014559a2a20337242601"; 
        const apiEndpoint = "http://api.weatherapi.com/v1/forecast.json";
        const apiUrl = `${apiEndpoint}?q=${cityName}&key=${apiKey}&days=5`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
            const currentWeather = data.current;
            const forecastData = data.forecast.forecastday;
            updateWeatherUI(cityName, currentWeather, forecastData);
        } else {
            console.error(`Error en la solicitud: ${data.error.message}`);
        }
    } catch (error) {
        console.error("Error al realizar la solicitud:", error);
    }
}

function updateWeatherUI(cityName, currentWeather, forecastData) {
    const cityNameElement = document.querySelector(".cityName h1");
    cityNameElement.textContent = cityName;

    const temperatureElement = document.querySelector(".temp span");
    temperatureElement.textContent = Math.round(currentWeather.temp_c);

    const additionalDetailsContainer = document.querySelector(".day-info");
    if (additionalDetailsContainer) {
        additionalDetailsContainer.innerHTML = `
            <p>Condition: ${currentWeather.condition.text}</p>
            <p>Humidity: ${currentWeather.humidity}%</p>
            <p>Wind Speed: ${currentWeather.wind_kph} km/h</p>
        `;

        const forecastContainer = document.querySelector(".side-info");
        forecastContainer.innerHTML = "";

        forecastData.forEach(dayForecast => {
            const forecastElement = document.createElement("div");
            forecastElement.classList.add("forecast");

            const iconCode = dayForecast.day.condition.icon;
            const date = new Date(dayForecast.date);
            const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
            const tempC = dayForecast.day.avgtemp_c;

            forecastElement.innerHTML = `
                <i class="weather-icon" style="background-image: url('${iconCode}')"></i>
                <div class="forecast-des">
                    <span class="dayofWeek">${dayOfWeek}</span>
                    <span class="date">${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })}</span>
                    <p class="f-temp">${Math.round(tempC)} <span>°C</span></p>
                </div>
            `;

            forecastContainer.appendChild(forecastElement);
        });
    } else {
        console.error("El elemento additional-details (o day-info) no se encontró en el HTML.");
    }
}
