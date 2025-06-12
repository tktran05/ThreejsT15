// AUTHOR: Nguyễn Minh Huy - ID:

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

    // 1. Scene Setup
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

    //music
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const backgroundMusic = playMusic(listener, '/sounds/huy.mp3');

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Lighting
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

    // --- Texture Loading ---
    const textureLoader = new THREE.TextureLoader();

    const loadTexture = (path, name, wrapS = THREE.RepeatWrapping, wrapT = THREE.RepeatWrapping, repeatX = 1, repeatY = 1) => {
        const texture = textureLoader.load(
            path,
            () => { /* console.log(`${name} texture loaded.`); */ },
            undefined,
            (err) => { console.warn(`Failed to load ${path}. Using fallback color.`, err); }
        );
        texture.wrapS = wrapS;
        texture.wrapT = wrapT;
        texture.repeat.set(repeatX, repeatY);
        return texture;
    };

    const concreteTexture = loadTexture('textures/concrete.jpg', 'Concrete', THREE.RepeatWrapping, THREE.RepeatWrapping, 2, 2);
    const metalTexture = loadTexture('textures/metal.jpg', 'Metal', THREE.RepeatWrapping, THREE.RepeatWrapping, 1, 1);
    const wallConcreteTexture = loadTexture('textures/concrete.jpg', 'Wall Concrete', THREE.RepeatWrapping, THREE.RepeatWrapping, 5, 1);
    const wallMetalTexture = loadTexture('textures/metal.jpg', 'Wall Metal', THREE.RepeatWrapping, THREE.RepeatWrapping, 1, 4);

    // --- Materials ---
    const materials = {
        mainColumn: new THREE.MeshStandardMaterial({ map: concreteTexture }),
        pillarMetal: new THREE.MeshStandardMaterial({ map: metalTexture }),
        newPillarMetal: new THREE.MeshStandardMaterial({ map: metalTexture }),
        bar: new THREE.MeshStandardMaterial({ map: metalTexture }),
        darkMetal: new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.3 }),
        lightMetal: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 }),
        mediumMetal: new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.7, roughness: 0.3 }),
        pillarLamp: new THREE.MeshStandardMaterial({ map: metalTexture }),
        decoration: new THREE.MeshStandardMaterial({ map: metalTexture }),
        wallMaterial: new THREE.MeshStandardMaterial({ map: wallConcreteTexture }),
        pillarThinBarMaterial: new THREE.MeshStandardMaterial({ map: wallMetalTexture })
    };

    // --- GATE FUNCTION DEFINITION ---


    // --- Create Gate ---
    const gate = Gate(materials);
    scene.add(gate);

    // CREATE WALL

    // --- Calculate Gate Boundaries ---
    const gateBox = new THREE.Box3().setFromObject(gate);
    const farRightGateX = gateBox.max.x;
    const farLeftGateX = gateBox.min.x;

    // Add Walls
    const wallObjectRight = Wall(materials, 5);
    wallObjectRight.updateMatrixWorld(true);
    const wallBoxRight = new THREE.Box3().setFromObject(wallObjectRight);
    const actualWallWidthRight = wallBoxRight.max.x - wallBoxRight.min.x;
    wallObjectRight.position.set(farRightGateX - 0.15 + actualWallWidthRight / 2, 0, 0);
    scene.add(wallObjectRight);

    const wallObjectLeft = Wall(materials, 5);
    wallObjectLeft.updateMatrixWorld(true);
    const wallBoxLeft = new THREE.Box3().setFromObject(wallObjectLeft);
    const actualWallWidthLeft = wallBoxLeft.max.x - wallBoxLeft.min.x;
    wallObjectLeft.position.set(farLeftGateX + 0.15 - actualWallWidthLeft / 2, 0, 0);
    scene.add(wallObjectLeft);

    // --- Ground Plane ---
    const groundGeometry = new THREE.PlaneGeometry(200, 150);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

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

    // Window Resize Handler
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

    export function Gate(materials) {
        const gateGroup = new THREE.Group();

        // --- DIMENSION PARAMETERS ---
        const params = {
            mainColumnHeight: 7.5,
            sideColumnHeight: 6.5,
            gateWidth: 8,
            sideColumnOffset: 3,
            outerColumnOffset: 7,

            mainPillarRadius: 0.05,
            mainPillarHeight: 6.25,
            mainPillarSpecialRadius: 0.1,
            mainPillarSpecialHeight: 6.5,
            pillarSpacing: 0.2,

            intermediatePillarRadius: 0.05,
            intermediatePillarHeight: 5,

            outerPillarRadius: 0.05,
            outerPillarHeight: 5.5,

            barThickness: 0.05,
            gapBetweenPairBars: 0.25,
            mainGateBarY_TopPairBottom: 6.5,
            mainGateBarY_BottomPairTop: 1,
            intermediateSpecialBarY1: 4.25,
            intermediateSpecialBarY2: 4.5,
            outerGateBarY_TopPairBottom: 5.25,
            outerGateBarY_TopPairTop: 5.5,

            lampPillarHeight: 0.3,
            lampSphereRadius: 0.1,
            lampCylinder1Radius: 0.15,
            lampCylinder1Height: 0.3,
            lampCone1Radius: 0.25,
            lampCone1Height: 0.1,
            lampCylinder2Radius: 0.3,
            lampCylinder2Height: 0.3,
            lampCone2Radius: 0.4,
            lampCone2Height: 0.2,
            lampPointLightIntensity: 15,
            lampPointLightDistance: 5,

            decorationRingInnerRadius: 0.08,
            decorationRingOuterRadius: 0.1,
            decorationRingThetaSegments: 32,
            decorationCylinderRadius: 0.01,
            decorationCrossbarWidth: 0.2,
            decorationTubeRadius: 0.01,
            decorationTubeRadialSegments: 8,
            decorationSpiralTurns: 1.5,
            decorationSpiralInwardRadius: 0.2,
            decorationSpiralOutwardRadius: 0.05,
            decorationSpiralOffsets: [0.3, 0.63, 0.96],
            gateTopDecorationMainScale: 2.8,
            gateTopDecorationMainYOffset: 1.8,
            gateTopDecorationSideScale: 1.8,
            gateTopDecorationSideYOffset: 1.5,
        };

        // --- Helper function to create mesh ---
        const createMesh = (geometry, material, x, y, z = 0) => {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            gateGroup.add(mesh);
            return mesh;
        };

        // --- Column Positions ---
        const columnXPositions = {
            main1: -params.gateWidth / 2,
            main2: params.gateWidth / 2,
            side1: -params.gateWidth / 2 - params.sideColumnOffset,
            side2: params.gateWidth / 2 + params.sideColumnOffset,
            outerSide1: -params.gateWidth / 2 - params.sideColumnOffset - params.outerColumnOffset,
            outerSide2: params.gateWidth / 2 + params.sideColumnOffset + params.outerColumnOffset,
        };

        const columnDefinitions = [
            { x: columnXPositions.main1, height: params.mainColumnHeight },
            { x: columnXPositions.main2, height: params.mainColumnHeight },
            { x: columnXPositions.side1, height: params.sideColumnHeight },
            { x: columnXPositions.side2, height: params.sideColumnHeight },
            { x: columnXPositions.outerSide1, height: params.sideColumnHeight },
            { x: columnXPositions.outerSide2, height: params.sideColumnHeight },
        ];
        columnDefinitions.forEach(def => {
            createMesh(new THREE.BoxGeometry(0.5, def.height, 0.5), materials.mainColumn, def.x, def.height / 2);
        });

        // --- Round Pillars ---
        const createPillarsInSpan = (startX, endX, baseRadius, defaultHeight, specialConfig = null) => {
            const spanLength = endX - startX;
            const numberOfPillars = Math.floor(spanLength / params.pillarSpacing) + 1;
            const actualSpacing = spanLength / (numberOfPillars - 1);

            for (let i = 0; i < numberOfPillars; i++) {
                const xPosition = startX + i * actualSpacing;
                let currentRadius = baseRadius;
                let currentHeight = defaultHeight;

                if (specialConfig && specialConfig.isMainGate && i === Math.floor(numberOfPillars / 2)) {
                    currentRadius = params.mainPillarSpecialRadius;
                    currentHeight = params.mainPillarSpecialHeight;
                } else if (specialConfig && specialConfig.isIntermediate && (xPosition === columnXPositions.side1 || xPosition === columnXPositions.side2)) {
                    currentRadius = params.mainPillarSpecialRadius;
                    currentHeight = params.mainPillarSpecialHeight;
                }
                createMesh(new THREE.CylinderGeometry(currentRadius, currentRadius, currentHeight, 32), materials.pillarMetal, xPosition, currentHeight / 2);
            }
        };

        // Main gate pillars
        createPillarsInSpan(columnXPositions.main1, columnXPositions.main2, params.mainPillarRadius, params.mainPillarHeight, { isMainGate: true });

        // Intermediate spans
        createPillarsInSpan(columnXPositions.side1, columnXPositions.main1, params.intermediatePillarRadius, params.intermediatePillarHeight, { isIntermediate: true });
        createPillarsInSpan(columnXPositions.main2, columnXPositions.side2, params.intermediatePillarRadius, params.intermediatePillarHeight, { isIntermediate: true });

        // Outer spans
        createPillarsInSpan(columnXPositions.outerSide1, columnXPositions.side1, params.outerPillarRadius, params.outerPillarHeight);
        createPillarsInSpan(columnXPositions.side2, columnXPositions.outerSide2, params.outerPillarRadius, params.outerPillarHeight);


        // ---------- CREATE HORIZONTAL BARS ----------
        const barYPositions = {
            mainGate: [
                params.barThickness / 2,
                params.barThickness + params.gapBetweenPairBars + params.barThickness / 2,
                params.mainGateBarY_BottomPairTop - params.gapBetweenPairBars - params.barThickness + params.barThickness / 2,
                params.mainGateBarY_BottomPairTop + params.barThickness / 2,
                params.mainGateBarY_TopPairBottom - params.gapBetweenPairBars - params.barThickness + params.barThickness / 2,
                params.mainGateBarY_TopPairBottom + params.barThickness / 2
            ],
            outerGate: [
                params.barThickness / 2,
                params.barThickness + params.gapBetweenPairBars + params.barThickness / 2,
                params.mainGateBarY_BottomPairTop - params.gapBetweenPairBars - params.barThickness + params.barThickness / 2,
                params.mainGateBarY_BottomPairTop + params.barThickness / 2,
                params.outerGateBarY_TopPairBottom + params.barThickness / 2,
                params.outerGateBarY_TopPairTop + params.barThickness / 2
            ],
            bottomFourBars: [
                params.barThickness / 2,
                params.barThickness + params.gapBetweenPairBars + params.barThickness / 2,
                params.mainGateBarY_BottomPairTop - params.gapBetweenPairBars - params.barThickness + params.barThickness / 2,
                params.mainGateBarY_BottomPairTop + params.barThickness / 2
            ]
        };

        const createBarsForSpan = (spanLength, xCenter, yPositions) => {
            yPositions.forEach(y => {
                createMesh(new THREE.BoxGeometry(spanLength, params.barThickness, params.barThickness), materials.bar, xCenter, y, 0);
            });
        };

        const mainGateBarLength = columnXPositions.main2 - columnXPositions.main1;
        const mainGateXCenter = (columnXPositions.main1 + columnXPositions.main2) / 2;
        createBarsForSpan(mainGateBarLength, mainGateXCenter, barYPositions.mainGate);

        const intermediateSpanLength = columnXPositions.main1 - columnXPositions.side1;
        const intermediateSpan1XCenter = (columnXPositions.side1 + columnXPositions.main1) / 2;
        const intermediateSpan2XCenter = (columnXPositions.main2 + columnXPositions.side2) / 2;

        createBarsForSpan(intermediateSpanLength, intermediateSpan1XCenter, barYPositions.bottomFourBars);
        createBarsForSpan(intermediateSpanLength, intermediateSpan2XCenter, barYPositions.bottomFourBars);

        [params.intermediateSpecialBarY1, params.intermediateSpecialBarY2].forEach(y => {
            const barGeometry = new THREE.BoxGeometry(intermediateSpanLength, params.barThickness, params.barThickness);
            createMesh(barGeometry, materials.bar, intermediateSpan1XCenter, y, 0);
            createMesh(barGeometry, materials.bar, intermediateSpan2XCenter, y, 0);
        });

        const outerSpanLength = columnXPositions.side1 - columnXPositions.outerSide1;
        const outerSpan1XCenter = (columnXPositions.outerSide1 + columnXPositions.side1) / 2;
        const outerSpan2XCenter = (columnXPositions.side2 + columnXPositions.outerSide2) / 2;

        createBarsForSpan(outerSpanLength, outerSpan1XCenter, barYPositions.outerGate);
        createBarsForSpan(outerSpanLength, outerSpan2XCenter, barYPositions.outerGate);

        // ---------- DECORATIVE LAMPS ----------
        const createDecorativeLamp = (x, baseY, z = 0) => {
            const lampGroup = new THREE.Group();
            let currentY = baseY;

            const lampParts = [
                { type: 'sphere', radius: params.lampSphereRadius, material: materials.lightMetal },
                { type: 'cylinder', radius: params.lampCylinder1Radius, height: params.lampCylinder1Height, material: materials.mediumMetal },
                { type: 'cone', radius: params.lampCone1Radius, height: params.lampCone1Height, material: materials.darkMetal, rotate: true },
                { type: 'cylinder', radius: params.lampCylinder2Radius, height: params.lampCylinder2Height, material: materials.lightMetal },
                { type: 'cone', radius: params.lampCone2Radius, height: params.lampCone2Height, material: materials.darkMetal }
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

            const pointLight = new THREE.PointLight(0xFFEEAA, params.lampPointLightIntensity, params.lampPointLightDistance);
            pointLight.position.set(0, currentY, 0);
            pointLight.castShadow = true;
            lampGroup.add(pointLight);

            lampGroup.position.set(x, 0, z);
            gateGroup.add(lampGroup);
            return lampGroup;
        };

        const createLampWithPillar = (x, z = 0, pillarBaseY) => {
            const pillar = createMesh(
                new THREE.CylinderGeometry(0.05, 0.05, params.lampPillarHeight, 16),
                materials.pillarLamp,
                x, pillarBaseY + params.lampPillarHeight / 2, z
            );
            createDecorativeLamp(x, pillarBaseY + params.lampPillarHeight, z);
        };

        createLampWithPillar(columnXPositions.main1, 0, params.mainColumnHeight);
        createLampWithPillar(columnXPositions.main2, 0, params.mainColumnHeight);
        createLampWithPillar(columnXPositions.side1, 0, params.sideColumnHeight);
        createLampWithPillar(columnXPositions.side2, 0, params.sideColumnHeight);
        createLampWithPillar(columnXPositions.outerSide1, 0, params.sideColumnHeight);
        createLampWithPillar(columnXPositions.outerSide2, 0, params.sideColumnHeight);

        // ---------- ORNAMENTATION ----------
        const createTubeMesh = (curve, segments, radius, radialSegments, closed, material) => {
            const geometry = new THREE.TubeGeometry(curve, segments, radius, radialSegments, closed);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = mesh.receiveShadow = true;
            return mesh;
        };

        const createSpiral = (turns = params.decorationSpiralTurns, inward = true, material) => {
            const points = [];
            const radius = inward ? params.decorationSpiralInwardRadius : params.decorationSpiralOutwardRadius;
            for (let i = 0; i < 60; i++) {
                const t = i / 60;
                const angle = turns * Math.PI * 2 * t;
                const r = inward ? radius * (1 - t) : radius * t;
                points.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
            }
            return createTubeMesh(new THREE.CatmullRomCurve3(points), 64, params.decorationTubeRadius, params.decorationTubeRadialSegments, false, material);
        };

        const createGateTopDecoration = (x_pos, y_pos, scale) => {
            const group = new THREE.Group();
            const material = materials.decoration;

            const ringGeometry = new THREE.RingGeometry(params.decorationRingInnerRadius, params.decorationRingOuterRadius, params.decorationRingThetaSegments);
            const centerRing = new THREE.Mesh(ringGeometry, material);
            centerRing.position.set(0, 0.4, 0);
            centerRing.castShadow = centerRing.receiveShadow = true;
            group.add(centerRing);

            const cylinderHeight = params.decorationRingOuterRadius * 2;
            const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(params.decorationCylinderRadius, params.decorationCylinderRadius, cylinderHeight, 32), material);
            cylinder.position.set(0, centerRing.position.y + params.decorationRingOuterRadius + (cylinderHeight / 2), 0);
            cylinder.castShadow = cylinder.receiveShadow = true;
            group.add(cylinder);

            const crossbar = new THREE.Mesh(new THREE.BoxGeometry(params.decorationCrossbarWidth, params.decorationCylinderRadius, params.decorationCylinderRadius), material);
            crossbar.position.set(0, cylinder.position.y, 0);
            crossbar.castShadow = crossbar.receiveShadow = true;
            group.add(crossbar);

            params.decorationSpiralOffsets.forEach(offset => {
                const spiralLeft = createSpiral(params.decorationSpiralTurns, true, material);
                spiralLeft.position.set(-offset, 0.4, 0);
                group.add(spiralLeft);

                const spiralRight = createSpiral(params.decorationSpiralTurns, true, material);
                spiralRight.scale.x = -1;
                spiralRight.position.set(offset, 0.4, 0);
                group.add(spiralRight);
            });

            group.scale.set(scale, scale, scale);
            group.position.set(x_pos, y_pos, 0);
            gateGroup.add(group);
        };

        createGateTopDecoration(mainGateXCenter, params.mainColumnHeight - params.gateTopDecorationMainYOffset, params.gateTopDecorationMainScale);
        createGateTopDecoration(outerSpan1XCenter, params.sideColumnHeight - params.gateTopDecorationSideYOffset, params.gateTopDecorationSideScale);
        createGateTopDecoration(outerSpan2XCenter, params.sideColumnHeight - params.gateTopDecorationSideYOffset, params.gateTopDecorationSideScale);

        return gateGroup;
    }

    export function Wall(materials, WALL_LENGTH) {
    const wallGroup = new THREE.Group();

    // --- Parameters for Wall and Pillars ---
    const WALL_HEIGHT = 1.0;
    const WALL_DEPTH = 0.3;
    const SEGMENT_WIDTHS = [WALL_LENGTH, WALL_LENGTH, WALL_LENGTH, WALL_LENGTH, WALL_LENGTH];

    const COMMON_PILLAR_WIDTH = 0.05;
    const COMMON_PILLAR_DEPTH = 0.05;
    const MAIN_PILLAR_WIDTH = COMMON_PILLAR_WIDTH * 2;
    const MAIN_PILLAR_DEPTH = COMMON_PILLAR_DEPTH * 2;

    const MAIN_PILLAR_HEIGHT = 4.0;
    const THIN_BAR_HEIGHT = 4.0;
    const THIN_BAR_SPACING = 0.2;

    const NUMBER_OF_SEGMENTS = SEGMENT_WIDTHS.length;
    const TOTAL_STRUCTURE_LENGTH = SEGMENT_WIDTHS.reduce((sum, current) => sum + current, 0);
    const TOTAL_WALL_LENGTH = TOTAL_STRUCTURE_LENGTH + (COMMON_PILLAR_WIDTH * 2);

    // Create lower wall strip
    const wallGeometry = new THREE.BoxGeometry(TOTAL_WALL_LENGTH, WALL_HEIGHT, WALL_DEPTH);
    const wall = new THREE.Mesh(wallGeometry, materials.wallMaterial);
    wall.position.y = WALL_HEIGHT / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wallGroup.add(wall);

    let currentStructureX = -TOTAL_STRUCTURE_LENGTH / 2;

    for (let i = 0; i <= NUMBER_OF_SEGMENTS; i++) {
        let pillarHeight;
        let pillarWidth;
        let pillarDepth;

        if (i === 0) {
            pillarHeight = THIN_BAR_HEIGHT;
            pillarWidth = COMMON_PILLAR_WIDTH;
            pillarDepth = COMMON_PILLAR_DEPTH;
        } else {
            pillarHeight = MAIN_PILLAR_HEIGHT;
            pillarWidth = MAIN_PILLAR_WIDTH;
            pillarDepth = MAIN_PILLAR_DEPTH;
        }

        const mainPillarGeometry = new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarDepth);
        const mainPillar = new THREE.Mesh(mainPillarGeometry, materials.pillarThinBarMaterial);

        mainPillar.position.x = currentStructureX;
        mainPillar.position.y = WALL_HEIGHT + pillarHeight / 2;
        mainPillar.position.z = 0;
        mainPillar.castShadow = true;
        mainPillar.receiveShadow = true;
        wallGroup.add(mainPillar);

        if (i < NUMBER_OF_SEGMENTS) {
            const currentSegmentWidth = SEGMENT_WIDTHS[i];
            const segmentEndPillarWidth = (i + 1) === NUMBER_OF_SEGMENTS ? COMMON_PILLAR_WIDTH : MAIN_PILLAR_WIDTH;
            const availableWidthForBars = currentSegmentWidth - (pillarWidth / 2) - (segmentEndPillarWidth / 2); // Corrected calculation
            
            // Calculate number of bars based on available width and spacing, ensuring at least one bar if space allows
            const numBarsInSegment = Math.max(0, Math.floor(availableWidthForBars / (COMMON_PILLAR_WIDTH + THIN_BAR_SPACING)) -1); // Adjusted for better spacing logic
        
            const actualBarInterval = availableWidthForBars / (numBarsInSegment + 1);


            for (let j = 0; j < numBarsInSegment; j++) {
                const thinBarGeometry = new THREE.BoxGeometry(COMMON_PILLAR_WIDTH, THIN_BAR_HEIGHT, COMMON_PILLAR_DEPTH);
                const thinBar = new THREE.Mesh(thinBarGeometry, materials.pillarThinBarMaterial);

                thinBar.position.x = currentStructureX + (pillarWidth / 2) + ((j + 1) * actualBarInterval);
                thinBar.position.y = WALL_HEIGHT + THIN_BAR_HEIGHT / 2;
                thinBar.position.z = 0;
                thinBar.castShadow = true;
                thinBar.receiveShadow = true;
                wallGroup.add(thinBar);
            }

            currentStructureX += currentSegmentWidth;
        }
    }

    return wallGroup;
    }

