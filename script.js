const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Resize canvas to fit screen
canvas.width = window.innerWidth - 320;
canvas.height = window.innerHeight - 40;

// Inputs
const angleInput = document.getElementById("angle");
const velocityInput = document.getElementById("velocity");
const gravityInput = document.getElementById("gravity");
const outletXInput = document.getElementById("outletX");
const outletYInput = document.getElementById("outletY");

// Display spans
const angleVal = document.getElementById("angleVal");
const velocityVal = document.getElementById("velocityVal");
const gravityVal = document.getElementById("gravityVal");
const outletXVal = document.getElementById("outletXVal");
const outletYVal = document.getElementById("outletYVal");

const launchBtn = document.getElementById("launch");
const resetBtn = document.getElementById("reset");

let time = 0;
let animationId = null;

// Store landed projectiles
let landedProjectiles = [];

// Update UI values
angleInput.oninput = () => angleVal.textContent = angleInput.value;
velocityInput.oninput = () => velocityVal.textContent = velocityInput.value;
gravityInput.oninput = () => gravityVal.textContent = gravityInput.value;
outletXInput.oninput = () => outletXVal.textContent = outletXInput.value;
outletYInput.oninput = () => outletYVal.textContent = outletYInput.value;

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

// Draw everything
function redrawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw old landed projectiles
  landedProjectiles.forEach(p => {
    drawBall(p.x, p.y, "#ff9933");
  });

  // Draw outlet
  drawOutlet(outletXInput.value, outletYInput.value);
}

// Animation loop
function animate() {
  redrawScene();

  const angle = angleInput.value * Math.PI / 180;
  const velocity = velocityInput.value;
  const gravity = gravityInput.value;

  const outletX = Number(outletXInput.value);
  const outletY = Number(outletYInput.value);

  const vx = velocity * Math.cos(angle);
  const vy = velocity * Math.sin(angle);

  const x = outletX + vx * time * 6;
  const y = outletY - (vy * time * 6 - 0.5 * gravity * time * time * 6);

  drawBall(x, y);

  time += 0.05;

  // Stop when hits bottom of screen
  if (y < canvas.height - 5) {
    animationId = requestAnimationFrame(animate);
  } else {
    // Store landed projectile
    landedProjectiles.push({ x, y: canvas.height - 5 });
  }
}

// Launch
launchBtn.onclick = () => {
  cancelAnimationFrame(animationId);
  time = 0;
  animate();
};

// Reset
resetBtn.onclick = () => {
  cancelAnimationFrame(animationId);
  time = 0;
  landedProjectiles = [];
  redrawScene();
};

// Initial draw
redrawScene();
