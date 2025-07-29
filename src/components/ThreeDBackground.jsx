// src/components/ThreeDBackground.jsx
import React, { useRef, Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Component for the animated 3D sphere with more pronounced mouse interaction
const AnimatedSphere = ({ mouse }) => {
    const mesh = useRef();
    const { viewport } = useThree();

    useFrame(() => {
        if (mesh.current) {
            // Base animation
            mesh.current.rotation.x += 0.001;
            mesh.current.rotation.y += 0.0005;

            // More aggressive mouse interaction: Make it noticeably follow the mouse
            // Increased multiplier for X/Y position
            const targetX = (mouse.x * viewport.width) / 10; // Increased from 100 to 10
            const targetY = (mouse.y * viewport.height) / 10; // Increased from 100 to 10
            mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetX, 0.1); // Increased lerp factor
            mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, targetY, 0.1); // Increased lerp factor
        }
    });

    return (
        <Sphere args={[1, 64, 64]} scale={2.5} ref={mesh}>
            <MeshDistortMaterial
                color="#a23aeb"
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0.5}
            />
        </Sphere>
    );
};

// Component for the particle animation system with more visible mouse interaction
const ParticleField = ({ mouse }) => {
    const particlesRef = useRef();
    const count = 1000;

    // Use useMemo to ensure positions and colors are only calculated once
    // and re-calculated only if count changes (which it won't here)
    const [initialPositions, colors] = useMemo(() => {
        const initialPos = new Float32Array(count * 3);
        const cols = new Float32Array(count * 3);
        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;

            initialPos[i * 3] = x;
            initialPos[i * 3 + 1] = y;
            initialPos[i * 3 + 2] = z;

            color.setHSL(Math.random() * 0.1 + 0.7, 0.5, 0.5); // Warm purple/pink hues
            cols[i * 3] = color.r;
            cols[i * 3 + 1] = color.g;
            cols[i * 3 + 2] = color.b;
        }
        return [initialPos, cols];
    }, [count]);

    // Use a separate ref for current positions that will be mutated
    const currentPositions = useRef(initialPositions.slice()); // Copy initial positions

    useFrame((state, delta) => {
        if (particlesRef.current) {
            // Base animation: vertical drift
            particlesRef.current.position.y -= 0.005;
            if (particlesRef.current.position.y < -5) {
                particlesRef.current.position.y = 5;
            }

            // Mouse interaction: Particles noticeably repel from the mouse
            const mouseX = mouse.x * 0.5; // Increased scale for mouse influence
            const mouseY = mouse.y * 0.5;

            const positionAttribute = particlesRef.current.geometry.attributes.position;
            const positionsArray = currentPositions.current; // Use the mutable array

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                const initialX = initialPositions[i3];
                const initialY = initialPositions[i3 + 1];

                const dx = initialX - mouseX;
                const dy = initialY - mouseY;
                const dist2 = dx * dx + dy * dy;

                const influenceRadius = 5; // Increased radius of mouse influence
                const maxRepulsionForce = 1.0; // Increased max force

                if (dist2 < influenceRadius * influenceRadius) {
                    const dist = Math.sqrt(dist2);
                    // Repulsion strength: stronger closer to mouse, 0 at influenceRadius
                    const repulsionStrength = Math.max(0, 1 - dist / influenceRadius) * maxRepulsionForce;

                    positionsArray[i3] = initialX + (dx / dist) * repulsionStrength;
                    positionsArray[i3 + 1] = initialY + (dy / dist) * repulsionStrength;
                } else {
                    positionsArray[i3] = initialX;
                    positionsArray[i3 + 1] = initialY;
                }
            }
            positionAttribute.needsUpdate = true; // Tell Three.js to update the buffer
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry attach="geometry">
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={currentPositions.current} // Use the mutable array
                    itemSize={3}
                    usage={THREE.DynamicDrawUsage} // Important for frequently updated buffers
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                attach="material"
                vertexColors={true}
                size={0.05} // Smaller size for more distinct particles
                sizeAttenuation={true}
                transparent={true}
                alphaTest={0.5}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

// Component for more pronounced camera parallax
const CameraParallax = ({ mouse }) => {
    const { camera } = useThree();

    useFrame(() => {
        // More noticeable camera movement based on mouse
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.5, 0.05); // Increased multiplier
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.5, 0.05); // Increased multiplier
        camera.lookAt(0, 0, 0);
    });

    return null;
};


const ThreeDBackground = () => {
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    const handleMouseMove = (event) => {
        setMouse({
            x: (event.clientX / window.innerWidth) * 2 - 1, // Normalized X from -1 to 1
            y: -(event.clientY / window.innerHeight) * 2 + 1 // Normalized Y from -1 to 1
        });
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <Suspense fallback={null}>
                    <AnimatedSphere mouse={mouse} />
                    <ParticleField mouse={mouse} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
                </Suspense>
                <CameraParallax mouse={mouse} />
            </Canvas>
        </div>
    );
};

export default ThreeDBackground;