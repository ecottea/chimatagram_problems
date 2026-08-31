const cache = {};
let currentQuestions = [];
let currentIndex = 0;
let currentGenrePath = "";

async function init() {
  const select = document.getElementById('genreSelect');
  
  select.addEventListener('change', (e) => {
    loadGenre(e.target.value);
  });

  loadGenre(select.value);
}

async function loadGenre(filePath) {
  currentGenrePath = filePath;

  if (!cache[filePath]) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error('File not found');
      cache[filePath] = await response.json();
    } catch (e) {
      alert(`データファイル (${filePath}) の読み込みに失敗しました。`);
      clearDisplay();
      return;
    }
  }

  currentQuestions = cache[filePath];
  const totalCount = currentQuestions.length;
  document.getElementById('totalNum').textContent = `全 ${totalCount} 問`;

  if (totalCount === 0) {
    clearDisplay();
    return;
  }

  const savedIndex = localStorage.getItem(`chimatagram_progress_${filePath}`);
  if (savedIndex !== null && parseInt(savedIndex, 10) < totalCount) {
    currentIndex = parseInt(savedIndex, 10);
  } else {
    currentIndex = 0;
  }

  showQuestion(currentIndex);
}

function showQuestion(index) {
  if (index < 0 || index >= currentQuestions.length) return;

  currentIndex = index;
  const q = currentQuestions[currentIndex];

  document.getElementById('problemNum').textContent = `第 ${currentIndex + 1} 問`;
  document.getElementById('genreText').textContent = q.genre || '-';
  document.getElementById('questionText').textContent = q.question;
  document.getElementById('readingText').textContent = q.reading;
  
  document.getElementById('answerText').textContent = q.answer || '-';
  document.getElementById('extraCharText').textContent = q.extraChar;

  document.getElementById('answerArea').classList.add('hidden');
  document.getElementById('problemInput').value = currentIndex + 1;
  document.getElementById('problemInput').max = currentQuestions.length;

  localStorage.setItem(`chimatagram_progress_${currentGenrePath}`, currentIndex);
}

function clearDisplay() {
  document.getElementById('problemNum').textContent = "第 - 問";
  document.getElementById('totalNum').textContent = "全 0 問";
  document.getElementById('genreText').textContent = "-";
  document.getElementById('questionText').textContent = "-";
  document.getElementById('readingText').textContent = "-";
  document.getElementById('answerArea').classList.add('hidden');
}

// イベント設定
document.getElementById('showAnswerBtn').addEventListener('click', () => {
  document.getElementById('answerArea').classList.remove('hidden');
});

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentIndex - 1 >= 0) {
    showQuestion(currentIndex - 1);
  } else {
    alert('これが最初の問題です！');
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentIndex + 1 < currentQuestions.length) {
    showQuestion(currentIndex + 1);
  } else {
    alert('このジャンルの問題は以上です！');
  }
});

document.getElementById('goBtn').addEventListener('click', () => {
  const inputVal = parseInt(document.getElementById('problemInput').value, 10);
  if (!isNaN(inputVal) && inputVal >= 1 && inputVal <= currentQuestions.length) {
    showQuestion(inputVal - 1);
  } else {
    alert(`1 〜 ${currentQuestions.length} の範囲で指定してください。`);
  }
});

// ランダムボタンのイベント処理
document.getElementById('randomBtn').addEventListener('click', () => {
  if (currentQuestions.length === 0) return;
  if (currentQuestions.length === 1) {
    showQuestion(0);
    return;
  }
  let randomIndex;
  // 直前と同じ問題が連続で選ばれないようにする
  do {
    randomIndex = Math.floor(Math.random() * currentQuestions.length);
  } while (randomIndex === currentIndex);

  showQuestion(randomIndex);
});

init();