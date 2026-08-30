'use client';
import dynamic from 'next/dynamic';
import { Component, ReactNode } from 'react';

const SceneCanvas = dynamic(() => import('./SceneCanvas'), {
  ssr: false,
  loading: () => null,
});

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Hero3D() {
  return (
    <Boundary>
      <div className="absolute inset-0 overflow-hidden">
        <SceneCanvas />
      </div>
    </Boundary>
  );
}