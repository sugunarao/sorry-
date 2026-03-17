// ── Stars ─────────────────────────────────────────
const canvas = document.getElementById("starCanvas");
const ctx    = canvas.getContext("2d");

function resizeCanvas(){
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const stars = Array.from({length: 120}, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  r: Math.random() * 1.4 + 0.3,
  alpha: Math.random() * 0.6 + 0.1,
  speed: Math.random() * 0.003 + 0.001,
  phase: Math.random() * Math.PI * 2
}));

let tick = 0;
function drawStars(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tick += 0.015;
  stars.forEach(s => {
    const a = s.alpha * (0.5 + 0.5 * Math.sin(tick * s.speed * 200 + s.phase));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232,200,122,${a})`;
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
drawStars();

// ── Audio ─────────────────────────────────────────
const startMusic = document.getElementById("startMusic");
const happyMusic = document.getElementById("happyMusic");
const sadMusic   = document.getElementById("sadMusic");

// ── Screen helper ─────────────────────────────────
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  const el = document.getElementById(id);
  el.style.display = "block";
  requestAnimationFrame(() => el.classList.add("active"));
}

// ── Envelope ──────────────────────────────────────
let envelopeOpened = false;
const envScene     = document.querySelector(".envelope-scene");
const envContainer = document.getElementById("envContainer");
const envHint      = document.getElementById("envHint");

envScene.addEventListener("click", () => {
  if(!envelopeOpened){
    envelopeOpened = true;
    envContainer.classList.add("open");
    envHint.textContent = "tap again to continue →";
    startMusic.currentTime = 0;
    startMusic.play().catch(() => {});
  } else {
    startMusic.pause();
    showScreen("screen1");
  }
});

// ── Accept ────────────────────────────────────────
document.getElementById("acceptBtn").addEventListener("click", () => {
  showScreen("screenAccepted");
  happyMusic.currentTime = 0;
  happyMusic.play().catch(() => {});
  startTyping();
  startEmojiRain();
});

// ── Deny ──────────────────────────────────────────
document.getElementById("denyBtn").addEventListener("click", () => {
  showScreen("screenDenied");
  sadMusic.currentTime = 0;
  sadMusic.play().catch(() => {});
});

// ── Redirect from denied ──────────────────────────
document.addEventListener("click", e => {
  if(e.target.id === "redirectAccept"){
    sadMusic.pause();
    showScreen("screenAccepted");
    happyMusic.currentTime = 0;
    happyMusic.play().catch(() => {});
    startTyping();
    startEmojiRain();
  }
});

// ── Typing ────────────────────────────────────────
function startTyping(){
  const text = "Bhasha Bhai, thanks for accepting my sorry.\nYour friendship means everything to me. 🫶";
  const el   = document.getElementById("typingText");
  el.innerHTML = "";
  let i = 0;
  function type(){
    if(i < text.length){
      el.innerHTML += text.charAt(i) === "\n" ? "<br>" : text.charAt(i);
      i++;
      setTimeout(type, 40);
    }
  }
  type();
}

// ══ GALLERY ══════════════════════════════════════
const galleryPhotos = [
  { src: "sorry accepted image.png", caption: "together always 💛"   },
  { src: "bhasha chai cafe.png",     caption: "chai cafe hangout ☕" },
  { src: "bhasha tree.png",          caption: "tree vibes 🌳"        },
  { src: "bhasha car.png",           caption: "car rides 🚗"         },
  { src: "bhasha sea.png",           caption: "sea feels 🌊"         }
];

let currentPhoto  = 0;
let autoSlide;

const overlay     = document.getElementById("galleryOverlay");
const galleryBg   = document.getElementById("galleryBg");
const galleryImg  = document.getElementById("galleryImg");
const galleryCapt = document.getElementById("galleryCaption");
const galleryDots = document.getElementById("galleryDots");
const counterEl   = document.getElementById("galleryCounter");

// build dots once
galleryPhotos.forEach((_, i) => {
  const d = document.createElement("div");
  d.className = "gdot" + (i === 0 ? " active" : "");
  galleryDots.appendChild(d);
});

function renderPhoto(idx, animate){
  const photo = galleryPhotos[idx];
  if(animate){
    galleryImg.classList.add("fade");
    setTimeout(() => {
      galleryImg.src = photo.src;
      galleryBg.style.backgroundImage = `url('${photo.src}')`;
      galleryImg.classList.remove("fade");
    }, 320);
  } else {
    galleryImg.src = photo.src;
    galleryBg.style.backgroundImage = `url('${photo.src}')`;
  }
  galleryCapt.textContent = photo.caption;
  counterEl.textContent   = `${idx + 1} / ${galleryPhotos.length}`;
  document.querySelectorAll(".gdot").forEach((d, i) => {
    d.classList.toggle("active", i === idx);
  });
}

function startAutoSlide(){
  clearInterval(autoSlide);
  autoSlide = setInterval(() => {
    currentPhoto = (currentPhoto + 1) % galleryPhotos.length;
    renderPhoto(currentPhoto, true);
  }, 3000);
}

function openGallery(){
  currentPhoto = 0;
  overlay.classList.add("open");
  renderPhoto(0, false);
  startAutoSlide();
}

function closeGallery(){
  overlay.classList.remove("open");
  clearInterval(autoSlide);
}

document.getElementById("galleryBtn").addEventListener("click", openGallery);
document.getElementById("galleryBack").addEventListener("click", closeGallery);

document.getElementById("prevBtn").addEventListener("click", () => {
  currentPhoto = (currentPhoto - 1 + galleryPhotos.length) % galleryPhotos.length;
  renderPhoto(currentPhoto, true);
  startAutoSlide();
});

document.getElementById("nextBtn").addEventListener("click", () => {
  currentPhoto = (currentPhoto + 1) % galleryPhotos.length;
  renderPhoto(currentPhoto, true);
  startAutoSlide();
});

// swipe
let touchStartX = 0;
overlay.addEventListener("touchstart", e => {
  touchStartX = e.touches[0].clientX;
}, {passive: true});

overlay.addEventListener("touchend", e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if(Math.abs(diff) > 50){
    currentPhoto = diff > 0
      ? (currentPhoto + 1) % galleryPhotos.length
      : (currentPhoto - 1 + galleryPhotos.length) % galleryPhotos.length;
    renderPhoto(currentPhoto, true);
    startAutoSlide();
  }
});

// ── Emoji rain ────────────────────────────────────
const rainEmojis = ["🎉","✨","🥳","💛","🌟","🎊","💫"];
let rainStarted  = false;

function startEmojiRain(){
  if(rainStarted) return;
  rainStarted = true;
  const container = document.getElementById("emojiRain");
  setInterval(() => {
    const em = document.createElement("div");
    em.className   = "rain-emoji";
    em.textContent = rainEmojis[Math.floor(Math.random() * rainEmojis.length)];
    em.style.left  = Math.random() * 100 + "vw";
    container.appendChild(em);
    setTimeout(() => em.remove(), 3000);
  }, 280);
}
