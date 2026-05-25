import { create } from "zustand";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 LAYOUT & PRE-LOADER STORE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const useLayoutStore = create((set) => ({
  isPageLoading: false,
  setIsPageLoading: (loading) => set({ isPageLoading: loading }),
  spotlightX: 0,
  spotlightY: 0,
  setSpotlightCoords: (x, y) => set({ spotlightX: x, spotlightY: y }),
  selectedMood: "Chill",
  setSelectedMood: (mood) => set({ selectedMood: mood })
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎵 PERSISTENT MUSIC DECK STORE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const useMusicStore = create((set) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  equalizerActive: true,
  syncRoomId: null,
  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: !!track }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setQueue: (queue) => set({ queue }),
  setVolume: (vol) => set({ volume: vol }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (dur) => set({ duration: dur }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  toggleEqualizer: () => set((state) => ({ equalizerActive: !state.equalizerActive })),
  setSyncRoomId: (roomId) => set({ syncRoomId: roomId })
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 GLOBAL SEARCH OVERLAY STORE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const useSearchStore = create((set) => ({
  isOpen: false,
  query: "",
  setIsOpen: (open) => set({ isOpen: open }),
  setQuery: (q) => set({ query: q })
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👤 USER PROFILE & COLLECTION CACHE STORE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const useUserStore = create((set) => ({
  signedIn: false,
  displayName: "Aria Sterling",
  favorites: [],
  watchlist: [],
  recentlyPlayed: [],
  hoursWatched: 24.5,
  hoursPlayed: 48.2,
  setSignedIn: (signedIn) => set({ signedIn }),
  addFavorite: (item) =>
    set((state) => {
      if (state.favorites.some((f) => f.id === item.id)) return state;
      return { favorites: [...state.favorites, item] };
    }),
  removeFavorite: (id) =>
    set((state) => ({ favorites: state.favorites.filter((f) => f.id !== id) })),
  addToWatchlist: (item) =>
    set((state) => {
      if (state.watchlist.some((w) => w.id === item.id)) return state;
      return { watchlist: [...state.watchlist, item] };
    }),
  removeFromWatchlist: (id) =>
    set((state) => ({ watchlist: state.watchlist.filter((w) => w.id !== id) })),
  addRecentlyPlayed: (item) =>
    set((state) => {
      const filtered = state.recentlyPlayed.filter((rp) => rp.id !== item.id);
      return {
        recentlyPlayed: [
          { ...item, playedAt: new Date().toISOString() },
          ...filtered
        ].slice(0, 8)
      };
    }),
  syncUserData: (data) => set((state) => ({ ...state, ...data }))
}));
