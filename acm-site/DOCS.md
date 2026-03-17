# ACM IGDTUW Site — Developer Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Entry Points](#4-entry-points)
5. [Global State (store.js)](#5-global-state-storejs)
6. [Global Styles](#6-global-styles)
7. [The Game Boy (Scene.jsx)](#7-the-game-boy-scenejsx)
   - [How the Game Boy is built](#71-how-the-game-boy-is-built)
   - [The Breakout Game Engine](#72-the-breakout-game-engine)
   - [Camera & Scroll System](#73-camera--scroll-system)
   - [Retro Environment](#74-retro-environment)
   - [Lighting & Post-Processing](#75-lighting--post-processing)
8. [Components](#8-components)
   - [Navbar](#81-navbar)
   - [HeroFloat](#82-herofloat)
   - [PixelGridHero](#83-pixelgridhero)
   - [CustomCursor](#84-customcursor)
   - [ScrollProgress](#85-scrollprogress)
   - [GameOverlay](#86-gameoverlay)
9. [Page Sections](#9-page-sections)
   - [HeroSection](#91-herosection)
   - [AboutSection](#92-aboutsection)
   - [TeamSection](#93-teamsection)
   - [EventsSection](#94-eventssection)
   - [ProjectsSection](#95-projectssection)
   - [CTASection](#96-ctasection)
10. [Animation System](#10-animation-system)
11. [Interaction & State Flows](#11-interaction--state-flows)
12. [Responsive Design](#12-responsive-design)

---

## 1. Project Overview

This is the ACM IGDTUW club website — a modern, high-performance single-page React app with:

- An **interactive 3D Game Boy** (built entirely from Three.js primitives, no model files) with a **playable Breakout game** rendered live on the Game Boy's screen
- **Scroll-synchronized 3D camera** that moves through cinematic waypoints as the user scrolls the page
- A **procedural retro/cyberpunk environment** (PCB traces, wireframe monitors, binary fields, cyber grid, starfield)
- **GSAP scroll-triggered animations** on all HTML sections
- A **pixel-reactive canvas hero** that reveals an inverted color layer under the cursor
- **Custom cursor**, **scroll progress indicator**, and **game overlay UI**

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 (hooks) |
| 3D Rendering | React Three Fiber (R3F) + Three.js |
| 3D Utilities | @react-three/drei (`Grid`) |
| Post-processing | @react-three/postprocessing (Bloom, ChromaticAberration) |
| Scroll Animation | GSAP + ScrollTrigger plugin |
| Styling | Tailwind CSS + custom CSS keyframes |
| 2D Drawing | Canvas 2D API (game + hero effects) |
| Build Tool | Vite |

---

## 3. Directory Structure

```
acm-site/
└── src/
    ├── App.jsx                    # Root layout, scroll/mouse listeners, GSAP setup
    ├── App.css                    # Legacy template CSS (mostly unused)
    ├── main.jsx                   # React DOM entry point
    ├── index.css                  # Global styles, Tailwind, keyframe animations
    ├── lib/
    │   └── store.js               # Mutable shared state (scroll, mouse, playing)
    ├── components/
    │   ├── Navbar.jsx             # Fixed top navigation
    │   ├── HeroFloat.jsx          # 3D-style floating object (pure CSS/JS)
    │   ├── PixelGridHero.jsx      # Mouse-reactive split canvas hero
    │   ├── ui/
    │   │   ├── GameOverlay.jsx    # HUD shown when game is active
    │   │   ├── ScrollProgress.jsx # Vertical scroll indicator bar
    │   │   └── CustomCursor.jsx   # Custom dot + ring cursor
    │   ├── 3d/
    │   │   └── Scene.jsx          # Entire 3D world + Game Boy + game engine
    │   └── sections/
    │       ├── HeroSection.jsx
    │       ├── AboutSection.jsx
    │       ├── TeamSection.jsx
    │       ├── EventsSection.jsx
    │       ├── ProjectsSection.jsx
    │       └── CTASection.jsx
    └── assets/
        └── react.svg              # Vite default (not actively used)
```

Public folder serves `/acm-logo.svg` which is referenced throughout the site.

---

## 4. Entry Points

### `main.jsx`
Standard Vite/React entry. Mounts `<App />` into `#root`.

### `App.jsx`
The root layout component. Key responsibilities:

- **Scroll tracking**: `window.addEventListener('scroll', ...)` updates `store.scroll.progress` (0–1) and `store.scroll.y` (raw px). GSAP `ScrollTrigger` is registered here.
- **Mouse tracking**: `window.addEventListener('mousemove', ...)` normalizes mouse to `-1…1` range and writes to `store.mouse`. Also stores raw pixel coordinates.
- **Layout tree**:
  ```
  <CustomCursor />
  <ScrollProgress />
  <GameOverlay />
  <Navbar />
  <Scene />           ← fixed 3D canvas behind everything
  <main>              ← scrollable HTML content on top
    <HeroSection />
    <AboutSection />
    <TeamSection />
    <EventsSection />
    <ProjectsSection />
    <CTASection />
  </main>
  ```
- A `data-playing` attribute is toggled on `<body>` when play mode is active. CSS rules in `index.css` use this to hide nav and main content, leaving only the 3D scene visible.

---

## 5. Global State (`store.js`)

A simple **mutable object** (no React state, no Zustand/Redux) that is shared between the React component tree and the R3F render loop without triggering re-renders:

```js
const store = {
  scroll: { progress: 0, y: 0 },     // progress: 0–1 across full page
  mouse: {
    x: 0, y: 0,                       // normalized -1 to +1
    raw: { x: 0, y: 0 }              // pixel coords
  },
  playing: false                       // true when user is in game mode
}

function setPlaying(val) {
  store.playing = val
  // dispatches custom DOM event 'acm-playing' so React components
  // outside R3F can react (GameOverlay, Navbar hiding, etc.)
  window.dispatchEvent(new CustomEvent('acm-playing', { detail: val }))
}
```

**Why not useState?** The 3D `useFrame` loop runs 60 times/second. Putting scroll/mouse into React state would trigger re-renders on every frame. A plain mutable object lets `useFrame` read values instantly with zero overhead.

---

## 6. Global Styles

### `index.css`

- **Font**: Inter (Google Fonts, weights 300–900)
- **Background**: `#04080f` (near-black navy)
- **Text**: `#e8f4f8` (off-white)
- **Custom scrollbar**: teal-to-cyan gradient thumb, dark track
- **Keyframe animations** (used via CSS classes across all components):

| Animation | Effect | Used by |
|---|---|---|
| `acm-pulse` | Scale + opacity pulsing glow | Logo badge, LED |
| `acm-glow-pulse` | Box-shadow glow pulse | Buttons, cards |
| `acm-ring-spin` | Rotating ring around logo | HeroSection logo |
| `acm-scroll-line` | Animated vertical scroll hint line | HeroSection, PixelGridHero |
| `acm-shimmer` | Diagonal light sweep | CTA join button |
| `acm-fade-up` | Fade in + translate up | Section text entrance |
| `acm-float` | Gentle vertical bobbing | HeroFloat, decorative elements |

- **`.acm-gradient-text`**: `background-clip: text` with teal→cyan gradient
- **`.acm-glass`**: `backdrop-filter: blur` + semi-transparent dark bg (glassmorphism)
- **Play mode**: When `body[data-playing="true"]`, `nav` and `main` are hidden via CSS

---

## 7. The Game Boy (`Scene.jsx`)

`Scene.jsx` is the largest and most complex file (~814 lines). It contains the entire Three.js world including the Game Boy model, the live game running on its screen, camera animation, retro environment, and post-processing.

### 7.1 How the Game Boy Is Built

The Game Boy is constructed **entirely from Three.js geometric primitives** — no `.glb`/`.gltf` model files. Every part is a `<mesh>` with a geometry and material:

| Part | Geometry | Color | Notes |
|---|---|---|---|
| Main body | `BoxGeometry(2, 3.6, 0.55)` | `#a8a8a8` (gray) | Plastic-look `MeshStandardMaterial` |
| Screen bezel | `BoxGeometry(1.72, 1.62, 0.04)` | `#1a1a1a` (black) | Raised above body |
| LCD screen | `PlaneGeometry(1.22, 0.915)` | Canvas texture | Mapped game canvas, `MeshBasicMaterial` |
| D-pad (2 arms) | `BoxGeometry(...)` | `#2a2a2a` | Two crossing boxes forming a cross |
| A / B buttons | `CylinderGeometry(0.115, ...)` | `#8b1a2e` (red) | Circles, `MeshStandardMaterial` |
| Start / Select | `BoxGeometry(0.22, 0.068, ...)` | `#787878` (gray) | Small rectangles |
| Speaker dots (15) | `CircleGeometry(0.026, ...)` | `#6c6c6c` | 3×5 grid manually positioned |
| Power LED | `SphereGeometry(0.028, ...)` | `#ff3355` + emissive | Glows red |
| L/R shoulders | `BoxGeometry(0.04, 0.28, ...)` | `#969696` | Thin bars on top corners |
| Headphone jack | `CylinderGeometry(0.044, ...)` | `#1a1a1a` | On top edge |

**Screen texture pipeline:**

```
Off-screen canvas (320×240)
  → game loop draws each frame to this canvas
  → THREE.CanvasTexture wraps the canvas
  → minFilter: LinearFilter (no mipmap artifacts)
  → mapped to the screen PlaneGeometry
  → tex.needsUpdate = true each frame triggers GPU upload
```

**Drag rotation (inertia):**

The Game Boy can be dragged to rotate. The implementation uses:
- `pointerdown` / `pointermove` / `pointerup` events on the R3F canvas
- Delta mouse movement drives `angularVelocity` (x and y axes)
- `useFrame` applies angular velocity each tick, then multiplies by `0.92` (damping factor) so it decelerates naturally after release
- When `playing === true`, drag is disabled

**Screen glow light:**

A `<pointLight>` is positioned just in front of the screen at `[0, 0.88, 1.1]` with a blue-tinted color and intensity ~0.8. This makes the surrounding Game Boy body catch the screen's glow, selling the illusion that the LCD is actually emitting light.

---

### 7.2 The Breakout Game Engine

The game runs as a **Canvas 2D API animation loop inside `useFrame`** — it is not a separate React component or Web Worker; it shares the R3F frame loop.

**Game state** (held in a `useRef` so it persists across frames without re-renders):

```js
{
  ball:   { x, y, vx, vy },
  paddle: { x, y, w: 0.38, h: 0.045 },  // normalized 0–1 coords
  bricks: [{ x, y, w, h, alive, color }],  // 5 rows × 8 cols
  score: 0,
  lives: 3,
  level: 1,
  player: false,        // false = AI auto-play, true = keyboard control
  keys: { left: false, right: false },
  sparks: [],           // particle effects on brick hit
  phase: 'playing'      // 'playing' | 'levelup' | 'dead'
}
```

**Brick layout:**

- 5 rows × 8 columns = 40 bricks
- Each row has a distinct color: `#ff4757`, `#ffa502`, `#2ed573`, `#1e90ff`, `#a29bfe`
- Spacing and padding calculated as fractions of the 320×240 canvas

**Ball physics (per frame):**

```
ball.x += ball.vx * dt
ball.y += ball.vy * dt

if (ball.x < left wall or > right wall)  → vx *= -1
if (ball.y < top wall)                   → vy *= -1
if (ball.y > bottom)                     → lose a life, reset ball

paddle collision → vy *= -1, vx biased by where ball hits paddle
brick collision  → vy *= -1, mark brick dead, add sparks, score++
```

Speed scales with level: `baseSpeed * (1 + (level - 1) * 0.18)`

**AI mode (when `player === false`):**

The paddle simply tracks the ball's X position with a speed limit, creating a convincing but beatable demo. When the user clicks "Play Breakout", `game.player = true` and keyboard events take over.

**Spark particles:**

On each brick hit, 8 particles are spawned:
```js
{ x, y, vx: random(-2..2), vy: random(-3..0), life: 1.0, color }
```
Each frame: `life -= dt * 1.5`, position integrated. Drawn as 2×2px squares. Cleared when `life <= 0`.

**HUD rendering:**

On top of the game canvas, a semi-transparent black strip renders:
- Score (left)
- Lives as ♥ symbols (center)
- Level (right)
- A scanline overlay (repeating horizontal lines at 10% opacity) for the CRT aesthetic

---

### 7.3 Camera & Scroll System

The camera does **not** use `OrbitControls`. It is entirely custom, driven by scroll progress.

**Waypoints** (6 positions the camera visits as the page scrolls):

```js
const waypoints = [
  { pos: [0, 1.2, 5.5], target: [0, 0.3, 0] },   // 0% — wide establishing shot
  { pos: [1.2, 0.8, 4.2], target: [0, 0.2, 0] },  // ~20% — slight right pan
  { pos: [-0.8, 0.4, 3.8], target: [0, 0.1, 0] }, // ~40% — left drift
  { pos: [0.4, -0.2, 4.5], target: [0, -0.1, 0] },// ~60% — lower angle
  { pos: [-0.4, 0.6, 5.0], target: [0, 0.2, 0] }, // ~80% — back out left
  { pos: [0, 0.8, 5.8], target: [0, 0.1, 0] },    // 100% — wide final
]
```

The scroll progress `t` (0–1) is mapped across these waypoints by segment, and position/target are linearly interpolated between the surrounding two waypoints.

**Play mode camera:**

When `playing === true`, a target position `[0, 0.88, 2.0]` and look-at `[0, 0.88, 0]` are used instead — zooming directly into the Game Boy screen.

**Smooth follow:**

Both position and look-at target use `lerp` each frame:
```js
camera.position.lerp(targetPos, 0.055)
lookAt.lerp(targetLookAt, 0.065)
camera.lookAt(lookAt)
```

**Mouse parallax:**

When not in play mode, a small offset `(store.mouse.x * 0.15, store.mouse.y * 0.08)` is added to the camera target, giving a subtle parallax as the user moves their mouse.

---

### 7.4 Retro Environment

All environment elements are Three.js meshes defined as sub-components inside `Scene.jsx`:

**Starfield:**
- 1600 points (800 on mobile) placed randomly within a sphere (radius ~60)
- Colors: white + cyan-blue mixed randomly
- Slow ambient Y-axis rotation via `useFrame`
- `PointsMaterial` with `sizeAttenuation: true`

**CircuitTraces:**
- ~30 orthogonal PCB-style line segments in the XZ plane
- Created with `THREE.BufferGeometry` + `THREE.LineSegments`
- Color: `#0082aa` (teal-blue)
- Fade opacity with scroll progress

**TraceVias:**
- Small circles (torus or circle meshes) at trace junctions
- Color: `#00d4ff` (bright cyan)
- Suggest solder pads on a PCB

**WireframeScreens:**
- 5 `BoxGeometry` meshes with `wireframe: true` in CRT monitor proportions
- Float in the background at varying Z depths
- Slow individual rotations via `useFrame`

**BinaryField:**
- Canvas textures (256×256) pre-rendered with random 0/1 digits in a monospace green font
- Applied to `PlaneGeometry` quads scattered at depth
- Creates the "digital rain in the background" aesthetic without a DOM overlay

**CyberGrid (floor):**
- Uses `<Grid>` from `@react-three/drei`
- Parameters: `cellColor: #0a3a4a`, `sectionColor: #00536b`, `fadeDistance: 25`
- Positioned at Y = -2.7 (below the Game Boy)
- Fades out as the user scrolls down

---

### 7.5 Lighting & Post-Processing

**Lights:**

| Light | Type | Color | Intensity | Notes |
|---|---|---|---|---|
| Scene ambient | `AmbientLight` | white | 0.07 | Very dim — everything relies on point lights |
| Orbiting A | `PointLight` | `#4488ff` (blue) | 1.5 | Orbits on XZ plane via `useFrame` |
| Orbiting B | `PointLight` | `#8833ff` (purple) | 1.2 | Offset orbit, creates color mixing |
| Top fill | `PointLight` | white | 0.8 | Fixed above |
| Bottom teal | `PointLight` | `#00d4ff` | 0.6 | Fixed below, lifts shadow areas |
| Screen glow | `PointLight` | `#6699ff` | 0.8 | At screen position, key to the illusion |

**Post-processing (via `@react-three/postprocessing`):**

- **Bloom**: `intensity: 1.2`, `kernelSize: KernelSize.MEDIUM` — makes the screen, LED, and cyan elements bloom/glow
- **ChromaticAberration**: `offset: [0.0008, 0.0004]` — subtle RGB split on edges, reinforces the CRT/retro vibe

---

## 8. Components

### 8.1 Navbar

**File:** [components/Navbar.jsx](src/components/Navbar.jsx)

A fixed-position header (z-index 1000) that stays at the top of the viewport.

**Structure:**
- Left: ACM logo (`/acm-logo.svg`) linking to `#`
- Center/Right: Desktop nav links — About, Events, Projects, Team
- Far right: "Join Us" CTA button
- Mobile: Hamburger icon that toggles an animated slide-down drawer

**Scroll effect:**
An `IntersectionObserver` (or scroll listener) adds a glassmorphism class — `backdrop-filter: blur(12px)` + semi-transparent dark background — once the user scrolls past the hero.

**Entrance animation:**
GSAP translates the navbar from `y: -80` to `y: 0` with `opacity: 0 → 1` on mount.

---

### 8.2 HeroFloat

**File:** [components/HeroFloat.jsx](src/components/HeroFloat.jsx)

A purely CSS/JS-animated "3D-ish" floating element (not R3F). Used as a decorative element.

**Animation loop (RAF):**

All values live in a `useRef` mutable object to avoid re-renders:

| Property | Behavior |
|---|---|
| Vertical float | `sin(time * 0.5) * 13px` — slow bob |
| Y rotation | Continuous at 16°/sec |
| X oscillation | `sin(time * 0.7) * 5°` |
| Mouse parallax | Max 12°, smoothed with lerp factor 0.055 |
| Specular sheen | A `::before` pseudo-element sweeps diagonally with rotation |
| Rim light | Hue shifts between blue and purple as the object rotates |
| Ambient glow | Pulsing `box-shadow` + `scale` on a background element |
| Drop shadow | `translateY` + `scale` inversely proportional to float height |

**Scroll exit:** GSAP ScrollTrigger fades + scales down + translates up as user leaves hero.

**Canvas fallback:** If no image asset is provided, draws a radial gradient with "YOUR LOGO HERE" text on an off-screen canvas.

---

### 8.3 PixelGridHero

**File:** [components/PixelGridHero.jsx](src/components/PixelGridHero.jsx)

An interactive hero section that uses two canvas layers to create a cursor-reveal split-color effect.

**Layout:** Two halves side by side (50/50 on desktop, full-width stacked on mobile):
- Left half: Dark background, standard text
- Right half: Teal background, inverted colors — only revealed where the cursor is

**Implementation:**

Two `<canvas>` elements overlap each other:

1. **`logoCanvas`** (bottom): Draws the ACM logo image normally. On hover, adds a teal glow shadow around it.

2. **`cursorCanvas`** (top): Draws a circle at the cursor position. This canvas is clipped with a circular mask. Inside that circle, the inverted-color version of everything is rendered — teal background, white-inverted logo, flipped text colors.

The "inverted" layer is pre-computed once:
```js
// Draw logo to temp canvas → getImageData → invert each pixel RGB
invertedImageData = ctx.getImageData(...)
for each pixel: R = 255 - R, G = 255 - G, B = 255 - B
```

Mouse events update the cursor circle position each frame via RAF.

**Decorative rings:** Several `border-radius: 50%` divs with pulsing `box-shadow` glow sit behind the logo area.

---

### 8.4 CustomCursor

**File:** [components/ui/CustomCursor.jsx](src/components/ui/CustomCursor.jsx)

Replaces the default OS cursor with two custom elements:

| Element | Size | Behavior |
|---|---|---|
| Dot | 8×8px, cyan glow | Follows mouse instantly |
| Ring | 40×40px, 1.5px teal border | Follows with lag (lerp 0.12) |

The ring expands to ~60px and brightens on hoverable elements (links, buttons).

**Touch handling:** Hidden entirely on touch devices (`pointer: coarse` media query or touch detection).

**Store update:** Every `mousemove` writes to `store.mouse` (normalized coords) so the 3D scene can use it for parallax without any additional listeners.

---

### 8.5 ScrollProgress

**File:** [components/ui/ScrollProgress.jsx](src/components/ui/ScrollProgress.jsx)

A fixed vertical bar on the right side of the viewport (right: 24px, centered vertically) that shows reading/scroll progress.

- **Track**: Semi-transparent dark pill
- **Fill**: Teal bar that scales from 0 to 100% height based on `store.scroll.progress`
- **Dot**: A glowing circle that moves along the track, positioned at the current fill level
- **Color**: `#00d4ff` with `box-shadow` glow

Updates are driven by `window.scroll` events in `App.jsx` → reads `store.scroll.progress` each frame via `requestAnimationFrame`.

---

### 8.6 GameOverlay

**File:** [components/ui/GameOverlay.jsx](src/components/ui/GameOverlay.jsx)

A fullscreen HUD that appears when the user enters game mode (`playing === true`).

**Elements:**
- Top-left: "← Back" button — calls `setPlaying(false)` and restores the page
- Top-right: "ESC to exit" text hint
- Bottom-center: "← → to move" control reminder

**Event subscription:** Listens for the `acm-playing` custom DOM event dispatched by `store.setPlaying()`:
```js
window.addEventListener('acm-playing', (e) => setVisible(e.detail))
```

---

## 9. Page Sections

All sections are in `src/components/sections/`. Each uses a combination of GSAP ScrollTrigger for entrance animations and Tailwind + inline styles for layout.

### 9.1 HeroSection

**File:** [components/sections/HeroSection.jsx](src/components/sections/HeroSection.jsx)

The first section the user sees. Split layout:

**Left side:**
- Eyebrow text: "ACM IGDTUW" badge
- Headline: `"ACM"` large + `"IGDTUW"` in teal gradient below
- Subtext: one-line club description
- CTA buttons: "POTD" (primary, teal) + "Past Events" (ghost)
- Scroll indicator: `acm-scroll-line` animated vertical line

**Right side:**
- ACM logo (large, with rotating ring behind it via `acm-ring-spin`)
- "Play Breakout ←→" button — on click calls `setPlaying(true)` from `store.js`

**GSAP animations:**
- On mount: staggered `opacity: 0 → 1` + `y: 30 → 0` for each text element
- On scroll exit: parallax `y` translate upward for the left content

---

### 9.2 AboutSection

**File:** [components/sections/AboutSection.jsx](src/components/sections/AboutSection.jsx)

Explains what ACM IGDTUW is and its four core pillars.

**Layout:**
- Top: Section heading + description paragraph
- Bottom: 2×2 card grid (or 4-column on desktop)

**Pillar cards:**

| Pillar | Color | Icon |
|---|---|---|
| Learn | Blue `#1e90ff` | Book icon |
| Build | Green `#2ed573` | Hammer icon |
| Connect | Purple `#a29bfe` | People icon |
| Compete | Red `#ff4757` | Trophy icon |

Each card has a colored left border that glows on hover, plus a lift `translateY(-4px)` transition.

**Scroll animation:** Left accent bar animates width from 0 to full on `ScrollTrigger`, then card content fades up with stagger.

---

### 9.3 TeamSection

**File:** [components/sections/TeamSection.jsx](src/components/sections/TeamSection.jsx)

Displays the core team in a card grid.

**Card anatomy:**
- Circular avatar with initials (colored gradient background per member)
- Pulsing dot in bottom-right corner of avatar
- Name + role below
- Card lifts + border glows on hover

**Current members:** 6 placeholder cards (President, VP, Tech Lead, Design Lead, Events Lead, Outreach Lead). Names are `"xxx"` and initials are `"xx"` — ready to be filled in.

**Layout:** 2 columns on mobile → 3 columns on tablet → 6 (or 3×2) on desktop.

---

### 9.4 EventsSection

**File:** [components/sections/EventsSection.jsx](src/components/sections/EventsSection.jsx)

Showcases 4 featured club events.

**Events:**

| Event | Tag | Color accent |
|---|---|---|
| ICPC Practice | Competitive | Red `#ff4757` |
| HackIGDTUW | Hackathon | Blue `#1e90ff` |
| ML Workshop | Workshop | Green `#2ed573` |
| Tech Talks | Talk | Purple `#a29bfe` |

**Card anatomy:**
- Top edge: 3px gradient line in event color
- Tag badge + date (top-left corner)
- Event title + 2-line description
- Participant avatars (colored initials circles) + total count

**Hover:** `translateY(-6px)` lift + colored glow `box-shadow`.

---

### 9.5 ProjectsSection

**File:** [components/sections/ProjectsSection.jsx](src/components/sections/ProjectsSection.jsx)

Showcases 3 featured club projects in an alternating left/right layout.

**Projects:**

| # | Project | Tech tags |
|---|---|---|
| 01 | ACM Pathfinder | React, Node.js, MongoDB |
| 02 | CampusConnect | Flutter, Firebase |
| 03 | CodeLens | Python, OpenCV, ML |

**Card anatomy:**
- Large number panel (left or right, alternating) with colored gradient bg
- Content panel: subtitle, title, description paragraph, tech tag chips
- `↗` arrow icon in top-right corner
- On hover: card scales slightly, arrow rotates -45° (to diagonal)

**Alternating layout:** Odd-indexed cards have the number on the left; even have it on the right. Achieved with `flex-direction: row-reverse` on even indices.

---

### 9.6 CTASection

**File:** [components/sections/CTASection.jsx](src/components/sections/CTASection.jsx)

The final section — a call to action to join the club.

**Anatomy:**
- Centered layout with a radial teal glow behind the content
- ACM logo (scales in via GSAP on scroll)
- Headline: "Ready to launch?"
- 3 benefit bullet points
- Primary CTA button: "Join ACM IGDTUW" (shimmer animation via `acm-shimmer`)
- Secondary link: "Get in touch" → `mailto:` link
- Social icons: GitHub, LinkedIn, Instagram, X (Twitter)
- Footer: `© 2025 ACM IGDTUW`

**Floating particles:**
18 small circles (6–10px) placed at random X positions across the section. Each has:
```css
animation: floatUp 3–6s ease-in infinite
/* keyframes: translateY(0) opacity(0.8) → translateY(-120px) opacity(0) */
```
Colors cycle through the brand palette: teal, cyan, purple, blue.

---

## 10. Animation System

Three animation layers work together:

### GSAP + ScrollTrigger
Used for **entrance animations** on HTML elements. Each section sets up `ScrollTrigger` with `start: "top 80%"` so animations fire just before the section enters the viewport. Common patterns:
```js
gsap.from(el, { opacity: 0, y: 40, duration: 0.8, stagger: 0.12, scrollTrigger: { ... } })
```

### RequestAnimationFrame (RAF)
Used for **continuous per-frame animations** outside R3F:
- `HeroFloat.jsx` — floating + parallax
- `PixelGridHero.jsx` — cursor canvas update
- `ScrollProgress.jsx` + `CustomCursor.jsx` — position lerping

### Three.js `useFrame`
Used inside R3F for **60fps 3D updates**:
- Game loop (ball physics, brick collisions, particle updates, canvas draw)
- Camera lerp to waypoints
- Starfield rotation
- Light orbit
- Game Boy inertia damping

### CSS Keyframes
Used for **pure CSS loops** that don't need JS control:
- `acm-float` — hero decorative bobbing
- `acm-shimmer` — CTA button light sweep
- `acm-ring-spin` — logo rotating ring
- `acm-scroll-line` — scroll hint animation
- `acm-pulse` / `acm-glow-pulse` — ambient glow effects

---

## 11. Interaction & State Flows

### Scroll
```
User scrolls
  → App.jsx 'scroll' listener fires
  → store.scroll.progress = scrollY / (docHeight - viewportHeight)
  → Scene.jsx CameraController reads store.scroll.progress in useFrame
  → Interpolates between 6 camera waypoints
  → 3D environment elements fade
  → GSAP ScrollTriggers fire section entrance animations
```

### Mouse Move
```
User moves mouse
  → App.jsx 'mousemove' listener fires
  → store.mouse.{x, y} updated (normalized -1..1)
  → CustomCursor: dot follows instantly, ring lerps
  → Scene.jsx CameraController: adds parallax offset to camera target
  → PixelGridHero: cursor canvas redraws reveal circle
```

### Play Mode (Game Boy)
```
User clicks "Play Breakout"
  → setPlaying(true) called
  → store.playing = true
  → CustomEvent 'acm-playing' dispatched
  → GameOverlay shows (listens to event)
  → body[data-playing="true"] → CSS hides nav + main
  → Scene.jsx CameraController: target switches to screen close-up
  → game.player = true → keyboard events control paddle
  → Arrow keys / A+D → game.keys updated → paddle moves

User presses ESC or clicks Back
  → setPlaying(false)
  → Reverse of above
```

### Breakout Level Up
```
All bricks destroyed
  → game.phase = 'levelup'
  → 1.5s pause, "LEVEL UP" text shown on canvas
  → game.level++, bricks reset, ball speed increases
  → game.phase = 'playing'
```

---

## 12. Responsive Design

| Breakpoint | Layout changes |
|---|---|
| Mobile (`< 768px`) | Single column sections, no custom cursor, 800 stars (not 1600), canvas DPR capped at 1, stat bar hidden in hero |
| Tablet (`768px–1024px`) | 2-column grids, reduced font sizes |
| Desktop (`> 1024px`) | Full split layouts, 50/50 hero, 3–6 column grids |

**Fluid sizing:** `clamp()` is used throughout for font sizes and spacing so the layout scales continuously rather than jumping at breakpoints.

**3D performance:** `dpr={[1, isMobile ? 1 : 1.5]}` on the R3F `<Canvas>` limits pixel ratio on mobile to reduce GPU load. The starfield is halved on mobile.

**Touch:** Custom cursor is hidden. Drag-to-rotate on the Game Boy still works via pointer events (which cover both mouse and touch).
