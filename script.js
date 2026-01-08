const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 320;
canvas.height = window.innerHeight - 40;

// Inputs
const angleInput = document.getElementById("angle");
const velocityInput = document.getElementById("velocity");
const gravityInput = document.getElementById("gravity");
const outletXInput = document.getElementById("outletX");
const outletYInput = document.getElementById("outletY");

const angleVal = document.getElementById("angleVal");
const velocityVal = document.getElementById("velocityVal");
const gravityVal = document.getElementById("gravityVal");
const outletXVal = document.getElementById("outletXVal");
const outletYVal = document.getElementById("outletYVal");

const launchBtn = document.getElementById("launch");
const resetBtn = document.getElementById("reset");

// ================= WORLD SETTINGS =================
const GRID_SIZE = 50;          // pixels (constant)
let pixelsPerUnit = 50;        // zoom target
const BASE_PPU = 50;

let projectiles = [];
let draggingOutlet = false;

// ================= UI =================
angleInput.oninput = () => angleVal.textContent = angleInput.value;
velocityInput.oninput = () => velocityVal.textContent = velocityInput.value;
gravityInput.oninput = () => gravityVal.textContent = gravityInput.value;
outletXInput.oninput = () => outletXVal.textContent = outletXInput.value;
outletYInput.oninput = () => outletYVal.textContent = outletYInput.value;

// ================= GRID =================
function drawGrid() {
  ctx.strokeStyle = "#222";
  ctx.fillStyle = "#777";
  ctx.font = "12px monospace";

  // Vertical lines
  for (let x = 0; x < canvas.width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();

    const value = (x / pixelsPerUnit).toFixed(1);
    ctx.fillText(value, x + 2, 12);
  }

  // Horizontal lines
  for (let y = 0; y < canvas.height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();

    const value = (y / pixelsPerUnit).toFixed(1);
    ctx.fillText(value, 2, y - 2);
  }

  // Origin label
  ctx.fillText("(0,0)", 2, 12);
}

// ================= DRAWERS =================
function drawOutlet(x, y) {
  ctx.fillStyle = "#1e90ff";
  ctx.fillRect(x - 10, y - 10, 20, 20);
}

function drawBall(x, y, color = "red") {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// ================= MAIN LOOP =================
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  projectiles.forEach(p => {
    if (!p.active) {
      drawBall(p.x, p.y, "#ff9933");
      return;
    }

    p.t += 0.05;

    const worldX = p.vx * p.t;
    const worldY = p.vy * p.t - 0.5 * gravityInput.value * p.t * p.t;

    p.x = p.x0 + worldX * pixelsPerUnit;
    p.y = p.y0 - worldY * pixelsPerUnit;

    if (p.y > canvas.height + 1000) {
      p.active = false;
    }

    drawBall(p.x, p.y);
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
    active: true
  });
};

resetBtn.onclick = () => {
  projectiles = [];
};

// ================= DRAG OUTLET =================
canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const ox = +outletXInput.value;
  const oy = +outletYInput.value;

  if (Math.abs(mx - ox) < 15 && Math.abs(my - oy) < 15) {
    draggingOutlet = true;
  }
});

canvas.addEventListener("mousemove", e => {
  if (!draggingOutlet) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  outletXInput.value = mx;
  outletYInput.value = my;

  outletXVal.textContent = mx.toFixed(0);
  outletYVal.textContent = my.toFixed(0);
});

canvas.addEventListener("mouseup", () => draggingOutlet = false);
canvas.addEventListener("mouseleave", () => draggingOutlet = false);

// ================= ZOOM (UNIT SCALE ONLY) =================
canvas.addEventListener("wheel", e => {
  e.preventDefault();

  pixelsPerUnit += e.deltaY * -0.5;
  pixelsPerUnit = Math.max(10, Math.min(200, pixelsPerUnit));
});

// ================= START =================
update();
