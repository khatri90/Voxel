import React, { useRef, useLayoutEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

const Voxel = ({ position, type }) => (
    <mesh position={position}>
        <boxGeometry args={type === 'sketch' ? [1.17, 1.17, 1.17] : [1.0, 1.0, 1.0]} />
        <meshStandardMaterial
            color={type === 'sketch' ? "#00f0ff" : "#001122"}
            emissive={type === 'sketch' ? "#00f0ff" : "#00f0ff"}
            emissiveIntensity={type === 'sketch' ? 0.8 : 0.5}
            transparent
            wireframe={type === 'sketch'}
            opacity={type === 'sketch' ? 0.3 : 0.9}
            roughness={0.2}
        />
        {type !== 'sketch' && (
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
                <lineBasicMaterial color="#00f0ff" linewidth={2} />
            </lineSegments>
        )}
    </mesh>
);

const GhostVoxel = ({ position, mode }) => {
    const color = mode.includes('ERASER') ? '#ff3333' : '#00ffcc';

    if (mode.includes('BUILDING') || mode.includes('SYNCING') || mode.includes('ERASER')) {
        return (
            <mesh position={position}>
                <boxGeometry args={[1.2, 1.2, 1.2]} />
                <meshBasicMaterial color={color} wireframe transparent opacity={0.8} />
            </mesh>
        );
    }
    return null;
};

const SceneContent = () => {
    const { voxels, sketchVoxels, handState, addSketchVoxel, removeVoxel, mode, groupPosition, groupRotation, setGroupPosition, setGroupRotation } = useStore();
    const ghostRef = useRef();

    // Logic State
    const logicRef = useRef({
        startPinch: null,
        activeAxis: null,
        grabOffset: new THREE.Vector3(),
        isGrabbing: false
    });

    useFrame((state) => {
        // 1. GROUP TRANSFORM (ROTATE / GRAB)
        if (handState.left && handState.right && handState.isRotating) {
            // Rotate Logic
            // Just adding delta based on hand movement
            const rHand = handState.right;
            const lHand = handState.left;
            const dy = (rHand[9].x - lHand[9].x) * 0.02;
            const dx = (rHand[9].y - lHand[9].y) * 0.02;

            setGroupRotation([groupRotation[0] + dx, groupRotation[1] + dy, groupRotation[2]]);
        }

        if (handState.left && handState.isGrabbing) {
            // Grab Logic
            const lHand = handState.left;
            // Map Left Hand to World (Rough)
            const wx = (0.5 - lHand[9].x) * 20;
            const wy = (0.5 - lHand[9].y) * 15;
            // We need a stable offset.
            // For now, simpler implementation: Move group += delta of hand
            // But we don't store prev hand pos easily here without ref.
            // Let's us absolute mapping for simplicity and parity with 'following' cursor
            // Sample: voxelGroup.position.copy(handWorldPos).add(grabOffset);

            // This requires initializing offset on Grab Start, which we missed. 
            // We'll skip precise offset locking and just follow slightly or rely on relative moves if refined.
            // Replicating sample behavior:
            const targetPos = new THREE.Vector3((0.5 - lHand[9].x) * 25, (0.5 - lHand[9].y) * 18, 0);
            setGroupPosition([targetPos.x, targetPos.y, groupPosition[2]]); // Keep Z stable-ish
        }


        if (!handState.right) return;

        // 2. MAPPING & INTERACTION
        const indexTip = handState.right[8];
        const x = (0.5 - indexTip.x) * 20;
        const y = (0.5 - indexTip.y) * 15;
        const z = -indexTip.z * 20;

        // Grid Snapping
        const gridSize = 1.2;
        const rawGx = Math.round(x / gridSize) * gridSize;
        const rawGy = Math.round(y / gridSize) * gridSize;
        const rawGz = Math.round(z / gridSize) * gridSize;

        // AXIS LOCKING LOGIC
        let gx = rawGx, gy = rawGy, gz = rawGz;

        if (handState.isBuilding) {
            if (!logicRef.current.startPinch) {
                logicRef.current.startPinch = { x: gx, y: gy, z: gz };
                logicRef.current.activeAxis = null;
            } else {
                const start = logicRef.current.startPinch;
                const dx = Math.abs(gx - start.x);
                const dy = Math.abs(gy - start.y);
                const dz = Math.abs(gz - start.z);

                if (!logicRef.current.activeAxis && (dx > 2.0 || dy > 2.0 || dz > 2.0)) {
                    if (dx >= dy && dx >= dz) logicRef.current.activeAxis = 'x';
                    else if (dy >= dx && dy >= dz) logicRef.current.activeAxis = 'y';
                    else logicRef.current.activeAxis = 'z';
                }

                if (logicRef.current.activeAxis === 'x') { gy = start.y; gz = start.z; }
                else if (logicRef.current.activeAxis === 'y') { gx = start.x; gz = start.z; }
                else if (logicRef.current.activeAxis === 'z') { gx = start.x; gy = start.y; }
            }
        } else {
            logicRef.current.startPinch = null;
            logicRef.current.activeAxis = null;
        }

        if (ghostRef.current) {
            ghostRef.current.position.set(gx, gy, gz);
        }

        const key = `${gx.toFixed(1)},${gy.toFixed(1)},${gz.toFixed(1)}`;

        // ACTIONS
        if (handState.isBuilding) {
            if (!voxels[key] && !sketchVoxels[key]) {
                addSketchVoxel(key, [gx, gy, gz]);
            }
        }

        if (mode.includes('ERASER_ACTIVE')) { // HandManager sets detailed string
            if (voxels[key]) {
                removeVoxel(key);
            }
        }
    });

    return (
        <group position={groupPosition} rotation={groupRotation}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} color="#00f0ff" intensity={1} />

            {/* Voxel Group */}
            <group>
                {Object.entries(voxels).map(([key, data]) => (
                    <Voxel key={key} position={data.position} type="default" />
                ))}
                {Object.entries(sketchVoxels).map(([key, data]) => (
                    <Voxel key={key} position={data.position} type="sketch" />
                ))}
            </group>

            {/* Ghost Voxel Cursor */}
            {(handState.right) && (
                <GhostVoxel ref={ghostRef} position={[0, 0, 0]} mode={mode} />
            )}

            {/* Visuals */}
            <Grid
                infiniteGrid
                fadeDistance={40}
                sectionColor="#00f0ff"
                cellColor="#005577"
                sectionSize={5}
                cellSize={1.2}
                position={[0, -10, 0]}
            />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
};

const World3D = () => {
    // Camera ref not strictly needed unless we manipulate it, OrbitControls handles default
    return (
        <div id="three_canvas" className="absolute inset-0 z-10">
            <Canvas
                camera={{ position: [0, 0, 20], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
            >
                <SceneContent />
                {/* Orbit Controls disabled if we implement manual Grab/Rotate, or keep for fallback mouse usage? 
            Sample disabled mouse interaction mostly. Let's keep enableRotate={false} if hand is present? 
            For now, keep enabled for debug convenience. */}
                <OrbitControls makeDefault enableZoom={true} enablePan={true} enableRotate={true} />
            </Canvas>
        </div>
    );
};

export default World3D;
