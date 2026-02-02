'use client'
import { ReactLenis } from '@studio-freight/react-lenis'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      <ReactLenis
        root
        options={{
          lerp: 0.1,
          duration: 1.2,
          smoothWheel: true,
          wheelMultiplier: 1.0,
        }}
      >
        {children}
      </ReactLenis>
    </div>
  )
}