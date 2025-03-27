//TRẦN TRUNG KIÊN - 20233859 - Group

import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const gui = new dat.GUI();

const canvas = document.querySelector('canvas.webgl');

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const scene = new THREE.Scene();

const parameters = {
	size: 0.01,
	count: 100000,
	branches: 8,
	radius: 5,
	spin: 1,
	randomness: 0.1,
	randomnessPower: 3,
	insideColor: 0xff6030,
	outsideColor: 0x391eb9,
};

let points;
let pointGeometry;
let pointMaterial;

function generateGalaxy() {
	const positions = new Float32Array(parameters.count * 3);
	const colors = new Float32Array(parameters.count * 3);

	const colorInside = new THREE.Color(parameters.insideColor);
	const colorOutside = new THREE.Color(parameters.outsideColor);

	if (points) {
		scene.remove(points);
		pointGeometry.dispose();
		pointMaterial.dispose();
	}

	for (let i = 0; i < parameters.count; i++) {
		const i3 = i * 3;
		const branchAngle =
			((i % parameters.branches) / parameters.branches) * (Math.PI * 2);
		const radius =
			Math.pow(Math.random(), parameters.randomnessPower) * parameters.radius;
		// const radius = Math.random() * parameters.radius;
		const spin = radius + parameters.spin;

		const currentColor = colorInside.clone();
		currentColor.lerp(colorOutside, radius / parameters.radius);

		const randomX =
			Math.pow(Math.random(), parameters.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1) *
			radius *
			parameters.randomness;
		const randomY =
			Math.pow(Math.random(), parameters.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1) *
			radius *
			parameters.randomness;
		const randomZ =
			Math.pow(Math.random(), parameters.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1) *
			radius *
			parameters.randomness;

		positions[i3] = Math.cos(branchAngle + spin) * radius + randomX;
		positions[i3 + 1] = randomY;
		positions[i3 + 2] = Math.sin(branchAngle + spin) * radius + randomZ;

		colors[i3] = currentColor.r;
		colors[i3 + 1] = currentColor.g;
		colors[i3 + 2] = currentColor.b;
	}

	pointGeometry = new THREE.BufferGeometry();
	pointMaterial = new THREE.PointsMaterial({
		size: parameters.size,
		sizeAttenuation: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexColors: true,
	});

	pointGeometry.setAttribute(
		'position',
		new THREE.BufferAttribute(positions, 3),
	);
	pointGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

	points = new THREE.Points(pointGeometry, pointMaterial);

	scene.add(points);
}
generateGalaxy();

const galaxy = gui.addFolder('galaxy');

galaxy
	.add(parameters, 'size')
	.min(0)
	.max(0.5)
	.step(0.0001)
	.onFinishChange(generateGalaxy);
galaxy
	.add(parameters, 'count')
	.min(100)
	.max(1000000)
	.step(100)
	.onFinishChange(generateGalaxy);
galaxy
	.add(parameters, 'spin')
	.min(0)
	.max(10)
	.step(1)
	.onFinishChange(generateGalaxy);
galaxy
	.add(parameters, 'radius')
	.min(1)
	.max(10)
	.step(1)
	.onFinishChange(generateGalaxy);
galaxy
	.add(parameters, 'branches')
	.min(1)
	.max(10)
	.step(1)
	.onFinishChange(generateGalaxy);
galaxy
	.add(parameters, 'randomness')
	.min(0)
	.max(1)
	.step(0.001)
	.onFinishChange(generateGalaxy);
galaxy
	.add(parameters, 'randomnessPower')
	.min(1)
	.max(5)
	.step(1)
	.onFinishChange(generateGalaxy);
galaxy.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
galaxy.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);

galaxy.open();

const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100,
);
camera.position.set(3, 2, 3);
scene.add(camera);


const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const time = new THREE.Clock();

    const color = new THREE.Color("#FDB813");
    const geometry = new THREE.IcosahedronGeometry(1, 15);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true, // Bật tính năng trong suốt
        opacity: 0.5 // Đặt độ trong suốt (0 là hoàn toàn trong suốt, 1 là không trong suốt)
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

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


const tick = () => {
	const elapsedTime = time.getElapsedTime();

	controls.update();

	renderer.render(scene, camera);

	window.requestAnimationFrame(tick);
};
tick();

window.addEventListener('resize', () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
