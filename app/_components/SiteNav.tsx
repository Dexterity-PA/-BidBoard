'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import AnnouncementBar from './global/AnnouncementBar'
import MagneticButton from './global/MagneticButton'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'

type NavLink = { label: string; href: string; id?: string }

const PRIMARY_LINKS: NavLink[] = [
  { label: 'How it works', href: '#how-it-works', id: 'how-it-works' },
  { label: 'Pricing', href: '#pricing', id: 'pricing' },
  { label: 'For Counselors', href: '#counselors', id: 'counselors' },
]

const RESOURCES_LINKS = [
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Guides', href: '/guides' },
]

function LogoMark() {
  return (
    <Link
      href="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'var(--bb-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: SERIF,
          fontSize: 18,
          lineHeight: 1,
          color: 'var(--bb-surface)',
        }}
      >
        B
      </span>
      <span
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--bb-ink)',
          letterSpacing: '-0.02em',
        }}
      >
        BidBoard
      </span>
    </Link>
  )
}

function NavItem({
  label,
  href,
  active,
  onRef,
}: {
  label: string
  href: string
  active: boolean
  onRef: (el: HTMLAnchorElement | null) => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      ref={onRef}
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        fontFamily: SANS,
        fontSize: 14,
        color: active ? 'var(--bb-ink)' : 'var(--bb-ink-muted)',
        textDecoration: 'none',
        padding: '6px 2px',
        transition: 'color 0.18s',
      }}
    >
      {label}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleX: hover ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        style={{
          position: 'absolute',
          left: 2,
          right: 2,
          bottom: 0,
          height: 1.5,
          background: 'var(--bb-ink)',
          transformOrigin: 'left center',
          borderRadius: 2,
        }}
      />
    </Link>
  )
}

function ResourcesDropdown() {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const onEnter = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const onLeave = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ position: 'relative' }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '6px 2px',
          cursor: 'pointer',
          fontFamily: SANS,
          fontSize: 14,
          color: 'var(--bb-ink-muted)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          transition: 'color 0.18s',
        }}
      >
        Resources
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{ display: 'inline-block', fontSize: 10, lineHeight: 1 }}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '50%',
              transformOrigin: 'top center',
              x: '-50%',
              background: 'var(--bb-surface-elevated)',
              border: '1px solid var(--bb-border-hairline)',
              borderRadius: 12,
              boxShadow: '0 12px 32px rgba(11, 11, 16, 0.08)',
              padding: 8,
              minWidth: 160,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {RESOURCES_LINKS.map((r) => (
              <Link
                key={r.label}
                href={r.href}
                role="menuitem"
                className="nav-dropdown-item"
                style={{
                  fontFamily: SANS,
                  fontSize: 14,
                  color: 'var(--bb-ink)',
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: 8,
                }}
              >
                {r.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SiteNav() {
  const reduced = useReducedMotion() ?? false
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const bg = useTransform(
    scrollY,
    [0, 60],
    ['rgba(250, 250, 247, 0)', 'rgba(250, 250, 247, 0.72)'],
  )
  const blur = useTransform(scrollY, [0, 60], ['blur(0px)', 'blur(20px)'])
  const borderOpacity = useTransform(scrollY, [0, 60], [0, 1])

  useMotionValueEvent(scrollY, 'change', (v) => {
    setScrolled(v > 60)
  })

  // Track active section for dot indicator
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [dotStyle, setDotStyle] = useState<{ x: number; width: number; visible: boolean }>({
    x: 0,
    width: 0,
    visible: false,
  })

  useEffect(() => {
    const targets = PRIMARY_LINKS.map((l) =>
      l.id ? document.getElementById(l.id) : null,
    ).filter((el): el is HTMLElement => !!el)

    if (!targets.length) return

    const intersecting = new Set<string>()

    const pickBest = () => {
      if (intersecting.size === 0) {
        setActiveId(null)
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.log('[SiteNav] activeSection = null')
        }
        return
      }
      const centerY = window.innerHeight / 2
      let best: { id: string; dist: number } | null = null
      for (const id of intersecting) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        const sectionMid = rect.top + rect.height / 2
        const dist = Math.abs(sectionMid - centerY)
        if (!best || dist < best.dist) best = { id, dist }
      }
      if (best) {
        setActiveId(best.id)
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.log('[SiteNav] activeSection =', best.id, '(dist:', Math.round(best.dist), 'px)')
        }
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) intersecting.add(e.target.id)
          else intersecting.delete(e.target.id)
        }
        pickBest()
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    )

    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const recompute = () => {
      if (!activeId) {
        setDotStyle((s) => ({ ...s, visible: false }))
        return
      }
      const el = linkRefs.current[activeId]
      // Link <a> sits directly inside the center-links flex container,
      // which is the dot's positioned ancestor — go up exactly one level.
      const parent = el?.parentElement
      if (!el || !parent) return
      const linkRect = el.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()
      setDotStyle({
        x: linkRect.left - parentRect.left + linkRect.width / 2 - 2,
        width: 4,
        visible: true,
      })
    }
    recompute()
    window.addEventListener('resize', recompute)
    return () => window.removeEventListener('resize', recompute)
  }, [activeId, scrolled])

  return (
    <>
      <AnnouncementBar />
      <motion.nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: reduced ? 'rgba(250, 250, 247, 0.9)' : bg,
          backdropFilter: reduced ? 'blur(12px)' : blur,
          WebkitBackdropFilter: reduced ? 'blur(12px)' : blur,
        }}
      >
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'var(--bb-border-hairline)',
            opacity: reduced ? 1 : borderOpacity,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <LogoMark />

          <div
            className="mkt-hide-mobile"
            style={{
              position: 'relative',
              display: 'flex',
              gap: 32,
              alignItems: 'center',
            }}
          >
            {PRIMARY_LINKS.map((l) => (
              <NavItem
                key={l.label}
                label={l.label}
                href={l.href}
                active={activeId === l.id}
                onRef={(el) => {
                  if (l.id) linkRefs.current[l.id] = el
                }}
              />
            ))}
            <ResourcesDropdown />

            <motion.span
              aria-hidden
              animate={{
                x: dotStyle.x,
                opacity: dotStyle.visible ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{
                position: 'absolute',
                bottom: -2,
                left: 0,
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--bb-primary)',
                pointerEvents: 'none',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Link
              href="/sign-in"
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: 'var(--bb-ink-muted)',
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
            <MagneticButton>
              <Link
                href="/sign-up"
                style={{
                  fontFamily: SANS,
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--bb-surface)',
                  textDecoration: 'none',
                  background: 'var(--bb-primary)',
                  padding: '8px 18px',
                  borderRadius: 8,
                  display: 'inline-block',
                  transition: 'background 0.15s',
                }}
                className="btn-indigo"
              >
                Get Started
              </Link>
            </MagneticButton>
          </div>
        </div>
      </motion.nav>
    </>
  )
}
