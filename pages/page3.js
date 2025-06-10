import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0d0f0);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 2. Ánh sáng
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// 3. Nền xanh (mặt đất)
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x8fcf8f });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 4. Đường đua hình vành đai
const outerRadius = 30, innerRadius = 25, segments = 128;
const trackGeometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
const trackMaterial = new THREE.MeshPhongMaterial({ color: 0x4682b4, side: THREE.DoubleSide });
const track = new THREE.Mesh(trackGeometry, trackMaterial);
track.rotation.x = -Math.PI / 2;
track.position.y = 0.01;
track.receiveShadow = true;
scene.add(track);

// 5. Vạch kẻ đường
const dashRadius = (outerRadius + innerRadius) / 2;
const dashPoints = [];
for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    dashPoints.push(new THREE.Vector3(dashRadius * Math.cos(angle), 0.02, dashRadius * Math.sin(angle)));
}
const dashGeometry = new THREE.BufferGeometry().setFromPoints(dashPoints);
const dashMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.7, gapSize: 0.7 });
const dashedLine = new THREE.Line(dashGeometry, dashMaterial);
dashedLine.computeLineDistances();
scene.add(dashedLine);

// 6. Viền cam ngoài và trong
function createCircleLine(radius, color) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(radius * Math.cos(angle), 0.02, radius * Math.sin(angle)));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    return new THREE.Line(geometry, material);
}
scene.add(createCircleLine(outerRadius, 0xffa500));
scene.add(createCircleLine(innerRadius, 0xffa500));

// 7. Đài phun nước tròn
const fountainRadius = 5;
const fountainHeight = 0.5;
const fountainGeometry = new THREE.CylinderGeometry(fountainRadius, fountainRadius, fountainHeight, 64);
const fountainMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
const fountain = new THREE.Mesh(fountainGeometry, fountainMaterial);
fountain.position.y = fountainHeight / 2 + 0.01;
fountain.castShadow = true;
scene.add(fountain);

// 8. Ngôi sao năm cánh 3D
const starShape = new THREE.Shape();
const outerStar = 2, innerStar = 0.8, numPoints = 5;
for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i / (numPoints * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? outerStar : innerStar;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
}
starShape.closePath();

const starGeometry = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3
});
const starMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00, shininess: 100 });
const star = new THREE.Mesh(starGeometry, starMaterial);
star.rotation.x = -Math.PI / 2;
star.position.y = fountainHeight + 0.05;
scene.add(star);

// 9. Camera và Controls
camera.position.set(20, 25, 25);
camera.lookAt(0, 0, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 10. Vòng lặp render
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// 11. Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});