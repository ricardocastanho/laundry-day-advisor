const resources = {
  'en-US': {
    dateLocale: 'en-US',
    geocodeLanguage: 'en',
    cardTitle: 'Laundry Day Advisor',
    welcome: 'Welcome to Laundry Day Advisor. Before we start, tell me your city, for example say, my city is Chicago. Then you can ask me if today is a good day to wash clothes, or ask me for the best laundry day this week.',
    noLocation: "I don't know your location yet. Please tell me your city, for example say, my city is Chicago, so I can check the weather forecast.",
    askCity: 'What city should I use for your laundry forecast?',
    locationSet: (city) => `Got it. I'll use ${city} for your laundry forecast. Now ask me if today is a good day to wash clothes, or for the best laundry day this week.`,
    locationSetReprompt: 'Ask me if today is a good day to wash clothes, or for the best laundry day this week.',
    locationNotFound: (city) => `I couldn't find a location called ${city}. Please try again with a different city name.`,
    todayYes: 'Yes! Today is the best day to wash your clothes.',
    todayNo: (day) => `No. The best day to wash your clothes this week is ${day}.`,
    bestDay: (day) => `The best day to wash your clothes this week is ${day}.`,
    help: 'You can tell me your city by saying, my city is Chicago. Then ask me if today is a good day to wash clothes, or ask for the best laundry day this week. What would you like to do?',
    goodbye: 'Goodbye! Good luck with your laundry.',
    fallback: "Sorry, I don't know about that. You can tell me your city, ask if today is a good day to wash clothes, or ask for the best laundry day this week.",
    reflector: (intentName) => `You just triggered ${intentName}.`,
    error: "Sorry, I couldn't figure out the best laundry day right now. Please try again later.",
  },
  'pt-BR': {
    dateLocale: 'pt-BR',
    geocodeLanguage: 'pt',
    cardTitle: 'Conselheiro de Lavanderia',
    welcome: 'Bem-vindo ao Conselheiro de Lavanderia. Antes de começar, me diga sua cidade, por exemplo diga, minha cidade é São Paulo. Depois você pode me perguntar se hoje é um bom dia para lavar roupa, ou pedir o melhor dia da semana para lavar roupa.',
    noLocation: 'Eu ainda não sei sua localização. Me diga sua cidade, por exemplo diga, minha cidade é São Paulo, para eu poder consultar a previsão do tempo.',
    askCity: 'Qual cidade eu devo usar para a sua previsão de lavagem de roupa?',
    locationSet: (city) => `Combinado. Vou usar ${city} para a sua previsão de lavagem de roupa. Agora pergunte se hoje é um bom dia para lavar roupa, ou peça o melhor dia da semana.`,
    locationSetReprompt: 'Pergunte se hoje é um bom dia para lavar roupa, ou peça o melhor dia da semana para lavar roupa.',
    locationNotFound: (city) => `Não encontrei uma localização chamada ${city}. Tente novamente com outro nome de cidade.`,
    todayYes: 'Sim! Hoje é o melhor dia para lavar suas roupas.',
    todayNo: (day) => `Não. O melhor dia para lavar suas roupas essa semana é ${day}.`,
    bestDay: (day) => `O melhor dia para lavar suas roupas essa semana é ${day}.`,
    help: 'Você pode me dizer sua cidade dizendo, minha cidade é São Paulo. Depois pergunte se hoje é um bom dia para lavar roupa, ou peça o melhor dia da semana. O que você gostaria de fazer?',
    goodbye: 'Até logo! Boa sorte com a lavagem de roupa.',
    fallback: 'Desculpe, não sei sobre isso. Você pode me dizer sua cidade, perguntar se hoje é um bom dia para lavar roupa, ou pedir o melhor dia da semana.',
    reflector: (intentName) => `Você acabou de acionar ${intentName}.`,
    error: 'Desculpe, não consegui descobrir o melhor dia para lavar roupa agora. Tente novamente mais tarde.',
  },
};

const DEFAULT_LOCALE = 'en-US';

function getStrings(handlerInput) {
  const requestLocale = handlerInput.requestEnvelope.request.locale;
  return resources[requestLocale] || resources[DEFAULT_LOCALE];
}

module.exports = {
  getStrings,
};
