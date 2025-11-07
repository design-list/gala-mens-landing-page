window.onload = function(){
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let cw = window.innerWidth;
  let ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;

  let fireworks = [];
  let particles = [];
  let hue = 120;
  let running = true;

  // --- Utility ---
  function random(min, max) {
    return min + Math.random() * (max - min);
  }
  function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
  }

  // --- Firework class ---
  class Firework {
    constructor(sx, sy, tx, ty) {
      this.x = sx;
      this.y = sy;
      this.sx = sx;
      this.sy = sy;
      this.tx = tx;
      this.ty = ty;
      this.distanceToTarget = dist(sx, sy, tx, ty);
      this.distanceTraveled = 0;
      this.coordinates = Array(3).fill([sx, sy]);
      this.angle = Math.atan2(ty - sy, tx - sx);
      this.speed = 0.6;      // slower
      this.accel = 1.04;     // smoother curve
      this.brightness = random(50, 70);
    }

    update(index) {
      this.speed *= this.accel;
      const vx = Math.cos(this.angle) * this.speed;
      const vy = Math.sin(this.angle) * this.speed;
      this.distanceTraveled = dist(this.sx, this.sy, this.x + vx, this.y + vy);

      if (this.distanceTraveled >= this.distanceToTarget) {
        createParticles(this.tx, this.ty);
        fireworks.splice(index, 1);
      } else {
        this.x += vx;
        this.y += vy;
      }

      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);
    }

    draw() {
      ctx.beginPath();
      ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
      ctx.stroke();
    }
  }

  // --- Particle class ---
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.coordinates = Array(5).fill([x, y]);
      this.angle = random(0, Math.PI * 2);
      this.speed = random(1, 5);
      this.friction = 0.94;
      this.gravity = 1;
      this.hue = random(hue - 50, hue + 50);
      this.brightness = random(50, 80);
      this.alpha = 1;
      this.decay = random(0.005, 0.01);
    }

    update(index) {
      this.speed *= this.friction;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed + this.gravity;
      this.alpha -= this.decay;
      if (this.alpha <= 0) particles.splice(index, 1);

      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);
    }

    draw() {
      ctx.beginPath();
      ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
      ctx.stroke();
    }
  }

  function createParticles(x, y) {
    let count = 80;
    while (count--) particles.push(new Particle(x, y));
  }

  // --- Animation loop ---
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);

    hue += 0.5;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = "lighter";

    fireworks.forEach((fw, i) => { fw.draw(); fw.update(i); });
    particles.forEach((p, i) => { p.draw(); p.update(i); });

    // auto random fireworks
    if (Math.random() < 0.05) {
      fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
    }
  }

  // Resize support
  window.addEventListener("resize", () => {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;
  });

  // Start animation
  loop();

  // Stop after 5 seconds, fade + hide canvas
  setTimeout(() => {
    running = false;
    canvas.style.opacity = "0";
    setTimeout(() => {
      canvas.style.display = "none";
    }, 3000); // after fade-out
  }, 10000);
};