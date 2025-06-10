import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
    scene.fog = new THREE.Fog(0x87ceeb, 20, 100);

    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 25);
    camera.lookAt(0, 3.75, 0);

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
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.bias = -0.0005;

    // --- Tải Textures ---
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

    const concreteTexture = loadTexture('./textures/rusty_metal_04_diff_1k.jpg', 'Concrete');
    concreteTexture.wrapS = THREE.RepeatWrapping;
    concreteTexture.wrapT = THREE.RepeatWrapping;
    concreteTexture.repeat.set(2, 2);

    const metalTexture = loadTexture('./textures/rusty_metal_04_diff_1k.jpg', 'Metal');
    metalTexture.wrapS = THREE.RepeatWrapping;
    metalTexture.wrapT = THREE.RepeatWrapping;
    metalTexture.repeat.set(1, 1);

    // --- Vật liệu ---
    const materials = {
        mainColumn: new THREE.MeshStandardMaterial({ map: concreteTexture, roughness: 0.8, metalness: 0.2 }),
        pillarMetal: new THREE.MeshStandardMaterial({ map: metalTexture, metalness: 0.8, roughness: 0.2 }),
        newPillarMetal: new THREE.MeshStandardMaterial({ map: metalTexture, metalness: 0.7, roughness: 0.3 }),
        bar: new THREE.MeshStandardMaterial({ map: metalTexture, metalness: 0.9, roughness: 0.1 }),
        darkMetal: new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.3 }),
        lightMetal: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 }),
        mediumMetal: new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.7, roughness: 0.3 }),
        pillarLamp: new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.4 }),
        decoration: new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6, roughness: 0.4, side: THREE.DoubleSide })
    };

    // --- CÁC THÔNG SỐ KÍCH THƯỚC ĐƯỢC ĐỊNH NGHĨA Ở ĐÂY ---
    // Thông số cột chính
    const mainColumnHeight = 7.5;
    const sideColumnHeight = 6.5;
    const gateWidth = 8; // Khoảng cách tổng giữa hai cột chính
    const mainColumnHalfDistance = gateWidth / 2;
    const sideColumnOffset = 3; // Khoảng cách từ cột chính đến cột phụ
    const outerColumnOffset = 7; // Khoảng cách từ cột phụ đến cột ngoài cùng

    // Thông số cột trụ tròn
    const mainPillarCount = 21;
    const mainPillarRadius = 0.05;
    const mainPillarHeight = 6.25;
    const mainPillarSpecialIndex = Math.floor(mainPillarCount / 2);
    const mainPillarSpecialRadius = 0.1;
    const mainPillarSpecialHeight = 6.5;

    const intermediatePillarCount = 8;
    const intermediatePillarRadius = 0.05;
    const intermediatePillarHeight = 5;

    const outerPillarCount = 12;
    const outerPillarRadius = 0.05;
    const outerPillarHeight = 5.5;

    // Thông số thanh ngang
    const barThickness = 0.05;
    const gapBetweenPairBars = 0.25;
    const mainGateBarY_TopPairBottom = 6.5; // Y cho cặp thanh ngang trên cùng của cổng chính
    const mainGateBarY_BottomPairTop = 1; // Y cho cặp thanh ngang dưới cùng của cổng chính
    const intermediateSpecialBarY1 = 4.25; // Y cho thanh ngang đặc biệt trung gian 1
    const intermediateSpecialBarY2 = 4.5; // Y cho thanh ngang đặc biệt trung gian 2
    const outerGateBarY_TopPairBottom = 5.25; // Y cho cặp thanh ngang trên cùng của cổng ngoài
    const outerGateBarY_TopPairTop = 5.5; // Y cho cặp thanh ngang trên cùng của cổng ngoài

    // Thông số đèn trang trí
    const lampPillarHeight = 0.3;
    const lampSphereRadius = 0.1;
    const lampCylinder1Radius = 0.15;
    const lampCylinder1Height = 0.3;
    const lampCone1Radius = 0.25;
    const lampCone1Height = 0.1;
    const lampCylinder2Radius = 0.3;
    const lampCylinder2Height = 0.3;
    const lampCone2Radius = 0.4;
    const lampCone2Height = 0.2;
    const lampPointLightIntensity = 15;
    const lampPointLightDistance = 5;

    // Thông số hoa văn
    const gateTopDecorationMainScale = 2.8;
    const gateTopDecorationMainYOffset = 1.8;
    const gateTopDecorationSideScale = 1.8;
    const gateTopDecorationSideYOffset = 1.5;
    const decorationRingInnerRadius = 0.08;
    const decorationRingOuterRadius = 0.1;
    const decorationRingThetaSegments = 32;
    const decorationCylinderRadius = 0.01;
    const decorationCrossbarWidth = 0.2;
    const decorationTubeRadius = 0.01;
    const decorationTubeRadialSegments = 8;
    const decorationSpiralTurns = 1.5;
    const decorationSpiralInwardRadius = 0.2;
    const decorationSpiralOutwardRadius = 0.05;
    const decorationSpiralOffsets = [0.3, 0.63, 0.96];


    // --- Hàm Helper để tạo mesh ---
    function createMesh(geometry, material, x, y, z = 0) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        return mesh;
    }

    // --- Thông số cột ---
    const columnXPositions = {
        main1: -mainColumnHalfDistance,
        main2: mainColumnHalfDistance,
        side1: -mainColumnHalfDistance - sideColumnOffset,
        side2: mainColumnHalfDistance + sideColumnOffset,
        outerSide1: -mainColumnHalfDistance - sideColumnOffset - outerColumnOffset,
        outerSide2: mainColumnHalfDistance + sideColumnOffset + outerColumnOffset,
    };

    const columnDefinitions = [
        { geom: new THREE.BoxGeometry(0.5, mainColumnHeight, 0.5), mat: materials.mainColumn, x: columnXPositions.main1, y: mainColumnHeight / 2 },
        { geom: new THREE.BoxGeometry(0.5, mainColumnHeight, 0.5), mat: materials.mainColumn, x: columnXPositions.main2, y: mainColumnHeight / 2 },
        { geom: new THREE.BoxGeometry(0.5, sideColumnHeight, 0.5), mat: materials.mainColumn, x: columnXPositions.side1, y: sideColumnHeight / 2 },
        { geom: new THREE.BoxGeometry(0.5, sideColumnHeight, 0.5), mat: materials.mainColumn, x: columnXPositions.side2, y: sideColumnHeight / 2 },
        { geom: new THREE.BoxGeometry(0.5, sideColumnHeight, 0.5), mat: materials.mainColumn, x: columnXPositions.outerSide1, y: sideColumnHeight / 2 },
        { geom: new THREE.BoxGeometry(0.5, sideColumnHeight, 0.5), mat: materials.mainColumn, x: columnXPositions.outerSide2, y: sideColumnHeight / 2 },
    ];
    columnDefinitions.forEach(def => createMesh(def.geom, def.mat, def.x, def.y));

    // --- Các cột trụ tròn ---
    const pillarConfigs = [
        {
            count: mainPillarCount, radius: mainPillarRadius, height: mainPillarHeight, material: materials.pillarMetal,
            start_x: columnXPositions.main1, end_x: columnXPositions.main2,
            special: { index: mainPillarSpecialIndex, radius: mainPillarSpecialRadius, height: mainPillarSpecialHeight }
        },
        {
            count: intermediatePillarCount, radius: intermediatePillarRadius, height: intermediatePillarHeight, material: materials.newPillarMetal,
            spans: [
                { start_x: columnXPositions.side1, end_x: columnXPositions.main1 },
                { start_x: columnXPositions.main2, end_x: columnXPositions.side2 }
            ]
        },
        {
            count: outerPillarCount, radius: outerPillarRadius, height: outerPillarHeight, material: materials.newPillarMetal,
            spans: [
                { start_x: columnXPositions.outerSide1, end_x: columnXPositions.side1 },
                { start_x: columnXPositions.side2, end_x: columnXPositions.outerSide2 }
            ]
        }
    ];

    pillarConfigs.forEach(config => {
        if (config.spans) {
            config.spans.forEach(span => {
                const spanLength = span.end_x - span.start_x;
                const spacing = spanLength / (config.count - 1);
                const geometry = new THREE.CylinderGeometry(config.radius, config.radius, config.height, 32);
                for (let i = 0; i < config.count; i++) {
                    const xPosition = span.start_x + i * spacing;
                    createMesh(geometry, config.material, xPosition, config.height / 2);
                }
            });
        } else {
            const spanWidth = config.end_x - config.start_x;
            const spacing = spanWidth / (config.count - 1);
            for (let i = 0; i < config.count; i++) {
                const xPosition = config.start_x + i * spacing;
                const currentRadius = (config.special && i === config.special.index) ? config.special.radius : config.radius;
                const currentHeight = (config.special && i === config.special.index) ? config.special.height : config.height;
                const geometry = new THREE.CylinderGeometry(currentRadius, currentRadius, currentHeight, 32);
                createMesh(geometry, config.material, xPosition, currentHeight / 2);
            }
        }
    });

    // ---------- TẠO CÁC THANH NGANG ----------
    const barYPositions = {
        mainGate: [
            barThickness / 2,
            barThickness + gapBetweenPairBars + barThickness / 2,
            mainGateBarY_BottomPairTop - gapBetweenPairBars - barThickness + barThickness / 2,
            mainGateBarY_BottomPairTop + barThickness / 2,
            mainGateBarY_TopPairBottom - gapBetweenPairBars - barThickness + barThickness / 2,
            mainGateBarY_TopPairBottom + barThickness / 2
        ],
        outerGate: [
            barThickness / 2,
            barThickness + gapBetweenPairBars + barThickness / 2,
            mainGateBarY_BottomPairTop - gapBetweenPairBars - barThickness + barThickness / 2,
            mainGateBarY_BottomPairTop + barThickness / 2,
            outerGateBarY_TopPairBottom + barThickness / 2,
            outerGateBarY_TopPairTop + barThickness / 2
        ],
        bottomFourBars: [
            barThickness / 2,
            barThickness + gapBetweenPairBars + barThickness / 2,
            mainGateBarY_BottomPairTop - gapBetweenPairBars - barThickness + barThickness / 2,
            mainGateBarY_BottomPairTop + barThickness / 2
        ]
    };

    function createBarsForSpan(spanLength, xCenter, yPositions) {
        yPositions.forEach(y => {
            const barGeometry = new THREE.BoxGeometry(spanLength, barThickness, barThickness);
            createMesh(barGeometry, materials.bar, xCenter, y, 0);
        });
    }

    // Main Gate
    const mainGateBarLength = columnXPositions.main2 - columnXPositions.main1;
    const mainGateXCenter = (columnXPositions.main1 + columnXPositions.main2) / 2;
    createBarsForSpan(mainGateBarLength, mainGateXCenter, barYPositions.mainGate);

    // Intermediate Spans
    const intermediateSpanLength = columnXPositions.main1 - columnXPositions.side1;
    const intermediateSpan1XCenter = (columnXPositions.side1 + columnXPositions.main1) / 2;
    const intermediateSpan2XCenter = (columnXPositions.main2 + columnXPositions.side2) / 2;

    createBarsForSpan(intermediateSpanLength, intermediateSpan1XCenter, barYPositions.bottomFourBars);
    createBarsForSpan(intermediateSpanLength, intermediateSpan2XCenter, barYPositions.bottomFourBars);

    const specialBarsY = [intermediateSpecialBarY1, intermediateSpecialBarY2];
    specialBarsY.forEach(y => {
        const barGeometry = new THREE.BoxGeometry(intermediateSpanLength, barThickness, barThickness);
        createMesh(barGeometry, materials.bar, intermediateSpan1XCenter, y, 0);
        createMesh(barGeometry, materials.bar, intermediateSpan2XCenter, y, 0);
    });

    // Outer Spans
    const outerSpanLength = columnXPositions.side1 - columnXPositions.outerSide1;
    const outerSpan1XCenter = (columnXPositions.outerSide1 + columnXPositions.side1) / 2;
    const outerSpan2XCenter = (columnXPositions.side2 + columnXPositions.outerSide2) / 2;

    createBarsForSpan(outerSpanLength, outerSpan1XCenter, barYPositions.outerGate);
    createBarsForSpan(outerSpanLength, outerSpan2XCenter, barYPositions.outerGate);

    // --- Thêm mặt phẳng sàn để nhận bóng ---
    const groundGeometry = new THREE.PlaneGeometry(150, 150);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // ---------- THÊM MÔ HÌNH ĐÈN TRANG TRÍ ----------

    function createDecorativeLamp(x, baseY, z = 0) {
        const lampGroup = new THREE.Group();
        let currentY = baseY;

        const lampParts = [
            { type: 'sphere', radius: lampSphereRadius, material: materials.lightMetal, adjustY: true },
            { type: 'cylinder', radius: lampCylinder1Radius, height: lampCylinder1Height, material: materials.mediumMetal },
            { type: 'cone', radius: lampCone1Radius, height: lampCone1Height, material: materials.darkMetal, rotate: true },
            { type: 'cylinder', radius: lampCylinder2Radius, height: lampCylinder2Height, material: materials.lightMetal },
            { type: 'cone', radius: lampCone2Radius, height: lampCone2Height, material: materials.darkMetal }
        ];

        lampParts.forEach(part => {
            let geometry, mesh;
            if (part.type === 'sphere') {
                geometry = new THREE.SphereGeometry(part.radius, 32, 16);
                mesh = new THREE.Mesh(geometry, part.material);
                mesh.position.set(0, currentY + part.radius, 0);
                currentY += 2 * part.radius;
            } else if (part.type === 'cylinder') {
                geometry = new THREE.CylinderGeometry(part.radius, part.radius, part.height, 16);
                mesh = new THREE.Mesh(geometry, part.material);
                mesh.position.set(0, currentY + part.height / 2, 0);
                currentY += part.height;
            } else if (part.type === 'cone') {
                geometry = new THREE.ConeGeometry(part.radius, part.height, 16);
                mesh = new THREE.Mesh(geometry, part.material);
                if (part.rotate) {
                    mesh.rotation.x = Math.PI;
                }
                mesh.position.set(0, currentY + part.height / 2, 0);
                currentY += part.height;
            }
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            lampGroup.add(mesh);
        });

        // Đặt điểm sáng tại vị trí cuối cùng của currentY
        const pointLight = new THREE.PointLight(0xFFEEAA, lampPointLightIntensity, lampPointLightDistance);
        pointLight.position.set(0, currentY, 0);
        pointLight.castShadow = true;
        lampGroup.add(pointLight);

        lampGroup.position.set(x, 0, z);
        scene.add(lampGroup);
        return lampGroup;
    }

    function createLampWithPillar(x, z = 0, pillarBaseY) {
        const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, lampPillarHeight, 16),
            materials.pillarLamp
        );
        pillar.position.set(x, pillarBaseY + lampPillarHeight / 2, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        scene.add(pillar);
        createDecorativeLamp(x, pillarBaseY + lampPillarHeight, z);
    }

    createLampWithPillar(columnXPositions.main1, 0, mainColumnHeight);
    createLampWithPillar(columnXPositions.main2, 0, mainColumnHeight);
    createLampWithPillar(columnXPositions.side1, 0, sideColumnHeight);
    createLampWithPillar(columnXPositions.side2, 0, sideColumnHeight);
    createLampWithPillar(columnXPositions.outerSide1, 0, sideColumnHeight);
    createLampWithPillar(columnXPositions.outerSide2, 0, sideColumnHeight);

    // ---------- KẾT THÚC THÊM MÔ HÌNH ĐÈN TRANG TRÍ ----------

    // ---------- THÊM HOA VĂN TỪ PAGE4.JS ----------

    function createTubeMesh(curve, segments, radius, radialSegments, closed, material) {
        const geometry = new THREE.TubeGeometry(curve, segments, radius, radialSegments, closed);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = mesh.receiveShadow = true;
        return mesh;
    }

    function createSpiral(turns = decorationSpiralTurns, inward = true, material) {
        const points = [];
        const radius = inward ? decorationSpiralInwardRadius : decorationSpiralOutwardRadius;
        for (let i = 0; i < 60; i++) {
            const t = i / 60;
            const angle = turns * Math.PI * 2 * t;
            const r = inward ? radius * (1 - t) : radius * t;
            points.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
        }
        return createTubeMesh(new THREE.CatmullRomCurve3(points), 64, decorationTubeRadius, decorationTubeRadialSegments, false, material);
    }

    // Hàm createSideWave đã bị loại bỏ như yêu cầu trước đó
    /*
    function createSideWave(mirror = false, material) {
        const startX = mirror ? -0.1 : 0.1;
        const startY = 0.4;
        const curve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(startX, startY, 0),
            new THREE.Vector3(mirror ? -0.3 : 0.3, startY - 0.2, 0),
            new THREE.Vector3(mirror ? -0.6 : 0.6, startY - 0.2, 0),
            new THREE.Vector3(mirror ? -0.8 : 0.8, startY, 0)
        );
        return createTubeMesh(curve, 64, 0.01, 8, false, material);
    }
    */

    function createGateTopDecoration(x_pos, y_pos, scale) {
        const group = new THREE.Group();
        const material = materials.decoration;

        // Thay thế Circle bằng RingGeometry để tạo hình tròn rỗng
        const ringGeometry = new THREE.RingGeometry(decorationRingInnerRadius, decorationRingOuterRadius, decorationRingThetaSegments);
        const centerRing = new THREE.Mesh(ringGeometry, material);
        centerRing.position.set(0, 0.4, 0);
        centerRing.castShadow = centerRing.receiveShadow = true;
        group.add(centerRing);

        // Các yếu tố phía trên hình tròn rỗng (không đổi)
        const cylinderHeight = decorationRingOuterRadius * 2;
        const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(decorationCylinderRadius, decorationCylinderRadius, cylinderHeight, 32), material);
        cylinder.position.set(0, centerRing.position.y + decorationRingOuterRadius + (cylinderHeight / 2), 0);
        cylinder.castShadow = cylinder.receiveShadow = true;
        group.add(cylinder);

        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(decorationCrossbarWidth, decorationCylinderRadius, decorationCylinderRadius), material);
        crossbar.position.set(0, cylinder.position.y, 0);
        crossbar.castShadow = crossbar.receiveShadow = true;
        group.add(crossbar);

        // Spirals
        decorationSpiralOffsets.forEach(offset => {
            const spiralLeft = createSpiral(decorationSpiralTurns, true, material);
            spiralLeft.position.set(-offset, 0.4, 0);
            group.add(spiralLeft);

            const spiralRight = createSpiral(decorationSpiralTurns, true, material);
            spiralRight.scale.x = -1;
            spiralRight.position.set(offset, 0.4, 0);
            group.add(spiralRight);
        });

        // Side Waves - Đã bỏ
        // group.add(createSideWave(true, material), createSideWave(false, material));

        group.scale.set(scale, scale, scale);
        group.position.set(x_pos, y_pos, 0);
        scene.add(group);
    }

    createGateTopDecoration(mainGateXCenter, mainColumnHeight - gateTopDecorationMainYOffset, gateTopDecorationMainScale);
    createGateTopDecoration(outerSpan1XCenter, sideColumnHeight - gateTopDecorationSideYOffset, gateTopDecorationSideScale);
    createGateTopDecoration(outerSpan2XCenter, sideColumnHeight - gateTopDecorationSideYOffset, gateTopDecorationSideScale);

    // ---------- KẾT THÚC THÊM HOA VĂN TỪ PAGE4.JS ----------

    // --- Camera Control ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.maxDistance = 150;
    controls.minDistance = 5;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        scene.rotation.y += 0.0005;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Xử lý thay đổi kích thước cửa sổ
    window.addEventListener('resize', () => {
        const newAppRect = container.getBoundingClientRect();
        container.style.height = `${window.innerHeight - newAppRect.top - 5}px`;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    });

    console.log("Scene initialized. Auto-rotating. Use mouse to control camera.");
    canvas.focus();
}