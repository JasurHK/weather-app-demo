import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const apiKey = '55393e9aa13347b7982180944251802';

  // Fetch user's current location on app load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(`${latitude},${longitude}`);
        },
        (err) => {
          console.error('Error fetching location:', err);
          fetchWeatherData('Dhaka,Bangladesh'); // Fallback to Dhaka
        }
      );
    } else {
      fetchWeatherData('Dhaka,Bangladesh'); // Fallback to Dhaka
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

  const fetchWeatherData = async (location) => {
    try {
      setIsLoading(true);
      setError(null);

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
      setLocation(weatherData.location.name); // Update location name
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    fetchSuggestions(e.target.value);
  };

  const handleSelectSuggestion = (selectedLocation) => {
    setLocation(selectedLocation.name);
    setInput(selectedLocation.name);
    setSuggestions([]);
    fetchWeatherData(selectedLocation.name);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!weatherData || !forecastData) return <p>Loading...</p>;

  const { temp_c, temp_f, humidity, wind_kph, condition } = weatherData.current;

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
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
          />
          {isSearching && <div className="spinner"></div>}
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((location) => (
                <li key={location.id} onClick={() => handleSelectSuggestion(location)}>
                  {location.name}, {location.country}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="weather-info">
        <h2>Today's Weather Forecast</h2>
        <img src={condition.icon} alt={condition.text} />
        <p className="location-time">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, {new Date().toLocaleTimeString()}
        </p>
        <div className="current-weather">
          
          <p className="temperature">{temp_c}°C</p>
          <p className="feels-like">Feels like {temp_c}°C</p>
        </div>
        <div className="weather-stats">
          <p> Temperature: {temp_c}°C</p>
          <p> Wind: {wind_kph} km/h</p>
          <p> Humidity: {humidity}%</p>
          <p> Condition: {condition.text}</p>
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
  );
}

export default App;