'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Water } from 'three/examples/jsm/objects/Water';

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
    scene.fog = new THREE.FogExp2(0xDFE9F3, 0.002);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 15, 30);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent camera from going below ground
    controls.minDistance = 5;
    controls.maxDistance = 100;

    // Add Sky
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const sun = new THREE.Vector3();
    const phi = THREE.MathUtils.degToRad(88);
    const theta = THREE.MathUtils.degToRad(180);
    sun.setFromSphericalCoords(1, phi, theta);

    skyUniforms['sunPosition'].value.copy(sun);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(sun.x * 100, sun.y * 100, sun.z * 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Add water
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('/textures/waternormals.jpg', function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
      }
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    scene.add(water);

    // Ground terrain
    const groundGeometry = new THREE.PlaneGeometry(500, 500, 128, 128);

    // Create a heightmap for the terrain
    const heightMap = new Float32Array(groundGeometry.attributes.position.count);
    for (let i = 0; i < heightMap.length; i++) {
      const x = groundGeometry.attributes.position.getX(i);
      const z = groundGeometry.attributes.position.getZ(i);

      // Create rolling hills
      const frequency = 0.01;
      const amplitude = 5;
      heightMap[i] = amplitude * Math.sin(x * frequency) * Math.cos(z * frequency);
    }

    // Apply the heightmap to the ground geometry
    for (let i = 0; i < groundGeometry.attributes.position.count; i++) {
      groundGeometry.attributes.position.setY(i, heightMap[i]);
    }

    groundGeometry.computeVertexNormals();

    // Create ground material with texture
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