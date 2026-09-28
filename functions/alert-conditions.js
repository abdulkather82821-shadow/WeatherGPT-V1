function classifyForecastAlerts(data) {
  const current = data?.current;
  const daily = data?.daily;
  if (!current || !daily) throw new Error("Forecast response is missing current or daily weather data.");

  const maximumWind = Math.max(...(data.hourly?.wind_speed_10m?.slice(0, 24) || [current.wind_speed_10m || 0]));
  const maximumTemperature = daily.temperature_2m_max?.[0];
  const minimumTemperature = daily.temperature_2m_min?.[0];
  const rainChance = daily.precipitation_probability_max?.[0];
  const rainfall = daily.precipitation_sum?.[0];
  const alerts = {};

  if (Number.isFinite(rainChance) && Number.isFinite(rainfall) && rainChance >= 60 && rainfall >= 1) {
    alerts.rain = { title: "Rain in the forecast", detail: `${rainChance}% precipitation probability and approximately ${rainfall.toFixed(1)} mm forecast.` };
  }
  if (Number.isFinite(current.weather_code) && current.weather_code >= 95) {
    alerts.storm = { title: "Thunderstorm conditions in the forecast", detail: "The forecast model indicates thunderstorm conditions. Follow official local instructions." };
  }
  if (Number.isFinite(maximumWind) && maximumWind >= 50) {
    alerts.wind = { title: "Strong winds in the forecast", detail: `Forecast winds reach approximately ${Math.round(maximumWind)} km/h.` };
  }
  if (Number.isFinite(maximumTemperature) && maximumTemperature >= 40) {
    alerts.heat = { title: "Extreme heat in the forecast", detail: `Forecast high: ${Math.round(maximumTemperature)}°C.` };
  }
  if (Number.isFinite(minimumTemperature) && minimumTemperature <= 5) {
    alerts.cold = { title: "Cold weather in the forecast", detail: `Forecast low: ${Math.round(minimumTemperature)}°C.` };
  }
  return alerts;
}

module.exports = { classifyForecastAlerts };
