async function geocodeCity(cityName, language = 'en') {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=${language}&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`No location found for "${cityName}"`);
  }

  const match = data.results[0];
  const resolvedName = match.admin1 ? `${match.name}, ${match.admin1}` : match.name;

  return {
    latitude: match.latitude,
    longitude: match.longitude,
    resolvedName,
  };
}

function getSpokenCityName(handlerInput) {
  const slots = handlerInput.requestEnvelope.request.intent.slots;
  return slots && slots.CityName && slots.CityName.value ? slots.CityName.value : null;
}

async function resolveLocationForRequest(handlerInput, language = 'en') {
  const spokenCityName = getSpokenCityName(handlerInput);

  if (!spokenCityName) {
    return null;
  }

  return geocodeCity(spokenCityName, language);
}

module.exports = {
  geocodeCity,
  getSpokenCityName,
  resolveLocationForRequest,
};
