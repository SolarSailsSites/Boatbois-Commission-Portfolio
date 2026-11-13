// --- 1. TAB SWITCHING & COPYRIGHT FOOTER MANAGEMENT ---
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const cardFooter = document.getElementById('cardFooter');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');

        // Hide copyright footer on preview & reviews, show on About, TOS, and Price
        if (targetId === 'preview' || targetId === 'reviews') {
            cardFooter.style.display = 'none';
        } else {
            cardFooter.style.display = 'block';
        }
    });
});

// --- 2. 60 FPS OPTIMIZED PROCEDURAL WET SALT FLAT ENGINE ---
const canvas = document.getElementById('saltFlatCanvas');
const ctx = canvas.getContext('2d');

const V_WIDTH = 256;
const V_HEIGHT = 144;
canvas.width = V_WIDTH;
canvas.height = V_HEIGHT;

const imgData = ctx.createImageData(V_WIDTH, V_HEIGHT);
const data = imgData.data;

const HORIZON_Y = Math.floor(V_HEIGHT * 0.42);

// SALT FLAT PALETTE BUFFER [R, G, B]
const cBuffer = [
    38, 102, 178, // 0,1,2: Deep Crisp Zenith Blue (Top Sky)
    118, 172, 224, // 3,4,5: Soft Cerulean Mid-Sky
    246, 232, 206, // 6,7,8: Pale Warm Horizon Glow (Low Sky)
    242, 248, 255, // 9: Cloud Top Rim Highlight
    194, 218, 242 // 10: Cloud Body Shading
];

// --- AMBIENT DRIZZLE ELLIPTICAL RIPPLE SYSTEM ---
let activeRipples = [];
let drizzleTimer = 0;

function spawnDrizzleRipple() {
    if (activeRipples.length > 20) return;
    activeRipples.push({
        x: Math.floor(Math.random() * V_WIDTH),
        y: HORIZON_Y + Math.floor(Math.random() * (V_HEIGHT - HORIZON_Y)),
        r: 0.5,
        maxR: 6.0 + Math.random() * 4.0,
        duration: 0.8 + Math.random() * 0.6,
        age: 0
    });
}

function updateRipples(dt) {
    drizzleTimer += dt;
    if (drizzleTimer >= 0.18) {
        drizzleTimer = 0;
        spawnDrizzleRipple();
    }

    for (let i = activeRipples.length - 1; i >= 0; i--) {
        let rip = activeRipples[i];
        rip.age += dt;
        rip.r = 0.5 + (rip.age / rip.duration) * rip.maxR;

        if (rip.age >= rip.duration) {
            activeRipples.splice(i, 1);
        }
    }
}

function hash2D(cx, cy) {
    const n = Math.sin(cx * 127.1 + cy * 311.7) * 43758.5453123;
    return n - Math.floor(n);
}

const mountainHeight = new Float32Array(V_WIDTH);
const macroLightMap = new Float32Array(V_WIDTH);

function initTerrain() {
    const smoothBase = new Float32Array(V_WIDTH);

    for (let x = 0; x < V_WIDTH; x++) {
        let h = 2.8 + Math.sin(x * 0.035) * 1.1;

        const d0 = (x - V_WIDTH * 0.12) / 22;
        h += 2.6 * Math.exp(-(d0 * d0));

        const d1 = (x - V_WIDTH * 0.35) / 13;
        h += 10.2 * Math.exp(-(d1 * d1));

        const dMid = (x - V_WIDTH * 0.48) / 10;
        h += 4.6 * Math.exp(-(dMid * dMid));

        const d2 = (x - V_WIDTH * 0.70) / 17;
        h += 11.2 * Math.exp(-(d2 * d2));

        const d3 = (x - V_WIDTH * 0.90) / 16;
        h += 5.2 * Math.exp(-(d3 * d3));

        smoothBase[x] = h;

        const silhouetteDetail = Math.sin(x * 0.22) * 0.45 + Math.cos(x * 0.48) * 0.25;
        mountainHeight[x] = Math.max(1.5, h + silhouetteDetail);
    }

    for (let x = 0; x < V_WIDTH; x++) {
        const leftSample = smoothBase[Math.max(0, x - 4)];
        const rightSample = smoothBase[Math.min(V_WIDTH - 1, x + 4)];
        macroLightMap[x] = Math.max(-1, Math.min(1, (rightSample - leftSample) * 0.35));
    }
}

initTerrain();

const numClouds = 18;
const clouds = [];

function randomizeCloud(cloud, startOnScreen, forcedX) {
    if (forcedX !== undefined) {
        cloud.x = forcedX;
    } else if (startOnScreen) {
        cloud.x = Math.random() * V_WIDTH;
    } else {
        cloud.x = -80 - Math.random() * 40;
    }

    cloud.y = 8 + Math.random() * (HORIZON_Y - 30);
    cloud.shapeType = Math.floor(Math.random() * 3);
    cloud.scale = 0.4 + Math.random() * 0.45;

    const tier = Math.floor(Math.random() * 3);
    if (tier === 0) {
        cloud.speed = 0.07;
    } else if (tier === 1) {
        cloud.speed = 0.12;
    } else {
        cloud.speed = 0.24;
    }
}

for (let i = 0; i < numClouds; i++) {
    clouds[i] = {};
    let initialX = (i * (V_WIDTH * 1.6 / numClouds)) - 60;
    randomizeCloud(clouds[i], true, initialX);
}

let time = 0;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;
let lastTime = performance.now();
let accumulator = 0;

function updateSimulation(dt) {
    time += 0.02;

    for (let i = 0; i < numClouds; i++) {
        clouds[i].x += clouds[i].speed;
        if (clouds[i].x > V_WIDTH + 60) {
            randomizeCloud(clouds[i], false);
        }
    }

    updateRipples(dt);
}

function getCloudPixelColor(x, y) {
    if (y >= HORIZON_Y) return null;

    for (let i = 0; i < numClouds; i++) {
        let cl = clouds[i];
        let cx = x - cl.x;
        let cy = y - Math.floor(cl.y);

        if (cy > 0 || cy < -4) continue;

        let isPixelInCloud = false;
        let sw = 26 * cl.scale;

        if (cl.shapeType === 0) {
            let abx = Math.abs(cx);
            if (cy === -1 && abx < sw * 1.3) isPixelInCloud = true;
            if (cy === -2 && abx < sw * 0.8) isPixelInCloud = true;
            if (cy === -3 && abx < sw * 0.4) isPixelInCloud = true;
        } else if (cl.shapeType === 1) {
            let stratusUpperOval = Math.sqrt((cx - sw * 0.25) * (cx - sw * 0.25) + (cy * 2.2) * (cy * 2.2));
            if (cy < 0 && stratusUpperOval < sw * 0.9) isPixelInCloud = true;
        } else if (cl.shapeType === 2) {
            let ey = cy * 2.6;
            let podLeft = Math.sqrt((cx + 4.5 * cl.scale) * (cx + 4.5 * cl.scale) + (ey + 2) * (ey + 2));
            let podRight = Math.sqrt((cx - 4.5 * cl.scale) * (cx - 4.5 * cl.scale) + (ey + 2) * (ey + 2));
            if (cy < 0 && (podLeft < 7 * cl.scale || podRight < 6 * cl.scale)) isPixelInCloud = true;
        }

        if (isPixelInCloud) {
            return {
                r: cBuffer[9],
                g: cBuffer[9],
                b: cBuffer[9],
                isCloud: true
            };
        }
    }
    return null;
}

function getAboveHorizonColor(x, y, t) {
    const mHeight = mountainHeight[x];
    const mTopY = HORIZON_Y - mHeight;

    if (y >= mTopY && y < HORIZON_Y) {
        const distFromPeak = y - mTopY;
        const heightPct = distFromPeak / mHeight;
        const lightDir = macroLightMap[x];

        let mr = 64;
        let mg = 62;
        let mb = 74;

        if (lightDir > 0) {
            mr += 26 * lightDir;
            mg += 20 * lightDir;
            mb += 10 * lightDir;
        } else {
            mr += 8 * lightDir;
            mg += 6 * lightDir;
            mb -= 4 * lightDir;
        }

        if (distFromPeak < 1.15) {
            mr += 24;
            mg += 20;
            mb += 14;
        }

        const edgeFade = Math.pow(Math.abs((x / V_WIDTH) - 0.52) * 1.4, 2) * 0.45;
        mr += 42 * edgeFade;
        mg += 46 * edgeFade;
        mb += 55 * edgeFade;

        mr += heightPct * 8;
        mg += heightPct * 9;
        mb += heightPct * 6;

        return { r: mr, g: mg, b: mb, isMnt: true };
    }

    const cloud = getCloudPixelColor(x, y);
    if (cloud) return cloud;

    const pctSky = y / HORIZON_Y;
    const rowWobble = Math.sin(y * 0.15 + t * 1.5) * 0.018 + Math.cos(t * 0.8) * 0.01;
    const colWobble = Math.cos(x * 0.08 - t * 1.2) * 0.015;
    const horizWarmth = Math.max(0, 1 - (x / V_WIDTH)) * 0.18;
    const adjustedPct = Math.min(1.0, Math.max(0.0, pctSky + horizWarmth * pctSky + rowWobble + colWobble));

    let r = 0,
        g = 0,
        b = 0;
    if (adjustedPct < 0.55) {
        const term = adjustedPct / 0.55;
        r = cBuffer[0] * (1 - term) + cBuffer[3] * term;
        g = cBuffer[1] * (1 - term) + cBuffer[4] * term;
        b = cBuffer[2] * (1 - term) + cBuffer[5] * term;
    } else {
        const term = (adjustedPct - 0.55) / 0.45;
        const easeT = term * term;
        r = cBuffer[3] * (1 - easeT) + cBuffer[6] * easeT;
        g = cBuffer[4] * (1 - easeT) + cBuffer[7] * easeT;
        b = cBuffer[5] * (1 - easeT) + cBuffer[8] * easeT;
    }
    return { r, g, b };
}

function getSubmergedSaltFloor(x, y, waterDepth) {
    const perspectiveScale = 0.18 / (0.05 + waterDepth * 1.4);
    const wx = (x - V_WIDTH * 0.5) * perspectiveScale;
    const wy = (y - HORIZON_Y) * perspectiveScale;

    const cellX = Math.floor(wx);
    const cellY = Math.floor(wy);
    let minDist = 8.0;
    let secondDist = 8.0;

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const cx = cellX + dx;
            const cy = cellY + dy;
            const h = hash2D(cx, cy);

            const px = cx + 0.5 + 0.35 * Math.sin(6.28 * h);
            const py = cy + 0.5 + 0.35 * Math.cos(6.28 * h);

            const distX = wx - px;
            const distY = wy - py;
            const dist = Math.sqrt(distX * distX + distY * distY);

            if (dist < minDist) {
                secondDist = minDist;
                minDist = dist;
            } else if (dist < secondDist) {
                secondDist = dist;
            }
        }
    }

    const edge = secondDist - minDist;
    const crackFade = Math.min(1.0, waterDepth * 2.2);
    let crack = 0.0;
    if (edge < 0.045 && crackFade > 0.05) {
        crack = (1.0 - edge / 0.045) * crackFade * 0.65;
    }

    const grain = (hash2D(x * 2.1, y * 2.1) - 0.5) * 0.12 * crackFade;

    return { crack, grain };
}

function renderFrame() {
    for (let y = 0; y < V_HEIGHT; y++) {
        const isWater = y >= HORIZON_Y;
        const distFromHorizon = y - HORIZON_Y;

        for (let x = 0; x < V_WIDTH; x++) {
            const idx = (y * V_WIDTH + x) * 4;

            let r = 0,
                g = 0,
                b = 0;
            let isCloudPixel = false;

            if (!isWater) {
                const sceneCol = getAboveHorizonColor(x, y, time);
                r = sceneCol.r;
                g = sceneCol.g;
                b = sceneCol.b;
                isCloudPixel = sceneCol.isCloud;
            } else {
                const waterDepth = distFromHorizon / (V_HEIGHT - HORIZON_Y);

                const salt = getSubmergedSaltFloor(x, y, waterDepth);

                let baseSaltR = 220 + salt.grain * 30;
                let baseSaltG = 230 + salt.grain * 30;
                let baseSaltB = 240 + salt.grain * 35;

                baseSaltR = baseSaltR * (1 - salt.crack) + 250 * salt.crack;
                baseSaltG = baseSaltG * (1 - salt.crack) + 252 * salt.crack;
                baseSaltB = baseSaltB * (1 - salt.crack) + 255 * salt.crack;

                const waveDistortion = Math.sin(y * 0.5 + time * 3.0) * 0.6 + Math.cos(x * 0.1 + time * 1.5) * 0.3;
                const sampleX = Math.min(V_WIDTH - 1, Math.max(0, Math.floor(x + waveDistortion)));

                const mirrorY = Math.max(0, Math.floor(HORIZON_Y - 1 - distFromHorizon));
                const reflectedCol = getAboveHorizonColor(sampleX, mirrorY, time);

                const baseBrineR = 45 * (1 - waterDepth) + 25 * waterDepth;
                const baseBrineG = 115 * (1 - waterDepth) + 75 * waterDepth;
                const baseBrineB = 205 * (1 - waterDepth) + 145 * waterDepth;

                const reflectFade = Math.max(0, 1.0 - (distFromHorizon / (V_HEIGHT - HORIZON_Y)) * 1.2);
                const reflectWeight = (reflectedCol.isMnt ? 0.75 : 0.90) * reflectFade;

                let surfR = baseBrineR * (1 - reflectWeight) + reflectedCol.r * reflectWeight;
                let surfG = baseBrineG * (1 - reflectWeight) + reflectedCol.g * reflectWeight;
                let surfB = baseBrineB * (1 - reflectWeight) + reflectedCol.b * reflectWeight;

                const submergeBlend = 0.28;
                r = baseSaltR * submergeBlend + surfR * (1 - submergeBlend);
                g = baseSaltG * submergeBlend + surfG * (1 - submergeBlend);
                b = baseSaltB * submergeBlend + surfB * (1 - submergeBlend);
            }

            const mistWave = Math.sin(x * 0.09 + time * 0.9) * 0.45 + Math.cos(x * 0.04 - time * 0.6) * 0.35;
            const shiftedDist = distFromHorizon + mistWave;

            if (shiftedDist > -2.5 && shiftedDist < 3.5) {
                const mistSpread = shiftedDist <= 0 ? 2.5 : 3.5;
                const normalizedDist = Math.abs(shiftedDist) / mistSpread;
                const mistAlpha = Math.pow(1.0 - normalizedDist, 1.6) * 0.72;

                const mistR = 235;
                const mistG = 242;
                const mistB = 248;

                r = r * (1 - mistAlpha) + mistR * mistAlpha;
                g = g * (1 - mistAlpha) + mistG * mistAlpha;
                b = b * (1 - mistAlpha) + mistB * mistAlpha;
            }

            if (!isWater) {
                const aboveDist = Math.abs(distFromHorizon);
                if (aboveDist < 4.5) {
                    const aboveMistAlpha = Math.pow(1.0 - (aboveDist / 4.5), 1.4) * 0.38;
                    const skyMistR = 215;
                    const skyMistG = 230;
                    const skyMistB = 245;

                    r = r * (1 - aboveMistAlpha) + skyMistR * aboveMistAlpha;
                    g = g * (1 - aboveMistAlpha) + skyMistG * aboveMistAlpha;
                    b = b * (1 - aboveMistAlpha) + skyMistB * aboveMistAlpha;
                }
            }

            if (!isWater && !isCloudPixel) {
                const isDitherTile = (x + y) % 2 === 0;
                const ditherOffset = isDitherTile ? 6 : -6;
                r = Math.min(255, Math.max(0, r + ditherOffset));
                g = Math.min(255, Math.max(0, g + ditherOffset));
                b = Math.min(255, Math.max(0, b + ditherOffset));
            }

            data[idx] = Math.round(Math.min(255, Math.max(0, r)) / 16) * 16;
            data[idx + 1] = Math.round(Math.min(255, Math.max(0, g)) / 16) * 16;
            data[idx + 2] = Math.round(Math.min(255, Math.max(0, b)) / 16) * 16;
            data[idx + 3] = 255;
        }
    }

    for (let rip of activeRipples) {
        let alpha = 0.35 * (1.0 - (rip.age / rip.duration));
        let rx = Math.round(rip.x),
            ry = Math.round(rip.y);
        let radius = rip.r;

        for (let deg = 0; deg < 360; deg += 12) {
            let rad = deg * (Math.PI / 180);
            let px = Math.round(rx + Math.cos(rad) * radius * 1.8);
            let py = Math.round(ry + Math.sin(rad) * radius * 0.8);

            if (px >= 0 && px < V_WIDTH && py >= HORIZON_Y && py < V_HEIGHT) {
                let i = (py * V_WIDTH + px) * 4;
                data[i] = Math.min(255, data[i] * (1 - alpha) + 210 * alpha);
                data[i + 1] = Math.min(255, data[i + 1] * (1 - alpha) + 240 * alpha);
                data[i + 2] = Math.min(255, data[i + 2] * (1 - alpha) + 255 * alpha);
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
}

function gameLoop(now) {
    let delta = now - lastTime;
    lastTime = now;

    if (delta > 250) delta = 250;
    accumulator += delta;

    let updated = false;
    while (accumulator >= FRAME_TIME) {
        updateSimulation(FRAME_TIME / 1000);
        accumulator -= FRAME_TIME;
        updated = true;
    }

    if (updated) {
        renderFrame();
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame((now) => {
    lastTime = now;
    renderFrame();
    requestAnimationFrame(gameLoop);
});

// --- 3. INTERACTIVE CLICK-TO-HIDE FOCUS CONTROLS ---
const canvasElement = document.getElementById('saltFlatCanvas');
const overlay = document.getElementById('overlay');
const hint = document.getElementById('hint');

function toggleFocus() {
    overlay.classList.toggle('hidden');
    hint.classList.toggle('hidden');
}

// Clicking canvas brings card back up when hidden
canvasElement.addEventListener('click', (e) => {
    toggleFocus();
});

// Clicking backdrop outside card hides it
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        toggleFocus();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Escape' || e.code === 'KeyH') {
        toggleFocus();
    }
});

// --- 4. REVIEW IMAGE LIGHTBOX MODAL VIEWER (Reviews Only) ---
const imageModal = document.getElementById('imageModal');
const expandedModalImg = document.getElementById('expandedModalImg');

function openImageModal(imgSrc) {
    if (!imageModal || !expandedModalImg) return;
    expandedModalImg.src = imgSrc;
    imageModal.classList.add('active');
}

function closeImageModal() {
    if (!imageModal) return;
    imageModal.classList.remove('active');
    setTimeout(() => {
        if (!imageModal.classList.contains('active') && expandedModalImg) {
            expandedModalImg.src = '';
        }
    }, 300);
}

// Attach lightbox click listener ONLY to review images
document.querySelectorAll('#reviews img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
        e.stopPropagation();
        openImageModal(img.src);
    });
});

// Automatically update copyright year
document.getElementById('current-year').innerText = new Date().getFullYear();