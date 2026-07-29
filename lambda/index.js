const Alexa = require('ask-sdk-core');
const { getBestLaundryDay, isSameCalendarDay } = require('./laundryAlgorithm');
const { resolveLocationForRequest, getSpokenCityName } = require('./locationService');
const { getStrings } = require('./i18n');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const strings = getStrings(handlerInput);
    const speakOutput = strings.welcome;
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
  handle(handlerInput) {
    const strings = getStrings(handlerInput);
    const speakOutput = strings.noPersistence;
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CheckTodayIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckTodayIntent';
  },
  async handle(handlerInput) {
    const strings = getStrings(handlerInput);
    let location;
    try {
      location = await resolveLocationForRequest(handlerInput, strings.geocodeLanguage);
    } catch (error) {
      const speakOutput = strings.locationNotFound(getSpokenCityName(handlerInput));
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    }

    if (!location) {
      return handlerInput.responseBuilder
        .speak(strings.noLocation)
        .reprompt(strings.noLocation)
        .getResponse();
    }

    const today = new Date();
    const bestDay = await getBestLaundryDay(location.latitude, location.longitude, strings.dateLocale);
    const todayIsBestDay = isSameCalendarDay(today, bestDay.date);

    const speakOutput = todayIsBestDay
      ? strings.todayYes
      : strings.todayNo(bestDay.dayName);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withSimpleCard(strings.cardTitle, speakOutput)
      .getResponse();
  },
};

const BestDayIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BestDayIntent';
  },
  async handle(handlerInput) {
    const strings = getStrings(handlerInput);
    let location;
    try {
      location = await resolveLocationForRequest(handlerInput, strings.geocodeLanguage);
    } catch (error) {
      const speakOutput = strings.locationNotFound(getSpokenCityName(handlerInput));
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    }

    if (!location) {
      return handlerInput.responseBuilder
        .speak(strings.noLocation)
        .reprompt(strings.noLocation)
        .getResponse();
    }

    const bestDay = await getBestLaundryDay(location.latitude, location.longitude, strings.dateLocale);
    const speakOutput = strings.bestDay(bestDay.dayName);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withSimpleCard(strings.cardTitle, speakOutput)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = getStrings(handlerInput).help;
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
    const speakOutput = getStrings(handlerInput).goodbye;
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
    const speakOutput = getStrings(handlerInput).fallback;
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
    const speakOutput = getStrings(handlerInput).reflector(intentName);
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
    const speakOutput = getStrings(handlerInput).error;
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
  .lambda();
