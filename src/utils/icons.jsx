// src/utils/icons.jsx

import React from 'react';

// Inline SVG for Google icon
export const GoogleIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22.56 12.25c0-.78-.07-1.5-.18-2.2H12v4.26h6.15c-.25 1.18-.84 2.15-1.74 2.76v3.29h4.22c2.47-2.28 3.9-5.64 3.9-9.06z" fill="#4285F4" />
        <path d="M12 23c3.2 0 5.86-1.07 7.82-2.92l-4.22-3.29c-1.15.77-2.6 1.22-3.6 1.22-2.98 0-5.5-2-6.42-4.63H1.93v3.37c1.78 3.51 5.37 6.03 10.07 6.03z" fill="#34A853" />
        <path d="M5.58 14.16c-.23-.69-.37-1.42-.37-2.16s.14-1.47.37-2.16V6.5h-3.6C1.45 7.8 1 9.8 1 12s.45 4.2 1.98 5.5z" fill="#FBBC05" />
        <path d="M12 5.09c1.77 0 3.3.62 4.53 1.76l3.71-3.71C17.82 1.45 15.2 0 12 0 7.37 0 3.78 2.52 1.93 6.03l3.6 2.81c.92-2.63 3.44-4.63 6.47-4.63z" fill="#EA4335" />
    </svg>
);

// Inline SVG for GitHub icon
export const GitHubIcon = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.08-.731.082-.716.082-.716 1.205.082 1.838 1.235 1.838 1.235 1.07 1.835 2.809 1.305 3.493.998.108-.77.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.312.465-2.384 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1-.322 3.292 1.233.955-.265 1.961-.397 2.964-.397.998 0 2.004.132 2.959.397 2.292-1.555 3.292-1.233 3.292-1.233.645 1.653.24 2.873.105 3.176.77.835 1.235 1.908 1.235 3.22 0 4.61-2.801 5.625-5.476 5.92-.42.365-.818 1.096-.818 2.222v3.293c0 .319.192.602.798.577C20.562 21.789 24 17.302 24 12c0-6.627-5.372-12-12-12z" />
    </svg>
);

// Inline SVG for X (Close) icon
export const XIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

// Inline SVG for Check icon
export const CheckIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M20 6 9 17 4 12" />
    </svg>
);

// New icons for sidebar/features
export const UsersIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export const MicIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
    </svg>
);

export const MessageCircleIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
);

export const DollarSignIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

export const SettingsIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

export const FolderIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
    </svg>
);

export const UploadIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
    </svg>
);

export const GlobeIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20a14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
    </svg>
);

export const PlusCircleIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
    </svg>
);

export const HomeIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

export const CpuIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 9h-6" /><path d="M18 9h3" /><path d="M18 15h3" /><path d="M3 9h3" /><path d="M3 15h3" /><path d="M9 15h6" /><path d="M12 18v3" /><path d="M12 3v3" />
    </svg>
);

export const BoxIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.5 5.5 12 10l8.5-4.5" /><path d="M12 21V10" />
    </svg>
);

export const LayoutGridIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
);

export const GitPullRequestIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><path d="M6 18V9" /><path d="m11 11 2 2-2 2" />
    </svg>
);

export const BellIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.36 21a1.94 1.94 0 0 0 3.28 0" />
    </svg>
);

export const HandshakeIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 12H3a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V14a2 2 0 0 0-2-2z" /><path d="M18.5 12H21c.5 0 1 .5 1 1v2c0 .5-.5 1-1 1h-.5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2H21" /><path d="m14 12 2.5 2.5c.6.6 1.4 1 2 1h.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H18c-.5 0-1-.5-1-1v-2a2 2 0 0 0-2-2h-3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.5c.6 0 1.4.4 2 1l2.5 2.5" />
    </svg>
);

export const SendIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m22 2-7 20-4-9-9-4 20-7z" />
        <path d="M22 2 11 13" />
    </svg>
);


// New: Volume2Icon (for sound ON)
export const Volume2Icon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M11 5L6 9H2v6h4l5 4z"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
);

// New: VolumeXIcon (for sound OFF/Mute) - also useful for the chat page's "stop speaking"
export const VolumeXIcon = ({ size = 24, className = "", strokeWidth = 2, color = "currentColor" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M11 5L6 9H2v6h4l5 4z"/>
        <line x1="22" x2="16" y1="9" y2="15"/>
        <line x1="16" x2="22" y1="9" y2="15"/>
    </svg>
);