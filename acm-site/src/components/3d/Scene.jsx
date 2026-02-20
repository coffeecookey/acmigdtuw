import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo, Suspense, useEffect } from 'react'
import * as THREE from 'three'
import { Grid } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import store, { setPlaying } from '../../lib/store'

/* ════════════════════════════════════════════════════════════
   BREAKOUT GAME — runs on an off-screen canvas, drawn every frame
   ════════════════════════════════════════════════════════════ */
const GW = 320, GH = 240
const BALL_R = 5
const PADDLE_SPEED = 5.5
const BRICK_ROWS = 5, BRICK_COLS = 8
const BRICK_W = 36, BRICK_H = 14

const ROW_COLORS = ['#0082aa', '#00a8cc', '#00d4ff', '#7B4FFF', '#5533cc']

function createGameState() {
  const bricks = []
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: 6 + c * (BRICK_W + 2),
        y: 20 + r * (BRICK_H + 4),
        alive: true,
        color: ROW_COLORS[r],
      })
    }
  }
  return {
    ball:   { x: GW / 2, y: GH * 0.58, vx: 2.4, vy: -2.9 },
    paddle: { x: GW / 2 - 32, y: GH - 24, w: 64, h: 9 },
    bricks,
    score: 0, lives: 3, level: 1,
    player: false,
    keys:   { left: false, right: false },
    sparks: [],
    phase:  0,
  }
}

function tickGame(g) {
  const { ball, paddle, bricks, keys } = g
  g.phase++

  // Paddle
  if (g.player) {
    if (keys.left)  paddle.x -= PADDLE_SPEED
    if (keys.right) paddle.x += PADDLE_SPEED
  } else {
    paddle.x += (ball.x - paddle.w / 2 - paddle.x) * 0.075
  }
  paddle.x = Math.max(0, Math.min(GW - paddle.w, paddle.x))

  // Ball
  ball.x += ball.vx
  ball.y += ball.vy

  // Wall bounces
  if (ball.x <= BALL_R)      { ball.x = BALL_R;      ball.vx =  Math.abs(ball.vx) }
  if (ball.x >= GW - BALL_R) { ball.x = GW - BALL_R; ball.vx = -Math.abs(ball.vx) }
  if (ball.y <= BALL_R + 13) { ball.y = BALL_R + 13; ball.vy =  Math.abs(ball.vy) }

  // Paddle bounce
  if (
    ball.vy > 0 &&
    ball.y + BALL_R >= paddle.y &&
    ball.y - BALL_R <= paddle.y + paddle.h &&
    ball.x >= paddle.x - 2 && ball.x <= paddle.x + paddle.w + 2
  ) {
    ball.vy = -Math.abs(ball.vy)
    const hit = (ball.x - paddle.x) / paddle.w - 0.5
    ball.vx   = hit * 7
    const spd = Math.hypot(ball.vx, ball.vy)
    if (spd > 6.5) { ball.vx *= 6.5 / spd; ball.vy *= 6.5 / spd }
  }

  // Bottom — lose life
  if (ball.y > GH + 20) {
    g.lives--
    if (g.lives <= 0) { Object.assign(g, createGameState()); return }
    ball.x = GW / 2; ball.y = GH * 0.55
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random())
    ball.vy = -2.9
  }

  // Brick collisions
  for (const b of bricks) {
    if (!b.alive) continue
    if (ball.x + BALL_R > b.x && ball.x - BALL_R < b.x + BRICK_W &&
        ball.y + BALL_R > b.y && ball.y - BALL_R < b.y + BRICK_H) {
      b.alive = false; ball.vy *= -1; g.score += 10
      for (let i = 0; i < 7; i++) {
        g.sparks.push({
          x: b.x + BRICK_W / 2, y: b.y + BRICK_H / 2,
          vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
          life: 1, color: b.color,
        })
      }
      break
    }
  }

  g.sparks = g.sparks.filter(s => { s.x += s.vx; s.y += s.vy; s.life -= 0.055; return s.life > 0 })

  if (bricks.every(b => !b.alive)) {
    const sv = { score: g.score, lives: Math.min(g.lives + 1, 5), level: g.level + 1, player: g.player }
    Object.assign(g, createGameState())
    Object.assign(g, sv)
    g.ball.vx *= Math.pow(1.08, g.level - 1)
    g.ball.vy *= Math.pow(1.08, g.level - 1)
  }
}

function drawGame(canvas, g) {
  const ctx = canvas.getContext('2d')
  const { ball, paddle, bricks, score, lives, level, sparks, phase, player } = g

  // Background
  ctx.fillStyle = '#04080f'
  ctx.fillRect(0, 0, GW, GH)

  // Scanlines
  for (let y = 0; y < GH; y += 3) {
    ctx.fillStyle = 'rgba(0,0,0,0.11)'; ctx.fillRect(0, y, GW, 1)
  }

  // HUD strip
  ctx.fillStyle = 'rgba(0,18,32,0.9)'
  ctx.fillRect(0, 0, GW, 14)
  ctx.strokeStyle = 'rgba(0,130,170,0.45)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(GW, 14); ctx.stroke()
  ctx.font = 'bold 8px "Courier New", monospace'
  ctx.fillStyle = '#0082aa'; ctx.fillText(`SCORE ${score}`, 6, 10)
  ctx.fillStyle = '#00d4ff'; ctx.fillText(`LV ${level}`, GW / 2 - 10, 10)
  ctx.fillStyle = '#7B4FFF'; ctx.fillText('♥'.repeat(lives), GW - 52, 10)

  // Bricks
  for (const b of bricks) {
    if (!b.alive) continue
    ctx.fillStyle = b.color; ctx.fillRect(b.x + 1, b.y + 1, BRICK_W - 2, BRICK_H - 2)
    ctx.fillStyle = 'rgba(255,255,255,0.17)'; ctx.fillRect(b.x + 1, b.y + 1, BRICK_W - 2, 3)
    ctx.shadowBlur = 6; ctx.shadowColor = b.color
    ctx.strokeStyle = `${b.color}88`; ctx.lineWidth = 0.8
    ctx.strokeRect(b.x, b.y, BRICK_W, BRICK_H)
    ctx.shadowBlur = 0
  }

  // Sparks
  for (const s of sparks) {
    ctx.globalAlpha = s.life
    ctx.shadowBlur = 8; ctx.shadowColor = s.color
    ctx.fillStyle = s.color; ctx.fillRect(s.x - 2, s.y - 2, 4, 4)
    ctx.shadowBlur = 0
  }
  ctx.globalAlpha = 1

  // Paddle
  const pg = ctx.createLinearGradient(paddle.x, 0, paddle.x + paddle.w, 0)
  pg.addColorStop(0, '#005070'); pg.addColorStop(0.5, '#00d4ff'); pg.addColorStop(1, '#005070')
  ctx.shadowBlur = 10; ctx.shadowColor = '#00d4ff'
  ctx.fillStyle = pg; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h)
  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(paddle.x + 3, paddle.y + 1, paddle.w - 6, 3)

  // Ball glow
  const bg = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, 16)
  bg.addColorStop(0, 'rgba(0,212,255,0.4)'); bg.addColorStop(1, 'rgba(0,212,255,0)')
  ctx.beginPath(); ctx.arc(ball.x, ball.y, 16, 0, Math.PI * 2)
  ctx.fillStyle = bg; ctx.fill()
  // Ball core
  ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
  ctx.shadowBlur = 12; ctx.shadowColor = '#00d4ff'
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.shadowBlur = 0

  // Outer border
  ctx.strokeStyle = 'rgba(0,130,170,0.2)'; ctx.lineWidth = 1
  ctx.strokeRect(2, 2, GW - 4, GH - 4)

  // Idle blink hint (only when AI is playing)
  if (!player && phase % 100 < 65) {
    ctx.fillStyle = 'rgba(0,212,255,0.5)'
    ctx.font = '8px "Courier New", monospace'
    const label = '← → TAKE CONTROL, USE ARROW KEYS TO PLAY'
    const w = ctx.measureText(label).width
    ctx.fillText(label, GW / 2 - w / 2, GH - 5)
  }
}

/* ════════════════════════════════════════════════════════════
   CAMERA — zooms into the Game Boy screen when playing
   ════════════════════════════════════════════════════════════ */
const WAYPOINTS = [
  { pos: [0, 0.4, 5.5],  look: [0, 0, 0]      },
  { pos: [-1.8, 0.2, 7], look: [0, 0, 0]      },
  { pos: [0, -0.6, 6],   look: [0, -0.3, 0]   },
  { pos: [1.8, 0.2, 7],  look: [0, 0, 0]      },
  { pos: [0, 1.2, 8.5],  look: [0, 0.5, 0]    },
  { pos: [0, 0, 3.8],    look: [0, 0, 0]      },
]
// Camera position when zoomed into the Game Boy screen
const PLAY_POS  = new THREE.Vector3(0, 0.88, 2.0)
const PLAY_LOOK = new THREE.Vector3(0, 0.88, 0.30)

function lerpV(a, b, t) {
  return [
    THREE.MathUtils.lerp(a[0], b[0], t),
    THREE.MathUtils.lerp(a[1], b[1], t),
    THREE.MathUtils.lerp(a[2], b[2], t),
  ]
}

function CameraController() {
  const { camera } = useThree()
  const curPos  = useRef(new THREE.Vector3(0, 0.4, 5.5))
  const curLook = useRef(new THREE.Vector3(0, 0, 0))
  const tPos    = useRef(new THREE.Vector3())
  const tLook   = useRef(new THREE.Vector3())

  useFrame(() => {
    if (store.playing) {
      tPos.current.copy(PLAY_POS)
      tLook.current.copy(PLAY_LOOK)
    } else {
      const p   = store.scroll.progress
      const max = WAYPOINTS.length - 1
      const raw = Math.max(0, Math.min(max, p * max))
      const i   = Math.min(Math.floor(raw), max - 1)
      const tt  = raw - i
      const a   = WAYPOINTS[i], b = WAYPOINTS[Math.min(i + 1, max)]
      const [px, py, pz] = lerpV(a.pos, b.pos, tt)
      const [lx, ly, lz] = lerpV(a.look, b.look, tt)
      const mx = store.mouse.x * 0.25, my = store.mouse.y * 0.15
      tPos.current.set(px + mx * 0.4, py + my * 0.4, pz)
      tLook.current.set(lx + mx, ly + my, lz)
    }

    const speed = store.playing ? 0.055 : 0.04
    curPos.current.lerp(tPos.current, speed)
    curLook.current.lerp(tLook.current, 0.065)
    camera.position.copy(curPos.current)
    camera.lookAt(curLook.current)
  })

  return null
}

/* ════════════════════════════════════════════════════════════
   GAME BOY  (built from Three.js primitives)
   ════════════════════════════════════════════════════════════ */
function GameBoy() {
  const groupRef = useRef()

  // Off-screen game canvas + CanvasTexture
  const gameCanvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = GW; c.height = GH
    return c
  }, [])
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(gameCanvas)
    t.minFilter = THREE.LinearFilter
    return t
  }, [gameCanvas])

  const game = useRef(createGameState())

  // Drag-rotation state
  const baseRotY  = useRef(0)   // accumulated Y rotation from drag
  const baseRotX  = useRef(0)   // accumulated X rotation from drag
  const velY      = useRef(0)   // inertia Y velocity
  const velX      = useRef(0)   // inertia X velocity
  const isDrag    = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })

  // Keyboard + drag pointer events
  useEffect(() => {
    const g = game.current

    const startPlaying = () => { if (!store.playing) setPlaying(true) }
    const stopPlaying  = () => { if (store.playing) { setPlaying(false); g.player = false } }

    const dn = (e) => {
      if (['ArrowLeft',  'a', 'A'].includes(e.key)) { g.player = true; startPlaying(); g.keys.left  = true }
      if (['ArrowRight', 'd', 'D'].includes(e.key)) { g.player = true; startPlaying(); g.keys.right = true }
      if (e.key === 'Escape') stopPlaying()
    }
    const up = (e) => {
      if (['ArrowLeft',  'a', 'A'].includes(e.key)) g.keys.left  = false
      if (['ArrowRight', 'd', 'D'].includes(e.key)) g.keys.right = false
    }

    // Drag handlers — window-level so they work anywhere on the page
    const pDown = (e) => {
      if (store.playing) return
      if (e.target.closest('button, a, input, select, textarea')) return
      isDrag.current = true
      const src = e.touches ? e.touches[0] : e
      lastMouse.current = { x: src.clientX, y: src.clientY }
      velY.current = 0
      velX.current = 0
    }
    const pMove = (e) => {
      if (!isDrag.current || store.playing) return
      const src = e.touches ? e.touches[0] : e
      const dx = (src.clientX - lastMouse.current.x) * 0.007
      const dy = (src.clientY - lastMouse.current.y) * 0.004
      velY.current = dx
      velX.current = dy
      baseRotY.current += dx
      baseRotX.current = Math.max(-0.45, Math.min(0.45, baseRotX.current + dy))
      lastMouse.current = { x: src.clientX, y: src.clientY }
    }
    const pUp = () => { isDrag.current = false }

    window.addEventListener('keydown',    dn)
    window.addEventListener('keyup',      up)
    window.addEventListener('mousedown',  pDown)
    window.addEventListener('mousemove',  pMove)
    window.addEventListener('mouseup',    pUp)
    window.addEventListener('touchstart', pDown, { passive: true })
    window.addEventListener('touchmove',  pMove, { passive: true })
    window.addEventListener('touchend',   pUp)
    return () => {
      window.removeEventListener('keydown',    dn)
      window.removeEventListener('keyup',      up)
      window.removeEventListener('mousedown',  pDown)
      window.removeEventListener('mousemove',  pMove)
      window.removeEventListener('mouseup',    pUp)
      window.removeEventListener('touchstart', pDown)
      window.removeEventListener('touchmove',  pMove)
      window.removeEventListener('touchend',   pUp)
    }
  }, [])

  useFrame(({ clock }) => {
    const t    = clock.elapsedTime
    const fade = Math.max(0, 1 - store.scroll.progress * 4.5)
    groupRef.current.scale.setScalar(Math.max(0.001, fade))

    if (store.playing) {
      // Snap rotation back to centre and lock for stable gameplay
      baseRotY.current = THREE.MathUtils.lerp(baseRotY.current, 0, 0.07)
      baseRotX.current = THREE.MathUtils.lerp(baseRotX.current, 0, 0.07)
      velY.current *= 0.5
      velX.current *= 0.5
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.09)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.09)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.09)
    } else {
      // Apply inertia when not dragging
      if (!isDrag.current) {
        velY.current *= 0.88
        velX.current *= 0.88
        baseRotY.current += velY.current
        baseRotX.current = Math.max(-0.45, Math.min(0.45, baseRotX.current + velX.current))
      }
      // Floating position + drag-accumulated rotation + ambient yaw wobble
      groupRef.current.position.y = Math.sin(t * 0.55) * 0.08
      groupRef.current.rotation.y = baseRotY.current + Math.sin(t * 0.16) * 0.06
      groupRef.current.rotation.x = baseRotX.current
    }

    tickGame(game.current)
    drawGame(gameCanvas, game.current)
    tex.needsUpdate = true
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>

      {/* Screen ambient glow */}
      <pointLight position={[0, 0.88, 1.1]} intensity={1.4} color="#b8c8ff" distance={5} decay={2} />

      {/* ── Main body ── */}
      <mesh>
        <boxGeometry args={[2.0, 3.6, 0.55]} />
        <meshStandardMaterial color="#a8a8a8" metalness={0.05} roughness={0.80} />
      </mesh>

      {/* Lower controls section (slightly darker shade) */}
      <mesh position={[0, -1.18, 0.006]}>
        <boxGeometry args={[1.99, 1.22, 0.54]} />
        <meshStandardMaterial color="#9e9e9e" metalness={0.04} roughness={0.84} />
      </mesh>

      {/* ── Screen bezel ── */}
      <mesh position={[0, 0.88, 0.274]}>
        <boxGeometry args={[1.72, 1.62, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.75} />
      </mesh>

      {/* Screen inner recess */}
      <mesh position={[0, 0.88, 0.295]}>
        <planeGeometry args={[1.38, 1.04]} />
        <meshStandardMaterial color="#080808" />
      </mesh>

      {/* Screen edge micro-glow */}
      <mesh position={[0, 0.88, 0.296]}>
        <planeGeometry args={[1.24, 0.935]} />
        <meshStandardMaterial color="#b8c8ff" transparent opacity={0.04}
          emissive="#b8c8ff" emissiveIntensity={0.3} />
      </mesh>

      {/* ── Game screen ── */}
      <mesh position={[0, 0.88, 0.298]}>
        <planeGeometry args={[1.22, 0.915]} />
        <meshBasicMaterial map={tex} />
      </mesh>

      {/* ── Brand bar ── */}
      <mesh position={[0, 1.58, 0.277]}>
        <boxGeometry args={[1.20, 0.09, 0.005]} />
        <meshStandardMaterial color="#8c8c8c" metalness={0} roughness={0.9} />
      </mesh>

      {/* ── Section separator line ── */}
      <mesh position={[0, 0.05, 0.276]}>
        <boxGeometry args={[1.78, 0.010, 0.005]} />
        <meshStandardMaterial color="#909090" />
      </mesh>

      {/* ── D-pad — horizontal arm ── */}
      <mesh position={[-0.52, -0.40, 0.290]}>
        <boxGeometry args={[0.54, 0.17, 0.040]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.12} roughness={0.68} />
      </mesh>
      {/* D-pad — vertical arm */}
      <mesh position={[-0.52, -0.40, 0.290]}>
        <boxGeometry args={[0.17, 0.54, 0.040]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.12} roughness={0.68} />
      </mesh>
      {/* D-pad — center nub */}
      <mesh position={[-0.52, -0.40, 0.312]}>
        <circleGeometry args={[0.055, 12]} />
        <meshStandardMaterial color="#1c1c1c" />
      </mesh>

      {/* ── A button ── */}
      <mesh position={[0.63, -0.28, 0.290]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.115, 0.115, 0.044, 22]} />
        <meshStandardMaterial color="#8b1a2e" metalness={0.22} roughness={0.52} />
      </mesh>
      <mesh position={[0.63, -0.28, 0.314]}>
        <circleGeometry args={[0.065, 16]} />
        <meshStandardMaterial color="#b82040" transparent opacity={0.45} />
      </mesh>

      {/* ── B button ── */}
      <mesh position={[0.40, -0.50, 0.290]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.115, 0.115, 0.044, 22]} />
        <meshStandardMaterial color="#8b1a2e" metalness={0.22} roughness={0.52} />
      </mesh>
      <mesh position={[0.40, -0.50, 0.314]}>
        <circleGeometry args={[0.065, 16]} />
        <meshStandardMaterial color="#b82040" transparent opacity={0.45} />
      </mesh>

      {/* ── Start button ── */}
      <mesh position={[0.20, -0.74, 0.282]} rotation={[0, 0, 0.38]}>
        <boxGeometry args={[0.22, 0.068, 0.025]} />
        <meshStandardMaterial color="#787878" metalness={0.1} roughness={0.78} />
      </mesh>
      {/* ── Select button ── */}
      <mesh position={[-0.12, -0.74, 0.282]} rotation={[0, 0, 0.38]}>
        <boxGeometry args={[0.22, 0.068, 0.025]} />
        <meshStandardMaterial color="#787878" metalness={0.1} roughness={0.78} />
      </mesh>

      {/* ── Speaker grille dots ── */}
      {Array.from({ length: 15 }, (_, i) => ({
        x: 0.50 + (i % 3) * 0.11,
        y: -0.60 + Math.floor(i / 3) * 0.10,
      })).map((p, i) => (
        <mesh key={`spk${i}`} position={[p.x, p.y, 0.278]}>
          <circleGeometry args={[0.026, 8]} />
          <meshStandardMaterial color="#6c6c6c" />
        </mesh>
      ))}

      {/* ── Power LED ── */}
      <mesh position={[-0.78, -1.68, 0.278]}>
        <sphereGeometry args={[0.028, 10, 10]} />
        <meshStandardMaterial color="#ff3355" emissive="#ff3355" emissiveIntensity={3.0} />
      </mesh>

      {/* ── L shoulder button ── */}
      <mesh position={[-1.02, 1.64, 0.05]}>
        <boxGeometry args={[0.04, 0.28, 0.50]} />
        <meshStandardMaterial color="#969696" metalness={0} roughness={0.82} />
      </mesh>
      {/* ── R shoulder button ── */}
      <mesh position={[1.02, 1.64, 0.05]}>
        <boxGeometry args={[0.04, 0.28, 0.50]} />
        <meshStandardMaterial color="#969696" metalness={0} roughness={0.82} />
      </mesh>

      {/* ── Headphone jack (top) ── */}
      <mesh position={[-0.45, 1.83, 0]}>
        <cylinderGeometry args={[0.044, 0.044, 0.08, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.4} />
      </mesh>

    </group>
  )
}

/* ════════════════════════════════════════════════════════════
   STARFIELD
   ════════════════════════════════════════════════════════════ */
function StarField({ count = 1600 }) {
  const ref = useRef()
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(Math.random() * 2 - 1)
      const r     = 10 + Math.random() * 22
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      const t = Math.random() < 0.15
      col[i * 3]     = t ? 0.0  : 0.7 + Math.random() * 0.3
      col[i * 3 + 1] = t ? 0.51 : 0.78 + Math.random() * 0.22
      col[i * 3 + 2] = t ? 0.67 : 0.92 + Math.random() * 0.08
    }
    return [pos, col]
  }, [count])

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.007
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.003) * 0.04
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color"    array={colors}    count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial vertexColors transparent opacity={0.75} size={0.055} sizeAttenuation />
    </points>
  )
}

/* ════════════════════════════════════════════════════════════
   RETRO ENVIRONMENT — Y2K / PCB atmospheric background
   Replaces: FloatingShapes
   ════════════════════════════════════════════════════════════ */

// Utility: push a connected polyline as lineSegments vertex pairs
function addPath(pts, z, out) {
  for (let i = 0; i < pts.length - 1; i++) {
    out.push(pts[i][0], pts[i][1], z, pts[i + 1][0], pts[i + 1][1], z)
  }
}

// Orthogonal PCB-style circuit traces
function CircuitTraces() {
  const ref = useRef()
  const geo = useMemo(() => {
    const v = []
    // Left cluster
    addPath([[-4.8,1.8],[-4.0,1.8],[-4.0,0.8],[-2.8,0.8],[-2.8,1.8],[-1.8,1.8]], -5.5, v)
    addPath([[-4.8,0.0],[-3.2,0.0],[-3.2,-1.2],[-4.8,-1.2],[-4.8,-2.0],[-2.4,-2.0]], -5.5, v)
    addPath([[-5.0,1.0],[-3.5,1.0],[-3.5,0.2],[-2.2,0.2],[-2.2,1.8],[-0.8,1.8]], -7.5, v)
    // Right cluster
    addPath([[4.8,1.8],[4.0,1.8],[4.0,0.8],[2.8,0.8],[2.8,1.8],[1.5,1.8]], -5.5, v)
    addPath([[3.5,-1.0],[3.0,-1.0],[3.0,0.2],[2.0,0.2],[2.0,-1.8],[0.5,-1.8]], -6.5, v)
    addPath([[4.6,-0.5],[3.8,-0.5],[3.8,-1.6],[2.6,-1.6]], -8.0, v)
    // Deep background
    addPath([[-1.2,-3.2],[0.0,-3.2],[0.0,-2.4],[1.2,-2.4],[1.2,-3.8]], -8.5, v)
    addPath([[-2.5,3.2],[-1.2,3.2],[-1.2,2.0],[0.2,2.0],[0.2,3.5],[2.4,3.5]], -9.5, v)
    // Short via stubs
    addPath([[-3.2,0.5],[-3.2,-0.2]], -6.5, v)
    addPath([[2.8,-0.5],[2.8,-1.2]], -7.2, v)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3))
    return g
  }, [])

  useFrame(() => {
    if (ref.current) {
      const fade = Math.max(0, 1 - store.scroll.progress * 3.5)
      ref.current.material.opacity = fade * 0.09
    }
  })

  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial color="#0082aa" transparent opacity={0.09} />
    </lineSegments>
  )
}

// Solder via dots at trace junctions
function TraceVias() {
  const ref = useRef()
  const { pos, count } = useMemo(() => {
    const pts = [
      [-4.0,1.8,-5.5], [-4.0,0.8,-5.5], [-2.8,0.8,-5.5], [-2.8,1.8,-5.5],
      [-3.2,0.0,-5.5], [-3.2,-1.2,-5.5], [-4.8,-1.2,-5.5],
      [-3.5,1.0,-7.5], [-2.2,0.2,-7.5], [-2.2,1.8,-7.5],
      [4.0,1.8,-5.5], [4.0,0.8,-5.5], [2.8,0.8,-5.5], [2.8,1.8,-5.5],
      [3.0,-1.0,-6.5], [2.0,0.2,-6.5], [2.0,-1.8,-6.5],
      [0.0,-2.4,-8.5], [1.2,-2.4,-8.5], [1.2,-3.8,-8.5],
      [-1.2,2.0,-9.5], [0.2,2.0,-9.5], [0.2,3.5,-9.5],
    ]
    return { pos: new Float32Array(pts.flat()), count: pts.length }
  }, [])

  useFrame(() => {
    if (ref.current) {
      const fade = Math.max(0, 1 - store.scroll.progress * 3.5)
      ref.current.material.opacity = fade * 0.16
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#00d4ff" transparent opacity={0.16} size={0.058} sizeAttenuation />
    </points>
  )
}

// Wireframe CRT monitor / terminal window outlines
const SCREEN_DEFS = [
  { pos: [-4.2, 0.6, -7.2], w: 2.8, h: 2.0 },
  { pos: [ 3.8, 0.8, -7.8], w: 2.5, h: 1.9 },
  { pos: [-2.0,-2.4, -9.8], w: 1.9, h: 1.5 },
  { pos: [ 1.8, 2.8, -9.2], w: 1.9, h: 1.5 },
  { pos: [ 0.2,-1.8,-12.5], w: 3.4, h: 2.5 },
]

function WireframeScreen({ def, index }) {
  const ref = useRef()
  const outerGeo = useMemo(() =>
    new THREE.EdgesGeometry(new THREE.BoxGeometry(def.w, def.h, 0.01)), [def.w, def.h])
  const innerGeo = useMemo(() =>
    new THREE.EdgesGeometry(new THREE.BoxGeometry(def.w * 0.74, def.h * 0.68, 0.01)), [def.w, def.h])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    const fade = Math.max(0, 1 - store.scroll.progress * 3.5)
    ref.current.position.x = def.pos[0] + Math.sin(t * 0.04 + index) * 0.05
    ref.current.position.y = def.pos[1] + Math.cos(t * 0.03 + index * 1.3) * 0.04
    ref.current.children.forEach((c, ci) => {
      if (c.material) c.material.opacity = fade * (ci === 0 ? 0.07 : 0.04)
    })
  })

  return (
    <group ref={ref} position={def.pos}>
      <lineSegments geometry={outerGeo}>
        <lineBasicMaterial color="#0082aa" transparent opacity={0.07} />
      </lineSegments>
      <lineSegments geometry={innerGeo}>
        <lineBasicMaterial color="#00d4ff" transparent opacity={0.04} />
      </lineSegments>
    </group>
  )
}

function WireframeScreens() {
  return (
    <>
      {SCREEN_DEFS.map((def, i) => <WireframeScreen key={i} def={def} index={i} />)}
    </>
  )
}

// Binary digit patches — static canvas textures at depth
function BinaryField() {
  const planes = useMemo(() => {
    const POSITIONS = [
      [-4.8, 1.6, -7.2], [3.9, -0.8, -8.4], [-2.4, 3.2, -10.5],
      [4.4, 2.4, -9.6],  [-0.8, -3.0, -11.5],
    ]
    return POSITIONS.map(([x, y, z], i) => {
      const c = document.createElement('canvas')
      c.width = 128; c.height = 80
      const cx = c.getContext('2d')
      cx.clearRect(0, 0, 128, 80)
      cx.font = '9px "Courier New", monospace'
      cx.fillStyle = '#0082aa'
      for (let row = 0; row < 6; row++) {
        let s = ''
        for (let col = 0; col < 13; col++) s += Math.random() > 0.5 ? '1' : '0'
        cx.fillText(s, 4, 12 + row * 12)
      }
      const tex = new THREE.CanvasTexture(c)
      tex.minFilter = THREE.LinearFilter
      return { pos: [x, y, z], tex, key: i }
    })
  }, [])

  return (
    <>
      {planes.map(({ pos, tex, key }) => (
        <BinaryPlane key={key} pos={pos} tex={tex} index={key} />
      ))}
    </>
  )
}

function BinaryPlane({ pos, tex, index }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const fade = Math.max(0, 1 - store.scroll.progress * 3.2)
    ref.current.material.opacity = fade * 0.05
    ref.current.position.y = pos[1] + Math.sin(clock.elapsedTime * 0.07 + index * 1.4) * 0.1
  })
  return (
    <mesh ref={ref} position={pos}>
      <planeGeometry args={[1.6, 1.0]} />
      <meshBasicMaterial map={tex} transparent opacity={0.05} depthWrite={false} />
    </mesh>
  )
}

function RetroEnvironment() {
  return (
    <>
      <CircuitTraces />
      <TraceVias />
      <WireframeScreens />
      <BinaryField />
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   CYBER GRID
   ════════════════════════════════════════════════════════════ */
function CyberGrid() {
  const ref = useRef()
  useFrame(() => {
    if (ref.current) {
      const fade = Math.max(0.05, 1 - store.scroll.progress * 3)
      ref.current.material.opacity = fade * 0.7
    }
  })
  return (
    <Grid ref={ref} position={[0, -2.7, 0]} args={[50, 50]}
      cellSize={0.85} cellThickness={0.35} cellColor="#0a2a35"
      sectionSize={4.25} sectionThickness={0.7} sectionColor="#0082aa"
      fadeDistance={28} fadeStrength={1.8} followCamera={false} infiniteGrid />
  )
}

/* ════════════════════════════════════════════════════════════
   LIGHTS
   ════════════════════════════════════════════════════════════ */
function SceneLights() {
  const l1 = useRef(), l2 = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    l1.current.position.set( Math.sin(t * 0.30) * 3.5, Math.cos(t * 0.22) * 2 + 1.5, 2)
    l2.current.position.set(-Math.sin(t * 0.24) * 4,   Math.cos(t * 0.17) * 2 - 1,   2)
  })
  return (
    <>
      <ambientLight intensity={0.07} />
      <pointLight ref={l1} intensity={3.5} color="#0082aa" distance={14} decay={2} />
      <pointLight ref={l2} intensity={2.2} color="#7B4FFF" distance={14} decay={2} />
      <pointLight position={[0, 6, 3]}  intensity={1.2} color="#ffffff" distance={20} decay={2} />
      <pointLight position={[0, -4, 0]} intensity={0.8} color="#0082aa" distance={12} decay={2} />
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════════ */
export default function Scene() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#04080f' }}>
      <Canvas
        camera={{ position: [0, 0.4, 5.5], fov: 58, near: 0.1, far: 120 }}
        dpr={[1, isMobile ? 1 : 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#04080f']} />
        <fog attach="fog" args={['#04080f', 18, 40]} />

        <Suspense fallback={null}>
          <SceneLights />
          <CameraController />
          <StarField count={isMobile ? 800 : 1600} />
          <GameBoy />
          <RetroEnvironment />
          <CyberGrid />

          <EffectComposer>
            <Bloom intensity={1.2} kernelSize={KernelSize.MEDIUM}
              luminanceThreshold={0.06} luminanceSmoothing={0.85} mipmapBlur height={300} />
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0008, 0.0004]} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
