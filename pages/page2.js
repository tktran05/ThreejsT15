//TRẦN TRUNG KIÊN - 20233859 - Galaxy

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function init(container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    // Sử dụng renderer.domElement cho OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Bật chế độ giảm chấn cho mượt mà

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Cube geometry and material với độ trong suốt
    const color = new THREE.Color("#FDB813");
    const geometry = new THREE.IcosahedronGeometry(1, 15);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true, // Bật tính năng trong suốt
        opacity: 0.5 // Đặt độ trong suốt (0 là hoàn toàn trong suốt, 1 là không trong suốt)
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);

        // Cập nhật các điều khiển và render cảnh
        controls.update(); // Dùng để cập nhật các điều khiển mượt mà hơn
        renderer.render(scene, camera);
    }

    animate();
}
