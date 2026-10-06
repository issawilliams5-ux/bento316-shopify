'use client';
import { Component, useEffect, useState, type ReactNode } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

// Tune here: lower uSpeed = slower drift.
const SPEED = 0.065;
// Cream wash over the gradient: higher = less orange.
const WASH = 0.45;
// Grain overlay opacity (the shader's own grain is fixed-strength and too heavy).
const GRAIN = 0.12;
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Shown when the shader can't run (no WebGL, reduced motion, or a render error).
const STATIC_BG = 'radial-gradient(ellipse at 10% 20%, #D97757 0%, transparent 60%), #FAF7F2';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

// A decorative background must never take the page down with it.
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function HeroGradient() {
  const [reduceMotion, setReduceMotion] = useState(true);
  const [webgl, setWebgl] = useState(false);
  useEffect(() => {
    setWebgl(hasWebGL());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: STATIC_BG }}>
      {webgl && !reduceMotion && (
        <Boundary>
          <ShaderGradientCanvas style={{ position: 'absolute', inset: 0 }} pixelDensity={1} fov={45}>
            <ShaderGradient
              control="props"
              type="plane"
              animate="on"
              uSpeed={SPEED}
              uStrength={0.8}
              uDensity={1.1}
              uFrequency={2}
              color1="#FAF7F2"
              color2="#D97757"
              color3="#FAF7F2"
              lightType="3d"
              brightness={1.2}
              grain="off"
              cDistance={3.6}
              cPolarAngle={90}
              cAzimuthAngle={180}
              rotationZ={50}
            />
          </ShaderGradientCanvas>
        </Boundary>
      )}
      <div className="absolute inset-0 bg-[#FAF7F2]" style={{ opacity: WASH }} />
      <div className="absolute inset-0 mix-blend-multiply" style={{ backgroundImage: NOISE, opacity: GRAIN }} />
    </div>
  );
}
