let canvas, ctx, width, height;
let points = [];
let paused = false;

// 화면 크기에 따라 포인트 개수 동적 결정
function getNumPoints(w, h) {
    const area = w * h;
    // 5,000 px²당 1개, 최소 60개, 최대 1200개 제한 (아주 높은 밀도)
    return Math.max(60, Math.min(1200, Math.round(area / 5000)));
}

self.onmessage = (e) => {
    const data = e.data;
    if (data.canvas) {
        canvas = data.canvas;
        ctx = canvas.getContext('2d');
        width = canvas.width = data.width;
        height = canvas.height = data.height;
        points = [];
        initPoints();
        animate();
    }
    if (data.pause !== undefined) {
        paused = data.pause;
    }
};

function initPoints() {
    const numPoints = getNumPoints(width, height);
    for (let i = 0; i < numPoints; i++) {
        const r = 1.2;
        const x = Math.random() * (width - r * 2) + r;
        const y = Math.random() * (height - r * 2) + r;
        const dx = (Math.random() - 0.5) * 1.5;
        const dy = (Math.random() - 0.5) * 1.5;
        points.push({ x, y, dx, dy, r });
    }
}

function updatePoints() {
    for (const p of points) {
        if (p.x + p.r > width || p.x - p.r < 0) p.dx = -p.dx;
        if (p.y + p.r > height || p.y - p.r < 0) p.dy = -p.dy;
        p.x += p.dx;
        p.y += p.dy;
        // Draw each point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
}

function connectPoints() {
    const maxDistance = 100;
    for (let a = 0; a < points.length; a++) {
        for (let b = a + 1; b < points.length; b++) {
            const dx = points[a].x - points[b].x;
            const dy = points[a].y - points[b].y;
            const distance = Math.hypot(dx, dy);
            if (distance < maxDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(225,225,225, ${1 - distance / maxDistance})`;
                ctx.lineWidth = 1;
                ctx.moveTo(points[a].x, points[a].y);
                ctx.lineTo(points[b].x, points[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    if (!paused) {
        updatePoints();
        connectPoints();
    }
    requestAnimationFrame(animate);
}

function getDotCount() {
  const width = window.innerWidth;
  if (width >= 1200) return 30;      // 데스크탑
  if (width >= 768) return 15;       // 태블릿
  return 8;                          // 모바일
}

function renderDots() {
  const dotContainer = document.querySelector('.bottom-dots ul');
  if (!dotContainer) return;
  dotContainer.innerHTML = ''; // 기존 점 제거

  const dotCount = getDotCount();
  for (let i = 0; i < dotCount; i++) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    li.appendChild(a);
    dotContainer.appendChild(li);
  }
}

// 최초 실행 및 리사이즈 대응
window.addEventListener('DOMContentLoaded', renderDots);
window.addEventListener('resize', renderDots);