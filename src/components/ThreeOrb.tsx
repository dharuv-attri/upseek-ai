import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeOrbProps {
  mood?: 'hyper' | 'deepreason' | 'creative' | 'quantum';
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onOrbClick?: () => void;
}

const MOOD_PALETTES = {
  hyper: {
    coreColor: 0x06b6d4, // Cyan
    wireColor: 0x38bdf8,
    ringColor: 0x6366f1, // Indigo
    particleColor: 0xa855f7, // Purple
    speed: 1.0,
    name: 'UPSEEK Hyper',
  },
  deepreason: {
    coreColor: 0x8b5cf6, // Violet
    wireColor: 0xc084fc,
    ringColor: 0x3b82f6, // Blue
    particleColor: 0xec4899, // Pink
    speed: 0.7,
    name: 'DeepReason R1',
  },
  creative: {
    coreColor: 0xf59e0b, // Amber
    wireColor: 0xfbbf24,
    ringColor: 0xef4444, // Red
    particleColor: 0x10b981, // Emerald
    speed: 1.2,
    name: 'Creative Spark',
  },
  quantum: {
    coreColor: 0x10b981, // Emerald
    wireColor: 0x34d399,
    ringColor: 0x06b6d4, // Cyan
    particleColor: 0x6366f1, // Indigo
    speed: 1.4,
    name: 'Quantum Logic',
  },
};

// Reusable math helpers outside render loop
const _mouse = new THREE.Vector2(0, 0);
const _targetRotation = new THREE.Vector2(0, 0);

export const ThreeOrb: React.FC<ThreeOrbProps> = ({
  mood = 'hyper',
  interactive = true,
  size = 'lg',
  className = '',
  onOrbClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMood, setActiveMood] = useState<keyof typeof MOOD_PALETTES>(mood);
  const moodRef = useRef(activeMood);
  moodRef.current = activeMood;

  useEffect(() => {
    setActiveMood(mood);
  }, [mood]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Group for entire procedural orb assembly
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // 1. Inner Core: Pulsing Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.0, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: MOOD_PALETTES[activeMood].coreColor,
      roughness: 0.15,
      metalness: 0.85,
      wireframe: false,
      emissive: MOOD_PALETTES[activeMood].coreColor,
      emissiveIntensity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    orbGroup.add(coreMesh);

    // 2. Wireframe Lattice Outer Shell
    const wireGeo = new THREE.IcosahedronGeometry(1.22, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: MOOD_PALETTES[activeMood].wireColor,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    orbGroup.add(wireMesh);

    // 3. Orbital Gimbal Rings (3 distinct axes)
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: MOOD_PALETTES[activeMood].ringColor,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ringGeo1 = new THREE.TorusGeometry(1.65, 0.02, 16, 100);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    orbGroup.add(ring1);

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: MOOD_PALETTES[activeMood].particleColor,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ringGeo2 = new THREE.TorusGeometry(1.85, 0.015, 16, 100);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    orbGroup.add(ring2);

    const ringMat3 = new THREE.MeshStandardMaterial({
      color: MOOD_PALETTES[activeMood].coreColor,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ringGeo3 = new THREE.TorusGeometry(2.05, 0.012, 16, 100);
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.z = Math.PI / 6;
    orbGroup.add(ring3);

    // 4. Neural Particle Swarm
    const particleCount = isSoftwareGl ? 300 : 750;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.35 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      particleSpeeds[i] = 0.5 + Math.random() * 1.5;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Create soft circular particle texture procedurally
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const pTexture = new THREE.CanvasTexture(canvas);
    pTexture.colorSpace = THREE.SRGBColorSpace;

    const particleMat = new THREE.PointsMaterial({
      color: MOOD_PALETTES[activeMood].particleColor,
      size: 0.065,
      map: pTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    orbGroup.add(particles);

    // 5. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 2.0);
    rimLight.position.set(-4, -3, -3);
    scene.add(rimLight);

    // Pointer move handler for interactive parallax
    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      _mouse.set(x, y);
      _targetRotation.set(y * 0.45, x * 0.45);
    };

    if (interactive) {
      window.addEventListener('pointermove', handlePointerMove);
    }

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const palette = MOOD_PALETTES[moodRef.current];

      // Smooth color transitions
      coreMat.color.lerp(new THREE.Color(palette.coreColor), delta * 3);
      coreMat.emissive.lerp(new THREE.Color(palette.coreColor), delta * 3);
      wireMat.color.lerp(new THREE.Color(palette.wireColor), delta * 3);
      ringMat1.color.lerp(new THREE.Color(palette.ringColor), delta * 3);
      ringMat2.color.lerp(new THREE.Color(palette.particleColor), delta * 3);
      ringMat3.color.lerp(new THREE.Color(palette.coreColor), delta * 3);
      particleMat.color.lerp(new THREE.Color(palette.particleColor), delta * 3);

      const speedFactor = palette.speed;

      // Rotate group and sub-elements
      orbGroup.rotation.y += delta * 0.25 * speedFactor;
      orbGroup.rotation.x = THREE.MathUtils.damp(orbGroup.rotation.x, _targetRotation.x, 3, delta);
      orbGroup.rotation.y = THREE.MathUtils.damp(orbGroup.rotation.y, orbGroup.rotation.y + _targetRotation.y * 0.05, 3, delta);

      // Pulse inner core geometry scale
      const pulse = 1.0 + Math.sin(time * 2.2 * speedFactor) * 0.06;
      coreMesh.scale.set(pulse, pulse, pulse);

      // Rotate wireframe slightly counter
      wireMesh.rotation.y -= delta * 0.35 * speedFactor;
      wireMesh.rotation.x += delta * 0.15;

      // Rotate gimbal rings on individual axes
      ring1.rotation.z += delta * 0.6 * speedFactor;
      ring2.rotation.x += delta * 0.45 * speedFactor;
      ring3.rotation.y -= delta * 0.5 * speedFactor;

      // Rotate particle swarm
      particles.rotation.y += delta * 0.18 * speedFactor;
      particles.rotation.z -= delta * 0.08 * speedFactor;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      ringGeo3.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      ringMat3.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      pTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const sizeClasses = {
    sm: 'w-48 h-48 sm:w-60 sm:h-60',
    md: 'w-64 h-64 sm:w-80 sm:h-80',
    lg: 'w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px]',
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Glow Backdrop */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-35 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${
            activeMood === 'hyper'
              ? 'rgba(6,182,212,0.45)'
              : activeMood === 'deepreason'
              ? 'rgba(139,92,246,0.45)'
              : activeMood === 'creative'
              ? 'rgba(245,158,11,0.45)'
              : 'rgba(16,185,129,0.45)'
          } 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      {/* WebGL Canvas Container */}
      <div
        ref={mountRef}
        onClick={onOrbClick}
        className={`${sizeClasses[size]} relative z-10 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95`}
        title="Interactive UPSEEK 3D Neural Orb — Click or move cursor to interact"
      />

      {/* Interactive Mood Selector Pill */}
      {interactive && (
        <div className="relative z-20 mt-3 flex items-center gap-1.5 p-1 rounded-full bg-neutral-900/70 border border-neutral-700/60 backdrop-blur-md shadow-xl text-xs">
          {(Object.keys(MOOD_PALETTES) as Array<keyof typeof MOOD_PALETTES>).map((key) => {
            const isSelected = activeMood === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMood(key)}
                className={`px-2.5 py-1 rounded-full font-medium transition-all duration-200 capitalize flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      key === 'hyper'
                        ? '#06b6d4'
                        : key === 'deepreason'
                        ? '#8b5cf6'
                        : key === 'creative'
                        ? '#f59e0b'
                        : '#10b981',
                  }}
                />
                {key}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
