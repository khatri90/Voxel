import React from 'react';

// Common SVG props for polished look
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

export const IconBuild = (props) => (
    <IconBase {...props}>
        {/* Cube being built */}
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
        <path d="M12 3v1" />
        <path d="M12 20v1" />
    </IconBase>
);

export const IconErase = (props) => (
    <IconBase {...props}>
        {/* Eraser / Trash */}
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </IconBase>
);

export const IconGrab = (props) => (
    <IconBase {...props}>
        {/* Hand Grabbing / Fist */}
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </IconBase>
);

export const IconReset = (props) => (
    <IconBase {...props}>
        {/* Refresh / Reset arrows */}
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
    </IconBase>
);

export const IconRotate = (props) => (
    <IconBase {...props}>
        {/* 3D Rotate / Axis */}
        <path d="M12 3a9 9 0 0 1 9 9" />
        <path d="M12 21a9 9 0 0 1-9-9" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <circle cx="12" cy="12" r="3" />
    </IconBase>
);

export const IconPeace = (props) => (
    <IconBase {...props}>
        {/* Peace Sign Hand - Two Fingers Up */}
        <path d="M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5" />
        <path d="M13 13V2.5a1.5 1.5 0 0 1 3 0v10.5" />
        <path d="M5 12v1a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-1.5" />
        <path d="M5 12a2 2 0 1 1 4 0" />
        <path d="M16 12a2 2 0 1 1 4 0" />
    </IconBase>
);

export const IconHandRight = (props) => (
    <IconBase {...props}>
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    </IconBase>
);

export const IconHandLeft = (props) => (
    <IconBase {...props}>
        <path d="M6 11V6a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v0" />
        <path d="M10 10V4a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v2" />
        <path d="M14 10.5V6a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v8" />
    </IconBase>
);
