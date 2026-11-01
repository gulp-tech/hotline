/**
 * Hotline — игровой движок narrativ-игры.
 * Управляет сценами, диалогами, выборами, состоянием и озвучкой персонажей.
 */

const state = JSON.parse(JSON.stringify(DIALOGUE.initialState));
let currentSceneId = 'start';
let nodeIndex = 0;
let isWaitingForChoice = false;
let isPlayingAudio = false;
let currentAudio = null;

// DOM
const screenTitle = document.getElementById('screen-title');
const screenGame = document.getElementById('screen-game');
const screenEnding = document.getElementById('screen-ending');
const elClock = document.getElementById('clock');
const elCallStatus = document.getElementById('call-status');
const elPortrait = document.getElementById('portrait');
const elSpeaker = document.getElementById('speaker');
const elText = document.getElementById('text');
const elChoices = document.getElementById('choices');
const elHint = document.getElementById('continue-hint');
const elDialogueBox = document.querySelector('.dialogue-box');
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');

function getCurrentNode() {
  return DIALOGUE.scenes[currentSceneId][nodeIndex];
}

function showScreen(screen) {
  [screenTitle, screenGame, screenEnding].forEach(s => s.classList.remove('visible'));
  screen.classList.add('visible');
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  isPlayingAudio = false;
}

function playNodeAudio(node) {
  stopAudio();
  if (!node.audio) {
    isPlayingAudio = false;
    // Fallback на браузерный TTS, если аудиофайла нет
    speakFallback(node.text, node.voice);
    return;
  }
  isPlayingAudio = true;
  elHint.style.display = 'none';
  currentAudio = new Audio(node.audio);
  currentAudio.addEventListener('error', () => {
    isPlayingAudio = false;
    currentAudio = null;
    elHint.style.display = 'block';
  });
  currentAudio.play().catch(() => {
    // Если браузер заблокировал автовоспроизведение — покажем подсказку
    isPlayingAudio = false;
    elHint.style.display = 'block';
  });
  currentAudio.addEventListener('ended', () => {
    isPlayingAudio = false;
    currentAudio = null;
    if (!isWaitingForChoice) elHint.style.display = 'block';
  });
}

function speakFallback(text, voiceKey) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = DIALOGUE.voices[voiceKey] || DIALOGUE.voices.operator;
  u.lang = v.lang;
  u.rate = v.rate;
  u.pitch = v.pitch;
  u.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(vo => vo.lang.startsWith(v.lang.split('-')[0]));
  if (match) u.voice = match;
  u.onend = () => {
    if (!isWaitingForChoice) elHint.style.display = 'block';
  };
  window.speechSynthesis.speak(u);
}

function renderNode() {
  stopAudio();
  const node = getCurrentNode();
  const speakerInfo = DIALOGUE.speakers[node.speaker] || DIALOGUE.speakers.system;

  elDialogueBox.className = 'dialogue-box ' + (node.borderClass || '');
  elSpeaker.className = 'speaker ' + (speakerInfo.colorClass || '');
  elSpeaker.textContent = speakerInfo.label;
  elPortrait.innerHTML = '<div class="portrait-face">' + speakerInfo.face + '</div>';
  elPortrait.className = 'character-portrait ' + (node.borderClass || '');

  elText.textContent = node.text;

  playNodeAudio(node);

  if (node.choices && node.choices.length > 0) {
    showChoices(node.choices);
    isWaitingForChoice = true;
  } else {
    isWaitingForChoice = false;
  }

  if (node.ending) {
    setTimeout(showEnding, 1500, node.ending);
  }
}

function showChoices(choices) {
  elChoices.innerHTML = '';
  elHint.style.display = 'none';
  choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice.text;
    btn.addEventListener('click', () => handleChoice(choice));
    elChoices.appendChild(btn);
  });
}

function handleChoice(choice) {
  stopAudio();
  if (choice.flag) {
    Object.assign(state, choice.flag);
  }
  state.calls += 1;
  updateClock();

  if (choice.next) {
    currentSceneId = choice.next;
    nodeIndex = 0;
    renderNode();
  } else {
    nodeIndex += 1;
    if (nodeIndex >= DIALOGUE.scenes[currentSceneId].length) {
      showEnding(state.ending || 'leave');
    } else {
      renderNode();
    }
  }
}

function updateClock() {
  const hours = Math.floor(state.calls / 2);
  const minutes = (state.calls * 17) % 60;
  elClock.textContent = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
}

function showEnding(endingKey) {
  stopAudio();
  const ending = DIALOGUE.endings[endingKey] || DIALOGUE.endings.leave;
  document.getElementById('ending-title').textContent = ending.title;
  document.getElementById('ending-text').textContent = ending.text;
  showScreen(screenEnding);
}

// ---------- Управление ----------
btnStart.addEventListener('click', () => {
  stopAudio();
  showScreen(screenGame);
  renderNode();
});

btnRestart.addEventListener('click', () => {
  stopAudio();
  Object.assign(state, JSON.parse(JSON.stringify(DIALOGUE.initialState)));
  currentSceneId = 'start';
  nodeIndex = 0;
  updateClock();
  showScreen(screenTitle);
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('choice-btn')) return;
  if (screenEnding.classList.contains('visible')) return;

  if (isPlayingAudio) {
    stopAudio();
    elHint.style.display = 'block';
    return;
  }

  if (screenGame.classList.contains('visible') && !isWaitingForChoice) {
    nodeIndex += 1;
    if (nodeIndex >= DIALOGUE.scenes[currentSceneId].length) {
      showEnding(state.ending || 'leave');
    } else {
      renderNode();
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (isPlayingAudio) {
      stopAudio();
      elHint.style.display = 'block';
      return;
    }
    if (screenGame.classList.contains('visible') && !isWaitingForChoice) {
      nodeIndex += 1;
      if (nodeIndex >= DIALOGUE.scenes[currentSceneId].length) {
        showEnding(state.ending || 'leave');
      } else {
        renderNode();
      }
    }
  }
});

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {};
}
