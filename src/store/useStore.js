import { create } from 'zustand';

export const useStore = create((set) => ({
  mode: 'INITIALIZING', // INITIALIZING, IDLE, BUILDING, ERASING, ROTATING, RESETTING
  setMode: (mode) => set({ mode }),

  voxels: {}, // Key: "x,y,z" -> { position: [x,y,z], type: 'default' }
  addVoxel: (key, position) => set((state) => ({ voxels: { ...state.voxels, [key]: { position, type: 'default' } } })),
  removeVoxel: (key) => set((state) => {
    const newVoxels = { ...state.voxels };
    delete newVoxels[key];
    return { voxels: newVoxels };
  }),
  resetVoxels: () => set({ voxels: {} }),
  // Sketch Voxel State (Temporary voxels while pinching)
  sketchVoxels: {},
  addSketchVoxel: (key, position) => set((state) => ({ sketchVoxels: { ...state.sketchVoxels, [key]: { position, type: 'sketch' } } })),
  clearSketchVoxels: () => set({ sketchVoxels: {} }),
  commitSketchVoxels: () => set((state) => {
    const newVoxels = { ...state.voxels };
    // Merge sketchVoxels into voxels
    Object.entries(state.sketchVoxels).forEach(([key, val]) => {
      newVoxels[key] = { ...val, type: 'default' };
    });
    return { voxels: newVoxels, sketchVoxels: {} };
  }),

  // World Transform
  groupPosition: [0, 0, 0],
  groupRotation: [0, 0, 0],
  setGroupPosition: (pos) => set({ groupPosition: pos }),
  setGroupRotation: (rot) => set({ groupRotation: rot }),

  handState: { left: null, right: null, isPinchingRight: false, isPinchingLeft: false },

  stats: { fps: 0, handCount: 0 },
  setStats: (stats) => set((state) => ({ stats: { ...state.stats, ...stats } })),

  tipsOpen: true,
  toggleTips: () => set((state) => ({ tipsOpen: !state.tipsOpen })),
}));
