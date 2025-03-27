//DƯƠNG VĂN KIÊN - 20233857 - Line

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function init(container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Tạo các hạt cho hệ thống hạt hình nón
    const particleCount = 1000;
    const particlesGeometry = new THREE.BufferGeometry();
    
    // Tạo mảng các điểm (hạt)
    const positions = [];
    const radius = 1; // Bán kính hình nón

    // Tạo hạt cho nón đầu tiên (nón phía trên)
    for (let i = 0; i < particleCount / 2; i++) {
        const angle = Math.random() * Math.PI * 2; // Ngẫu nhiên góc quanh trục
        const height = Math.random() * 3; // Chiều cao ngẫu nhiên
        const x = radius * Math.sin(angle) * height / 3;
        const y = height;
        const z = radius * Math.cos(angle) * height / 3;
        positions.push(x, y, z);
    }

    // Tạo hạt cho nón thứ hai (nón phía dưới, với chiều ngược lại)
    for (let i = particleCount / 2; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2; // Ngẫu nhiên góc quanh trục
        const height = Math.random() * 3; // Chiều cao ngẫu nhiên
        const x = radius * Math.sin(angle) * height / 3;
        const y = -height;  // Đổi chiều y của nón thứ hai (ngược lại)
        const z = radius * Math.cos(angle) * height / 3;
        positions.push(x, y, z);
    }

    // Cập nhật vị trí của các hạt vào BufferGeometry
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    // Vật liệu cho hệ thống hạt
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffff00,
        size: 0.05,
        transparent: true,
        opacity: 0.7
    });

    // Tạo hệ thống hạt
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);

        // Cập nhật các điều khiển
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}
