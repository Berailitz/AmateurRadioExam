import { showToast } from './base.js';
import { initialQuestionList } from './questionList.js';

let questionList;
let isWalking = false;

function waitUntilInstalled(registration) {
  return new Promise((resolve, reject) => {
    if (registration.installing) {
      registration.installing.addEventListener('statechange', (event) => {
        if (event.target.state === 'installed') {
          resolve();
        } else if (event.target.state === 'redundant') {
          reject();
        }
      });
    } else {
      resolve();
    }
  });
}

function updateQuestionButton(questionID) {
  const questionButton = document.getElementById(`Question${questionID}`);
  questionButton.addEventListener('click', (_) => chooseQuestion(questionID));
  const questionStatistic = localStorage.getItem(`Question${questionID}`);
  if (questionStatistic !== null) {
    if (parseInt(questionStatistic) > 0) {
      questionButton.classList.remove('mdl-button--accent');
      questionButton.classList.add('mdl-button--primary');
    } else {
      questionButton.classList.add('mdl-button--accent');
      questionButton.classList.remove('mdl-button--primary');
    }
  }
}

function initialize() {
  questionList = initialQuestionList;
  QuestionList.innerHTML = questionList.map((_, questionIndex) => `<button id="Question${questionIndex + 1}" class="mdl-button mdl-js-button mdl-button--accent mdl-js-ripple-effect">${questionIndex + 1}</button>`).join('');
  questionList.forEach((_, questionIndex) => updateQuestionButton(questionIndex + 1));
  navigator.serviceWorker.register('./worker.js', {
    scope: './'
  }).then(waitUntilInstalled).catch(console.log);
  document.addEventListener('keyup', (keyEvent) => {
    let code = keyEvent.keyCode;
    if (65 <= code && code <= 68) {
      code += 32;
    }
    if (97 <= code && code <= 100) {
      chooseAnswer(document.getElementById(`Answer${code - 97}`));
    }
  });
  document.addEventListener('keyup', (keyEvent) => {
    if (keyEvent.key.toUpperCase() === 'W') {
      setWalkingState(true);
    } else if (keyEvent.key.toUpperCase() === 'S') {
      setWalkingState(false);
    } else if (keyEvent.key.toUpperCase() === 'P') {
      showNextQuestion();
    } else if (keyEvent.key.toUpperCase() === 'H') {
      getHelp();
    }
  });
  let lastIsWalking = localStorage.getItem('isWalking');
  if (lastIsWalking === null) {
    localStorage.setItem('isWalking', isWalking);
  } else {
    setWalkingState(lastIsWalking === 'true');
  }
}

function getQuestionID() {
  return parseInt(document.getElementById('QuestionTitle').value);
}

function setWalkingState(nextState) {
  if (nextState === undefined) {
    isWalking = !isWalking;
  } else {
    isWalking = nextState;
  }
  localStorage.setItem('isWalking', isWalking);
  if (isWalking) {
    document.getElementById('WalkQuestionButton').textContent = 'SHUFFLE';
    showToast('WALKING', 500);
  } else {
    document.getElementById('WalkQuestionButton').textContent = 'WALK';
    showToast('SHUFFLING', 500);
  }
}

function showNextQuestion() {
  if (isWalking) {
    walkQuestion();
  } else {
    showRandomQuestion();
  }
}

function showRandomQuestion() {
  chooseQuestion(Math.floor(Math.random() * questionList.length) + 1);
}

function walkQuestion() {
  let questionAmount = questionList.length;
  for (let questionID = (getQuestionID() + 1) % questionAmount; questionID <= questionAmount; questionID++) {
    let questionStatistic = localStorage.getItem(`Question${questionID}`);
    if (questionStatistic === null || parseInt(questionStatistic) <= 0) {
      chooseQuestion(questionID);
      return;
    }
  }
  showRandomQuestion();
}

function chooseQuestion(questionID) {
  let questionItem = questionList[questionID - 1];
  const questionTitle = document.getElementById('QuestionTitle');
  questionTitle.textContent = `第${questionItem['localID']}题`;
  questionTitle.value = questionItem['localID'];
  document.getElementById('QuestionText').textContent = `${questionItem['content']}`;
  ['a', 'b', 'c', 'd'].sort(() => Math.random() - 0.5).forEach((choice, i) => {
    const button = document.getElementById(`Answer${i}`);
    button.textContent = `${String.fromCharCode(i + 65)}.${questionItem[choice]}`;
    button.value = choice;
  });
}

function chooseAnswer(button) {
  const isCorrect = button.value === 'a';
  if (isCorrect) {
    showToast('正确。');
    setTimeout(showNextQuestion, 1000);
  } else {
    showToast(`错误。`);
  }
  updateQuestionStatistic(isCorrect);
}

function updateQuestionStatistic(isCorrect) {
  const questionID = getQuestionID();
  let lastStatistic = localStorage.getItem(`Question${questionID}`);
  if (lastStatistic === null) {
    lastStatistic = 0;
  } else {
    lastStatistic = parseInt(lastStatistic);
  }
  localStorage.setItem(`Question${questionID}`, lastStatistic + (isCorrect ? 1 : -1));
  updateQuestionButton(questionID);
}

function getHelp() {
  updateQuestionStatistic(false);
  for (const i of Array(4).keys()) {
    let answerButton = document.getElementById(`Answer${i}`);
    if (answerButton.value === 'a') {
      showToast(answerButton.textContent, 2000);
      setTimeout(showNextQuestion, 2000);
      return;
    }
  }
}

export { initialize, showNextQuestion, chooseAnswer, setWalkingState, getHelp };
