// AUTHOR: Trần Trung Kiên - ID: 20233859
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
  scene.background = new THREE.Color(0xfce4ec); // Màu nền hồng nhạt

  // 💡 Ánh sáng
  const ambient = new THREE.HemisphereLight(0xffffff, 0xbfd4d2, 1.5);
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(1, 1, 1).normalize().multiplyScalar(100); // Góc xiên 45 độ
  directionalLight.castShadow = true;

  directionalLight.shadow.mapSize.setScalar(2048);
  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.normalBias = 0.0001;

  const shadowCameraSize = 100;
  directionalLight.shadow.camera.left = -shadowCameraSize;
  directionalLight.shadow.camera.right = shadowCameraSize;
  directionalLight.shadow.camera.top = shadowCameraSize;
  directionalLight.shadow.camera.bottom = -shadowCameraSize;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 500;

  scene.add(directionalLight);

  // Helpers (bật nếu cần debug)
  const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 10, 0xffff00);
  scene.add(lightHelper);
  // const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  // scene.add(shadowCameraHelper);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // 🌱 Mặt đất
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshLambertMaterial({
      color: 0x87ceeb,
      side: THREE.DoubleSide,
    })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  scene.add(plane);

  // 🏠 Ngôi nhà
  const house = House();
  scene.add(house);

  const cac = createRepeatedArrowShapes()
  scene.add(cac)

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

export function House() {
  const house = new THREE.Group();

  // Thân chính
  const main = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  main.position.y = 5;
  main.castShadow = true;
  main.receiveShadow = true;
  house.add(main);

  // Khối nhỏ phía trên (main1)
  const main1 = new THREE.Mesh(
    new THREE.BoxGeometry(4, 4, 4),
    new THREE.MeshLambertMaterial({ color: 0xff9999 })
  );
  main1.position.y = 12;
  main1.castShadow = true;
  main1.receiveShadow = true;
  house.add(main1);

  return house;
}


function createArrowShapeMesh(color = 0x79888a) {
  // Vẽ hình dấu ">" trên mặt phẳng XY
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(1.5, 1.5);
  shape.lineTo(0, 3);
  shape.lineTo(0.5, 3);
  shape.lineTo(2, 1.5);
  shape.lineTo(0.5, 0);
  shape.lineTo(0, 0);

  // Extrude để tạo khối 3D từ shape 2D
  const extrudeSettings = {
    depth: 0.05,          // sẽ đùn theo trục Z
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);

  // Quay để mũi tên nhọn theo trục Z
  mesh.rotation.y = Math.PI / 2;

  return mesh;
}

function createRepeatedArrowShapes(count = 10, spacing = 3) {
  const group = new THREE.Group();

  for (let i = 0; i < count; i++) {
    const arrow = createArrowShapeMesh();
    arrow.position.x = i * spacing;
    group.add(arrow);
  }

  return group;
}

