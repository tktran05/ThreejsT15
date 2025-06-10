import * as THREE from 'three';

export function init(container){
  const scene = new THREE.Scene()

  

  const tree = createPineTree();
  tree.position.set(-50, -20, -40);
  tree.rotation.x = Math.PI / 2;
  tree.scale.set(5,5,5);
  scene.add(tree);

  addRandomTrees(20)


  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
  dirLight.position.set(100, -300, 400)
  scene.add(dirLight)

  const aspectRatio = window.innerWidth / window.innerHeight
  const cameraWidth = 150
  const cameraHeight = cameraWidth / aspectRatio

  const camera = new THREE.OrthographicCamera(
    cameraWidth / -2,
    cameraWidth / 2,
    cameraHeight / 2,
    cameraHeight / -2,
    0,
    1000
  )

  camera.position.set(200, -200, 300)
  camera.up.set(0, 0, 1)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({antialias: true})
  renderer.setSize(window.innerWidth,  window.innerHeight)
  renderer.render(scene, camera)

  container.appendChild(renderer.domElement)

  function Car() {
    const car = new THREE.Group()

    car.scale.set(0.5,0.5,0.5)

    const backWheel = new THREE.Mesh(
      new THREE.BoxGeometry(12, 33, 22),
      new THREE.MeshLambertMaterial({ color: 0x333333})
    )

    backWheel.position.z = 6
    backWheel.position.x = -18
    car.add(backWheel)

    const frontWheel = new THREE.Mesh(
      new THREE.BoxGeometry(12, 33, 22),
      new THREE.MeshLambertMaterial({ color: 0x333333})
    )

    frontWheel.position.z = 6
    frontWheel.position.x = 18
    car.add(frontWheel)

    const main = new THREE.Mesh(
      new THREE.BoxGeometry(60, 30, 15),
      new THREE.MeshLambertMaterial({ color: 0xa52523})
    )

    main.position.z = 12
    car.add(main)

    return car;
  }
  

    // Hàm tạo một cây thông
    function createPineTree() {
      const tree = new THREE.Group();


      // Thân cây
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 12);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 0;
      tree.add(trunk);

      // 3 tầng lá
      const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
      for (let i = 0; i < 3; i++) {
        const coneGeometry = new THREE.ConeGeometry(1 - i * 0.2, 1, 12);
        const cone = new THREE.Mesh(coneGeometry, foliageMaterial);
        cone.position.y = 1.2 + i * 0.6;
        tree.add(cone);
      }

      return tree;
    }

    function addRandomTrees(count = 20) {
      const treePositions = [];
    
      for (let i = 0; i < count; i++) {
        let pos;
        let tries = 0;
    
        // Lặp đến khi tìm được vị trí hợp lệ (không đè lên xe)
        do {
          const x = Math.random() * 100 - 60;  // từ -200 đến 200
          const y = Math.random() * 100 - 30;  // từ -200 đến 200
          pos = { x, y };
          tries++;
        } while (distanceTo(pos, { x: 0, y: 0 }) < 50 && tries < 50); // tránh vùng xe
    
        const tree = createPineTree();
        tree.position.set(pos.x, pos.y, -40); // Z thấp để đứng trên mặt đất
        tree.rotation.x = Math.PI / 2;
        tree.scale.set(5,5,5);
        scene.add(tree);
    
        treePositions.push(pos);
      }
    
      function distanceTo(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
      }
    }
  }