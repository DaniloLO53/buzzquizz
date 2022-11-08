const main = document.querySelector('main');

function reloadToInitialScreen() {
  const container = document.querySelector('.errorContainer');
  let counter = 10;

  const counterContainer = document.createElement('div');
  const counterText = document.createElement('p');
  const counterButton = document.createElement('button');

  counterContainer.classList.add('counterContainer');

  counterButton.innerHTML = 'Parar';

  const interval = setInterval(() => {
    counterText.innerHTML = `Reiniciando em ${counter}s`;
    counter -= 1;

    if (counter < 0) window.location.reload();
  }, 1000);

  counterButton.addEventListener('click', () => {
    clearInterval(interval);
  });

  counterContainer.append(counterText);
  counterContainer.append(counterButton);
  container.append(counterContainer);
}

function error404Builder() {
  const container = document.querySelector('.errorContainer');

  const figure = document.createElement('figure');
  const img = document.createElement('img');
  const caption = document.createElement('figcaption');

  figure.classList.add('errorFigure');

  img.src = '../assets/erro404.png';
  caption.innerHTML = 'Desculpe, mas essa página não existe :/';

  figure.append(img);
  figure.append(caption);
  container.append(figure);
};

function errorHandle(error) {
  const { message, response } = error;
  Array.from(main.children).map((child) => child.remove());

  const errorContainer = document.createElement('div');
  errorContainer.classList.add('errorContainer');
  main.append(errorContainer);

  switch (response.status) {
    case 404:
      error404Builder();
      break;
    default:
      console.log('WTF');
  }

  reloadToInitialScreen();
};

async function requestQuizzes() {
  const END_POINT = 'https://mock-api.driven.com.br/api/v4/buzzquizz/quizzs';

  try {
    const promisse = await axios.get(END_POINT);
    return promisse;
  } catch (error) {
    errorHandle(error);
    throw new Error(error.message);
  }
};

async function buildQuizzes() {
  const quizzesData = await requestQuizzes();
  console.log(quizzesData);
};

window.addEventListener('load', buildQuizzes);