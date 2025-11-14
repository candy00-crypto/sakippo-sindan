const START_KEY = "sakippo_diagnosis_started_at";
const LIMIT_HOURS = 24;

const questions = [
  {
    text: "Q1. 女性への接し方は？",
    a: "気分で雑に扱う・すぐ否定する",
    b: "相手の気持ちを考えて言葉を選ぶ",
  },
  {
    text: "Q2. 恋人が疲れてる日にどうする？",
    a: "「お前の都合なんか知らん」で放置",
    b: "何も言わずにそばにいてくれる",
  },
  {
    text: "Q3. ケンカしたときの態度は？",
    a: "自分が正しい前提でキレる",
    b: "お互い落ち着いて話し合おうとする",
  },
  {
    text: "Q4. 彼女が泣いていたら？",
    a: "「うざい」で片づける",
    b: "理由よりもまず気持ちに寄り添う",
  },
  {
    text: "Q5. デートのときの姿勢は？",
    a: "めんどい、金も出したくない",
    b: "一緒にいる時間を大切にしたい",
  },
  {
    text: "Q6. LINEの返信は？",
    a: "気分で既読無視・ブロック",
    b: "忙しくても一言返す思いやりがある",
  },
  {
    text: "Q7. 愛情表現は？",
    a: "モラハラ・束縛・全て自分中心",
    b: "言葉でも行動でも安心感を渡せる",
  },
  {
    text: "Q8. 彼女が弱い部分を見せてきたら？",
    a: "「めんどい」で拒絶",
    b: "話す気になるまで側にいてくれる",
  },
  {
    text: "Q9. 女の子の体目的だけの行動は？",
    a: "ノリで手を出す・扱いが雑",
    b: "心が繋がった人を大切にしたい",
  },
  {
    text: "Q10. 長く続く恋愛に必要なのは？",
    a: "駆け引き・支配・気まぐれ",
    b: "信頼・安心・対等な関係",
  },
];

const startBtn = document.getElementById("startBtn");
const confirmModal = document.getElementById("confirmModal");
const limitModal = document.getElementById("limitModal");
const loadingModal = document.getElementById("loadingModal");
const confirmStartBtn = document.getElementById("confirmStartBtn");
const cancelStartBtn = document.getElementById("cancelStartBtn");
const limitOkBtn = document.getElementById("limitOkBtn");

const questionSection = document.getElementById("questionSection");
const resultSection = document.getElementById("resultSection");
const heroSection = document.getElementById("heroSection");
const questionText = document.getElementById("questionText");
const currentQuestionNumber = document.getElementById(
  "currentQuestionNumber"
);
const gaugeFill = document.getElementById("gaugeFill");
const answerABtn = document.getElementById("answerABtn");
const answerBBtn = document.getElementById("answerBBtn");
const answerHint = document.getElementById("answerHint");

const compatibilityPercent = document.getElementById("compatibilityPercent");
const percentForMessage = document.getElementById("percentForMessage");
const resultMessage = document.getElementById("resultMessage");
const moreBtn = document.getElementById("moreBtn");
const retryInfoBtn = document.getElementById("retryInfoBtn");
const resultImage = document.getElementById("resultImage");

let currentIndex = 0;
let countA = 0;
let answered = false;

function hasLimit() {
  const stored = localStorage.getItem(START_KEY);
  if (!stored) return false;
  const startedAt = Number(stored);
  if (Number.isNaN(startedAt)) return false;

  const diffHours = (Date.now() - startedAt) / (1000 * 60 * 60);
  return diffHours < LIMIT_HOURS;
}

function openConfirmModal() {
  confirmModal.classList.remove("hidden");
}

function closeConfirmModal() {
  confirmModal.classList.add("hidden");
}

function openLimitModal() {
  limitModal.classList.remove("hidden");
}

function closeLimitModal() {
  limitModal.classList.add("hidden");
}

function openLoadingModal() {
  loadingModal.classList.remove("hidden");
}

function closeLoadingModal() {
  loadingModal.classList.add("hidden");
}

function resetState() {
  currentIndex = 0;
  countA = 0;
  answered = false;
  resultSection.classList.add("hidden");
  questionSection.classList.remove("hidden");
   if (heroSection) {
    heroSection.classList.add("quiz-mode-hidden");
  }
  updateQuestion();
}

function updateGauge() {
  const progress = (currentIndex / questions.length) * 100;
  gaugeFill.style.width = `${progress}%`;
}

function updateQuestion() {
  const q = questions[currentIndex];
  currentQuestionNumber.textContent = currentIndex + 1;
  questionText.textContent = q.text;
  answerABtn.textContent = `A. ${q.a}`;
  answerBBtn.textContent = `B. ${q.b}`;

  if (currentIndex === 0) {
    answerHint.textContent = "直感で、いちばん「リアルにいそう」と思う方を選んでね♡";
  } else if (currentIndex < questions.length - 1) {
    answerHint.textContent = "テンポよく答えていくほど、本音に近づいていきます。";
  } else {
    answerHint.textContent = "これが最後の質問。ドキドキしながら選んでみてください。";
  }

  updateGauge();
}

function calcCompatibility() {
  if (countA === 0) return 98;
  if (countA <= 2) return 95;
  return 90;
}

function getResultMessage(percent) {
  if (percent === 98) {
    return "理想の彼との相性はほぼ満点級！あなたの感覚はかなり“自分を大切にしてくれる人”に向いています。このまま「安心できる愛情」を選び続ければ、幸せな恋が長く続きそう。";
  }
  if (percent === 95) {
    return "かなりいい線いっている相性です。少しだけ“ダメな彼”を許しちゃうクセがあるかも？でも、ちゃんと大事にしてくれる人を見抜く目も持っています。あと一歩、自分の心地よさを優先してみて。";
  }
  return "まだまだ“優しさ”よりも“刺激”を選びがちな相性かも。でも、ここから「どうされたいか」を知っていけば、恋の選び方は変えられます。自分を雑に扱う人からは、ちゃんと距離を取ってOK！";
}

function showResult() {
  const percent = calcCompatibility();
  compatibilityPercent.textContent = `${percent}%`;
  percentForMessage.textContent = `${percent}%`;
  resultMessage.textContent = getResultMessage(percent);

  if (resultImage) {
    let src = "";
    let alt = "";
    if (percent === 98) {
      src = "Image_fx - 2025-10-28T134550.371.jpg";
      alt = "相性98％の診断結果イメージ";
    } else if (percent === 95) {
      src = "Image_fx - 2025-10-28T134525.147.jpg";
      alt = "相性95％の診断結果イメージ";
    } else {
      src = "Image_fx - 2025-10-28T134437.585.jpg";
      alt = "相性90％の診断結果イメージ";
    }
    resultImage.src = src;
    resultImage.alt = alt;
  }

  questionSection.classList.add("hidden");
  resultSection.classList.remove("hidden");
}

function handleAnswer(answer) {
  if (answered) return;
  answered = true;

  if (answer === "A") {
    countA += 1;
  }

  currentIndex += 1;

  if (currentIndex >= questions.length) {
    updateGauge();
    openLoadingModal();
    setTimeout(() => {
      closeLoadingModal();
      showResult();
      answered = false;
    }, 3000);
  } else {
    setTimeout(() => {
      answered = false;
      updateQuestion();
    }, 220);
  }
}

startBtn.addEventListener("click", () => {
  if (hasLimit()) {
    openLimitModal();
    return;
  }
  openConfirmModal();
});

confirmStartBtn.addEventListener("click", () => {
  closeConfirmModal();
  localStorage.setItem(START_KEY, String(Date.now()));
  resetState();
  window.scrollTo({
    top: questionSection.offsetTop - 16,
    behavior: "smooth",
  });
});

cancelStartBtn.addEventListener("click", () => {
  closeConfirmModal();
});

limitOkBtn.addEventListener("click", () => {
  closeLimitModal();
});

answerABtn.addEventListener("click", () => handleAnswer("A"));
answerBBtn.addEventListener("click", () => handleAnswer("B"));

moreBtn.addEventListener("click", () => {
  window.open("https://www.yahoo.co.jp", "_blank");
});

retryInfoBtn.addEventListener("click", () => {
  alert("前回の診断から24時間経つと、またこっそり診断ができるようになります。");
});


