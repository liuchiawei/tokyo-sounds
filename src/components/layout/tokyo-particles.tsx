"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TokyoParticles = () => {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  
  // Create 100 particles as an example
  const count = 100;
  
  // Positions for the particles (representing lights/people in motion)
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);
  
  // Initialize particles in Tokyo scene bounds
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Random positions within the scene
    positions[i3] = (Math.random() - 0.5) * 8;     // x: -4 to 4
    positions[i3 + 1] = Math.random() * 4;          // y: 0 to 4 (above ground)
    positions[i3 + 2] = (Math.random() - 0.5) * 8; // z: -4 to 4
    
    // Random velocities for movement
    velocities[i] = 0.01 + Math.random() * 0.03;
  }
  
  useFrame(() => {
    if (particlesRef.current) {
      // Move particles to simulate bustling Tokyo atmosphere
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Move particles slowly in horizontal directions
        positions[i3] += velocities[i] * 0.5; // x movement
        positions[i3 + 2] += velocities[i] * 0.3; // z movement
        
        // Reset particles that move outside bounds
        if (Math.abs(positions[i3]) > 5) positions[i3] = (Math.random() - 0.5) * 2;
        if (Math.abs(positions[i3 + 2]) > 5) positions[i3 + 2] = (Math.random() - 0.5) * 2;
      }
      
      // Update the positions
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.position.copyArray(positions);
    }
  });
  
  // Create geometry and material
  const geometry = new THREE.BufferGeometry();
  const positionsAttr = new THREE.Float32BufferAttribute(positions, 3);
  geometry.setAttribute('position', positionsAttr);
  
  const material = new THREE.PointsMaterial({
    size: 0.05,
    color: new THREE.Color(Math.random() > 0.7 ? 0xff2a6d : 0x05d9e8), // Tokyo neon colors
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });
  
  return <points ref={particlesRef} geometry={geometry} material={material} />;
};

export default TokyoParticles;