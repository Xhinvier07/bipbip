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

  // Create realistic textures
  const createTexture = (color, roughness = 0.5, metalness = 0.0) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add subtle noise for realism
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: roughness,
      metalness: metalness,
    });
  };

  // Create marble texture
  const createMarbleTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Base marble color
    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(0.3, '#e9ecef');
    gradient.addColorStop(0.7, '#dee2e6');
    gradient.addColorStop(1, '#ced4da');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add marble veins
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = `rgba(108, 117, 125, ${Math.random() * 0.3 + 0.1})`;
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 1024, Math.random() * 1024);
      ctx.lineTo(Math.random() * 1024, Math.random() * 1024);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.2,
      metalness: 0.0,
    });
  };

  // Create wood texture
  const createWoodTexture = (baseColor = '#8B4513') => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base wood color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add wood grain
    for (let i = 0; i < 50; i++) {
      ctx.strokeStyle = `rgba(139, 69, 19, ${Math.random() * 0.5 + 0.3})`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * 512);
      ctx.lineTo(512, Math.random() * 512);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.0,
    });
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    scene.fog = new THREE.Fog(0xf8f9fa, 20, 80);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 20, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup with better quality
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting for realistic bank environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light (sunlight through windows)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 25, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    directionalLight.shadow.bias = -0.0001;
    scene.add(directionalLight);

    // Ceiling lights
    const ceilingLight1 = new THREE.PointLight(0xffffff, 0.8, 30);
    ceilingLight1.position.set(0, 8, 0);
    ceilingLight1.castShadow = true;
    scene.add(ceilingLight1);

    const ceilingLight2 = new THREE.PointLight(0xffffff, 0.6, 25);
    ceilingLight2.position.set(8, 8, 8);
    ceilingLight2.castShadow = true;
    scene.add(ceilingLight2);

    const ceilingLight3 = new THREE.PointLight(0xffffff, 0.6, 25);
    ceilingLight3.position.set(-8, 8, -8);
    ceilingLight3.castShadow = true;
    scene.add(ceilingLight3);

    // Floor with realistic marble texture
    const floorGeometry = new THREE.PlaneGeometry(30, 22);
    const floorMaterial = createMarbleTexture();
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle grid for reference (optional)
    const gridHelper = new THREE.GridHelper(30, 30, 0xdddddd, 0xeeeeee);
    gridHelper.position.y = 0.01;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Bank walls with realistic materials
    const wallMaterial = createTexture('#2c3e50', 0.7, 0.0);
    
    // Exterior walls
    const wallGeometry = new THREE.BoxGeometry(30, 5, 0.4);
    
    // North wall
    const northWall = new THREE.Mesh(wallGeometry, wallMaterial);
    northWall.position.set(0, 2.5, -11);
    northWall.castShadow = true;
    scene.add(northWall);
    
    // South wall
    const southWall = new THREE.Mesh(wallGeometry, wallMaterial);
    southWall.position.set(0, 2.5, 11);
    southWall.castShadow = true;
    scene.add(southWall);
    
    // East wall
    const eastWall = new THREE.Mesh(wallGeometry, wallMaterial);
    eastWall.rotation.y = Math.PI / 2;
    eastWall.position.set(15, 2.5, 0);
    eastWall.castShadow = true;
    scene.add(eastWall);
    
    // West wall (with entrance)
    const westWall = new THREE.Mesh(wallGeometry, wallMaterial);
    westWall.rotation.y = Math.PI / 2;
    westWall.position.set(-15, 2.5, 0);
    westWall.castShadow = true;
    scene.add(westWall);

    // Interior walls for bank layout
    const interiorWallGeometry = new THREE.BoxGeometry(0.4, 5, 15);
    
    // Left interior wall
    const leftInteriorWall = new THREE.Mesh(interiorWallGeometry, wallMaterial);
    leftInteriorWall.position.set(-7.5, 2.5, 0);
    leftInteriorWall.castShadow = true;
    scene.add(leftInteriorWall);
    
    // Right interior wall
    const rightInteriorWall = new THREE.Mesh(interiorWallGeometry, wallMaterial);
    rightInteriorWall.position.set(7.5, 2.5, 0);
    rightInteriorWall.castShadow = true;
    scene.add(rightInteriorWall);

    // Bank service counters with realistic materials
    const counterGeometry = new THREE.BoxGeometry(12, 1.5, 1);
    const counterMaterial = createWoodTexture('#8B4513');
    
    // Main counter
    const mainCounter = new THREE.Mesh(counterGeometry, counterMaterial);
    mainCounter.position.set(0, 0.75, -5);
    mainCounter.castShadow = true;
    scene.add(mainCounter);
    
    // Secondary counter
    const secondaryCounter = new THREE.Mesh(counterGeometry, counterMaterial);
    secondaryCounter.position.set(0, 0.75, 5);
    secondaryCounter.castShadow = true;
    scene.add(secondaryCounter);

    // ATM machine with realistic design
    const atmGeometry = new THREE.BoxGeometry(2, 2.5, 1);
    const atmMaterial = createTexture('#6c757d', 0.3, 0.8);
    const atm = new THREE.Mesh(atmGeometry, atmMaterial);
    atm.position.set(-10, 1.25, -8);
    atm.castShadow = true;
    scene.add(atm);

    // ATM screen
    const atmScreenGeometry = new THREE.PlaneGeometry(1.5, 1);
    const atmScreenMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x0066cc,
      emissiveIntensity: 0.3,
      roughness: 0.1,
      metalness: 0.0,
    });
    const atmScreen = new THREE.Mesh(atmScreenGeometry, atmScreenMaterial);
    atmScreen.position.set(-10, 1.5, -7.6);
    scene.add(atmScreen);

    // Waiting area chairs with realistic design
    const chairSeatGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.8);
    const chairBackGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.1);
    const chairMaterial = createTexture('#495057', 0.6, 0.0);
    
    for (let i = 0; i < 8; i++) {
      const chairGroup = new THREE.Group();
      
      // Chair seat
      const chairSeat = new THREE.Mesh(chairSeatGeometry, chairMaterial);
      chairSeat.position.y = 0.15;
      chairSeat.castShadow = true;
      chairGroup.add(chairSeat);
      
      // Chair back
      const chairBack = new THREE.Mesh(chairBackGeometry, chairMaterial);
      chairBack.position.set(0, 0.9, -0.35);
      chairBack.castShadow = true;
      chairGroup.add(chairBack);
      
      // Chair legs
      const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3);
      const legMaterial = createTexture('#343a40', 0.8, 0.2);
      
      for (let j = 0; j < 4; j++) {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        const x = (j % 2 === 0 ? -0.3 : 0.3);
        const z = (j < 2 ? -0.3 : 0.3);
        leg.position.set(x, 0.15, z);
        leg.castShadow = true;
        chairGroup.add(leg);
      }
      
      chairGroup.position.set(-6 + (i * 1.5), 0, 8);
      scene.add(chairGroup);
    }

    // Service points (staff positions) with realistic human representations
    const staffMaterials = {
      teller: createTexture('#e74c3c', 0.5, 0.0),
      service: createTexture('#3498db', 0.5, 0.0),
      manager: createTexture('#9b59b6', 0.5, 0.0),
      atm: createTexture('#2ecc71', 0.5, 0.0)
    };

    servicePoints.forEach((point, index) => {
      if (point.isActive) {
        // Create realistic staff representation
        const staffGroup = new THREE.Group();
        
        // Body (torso)
        const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.5, 8);
        const body = new THREE.Mesh(bodyGeometry, staffMaterials[point.type]);
        body.position.y = 0.75;
        body.castShadow = true;
        staffGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.35, 8, 8);
        const head = new THREE.Mesh(headGeometry, staffMaterials[point.type]);
        head.position.y = 2.1;
        head.castShadow = true;
        staffGroup.add(head);
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1.3, 6);
        const leftArm = new THREE.Mesh(armGeometry, staffMaterials[point.type]);
        leftArm.position.set(-0.7, 1.2, 0);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        staffGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, staffMaterials[point.type]);
        rightArm.position.set(0.7, 1.2, 0);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        staffGroup.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 6);
        const leftLeg = new THREE.Mesh(legGeometry, staffMaterials[point.type]);
        leftLeg.position.set(-0.2, -0.6, 0);
        leftLeg.castShadow = true;
        staffGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, staffMaterials[point.type]);
        rightLeg.position.set(0.2, -0.6, 0);
        rightLeg.castShadow = true;
        staffGroup.add(rightLeg);
        
        // Position staff
        staffGroup.position.set(
          (point.x - 400) / 30,
          0,
          (point.y - 300) / 30
        );
        scene.add(staffGroup);
        
        // Add floating name label with realistic design
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        // Create gradient background
        const gradient = context.createLinearGradient(0, 0, 256, 64);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 256, 64);
        
        // Add border
        context.strokeStyle = '#2c3e50';
        context.lineWidth = 2;
        context.strokeRect(1, 1, 254, 62);
        
        // Add text
        context.fillStyle = '#2c3e50';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.fillText(point.name, 128, 35);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.MeshBasicMaterial({ 
          map: texture,
          transparent: true
        });
        const labelGeometry = new THREE.PlaneGeometry(3, 0.8);
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(
          (point.x - 400) / 30,
          4,
          (point.y - 300) / 30
        );
        scene.add(label);
      }
    });

    // Customer visualization with realistic walking animations
    const customerGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const customerMaterial = createTexture('#27ae60', 0.6, 0.0);
    
    customerPaths.forEach((path, index) => {
      const customerGroup = new THREE.Group();
      
      // Customer body
      const customer = new THREE.Mesh(customerGeometry, customerMaterial);
      customer.castShadow = true;
      customerGroup.add(customer);
      
      // Customer head
      const customerHead = new THREE.Mesh(customerGeometry, customerMaterial);
      customerHead.position.y = 0.6;
      customerHead.scale.set(0.8, 0.8, 0.8);
      customerGroup.add(customerHead);
      
      // Customer arms
      const customerArmGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6);
      const leftCustomerArm = new THREE.Mesh(customerArmGeometry, customerMaterial);
      leftCustomerArm.position.set(-0.4, 0.3, 0);
      leftCustomerArm.rotation.z = Math.PI / 8;
      customerGroup.add(leftCustomerArm);
      
      const rightCustomerArm = new THREE.Mesh(customerArmGeometry, customerMaterial);
      rightCustomerArm.position.set(0.4, 0.3, 0);
      rightCustomerArm.rotation.z = -Math.PI / 8;
      customerGroup.add(rightCustomerArm);
      
      // Position customer
      customerGroup.position.set(
        (path.path[0].x - 400) / 30,
        0.3,
        (path.path[0].y - 300) / 30
      );
      scene.add(customerGroup);
      
      // Enhanced realistic walking animation
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
            (currentPoint.x - 400) / 30,
            0.3,
            (currentPoint.y - 300) / 30
          );
          const nextPos = new THREE.Vector3(
            (nextPoint.x - 400) / 30,
            0.3,
            (nextPoint.y - 300) / 30
          );
          
          // Smooth movement between points
          const lerpFactor = (Math.sin(animationTime) + 1) / 2;
          customerGroup.position.lerpVectors(currentPos, nextPos, lerpFactor);
          
          // Realistic walking animation - bobbing up and down
          customerGroup.position.y = 0.3 + Math.sin(walkCycle * 8) * 0.05;
          
          // Arm swinging animation
          leftCustomerArm.rotation.z = Math.PI / 8 + Math.sin(walkCycle * 8) * 0.3;
          rightCustomerArm.rotation.z = -Math.PI / 8 - Math.sin(walkCycle * 8) * 0.3;
          
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
      const heatmapGeometry = new THREE.PlaneGeometry(28, 20);
      const heatmapMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.2,
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
      const targetX = mouseRef.current.x * 10;
      const targetY = mouseRef.current.y * 6;
      
      camera.position.x += (15 + targetX - camera.position.x) * 0.02;
      camera.position.y += (20 + targetY - camera.position.y) * 0.02;
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
