// Global mutable store — shared between React and R3F without triggering re-renders
const store = {
  scroll: {
    progress: 0, // 0–1 across entire page
    y: 0,
  },
  mouse: {
    x: 0,  // -1 to 1
    y: 0,  // -1 to 1
    raw: { x: 0, y: 0 },
  },
  playing: false, // true when user has zoomed into the TV game
}

export default store

/** Call this instead of setting store.playing directly so React components are notified. */
export function setPlaying(val) {
  store.playing = val
  window.dispatchEvent(new CustomEvent('acm-playing', { detail: { playing: val } }))
  // Lock / unlock page scroll
  document.body.style.overflow = val ? 'hidden' : ''
}
