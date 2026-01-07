import React from 'react';

// Common SVG props
const IconBase = ({ children, className = "w-6 h-6", ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        {children}
    </svg>
);

// --- SIMPLIFIED GEOMETRIC HAND ICONS ---

// IconGestureBuild: "Pinch Left Hand"
// Representation: Hand with Index and Thumb touching (Circle) + 3 fingers up/out.
export const IconGestureBuild = (props) => (
    <IconBase {...props}>
        {/* Pinch Circle */}
        <circle cx="9" cy="14" r="3.5" />
        {/* Middle, Ring, Pinky fingers sticking up */}
        <path d="M12.5 14V7a1.5 1.5 0 0 1 3 0v7" />
        <path d="M15.5 14V9a1.5 1.5 0 0 1 3 0v5" />
        {/* Wrist */}
        <path d="M7 17v4" />
        <path d="M17 17v4" />
        <text x="5" y="6" fontSize="5" fontWeight="bold" fill="currentColor">L</text>
    </IconBase>
);

// IconGestureGrab: "Hold Right Fist"
// Representation: A solid rounded square (knuckles) with thumb crossed.
export const IconGestureGrab = (props) => (
    <IconBase {...props}>
        {/* Fist Shape */}
        <rect x="6" y="8" width="12" height="10" rx="3" />
        {/* Finger lines */}
        <path d="M6 13h12" />
        {/* Thumb crossing over */}
        <path d="M14 13c0 3-2 5-5 5" />
        {/* Wrist */}
        <path d="M9 18v4" />
        <path d="M15 18v4" />
        {/* Motion lines */}
        <path d="M19 6l2 2" />
        <path d="M21 6l-2 2" />
        <text x="4" y="21" fontSize="5" fontWeight="bold" fill="currentColor">R</text>
    </IconBase>
);

// IconGestureErase: "Pinch Right + Point Left"
// Representation: Two distinct hands.
export const IconGestureErase = (props) => (
    <IconBase {...props}>
        {/* Right Pinch (Bottom Right) */}
        <g transform="translate(13, 13) scale(0.45)">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
        </g>
        <text x="18" y="22" fontSize="5" fontWeight="bold" fill="currentColor">R</text>

        {/* Left Point (Top Left) */}
        <g transform="translate(2, 2) scale(0.6)">
            {/* Pointing Finger */}
            <path d="M8 20V8c0-2 1.5-3 3-3s3 1 3 3v12" />
            <path d="M8 14h6" />
            {/* Thumb */}
            <path d="M8 16c-2 0-4-1-4-3" />
        </g>
        <text x="2" y="22" fontSize="5" fontWeight="bold" fill="currentColor">L</text>
        {/* X Mark */}
        <path d="M18 4l-4 4" strokeWidth="1.5" />
        <path d="M14 4l4 4" strokeWidth="1.5" />
    </IconBase>
);

// IconGestureReset: "Fists Together"
// Representation: Two simple bumper shapes.
export const IconGestureReset = (props) => (
    <IconBase {...props}>
        {/* Left Fist Block */}
        <path d="M3 8h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3" />
        <path d="M3 13h8" />
        {/* Right Fist Block */}
        <path d="M21 8h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6" />
        <path d="M21 13h-8" />
        {/* Impact */}
        <path d="M12 7v2" />
        <path d="M12 15v2" />
    </IconBase>
);

// IconGestureRotate: "Palms Open"
export const IconGestureRotate = (props) => (
    <IconBase {...props}>
        {/* Left Palm */}
        <rect x="2" y="5" width="8" height="12" rx="2" />
        <path d="M2 11h8" />
        {/* Right Palm */}
        <rect x="14" y="5" width="8" height="12" rx="2" />
        <path d="M14 11h8" />
        {/* Rotation Arrow */}
        <path d="M12 20a8 8 0 0 0 8-8" strokeDasharray="2 2" opacity="0.5" />
    </IconBase>
);

// IconGestureCycle: "Peace Sign"
// Representation: V Shape fingers.
export const IconGestureCycle = (props) => (
    <IconBase {...props}>
        {/* Palm */}
        <rect x="7" y="12" width="10" height="10" rx="3" />
        {/* Fingers */}
        <path d="M8 12V4a2 2 0 0 1 4 0v8" />
        <path d="M16 12V4a2 2 0 0 0-4 0v8" />
        {/* Color Dots */}
        <circle cx="12" cy="17" r="2" fill="currentColor" opacity="0.5" />
    </IconBase>
);
