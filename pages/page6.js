// AUTHOR: Trần Trung Kiên - ID: 20233859
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {House} from './page1.js'
import {Gate} from './page2.js'
import {Wall} from './page2.js'

export function init(container) {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );

  camera.position.set(200, 200, 300);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaae7fa); // Màu nền hồng nhạt

  // 💡 Ánh sáng
  const ambient = new THREE.HemisphereLight(0xffffff, 0xbfd4d2, 1.5);
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(1, 1, 1).normalize().multiplyScalar(100); // Góc xiên 45 độ, đèn ở xa
  directionalLight.castShadow = true;

  // ✨ Điều chỉnh target của đèn để bao phủ tất cả vật thể đổ bóng
  directionalLight.target.position.set(0, 45, -20); // Đặt target cao hơn và lùi về để bao phủ các cột và nền tảng
  scene.add(directionalLight.target); // Rất quan trọng: Thêm target vào scene để nó có hiệu lực

  directionalLight.shadow.mapSize.setScalar(2048); // Độ phân giải bóng cao
  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.normalBias = 0.0001;

  // ✨ Tăng kích thước vùng chiếu bóng để bao phủ toàn bộ cảnh
  const shadowCameraSize = 200; // Tăng kích thước lên 200 đơn vị
  directionalLight.shadow.camera.left = -shadowCameraSize;
  directionalLight.shadow.camera.right = shadowCameraSize;
  directionalLight.shadow.camera.top = shadowCameraSize;
  directionalLight.shadow.camera.bottom = -shadowCameraSize;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.updateProjectionMatrix(); // Cập nhật camera sau khi thay đổi thông số

  scene.add(directionalLight);

  //---HUY----
  // --- Texture Loading ---
    const textureLoader = new THREE.TextureLoader();

    const loadTexture = (path, name, wrapS = THREE.RepeatWrapping, wrapT = THREE.RepeatWrapping, repeatX = 1, repeatY = 1) => {
        const texture = textureLoader.load(
            path,
            () => { /* console.log(`${name} texture loaded.`); */ },
            undefined,
            (err) => { console.warn(`Failed to load ${path}. Using fallback color.`, err); }
        );
        texture.wrapS = wrapS;
        texture.wrapT = wrapT;
        texture.repeat.set(repeatX, repeatY);
        return texture;
    };

    const concreteTexture = loadTexture('textures/concrete.jpg', 'Concrete', THREE.RepeatWrapping, THREE.RepeatWrapping, 2, 2);
    const metalTexture = loadTexture('textures/metal.jpg', 'Metal', THREE.RepeatWrapping, THREE.RepeatWrapping, 1, 1);
    const wallConcreteTexture = loadTexture('textures/concrete.jpg', 'Wall Concrete', THREE.RepeatWrapping, THREE.RepeatWrapping, 5, 1);
    const wallMetalTexture = loadTexture('textures/metal.jpg', 'Wall Metal', THREE.RepeatWrapping, THREE.RepeatWrapping, 1, 4);

    // --- Materials ---
    const materials = {
        mainColumn: new THREE.MeshStandardMaterial({ map: concreteTexture }),
        pillarMetal: new THREE.MeshStandardMaterial({ map: metalTexture }),
        newPillarMetal: new THREE.MeshStandardMaterial({ map: metalTexture }),
        bar: new THREE.MeshStandardMaterial({ map: metalTexture }),
        darkMetal: new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.3 }),
        lightMetal: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 }),
        mediumMetal: new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.7, roughness: 0.3 }),
        pillarLamp: new THREE.MeshStandardMaterial({ map: metalTexture }),
        decoration: new THREE.MeshStandardMaterial({ map: metalTexture }),
        wallMaterial: new THREE.MeshStandardMaterial({ map: wallConcreteTexture }),
        pillarThinBarMaterial: new THREE.MeshStandardMaterial({ map: wallMetalTexture })
    };

    //---HUY----------------------

  // const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 10, 0xffff00);
  // scene.add(lightHelper);



  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Giúp bóng mượt mà hơn
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // 🌱 Mặt đất
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 3000),
    new THREE.MeshLambertMaterial({
      color: 0xf5ece4, // Màu xanh da trời
      side: THREE.DoubleSide,
    })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  scene.add(plane);

  // 🏠 Ngôi nhà và các thành phần
  const house = House();
  scene.add(house);

  const gate = Gate(materials)
  gate.scale.setScalar(3)
  gate.position.z = 600
  scene.add(gate)

  const wall = Wall(materials, 30)
  wall.position.x = 268
  wall.position.z = 600
  wall.scale.setScalar(3)
  scene.add(wall)

  const wall1 = Wall(materials, 30)
  wall1.position.x = -268
  wall1.position.z = 600
  wall1.scale.setScalar(3)
  scene.add(wall1)
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
