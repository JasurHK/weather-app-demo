import './App.css';
import React, { useState, useEffect } from 'react';
import sun from './assets/sun.jpg'
import snow from './assets/snow.jpg'
import clouds from './assets/clouds.jpg'
import rain from './assets/rain.jpg'
import defoult from './assets/defoult-1.jpg'
import clear from './assets/clear.jpg'
import mist from './assets/mist.jpg'

function App() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const apiKey = '55393e9aa13347b7982180944251802';

  // Fetch user's current location on app load
  const fetchWeatherData = async (location) => {
    try {

      const weatherRes = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=no`
      );
      const weatherData = await weatherRes.json();

      const forecastRes = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=5&aqi=no&alerts=no`
      );
      const forecastData = await forecastRes.json();

      setWeatherData(weatherData);
      setForecastData(forecastData);
    } catch (err) {
    } finally {
    }
  };
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(`${latitude},${longitude}`);
        },
        (err) => {
          console.error('Error fetching location:', err);
          fetchWeatherData('Warsaw, Poland'); // Fallback to Dhaka
        }
      );
    } else {
      fetchWeatherData('Warsaw, Poland'); // Fallback to Dhaka
    }
  }, []);

  const fetchSuggestions = async (query) => {
    if (query.length < 3) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    fetchSuggestions(e.target.value);
  };

  const handleSelectSuggestion = (selectedLocation) => {
    setInput('');
    setSuggestions([]);
    fetchWeatherData(selectedLocation.name);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  const getBackgroundImage = (weather) => {
    if (!weather) return defoult;
  
    const lowerWeather = weather.toLowerCase();
  
    if (lowerWeather.includes("clear")) return clear;
    if (lowerWeather.includes("rain") || lowerWeather.includes("drizzle")) return rain;
    if (lowerWeather.includes("cloud")) return clouds;
    if (lowerWeather.includes("snow")) return snow;
    if (lowerWeather.includes("sun")) return sun;
    if (lowerWeather.includes("mist") || lowerWeather.includes("fog")) return mist;
  
    return defoult; // Default fallback image
  };
  
  if (!weatherData || !weatherData.current || !forecastData) {
    return <p className='error'>Error fetching weather data. Please check the API key and try again !</p>;
  };
  // if (!weatherData || !forecastData) return <p>Loading...</p>;

  const { temp_c, humidity, wind_kph, condition } = weatherData.current;
  
  const backgroundImage = getBackgroundImage(condition.text);
  console.log(condition.text)
  
  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className='container'
        style={{
          background: `url(${backgroundImage}) no-repeat center center/cover`,
          maxWidth: '1200px',
          margin: '30px auto',
          padding: '36px',
          borderRadius: '15px',
        }} 
      >
      <div className="SearchBar">
        <div className="DarkModeToggle">
          <button className="DarkModeToggleButton" onClick={toggleDarkMode}>
            {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
        <div className="search-location">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Search for a city..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && suggestions.length > 0) {
                handleSelectSuggestion(suggestions[0]); // Select first suggestion if Enter is pressed
                setInput(""); 
              }
            }}
          />
          {isSearching && <div className="spinner"></div>}
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((location) => (
                <li key={location.id} onClick={() => handleSelectSuggestion(location)} >
                  {location.name}, {location.country}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="weather-info">
        <h2>Today's Weather in {weatherData.location.name}</h2>
        <img src={condition.icon} alt={condition.text} />
        <p>{condition.text}</p>
        <p className="location-time">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, {new Date().toLocaleTimeString()}
        </p>
        <div className="current-weather">
          
          <p className="temperature">{temp_c}°C</p>
          <p className="feels-like">Feels like {temp_c}°C</p>
        </div>
        <div className="weather-stats">
          <p>🌡 Temperature: {temp_c}°C</p>
          <p>🌬 Wind: {wind_kph} km/h</p>
          <p> 💨Humidity: {humidity}%</p>
          <p> ⛅️Condition: {condition.text}</p>
        </div>
      </div>

      <div className="forecast">
        <h2>5-Day Forecast</h2>
        <div className="forecast-list">
          {forecastData.forecast.forecastday.map((day, index) => {
            const date = new Date(day.date);
            return (
              <div key={index} className="forecast-item">
                <h3>{date.toLocaleDateString('en-US', { weekday: 'short' })}</h3>
                <img src={`https:${day.day.condition.icon}`} alt={day.day.condition.text} />
                <p>
                  <strong>Max:</strong> {day.day.maxtemp_c}°C
                </p>
                <p>
                  <strong>Min:</strong> {day.day.mintemp_c}°C
                </p>
                <p>{day.day.condition.text}</p>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;