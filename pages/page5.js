// AUTHOR: Trần Trung Kiên - ID: 20233859
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function init(container) {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );

  camera.position.set(200, 200, 300);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfce4ec); // Màu nền hồng nhạt

  // 💡 Ánh sáng
  const ambient = new THREE.HemisphereLight(0xffffff, 0xbfd4d2, 1.5);
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(1, 1, 1).normalize().multiplyScalar(100); // Góc xiên 45 độ, đèn ở xa
  directionalLight.castShadow = true;

  // ✨ Điều chỉnh target của đèn để bao phủ tất cả vật thể đổ bóng
  directionalLight.target.position.set(0, 45, -20); // Đặt target cao hơn và lùi về để bao phủ các cột và nền tảng
  scene.add(directionalLight.target); // Rất quan trọng: Thêm target vào scene để nó có hiệu lực

  directionalLight.shadow.mapSize.setScalar(2048); // Độ phân giải bóng cao
  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.normalBias = 0.0001;

  // ✨ Tăng kích thước vùng chiếu bóng để bao phủ toàn bộ cảnh
  const shadowCameraSize = 200; // Tăng kích thước lên 200 đơn vị
  directionalLight.shadow.camera.left = -shadowCameraSize;
  directionalLight.shadow.camera.right = shadowCameraSize;
  directionalLight.shadow.camera.top = shadowCameraSize;
  directionalLight.shadow.camera.bottom = -shadowCameraSize;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.updateProjectionMatrix(); // Cập nhật camera sau khi thay đổi thông số

  scene.add(directionalLight);

  // Helpers (rất hữu ích để debug vùng chiếu bóng)
  const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 10, 0xffff00);
  scene.add(lightHelper);
  // ✨ Bỏ comment helper này để xem vùng chiếu bóng của đèn
  const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  scene.add(shadowCameraHelper);


  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Giúp bóng mượt mà hơn
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // 🌱 Mặt đất
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshLambertMaterial({
      color: 0x87ceeb, // Màu xanh da trời
      side: THREE.DoubleSide,
    })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  scene.add(plane);

  // 🏠 Ngôi nhà và các thành phần
  const house = House();
  scene.add(house);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    // Cập nhật helper của camera đổ bóng để nó luôn hiển thị đúng vị trí
    if (shadowCameraHelper) shadowCameraHelper.update();
  }

  animate();
}

export function House(){
    const group = new THREE.Group()
    
    const stairs = mainStairs()
    // stairs.position.z = 10
    group.add(stairs)
    const stairs1 = Stairs(5)
    stairs1.position.x = 170
    stairs1.position.z = -80
    stairs1.rotation.y = Math.PI / 2;
    group.add(stairs1)

    const stairs2 = Stairs(5)
    stairs2.position.x = -170
    stairs2.position.z = -80
    stairs2.rotation.y = -Math.PI / 2;
    group.add(stairs2)

    
    const material3 = new THREE.MeshLambertMaterial({ color: 0x078997 });
    const geometry3 = new THREE.BoxGeometry(300, 12, 90);
    const mesh3 = new THREE.Mesh(geometry3, material3)
    mesh3.position.y = 6
    mesh3.position.z = - 80
    group.add(mesh3)

    const material4 = new THREE.MeshLambertMaterial({ color: 0x79888a });
    const geometry4 = new THREE.BoxGeometry(1, 60, 6);
    const mesh4 = new THREE.Mesh(geometry4, material4)
    mesh4.position.x = 20
    mesh4.position.y = 40
    mesh4.position.z = -39
    mesh4.castShadow = true;
    mesh4.receiveShadow = true; 
    group.add(mesh4)

    const mesh5 = new THREE.Mesh(geometry4, material4)
    mesh5.position.x = 18
    mesh5.position.y = 40
    mesh5.position.z = -39
    mesh5.castShadow = true;
    mesh5.receiveShadow = true; 

    group.add(mesh5)

    const mesh6 = new THREE.Mesh(geometry4, material4)
    mesh6.position.x = -20
    mesh6.position.y = 40
    mesh6.position.z = -39
    mesh6.castShadow = true;
    mesh4.receiveShadow = true; 
    group.add(mesh6)

    const mesh7 = new THREE.Mesh(geometry4, material4)
    mesh7.position.x = -18
    mesh7.position.y = 40
    mesh7.position.z = -39
    mesh7.castShadow = true;
    mesh7.receiveShadow = true; 

    group.add(mesh7)







    return group


    //function con 
    function Stairs(step) {
        const stairs = new THREE.Group();
        const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); 
        let width = 4
        let height = 2
        for (let i = 0; i < step; i++) {
            const geometry = new THREE.BoxGeometry(30, height, 4);
            const step = new THREE.Mesh(geometry, material);
            step.position.y = height/2
            step.position.z = - width/2
            height = height + 2
            width = width + 8
            step.castShadow = true;
            step.receiveShadow = true; 
            stairs.add(step);
        }

        return stairs; 
}

    function mainStairs(){
        const group = new THREE.Group()
        const shape = new THREE.Shape();
        const stairs = Stairs(5)
        group.add(stairs)
    
        // Tam giác vuông tại gốc (0,0)
        shape.moveTo(0, 0);           // A
        shape.lineTo(80, 0);       // B
        shape.lineTo(0, 10);      // C
        shape.lineTo(0, 0);           // quay lại A để đóng đường
        
        const extrudeSettings = {
            depth: 15,           // độ dày (theo trục Z)
            bevelEnabled: false         // không bo góc
        };
        
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
        const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = 15
        mesh.position.z = -35
        group.add(mesh)
    
        const shape1 = new THREE.Shape();
    
        // Tam giác vuông tại gốc (0,0)
        shape1.moveTo(0, 0);           // A
        shape1.lineTo(-80, 0);       // B
        shape1.lineTo(0, 10);      // C
        shape1.lineTo(0, 0);           // quay lại A để đóng đường
        
        const extrudeSettings1 = {
            depth: 15,           // độ dày (theo trục Z)
            bevelEnabled: false         // không bo góc
        };
        
        const geometry1 = new THREE.ExtrudeGeometry(shape1, extrudeSettings1);
        
        const material1 = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const mesh1 = new THREE.Mesh(geometry1, material1);
        mesh1.position.x = -15
        mesh1.position.z = -35
        group.add(mesh1)

        const geometry2 = new THREE.BoxGeometry(30, 10, 15);
        const mesh2 = new THREE.Mesh(geometry2, material)
        mesh2.position.y = 5
        mesh2.position.z = - 27.5
        group.add(mesh2)


        return group
    }

    function cot(numColumns, columnWidth, columnHeight, columnDepth, spacing) {
        const columnsGroup = new THREE.Group(); // Tạo một nhóm để chứa tất cả các cột
    
        // Đặt giá trị mặc định và đảm bảo các tham số hợp lệ
        numColumns = Math.max(1, Math.floor(numColumns || 5)); // Tối thiểu 1 cột
        columnWidth = columnWidth || 1;    // Chiều rộng mặc định
        columnHeight = columnHeight || 20; // Chiều cao mặc định
        columnDepth = columnDepth || 5;    // Chiều sâu mặc định
        spacing = spacing || 10;           // Khoảng cách mặc định giữa các cột
    
        // Vật liệu cho các cột (ví dụ: màu xám đá)
        const material = new THREE.MeshLambertMaterial({ color: 0x808080 }); 
    
        // Tính toán tổng chiều dài mà các cột và khoảng cách chiếm dụng
        // Ví dụ: 3 cột, mỗi cột rộng 5, khoảng cách 10 => 5 + 10 + 5 + 10 + 5 = 35
        const totalWidth = (numColumns * columnWidth) + ((numColumns - 1) * spacing);
    
        // Tính toán vị trí X bắt đầu để các cột được căn giữa quanh gốc tọa độ (0,0,0)
        const startX = -totalWidth / 2 + columnWidth / 2;
    
        // Vòng lặp để tạo từng cột
        for (let i = 0; i < numColumns; i++) {
            // Tạo hình học cho cột hiện tại
            const geometry = new THREE.BoxGeometry(columnWidth, columnHeight, columnDepth);
            const column = new THREE.Mesh(geometry, material);
    
            // Đặt vị trí X của cột
            // Vị trí X của cột hiện tại = startX + (chỉ số cột * (chiều rộng cột + khoảng cách))
            column.position.x = startX + i * (columnWidth + spacing);
            
            // Đặt vị trí Y của cột (để đáy cột nằm trên mặt phẳng Y=0)
            column.position.y = columnHeight / 2;
            
            // Đặt vị trí Z của cột (mặc định ở 0)
            column.position.z = 0;
    
            // Kích hoạt đổ bóng cho cột
            column.castShadow = true;
            column.receiveShadow = true;
    
            // Thêm cột vào nhóm
            columnsGroup.add(column);
        }
    
        return columnsGroup; // Trả về nhóm chứa tất cả các cột
    }

}