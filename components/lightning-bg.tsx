'use client'

import { useEffect, useRef } from 'react'

// Ported from the xlwx background: one lightning bolt every ~1.3s, in a new
// spot each time, with 2-4 branches, fading over ~560ms. Canvas-only, no deps.
export function LightningBg() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const INTERVAL = 1300
    const LIFE = 560
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, raf = 0

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth; H = window.innerHeight
      canvas!.width = W * dpr; canvas!.height = H * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function makePath(x1: number, y1: number, x2: number, y2: number, spread: number) {
      let pts: [number, number][] = [[x1, y1], [x2, y2]]
      for (let d = spread; d > 3; d /= 2) {
        const next: [number, number][] = [pts[0]]
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i]
          next.push([(a[0] + b[0]) / 2 + (Math.random() - 0.5) * d, (a[1] + b[1]) / 2 + (Math.random() - 0.5) * d * 0.3], b)
        }
        pts = next
      }
      return pts
    }

    type Bolt = { main: [number, number][]; branches: [number, number][][]; born: number }
    const bolts: Bolt[] = []
    let lastX = -1
    function strike(now: number) {
      let x: number
      do { x = W * (0.08 + Math.random() * 0.84) } while (lastX >= 0 && Math.abs(x - lastX) < W * 0.22)
      lastX = x
      const endX = x + (Math.random() - 0.5) * W * 0.12
      const endY = H * (0.55 + Math.random() * 0.4)
      const main = makePath(x, -10, endX, endY, H * 0.2)
      const branches: [number, number][][] = []
      const n = 2 + Math.floor(Math.random() * 3)
      for (let i = 0; i < n; i++) {
        const p = main[Math.floor(main.length * (0.2 + Math.random() * 0.55))]
        const dir = Math.random() < 0.5 ? -1 : 1
        const len = H * (0.12 + Math.random() * 0.22)
        branches.push(makePath(p[0], p[1], p[0] + dir * len * (0.5 + Math.random() * 0.6), p[1] + len, len * 0.5))
      }
      bolts.push({ main, branches, born: now })
    }

    function stroke(pts: [number, number][], width: number, color: string) {
      ctx!.beginPath()
      ctx!.moveTo(pts[0][0], pts[0][1])
      for (let i = 1; i < pts.length; i++) ctx!.lineTo(pts[i][0], pts[i][1])
      ctx!.lineWidth = width
      ctx!.strokeStyle = color
      ctx!.stroke()
    }

    let lastStrike = -INTERVAL
    let wasEmpty = true
    function loop(now: number) {
      if (now - lastStrike >= INTERVAL) { lastStrike = now; strike(now) }
      if (bolts.length || !wasEmpty) { ctx!.clearRect(0, 0, W, H); wasEmpty = bolts.length === 0 }
      ctx!.lineJoin = 'round'; ctx!.lineCap = 'round'
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i]
        const age = now - b.born
        if (age > LIFE) { bolts.splice(i, 1); continue }
        let a = Math.pow(1 - age / LIFE, 1.5)
        if (age > 110 && age < 170) a *= 0.4
        if (!reduceMotion) { ctx!.fillStyle = `rgba(190,210,255,${0.05 * a})`; ctx!.fillRect(0, 0, W, H) }
        ctx!.shadowColor = `rgba(170,200,255,${a})`
        ctx!.shadowBlur = 22
        stroke(b.main, 6, `rgba(150,180,255,${0.22 * a})`)
        stroke(b.main, 2.2, `rgba(215,230,255,${0.9 * a})`)
        stroke(b.main, 1, `rgba(255,255,255,${a})`)
        b.branches.forEach(br => { stroke(br, 3, `rgba(150,180,255,${0.18 * a})`); stroke(br, 1.1, `rgba(225,238,255,${0.8 * a})`) })
        ctx!.shadowBlur = 0
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={ref} aria-hidden="true" />
}
