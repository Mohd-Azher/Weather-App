const cityInputText = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const weatherCards = document.querySelector(".weather-card");
const currentWeather = document.querySelector(".current-weather");
const locationButton = document.querySelector(".location-btn");
const API_KEY = "e2fb6c80af245e4593793a6408898e36";

const createWeatherCard = (cityName, item, index) => {
  if (index === 0) {
    return `<div class="details">
                    <h2>${cityName} (${item.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(item.main.temp - 273.15).toFixed(
                      2
                    )}°C</h4>
                    <h4>Wind: ${item.wind.speed} M/S</h4>
                    <h4>Humidity: ${item.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${
                      item.weather[0].icon
                    }@4x.png" alt="weather-icon">
                    <h4>${item.weather[0].description}</h4>
                </div>`;
  } else {
    return ` <li class="cards">
                              <h3>(${item.dt_txt.split(" ")[0]})</h3>
                              <img src="https://openweathermap.org/img/wn/${
                                item.weather[0].icon
                              }@2x.png" alt="weather-icon">
                              <h4>Temp: ${(item.main.temp - 273.15).toFixed(
                                2
                              )}°C</h4>
                              <h4>Wind: ${item.wind.speed} M/S</h4>
                              <h4>Humidity: ${item.main.humidity}%</h4>
                          </li>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const GET_WEATHER_DETAILS_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  fetch(GET_WEATHER_DETAILS_API)
    .then((res) => res.json())
    .then((data) => {
      const uniqueForecastDay = [];
      const fiveDayForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDay.includes(forecastDate)) {
          return uniqueForecastDay.push(forecastDate);
        }
      });

      cityInputText.value = "";
      weatherCards.innerHTML = "";
      currentWeather.innerHTML = "";
      console.log(fiveDayForecast);
      fiveDayForecast.forEach((item, index) => {
        if (index === 0) {
          currentWeather.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, item, index)
          );
        } else {
          weatherCards.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, item, index)
          );
        }
      });
    })
    .catch(() => {
      alert("An error occured while fetching the weather forecast");
    });
};

const getCityCoordinate = () => {
  const cityName = cityInputText.value.trim();
  if (!cityName) return;
  //   console.log(cityName);
  //   const weatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
  const GECODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;

  fetch(GECODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinate found for ${cityName}`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occured while fetching the coordinate");
    });
};

const getLocationCoordinate = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occured while fetching the city");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Geolocation request denied. please reset location permission to grant access"
        );
      }
    }
  );
};

searchButton.addEventListener("click", getCityCoordinate);
locationButton.addEventListener("click", getLocationCoordinate);
cityInputText.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getLocationCoordinate()
);
