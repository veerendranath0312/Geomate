const form = document.querySelector('.form');
const inputText = document.querySelector('.input-text');
const modal = document.querySelector('.modal');
const warningText = document.querySelector('.warning-text');
const city = document.querySelector('.city');
const country = document.querySelector('.country');
const celcius = document.querySelector('.celcius');
const pressure = document.querySelector('.pressure');
const description = document.querySelector('.description');

let map;

const showWarning = function (message) {
  warningText.textContent = message;
  modal.classList.remove('hidden');
};

const renderWeatherInfo = function (weatherInfo) {
  city.textContent = weatherInfo.name;
  country.textContent = weatherInfo.sys.country;
  celcius.textContent = (weatherInfo.main.temp - 273.15).toFixed(1);
  pressure.textContent = weatherInfo.main.pressure;
  description.textContent = weatherInfo.weather[0].description;
};

const renderLocationMarker = function (lat, lon, name) {
  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 350,
        minWidth: 100,
        className: 'popup-style'
      })
    )
    .setPopupContent(name)
    .openPopup();

  map.setView([lat, lon], 13, {
    animate: true,
    pan: {
      duration: 1
    }
  });
};

const renderMap = function (weatherInfo) {
  const { coord, name } = weatherInfo;
  const { lon, lat } = coord;

  map = L.map('map').setView([lat, lon], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  renderLocationMarker(lat, lon, name);
};

const getCurrentLocation = async function () {
  try {
    const response = await fetch('https://ipapi.co/json');
    const data = await response.json();
    return data;
  } catch (err) {
    console.log('Location not found 💥', err.message);
    return '';
  }
};

const getWeatherInfo = async function (city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=17ae4b810f3162b29f9856950d8457cc`
    );

    if (!response.ok) {
      throw new Error('City not found 💥');
    }

    const weatherData = await response.json();
    return weatherData;
  } catch (err) {
    console.log(err);
  }
};

const loadInfo = async function (city) {
  try {
    // Get weather info based on location info
    const weatherInfo = await getWeatherInfo(city);

    if (weatherInfo === '' || weatherInfo === undefined)
      throw new Error('City not found 💥');
    modal.classList.add('hidden');

    renderWeatherInfo(weatherInfo);

    const {
      coord: { lat, lon },
      name
    } = weatherInfo;
    renderLocationMarker(lat, lon, name);
  } catch (err) {
    showWarning(err.message);
  }
};

// IIFE for getting current user location info
(async function () {
  try {
    // Get location info
    const currentLocation = await getCurrentLocation();

    if (currentLocation === '' || currentLocation === undefined)
      throw new Error('Location not found 💥');
    modal.classList.add('hidden');

    const { city } = currentLocation;

    // Get weather info based on location info
    const weatherInfo = await getWeatherInfo(city);

    if (weatherInfo === '' || weatherInfo === undefined)
      throw new Error('City not found 💥');

    renderWeatherInfo(weatherInfo);
    renderMap(weatherInfo);
  } catch (err) {
    showWarning(err.message);
  }
})();

form.addEventListener('submit', function (e) {
  e.preventDefault();
  loadInfo(inputText.value);

  inputText.value = '';
});
