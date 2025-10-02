# React Three Fiber (R3F) System - Complete Deep Dive

## Table of Contents
1. [Introduction & Architecture](#introduction--architecture)
2. [Core Concepts](#core-concepts)
3. [Canvas Component](#canvas-component)
4. [Hooks System](#hooks-system)
5. [Event System & Interactions](#event-system--interactions)
6. [Model Loading & Management](#model-loading--management)
7. [@react-three/drei Ecosystem](#react-threedrei-ecosystem)
8. [Post-Processing with @react-three/postprocessing](#post-processing-with-react-threepostprocessing)
9. [Performance Optimization](#performance-optimization)
10. [Production Best Practices](#production-best-practices)

---

## Introduction & Architecture

**React Three Fiber** is a React renderer for Three.js that enables declarative, component-based 3D scene construction. It provides a React-like abstraction over Three.js while maintaining full access to the underlying Three.js API.

### Key Architectural Principles
- **No Performance Overhead**: R3F outperforms vanilla Three.js in scale due to React's scheduling abilities
- **Complete Three.js Compatibility**: Everything that works in Three.js works in R3F without exception
- **Declarative Scene Graph**: Build scenes using JSX components that map directly to Three.js objects
- **React Ecosystem Integration**: Full compatibility with React hooks, context, and state management

### Installation
```bash
npm install three @types/three @react-three/fiber
```

**Version Compatibility:**
- `@react-three/fiber@8` pairs with `react@18`
- `@react-three/fiber@9` pairs with `react@19`

---

## Core Concepts

### JSX to Three.js Mapping
R3F uses a simple 1:1 mapping between JSX elements and Three.js constructors:

```jsx
// JSX
<mesh />
// Becomes
new THREE.Mesh()

// With properties
<mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="orange" />
</mesh>
```

### Constructor Arguments
All constructor arguments are passed via the `args` prop:
```jsx
<boxGeometry args={[1, 1, 1]} />
<meshStandardMaterial args={[{ color: 'red' }]} />
```

### Property Setting
Properties can be set using:
- **Dash-case**: `position-x={1}` (sets `object.position.x = 1`)
- **Dot-notation**: `material-color="red"` (sets `object.material.color`)
- **Direct assignment**: `position={[0, 1, 0]}` (sets `object.position`)

---

## Canvas Component

The `<Canvas>` component is the entry point to R3F and creates the Three.js context.

### Basic Usage
```jsx
import { Canvas } from '@react-three/fiber'

function App() {
  return (
    <Canvas>
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <sphereGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </Canvas>
  )
}
```

### Canvas Properties
| Prop | Description | Default |
|------|-------------|---------|
| `camera` | Camera props or custom camera | `{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }` |
| `shadows` | Shadow map settings | `false` |
| `dpr` | Device pixel ratio | `[1, 2]` |
| `gl` | WebGL renderer props | `{}` |
| `scene` | Scene props or custom scene | `{}` |
| `frameloop` | Render mode | `'always'` |
| `orthographic` | Use orthographic camera | `false` |

### Advanced Configuration
```jsx
<Canvas
  shadows="soft"
  dpr={[1, 2]}
  camera={{ fov: 45, position: [0, 0, 10] }}
  gl={{ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance"
  }}
  onCreated={(state) => {
    // Access to the full state
    console.log('Canvas created:', state)
  }}
>
  {/* Your 3D scene */}
</Canvas>
```

---

## Hooks System

R3F provides several hooks for accessing Three.js context and controlling the render loop.

### useThree Hook
Access the complete R3F state including renderer, scene, camera, and more:

```jsx
import { useThree } from '@react-three/fiber'

function MyComponent() {
  const { 
    gl,        // WebGL renderer
    scene,     // Three.js scene
    camera,    // Current camera
    raycaster, // Default raycaster
    pointer,   // Normalized pointer coordinates
    size,      // Canvas size
    viewport   // Viewport in Three.js units
  } = useThree()
  
  // Selective state (prevents unnecessary re-renders)
  const camera = useThree((state) => state.camera)
}
```

### useFrame Hook
Execute code on every frame:

```jsx
import { useFrame } from '@react-three/fiber'

function RotatingBox() {
  const ref = useRef()
  
  useFrame((state, delta, xrFrame) => {
    // Rotate the mesh every frame
    if (ref.current) {
      ref.current.rotation.x += delta
      ref.current.rotation.y += delta
    }
  })
  
  return (
    <mesh ref={ref}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}
```

**Performance Note**: Never use `setState` inside `useFrame` - it will cause performance issues.

### useLoader Hook
Load assets with automatic suspense integration:

```jsx
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

function Model() {
  const gltf = useLoader(GLTFLoader, '/model.glb')
  return <primitive object={gltf.scene} />
}

// With Suspense boundary
function App() {
  return (
    <Canvas>
      <Suspense fallback={<LoadingSpinner />}>
        <Model />
      </Suspense>
    </Canvas>
  )
}
```

### useGraph Hook
Create named collections from Object3D hierarchies:

```jsx
import { useGraph } from '@react-three/fiber'

function Model() {
  const scene = useLoader(OBJLoader, '/model.obj')
  const { nodes, materials } = useGraph(scene)
  
  return (
    <mesh 
      geometry={nodes.robotMesh.geometry} 
      material={materials.metalMaterial} 
    />
  )
}
```

---

## Event System & Interactions

R3F provides a comprehensive event system with automatic raycasting.

### Available Events
```jsx
<mesh
  onClick={(e) => console.log('clicked', e)}
  onContextMenu={(e) => console.log('right-clicked', e)}
  onDoubleClick={(e) => console.log('double-clicked', e)}
  onPointerUp={(e) => console.log('pointer up', e)}
  onPointerDown={(e) => console.log('pointer down', e)}
  onPointerOver={(e) => console.log('hovered', e)}
  onPointerOut={(e) => console.log('unhovered', e)}
  onPointerEnter={(e) => console.log('entered', e)}
  onPointerLeave={(e) => console.log('left', e)}
  onPointerMove={(e) => console.log('moved', e)}
  onPointerMissed={() => console.log('missed')}
  onWheel={(e) => console.log('wheel', e)}
/>
```

### Event Object Properties
```jsx
function ClickHandler({ onClick }) {
  const handleClick = (event) => {
    console.log('Object clicked:', event.object)
    console.log('Intersection point:', event.point)
    console.log('Distance:', event.distance)
    console.log('Face index:', event.faceIndex)
    console.log('UV coordinates:', event.uv)
    
    // Prevent event bubbling
    event.stopPropagation()
  }
  
  return <mesh onClick={handleClick} />
}
```

### Interactive Example
```jsx
function InteractiveCube() {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  
  return (
    <mesh
      scale={clicked ? 1.5 : 1}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry />
      <meshStandardMaterial 
        color={hovered ? 'hotpink' : 'orange'} 
      />
    </mesh>
  )
}
```

---

## Model Loading & Management

### GLTF Loading (Recommended)
```jsx
import { useGLTF } from '@react-three/drei'

function Model() {
  const { nodes, materials } = useGLTF('/model.glb')
  
  return (
    <group>
      <mesh 
        geometry={nodes.meshName.geometry}
        material={materials.materialName}
      />
    </group>
  )
}

// Preload for better performance
useGLTF.preload('/model.glb')
```

### Converting GLTF to JSX Components
Use the gltfjsx tool at https://gltf.pmnd.rs/ to convert GLTF files into React components:

```jsx
// Generated component
export function Model(props) {
  const { nodes, materials } = useGLTF('/Poimandres.gltf')
  return (
    <group {...props} dispose={null}>
      <mesh 
        castShadow 
        receiveShadow 
        geometry={nodes.Curve007_1.geometry} 
        material={materials['Material.001']} 
      />
    </group>
  )
}
```

### Other Loader Types
```jsx
// OBJ Loading
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
const obj = useLoader(OBJLoader, '/model.obj')

// FBX Loading
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
const fbx = useLoader(FBXLoader, '/model.fbx')

// Texture Loading
import { TextureLoader } from 'three'
const texture = useLoader(TextureLoader, '/texture.jpg')
```

---

## @react-three/drei Ecosystem

Drei provides a collection of useful helpers and abstractions for R3F.

### Installation
```bash
npm install @react-three/drei
```

### Essential Components

#### OrbitControls
```jsx
import { OrbitControls } from '@react-three/drei'

<Canvas>
  <OrbitControls 
    enablePan={true}
    enableZoom={true}
    enableRotate={true}
    dampingFactor={0.1}
  />
</Canvas>
```

#### Environment & Lighting
```jsx
import { Environment, ContactShadows } from '@react-three/drei'

<Canvas>
  <Environment preset="sunset" background />
  <ContactShadows 
    position={[0, -0.8, 0]} 
    opacity={0.25} 
    scale={10} 
    blur={1.5} 
  />
</Canvas>
```

#### Text Component
```jsx
import { Text } from '@react-three/drei'

<Text
  color="black"
  fontSize={1}
  maxWidth={200}
  lineHeight={1}
  letterSpacing={0.02}
  textAlign="left"
  font="/fonts/Inter-Bold.woff"
  anchorX="center"
  anchorY="middle"
>
  Hello World!
</Text>
```

#### Stage Component
```jsx
import { Stage } from '@react-three/drei'

<Stage 
  controls={ref} 
  preset="rembrandt" 
  intensity={1} 
  environment="city"
>
  <Model />
</Stage>
```

### Performance Helpers

#### Instances for Performance
```jsx
import { Instances, Instance } from '@react-three/drei'

<Instances limit={1000} range={1000}>
  <boxGeometry />
  <meshStandardMaterial />
  {data.map((props, i) => (
    <Instance key={i} {...props} />
  ))}
</Instances>
```

#### Level of Detail (LOD)
```jsx
import { Detailed } from '@react-three/drei'

<Detailed distances={[0, 10, 20]}>
  <mesh geometry={highPoly} />
  <mesh geometry={mediumPoly} />
  <mesh geometry={lowPoly} />
</Detailed>
```

---

## Post-Processing with @react-three/postprocessing

### Installation
```bash
npm install @react-three/postprocessing
```

### Basic Setup
```jsx
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing'

<Canvas>
  <Scene />
  <EffectComposer>
    <Bloom intensity={1.5} luminanceThreshold={0.9} />
    <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} />
  </EffectComposer>
</Canvas>
```

### Selective Bloom Effect
```jsx
import { EffectComposer, Bloom, Selection, Select } from '@react-three/postprocessing'

function App() {
  return (
    <Canvas>
      <Selection>
        <EffectComposer multisampling={8} autoClear={false}>
          <Bloom mipmapBlur luminanceThreshold={1} />
        </EffectComposer>
        
        <Select enabled={shouldGlow}>
          <mesh>
            <sphereGeometry />
            <meshStandardMaterial 
              emissive="orange" 
              emissiveIntensity={2} 
              toneMapped={false} 
            />
          </mesh>
        </Select>
      </Selection>
    </Canvas>
  )
}
```

### Outline Effect
```jsx
import { EffectComposer, Outline } from '@react-three/postprocessing'

function App() {
  const meshRef = useRef()
  
  return (
    <Canvas>
      <mesh ref={meshRef}>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
      
      <EffectComposer>
        <Outline 
          selection={[meshRef]} 
          edgeStrength={2.5}
          visibleEdgeColor={0xffffff}
          hiddenEdgeColor={0x22090a}
          blur={false}
          xRay={true}
        />
      </EffectComposer>
    </Canvas>
  )
}
```

---

## Performance Optimization

### Instancing for Multiple Objects
```jsx
function Instances({ count = 100000 }) {
  const instancedMeshRef = useRef()
  const tempObject = new THREE.Object3D()
  
  useEffect(() => {
    for (let i = 0; i < count; i++) {
      tempObject.position.set(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      )
      tempObject.updateMatrix()
      instancedMeshRef.current.setMatrixAt(i, tempObject.matrix)
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  }, [count])
  
  return (
    <instancedMesh 
      ref={instancedMeshRef} 
      args={[null, null, count]}
    >
      <boxGeometry />
      <meshStandardMaterial />
    </instancedMesh>
  )
}
```

### Avoid setState in useFrame
```jsx
// ❌ Don't do this
function BadComponent() {
  const [rotation, setRotation] = useState(0)
  
  useFrame(() => {
    setRotation(prev => prev + 0.01) // Causes re-renders every frame
  })
  
  return <mesh rotation={[rotation, 0, 0]} />
}

// ✅ Do this instead
function GoodComponent() {
  const ref = useRef()
  
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.01 // Direct mutation
    }
  })
  
  return <mesh ref={ref} />
}
```

### Use Visibility Instead of Mounting
```jsx
// ❌ Expensive remounting
{stage === 1 && <Stage1 />}
{stage === 2 && <Stage2 />}

// ✅ Toggle visibility
<Stage1 visible={stage === 1} />
<Stage2 visible={stage === 2} />
```

### Performance Monitoring
```bash
npm install r3f-perf --save-dev
```

```jsx
import { Perf } from 'r3f-perf'

<Canvas>
  <Perf position="top-left" />
  <Scene />
</Canvas>
```

---

## Production Best Practices

### 1. Proper Resource Management
```jsx
// Dispose of resources properly
useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
  }
}, [])
```

### 2. Error Boundaries
```jsx
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Canvas fallback={<div>WebGL not supported</div>}>
        <Scene />
      </Canvas>
    </ErrorBoundary>
  )
}
```

### 3. Suspense for Loading States
```jsx
<Canvas>
  <Suspense fallback={<LoadingSpinner />}>
    <Models />
  </Suspense>
</Canvas>
```

### 4. Optimize Bundle Size with Tree Shaking
```jsx
// Import only what you need
import { extend, createRoot } from '@react-three/fiber'
import { Mesh, BoxGeometry, MeshStandardMaterial } from 'three'

extend({ Mesh, BoxGeometry, MeshStandardMaterial })
```

### 5. Frame Rate Management
```jsx
// Control frame rate for mobile devices
<Canvas frameloop="demand" dpr={[1, 2]}>
  <Scene />
</Canvas>
```

### 6. Memory Management for Large Scenes
```jsx
function Scene() {
  useEffect(() => {
    // Cleanup function
    return () => {
      // Dispose geometries, materials, textures
      disposeResources()
    }
  }, [])
}
```

---

## Conclusion

React Three Fiber provides a powerful, performant way to create 3D web applications using React's declarative paradigm. The ecosystem of supporting libraries (Drei, Postprocessing, XR) makes it a comprehensive solution for modern 3D web development.

**Key Takeaways:**
- R3F maintains full Three.js compatibility while providing React benefits
- Use hooks like `useFrame` and `useThree` for accessing Three.js context
- Leverage Drei components for common 3D UI patterns
- Apply performance optimization techniques like instancing and proper resource management
- Implement proper error handling and loading states for production applications

For complex interactive applications like Tokyo Sounds, R3F provides the perfect balance of performance, developer experience, and maintainability.