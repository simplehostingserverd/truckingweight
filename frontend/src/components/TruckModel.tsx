/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * 
 * This file contains proprietary and confidential information of 
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */


import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface TruckModelProps {
  vehicleType: 'semi' | 'dump' | 'tanker';
  axleCount: number;
  axleWeights?: number[];
  totalWeight?: number;
}

const TruckModel: React.FC<TruckModelProps> = ({
  vehicleType,
  axleCount,
  axleWeights = [],
  totalWeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  // Get model path based on vehicle type
  const getModelPath = () => {
    switch (vehicleType) {
      case 'semi':
        return `/models/semi_truck_${axleCount}axle.glb`;
      case 'dump':
        return `/models/dump_truck_${axleCount}axle.glb`;
      case 'tanker':
        return `/models/tanker_truck_${axleCount}axle.glb`;
      default:
        return `/models/semi_truck_5axle.glb`;
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 3, 10);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Load 3D model
    const loader = new GLTFLoader();
    loader.load(
      getModelPath(),
      gltf => {
        const model = gltf.scene;
        model.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        scene.add(model);
        modelRef.current = model;

        // Add weight indicators if weights are provided
        if (axleWeights.length > 0) {
          addWeightIndicators(axleWeights);
        }
      },
      undefined,
      error => {
        console.error('Error loading model:', error);
      }
    );

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x999999,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, [vehicleType, axleCount]);

  // Add weight indicators to the model
  const addWeightIndicators = (weights: number[]) => {
    if (!sceneRef.current || !modelRef.current) return;

    // Remove existing indicators
    sceneRef.current.children.forEach(child => {
      if (child.userData.isWeightIndicator) {
        sceneRef.current?.remove(child);
      }
    });

    // Add new indicators
    const axlePositions = getAxlePositions(axleCount);

    weights.forEach((weight, index) => {
      if (index >= axlePositions.length) return;

      const position = axlePositions[index];

      // Create text sprite
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.font = 'Bold 60px Arial';
      context.fillStyle = weight > 20000 ? '#ff0000' : '#000000';
      context.textAlign = 'center';
      context.fillText(`${Math.round(weight / 1000)}k`, canvas.width / 2, canvas.height / 2 + 20);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);

      sprite.position.set(position.x, position.y + 1.5, position.z);
      sprite.scale.set(2, 1, 1);
      sprite.userData.isWeightIndicator = true;

      sceneRef.current.add(sprite);
    });
  };

  // Get axle positions based on axle count
  const getAxlePositions = (count: number) => {
    const positions = [];
    const truckLength = count < 5 ? 8 : 12;

    // Front axle
    positions.push(new THREE.Vector3(truckLength / 2 - 1, 0, 0));

    // Remaining axles
    const remainingAxles = count - 1;
    const spacing = truckLength / (remainingAxles + 1);

    for (let i = 0; i < remainingAxles; i++) {
      positions.push(new THREE.Vector3(-truckLength / 2 + i * spacing, 0, 0));
    }

    return positions;
  };

  // Update weight indicators when weights change
  useEffect(() => {
    if (axleWeights.length > 0) {
      addWeightIndicators(axleWeights);
    }
  }, [axleWeights]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default TruckModel;
