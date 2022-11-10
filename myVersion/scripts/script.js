const main = document.querySelector('main');
const allQuizzesContainer = document.querySelector('.allQuizzesContainer');
const myQuizzes = document.querySelector('.myQuizzes');
let initialQuizzValid = false;
let questionTextAndColorValid = false;

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

  questions: [],
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
      : 'Agora, decida os níveis!';
  button.innerHTML = text === 'Criar Quizz'
    ? 'Prosseguir pra criar perguntas'
    : 'Prosseguir pra criar perguntas'
      ? 'Prosseguir pra criar níveis'
      : 'Finalizar Quizz';

  startQuizzContainer.classList.add('startQuizzContainer');
  button.classList.add('startQuizzContainerButton');

  if (text === 'Criar Quizz') form.classList.add('formStyle');

  main.append(startQuizzContainer);
  startQuizzContainer.append(title);
  startQuizzContainer.append(form);
  startQuizzContainer.append(button);

  return [form, button];
};

function buildInitialForm(parent) {
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
};

function validateQuestionText({ target }) {
  const placeholder = target.placeholder;
  const textOrColor = placeholder === 'Texto da pergunta' ? 'text' : 'color';
  const numberText = textOrColor === 'text' ? target.parentElement.previousElementSibling.innerHTML : target.parentElement.previousElementSibling.previousElementSibling.innerHTML;

  const number = Number(numberText[numberText.length - 1]);

  quiz.questions[number - 1][(textOrColor === 'text' ? 'title' : 'color')] = target.value;

  const invalidTitle = document.createElement('p');
  const invalidColor = document.createElement('p');
  invalidTitle.innerHTML = 'Mínimo: 20 caracteres';
  invalidColor.innerHTML = 'Insira uma cor hexadecimal';

  invalidTitle.classList.add('invalidText');
  invalidTitle.classList.add(`invalidTitle${number}`);
  invalidColor.classList.add('invalidText');
  invalidColor.classList.add(`invalidColor${number}`);

  console.log(document.querySelector(`.invalidTitle${number}`))

  const titleValid = quiz.questions[number - 1].title.length >= 20;
  if (!titleValid && placeholder === 'Texto da pergunta') {
    document.querySelector(`.invalidTitle${number}`)?.remove();
    target.after(invalidTitle);
  } else if (placeholder === 'Texto da pergunta') {
    document.querySelector(`.invalidTitle${number}`)?.remove();
  }

  const colorValid = /^#([0-9A-F]{3}){1,2}$/i.test(quiz.questions[number - 1].color);
  if (!colorValid && placeholder === 'Cor do fundo da pergunta') {
    document.querySelector(`.invalidColor${number}`)?.remove();
    target.after(invalidColor);
  } else if (placeholder === 'Cor do fundo da pergunta') {
    document.querySelector(`.invalidColor${number}`)?.remove();
  }

  questionTextAndColorValid = titleValid && colorValid;
};

function buildTextAndColor(number) {
  const question = document.createElement('div');
  const titleContainer = document.createElement('div');
  const title = document.createElement('h3');
  const textLabel = document.createElement('label');
  const colorLabel = document.createElement('label');
  const text = document.createElement('input');
  const color = document.createElement('input');

  title.innerHTML = `Pergunta ${number}`;
  text.placeholder = 'Texto da pergunta';
  color.placeholder = 'Cor do fundo da pergunta';

  text.addEventListener('change', validateQuestionText);
  color.addEventListener('change', validateQuestionText);

  textLabel.append(text);
  colorLabel.append(color);
  titleContainer.append(title);
  question.append(title);
  question.append(textLabel);
  question.append(colorLabel);
  question.append(titleContainer);

  return question;
};

function buildCorrectAnswer() {
  const answer = document.createElement('div');
  const titleContainer = document.createElement('div');
  const title = document.createElement('h3');
  const textLabel = document.createElement('label');
  const urlLabel = document.createElement('label');
  const text = document.createElement('input');
  const url = document.createElement('input');

  title.innerHTML = 'Resposta correta';
  text.placeholder = 'Resposta correta';
  url.placeholder = 'URL da imagem';

  textLabel.append(text);
  urlLabel.append(url);
  titleContainer.append(title);
  answer.append(title);
  answer.append(textLabel);
  answer.append(urlLabel);
  answer.append(titleContainer);

  return answer;
};

function buildIncorrectAnswer() {
  const answers = [];
  const answer = document.createElement('div');
  const titleContainer = document.createElement('div');
  const title = document.createElement('h3');
  titleContainer.append(title);
  answer.append(title);
  answer.append(titleContainer);

  title.innerHTML = 'Respostas incorretas';

  for (let index = 0; index < 3; index += 1) {
    const answerContainer = document.createElement('div');
    const textLabel = document.createElement('label');
    const urlLabel = document.createElement('label');
    const text = document.createElement('input');
    const url = document.createElement('input');

    text.placeholder = `Resposta incorreta ${index + 1}`;
    url.placeholder = `URL da imagem ${index + 1}`;

    text.addEventListener('change', validateAnswer);
    url.addEventListener('change', validateAnswer);

    textLabel.append(text);
    urlLabel.append(url);

    answerContainer.append(textLabel);
    answerContainer.append(urlLabel);

    answerContainer.append(answer);

    answers.push(answerContainer);
  }

  return [title, ...answers];
};

function expandForm({ target }) {
  const questionContainer = target.parentElement;
  const numberText = questionContainer.firstElementChild.innerHTML;
  const number = numberText[numberText.length - 1];

  const expandedQuestionContainer = document.createElement('div');
  const incorrectContainer = document.createElement('div');
  expandedQuestionContainer.classList.add('expandedQuestionContainer');

  const question = buildTextAndColor(number);
  const correctAnswer = buildCorrectAnswer();
  const incorrectAnswers = buildIncorrectAnswer(number);

  expandedQuestionContainer.append(question);
  expandedQuestionContainer.append(correctAnswer);
  expandedQuestionContainer.append(incorrectContainer);
  incorrectAnswers.map((answer) => incorrectContainer.append(answer));

  questionContainer.replaceWith(expandedQuestionContainer);
};

function buildQuestionsForm(parent) {
  const { questions, initial } = quiz;
  const questionsLength = initial[2].value;

  for (let index = 0; index < questionsLength; index += 1) {
    const hiddedQuestion = document.createElement('div');
    const text = document.createElement('h3');
    const icon = document.createElement('img');

    hiddedQuestion.classList.add('hiddedQuestion');
    icon.classList.add('hiddedQuestionIcon');

    icon.src = '../assets/vetorEditar.svg';

    icon.addEventListener('click', expandForm);

    text.innerHTML = `Pergunta ${index + 1}`;

    hiddedQuestion.append(text);
    hiddedQuestion.append(icon);
    parent.append(hiddedQuestion);

    quiz.questions = [
      ...quiz.questions,
      {
        title: '',
        color: '',
        incorrects: [
          {
            answer: '',
            url: '',
          },
          {
            answer: '',
            url: '',
          },
          {
            answer: '',
            url: '',
          },
        ],
        correct: {
          answer: '',
          url: '',
        }
      }
    ];
  }
};

function formBuilder(parent, type) {
  if (type === 'initial') {
    buildInitialForm(parent);
  } else if (type === 'questions') {
    buildQuestionsForm(parent);
  }
};

function validateAnswer({ target }) {

  const placeholder = target.placeholder;
  const textOrURL = placeholder.includes('incorreta')
    ? 'textIncorrect'
    : placeholder.includes(' correta')
      ? 'textCorrect'
      : 'url';
  const numberText = (textOrURL === 'textIncorrect' || textOrURL === 'url') ? placeholder[placeholder.length - 1] : '';

  const number = numberText !== '' ? Number(numberText[numberText.length - 1]) : null;

  const questionNumber = target.parentElement.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.innerHTML;
  const realNumber = Number(questionNumber[questionNumber.length - 1]);
  if (textOrURL === 'textIncorrect' || textOrURL === 'url') {
    quiz.questions[realNumber].incorrects[number - 1][(textOrURL === 'textIncorrect' ? 'answer' : 'url')] = target.value;
  }

  const concatenatedNumbers = String(number) + String(realNumber);

  const invalidTitle = document.createElement('p');
  const invalidUrl = document.createElement('p');
  invalidTitle.innerHTML = 'Escreva algo';
  invalidUrl.innerHTML = 'Insira uma URL válida';

  invalidTitle.classList.add('invalidText');
  invalidTitle.classList.add(`invalidTitle${concatenatedNumbers}`);
  invalidUrl.classList.add('invalidText');
  invalidUrl.classList.add(`invalidUrl${concatenatedNumbers}`);

  const titleValid = quiz.questions[realNumber].incorrects[number - 1].answer?.length > 0;
  if (!titleValid && textOrURL === 'textIncorrect') {

    document.querySelector(`invalidTitle${concatenatedNumbers}`)?.remove();
    target.after(invalidTitle);


  } else if (textOrURL === 'textIncorrect') {
    document.querySelector(`.invalidTitle${concatenatedNumbers}`)?.remove();

  }

  const urlValid = /((?:(?:http?|ftp)[s]*:\/\/)?[a-z0-9-%\/\&=?\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?)/gi.test(quiz.questions[realNumber].incorrects[number - 1].url);
  if (!urlValid && textOrURL === 'url') {
    document.querySelector(`.invalidUrl${concatenatedNumbers}`)?.remove();
    target.after(invalidUrl);
  } else if (textOrURL === 'url') {
    document.querySelector(`.invalidUrl${concatenatedNumbers}`)?.remove();

  }


  initialQuizzValid = titleValid && urlValid;

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
    document.querySelector('.invalidTitle')?.remove();
    event.target.after(invalidTitle);
  } else if (event.target.name === 'title') document.querySelector('.invalidTitle')?.remove();

  const urlValid = /((?:(?:http?|ftp)[s]*:\/\/)?[a-z0-9-%\/\&=?\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?)/gi.test(initial[1].value);
  if (!urlValid && event.target.name === 'url') {
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