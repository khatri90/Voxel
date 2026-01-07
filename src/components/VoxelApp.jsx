import React, { useEffect, useRef } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import * as THREE from 'three';
import { IconBuild, IconErase, IconGrab, IconReset, IconRotate, IconHandRight, IconHandLeft } from './UI/Icons';
import LoadingScreen from './UI/LoadingScreen';

const VOXEL_PALETTE = [
    { hex: 0xa5b4fc, str: "#a5b4fc", name: "Soft Indigo" },
    { hex: 0xfda4af, str: "#fda4af", name: "Soft Rose" },
    { hex: 0x6ee7b7, str: "#6ee7b7", name: "Soft Mint" },
    { hex: 0xfcd34d, str: "#fcd34d", name: "Soft Amber" },
    { hex: 0x00f3ff, str: "#00f3ff", name: "Cyber Cyan" },
    { hex: 0xff00ff, str: "#ff00ff", name: "Cyber Neon" },
    { hex: 0xffea00, str: "#ffea00", name: "Cyber Yellow" },
];

const VoxelApp = () => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [colorIdx, _setColorIdx] = React.useState(0);
    const activeColor = VOXEL_PALETTE[colorIdx];

    // Helper to sync state and ref
    const setColorIdx = (idx) => {
        _setColorIdx(idx);
        stateRef.current.colorIdx = idx;
    };

    const videoRef = useRef(null);
    const bioCanvasRef = useRef(null);
    const threeCanvasRef = useRef(null);
    const modeRef = useRef(null);
    const countRef = useRef(null);

    // Three.js refs
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const voxelGroupRef = useRef(null);
    const currentSketchRef = useRef(null);
    const crosshairRef = useRef(null);
    const placedVoxelsRef = useRef(new Map());

    // State refs
    const smoothedLandmarksRef = useRef({ Left: [], Right: [] });
    const stateRef = useRef({
        isGrabbing: false, grabTimer: 0,
        grabOffset: new THREE.Vector3(),
        isBuilding: false, buildTimer: 0,
        isErasing: false, eraseTimer: 0,
        resetTimer: 0, rotateTimer: 0,
        cycleTimer: 0, // For color cycling
        colorIdx: 0, // CRITICAL: Ref-based color index for closure access
        startPinchPos: null, activeAxis: null,
        sketchKeys: new Set(),
    });

    // Constants
    const GRID_SIZE = 1.2;
    const GRAB_HOLD = 500;
    const INTENT_HOLD = 500;
    const RESET_HOLD = 1000;
    const ROTATE_HOLD = 1000;
    const CYCLE_HOLD = 500; // Reduced to 500ms for faster cycling
    const PINCH_THRESHOLD = 0.05;

    useEffect(() => {
        // Initialize Three.js
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: threeCanvasRef.current, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const voxelGroup = new THREE.Group();
        scene.add(voxelGroup);
        const currentSketch = new THREE.Group();
        voxelGroup.add(currentSketch);

        const crosshair = new THREE.Mesh(
            new THREE.BoxGeometry(GRID_SIZE, GRID_SIZE, GRID_SIZE),
            new THREE.MeshBasicMaterial({ color: 0xa5b4fc, wireframe: true, transparent: true, opacity: 0.6 })
        );
        scene.add(crosshair);

        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(5, 10, 7);
        scene.add(sun);
        camera.position.z = 20;

        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        voxelGroupRef.current = voxelGroup;
        currentSketchRef.current = currentSketch;
        crosshairRef.current = crosshair;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Initialize MediaPipe Hands
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.8, minTrackingConfidence: 0.8 });
        hands.onResults(onResults);

        if (videoRef.current) {
            const cam = new Camera(videoRef.current, {
                onFrame: async () => {
                    if (bioCanvasRef.current && videoRef.current) {
                        bioCanvasRef.current.width = videoRef.current.videoWidth;
                        bioCanvasRef.current.height = videoRef.current.videoHeight;
                    }
                    if (videoRef.current) await hands.send({ image: videoRef.current });
                },
                width: 1280,
                height: 720,
            });
            cam.start().then(() => {
                setTimeout(() => setIsLoading(false), 2000); // Small delay for smooth transition
            });
        }

        // Handle resize
        const handleResize = () => {
            if (rendererRef.current && cameraRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const getDist = (p1, p2) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + (p1.z && p2.z ? Math.pow(p1.z - p2.z, 2) : 0));
    };

    const drawHUDVoxel = (ctx, x, y, progress, color) => {
        const size = 30;
        const h = size * Math.sin(Math.PI / 3);
        const yOffset = size / 2;

        // Helper to draw hexagon path
        const drawHex = () => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI / 3 * i - Math.PI / 6;
                const px = x + size * Math.cos(angle);
                const py = y + size * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
        };

        // 1. Draw Wireframe Background
        drawHex();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.stroke();

        // Inner Y lines for cube look
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x, y - size); // Top vertical (actually flat top in this orientation usually requires angles, let's just do a Y)
        // Correct Isometric Y: Center to Top-Left, Center to Top-Right, Center to Bottom
        // Let's stick to a simple outer Hex for the "fill" container to be clean.

        // 2. Draw Fill
        ctx.save();
        drawHex();
        ctx.clip(); // Clip to hexagon

        const fillHeight = (size * 2) * progress;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(x - size, y + size - fillHeight, size * 2, fillHeight);
        ctx.restore();

        // 3. Draw Wireframe Outline (Top Layer)
        drawHex();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 4. Glow
        if (progress > 0) {
            ctx.save();
            drawHex();
            ctx.shadowBlur = 20;
            ctx.shadowColor = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }
    };

    const drawHUDRing = (ctx, x, y, progress, color) => {
        // Background Ring
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Progress Ring
        if (progress > 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.beginPath();
            ctx.arc(x, y, 35, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.stroke();

            // Center Dot
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Reset Shadow
            ctx.shadowBlur = 0;
        }
    };

    const drawCyberHand = (ctx, landmarks, label) => {
        const bioCanvas = bioCanvasRef.current;
        const smoothed = smoothedLandmarksRef.current;

        if (!smoothed[label] || smoothed[label].length === 0) {
            smoothed[label] = landmarks.map(p => ({ ...p }));
        } else {
            landmarks.forEach((p, i) => {
                smoothed[label][i].x += (p.x - smoothed[label][i].x) * 0.45;
                smoothed[label][i].y += (p.y - smoothed[label][i].y) * 0.45;
                smoothed[label][i].z += (p.z - smoothed[label][i].z) * 0.1;
            });
        }
        const pts = smoothed[label];

        ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
        ctx.beginPath(); ctx.strokeStyle = "rgba(165, 180, 252, 0.8)"; ctx.lineWidth = 3;
        const CONNECTIONS = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [9, 10], [10, 11], [11, 12], [13, 14], [14, 15], [15, 16], [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17], [0, 5]];
        CONNECTIONS.forEach(([a, b]) => {
            ctx.moveTo(pts[a].x * bioCanvas.width, pts[a].y * bioCanvas.height);
            ctx.lineTo(pts[b].x * bioCanvas.width, pts[b].y * bioCanvas.height);
        });
        ctx.stroke();

        pts.forEach((pt, i) => {
            const x = pt.x * bioCanvas.width, y = pt.y * bioCanvas.height;
            if ([4, 8, 12, 16, 20].includes(i)) {
                ctx.strokeStyle = "#f9a8d4"; ctx.lineWidth = 2; ctx.strokeRect(x - 6, y - 6, 12, 12);
            } else {
                ctx.fillStyle = "#fff"; ctx.fillRect(x - 2, y - 2, 4, 4);
            }
        });
    };

    const addSketchVoxel = (x, y, z) => {
        const key = `${x.toFixed(1)},${y.toFixed(1)},${z.toFixed(1)}`;
        const s = stateRef.current;
        if (s.sketchKeys.has(key) || placedVoxelsRef.current.has(key)) return;

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(GRID_SIZE * 0.98, GRID_SIZE * 0.98, GRID_SIZE * 0.98),
            new THREE.MeshBasicMaterial({ color: 0xa5b4fc, wireframe: true })
        );
        mesh.position.set(x, y, z);
        currentSketchRef.current.add(mesh);
        s.sketchKeys.add(key);
    };

    const commitVoxels = () => {
        const currentSketch = currentSketchRef.current;
        const voxelGroup = voxelGroupRef.current;
        const placedVoxels = placedVoxelsRef.current;

        while (currentSketch.children.length > 0) {
            const f = currentSketch.children[0];
            const key = `${f.position.x.toFixed(1)},${f.position.y.toFixed(1)},${f.position.z.toFixed(1)}`;
            const cube = createFinalCube(f.position.x, f.position.y, f.position.z);
            voxelGroup.add(cube);
            placedVoxels.set(key, cube);
            currentSketch.remove(f);
        }
        if (countRef.current) countRef.current.innerText = placedVoxels.size;
    };

    const createFinalCube = (x, y, z) => {
        const g = new THREE.BoxGeometry(GRID_SIZE * 0.95, GRID_SIZE * 0.95, GRID_SIZE * 0.95);
        // Use Ref for color to ensure we get the latest value inside the closure
        const idx = stateRef.current.colorIdx !== undefined ? stateRef.current.colorIdx : 0;
        const col = VOXEL_PALETTE[idx];
        const m = new THREE.MeshPhongMaterial({
            color: col.hex,
            emissive: col.hex,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.9,
            shininess: 100
        });
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set(x, y, z);
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.5 })));
        return mesh;
    };

    const onResults = (results) => {
        const bioCanvas = bioCanvasRef.current;
        const bioCtx = bioCanvas?.getContext('2d');
        const crosshair = crosshairRef.current;
        const voxelGroup = voxelGroupRef.current;
        const s = stateRef.current;
        const smoothed = smoothedLandmarksRef.current;
        const placedVoxels = placedVoxelsRef.current;

        if (!bioCtx || !crosshair || !voxelGroup) return;

        bioCtx.clearRect(0, 0, bioCanvas.width, bioCanvas.height);
        crosshair.visible = false;

        if (!results.multiHandLandmarks) {
            s.isGrabbing = false; s.isBuilding = false; s.isErasing = false;
            s.grabTimer = 0; s.buildTimer = 0; s.eraseTimer = 0;
            s.resetTimer = 0; s.rotateTimer = 0;
            return;
        }

        let lHand = null, rHand = null;

        results.multiHandedness.forEach((hand, idx) => {
            const landmarks = results.multiHandLandmarks[idx];
            drawCyberHand(bioCtx, landmarks, hand.label);
            if (hand.label === 'Left') lHand = smoothed['Left'];
            if (hand.label === 'Right') rHand = smoothed['Right'];
        });

        // PEACE SIGN (Color Cycle) - Index & Middle UP, Ring & Pinky DOWN
        const isPeace = (h) => h && h[8].y < h[6].y && h[12].y < h[10].y && h[16].y > h[14].y && h[20].y > h[18].y;
        if (isPeace(lHand) || isPeace(rHand)) {
            if (s.cycleTimer < CYCLE_HOLD) {
                s.cycleTimer += 16;
                const h = isPeace(rHand) ? rHand : lHand;
                const curCol = VOXEL_PALETTE[stateRef.current.colorIdx || 0];
                drawHUDRing(bioCtx, h[9].x * bioCanvas.width, h[9].y * bioCanvas.height, s.cycleTimer / CYCLE_HOLD, curCol.str);
                if (modeRef.current) modeRef.current.innerText = "Cycling Color...";
            } else {
                const nextIdx = ((stateRef.current.colorIdx || 0) + 1) % VOXEL_PALETTE.length;
                setColorIdx(nextIdx);
                s.cycleTimer = 0;
            }
            return; // Stop other gestures while cycling
        } else {
            s.cycleTimer = 0;
        }

        // Two-Hand Gestures
        if (lHand && rHand) {
            const lFist = lHand[8].y > lHand[6].y && lHand[12].y > lHand[10].y && lHand[16].y > lHand[14].y;
            const rFist = rHand[8].y > rHand[6].y && rHand[12].y > rHand[10].y && rHand[16].y > rHand[14].y;
            const lPalm = lHand[8].y < lHand[6].y && lHand[12].y < lHand[10].y && lHand[20].y < lHand[18].y;
            const rPalm = rHand[8].y < rHand[6].y && rHand[12].y < rHand[10].y && rHand[20].y < rHand[18].y;



            // RESET
            if (lFist && rFist) {
                s.rotateTimer = 0;
                if (s.resetTimer < RESET_HOLD) {
                    s.resetTimer += 16;
                    drawHUDRing(bioCtx, bioCanvas.width / 2, bioCanvas.height / 2, s.resetTimer / RESET_HOLD, "#fca5a5");
                    if (modeRef.current) modeRef.current.innerText = "Resetting...";
                } else {
                    voxelGroup.position.set(0, 0, 0);
                    voxelGroup.rotation.set(0, 0, 0);
                    if (modeRef.current) modeRef.current.innerText = "Reset Complete";
                }
                return;
            } else {
                s.resetTimer = 0;
            }

            // ROTATE
            if (lPalm && rPalm) {
                if (s.rotateTimer < ROTATE_HOLD) {
                    s.rotateTimer += 16;
                    drawHUDRing(bioCtx, bioCanvas.width / 2, bioCanvas.height / 2, s.rotateTimer / ROTATE_HOLD, "#5eead4");
                    if (modeRef.current) modeRef.current.innerText = "Enabling Rotate...";
                } else {
                    if (modeRef.current) modeRef.current.innerText = "Rotating Model";
                    voxelGroup.rotation.y += (rHand[9].x - lHand[9].x - 0.5) * 0.05;
                    voxelGroup.rotation.x += (rHand[9].y - lHand[9].y) * 0.05;
                }
                return;
            } else {
                s.rotateTimer = 0;
            }
        } else {
            s.resetTimer = 0;
            s.rotateTimer = 0;
        }

        // Left Hand: Pinch & Grab
        let lPinching = false;
        if (lHand) {
            const isFist = lHand[8].y > lHand[6].y && lHand[12].y > lHand[10].y && lHand[16].y > lHand[14].y;
            const isPalm = lHand[8].y < lHand[6].y && lHand[12].y < lHand[10].y;
            lPinching = getDist(lHand[4], lHand[8]) < PINCH_THRESHOLD;
            const handWorldPos = new THREE.Vector3((0.5 - lHand[9].x) * 25, (0.5 - lHand[9].y) * 18, 0);

            if (isFist) {
                if (s.grabTimer < GRAB_HOLD) {
                    s.grabTimer += 16;
                    drawHUDRing(bioCtx, lHand[0].x * bioCanvas.width, lHand[0].y * bioCanvas.height, s.grabTimer / GRAB_HOLD, "#fbbf24");
                } else {
                    if (!s.isGrabbing) { s.grabOffset.copy(voxelGroup.position).sub(handWorldPos); s.isGrabbing = true; }
                    voxelGroup.position.copy(handWorldPos).add(s.grabOffset);
                    if (modeRef.current) modeRef.current.innerText = "Grabbed";
                }
            } else {
                s.isGrabbing = false; s.grabTimer = 0;
                if (isPalm && modeRef.current) modeRef.current.innerText = "Scanning";
            }
        }

        // Right Hand: Build & Erase
        if (rHand) {
            const thumbTip = rHand[4], indexTip = rHand[8], midTip = rHand[12];
            const pinchingNow = getDist(thumbTip, indexTip) < PINCH_THRESHOLD;
            const pointingNow = indexTip.y < rHand[6].y && midTip.y > rHand[10].y;
            const palmOpen = rHand[8].y < rHand[6].y && rHand[12].y < rHand[10].y && rHand[20].y < rHand[18].y;

            const px = indexTip.x * bioCanvas.width, py = indexTip.y * bioCanvas.height;
            const worldPos = new THREE.Vector3((0.5 - indexTip.x) * 25, (0.5 - indexTip.y) * 18, -indexTip.z * 25);
            const localPos = voxelGroup.worldToLocal(worldPos.clone());
            const gx = Math.round(localPos.x / GRID_SIZE) * GRID_SIZE;
            const gy = Math.round(localPos.y / GRID_SIZE) * GRID_SIZE;
            const gz = Math.round(localPos.z / GRID_SIZE) * GRID_SIZE;

            // ERASE
            if (lPinching && pointingNow && !palmOpen) {
                s.buildTimer = 0;
                if (s.eraseTimer < INTENT_HOLD) {
                    s.eraseTimer += 16;
                    drawHUDRing(bioCtx, px, py, s.eraseTimer / INTENT_HOLD, "#fca5a5");
                    if (modeRef.current) modeRef.current.innerText = "Locking Eraser...";
                } else {
                    s.isErasing = true;
                    const key = `${gx.toFixed(1)},${gy.toFixed(1)},${gz.toFixed(1)}`;
                    if (placedVoxels.has(key)) {
                        voxelGroup.remove(placedVoxels.get(key));
                        placedVoxels.delete(key);
                        if (countRef.current) countRef.current.innerText = placedVoxels.size;
                    }
                    if (modeRef.current) modeRef.current.innerText = "Erasing";
                }
            }
            // BUILD
            else if (pinchingNow && !s.isGrabbing && !palmOpen) {
                s.eraseTimer = 0;
                if (s.buildTimer < INTENT_HOLD) {
                    s.buildTimer += 16;
                    // Use active cycling color for the build ring!
                    const curCol = VOXEL_PALETTE[stateRef.current.colorIdx || 0];
                    drawHUDRing(bioCtx, px, py, s.buildTimer / INTENT_HOLD, curCol.str);
                    if (modeRef.current) modeRef.current.innerText = "Syncing Build...";
                } else {
                    if (!s.isBuilding) {
                        s.startPinchPos = { x: gx, y: gy, z: gz };
                        s.sketchKeys.clear();
                        s.isBuilding = true;
                        s.activeAxis = null;
                    } else {
                        const dx = Math.abs(gx - s.startPinchPos.x), dy = Math.abs(gy - s.startPinchPos.y), dz = Math.abs(gz - s.startPinchPos.z);
                        if (!s.activeAxis && (dx > 0.4 || dy > 0.4 || dz > 0.4)) {
                            if (dx >= dy && dx >= dz) s.activeAxis = 'x';
                            else if (dy >= dx && dy >= dz) s.activeAxis = 'y';
                            else s.activeAxis = 'z';
                        }
                        let tx = s.startPinchPos.x, ty = s.startPinchPos.y, tz = s.startPinchPos.z;
                        if (s.activeAxis === 'x') tx = gx; else if (s.activeAxis === 'y') ty = gy; else if (s.activeAxis === 'z') tz = gz;
                        addSketchVoxel(tx, ty, tz);
                    }
                    if (modeRef.current) modeRef.current.innerText = "Building";
                }
            }
            // RELEASE
            else {
                if (palmOpen) {
                    if (s.isBuilding) commitVoxels();
                    s.isBuilding = false; s.isErasing = false;
                    s.buildTimer = 0; s.eraseTimer = 0;
                    if (modeRef.current) modeRef.current.innerText = "Ready";
                }
            }

            // Crosshair
            if (s.isBuilding || s.buildTimer > 0 || s.isErasing || s.eraseTimer > 0) {
                crosshair.visible = true;
                crosshair.position.copy(voxelGroup.localToWorld(new THREE.Vector3(gx, gy, gz)));
                crosshair.material.color.set((s.isErasing || s.eraseTimer > 0) ? 0xfca5a5 : 0xa5b4fc);
            }
        }
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-slate-100 font-sans selection:bg-indigo-100">
            {/* UI Container */}
            <div className="absolute inset-0 pointer-events-none z-50 p-8 flex flex-col justify-between">

                {/* Header Card */}
                <div className="flex justify-between items-start">
                    <div className="glass-panel p-6 flex flex-col gap-2 min-w-[200px] animate-fade-in">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse"></div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-700">VOXEL SCULPT</h1>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-sm font-medium text-slate-500">
                                <span>SYSTEM STATUS</span>
                                <span className="text-emerald-500">ONLINE</span>
                            </div>
                            <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-500">
                                <div className="flex justify-between items-center">
                                    <span>PALETTE</span>
                                    <span style={{ color: activeColor.str }}>{activeColor.name}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {VOXEL_PALETTE.map((col, idx) => (
                                        <button
                                            key={col.name}
                                            onClick={() => setColorIdx(idx)}
                                            className={`w-6 h-6 rounded-full shadow-sm border-2 transition-all ${colorIdx === idx ? 'border-indigo-500 scale-110' : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: col.str }}
                                            title={col.name}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-slate-500">
                                <span>MODE</span>
                                <span ref={modeRef} className="text-indigo-500 font-bold">INITIALIZING</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-slate-500">
                                <span>BLOCKS</span>
                                <span ref={countRef} className="text-indigo-500 font-bold">0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gesture Guide Card */}
                <div className="glass-panel p-6 max-w-sm self-start animate-slide-up">
                    <h3 className="font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">GESTURE GUIDE</h3>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded flex items-center justify-center bg-indigo-100 text-indigo-600">
                                <IconBuild className="w-5 h-5" />
                            </span>
                            <span>Pinch Right to <strong className="text-indigo-500">Build</strong></span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded flex items-center justify-center bg-rose-100 text-rose-500">
                                <IconErase className="w-5 h-5" />
                            </span>
                            <span>Pinch Left + Point Right to <strong className="text-rose-500">Erase</strong></span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded flex items-center justify-center bg-amber-100 text-amber-600">
                                <IconGrab className="w-5 h-5" />
                            </span>
                            <span>Hold Left Fist to <strong className="text-amber-600">Grab & Move</strong></span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="flex gap-2">
                                <span className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-500">
                                    <IconReset className="w-4 h-4" />
                                </span>
                                <span className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-500">
                                    <IconRotate className="w-4 h-4" />
                                </span>
                            </div>
                            <span className="text-slate-400 text-xs">Reset (Fists) | Rotate (Palms)</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Video Feed (Hidden UI, just visuals) */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-0"
            />

            {/* 3D Scene */}
            <canvas
                ref={threeCanvasRef}
                className="absolute inset-0 z-10 pointer-events-none"
            />

            {/* Biometric Overlay */}
            <canvas
                ref={bioCanvasRef}
                className="absolute inset-0 w-full h-full z-20 -scale-x-100 pointer-events-none"
            />

            {/* Loading Screen */}
            {isLoading && <LoadingScreen />}
        </div>
    );
};

export default VoxelApp;
