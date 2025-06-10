// AUTHOR: Trần Trung Kiên - ID: 20233859
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function init(container) {
  const scene = new THREE.Scene();
  const house = House(scene); // truyền scene vào House()
  scene.add(house);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(100, -300, 400);
  scene.add(dirLight);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 100, 300);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true }); // giảm răng cưa
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  function animate(time) {
    requestAnimationFrame(animate);
    if (house.update) house.update(time * 0.001); // update mặt trời nếu có
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

export function House(scene) {
  const house = new THREE.Group();

  // 🌞 Tạo mặt trời
  function Sun(scene, sunRadius, orbitRadius, speed) {
    const group = new THREE.Group();

    const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({ color: 0xffdd33 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.castShadow = false;
    group.add(sunMesh);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.1);
    sunLight.castShadow = true;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.target.position.set(0, 0, 0);
    group.add(sunLight);
    scene.add(sunLight.target);

    return {
      group,
      update: (t) => {
        const ang = t * speed;
        const x = orbitRadius * Math.cos(ang);
        const y = orbitRadius * Math.sin(ang);
        sunMesh.position.set(x, y, 0);
        sunLight.position.copy(sunMesh.position);
        const norm = THREE.MathUtils.clamp((y / orbitRadius + 1) / 2, 0, 1);
        sunLight.intensity = 0.2 + 0.8 * norm;
      }
    };
  }

  const sun = Sun(scene, 5, 50, 0.1);
  scene.add(sun.group);

  // 🌳 Cây thường
  function createBranch(length, radius, depth) {
    const group = new THREE.Group();
    const geoBranch = new THREE.CylinderGeometry(radius * 0.7, radius, length, 7);
    const matBranch = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });
    const meshBranch = new THREE.Mesh(geoBranch, matBranch);
    meshBranch.position.y = length / 2;
    meshBranch.castShadow = true;
    group.add(meshBranch);

    if (depth === 0) {
      const leafGeo = new THREE.SphereGeometry(radius * 14, 16, 16);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.8 });
      const leaves = new THREE.Mesh(leafGeo, leafMat);
      leaves.scale.set(1, 0.7, 1);
      leaves.position.y = length;
      leaves.castShadow = true;
      group.add(leaves);
    } else {
      for (let i = 0; i < 5; i++) {
        const child = createBranch(
          length * (0.6 + Math.random() * 0.1),
          radius * 0.6,
          depth - 1
        );
        child.rotation.z = (Math.random() * 0.4 + 0.5) * (i % 2 ? 1.1 : -1.1);
        child.rotation.x = (Math.random() * 0.4 - 0.2) * i;
        child.rotation.y = (Math.random() * 0.2 + 0.2) * i;
        child.position.y = length;
        group.add(child);
      }
    }
    return group;
  }

  const tree = createBranch(16, 0.9, 1);
  tree.position.y = -2;
  tree.scale.set(0.5, 0.5, 0.5);
  tree.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  scene.add(tree);

  // 🌸 Cây hoa anh đào
  function createFlower(petalRadius = 0.45, petalLength = 0.8) {
    const flower = new THREE.Group();
    const petalGeo = new THREE.SphereGeometry(petalRadius, 8, 8);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xffc0cb, roughness: 0.9 });

    for (let i = 0; i < 5; i++) {
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.scale.set(1, 0.3, 2);
      petal.rotation.y = i * (2 * Math.PI / 5);
      petal.position.set(0, petalLength, petalLength);
      flower.add(petal);
    }

    const centerGeo = new THREE.SphereGeometry(petalRadius * 0.6, 8, 8);
    const centerMat = new THREE.MeshStandardMaterial({ color: 0xffff99, roughness: 0.9 });
    const center = new THREE.Mesh(centerGeo, centerMat);
    center.position.set(0, petalLength, petalLength);
    flower.add(center);

    return flower;
  }

  function createCherryTree(length, radius, depth, flowerPerBranch) {
    const group = new THREE.Group();

    function createBranch(length, radius, depth, isRoot) {
      const branch = new THREE.Group();

      const branchGeo = new THREE.CylinderGeometry(radius * 0.5, radius, length, 8);
      const branchMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });
      const meshBranch = new THREE.Mesh(branchGeo, branchMat);
      meshBranch.position.y = length / 2;
      meshBranch.castShadow = true;
      branch.add(meshBranch);

      if (!isRoot) {
        for (let i = 0; i < flowerPerBranch; i++) {
          const t = Math.random();
          const theta = Math.random() * 2 * Math.PI;
          const x = Math.cos(theta) * radius * 1.5;
          const z = Math.sin(theta) * radius * 1.5;
          const y = length * t;
          const flower = createFlower(radius * 2, radius);
          flower.position.set(x, y, z);
          flower.rotation.y = theta;
          flower.traverse(node => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
          branch.add(flower);
        }
      }

      if (depth > 0) {
        const childCount = 4 + Math.random();
        for (let i = 0; i < childCount; i++) {
          const child = createBranch(
            length * (0.6 + Math.random() * 0.1),
            radius * 0.6,
            depth - 1,
            false
          );
          const angle = (i / childCount) * Math.PI * 2;
          child.rotation.z = (Math.random() * 0.8 + 0.2) * (i % 2 ? 1 : -1);
          child.rotation.x = Math.random() * 0.8;
          child.rotation.y = angle;
          child.position.y = length;
          branch.add(child);
        }
      }

      return branch;
    }

    const trunk = createBranch(length, radius, depth, true);
    trunk.position.y = -2;
    group.add(trunk);
    return group;
  }

  const cherry = createCherryTree(10, 0.5, 3, 2);
  cherry.position.set(10, -1, 5);
  cherry.scale.set(0.5, 0.5, 0.5);
  scene.add(cherry);

  house.update = sun.update; // để gọi update() trong animate()

  return house;
}
