//DƯƠNG VĂN KIÊN - 20233857 - Background

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function init() {
  const scene = new THREE.Scene();

  scene.background = new THREE.CubeTextureLoader().load([
    'pages/xpos.png',
    'pages/xneg.png',
    'pages/ypos.png',
    'pages/yneg.png',
    'pages/zpos.png',
    'pages/zneg.png'
  ]);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;

  camera.position.z = 50;

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

init();
