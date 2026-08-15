import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, useScroll, useSpring, useMotionValue } from 'framer-motion'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'

/** Jump to the top of the page whenever the route changes. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function ProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
  return <motion.div className="progress" style={{ scaleX }} aria-hidden="true" />
}

function CursorGlow() {
  const x = useMotionValue(-400)
  const y = useMotionValue(-400)
  const sx = useSpring(x, { stiffness: 120, damping: 20, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 120, damping: 20, mass: 0.5 })

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX - 280)
      y.set(e.clientY - 280)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])

  return <motion.div className="cursor-glow" style={{ x: sx, y: sy }} aria-hidden="true" />
}

export default function Layout() {
  const videoRef = useRef(null)
  const [finePointer, setFinePointer] = useState(false)

  // Tiny fallback so the film always starts: play on 'canplay' and on window load.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined
    const tryPlay = () => {
      video.play().catch(() => {})
    }
    video.addEventListener('canplay', tryPlay)
    window.addEventListener('load', tryPlay)
    return () => {
      video.removeEventListener('canplay', tryPlay)
      window.removeEventListener('load', tryPlay)
    }
  }, [])

  useEffect(() => {
    setFinePointer(window.matchMedia('(pointer: fine)').matches)
  }, [])

  return (
    <>
      {/* Film — fixed behind everything */}
      <video
        ref={videoRef}
        className="bg-video"
        src="https://zxdefgavgwfxastwmmjm.supabase.co/storage/v1/object/public/assets/prisma.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Legibility + texture layers */}
      <div className="scrim" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      {finePointer && <CursorGlow />}
      <div className="noise" aria-hidden="true" />

      <ProgressBar />
      <ScrollToTop />
      <Nav />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
