function getWeekdayName(date, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(date);
}

function parseIsoDateAsUtc(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

async function fetchWeeklyForecast(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_probability_max,wind_speed_10m_max&timezone=UTC&forecast_days=7`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const dates = data.daily.time;
  const precipitationChances = data.daily.precipitation_probability_max;
  const windSpeeds = data.daily.wind_speed_10m_max;

  return dates.map((isoDate, index) => ({
    isoDate,
    date: parseIsoDateAsUtc(isoDate),
    precipitationChance: precipitationChances[index],
    windSpeed: windSpeeds[index],
  }));
}

function pickBestDayFromForecast(forecastDays) {
  return forecastDays.reduce((best, current) => {
    if (current.precipitationChance < best.precipitationChance) {
      return current;
    }
    if (current.precipitationChance === best.precipitationChance && current.windSpeed > best.windSpeed) {
      return current;
    }
    return best;
  }, forecastDays[0]);
}

async function getBestLaundryDay(latitude, longitude, locale = 'en-US') {
  if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
    throw new Error('Latitude and longitude are required to calculate the best laundry day');
  }

  const forecastDays = await fetchWeeklyForecast(latitude, longitude);
  const bestDay = pickBestDayFromForecast(forecastDays);

  return {
    dayName: getWeekdayName(bestDay.date, locale),
    date: bestDay.date,
  };
}

function isSameCalendarDay(dateA, dateB) {
  return dateA.getUTCFullYear() === dateB.getUTCFullYear()
    && dateA.getUTCMonth() === dateB.getUTCMonth()
    && dateA.getUTCDate() === dateB.getUTCDate();
}

module.exports = {
  getBestLaundryDay,
  isSameCalendarDay,
  getWeekdayName,
};
