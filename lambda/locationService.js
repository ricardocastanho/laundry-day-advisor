async function geocodeCity(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
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

async function getSavedLocation(handlerInput) {
  const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
  return persistentAttributes.location || null;
}

async function saveLocation(handlerInput, location) {
  const attributesManager = handlerInput.attributesManager;
  const persistentAttributes = await attributesManager.getPersistentAttributes();
  persistentAttributes.location = location;
  attributesManager.setPersistentAttributes(persistentAttributes);
  await attributesManager.savePersistentAttributes();
}

function getSpokenCityName(handlerInput) {
  const slots = handlerInput.requestEnvelope.request.intent.slots;
  return slots && slots.CityName && slots.CityName.value ? slots.CityName.value : null;
}

async function resolveLocationForRequest(handlerInput) {
  const spokenCityName = getSpokenCityName(handlerInput);

  if (spokenCityName) {
    const geocoded = await geocodeCity(spokenCityName);
    await saveLocation(handlerInput, geocoded);
    return geocoded;
  }

  return getSavedLocation(handlerInput);
}

module.exports = {
  geocodeCity,
  getSavedLocation,
  saveLocation,
  getSpokenCityName,
  resolveLocationForRequest,
};
