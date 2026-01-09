const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 320;
canvas.height = window.innerHeight - 40;

// ================= CONSTANTS =================
const GRID_SIZE = 50;
const BALL_RADIUS = 5;
const RESTITUTION = 0.8;
const SUBSTEPS = 6;

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
const blockModeBtn = document.getElementById("blockMode");

const launchBtn = document.getElementById("launch");
const resetBtn = document.getElementById("reset");

// ================= WORLD =================
let pixelsPerUnit = 50;
let timeScale = 1;

let showPath = true;
let cameraFollow = false;
let blockMode = false;

let cameraOffsetX = 0;
let cameraOffsetY = 0;

let projectiles = [];
let blocks = [];

// interaction state
let draggingOutlet = false;
let rotatingAngle = false;
let drawingBlock = false;
let draggingBlock = null;

let blockStart = null;
let previewBlock = null;

// ================= UI SYNC =================
function syncUI() {
  angleVal.textContent = Math.round(angleInput.value);
  velocityVal.textContent = velocityInput.value;
  gravityVal.textContent = gravityInput.value;
  outletXVal.textContent = Math.round(outletXInput.value);
  outletYVal.textContent = Math.round(outletYInput.value);
  zoomVal.textContent = zoomInput.value;
}

[
  angleInput, velocityInput, gravityInput,
  outletXInput, outletYInput, zoomInput
].forEach(el => el.oninput = syncUI);

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

// ================= DRAW =================
function drawOutlet(x, y) {
  ctx.fillStyle = "#1e90ff";
  ctx.fillRect(x + cameraOffsetX - 10, y + cameraOffsetY - 10, 20, 20);

  const a = angleInput.value * Math.PI / 180;
  ctx.strokeStyle = "#0ff";
  ctx.beginPath();
  ctx.moveTo(x + cameraOffsetX, y + cameraOffsetY);
  ctx.lineTo(
    x + Math.cos(a) * 40 + cameraOffsetX,
    y + Math.sin(a) * 40 + cameraOffsetY
  );
  ctx.stroke();
}

function drawBall(x, y) {
  ctx.beginPath();
  ctx.arc(x + cameraOffsetX, y + cameraOffsetY, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
}

function drawBlock(b, preview = false) {
  ctx.fillStyle = preview
    ? "rgba(0,200,0,0.3)"
    : "rgba(200,200,200,0.6)";
  ctx.fillRect(
    b.x + cameraOffsetX,
    b.y + cameraOffsetY,
    b.w,
    b.h
  );
}

// ================= COLLISION =================
function resolveCircleRectCollision(p, b) {
  const cx = Math.max(b.x, Math.min(p.x, b.x + b.w));
  const cy = Math.max(b.y, Math.min(p.y, b.y + b.h));

  const dx = p.x - cx;
  const dy = p.y - cy;

  const distSq = dx * dx + dy * dy;
  if (distSq > BALL_RADIUS * BALL_RADIUS) return;

  const dist = Math.sqrt(distSq) || 0.0001;
  const nx = dx / dist;
  const ny = dy / dist;

  const penetration = BALL_RADIUS - dist;
  p.x += nx * penetration;
  p.y += ny * penetration;

  const vDotN = p.vx * nx + p.vy * ny;
  if (vDotN < 0) {
    p.vx -= (1 + RESTITUTION) * vDotN * nx;
    p.vy -= (1 + RESTITUTION) * vDotN * ny;
  }
}

// ================= MAIN LOOP =================
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  blocks.forEach(b => drawBlock(b));
  if (previewBlock) drawBlock(previewBlock, true);

  const frameDt = 0.016 * timeScale;
  const subDt = frameDt / SUBSTEPS;

  projectiles.forEach(p => {
    for (let i = 0; i < SUBSTEPS; i++) {
      p.vy += gravityInput.value * subDt;
      p.x += p.vx * subDt * pixelsPerUnit;
      p.y += p.vy * subDt * pixelsPerUnit;

      for (const b of blocks) {
        resolveCircleRectCollision(p, b);
      }
    }

    // ALWAYS store path
    p.path.push({ x: p.x, y: p.y });

    // DRAW PATH ONLY IF TOGGLED ON
    if (showPath) {
      ctx.strokeStyle = "#ff9933";
      ctx.beginPath();
      p.path.forEach((pt, i) => {
        if (i === 0)
          ctx.moveTo(pt.x + cameraOffsetX, pt.y + cameraOffsetY);
        else
          ctx.lineTo(pt.x + cameraOffsetX, pt.y + cameraOffsetY);
      });
      ctx.stroke();
    }

    drawBall(p.x, p.y);

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
  const a = angleInput.value * Math.PI / 180;
  const v = velocityInput.value;

  projectiles.push({
    x: +outletXInput.value,
    y: +outletYInput.value,
    vx: Math.cos(a) * v,
    vy: Math.sin(a) * v,
    path: []
  });
};

resetBtn.onclick = () => {
  projectiles = [];
  blocks = [];
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

blockModeBtn.onclick = () => {
  blockMode = !blockMode;
  blockModeBtn.classList.toggle("active");
};

// ================= MOUSE =================
canvas.addEventListener("mousedown", e => {
  const mx = e.offsetX - cameraOffsetX;
  const my = e.offsetY - cameraOffsetY;

  if (blockMode) {
    drawingBlock = true;
    blockStart = { x: mx, y: my };
    previewBlock = null;
    return;
  }

  for (const b of blocks) {
    if (mx >= b.x && mx <= b.x + b.w &&
        my >= b.y && my <= b.y + b.h) {
      draggingBlock = b;
      return;
    }
  }

  const ox = +outletXInput.value;
  const oy = +outletYInput.value;

  if (Math.hypot(mx - ox, my - oy) < 15) draggingOutlet = true;
  else rotatingAngle = true;
});

canvas.addEventListener("mousemove", e => {
  const mx = e.offsetX - cameraOffsetX;
  const my = e.offsetY - cameraOffsetY;

  if (drawingBlock && blockStart) {
    previewBlock = {
      x: Math.min(blockStart.x, mx),
      y: Math.min(blockStart.y, my),
      w: Math.abs(mx - blockStart.x),
      h: Math.abs(my - blockStart.y)
    };
    return;
  }

  if (draggingBlock) {
    draggingBlock.x = mx - draggingBlock.w / 2;
    draggingBlock.y = my - draggingBlock.h / 2;
    return;
  }

  if (draggingOutlet) {
    outletXInput.value = mx;
    outletYInput.value = my;
    syncUI();
  }

  if (rotatingAngle) {
    const ox = +outletXInput.value;
    const oy = +outletYInput.value;
    angleInput.value =
      (Math.atan2(my - oy, mx - ox) * 180 / Math.PI + 360) % 360;
    syncUI();
  }
});

canvas.addEventListener("mouseup", () => {
  if (drawingBlock && previewBlock) blocks.push(previewBlock);
  drawingBlock = false;
  previewBlock = null;
  draggingOutlet = false;
  rotatingAngle = false;
  draggingBlock = null;
});

// ================= START =================
update();
