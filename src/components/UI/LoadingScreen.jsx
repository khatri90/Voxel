import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-xl animate-fade-out-delay">
            <div className="relative flex items-center justify-center gap-3 mb-8">
                {/* Bouncing Dots Animation */}
                <div className="w-6 h-6 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-6 h-6 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-6 h-6 rounded-full bg-teal-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-700">VOXEL SCULPT</h2>
                <div className="flex items-center gap-2 justify-center text-slate-400 font-mono text-sm tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    Initializing Engine
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
