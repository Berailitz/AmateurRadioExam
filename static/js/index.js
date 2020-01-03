import { showToast } from './base.js';
import { initialQuestionList as questionList } from './questionList.js';

let isWalking = false;
let currentQuestionID;

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

function isQuestionAnswered(questionID) {
  const questionStatistic = localStorage.getItem(`Question${questionID}`);
  return questionStatistic !== null && parseInt(questionStatistic) > 0;
}

function initialize() {
  navigator.serviceWorker.register('./worker.js', {
    scope: './'
  }).then(waitUntilInstalled).catch(console.log);
  let lastIsWalking = localStorage.getItem('isWalking');
  if (lastIsWalking === null) {
    localStorage.setItem('isWalking', isWalking);
  } else {
    setWalkingState(lastIsWalking === 'true');
  }
  QuestionList.innerHTML = questionList.map((_, questionIndex) => `<button id="Question${questionIndex + 1}" class="mdl-button mdl-js-button mdl-js-ripple-effect ${isQuestionAnswered(questionIndex + 1) ? 'mdl-button--primary' : 'mdl-button--accent'}">${questionIndex + 1}</button>`).join('');
  questionList.forEach((_, questionIndex) => document.getElementById(`Question${questionIndex + 1}`).addEventListener('click', (_) => chooseQuestion(questionIndex + 1)));
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
}

function setWalkingState(nextState) {
  if (nextState === undefined) {
    isWalking = !isWalking;
  } else {
    isWalking = nextState;
  }
  localStorage.setItem('isWalking', isWalking);
  if (isWalking) {
    WalkQuestionButton.textContent = 'SHUFFLE';
    showToast('WALKING', 500);
  } else {
    WalkQuestionButton.textContent = 'WALK';
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
  for (let loopQuestionIndex = currentQuestionID; loopQuestionIndex <= currentQuestionID + questionAmount; loopQuestionIndex++) {
    let questionID = loopQuestionIndex % questionAmount + 1;
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
  QuestionTitle.textContent = `第${questionItem['localID']}题`;
  currentQuestionID = questionItem['localID'];
  QuestionText.textContent = `${questionItem['content']}`;
  ['a', 'b', 'c', 'd'].sort(() => Math.random() - 0.5).forEach((choice, i) => {
    const button = document.getElementById(`Answer${i}`);
    button.textContent = `${String.fromCharCode(i + 65)}.${questionItem[choice]}`;
    button.value = choice;
  });
}

function chooseAnswer(button) {
  const isCorrect = button.value === 'a';
  updateQuestionStatistic(isCorrect);
  if (isCorrect) {
    showNextQuestion();
    showToast('正确。');
  } else {
    showToast(`错误。`);
  }
}

function updateQuestionStatistic(isCorrect) {
  const questionButton = document.getElementById(`Question${currentQuestionID}`);
  let lastStatistic = localStorage.getItem(`Question${currentQuestionID}`);
  if (lastStatistic === null) {
    lastStatistic = 0;
  } else {
    lastStatistic = parseInt(lastStatistic);
  }
  localStorage.setItem(`Question${currentQuestionID}`, lastStatistic + (isCorrect ? 1 : -1));
  if (isQuestionAnswered(currentQuestionID)) {
    questionButton.classList.remove('mdl-button--accent');
    questionButton.classList.add('mdl-button--primary');
  } else {
    questionButton.classList.add('mdl-button--accent');
    questionButton.classList.remove('mdl-button--primary');
  }
}

function getHelp() {
  updateQuestionStatistic(false);
  for (const i of Array(4).keys()) {
    let answerButton = document.getElementById(`Answer${i}`);
    if (answerButton.value === 'a') {
      let helpTimeout = 4000;
      showToast(answerButton.textContent, helpTimeout);
      setTimeout(showNextQuestion, helpTimeout);
      return;
    }
  }
}

function resetStatistic() {
  questionList.map((_, questionIndex) => {
    localStorage.removeItem(`Question${questionIndex + 1}`);
  });
  showToast('初始化统计数据', 1500);
}

export { initialize, showNextQuestion, chooseAnswer, setWalkingState, getHelp, resetStatistic };
