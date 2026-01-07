import React from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = () => {
    const { mode, voxels, stats, tipsOpen, toggleTips } = useStore();
    const voxelCount = Object.keys(voxels).length;

    return (
        <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between p-6">
            {/* Top Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex justify-between items-start"
            >
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tighter" style={{ color: 'var(--color-primary)', textShadow: '0 0 20px var(--color-primary)' }}>
                        VOXEL ARCHITECT
                    </h1>
                    <div className="flex items-center gap-2 text-sm font-mono tracking-widest opacity-80">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        SYSTEM ONLINE
                    </div>
                </div>

                <div className="flex flex-col items-end font-mono text-sm gap-1">
                    <div className="flex items-center gap-4">
                        <span className="opacity-50">HANDS DETECTED:</span>
                        <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{stats.handCount}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="opacity-50">VOXELS:</span>
                        <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{voxelCount}</span>
                    </div>
                </div>
            </motion.div>

            {/* Center Status / Mode Indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={mode}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        className="text-2xl font-black tracking-widest border px-6 py-2 rounded-lg"
                        style={{
                            borderColor: 'var(--color-primary)',
                            color: 'var(--color-primary)',
                            background: 'rgba(0,0,0,0.8)',
                            boxShadow: '0 0 30px var(--color-primary-dim)'
                        }}
                    >
                        {mode}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Controls & Tips */}
            <div className="flex justify-between items-end pointer-events-auto">
                <button
                    onClick={toggleTips}
                    className="px-4 py-2 border font-mono text-xs hover:bg-white/10 transition-colors"
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                >
                    {tipsOpen ? '[HIDE GUIDE]' : '[SHOW GUIDE]'}
                </button>

                <AnimatePresence>
                    {tipsOpen && (
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            className="max-w-md bg-black/90 p-6 border-l-4 backdrop-blur-md"
                            style={{ borderColor: 'var(--color-primary)', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' }}
                        >
                            <h3 className="font-bold mb-4 text-lg border-b pb-2 border-white/20">OPERATIONAL GUIDE</h3>
                            <ul className="space-y-3 text-sm font-mono opacity-80">
                                <li className="flex gap-3">
                                    <span style={{ color: 'var(--color-primary)' }}>➤</span>
                                    <span><strong>BUILD:</strong> Pinch Right Hand + Drag. Release to Place.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span style={{ color: 'var(--color-primary)' }}>➤</span>
                                    <span><strong>ERASE:</strong> Pinch Left Hand + Point with Right.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span style={{ color: 'var(--color-primary)' }}>➤</span>
                                    <span><strong>ROTATE:</strong> Open Both Palms + Tilt Hands.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span style={{ color: 'var(--color-primary)' }}>➤</span>
                                    <span><strong>RESET:</strong> Clench Both Fists (Hold 1s).</span>
                                </li>
                                <li className="flex gap-3">
                                    <span style={{ color: 'var(--color-primary)' }}>➤</span>
                                    <span><strong>GRAB:</strong> Clench Left Fist to Move Scene.</span>
                                </li>
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Overlay;
