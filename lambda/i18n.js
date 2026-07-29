const resources = {
  'en-US': {
    dateLocale: 'en-US',
    geocodeLanguage: 'en',
    cardTitle: 'Laundry Day Advisor',
    welcome: "Welcome to Laundry Day Advisor. I can't remember your city yet, so please include it every time you ask, for example, is today a good day to do laundry in Chicago, or, what's the best laundry day in Chicago.",
    noLocation: 'Please tell me your city in the same question, for example, is today a good day to do laundry in Chicago.',
    noPersistence: "I can't remember your city yet, so please include it every time you ask, for example, is today a good day to do laundry in Chicago.",
    locationNotFound: (city) => `I couldn't find a location called ${city}. Please try again with a different city name.`,
    todayYes: 'Yes! Today is the best day to wash your clothes.',
    todayNo: (day) => `No. The best day to wash your clothes this week is ${day}.`,
    bestDay: (day) => `The best day to wash your clothes this week is ${day}.`,
    help: 'I can\'t remember your city yet, so include it every time, for example, is today a good day to do laundry in Chicago, or, what\'s the best laundry day in Chicago. What would you like to do?',
    goodbye: 'Goodbye! Good luck with your laundry.',
    fallback: "Sorry, I don't know about that. Ask me if today is a good day to wash clothes, or for the best laundry day this week, and include your city, for example, in Chicago.",
    reflector: (intentName) => `You just triggered ${intentName}.`,
    error: "Sorry, I couldn't figure out the best laundry day right now. Please try again later.",
  },
  'pt-BR': {
    dateLocale: 'pt-BR',
    geocodeLanguage: 'pt',
    cardTitle: 'Conselheiro de Lavanderia',
    welcome: 'Bem-vindo ao Conselheiro de Lavanderia. Eu ainda não consigo lembrar da sua cidade, então diga o nome dela toda vez que perguntar, por exemplo, hoje é um bom dia para lavar roupa em São Paulo, ou, qual é o melhor dia para lavar roupa em São Paulo.',
    noLocation: 'Me diga sua cidade na mesma pergunta, por exemplo, hoje é um bom dia para lavar roupa em São Paulo.',
    noPersistence: 'Eu ainda não consigo lembrar da sua cidade, então diga o nome dela toda vez que perguntar, por exemplo, hoje é um bom dia para lavar roupa em São Paulo.',
    locationNotFound: (city) => `Não encontrei uma localização chamada ${city}. Tente novamente com outro nome de cidade.`,
    todayYes: 'Sim! Hoje é o melhor dia para lavar suas roupas.',
    todayNo: (day) => `Não. O melhor dia para lavar suas roupas essa semana é ${day}.`,
    bestDay: (day) => `O melhor dia para lavar suas roupas essa semana é ${day}.`,
    help: 'Eu ainda não consigo lembrar da sua cidade, então diga o nome dela toda vez, por exemplo, hoje é um bom dia para lavar roupa em São Paulo, ou, qual é o melhor dia para lavar roupa em São Paulo. O que você gostaria de fazer?',
    goodbye: 'Até logo! Boa sorte com a lavagem de roupa.',
    fallback: 'Desculpe, não sei sobre isso. Pergunte se hoje é um bom dia para lavar roupa, ou qual é o melhor dia da semana, e diga sua cidade, por exemplo, em São Paulo.',
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
