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

// --- ACTION ICONS (No Hands, just Concepts) ---

// IconActionBuild: Add Cube
export const IconActionBuild = (props) => (
    <IconBase {...props}>
        {/* Main Cube */}
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.3 7l8.7 5 8.7-5" />
        <path d="M12 22V12" />
        {/* Plus Sign (Overlay) */}
        <rect x="8" y="5" width="8" height="8" rx="1" fill="currentColor" className="text-white dark:text-slate-900" opacity="0.9" />
        <path d="M12 6v6" strokeWidth="2.5" className="text-indigo-600" />
        <path d="M9 9h6" strokeWidth="2.5" className="text-indigo-600" />
    </IconBase>
);

// IconActionErase: Trash / Remove
export const IconActionErase = (props) => (
    <IconBase {...props}>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        {/* X mark on trash bin */}
        <path d="M10 11l4 4" />
        <path d="M14 11l-4 4" />
    </IconBase>
);

// IconActionGrab: Move / Drag Arrows
export const IconActionGrab = (props) => (
    <IconBase {...props}>
        <path d="M5 9l-3 3 3 3" />
        <path d="M9 5l3-3 3 3" />
        <path d="M19 9l3 3-3 3" />
        <path d="M9 19l3 3 3-3" />
        <path d="M2 12h20" />
        <path d="M12 2v20" />
        {/* Center dot */}
        <circle cx="12" cy="12" r="2" fill="currentColor" />
    </IconBase>
);

// IconActionColor: Palette / Theme
export const IconActionColor = (props) => (
    <IconBase {...props}>
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 2.228.729 4.287 1.967 5.965C5.035 19.416 6.544 20.373 8.5 20c.928-.176 1.5-.788 1.5-1.5 0-.573-.243-1.07-.63-1.554-.23-.287-.514-.664-.47-1.146.065-.722.957-1.3 1.6-1.3.4 0 .5.3.5.5v1.5c0 1.5 1.5 3 4.5 3z" />
    </IconBase>
);

// IconActionReset: Undo / Refresh
export const IconActionReset = (props) => (
    <IconBase {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </IconBase>
);

// IconActionRotate: 3D Rotate
export const IconActionRotate = (props) => (
    <IconBase {...props}>
        <path d="M12 3a9 9 0 0 1 9 9" opacity="0.3" />
        <path d="M12 21a9 9 0 0 1-9-9" opacity="0.3" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        {/* Axis Rotation */}
        <path d="M19.07 4.93L17.66 6.34" />
        <path d="M4.93 19.07l1.41-1.41" />
        <circle cx="12" cy="12" r="5" strokeStyle="dashed" />
        <path d="M12 12v6l-2-2" />
        <path d="M14 16l-2 2" />
    </IconBase>
);
