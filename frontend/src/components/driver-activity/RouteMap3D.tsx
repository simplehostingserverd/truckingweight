'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
  timestamp: string;
  speed: number;
}

interface RouteMap3DProps {
  route: RoutePoint[];
  currentPosition?: RoutePoint;
}

const RouteMap3D: React.FC<RouteMap3DProps> = ({ route, currentPosition }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !route || route.length < 2) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f8ff); // Light sky blue
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x7cfc00,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Convert GPS coordinates to scene coordinates
    const minLat = Math.min(...route.map(point => point.lat));
    const maxLat = Math.max(...route.map(point => point.lat));
    const minLng = Math.min(...route.map(point => point.lng));
    const maxLng = Math.max(...route.map(point => point.lng));
    
    const scaleX = 50 / (maxLng - minLng);
    const scaleZ = 50 / (maxLat - minLat);
    
    const mapPoints = route.map(point => {
      const x = (point.lng - minLng) * scaleX - 25;
      const z = (point.lat - minLat) * scaleZ - 25;
      return new THREE.Vector3(x, 0, z);
    });
    
    // Create route path
    const routeGeometry = new THREE.BufferGeometry().setFromPoints(mapPoints);
    const routeMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2 });
    const routeLine = new THREE.Line(routeGeometry, routeMaterial);
    scene.add(routeLine);
    
    // Add waypoint markers
    route.forEach((point, index) => {
      const markerGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const markerMaterial = new THREE.MeshStandardMaterial({ 
        color: index === 0 ? 0x00ff00 : index === route.length - 1 ? 0xff0000 : 0xffff00 
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(mapPoints[index]);
      marker.position.y = 0.3;
      marker.castShadow = true;
      scene.add(marker);
    });
    
    // Load truck model
    let truck: THREE.Object3D;
    const loader = new GLTFLoader();
    
    // Try to load a truck model, or use a simple box as fallback
    try {
      loader.load(
        '/models/truck.glb', // You'll need to add this model file to your public directory
        (gltf) => {
          truck = gltf.scene;
          truck.scale.set(0.5, 0.5, 0.5);
          truck.castShadow = true;
          scene.add(truck);
          
          // Position the truck at the current position or at a point along the route
          const currentIndex = currentPosition 
            ? route.findIndex(p => p.lat === currentPosition.lat && p.lng === currentPosition.lng)
            : Math.floor(route.length * 0.7);
          
          const pos = mapPoints[currentIndex >= 0 ? currentIndex : Math.floor(route.length * 0.7)];
          truck.position.copy(pos);
          truck.position.y = 0.5;
          
          // Calculate rotation to face the direction of travel
          if (currentIndex > 0 && currentIndex < route.length - 1) {
            const prevPos = mapPoints[currentIndex - 1];
            const direction = new THREE.Vector3().subVectors(pos, prevPos);
            const angle = Math.atan2(direction.x, direction.z);
            truck.rotation.y = angle;
          }
          
          setLoading(false);
        },
        undefined,
        (error) => {
          console.error('Error loading truck model:', error);
          // Fallback to a simple box
          createFallbackTruck();
        }
      );
    } catch (err) {
      console.error('Failed to load truck model:', err);
      createFallbackTruck();
    }
    
    function createFallbackTruck() {
      const truckGeometry = new THREE.BoxGeometry(1, 0.8, 2);
      const truckMaterial = new THREE.MeshStandardMaterial({ color: 0x3366cc });
      truck = new THREE.Mesh(truckGeometry, truckMaterial);
      truck.castShadow = true;
      scene.add(truck);
      
      // Position the truck
      const currentIndex = currentPosition 
        ? route.findIndex(p => p.lat === currentPosition.lat && p.lng === currentPosition.lng)
        : Math.floor(route.length * 0.7);
      
      const pos = mapPoints[currentIndex >= 0 ? currentIndex : Math.floor(route.length * 0.7)];
      truck.position.copy(pos);
      truck.position.y = 0.4;
      
      // Calculate rotation
      if (currentIndex > 0 && currentIndex < route.length - 1) {
        const prevPos = mapPoints[currentIndex - 1];
        const direction = new THREE.Vector3().subVectors(pos, prevPos);
        const angle = Math.atan2(direction.x, direction.z);
        truck.rotation.y = angle;
      }
      
      setLoading(false);
    }
    
    // Animation loop
    let lastTime = 0;
    const animationSpeed = 0.01;
    let currentPathPosition = currentPosition 
      ? route.findIndex(p => p.lat === currentPosition.lat && p.lng === currentPosition.lng)
      : Math.floor(route.length * 0.7);
    
    if (currentPathPosition < 0) currentPathPosition = Math.floor(route.length * 0.7);
    
    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      
      // Update truck position along the path
      if (truck && currentPathPosition < route.length - 1) {
        currentPathPosition += animationSpeed * (delta / 100);
        
        if (currentPathPosition >= route.length - 1) {
          currentPathPosition = route.length - 1;
        }
        
        const currentIndex = Math.floor(currentPathPosition);
        const nextIndex = Math.min(currentIndex + 1, route.length - 1);
        const fraction = currentPathPosition - currentIndex;
        
        const currentPos = mapPoints[currentIndex];
        const nextPos = mapPoints[nextIndex];
        
        // Interpolate between current and next position
        const pos = new THREE.Vector3().lerpVectors(currentPos, nextPos, fraction);
        truck.position.copy(pos);
        truck.position.y = 0.5;
        
        // Calculate rotation to face the direction of travel
        const direction = new THREE.Vector3().subVectors(nextPos, currentPos);
        if (direction.length() > 0) {
          const angle = Math.atan2(direction.x, direction.z);
          truck.rotation.y = angle;
        }
      }
      
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate(0);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
    };
  }, [route, currentPosition]);
  
  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-lg font-semibold">Loading 3D Map...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75">
          <div className="text-lg font-semibold text-red-600">{error}</div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default RouteMap3D;