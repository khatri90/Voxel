import React, { useEffect, useRef } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { useStore } from '../store/useStore';

const HandManager = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const { setStats, setMode, resetVoxels, commitSketchVoxels, clearSketchVoxels, mode } = useStore();

    // Local state for gesture smoothing/timers
    const stateRef = useRef({
        lHand: null, rHand: null,
        smoothedLandmarks: { Left: [], Right: [] },
        timers: { grab: 0, build: 0, erase: 0, rotate: 0, reset: 0 },
        isGrabbing: false,
        isBuilding: false,
        isErasing: false,
        // Constants
        GRAB_HOLD: 500,
        INTENT_HOLD: 500,
        RESET_HOLD: 1000,
        ROTATE_HOLD: 1000,
    });

    useEffect(() => {
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.8,
            minTrackingConfidence: 0.8,
        });

        hands.onResults(onResults);

        if (videoRef.current) {
            const camera = new Camera(videoRef.current, {
                onFrame: async () => {
                    if (videoRef.current) await hands.send({ image: videoRef.current });
                },
                width: 1280,
                height: 720,
            });
            camera.start();
        }
    }, []);

    const drawHUDCircle = (ctx, x, y, progress, color) => {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(x, y, 35, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
        ctx.lineWidth = 5; ctx.strokeStyle = color; ctx.stroke();
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.lineWidth = 1; ctx.stroke();
        ctx.setLineDash([]);
    };

    const drawCyberHand = (ctx, landmarks, label) => {
        const s = stateRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Smoothing
        if (!s.smoothedLandmarks[label] || s.smoothedLandmarks[label].length === 0) {
            s.smoothedLandmarks[label] = landmarks.map(p => ({ ...p }));
        } else {
            landmarks.forEach((p, i) => {
                s.smoothedLandmarks[label][i].x += (p.x - s.smoothedLandmarks[label][i].x) * 0.45;
                s.smoothedLandmarks[label][i].y += (p.y - s.smoothedLandmarks[label][i].y) * 0.45;
                s.smoothedLandmarks[label][i].z += (p.z - s.smoothedLandmarks[label][i].z) * 0.1;
            });
        }
        const pts = s.smoothedLandmarks[label];

        // Draw Lines
        ctx.shadowBlur = 10; ctx.shadowColor = "#00f0ff";
        ctx.beginPath(); ctx.strokeStyle = "rgba(0, 240, 255, 0.6)"; ctx.lineWidth = 2;
        const CONNECTIONS = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [9, 10], [10, 11], [11, 12], [13, 14], [14, 15], [15, 16], [0, 17], [17, 18], [18, 19], [19, 20], [5, 9], [9, 13], [13, 17], [0, 5]];
        CONNECTIONS.forEach(([a, b]) => {
            ctx.moveTo(pts[a].x * canvas.width, pts[a].y * canvas.height);
            ctx.lineTo(pts[b].x * canvas.width, pts[b].y * canvas.height);
        });
        ctx.stroke();

        // Draw Points
        pts.forEach((pt, i) => {
            const x = pt.x * canvas.width, y = pt.y * canvas.height;
            if ([4, 8, 12, 16, 20].includes(i)) {
                ctx.strokeStyle = "#00f0ff"; ctx.strokeRect(x - 6, y - 6, 12, 12);
            } else {
                ctx.fillStyle = "#fff"; ctx.fillRect(x - 2, y - 2, 4, 4);
            }
        });
    };

    const onResults = (results) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (videoRef.current && (canvas.width !== videoRef.current.videoWidth || canvas.height !== videoRef.current.videoHeight)) {
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
            }
        }

        let lHand = null;
        let rHand = null;

        if (results.multiHandLandmarks) {
            setStats({ handCount: results.multiHandLandmarks.length });
            results.multiHandedness.forEach((hand, idx) => {
                const landmarks = results.multiHandLandmarks[idx];
                if (ctx) drawCyberHand(ctx, landmarks, hand.label);

                // Use smoothed landmarks for logic for consistency
                if (hand.label === 'Left') lHand = stateRef.current.smoothedLandmarks['Left'];
                if (hand.label === 'Right') rHand = stateRef.current.smoothedLandmarks['Right'];
            });
        }

        if (!lHand && !rHand) {
            // Reset logic state if no hands
            const s = stateRef.current;
            s.isGrabbing = false; s.isBuilding = false; s.isErasing = false;
            s.timers = { grab: 0, build: 0, erase: 0, rotate: 0, reset: 0 };
            setMode('IDLE');
        }

        processGestures(lHand, rHand, ctx, canvas);
    };

    const processGestures = (lHand, rHand, ctx, canvas) => {
        const s = stateRef.current;
        const { setMode: updateMode } = useStore.getState();

        const isFist = (hand) => hand && hand[8].y > hand[6].y && hand[12].y > hand[10].y && hand[16].y > hand[14].y;
        const isPalm = (hand) => hand && hand[8].y < hand[6].y && hand[12].y < hand[10].y && hand[20].y < hand[18].y;
        const getDist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

        // 1. HARD RESET
        if (lHand && rHand && isFist(lHand) && isFist(rHand)) {
            s.timers.reset += 16;
            if (ctx && canvas) drawHUDCircle(ctx, canvas.width / 2, canvas.height / 2, s.timers.reset / s.RESET_HOLD, "#ff0055");
            if (s.timers.reset > s.RESET_HOLD) {
                resetVoxels();
                updateMode('SYSTEM: HARD_RESET COMPLETE');
                s.timers.reset = 0;
            } else {
                updateMode('SYSTEM: HOLD TO RESET...');
            }
            return;
        } else {
            s.timers.reset = 0;
        }

        // 2. ROTATE 
        if (lHand && rHand && isPalm(lHand) && isPalm(rHand)) {
            if (s.timers.rotate < s.ROTATE_HOLD) {
                s.timers.rotate += 16;
                if (ctx && canvas) drawHUDCircle(ctx, canvas.width / 2, canvas.height / 2, s.timers.rotate / s.ROTATE_HOLD, "#00f0ff");
                updateMode('SYSTEM: HOLD TO ENABLE ROTATION...');
            } else {
                updateMode('SYSTEM: GLOBAL_ROTATE ACTIVE');
                // Rotation deltas handled by World3D via handState
            }
            // Need to return early? No, maybe updates
        } else {
            s.timers.rotate = 0;
        }
        // If actively rotating, we don't return early to allow state updates, BUT mode logic might clash.
        // For now, if Rotating is active, we just fall through, mode will set.

        let newMode = 'IDLE';

        // 3. LEFT HAND: GRAB
        if (lHand) {
            const fist = isFist(lHand);
            if (fist) {
                if (s.timers.grab < s.GRAB_HOLD) {
                    s.timers.grab += 16;
                    if (ctx) drawHUDCircle(ctx, lHand[0].x * canvas.width, lHand[0].y * canvas.height, s.timers.grab / s.GRAB_HOLD, "#ffbb00");
                } else {
                    if (!s.isGrabbing) s.isGrabbing = true;
                    newMode = 'BIO_LINK: GRABBED';
                }
            } else {
                s.isGrabbing = false; s.timers.grab = 0;
            }
        }

        // 4. RIGHT HAND: BUILD / ERASE
        if (rHand) {
            const pinchDist = getDist(rHand[4], rHand[8]);
            const isPinching = pinchDist < 0.05;
            const isPointing = rHand[8].y < rHand[6].y && rHand[12].y > rHand[10].y; // Index up, Mid down
            const palmOpen = isPalm(rHand);

            const px = rHand[8].x * canvas.width;
            const py = rHand[8].y * canvas.height;

            // Simplified: If Left Pinch + Right Point -> Erase
            const leftPinch = lHand && getDist(lHand[4], lHand[8]) < 0.05;

            if (leftPinch && isPointing && !palmOpen) {
                s.timers.build = 0; // Reset build
                if (s.timers.erase < s.INTENT_HOLD) {
                    s.timers.erase += 16;
                    if (ctx) drawHUDCircle(ctx, px, py, s.timers.erase / s.INTENT_HOLD, "#ff3333");
                    newMode = 'INTENT: ERASER_LOCKING...';
                } else {
                    if (!s.isErasing) s.isErasing = true;
                    newMode = 'INTENT: ERASER_ACTIVE';
                }
            }
            else if (isPinching && !s.isGrabbing && !palmOpen) {
                s.timers.erase = 0;
                if (s.timers.build < s.INTENT_HOLD) {
                    s.timers.build += 16;
                    if (ctx) drawHUDCircle(ctx, px, py, s.timers.build / s.INTENT_HOLD, "#00ffcc");
                    newMode = 'INTENT: BUILD_SYNCING...';
                } else {
                    if (!s.isBuilding) {
                        s.isBuilding = true;
                        // Start tracking pinch pos handled in World3D or we pass flag
                        clearSketchVoxels();
                    }
                    newMode = 'INTENT: BUILDING';
                }
            }
            else {
                // Released
                if (s.isBuilding && palmOpen) {
                    commitSketchVoxels();
                    s.isBuilding = false;
                    s.timers.build = 0;
                }
                if (s.isErasing && palmOpen) {
                    s.isErasing = false;
                    s.timers.erase = 0;
                }
            }
        }

        // Priority Override
        if (s.timers.rotate >= s.ROTATE_HOLD && lHand && rHand && isPalm(lHand) && isPalm(rHand)) {
            newMode = 'SYSTEM: GLOBAL_ROTATE ACTIVE';
        }

        if (s.timers.reset === 0) {
            updateMode(newMode);
        }

        useStore.setState({
            handState: {
                left: lHand,
                right: rHand,
                isPinchingRight: rHand && getDist(rHand[4], rHand[8]) < 0.05,
                isPinchingLeft: lHand && getDist(lHand[4], lHand[8]) < 0.05,
                isGrabbing: s.isGrabbing,
                isBuilding: s.isBuilding,
                buildTimer: s.timers.build,
                isRotating: s.timers.rotate >= s.ROTATE_HOLD
            }
        });
    };

    return (
        <>
            <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
                playsInline
                style={{ transform: 'scaleX(-1)', zIndex: 0 }}
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                style={{ transform: 'scaleX(-1)', zIndex: 10 }}
            />
        </>
    );
};

export default HandManager;
