import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const Branch3DVisualization = ({ 
  floorPlan, 
  servicePoints, 
  customerPaths, 
  showHeatmap, 
  simulationSpeed = 1 
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationIdRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f2f5);
    scene.fog = new THREE.Fog(0xf0f2f5, 15, 60);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(12, 15, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting for bank environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Additional lights for better illumination
    const pointLight1 = new THREE.PointLight(0xffffff, 0.4, 25);
    pointLight1.position.set(0, 10, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 20);
    pointLight2.position.set(8, 8, 8);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffffff, 0.3, 20);
    pointLight3.position.set(-8, 8, -8);
    scene.add(pointLight3);

    // Floor with marble-like texture
    const floorGeometry = new THREE.PlaneGeometry(24, 18);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xf5f5f5,
      transparent: true,
      opacity: 0.95
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle grid for reference
    const gridHelper = new THREE.GridHelper(24, 24, 0xdddddd, 0xeeeeee);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Bank walls with professional materials
    const wallMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2c3e50,
      transparent: true,
      opacity: 0.9
    });
    
    // Exterior walls
    const wallGeometry = new THREE.BoxGeometry(24, 4, 0.3);
    
    // North wall
    const northWall = new THREE.Mesh(wallGeometry, wallMaterial);
    northWall.position.set(0, 2, -9);
    northWall.castShadow = true;
    scene.add(northWall);
    
    // South wall
    const southWall = new THREE.Mesh(wallGeometry, wallMaterial);
    southWall.position.set(0, 2, 9);
    southWall.castShadow = true;
    scene.add(southWall);
    
    // East wall
    const eastWall = new THREE.Mesh(wallGeometry, wallMaterial);
    eastWall.rotation.y = Math.PI / 2;
    eastWall.position.set(12, 2, 0);
    eastWall.castShadow = true;
    scene.add(eastWall);
    
    // West wall (with entrance)
    const westWall = new THREE.Mesh(wallGeometry, wallMaterial);
    westWall.rotation.y = Math.PI / 2;
    westWall.position.set(-12, 2, 0);
    westWall.castShadow = true;
    scene.add(westWall);

    // Interior walls for bank layout
    const interiorWallGeometry = new THREE.BoxGeometry(0.3, 4, 12);
    
    // Left interior wall
    const leftInteriorWall = new THREE.Mesh(interiorWallGeometry, wallMaterial);
    leftInteriorWall.position.set(-6, 2, 0);
    leftInteriorWall.castShadow = true;
    scene.add(leftInteriorWall);
    
    // Right interior wall
    const rightInteriorWall = new THREE.Mesh(interiorWallGeometry, wallMaterial);
    rightInteriorWall.position.set(6, 2, 0);
    rightInteriorWall.castShadow = true;
    scene.add(rightInteriorWall);

    // Bank service counters with professional materials
    const counterGeometry = new THREE.BoxGeometry(10, 1.2, 0.8);
    const counterMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x34495e,
      transparent: true,
      opacity: 0.9
    });
    
    // Main counter
    const mainCounter = new THREE.Mesh(counterGeometry, counterMaterial);
    mainCounter.position.set(0, 0.6, -4);
    mainCounter.castShadow = true;
    scene.add(mainCounter);
    
    // Secondary counter
    const secondaryCounter = new THREE.Mesh(counterGeometry, counterMaterial);
    secondaryCounter.position.set(0, 0.6, 4);
    secondaryCounter.castShadow = true;
    scene.add(secondaryCounter);

    // ATM machine
    const atmGeometry = new THREE.BoxGeometry(1.5, 2, 0.8);
    const atmMaterial = new THREE.MeshLambertMaterial({ color: 0x7f8c8d });
    const atm = new THREE.Mesh(atmGeometry, atmMaterial);
    atm.position.set(-8, 1, -6);
    atm.castShadow = true;
    scene.add(atm);

    // Waiting area chairs
    const chairGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.8);
    const chairMaterial = new THREE.MeshLambertMaterial({ color: 0x3498db });
    
    for (let i = 0; i < 6; i++) {
      const chair = new THREE.Mesh(chairGeometry, chairMaterial);
      chair.position.set(-4 + (i * 1.2), 0.25, 6);
      chair.castShadow = true;
      scene.add(chair);
    }

    // Service points (staff positions) with human-like representations
    const staffMaterials = {
      teller: new THREE.MeshLambertMaterial({ color: 0xe74c3c }),
      service: new THREE.MeshLambertMaterial({ color: 0x3498db }),
      manager: new THREE.MeshLambertMaterial({ color: 0x9b59b6 }),
      atm: new THREE.MeshLambertMaterial({ color: 0x2ecc71 })
    };

    servicePoints.forEach((point, index) => {
      if (point.isActive) {
        // Create human-like staff representation
        const staffGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.8, 8);
        const body = new THREE.Mesh(bodyGeometry, staffMaterials[point.type]);
        body.position.y = 0.9;
        body.castShadow = true;
        staffGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const head = new THREE.Mesh(headGeometry, staffMaterials[point.type]);
        head.position.y = 2.1;
        head.castShadow = true;
        staffGroup.add(head);
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 6);
        const leftArm = new THREE.Mesh(armGeometry, staffMaterials[point.type]);
        leftArm.position.set(-0.6, 1.2, 0);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        staffGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, staffMaterials[point.type]);
        rightArm.position.set(0.6, 1.2, 0);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        staffGroup.add(rightArm);
        
        // Position staff
        staffGroup.position.set(
          (point.x - 400) / 40,
          0,
          (point.y - 300) / 40
        );
        scene.add(staffGroup);
        
        // Add floating name label
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, 256, 64);
        context.fillStyle = '#2c3e50';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.fillText(point.name, 128, 35);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.MeshBasicMaterial({ 
          map: texture,
          transparent: true
        });
        const labelGeometry = new THREE.PlaneGeometry(2.5, 0.6);
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(
          (point.x - 400) / 40,
          3.5,
          (point.y - 300) / 40
        );
        scene.add(label);
      }
    });

    // Customer visualization with walking animations
    const customerGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const customerMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x27ae60,
      transparent: true,
      opacity: 0.9
    });
    
    customerPaths.forEach((path, index) => {
      const customerGroup = new THREE.Group();
      
      // Customer body
      const customer = new THREE.Mesh(customerGeometry, customerMaterial);
      customer.castShadow = true;
      customerGroup.add(customer);
      
      // Customer head
      const customerHead = new THREE.Mesh(customerGeometry, customerMaterial);
      customerHead.position.y = 0.5;
      customerHead.scale.set(0.8, 0.8, 0.8);
      customerGroup.add(customerHead);
      
      // Position customer
      customerGroup.position.set(
        (path.path[0].x - 400) / 40,
        0.25,
        (path.path[0].y - 300) / 40
      );
      scene.add(customerGroup);
      
      // Enhanced walking animation
      let pathIndex = 0;
      let animationTime = 0;
      let walkCycle = 0;
      
      const animateCustomer = () => {
        if (pathIndex < path.path.length - 1) {
          animationTime += 0.02 * simulationSpeed;
          walkCycle += 0.1 * simulationSpeed;
          
          const currentPoint = path.path[pathIndex];
          const nextPoint = path.path[pathIndex + 1];
          
          const currentPos = new THREE.Vector3(
            (currentPoint.x - 400) / 40,
            0.25,
            (currentPoint.y - 300) / 40
          );
          const nextPos = new THREE.Vector3(
            (nextPoint.x - 400) / 40,
            0.25,
            (nextPoint.y - 300) / 40
          );
          
          // Smooth movement between points
          const lerpFactor = (Math.sin(animationTime) + 1) / 2;
          customerGroup.position.lerpVectors(currentPos, nextPos, lerpFactor);
          
          // Walking animation - bobbing up and down
          customerGroup.position.y = 0.25 + Math.sin(walkCycle * 8) * 0.1;
          
          // Slight rotation towards movement direction
          const direction = new THREE.Vector3().subVectors(nextPos, currentPos);
          if (direction.length() > 0.01) {
            customerGroup.lookAt(nextPos);
          }
          
          if (lerpFactor > 0.99) {
            pathIndex++;
            animationTime = 0;
          }
        }
      };
      
      customerGroup.userData.animate = animateCustomer;
    });

    // Heatmap visualization
    if (showHeatmap) {
      const heatmapGeometry = new THREE.PlaneGeometry(22, 16);
      const heatmapMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      });
      const heatmap = new THREE.Mesh(heatmapGeometry, heatmapMaterial);
      heatmap.rotation.x = -Math.PI / 2;
      heatmap.position.y = 0.1;
      scene.add(heatmap);
    }

    // Mouse controls for camera
    const handleMouseMove = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    mountRef.current.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Animate customers
      scene.children.forEach(child => {
        if (child.userData.animate) {
          child.userData.animate();
        }
      });
      
      // Smooth camera movement based on mouse position
      const targetX = mouseRef.current.x * 8;
      const targetY = mouseRef.current.y * 5;
      
      camera.position.x += (12 + targetX - camera.position.x) * 0.02;
      camera.position.y += (15 + targetY - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Set loading to false after initialization
    setIsLoading(false);

    // Handle window resize
    const handleResize = () => {
      if (mountRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [floorPlan, servicePoints, customerPaths, showHeatmap, simulationSpeed]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f0f2f5 0%, #e3e8ec 100%)'
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: '#2c3e50', fontSize: '14px', fontWeight: '500' }}>
              Loading 3D Bank Scene...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branch3DVisualization;
