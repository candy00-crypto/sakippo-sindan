const START_KEY = "sakippo_diagnosis_started_at";
const LIMIT_HOURS = 24;
// 2025-11-21 20:00 (JST) を過ぎたら一度リセットするための時刻
const RESET_TIMESTAMP = new Date("2025-11-21T20:00:00+09:00").getTime();

const questions = [
  {
    text: "Q1. 恋人が仕事で落ち込んでいたら",
    a: "まず気持ちに寄り添って受け止める",
    b: "何も話しかけず、シカトする",
    correct: "A",
  },
  {
    text: "Q2. 相手が疲れて帰ってきた時は",
    a: "気づかないふりして自分の好きなことを続ける",
    b: "「大丈夫？」って隣に座って話を聞くようにする",
    correct: "B",
  },
  {
    text: "Q3. 恋人が体調を崩したら",
    a: "心配の言葉や介抱をして支えようとする",
    b: "特に何もしない",
    correct: "A",
  },
  {
    text: "Q4. 恋人の価値観が自分と違ったら",
    a: "否定して自分の考えを強要する",
    b: "そう思う理由を聞いて、なるべく理解しようとする",
    correct: "B",
  },
  {
    text: "Q5. 恋人が不安になってる時は",
    a: "「大丈夫？」って言葉をかけたりして安心させる",
    b: "放置する",
    correct: "A",
  },
  {
    text: "Q6. 相手の失敗を見た時",
    a: "励まして支える側に回る",
    b: "小馬鹿にしてマウントを取る",
    correct: "A",
  },
  {
    text: "Q7. 恋人が泣いてるのを見た時",
    a: "理由が分からなくても寄り添う",
    b: "あきれた顔でバカにする",
    correct: "A",
  },
  {
    text: "Q8. 会う予定がなかなか合わないとき",
    a: "感情的になって怒る",
    b: "会えるタイミングを一緒に探す",
    correct: "B",
  },
  {
    text: "Q9. 恋人が自分と違う意見を言った時",
    a: "話を聞いて、理解した上で自分の意見を伝える",
    b: "論破して黙らせる",
    correct: "A",
  },
  {
    text: "Q10. コンプレックスを持っていると知った時",
    a: "気持ちを尊重して大切に扱う",
    b: "馬鹿にして弱点として利用する",
    correct: "A",
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
const prevQuestionBtn = document.getElementById("prevQuestionBtn");

const compatibilityPercent = document.getElementById("compatibilityPercent");
const percentForMessage = document.getElementById("percentForMessage");
const resultMessage = document.getElementById("resultMessage");
const moreBtn = document.getElementById("moreBtn");
const resultImage = document.getElementById("resultImage");

let currentIndex = 0;
let answered = false;
let userAnswers = new Array(questions.length).fill(null);

function hasLimit() {
  const stored = localStorage.getItem(START_KEY);
  if (!stored) return false;
  const startedAt = Number(stored);
  if (Number.isNaN(startedAt)) return false;

  const now = Date.now();

  // 指定時刻（2025-11-21 17:20）を過ぎていたら制限を解除
  if (now >= RESET_TIMESTAMP) {
    return false;
  }

  const diffHours = (now - startedAt) / (1000 * 60 * 60);
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
  answered = false;
  userAnswers = new Array(questions.length).fill(null);
  resultSection.classList.add("hidden");
  questionSection.classList.remove("hidden");
  if (heroSection) {
    heroSection.classList.add("quiz-mode-hidden");
  }
  updateQuestion();
}

function updateGauge() {
  const answeredCount = userAnswers.filter((a) => a !== null).length;
  const progress = (answeredCount / questions.length) * 100;
  gaugeFill.style.width = `${progress}%`;
}

function updateQuestion() {
  const q = questions[currentIndex];
  currentQuestionNumber.textContent = currentIndex + 1;
  questionText.textContent = q.text;
  answerABtn.textContent = q.a;
  answerBBtn.textContent = q.b;

  if (currentIndex === 0) {
    answerHint.textContent = "直感で、これかもと思う方を選んでね♡";
  } else if (currentIndex < questions.length - 1) {
    answerHint.textContent = "テンポよく答えていくほど、本音に近づいていきます。";
  } else {
    answerHint.textContent = "これが最後の質問。ドキドキしながら選んでみてください。";
  }

  // 1問目のときは戻るボタンを非表示
  if (prevQuestionBtn) {
    if (currentIndex === 0) {
      prevQuestionBtn.classList.add("hidden");
    } else {
      prevQuestionBtn.classList.remove("hidden");
    }
  }

  updateGauge();
}

function calcCompatibility() {
  let wrongCount = 0;
  userAnswers.forEach((ans, index) => {
    if (ans && ans !== questions[index].correct) {
      wrongCount += 1;
    }
  });
  if (wrongCount === 0) return 98;
  if (wrongCount <= 2) return 95;
  return 90;
}

function getResultMessage(percent) {
  if (percent === 98) {
    return (
      "98%（運命級・ほぼ理想の相手）\n\n" +
      "【運命レベルで相性バッチリ…！】\n" +
      "ここまで一致するの、正直びっくり…\n" +
      "価値観も温度感も、さきっぽが“こうされたら嬉しい”って部分を\n" +
      "自然に分かってくれる人ってなかなかいないのに…。\n\n" +
      "もし現実に出会ってたら、何気なく隣に座って\n" +
      "当たり前に仲良くなってた気がする…♡\n\n" +
      "距離を縮めたら、恋に落ちるまでたぶん時間かからないと思います♡"
    );
  }
  if (percent === 95) {
    return (
      "95%（ほぼ理想・恋愛圏内）\n\n" +
      "めちゃくちゃ相性いい。恋人候補ゾーン♡ 考え方も近いし、話も合いそうで、「この人なら素でいられるかも」って思える距離感。まだ全部が完璧に噛み合ってるわけじゃないけど、その“余白”が逆にワクワクする…♡ これから仲が深まるほど、もっと惹かれていくタイプの相性です♡"
    );
  }
  return (
    "90%（十分高い・これから本命に育つ関係）\n\n" +
    "スタート地点からもう好相性だし、ちゃんと向き合ってくれたら普通に好きになると思う。少し価値観の違いもあるけど、そこを埋めるやり取りがむしろ“仲良くなるきっかけ”になりそう。「知っていくほど本命候補になる関係」って感じ…♡"
  );
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
      src = "IMG_8787.jpg";
      alt = "相性98％の診断結果イメージ";
    } else if (percent === 95) {
      src = "IMG_8788.jpg";
      alt = "相性95％の診断結果イメージ";
    } else {
      src = "IMG_8786.JPG";
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

  userAnswers[currentIndex] = answer;

  const isLast = currentIndex === questions.length - 1;

  if (isLast) {
    updateGauge();
    openLoadingModal();
    setTimeout(() => {
      closeLoadingModal();
      showResult();
      answered = false;
    }, 3000);
  } else {
    currentIndex += 1;
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
  window.open(
    "https://note.com/preview/n667f58ff6ee1?prev_access_key=ed086b68164313c16194264a73c93755",
    "_blank"
  );
});

if (prevQuestionBtn) {
  prevQuestionBtn.addEventListener("click", () => {
    if (currentIndex === 0 || answered) return;
    currentIndex -= 1;
    updateQuestion();
  });
}


