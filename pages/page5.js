import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Gói toàn bộ logic khởi tạo vào một hàm init() và xuất nó ra
export function init() {

    // 1. Khởi tạo Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0d0f0); // Light blue background color

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable antialiasing
    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows


    // Set CSS for html and body to remove default margins/paddings and ensure full viewport height
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.height = '100%'; 
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden'; 
    document.body.style.height = '100%'; 

    // Create a DIV container for the Three.js canvas
    const threeJsContainer = document.createElement('div');
    threeJsContainer.id = 'threejs-canvas-container';
    threeJsContainer.style.width = '100vw';
    threeJsContainer.style.display = 'block';
    threeJsContainer.style.position = 'relative'; 
    document.body.appendChild(threeJsContainer);

    // Function to update container and renderer size
    function updateThreeJsContainerSize() {
        // Get the height of content above the Three.js container
        const contentAboveHeight = threeJsContainer.getBoundingClientRect().top;
        threeJsContainer.style.height = `calc(100vh - ${contentAboveHeight}px)`;

        const containerWidth = threeJsContainer.offsetWidth;
        const containerHeight = threeJsContainer.offsetHeight;

        renderer.setSize(containerWidth, containerHeight);
        renderer.setPixelRatio(window.devicePixelRatio); // Adjust pixel ratio for Retina displays
        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();
    }

    threeJsContainer.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    // Call update size function on DOMContentLoaded and load events
    window.addEventListener('DOMContentLoaded', updateThreeJsContainerSize);
    window.addEventListener('load', updateThreeJsContainerSize); 


    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Ambient light
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8); // Directional light (like sun)
    dirLight.position.set(20, 30, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // DIRECTIONAL LIGHT SHADOW SETTINGS
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const d = 35;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.bias = -0.0005;

    // 3. Grass ground (using color and normal texture)
    const textureLoader = new THREE.TextureLoader();
    const grassColorMap = textureLoader.load('textures/grass/grass_color.jpg', 
        (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(50, 50);
            groundMaterial.map = texture;
            groundMaterial.needsUpdate = true;
        },
        undefined,
        (err) => console.error('Lỗi tải texture cỏ:', err)
    );
    const grassNormalMap = textureLoader.load('textures/grass/grass_normal.jpg', 
        (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(50, 50);
            groundMaterial.normalMap = texture; // Assign normal map
            groundMaterial.needsUpdate = true;
        },
        undefined,
        (err) => console.error('Lỗi tải normal map cỏ:', err)
    );

    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
        roughness: 1,
        metalness: 0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 4. Ring track (using a single color texture)
    const outerRadius = 30, innerRadius = 25, segments = 128;
    const trackGeometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
    const trackMaterial = new THREE.MeshPhongMaterial({ color: 0x808080, side: THREE.DoubleSide });

    const roadColorMap = textureLoader.load('textures/road/road_color.jpg',
        (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(10, 10);
            trackMaterial.map = texture;
            trackMaterial.needsUpdate = true;
        },
        undefined,
        (err) => console.error('Lỗi tải texture đường:', err)
    );

    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.01;
    track.receiveShadow = true;
    scene.add(track);

    // 5. Dashed line on track
    const dashRadius = (outerRadius + innerRadius) / 2;
    const dashPoints = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        dashPoints.push(new THREE.Vector3(dashRadius * Math.cos(angle), 0.02, dashRadius * Math.sin(angle)));
    }
    const dashGeometry = new THREE.BufferGeometry().setFromPoints(dashPoints);
    const dashMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.7, gapSize: 0.7 });
    const dashedLine = new THREE.Line(dashGeometry, dashMaterial);
    dashedLine.computeLineDistances();
    scene.add(dashedLine);

    // 6. Orange outer and inner borders
    function createCircleLine(radius, color) {
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(radius * Math.cos(angle), 0.02, radius * Math.sin(angle)));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color });
        return new THREE.Line(geometry, material);
    }
    scene.add(createCircleLine(outerRadius, 0xffa500));
    scene.add(createCircleLine(innerRadius, 0xffa500));

    // 7. Circular fountain (using a single color texture)
    const fountainRadius = 10; 
    const fountainHeight = 0.5; 
    const fountainGeometry = new THREE.CylinderGeometry(fountainRadius, fountainRadius, fountainHeight, 64);
    const fountainMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });

    const fountainColorMap = textureLoader.load('textures/fountain/stone_color.jpg',
        (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4); 
            fountainMaterial.map = texture;
            fountainMaterial.needsUpdate = true;
        },
        undefined,
        (err) => console.error('Lỗi tải texture đài phun nước:', err)
    );

    const fountain = new THREE.Mesh(fountainGeometry, fountainMaterial);
    fountain.position.y = fountainHeight / 2 + 0.01;
    fountain.castShadow = true;
    scene.add(fountain);

    // 8. 3D Eight-pointed star (NO TEXTURE - using solid color)
    const starShape = new THREE.Shape();
    const outerStar = 6; 
    const innerStar = 2.5; 
    const numPoints = 8; 
    for (let i = 0; i < numPoints * 2; i++) {
        const angle = (i / (numPoints * 2)) * Math.PI * 2;
        const radius = i % 2 === 0 ? outerStar : innerStar;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) starShape.moveTo(x, y);
        else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const starGeometry = new THREE.ExtrudeGeometry(starShape, {
        depth: 0.3, 
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3
    });
    const starMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00, shininess: 100 }); 
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.rotation.x = -Math.PI / 2;
    star.position.y = fountainHeight + 0.05; 
    star.castShadow = true; 
    scene.add(star);

    // 8.3. Fountain inner shadow circle
    const fountainShadow = new THREE.Mesh(
        new THREE.CircleGeometry(fountainRadius * 0.95, 64), 
        new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.2, transparent: true })
    );
    fountainShadow.rotation.x = -Math.PI / 2;
    fountainShadow.position.y = 0.005;
    scene.add(fountainShadow);

    // 8.4. Two realistic trees (using a single color texture for trunk, leaves will use solid color)
    function createRealisticTree(x, z) {
      const treeGroup = new THREE.Group(); 

      const trunkHeight = 4; 
      const trunkRadiusBottom = 2.0; 
      const trunkRadiusTop = 0.5; 
      const trunkGeometry = new THREE.CylinderGeometry(trunkRadiusTop, trunkRadiusBottom, trunkHeight, 24); 
      const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); 

      const woodColorMap = textureLoader.load('textures/wood/wood_color.jpg',
        (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(2, 2); 
            trunkMaterial.map = texture;
            trunkMaterial.needsUpdate = true;
        },
        undefined,
        (err) => console.error('Lỗi tải texture thân cây:', err)
      );

      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = trunkHeight / 2; 
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      treeGroup.add(trunk);

      const numCanopySpheres = 8; 
      const baseLeavesRadius = 2.8; 
      const canopySpread = 3.5; 
      const canopyBaseY = trunkHeight * 0.8; 

      for (let j = 0; j < numCanopySpheres; j++) {
          const sphereRadius = baseLeavesRadius * (0.6 + Math.random() * 0.4); 
          const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32); 
          const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x228B45 }); 

          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          const offsetX = (Math.random() - 0.5) * canopySpread * 1.5; 
          const offsetZ = (Math.random() - 0.5) * canopySpread * 1.5; 
          const offsetY = (Math.random() - 0.5) * (baseLeavesRadius * 1.0) + baseLeavesRadius * 0.5; 

          sphere.position.set(offsetX, canopyBaseY + offsetY, offsetZ);
          sphere.castShadow = true;
          sphere.receiveShadow = true;
          treeGroup.add(sphere);
      }

      treeGroup.position.set(x, 0, z); 
      scene.add(treeGroup);
    }

    const treeRadiusOffset = 20; 
    createRealisticTree(treeRadiusOffset, 0);
    createRealisticTree(-treeRadiusOffset, 0);

    // 9. Camera and Controls
    camera.position.set(20, 25, 25);
    camera.lookAt(0, 0, 0);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 11. Resize
    window.addEventListener('resize', updateThreeJsContainerSize);

    // 12. Vietnam Flag (Plane + Shape + animation)
    const flagWidth = 5;
    const flagHeight = 3;
    const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const flagGeometry = new THREE.PlaneGeometry(flagWidth, flagHeight, 20, 10);
    const flag = new THREE.Mesh(flagGeometry, redMaterial);
    flag.castShadow = true;
    flag.receiveShadow = false;

    const starShapeFlag = new THREE.Shape();
    const outerR = 0.4;
    const innerR = 0.17;
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const r = (i % 2 === 0) ? outerR : innerR;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) starShapeFlag.moveTo(x, y);
        else starShapeFlag.lineTo(x, y);
    }
    starShapeFlag.closePath();
    const starGeometryFlag = new THREE.ShapeGeometry(starShapeFlag);
    const starMaterialFlag = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    const starMeshFlag = new THREE.Mesh(starGeometryFlag, starMaterialFlag);
    starMeshFlag.position.set(0, 0.1, 0.01);
    flag.add(starMeshFlag);

    const poleHeight = 18;
    const poleRadius = 0.15;
    const poleGeometry = new THREE.CylinderGeometry(poleRadius, poleRadius, poleHeight, 16);
    const poleMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.castShadow = true;

    // Flag Podium (using a single color texture)
    const flagPodiumHeight = 0.8;
    const flagPodiumRadiusTop = 1.5;
    const flagPodiumRadiusBottom = 2;
    const flagPodiumGeometry = new THREE.CylinderGeometry(flagPodiumRadiusTop, flagPodiumRadiusBottom, flagPodiumHeight, 32);
    const flagPodiumMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });

    const podiumColorMap = textureLoader.load('textures/podium/podium_color.jpg',
        (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(2, 2); 
            flagPodiumMaterial.map = texture;
            flagPodiumMaterial.needsUpdate = true;
        },
        undefined,
        (err) => console.error('Lỗi tải texture bục cột cờ:', err)
    );

    const flagPodium = new THREE.Mesh(flagPodiumGeometry, flagPodiumMaterial);
    flagPodium.castShadow = true;
    flagPodium.receiveShadow = true;
    flagPodium.position.y = flagPodiumHeight / 2;
    scene.add(flagPodium);

    // Position flagpole and podium next to the central fountain
    const distanceFromCenter = fountainRadius + flagPodiumRadiusBottom * 1.5;
    const flagPodiumX = distanceFromCenter;
    const flagPodiumZ = 0;

    flagPodium.position.set(flagPodiumX, flagPodiumHeight / 2, flagPodiumZ);
    pole.position.set(0, poleHeight / 2 + flagPodiumHeight / 2, 0);
    flagPodium.add(pole);
    flag.position.set(
        poleRadius + flagWidth / 2,
        poleHeight / 2 - flagHeight / 2,
        0
    );
    pole.add(flag);
    flagPodium.rotation.y = -Math.PI / 2;

    // Flag waving animation
    const flagVertices = flag.geometry.attributes.position;
    const flagInitialPositions = new Float32Array(flagVertices.array);

    function animateFlag(time) {
        const waveSpeed = 0.002;
        const waveHeight = 0.2;
        const windEffect = 0.05;

        for (let i = 0; i < flagVertices.count; i++) {
            const x = flagInitialPositions[i * 3];
            const y = flagInitialPositions[i * 3 + 1];

            const zWave = Math.sin(x * 3 + time * waveSpeed) * waveHeight;
            flagVertices.setZ(i, zWave);

            const xBend = x + Math.sin(y * Math.PI / flagHeight) * windEffect;
            flagVertices.setX(i, xBend);
        }
        flagVertices.needsUpdate = true;
        flag.geometry.computeVertexNormals();

        const starWaveZ = Math.sin(0 * 3 + time * waveSpeed) * waveHeight;
        starMeshFlag.position.z = 0.01 + starWaveZ;
        const starXBend = Math.sin(0 * Math.PI / flagHeight) * windEffect;
        starMeshFlag.position.x = starXBend;
    }

    // Main render loop
    function renderLoop(time) {
        requestAnimationFrame(renderLoop);
        controls.update();
        animateFlag(time);
        renderer.render(scene, camera);
    }

    // Start the render loop immediately when the module is loaded
    renderLoop(performance.now());
}

// Gọi hàm init() ngay lập tức để khởi chạy cảnh khi module được tải
init();