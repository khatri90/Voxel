import React from 'react';

// Common SVG props
const IconBase = ({ children, className = "w-6 h-6", ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        {children}
    </svg>
);

// --- HAND PRIMITIVES ---

// Left Hand Pinch (Thumb on Right side of the hand shape implies Left Hand seen from front? No, wait.)
// If I look at my Left hand palm facing me: Thumb is on Left. 
// If I look at my Left hand back facing me: Thumb is on Right.
// Let's assume Palm Facing Camera (Standard for gestures).
// Left Hand Palm: Thumb is on LEFT.
// Right Hand Palm: Thumb is on RIGHT.

// But wait, if the video is mirrored:
// User raises Left Hand -> Screen shows it on the Left side.
// Does it look like a Left hand? Yes.
// So:
// Left Hand = Thumb on Left.
// Right Hand = Thumb on Right.

// IconGestureBuild: "Pinch Left Hand"
// Draw Left Hand Pinching.
export const IconGestureBuild = (props) => (
    <IconBase {...props}>
        {/* Left Hand Pinching */}
        {/* Thumb (Left side) meets Index */}
        <path d="M7 14c-2 0-3-2-3-4s1-3 3-3 2 2 2 4" strokeWidth="2" /> {/* Thumb */}
        <path d="M11 14V6c0-2-1.5-3-3-3" strokeWidth="2" /> {/* Index coming down to pinch */}
        <path d="M13 14V5" /> {/* Middle */}
        <path d="M15 14V6" /> {/* Ring */}
        <path d="M17 14V8" /> {/* Pinky */}
        <path d="M7 21v-4" /> {/* Wrist */}
        <path d="M17 21v-4" />
        <path d="M6 17h12" /> {/* Base */}
        <circle cx="9" cy="11" r="1.5" fill="currentColor" /> {/* Pinch Point */}
        <text x="14" y="20" fontSize="6" fontWeight="bold" fill="currentColor">L</text>
    </IconBase>
);

// IconGestureGrab: "Hold Right Fist"
// Draw Right Hand Fist.
export const IconGestureGrab = (props) => (
    <IconBase {...props}>
        {/* Right Hand Fist (Thumb on Right, wrapped) */}
        <rect x="6" y="8" width="10" height="8" rx="2" strokeWidth="2" />
        <path d="M6 12h10" />
        <path d="M10 16v-8" />
        <path d="M13 16v-8" />
        {/* Thumb wrapped on Right */}
        <path d="M16 14c1 0 2-1 2-3s-1-3-2-3" strokeWidth="2" />
        <path d="M9 22v-6" /> {/* Wrist */}
        <path d="M15 22v-6" />
        <text x="4" y="20" fontSize="6" fontWeight="bold" fill="currentColor">R</text>
        {/* Move arrows */}
        <path d="M20 5l2-2m0 0l2 2m-2-2v4" strokeWidth="1" />
    </IconBase>
);

// IconGestureErase: "Pinch Right (Shift) + Point Left (Cursor)"
// User Instructions: "Pinch Right + Point Left"
// Draw TWO hands.
export const IconGestureErase = (props) => (
    <IconBase {...props}>
        {/* Right Hand Pinch (Small, bottom right) */}
        <g transform="translate(14, 12) scale(0.4)">
            <path d="M17 14c2 0 3-2 3-4s-1-3-3-3-2 2-2 4" strokeWidth="3" /> {/* Thumb Right */}
            <path d="M13 14V6c0-2 1.5-3 3-3" strokeWidth="3" /> {/* Index */}
            <circle cx="15" cy="11" r="3" fill="currentColor" />
        </g>
        <text x="18" y="22" fontSize="5" fontWeight="bold" fill="currentColor">R</text>

        {/* Left Hand Pointing (Main, top left) */}
        <g transform="translate(0, 0) scale(0.8)">
            <path d="M8 20v-5" />
            <path d="M4 14c-1 0-2-1-2-2s1-2 2-2" /> {/* Thumb Left */}
            <path d="M8 14V4c0-1-1-2-2-2" strokeWidth="2" /> {/* Index Pointing Up/Right */}
            <path d="M11 14v-4" /> {/* Middle bent */}
            <path d="M14 14v-3" />
        </g>
        <text x="2" y="22" fontSize="5" fontWeight="bold" fill="currentColor">L</text>
        {/* Erase X symbol */}
        <path d="M16 4l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="2" />
    </IconBase>
);

// IconGestureReset: "Fists Together" (L+R)
export const IconGestureReset = (props) => (
    <IconBase {...props}>
        {/* Left Fist */}
        <rect x="2" y="8" width="8" height="8" rx="2" />
        <path d="M2 12h8" />
        <path d="M6 16v-8" />
        {/* Right Fist */}
        <rect x="14" y="8" width="8" height="8" rx="2" />
        <path d="M14 12h8" />
        <path d="M18 16v-8" />
        {/* Arrows converging */}
        <path d="M11 5l1 2-1 2" />
        <path d="M13 5l-1 2 1 2" />
    </IconBase>
);

// IconGestureRotate: "Palms Open" (L+R)
export const IconGestureRotate = (props) => (
    <IconBase {...props}>
        {/* Left Palm */}
        <path d="M4 16c-1 0-2-2-2-5s1-4 2-4" /> {/* Thumb */}
        <path d="M6 16V4" />
        <path d="M9 16V5" />

        {/* Right Palm */}
        <path d="M20 16c1 0 2-2 2-5s-1-4-2-4" /> {/* Thumb */}
        <path d="M18 16V4" />
        <path d="M15 16V5" />

        {/* Rotate arrow in middle */}
        <path d="M12 10a4 4 0 0 1 0 8" strokeDasharray="2 2" />
        <path d="M12 18l-2-2" />
    </IconBase>
);

// IconGestureCycle: "Peace Sign" (Any Hand, showing Left here)
// "Cycle Color"
export const IconGestureCycle = (props) => (
    <IconBase {...props}>
        <path d="M8 20v-6" /> {/* Wrist */}
        <path d="M16 20v-6" />
        <path d="M6 14c-1 0-2-1-2-2s1-2 2-2" /> {/* Thumb bent */}
        <path d="M10 14V4c0-1-1-2-2-2" strokeWidth="2" /> {/* Index UP */}
        <path d="M14 14V4c0-1 1-2 2-2" strokeWidth="2" /> {/* Middle UP */}
        <path d="M17 14v-2" /> {/* Ring bent */}
        <path d="M19 14v-2" /> {/* Pinky bent */}

        {/* Color bubbles */}
        <circle cx="18" cy="6" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="21" cy="9" r="1.5" fill="currentColor" opacity="0.3" />
    </IconBase>
);
