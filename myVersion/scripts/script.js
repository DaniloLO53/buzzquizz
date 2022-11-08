const main = document.querySelector('main');
const allQuizzesContainer = document.querySelector('.allQuizzesContainer');
const myQuizzes = document.querySelector('.myQuizzes');
let initialQuizzValid = false;

const quiz = {
  initial: [
    {
      placeholder: 'Título do seu quizz',
      name: 'title',
      type: 'text',
      minlength: 20,
      maxlength: 65
    },
    {
      placeholder: 'URL da imagem do seu quizz',
      name: 'url',
      type: 'text',

    },
    {
      placeholder: 'Quantidade de perguntas do quizz',
      name: 'questionsNumber',
      type: 'number',
      min: 3
    },
    {
      placeholder: 'Quantidade de níveis do quizz',
      name: 'levelsNumber',
      type: 'number',
      min: 2
    }
  ],
}

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
  throw new Error(error.message);
};

async function requestQuizzes() {
  const END_POINT = 'https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes';

  try {
    const promisse = await axios.get(END_POINT);
    return promisse;
  } catch (error) {
    errorHandle(error);
  }
};

function buildQuiz(quiz) {
  const { id, title, image, levels, questions } = quiz;

  const quizzCard = document.createElement('div');
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  const caption = document.createElement('figcaption');

  quizzCard.classList.add('quizzCard');

  img.src = image;
  caption.innerHTML = title;

  quizzCard.append(figure);
  figure.append(img);
  figure.append(caption);

  return quizzCard;
};

async function buildQuizzes() {
  const quizzesData = await requestQuizzes();

  const { data } = quizzesData;
  const quizzes = data.map((quiz) => buildQuiz(quiz));

  quizzes.forEach((quiz) => allQuizzesContainer.append(quiz));
  console.log(quizzes);
};

function renderQuestionsCreator(event) {
  const [form, button] = renderGeneralQuiz(event);
  formBuilder(form, 'questions');
  // button.addEventListener('click', renderQuestionsCreator);
};

function renderQuizCreator(event) {
  const [form, button] = renderGeneralQuiz(event);
  formBuilder(form, 'initial');
  button.addEventListener('click', renderQuestionsCreator);
};

function renderGeneralQuiz(event) {
  const { target } = event;
  const text = target.innerText;

  Array.from(main.children).map((child) => child.remove());

  const startQuizzContainer = document.createElement('article');
  const title = document.createElement('h3');
  const form = document.createElement('form');
  const button = document.createElement('button');

  button.disabled = true;
  title.innerHTML = text === 'Criar Quizz'
    ? 'Comece pelo começo'
    : 'Prosseguir pra criar perguntas'
      ? 'Crie suas perguntas'
      : 'Agora, decidaq os níveis!';
  button.innerHTML = text === 'Criar Quizz'
    ? 'Prosseguir pra criar perguntas'
    : 'Prosseguir pra criar perguntas'
      ? 'Prosseguir pra criar níveis'
      : 'Finalizar Quizz';

  startQuizzContainer.classList.add('startQuizzContainer');
  button.classList.add('startQuizzContainerButton');

  main.append(startQuizzContainer);
  startQuizzContainer.append(title);
  startQuizzContainer.append(form);
  startQuizzContainer.append(button);

  return [form, button];
};

function formBuilder(parent, type) {
  if (type === 'initial') {
    for (let index = 0; index < 4; index += 1) {
      const label = document.createElement('label');
      const input = document.createElement('input');

      input.addEventListener('change', validateInitialQuizzInfo)

      input.placeholder = quiz.initial[index].placeholder;
      input.name = quiz.initial[index].name;
      input.type = quiz.initial[index].type;
      if (input.type === 'number') input.min = quiz.initial[index].min;
      if (input.name === 'title') {
        input.setAttribute('minlength', quiz.initial[index].minlength);
        input.setAttribute('maxlength', quiz.initial[index].maxlength);
      };

      label.append(input);
      parent.append(label);
    }
  } else if (type === 'questions') {

  }
};

function validateInitialQuizzInfo(event) {
  const { name, value } = event.target;
  const { initial } = quiz;
  const button = document.querySelector('.startQuizzContainerButton');
  const input = initial.find((input) => input.name === name);
  input.value = value;

  const invalidTitle = document.createElement('p');
  const invalidUrl = document.createElement('p');
  invalidTitle.innerHTML = 'Mínimo: 20 caracteres, Máximo: 65 caracteres';
  invalidUrl.innerHTML = 'Insira uma URL válida';

  invalidTitle.classList.add('invalidText');
  invalidTitle.classList.add('invalidTitle');
  invalidUrl.classList.add('invalidText');
  invalidUrl.classList.add('invalidUrl');

  const titleValid = initial[0].value?.length >= 20 && initial[0]?.value?.length <= 65;
  if (!titleValid && event.target.name === 'title') {
    console.log(document.querySelector('.invalidText'));
    document.querySelector('.invalidTitle')?.remove();
    event.target.after(invalidTitle);
  } else if (event.target.name === 'title') {
    document.querySelector('.invalidTitle')?.remove();
  }

  const urlValid = /((?:(?:http?|ftp)[s]*:\/\/)?[a-z0-9-%\/\&=?\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?)/gi.test(initial[1].value);
  if (!urlValid && event.target.name === 'url') {
    console.log(document.querySelector('.invalidText'));
    document.querySelector('.invalidUrl')?.remove();
    event.target.after(invalidUrl);
  } else if (event.target.name === 'url') {
    document.querySelector('.invalidUrl')?.remove();
  }
  const questionsValid = initial[2].value >= 3;
  const levelsValid = initial[3].value >= 2;

  initialQuizzValid = titleValid && urlValid && questionsValid && levelsValid;
  if (initialQuizzValid) {
    button.removeAttribute('disabled');
  } else {
    button.setAttribute('disabled', true);
  }
};

function buildNoQuizzes() {
  const noQuizzesContainer = document.createElement('div');
  const noQuizzesText = document.createElement('p');
  const createQuizzButton = document.createElement('button');

  noQuizzesContainer.classList.add('noQuizzesContainer');

  noQuizzesText.innerHTML = 'Você não criou nenhum quizz ainda :('
  createQuizzButton.innerHTML = 'Criar Quizz';

  createQuizzButton.addEventListener('click', renderQuizCreator);

  myQuizzes.append(noQuizzesContainer);
  noQuizzesContainer.append(noQuizzesText);
  noQuizzesContainer.append(createQuizzButton);
};

function buildMyQuizzes() {
  const myQuizzesIds = JSON.parse(localStorage.getItem('myQuizzesIds')) || [];

  if (myQuizzesIds.length === 0) {
    buildNoQuizzes();
  }
};

window.addEventListener('load', buildQuizzes);
window.addEventListener('load', buildMyQuizzes);