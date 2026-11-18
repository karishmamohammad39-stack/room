import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Box, Plane } from '@react-three/drei';

function RotatingBox({ position, color }) {
  const mesh = useRef();
  useFrame((state, delta) => {
    mesh.current.rotation.x += delta * 0.5;
    mesh.current.rotation.y += delta * 0.5;
  });
  
  return (
    <Box ref={mesh} position={position} args={[1, 1, 1]}>
      <meshStandardMaterial color={color} />
    </Box>
  );
}

function ArchitectureMockup({ floorplan }) {
  // If we had real floorplan data from the backend, we would map over it
  // and render walls. For now, we render a placeholder.
  
  return (
    <group>
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#334155" />
      </Plane>
      {floorplan && floorplan.walls ? (
        floorplan.walls.map((wall, i) => (
          <Box key={i} position={[(wall.start[0] + wall.end[0])/2 - 5, 1, (wall.start[1] + wall.end[1])/2 - 5]} args={[Math.max(Math.abs(wall.end[0]-wall.start[0]), wall.thickness), 2, Math.max(Math.abs(wall.end[1]-wall.start[1]), wall.thickness)]}>
             <meshStandardMaterial color="#94a3b8" />
          </Box>
        ))
      ) : (
        <>
           <RotatingBox position={[-2, 0, 0]} color="#38bdf8" />
           <RotatingBox position={[2, 0, 0]} color="#818cf8" />
        </>
      )}
    </group>
  );
}

export default function Canvas3D({ floorplanData }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Environment preset="city" />
        <ArchitectureMockup floorplan={floorplanData} />
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
