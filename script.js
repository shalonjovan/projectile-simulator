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

// Value displays
const angleVal = document.getElementById("angleVal");
const velocityVal = document.getElementById("velocityVal");
const gravityVal = document.getElementById("gravityVal");
const outletXVal = document.getElementById("outletXVal");
const outletYVal = document.getElementById("outletYVal");

const launchBtn = document.getElementById("launch");
const resetBtn = document.getElementById("reset");

const SCALE = 6;
let projectiles = [];

// Drag logic
let draggingOutlet = false;

// UI updates
angleInput.oninput = () => angleVal.textContent = angleInput.value;
velocityInput.oninput = () => velocityVal.textContent = velocityInput.value;
gravityInput.oninput = () => gravityVal.textContent = gravityInput.value;
outletXInput.oninput = () => outletXVal.textContent = outletXInput.value;
outletYInput.oninput = () => outletYVal.textContent = outletYInput.value;

// Draw grid
function drawGrid() {
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// Draw outlet
function drawOutlet(x, y) {
  ctx.fillStyle = "#1e90ff";
  ctx.fillRect(x - 10, y - 10, 20, 20);
}

// Draw projectile
function drawBall(x, y, color = "red") {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// Main render loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  // Update projectiles
  projectiles.forEach(p => {
    if (!p.active) return;

    p.t += 0.05;

    const x = p.x0 + p.vx * p.t * SCALE;
    const y = p.y0 - (p.vy * p.t * SCALE - 0.5 * gravityInput.value * p.t * p.t * SCALE);

    if (y > canvas.height - 5) {
      p.active = false;
      p.y = canvas.height - 5;
      p.x = x;
    } else {
      p.x = x;
      p.y = y;
    }

    drawBall(p.x, p.y);
  });

  drawOutlet(outletXInput.value, outletYInput.value);

  requestAnimationFrame(update);
}

// Launch new projectile
launchBtn.onclick = () => {
  const angle = angleInput.value * Math.PI / 180;
  const velocity = velocityInput.value;

  projectiles.push({
    x0: Number(outletXInput.value),
    y0: Number(outletYInput.value),
    vx: velocity * Math.cos(angle),
    vy: velocity * Math.sin(angle),
    t: 0,
    active: true
  });
};

// Reset
resetBtn.onclick = () => {
  projectiles = [];
};

// Mouse interaction for dragging outlet
canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const ox = outletXInput.value;
  const oy = outletYInput.value;

  if (Math.abs(mx - ox) < 15 && Math.abs(my - oy) < 15) {
    draggingOutlet = true;
  }
});

canvas.addEventListener("mousemove", e => {
  if (!draggingOutlet) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  outletXInput.value = Math.max(0, Math.min(canvas.width, mx));
  outletYInput.value = Math.max(0, Math.min(canvas.height, my));

  outletXVal.textContent = outletXInput.value;
  outletYVal.textContent = outletYInput.value;
});

canvas.addEventListener("mouseup", () => draggingOutlet = false);
canvas.addEventListener("mouseleave", () => draggingOutlet = false);

// Start loop
update();
