const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 320;
canvas.height = window.innerHeight - 40;

// UI
const angleInput = document.getElementById("angle");
const velocityInput = document.getElementById("velocity");
const gravityInput = document.getElementById("gravity");
const outletXInput = document.getElementById("outletX");
const outletYInput = document.getElementById("outletY");

const slowBtn = document.getElementById("slow");
const pathToggleBtn = document.getElementById("pathToggle");
const vectorToggleBtn = document.getElementById("vectorToggle");
const cameraToggleBtn = document.getElementById("cameraToggle");

const launchBtn = document.getElementById("launch");
const resetBtn = document.getElementById("reset");

// ================= WORLD =================
const GRID_SIZE = 50;
let pixelsPerUnit = 50;
let timeScale = 1;

let showPath = true;
let showVector = true;
let cameraFollow = false;

let cameraOffsetX = 0;
let cameraOffsetY = 0;

let projectiles = [];
let draggingOutlet = false;
let rotatingAngle = false;

// ================= GRID =================
function drawGrid() {
  ctx.strokeStyle = "#222";
  ctx.fillStyle = "#777";
  ctx.font = "12px monospace";

  for (let x = -canvas.width; x < canvas.width * 2; x += GRID_SIZE) {
    const wx = x - cameraOffsetX;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
    ctx.fillText((wx / pixelsPerUnit).toFixed(1), x + 2, 12);
  }

  for (let y = -canvas.height; y < canvas.height * 2; y += GRID_SIZE) {
    const wy = y - cameraOffsetY;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    ctx.fillText((wy / pixelsPerUnit).toFixed(1), 2, y - 2);
  }
}

// ================= DRAWERS =================
function drawOutlet(x, y) {
  ctx.fillStyle = "#1e90ff";
  ctx.fillRect(x - 10 + cameraOffsetX, y - 10 + cameraOffsetY, 20, 20);

  // Angle indicator
  ctx.strokeStyle = "#0ff";
  ctx.beginPath();
  ctx.moveTo(x + cameraOffsetX, y + cameraOffsetY);
  ctx.lineTo(
    x + Math.cos(angleInput.value * Math.PI / 180) * 40 + cameraOffsetX,
    y - Math.sin(angleInput.value * Math.PI / 180) * 40 + cameraOffsetY
  );
  ctx.stroke();
}

function drawBall(x, y) {
  ctx.beginPath();
  ctx.arc(x + cameraOffsetX, y + cameraOffsetY, 5, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
}

function drawVector(p) {
  if (!showVector) return;
  ctx.strokeStyle = "#00ff00";
  ctx.beginPath();
  ctx.moveTo(p.x0 + cameraOffsetX, p.y0 + cameraOffsetY);
  ctx.lineTo(
    p.x0 + p.vx * 10 + cameraOffsetX,
    p.y0 - p.vy * 10 + cameraOffsetY
  );
  ctx.stroke();
}

// ================= LOOP =================
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  projectiles.forEach(p => {
    if (!p.active) return;

    p.t += 0.016 * timeScale;

    const wx = p.vx * p.t;
    const wy = p.vy * p.t - 0.5 * gravityInput.value * p.t * p.t;

    p.x = p.x0 + wx * pixelsPerUnit;
    p.y = p.y0 - wy * pixelsPerUnit;

    if (showPath) p.path.push({ x: p.x, y: p.y });

    if (p.y > canvas.height + 2000) p.active = false;

    if (showPath) {
      ctx.strokeStyle = "#ff9933";
      ctx.beginPath();
      p.path.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x + cameraOffsetX, pt.y + cameraOffsetY);
        else ctx.lineTo(pt.x + cameraOffsetX, pt.y + cameraOffsetY);
      });
      ctx.stroke();
    }

    drawBall(p.x, p.y);
    drawVector(p);

    if (cameraFollow) {
      cameraOffsetX = canvas.width / 2 - p.x;
      cameraOffsetY = canvas.height / 2 - p.y;
    }
  });

  drawOutlet(+outletXInput.value, +outletYInput.value);
  requestAnimationFrame(update);
}

// ================= ACTIONS =================
launchBtn.onclick = () => {
  const angle = angleInput.value * Math.PI / 180;
  const velocity = velocityInput.value;

  projectiles.push({
    x0: +outletXInput.value,
    y0: +outletYInput.value,
    vx: velocity * Math.cos(angle),
    vy: velocity * Math.sin(angle),
    t: 0,
    x: 0,
    y: 0,
    path: [],
    active: true
  });
};

resetBtn.onclick = () => {
  projectiles = [];
  cameraOffsetX = 0;
  cameraOffsetY = 0;
};

// ================= TOGGLES =================
slowBtn.onclick = () => timeScale = timeScale === 1 ? 0.25 : 1;
pathToggleBtn.onclick = () => showPath = !showPath;
vectorToggleBtn.onclick = () => showVector = !showVector;
cameraToggleBtn.onclick = () => cameraFollow = !cameraFollow;

// ================= DRAG & ANGLE =================
canvas.addEventListener("mousedown", e => {
  const mx = e.offsetX - cameraOffsetX;
  const my = e.offsetY - cameraOffsetY;

  const ox = +outletXInput.value;
  const oy = +outletYInput.value;

  if (Math.hypot(mx - ox, my - oy) < 15) draggingOutlet = true;
  else rotatingAngle = true;
});

canvas.addEventListener("mousemove", e => {
  const mx = e.offsetX - cameraOffsetX;
  const my = e.offsetY - cameraOffsetY;

  if (draggingOutlet) {
    outletXInput.value = mx;
    outletYInput.value = my;
  }

  if (rotatingAngle) {
    const ox = +outletXInput.value;
    const oy = +outletYInput.value;
    const dx = mx - ox;
    const dy = oy - my;
    angleInput.value = Math.atan2(dy, dx) * 180 / Math.PI;
  }
});

canvas.addEventListener("mouseup", () => {
  draggingOutlet = false;
  rotatingAngle = false;
});

// ================= START =================
update();
