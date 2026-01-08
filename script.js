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
const blockModeBtn = document.getElementById("blockMode");

const launchBtn = document.getElementById("launch");
const resetBtn = document.getElementById("reset");

// ================= WORLD =================
const GRID_SIZE = 50;
let pixelsPerUnit = 50;
let timeScale = 1;

let showPath = true;
let cameraFollow = false;
let blockMode = false;

let cameraOffsetX = 0;
let cameraOffsetY = 0;

let projectiles = [];
let blocks = [];

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
  ctx.arc(x + cameraOffsetX, y + cameraOffsetY, 5, 0, Math.PI * 2);
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
function circleRectCollision(px, py, r, b) {
  const cx = Math.max(b.x, Math.min(px, b.x + b.w));
  const cy = Math.max(b.y, Math.min(py, b.y + b.h));
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

// ================= LOOP =================
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  blocks.forEach(b => drawBlock(b));
  if (previewBlock) drawBlock(previewBlock, true);

  projectiles.forEach(p => {
    if (p.active) {
      p.t += 0.016 * timeScale;

      // PHYSICS (correct gravity direction)
      const wx = p.vx * p.t;
      const wy = p.vy * p.t + 0.5 * gravityInput.value * p.t * p.t;

      p.x = p.x0 + wx * pixelsPerUnit;
      p.y = p.y0 + wy * pixelsPerUnit;

      // Collision with blocks (stop)
      for (const b of blocks) {
        if (circleRectCollision(p.x, p.y, 5, b)) {
          p.active = false;
          break;
        }
      }

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
  const a = angleInput.value * Math.PI / 180;
  const v = velocityInput.value;

  projectiles.push({
    x0: +outletXInput.value,
    y0: +outletYInput.value,
    vx: Math.cos(a) * v,
    vy: Math.sin(a) * v,
    t: 0,
    x: 0,
    y: 0,
    path: [],
    active: true
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
