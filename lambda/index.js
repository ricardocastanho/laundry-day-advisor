const Alexa = require('ask-sdk-core');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const { getBestLaundryDay, isSameCalendarDay } = require('./laundryAlgorithm');
const { geocodeCity, resolveLocationForRequest, saveLocation, getSpokenCityName } = require('./locationService');

const NO_LOCATION_MESSAGE = "I don't know your location yet. Please tell me your city, for example say, my city is Chicago, so I can check the weather forecast.";

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Welcome to Laundry Day Advisor. Before we start, tell me your city, for example say, my city is Chicago. Then you can ask me if today is a good day to wash clothes, or ask me for the best laundry day this week.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const SetLocationIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SetLocationIntent';
  },
  async handle(handlerInput) {
    const spokenCityName = getSpokenCityName(handlerInput);

    if (!spokenCityName) {
      const speakOutput = 'What city should I use for your laundry forecast?';
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    }

    try {
      const geocoded = await geocodeCity(spokenCityName);
      await saveLocation(handlerInput, geocoded);
      const speakOutput = `Got it. I'll use ${geocoded.resolvedName} for your laundry forecast. Now ask me if today is a good day to wash clothes, or for the best laundry day this week.`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('Ask me if today is a good day to wash clothes, or for the best laundry day this week.')
        .getResponse();
    } catch (error) {
      const speakOutput = `I couldn't find a location called ${spokenCityName}. Please try again with a different city name.`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    }
  },
};

const CheckTodayIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckTodayIntent';
  },
  async handle(handlerInput) {
    const location = await resolveLocationForRequest(handlerInput);

    if (!location) {
      return handlerInput.responseBuilder
        .speak(NO_LOCATION_MESSAGE)
        .reprompt(NO_LOCATION_MESSAGE)
        .getResponse();
    }

    const today = new Date();
    const bestDay = await getBestLaundryDay(location.latitude, location.longitude);
    const todayIsBestDay = isSameCalendarDay(today, bestDay.date);

    const speakOutput = todayIsBestDay
      ? 'Yes! Today is the best day to wash your clothes.'
      : `No. The best day to wash your clothes this week is ${bestDay.dayName}.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withSimpleCard('Laundry Day Advisor', speakOutput)
      .getResponse();
  },
};

const BestDayIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BestDayIntent';
  },
  async handle(handlerInput) {
    const location = await resolveLocationForRequest(handlerInput);

    if (!location) {
      return handlerInput.responseBuilder
        .speak(NO_LOCATION_MESSAGE)
        .reprompt(NO_LOCATION_MESSAGE)
        .getResponse();
    }

    const bestDay = await getBestLaundryDay(location.latitude, location.longitude);
    const speakOutput = `The best day to wash your clothes this week is ${bestDay.dayName}.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withSimpleCard('Laundry Day Advisor', speakOutput)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can tell me your city by saying, my city is Chicago. Then ask me if today is a good day to wash clothes, or ask for the best laundry day this week. What would you like to do?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye! Good luck with your laundry.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const speakOutput = "Sorry, I don't know about that. You can tell me your city, ask if today is a good day to wash clothes, or ask for the best laundry day this week.";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}.`;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = "Sorry, I couldn't figure out the best laundry day right now. Please try again later.";
    console.log(`Error handled: ${error.message}`);
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    SetLocationIntentHandler,
    CheckTodayIntentHandler,
    BestDayIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(
    new DynamoDbPersistenceAdapter({
      tableName: process.env.DYNAMODB_TABLE_NAME || 'LaundryDayAdvisorLocations',
      createTable: process.env.DYNAMODB_CREATE_TABLE === 'true',
    }),
  )
  .lambda();
