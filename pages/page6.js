// AUTHOR: Trần Trung Kiên - ID: 20233859

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { House } from './page1.js';
import { Gate, Wall } from './page2.js';
import { Ground, Flag, Road } from './page3.js';
import { Tree1, Tree2, createFountain } from './page4.js';
import { Tank } from './page5.js'

export function init(container) {
  // 🧭 Thiết lập Camera
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(0, 60, 480);
  camera.lookAt(0, 0, 0);

  // 🏞️ Tạo Scene
  const scene = new THREE.Scene();

  // Music
  const listener = new THREE.AudioListener();
  camera.add(listener);

  // Gọi hàm để phát nhạc
  const backgroundMusic = playMusic(listener, '/sounds/kien.mp3');

  // 🌌 Skybox
  const loader = new THREE.CubeTextureLoader();
  scene.background = loader.load([
    'textures/skybox/px.png',
    'textures/skybox/nx.png',
    'textures/skybox/py.png',
    'textures/skybox/ny.png',
    'textures/skybox/pz.png',
    'textures/skybox/nz.png',
  ]);

  // 💡 Ánh sáng
  const ambient = new THREE.HemisphereLight(0xffffff, 0xbfd4d2, 1.5);
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(500, 600, 500).normalize().multiplyScalar(100);
  directionalLight.castShadow = true;
  directionalLight.target.position.set(0, 10, -40);
  scene.add(directionalLight.target);
  directionalLight.shadow.mapSize.setScalar(2048);
  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.normalBias = 0.0001;

  const shadowSize = 600;
  directionalLight.shadow.camera.left = -shadowSize*2;
  directionalLight.shadow.camera.right = shadowSize*2;
  directionalLight.shadow.camera.top = shadowSize*2;
  directionalLight.shadow.camera.bottom = -shadowSize*2;
  directionalLight.shadow.camera.near = -300;
  directionalLight.shadow.camera.far = 1000;
  directionalLight.shadow.camera.updateProjectionMatrix();
  scene.add(directionalLight);

  // const lightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  // scene.add(lightHelper);

  // 🎨 Tải Textures và tạo Materials
  const textureLoader = new THREE.TextureLoader();

  const loadTexture = (path, name, wrapS = THREE.RepeatWrapping, wrapT = THREE.RepeatWrapping, repeatX = 1, repeatY = 1) => {
    const texture = textureLoader.load(
      path,
      () => {},
      undefined,
      (err) => console.warn(`Lỗi tải ${name}:`, err)
    );
    texture.wrapS = wrapS;
    texture.wrapT = wrapT;
    texture.repeat.set(repeatX, repeatY);
    return texture;
  };

  const woodTexture = loadTexture('/textures/wood.png', 'Wood');
  const leafTexture = loadTexture('/textures/leaf.png', 'Leaf');
  const fTextures = loadTexture('/textures/rock.jpg', 'Fountain');
  const concreteTexture = loadTexture('textures/concrete.jpg', 'Concrete', THREE.RepeatWrapping, THREE.RepeatWrapping, 2, 2);
  const metalTexture = loadTexture('textures/metal.jpg', 'Metal');
  const wallConcreteTexture = loadTexture('textures/concrete.jpg', 'Wall Concrete', THREE.RepeatWrapping, THREE.RepeatWrapping, 5, 1);
  const wallMetalTexture = loadTexture('textures/metal.jpg', 'Wall Metal', THREE.RepeatWrapping, THREE.RepeatWrapping, 1, 4);

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
    pillarThinBarMaterial: new THREE.MeshStandardMaterial({ map: wallMetalTexture }),
  };

  // 🖼️ Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 🕹️ OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // ⚙️ AxesHelper
  // const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);

  // 🌱 Mặt đất
  const circle = new THREE.Mesh(
    new THREE.CircleGeometry(800, 64),
    new THREE.MeshLambertMaterial({ color: 0xd3f5db, side: THREE.DoubleSide })
  );
  circle.rotation.x = -Math.PI / 2;
  circle.receiveShadow = true;
  scene.add(circle);

  // 🏠 Thêm các đối tượng chính
  const house = House();
  house.position.z = -300;
  scene.add(house);

  const { fountain } = createFountain({ baseRadius: 3, jetCount: 8, fTextures });
  fountain.scale.setScalar(4);
  scene.add(fountain);

  const gate = Gate(materials);
  gate.scale.setScalar(3);
  gate.position.z = 300;
  scene.add(gate);

  const wall = Wall(materials, 30);
  wall.position.set(268, 0, 300);
  wall.scale.setScalar(3);
  scene.add(wall);

  const wall1 = Wall(materials, 30);
  wall1.position.set(-268, 0, 300);
  wall1.scale.setScalar(3);
  scene.add(wall1);

  // 🌲 Cây thông hai bên nhà
  const pinePositions = [24, 52, 80, -24, -52, -80];
  pinePositions.forEach((x, i) => {
    const tree = Tree2();
    tree.position.set(x, 0, -310);
    tree.scale.setScalar(0.8 + (i % 3) * 0.1);
    scene.add(tree);
  });

  // 🚩 Cờ
  const flag = Flag();
  flag.scale.setScalar(0.7);
  flag.position.set(11, 113, -335);
  scene.add(flag);

  // 🛣️ Đường
  const road = Road(600, 80);
  road.position.y = 1
  road.position.z = 400;
  road.rotation.y = Math.PI / 2;
  scene.add(road);

  // 🌳 Rừng cây
  for (let i = 0; i < 50; i++) {
    const x = 250 + Math.random() * 300;
    const z = -580 + Math.random() * 840;
    [x, -x].forEach(px => {
      const tree = Tree1(16, 1.2, 1, woodTexture, leafTexture);
      tree.position.set(px, 0, z);
      tree.scale.setScalar(1 + Math.random() * 0.5);
      scene.add(tree);
    });
  }

  // Nền đất
  const ground = Ground();
  scene.add(ground);

  //Tank

  const tank1 = Tank()
  tank1.position.z = 350
  tank1.scale.setScalar(0.5)
  tank1.rotation.z = Math.PI/2
  scene.add(tank1)

  const tank2 = Tank()
  tank2.position.x = 23
  tank2.position.z = 395
  tank2.scale.setScalar(0.5)
  tank2.rotation.z = Math.PI/2
  scene.add(tank2)

  const tank3 = Tank()
  tank3.position.x = -23
  tank3.position.z = 395
  tank3.scale.setScalar(0.5)
  tank3.rotation.z = Math.PI/2
  scene.add(tank3)

  //tank animation 

//tank 1
const tank1StartZ = 350;
const tank1EndZ = 210;
const tank1FadeDistance = 25;
const tank1Speed = 3;

tank1.traverse((child) => {
  if (child.isMesh && child.material) {
    child.material.transparent = true;
    child.material.depthWrite = false; // Giúp blending mượt mà hơn khi mờ
  }
});


//tank 2+3
let tankStartZ = 395;
let tankEndZ = 260
let fadeDistance = 25;
let tankSpeed = 2;

tank2.traverse((child) => {
  if (child.isMesh && child.material) {
    child.material.transparent = true;
    child.material.depthWrite = false; // Giúp blending mượt mà hơn khi mờ
  }
});

tank3.traverse((child) => {
  if (child.isMesh && child.material) {
    child.material.transparent = true;
    child.material.depthWrite = false; // Giúp blending mượt mà hơn khi mờ
  }
});

function animate() {
  requestAnimationFrame(animate);

  if (tank2) {
    tank2.position.z -= tankSpeed; // đi từ xa về gần

    const distanceToEnd = tank2.position.z - tankEndZ;

    tank2.traverse((child) => {
      if (child.isMesh) {
        if (distanceToEnd < fadeDistance) {
          const fadeProgress = Math.max(0, distanceToEnd / fadeDistance);
          child.material.opacity = fadeProgress;
        } else {
          child.material.opacity = 1;
        }
      }
    });

    if (tank2.position.z < tankEndZ) {
      tank2.position.z = tankStartZ;
    }
  }

    if (tank3) {
    tank3.position.z -= tankSpeed; // đi từ xa về gần

    const distanceToEnd = tank3.position.z - tankEndZ;

    tank3.traverse((child) => {
      if (child.isMesh) {
        if (distanceToEnd < fadeDistance) {
          const fadeProgress = Math.max(0, distanceToEnd / fadeDistance);
          child.material.opacity = fadeProgress;
        } else {
          child.material.opacity = 1;
        }
      }
    });

    if (tank3.position.z < tankEndZ) {
      tank3.position.z = tankStartZ;
    }
  }

    if(tank1){
        tank1.position.z -= tank1Speed;

        const tank1DistanceToEnd = tank1.position.z - tank1EndZ;

        tank1.traverse((child) => {
          if (child.isMesh) {
            if (tank1DistanceToEnd < tank1FadeDistance) {
              const tank1FadeProgress = Math.max(0, tank1DistanceToEnd / tank1FadeDistance);
              child.material.opacity = tank1FadeProgress;
            } else {
              child.material.opacity = 1;
            }
          }
        });

        if (tank1.position.z < tank1EndZ) {
          tank1.position.z = tank1StartZ;
        }
          }

  controls.update();
  renderer.render(scene, camera);
}



  animate();
}


export function playMusic(audioListener, url, loop = true, volume = 1.5) {
  const audioLoader = new THREE.AudioLoader();
  const sound = new THREE.Audio(audioListener);

  audioLoader.load(url, (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(loop);
    sound.setVolume(volume);
    sound.play();
  });

  return sound;
}