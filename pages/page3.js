// dương văn kiên

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function init() {
  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0d0f0);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  container.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(20, 30, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  Object.assign(dirLight.shadow.camera, {
    left: -35,
    right: 35,
    top: 35,
    bottom: -35,
    near: 0.1,
    far: 80,
  });
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  // Texture Loader
  const loader = new THREE.TextureLoader();

  // Ground
  const groundMaterial = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 });
  loader.load('textures/grass/grass_color.jpg', tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(50, 50);
    groundMaterial.map = tex;
    groundMaterial.needsUpdate = true;
  });
  loader.load('textures/grass/grass_normal.jpg', tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(50, 50);
    groundMaterial.normalMap = tex;
    groundMaterial.needsUpdate = true;
  });

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Ring Track
  const trackMaterial = new THREE.MeshPhongMaterial({ color: 0x808080, side: THREE.DoubleSide });
  loader.load('textures/road/road_color.jpg', tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    trackMaterial.map = tex;
    trackMaterial.needsUpdate = true;
  });

  const track = new THREE.Mesh(new THREE.RingGeometry(25, 30, 128), trackMaterial);
  track.rotation.x = -Math.PI / 2;
  track.position.y = 0.01;
  track.receiveShadow = true;
  scene.add(track);

  // Dashed Line
  const dashPoints = Array.from({ length: 129 }, (_, i) => {
    const angle = (i / 128) * Math.PI * 2;
    return new THREE.Vector3(27.5 * Math.cos(angle), 0.02, 27.5 * Math.sin(angle));
  });
  const dashGeom = new THREE.BufferGeometry().setFromPoints(dashPoints);
  const dashMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.7, gapSize: 0.7 });
  const dashedLine = new THREE.Line(dashGeom, dashMat);
  dashedLine.computeLineDistances();
  scene.add(dashedLine);

  // Track Borders
  [25, 30].forEach(r => {
    const pts = Array.from({ length: 129 }, (_, i) => {
      const angle = (i / 128) * Math.PI * 2;
      return new THREE.Vector3(r * Math.cos(angle), 0.02, r * Math.sin(angle));
    });
    const border = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffa500 }));
    scene.add(border);
  });

  // Fountain
  const fountainMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
  loader.load('textures/fountain/stone_color.jpg', tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    fountainMaterial.map = tex;
    fountainMaterial.needsUpdate = true;
  });
  const fountain = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 0.5, 64), fountainMaterial);
  fountain.position.y = 0.26;
  fountain.castShadow = true;
  scene.add(fountain);

  // Star
  const starShape = new THREE.Shape();
  [...Array(16)].forEach((_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const r = i % 2 === 0 ? 6 : 2.5;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    i === 0 ? starShape.moveTo(x, y) : starShape.lineTo(x, y);
  });
  const star = new THREE.Mesh(
    new THREE.ExtrudeGeometry(starShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 }),
    new THREE.MeshPhongMaterial({ color: 0xffff00, shininess: 100 })
  );
  star.rotation.x = -Math.PI / 2;
  star.position.y = 0.8;
  star.castShadow = true;
  scene.add(star);

  scene.add(new THREE.Mesh(new THREE.CircleGeometry(9.5, 64), new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.2, transparent: true })));

  // Trees
  function createTree(x, z) {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    loader.load('textures/wood/wood_color.jpg', tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      trunkMat.map = tex;
      trunkMat.needsUpdate = true;
    });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 2, 4, 24), trunkMat);
    trunk.position.y = 2;
    trunk.castShadow = true;
    group.add(trunk);
    for (let i = 0; i < 8; i++) {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(2.8 * (0.6 + Math.random() * 0.4), 32, 32), new THREE.MeshPhongMaterial({ color: 0x228B45 }));
      sphere.position.set((Math.random() - 0.5) * 5.25, 3.2 + (Math.random() - 0.5) * 2.8, (Math.random() - 0.5) * 5.25);
      sphere.castShadow = true;
      group.add(sphere);
    }
    group.position.set(x, 0, z);
    scene.add(group);
  }

  createTree(20, 0);
  createTree(-20, 0);

  // Controls
  camera.position.set(20, 25, 25);
  camera.lookAt(0, 0, 0);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  window.addEventListener('resize', updateSize);

  // Flag and animation
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(5, 3, 20, 10), new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide }));
  const flagInit = new Float32Array(flag.geometry.attributes.position.array);
  const starShapeFlag = new THREE.Shape();
  [...Array(10)].forEach((_, i) => {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? 0.4 : 0.17;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    i === 0 ? starShapeFlag.moveTo(x, y) : starShapeFlag.lineTo(x, y);
  });
  const starMesh = new THREE.Mesh(new THREE.ShapeGeometry(starShapeFlag), new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }));
  starMesh.position.set(0, 0.1, 0.01);
  flag.add(starMesh);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 18, 16), new THREE.MeshPhongMaterial({ color: 0xaaaaaa }));
  pole.position.y = 9.4;
  pole.castShadow = true;

  const podiumMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });
  loader.load('textures/podium/podium_color.jpg', tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    podiumMaterial.map = tex;
    podiumMaterial.needsUpdate = true;
  });
  const podium = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 0.8, 32), podiumMaterial);
  podium.castShadow = true;
  podium.receiveShadow = true;
  podium.position.set(13, 0.4, 0);
  podium.add(pole);
  pole.add(flag);
  flag.position.set(2.65, 8.5, 0);
  scene.add(podium);

  function animateFlag(time) {
    const pos = flag.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = flagInit[i * 3];
      const y = flagInit[i * 3 + 1];
      pos.setZ(i, Math.sin(x * 3 + time * 0.002) * 0.2);
      pos.setX(i, x + Math.sin(y * Math.PI / 3) * 0.05);
    }
    pos.needsUpdate = true;
    flag.geometry.computeVertexNormals();
    starMesh.position.z = 0.01 + Math.sin(time * 0.002) * 0.2;
    starMesh.position.x = Math.sin(0 * Math.PI / 3) * 0.05;
  }

  (function loop(t) {
    requestAnimationFrame(loop);
    controls.update();
    animateFlag(t);
    renderer.render(scene, camera);
  })(performance.now());
}

init();