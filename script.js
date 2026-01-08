const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const angleInput = document.getElementById("angle");
const velocityInput = document.getElementById("velocity");
const gravityInput = document.getElementById("gravity");

const angleVal = document.getElementById("angleVal");
const velocityVal = document.getElementById("velocityVal");
const gravityVal = document.getElementById("gravityVal");

const launchBtn = document.getElementById("launch");
const resetBtn = document.getElementById("reset");

let time = 0;
let animationId = null;

const startX = 50;
const groundY = canvas.height - 50;

// Update UI values
angleInput.oninput = () => angleVal.textContent = angleInput.value;
velocityInput.oninput = () => velocityVal.textContent = velocityInput.value;
gravityInput.oninput = () => gravityVal.textContent = gravityInput.value;

// Draw ground and axes
function drawBase() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.strokeStyle = "#555";
  ctx.stroke();
}

// Draw projectile
function drawBall(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
}

// Animation loop
function animate() {
  drawBase();

  const angle = angleInput.value * Math.PI / 180;
  const velocity = velocityInput.value;
  const gravity = gravityInput.value;

  const vx = velocity * Math.cos(angle);
  const vy = velocity * Math.sin(angle);

  const x = startX + vx * time * 5;
  const y = groundY - (vy * time * 5 - 0.5 * gravity * time * time * 5);

  drawBall(x, y);

  time += 0.05;

  if (y <= groundY) {
    animationId = requestAnimationFrame(animate);
  }
}

// Launch button
launchBtn.onclick = () => {
  cancelAnimationFrame(animationId);
  time = 0;
  animate();
};

// Reset button
resetBtn.onclick = () => {
  cancelAnimationFrame(animationId);
  time = 0;
  drawBase();
};

// Initial draw
drawBase();
