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
  directionalLight.position.set(1, 1, 1).normalize().multiplyScalar(100);
  directionalLight.castShadow = true;
  directionalLight.target.position.set(0, 45, -20);
  scene.add(directionalLight.target);

  directionalLight.shadow.mapSize.setScalar(2048);
  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.normalBias = 0.0001;

  const shadowCameraSize = 200;
  directionalLight.shadow.camera.left = -shadowCameraSize;
  directionalLight.shadow.camera.right = shadowCameraSize;
  directionalLight.shadow.camera.top = shadowCameraSize;
  directionalLight.shadow.camera.bottom = -shadowCameraSize;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.updateProjectionMatrix();
  scene.add(directionalLight);

  // Helpers
  const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 10, 0xffff00);
  scene.add(lightHelper);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    precision: 'highp',
    logarithmicDepthBuffer: true // Giảm Z-fighting ở khoảng cách xa
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);


  // 🏠 Ngôi nhà và các thành phần
  const ground = Ground();
  scene.add(ground);

  const road = Road(600,130)
  road.position.z = 300
  scene.add(road)

    const flag = Flag()
    flag.scale.setScalar(0.7)
    flag.position.x = 11
    flag.position.y = 113
    flag.position.z = -35
  
    scene.add(flag)

  

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

export function Ground() {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  // === 1. Ground Material ===
  const groundMaterial = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 });

  // Load textures cho nền cỏ
  const loadTexture = (url, callback) => {
    textureLoader.load(url, (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(50, 50);
      callback(texture);
    }, undefined, (err) => console.error('Texture load error:', err));
  };

  loadTexture('textures/grass_color.jpg', (texture) => {
    groundMaterial.map = texture;
    groundMaterial.needsUpdate = true;
  });

  loadTexture('textures/grass_normal.jpg', (texture) => {
    groundMaterial.normalMap = texture;
    groundMaterial.needsUpdate = true;
  });

  // === 2. Ground Base (Cylinder) ===
  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(150, 150, 5, 64),
    groundMaterial
  );
  ground.receiveShadow = true;
  group.add(ground);

  // === 3. Ring Track (gray circle with road texture) ===
  const innerRadius = 200, outerRadius = 150, segments = 128;
  const trackMaterial = new THREE.MeshPhongMaterial({ color: 0x808080, side: THREE.DoubleSide });

  textureLoader.load('textures/road_color.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    trackMaterial.map = texture;
    trackMaterial.needsUpdate = true;
  });

  const track = new THREE.Mesh(
    new THREE.RingGeometry(innerRadius, outerRadius, segments),
    trackMaterial
  );
  track.rotation.x = -Math.PI / 2;
  track.position.y = 0.5;
  track.receiveShadow = true;
  group.add(track);

  // === 4. Dashed Line (circular line in middle of track) ===
  const dashRadius = (innerRadius + outerRadius) / 2;
  const dashPoints = Array.from({ length: segments + 1 }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2;
    return new THREE.Vector3(
      dashRadius * Math.cos(angle),
      0.02,
      dashRadius * Math.sin(angle)
    );
  });

  const dashedLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(dashPoints),
    new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 6, gapSize: 10 })
  );
  dashedLine.computeLineDistances();
  dashedLine.position.y = 0.6
  group.add(dashedLine);

  return group;
}


export function Road(length = 600, width = 80) {
  const group = new THREE.Group();

  // === 2. Tạo mặt đường
  const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x282E2D });
  const roadGeometry = new THREE.BoxGeometry(length, 0.2, width);
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.receiveShadow = true;
  group.add(road);

  // === 3. Tạo dashed line ở giữa (giống trong Ground)
  const segments = Math.floor(length / 2); // tương tự chia vòng tròn trong `Ground`
  const dashPoints = Array.from({ length: segments + 1 }, (_, i) => {
    const x = -length / 2 + (i / segments) * length;
    return new THREE.Vector3(x, 0.11, 0); // nằm ở giữa trục Z, hơi nhô lên mặt đường
  });

  const dashGeometry = new THREE.BufferGeometry().setFromPoints(dashPoints);
  const dashMaterial = new THREE.LineDashedMaterial({
    color: 0xffffff,
    dashSize: 10,
    gapSize: 15,
  });

  const dashedLine = new THREE.Line(dashGeometry, dashMaterial);
  dashedLine.computeLineDistances();
  group.add(dashedLine);

  return group;
}

export function Flag() {
  const sizeW = 30, sizeH = 20, segW = 30, segH = 20;

  const geometry = new THREE.PlaneGeometry(sizeW, sizeH, segW, segH).toNonIndexed();
  const positionAttr = geometry.attributes.position;
  const vertexCount = positionAttr.count;
  const originalPositions = new Float32Array(positionAttr.array); // sao lưu vị trí gốc

  const materialParams = {
    side: THREE.DoubleSide,
  };

  const texture = new THREE.TextureLoader().load('textures/flag.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  materialParams.map = texture;

  const material = new THREE.MeshLambertMaterial(materialParams);
  const flag = new THREE.Mesh(geometry, material);
  flag.castShadow = true;
  flag.position.set(0, sizeH / 2, 0);

  // Sóng động
  const h = 0.5, v = 1, w = 0.4, s = 0.5;

  function animateFlag() {
    const time = Date.now() * s / 50;
    for (let i = 0; i < vertexCount; i++) {
      const x = originalPositions[i * 3];
      const y = originalPositions[i * 3 + 1];

      // Không cập nhật sóng cho cột bên trái (gần -sizeW / 2)
      if (x <= -sizeW / 2 + 0.01) continue;

      const z = Math.sin(h * x + v * y - time) * w * x / 4;
      positionAttr.setZ(i, z);
    }
    positionAttr.needsUpdate = true;
    requestAnimationFrame(animateFlag);
  }

  animateFlag();
  return flag;

}