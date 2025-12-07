import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Color, Vector2, BufferGeometry, Points, ShaderMaterial } from 'three'
import vertexShader from './shaders/vertex.glsl?raw'
import fragmentShader from './shaders/fragment.glsl?raw'

interface ParticlesProps {
  width?: number
  height?: number
  depth?: number
  count?: number
  scale?: number
  size?: number
}

export default function Particles({
  width = 250,
  height = 250,
  depth = 250,
  count = 1000,
  scale = 100,
  size = 100,
}: ParticlesProps) {
  const pointsRef = useRef<Points>(null)
  const materialRef = useRef<ShaderMaterial>(null)

  // Generate random particle positions
  const positions = useMemo(() => {
    const array = new Array(count * 3)
    for (let i = 0; i < array.length; i += 3) {
      array[i] = MathUtils.randFloatSpread(width)
      array[i + 1] = MathUtils.randFloatSpread(height)
      array[i + 2] = MathUtils.randFloatSpread(depth)
    }
    return Float32Array.from(array)
  }, [count, width, height, depth])

  // Generate random attributes for each particle
  const { sizes, speeds, noises, scales } = useMemo(() => {
    const sizes = new Float32Array(count)
    const speeds = new Float32Array(count)
    const noises = new Float32Array(count * 3)
    const scales = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      sizes[i] = (Math.random() * 4 + 1.5) * 1.3 // Random size between 1.95 and 7.15 (30% bigger)
      speeds[i] = Math.random() * 0.25 + 0.05 // Random speed between 0.05 and 0.3 (50% slower)
      scales[i] = Math.random() * 7.5 + 4 // Random scale between 4 and 11.5 (50% less movement)
      
      // Random noise seeds for each particle
      noises[i * 3] = Math.random() * 100
      noises[i * 3 + 1] = Math.random() * 100
      noises[i * 3 + 2] = Math.random() * 100
    }

    return { sizes, speeds, noises, scales }
  }, [count])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new Color('rgb(150, 200, 255)') }, // Brighter blue particles
    uScroll: { value: 0 },
    uResolution: { value: new Vector2(width, height) },
  }), [width, height])

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  // TODO: Add scroll integration when Lenis is available
  // useScroll(({ scroll }) => {
  //   if (materialRef.current) {
  //     materialRef.current.uniforms.uScroll.value = scroll
  //   }
  // })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-speed"
          count={count}
          array={speeds}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-noise"
          count={count}
          array={noises}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={count}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={2} // AdditiveBlending
      />
    </points>
  )
}