//AUTHOR: Trần Phan Anh - ID: 20233830
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { playMusic } from './page6';

export function init(container) {
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.className = 'webgl';
    container.appendChild(canvas);

    const appRect = container.getBoundingClientRect();
    container.style.height = `${window.innerHeight - appRect.top - 5}px`;
    container.style.width = '100%';

    // 1. Thiết lập cảnh (Scene)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        2000 // Đảm bảo render khoảng cách xa
    );
    camera.position.set(0, 30, 80);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    

    // 2. Thêm ánh sáng (và cấu hình đổ bóng)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.bias = -0.0005;

    // --- Gọi hàm Tank để tạo xe tăng ---
    const tank = Tank();
    scene.add(tank);

    // --- Thêm mặt phẳng sàn để nhận bóng ---
    const groundGeometry = new THREE.PlaneGeometry(150, 150);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0; // Đặt mặt phẳng sát trục Y=0
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Thêm đạn và hiệu ứng bắn ---
    const bullets = []; // Mảng lưu các viên đạn

    // Thêm AudioListener
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Tải âm thanh
    const audioLoader = new THREE.AudioLoader();
    const gunshotSound = new THREE.PositionalAudio(listener);
    audioLoader.load(
        'sounds/gunshot.mp3', // Đường dẫn đến tệp âm thanh (cần đặt đúng trong dự án)
        (buffer) => {
            gunshotSound.setBuffer(buffer);
            gunshotSound.setRefDistance(20);
            gunshotSound.setLoop(false); // Không lặp lại
        },
        undefined,
        (err) => {
            console.error('Lỗi khi tải âm thanh:', err);
        }
    );
    tank.userData.turret.add(gunshotSound); // Gắn âm thanh vào tháp pháo

    function shootBullet() {
        // Tạo đạn (quả cầu nhỏ màu đỏ)
        const bulletGeometry = new THREE.SphereGeometry(3, 16, 16);
        const bulletMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bullet.castShadow = true;

        // Vị trí bắt đầu: đầu nòng pháo
        const barrelEndLocal = new THREE.Vector3(37, 0, 0); // Đầu nòng theo trục X cục bộ
        const barrelEndWorld = barrelEndLocal.clone().applyMatrix4(tank.userData.turret.matrixWorld);
        bullet.position.copy(barrelEndWorld);

        // Hướng bắn: dựa trên góc xoay của tháp pháo
        const turretMatrix = tank.userData.turret.matrixWorld;
        const direction = new THREE.Vector3(1, 0, 0).applyMatrix3(new THREE.Matrix3().setFromMatrix4(turretMatrix)).normalize();
        bullet.userData.velocity = direction.multiplyScalar(5); // Tốc độ đạn

        scene.add(bullet);
        bullets.push(bullet);

        // Thêm ánh sáng điểm tạm thời (tia lửa)
        const flashLight = new THREE.PointLight(0xffa500, 4, 11);
        flashLight.position.copy(barrelEndWorld);
        scene.add(flashLight);

        // Phát âm thanh khi bắn
        if (gunshotSound.isPlaying) gunshotSound.stop(); // Dừng nếu đang phát
        gunshotSound.play();

        // Xóa ánh sáng sau 0.5 giây
        setTimeout(() => {
            scene.remove(flashLight);
            flashLight.dispose();
        }, 500);
    }

    // --- Thêm điều khiển bàn phím cho xe tăng ---
    let isMovingForward = false;
    let isMovingBackward = false;
    let isTurretRotatingLeft = false;
    let isTurretRotatingRight = false;

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowUp': isMovingForward = true; break;
            case 'ArrowDown': isMovingBackward = true; break;
            case 'ArrowLeft': isTurretRotatingLeft = true; break;
            case 'ArrowRight': isTurretRotatingRight = true; break;
            case ' ': // Phím Space để bắn
                event.preventDefault(); // Ngăn hành vi mặc định (cuộn trang)
                shootBullet();
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        switch (event.key) {
            case 'ArrowUp': isMovingForward = false; break;
            case 'ArrowDown': isMovingBackward = false; break;
            case 'ArrowLeft': isTurretRotatingLeft = false; break;
            case 'ArrowRight': isTurretRotatingRight = false; break;
        }
    });

    // --- Camera Control ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.maxDistance = 150;
    controls.minDistance = 20;

    // --- Animation loop ---
    function animate() {
        requestAnimationFrame(animate);

        // Điều khiển xe tăng
        if (isMovingForward) tank.position.x += 0.5;
        if (isMovingBackward) tank.position.x -= 0.5;
        if (isTurretRotatingLeft) tank.userData.turret.rotation.y += 0.03; // Xoay tháp pháo quanh trục Y
        if (isTurretRotatingRight) tank.userData.turret.rotation.y -= 0.03;

        // Cập nhật vị trí đạn
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.position.add(bullet.userData.velocity);

            // Xóa đạn nếu đi quá xa (> 500 đơn vị)
            if (bullet.position.length() > 500) {
                scene.remove(bullet);
                bullet.geometry.dispose();
                bullet.material.dispose();
                bullets.splice(i, 1);
            }
        }

        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // --- Xử lý thay đổi kích thước cửa sổ ---
    window.addEventListener('resize', () => {
        const newAppRect = container.getBoundingClientRect();
        container.style.height = `${window.innerHeight - newAppRect.top - 5}px`;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    });

    console.log("Tank scene initialized. Use arrow keys to control tank, mouse to control camera, and Space to shoot.");
    canvas.focus();
}

    export function Tank() {
        const tank = new THREE.Group();

        const textureLoader = new THREE.TextureLoader();

        const loadTexture = (path, name) => {
            return textureLoader.load(
                path,
                () => { console.log(`${name} texture loaded.`); },
                undefined,
                (err) => {
                    console.warn(`Failed to load ${path}. Using fallback color.`, err);
                }
            );
        };
        
        // Rotate the tank to lie flat on the ground
        tank.rotation.x = -Math.PI / 2; // Quay -90 độ quanh trục X để nằm phẳng trên mặt đất

        const metalTexture = loadTexture('textures/tank.jpg', 'Metal');

        // === Thân xe (màu xanh quân đội) ===
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(59, 15, 30),
            new THREE.MeshStandardMaterial({ color: 0x556b2f })
        );
        body.position.set(0, 0, 10); // Đặt tâm thân xe ở gốc cục bộ
        body.castShadow = true;
        body.receiveShadow = true;
        body.rotation.x = -Math.PI / 2;
        tank.add(body);

        // === Bánh xích (màu trắng) ===
        const trackMaterial = new THREE.MeshStandardMaterial({ color: 0x024f1a });
        const leftTrack = new THREE.Mesh(new THREE.BoxGeometry(60, 10, 6), trackMaterial);
        leftTrack.position.set(0, -15, 5); // Điều chỉnh vị trí theo trục Z cục bộ
        leftTrack.castShadow = true;
        leftTrack.receiveShadow = true;
        leftTrack.rotation.x = -Math.PI / 2; 
        tank.add(leftTrack);

        const rightTrack = new THREE.Mesh(new THREE.BoxGeometry(60, 10, 6), trackMaterial);
        rightTrack.position.set(0, 15, 5);
        rightTrack.castShadow = true;
        rightTrack.receiveShadow = true;
        rightTrack.rotation.x = Math.PI / 2;
        tank.add(rightTrack);

        // === Tháp pháo (màu xanh đậm với texture) ===
        const turret = new THREE.Group();
        turret.position.set(0, 0, 20); // Đặt tháp pháo trên thân xe
        turret.rotation.x = Math.PI/2;

        const turretBase = new THREE.Mesh(
            new THREE.BoxGeometry(20, 10, 20),
            new THREE.MeshStandardMaterial({ map: metalTexture, color: 0x004d00 })
        );
        turretBase.position.set(0, 0, 0); // Tâm tháp pháo ở gốc cục bộ
        turretBase.castShadow = true;
        turretBase.receiveShadow = true;
        turret.add(turretBase);

        // === Nòng pháo (xám nhạt) ===
        const barrel = new THREE.Mesh(
            new THREE.BoxGeometry(30, 4, 4),
            new THREE.MeshStandardMaterial({ color: 0xb0b0b0 })
        );
        barrel.position.set(20, 0, 0); // Nòng pháo hướng theo trục X cục bộ
        barrel.castShadow = true;
        barrel.receiveShadow = true;
        turret.add(barrel);

        // === Thêm cờ đỏ với ngôi sao vàng ===
        // Cột cờ
        const flagPole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 10, 16),
            new THREE.MeshStandardMaterial({ color: 0x555555 })
        );
        flagPole.position.set(0, 10, 0); // Đặt trên tháp pháo
        flagPole.rotation.x = 0; // Cột cờ đứng thẳng
        flagPole.rotation.y = Math.PI/2; // Cột cờ đứng thẳng
        flagPole.castShadow = true;
        flagPole.receiveShadow = true;
        turretBase.add(flagPole);

        // Lá cờ 
        const flag = Flag()
        flag.scale.setScalar(0.4)
        flag.position.z = 32
        flag.position.y = 6
        flag.rotation.y = Math.PI/2
        flag.rotation.x = Math.PI/2

        
        tank.add(flag)
        

        tank.add(turret);
        tank.userData.turret = turret;

        return tank;

        function Flag() {
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
    }