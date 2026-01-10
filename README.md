# Projectile Motion Simulator

An interactive, browser-based physics simulation that visualizes **projectile motion** with realistic behavior such as **gravity, air resistance, collisions, and momentum-conserving bounces**.

Built for **Simverse Hackathon 2025**, this project focuses on making physics intuitive through real-time experimentation.

---

## About

Understanding projectile motion through equations alone can be unintuitive.  
This simulator bridges the gap between **theory and visualization** by allowing users to interactively modify physical parameters and observe how motion changes in real time.

The simulator acts as a **physics sandbox**, enabling users to:
- Experiment with launch conditions
- Visualize trajectories
- Observe realistic collisions
- Understand the effect of forces like gravity and air resistance

---

## Features

- Real-time projectile motion simulation  
- Launch projectiles at **any angle (0°–360°)**  
- Adjustable:
  - Initial velocity  
  - Gravity  
  - Time scale (slow motion)  
  - Zoom level  
- Draggable launch outlet  
- Trajectory path visualization (toggleable)  
- Camera follow mode (projectile POV)  
- User-created movable rectangular blocks  
- **Rigid-body collision with bounce**
  - Momentum-conserving reflections  
  - Energy loss via coefficient of restitution  
- **Air resistance (toggleable)**
  - Quadratic drag force for realistic damping  
- Anti-tunneling collision handling using physics sub-stepping  

---

## Physics Concepts Used

- Kinematic equations of motion  
- Velocity-based numerical integration  
- Conservation of momentum  
- Coefficient of restitution  
- Quadratic air drag  
- Rigid-body collision detection (circle–rectangle)  

---


## System Architecture

- Runs entirely on the **client side**
- User input handled via UI controls and mouse events
- Custom physics engine:
  - Sub-stepped simulation loop
  - Collision resolution
  - Force application (gravity & air drag)
- Rendering handled using Canvas for smooth animations

This design ensures **high performance, simplicity, and easy deployment**.

---

## How to Run

1. Clone the repository  
2. Open `index.html` in any modern browser  
3. Start experimenting 

No installation or setup required.
