const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 320;
canvas.height = window.innerHeight - 40;

// ================= UI =================
const angleInput = document.getElementById("angle");
const velocityInput = document.getElementById("velocity");
const gravityInput = document.getElementById("gravity");
const outletXInput = document.getElementById("outletX");
const outletYInput = document.getElementById("outletY");
const zoomInput = document.getElementById("zoom");

const angleVal = document.getElementById("angleVal");
const velocityVal = document.getElementById("velocityVal");
const gravityVal = document.getElementById("gravityVal");
const outletXVal = document.getElementById("outletXVal");
const outletYVal = document.getElementById("outletYVal");
const zoomVal = document.getElementById("zoomVal");

const slowBtn = document.getElementById("slow");
const pathToggleBtn = document.getElementById("pathToggle");
const cameraToggleBtn = document.getElementById("cameraToggle");

const launchBtn = document.getElementById("launch");
const resetBtn = document.getElementById("reset");

// ================= WORLD =================
const GRID_SIZE = 50;
let pixelsPerUnit = 50;
let timeScale = 1;

let showPath = true;
let cameraFollow = false;

let cameraOffsetX = 0;
let cameraOffsetY = 0;

let projectiles = [];
let draggingOutlet = false;
let rotatingAngle = false;

// ================= UI SYNC =================
function syncUI() {
  angleVal.textContent = angleInput.value;
  velocityVal.textContent = velocityInput.value;
  gravityVal.textContent = gravityInput.value;
  outletXVal.textContent = Math.round(outletXInput.value);
  outletYVal.textContent = Math.round(outletYInput.value);
  zoomVal.textContent = zoomInput.value;
}

[
  angleInput, velocityInput, gravityInput,
  outletXInput, outletYInput, zoomInput
].forEach(i => i.oninput = syncUI);

zoomInput.oninput = () => {
  pixelsPerUnit = Number(zoomInput.value);
  syncUI();
};

syncUI();

// ================= GRID =================
function drawGrid() {
  ctx.strokeStyle = "#222";
  ctx.fillStyle = "#777";
  ctx.font = "12px monospace";

  for (let x = 0; x < canvas.width; x += GRID_SIZE) {
    const wx = (x - cameraOffsetX) / pixelsPerUnit;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
    ctx.fillText(wx.toFixed(1), x + 2, 12);
  }

  for (let y = 0; y < canvas.height; y += GRID_SIZE) {
    const wy = (y - cameraOffsetY) / pixelsPerUnit;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    ctx.fillText(wy.toFixed(1), 2, y - 2);
  }

  ctx.fillText("(0,0)", 2, 12);
}

// ================= DRAWERS =================
function drawOutlet(x, y) {
  ctx.fillStyle = "#1e90ff";
  ctx.fillRect(x + cameraOffsetX - 10, y + cameraOffsetY - 10, 20, 20);

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

// ================= LOOP =================
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  projectiles.forEach(p => {
    if (p.active) {
      p.t += 0.016 * timeScale;

      const wx = p.vx * p.t;
      const wy = p.vy * p.t - 0.5 * gravityInput.value * p.t * p.t;

      p.x = p.x0 + wx * pixelsPerUnit;
      p.y = p.y0 - wy * pixelsPerUnit;

      if (p.y > canvas.height + 2000) p.active = false;

      p.path.push({ x: p.x, y: p.y });
    }

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

    if (cameraFollow && p.active) {
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
slowBtn.onclick = () => {
  timeScale = timeScale === 1 ? 0.25 : 1;
  slowBtn.classList.toggle("active");
};

pathToggleBtn.onclick = () => {
  showPath = !showPath;
  pathToggleBtn.classList.toggle("active");
};

cameraToggleBtn.onclick = () => {
  cameraFollow = !cameraFollow;
  cameraToggleBtn.classList.toggle("active");
};

// ================= OUTLET CONTROL =================
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
    syncUI();
  }

  if (rotatingAngle) {
    const ox = +outletXInput.value;
    const oy = +outletYInput.value;
    angleInput.value = Math.atan2(oy - my, mx - ox) * 180 / Math.PI;
    syncUI();
  }
});

canvas.addEventListener("mouseup", () => {
  draggingOutlet = false;
  rotatingAngle = false;
});

// ================= START =================
update();
