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
    new THREE.PlaneGeometry(1000, 1000),
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

    //sàn tầng 0
    const material3 = new THREE.MeshLambertMaterial({ color: 0x79888a });
    const geometry3 = new THREE.BoxGeometry(300, 12, 100);
    const mesh3 = new THREE.Mesh(geometry3, material3)
    mesh3.position.y = 6
    mesh3.position.z = - 85
    mesh3.castShadow = true;
    mesh3.receiveShadow = true;
    group.add(mesh3)

    //cột trụ chính
    const material4 = new THREE.MeshLambertMaterial({ color: 0x79888a });
    const geometry4 = new THREE.BoxGeometry(1, 70, 6);
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


    const geometry5 = new THREE.BoxGeometry(300, 2, 70);
    const m8 = new THREE.Mesh(geometry5, material4) // sàn tầng 1
    m8.position.y = 35
    m8.position.z = -77
    m8.castShadow = true;
    m8.receiveShadow = true; 

    group.add(m8)

    const geometry6 = new THREE.BoxGeometry(55, 2, 90);
    const m9 = new THREE.Mesh(geometry6, material4) // sàn tầng 1.1
    m9.position.x = 122.5
    m9.position.y = 35
    m9.position.z = -89
    m9.castShadow = true;
    m9.receiveShadow = true; 

    group.add(m9)

    const m10 = new THREE.Mesh(geometry6, material4) // sàn tầng 1.2
    m10.position.x = -122.5
    m10.position.y = 35
    m10.position.z = -89
    m10.castShadow = true;
    m10.receiveShadow = true; 

    group.add(m10)

    const geo1 = new THREE.BoxGeometry(54, 2, 90);
    const x1 = new THREE.Mesh(geo1, material4) // sàn giữa lồi ra 1
    x1.position.y = 35
    x1.position.z = -64
    x1.castShadow = true;
    x1.receiveShadow = true; 

    group.add(x1)

    const x2 = HCN(45, 2, 18 , 0, 42, -40, 0x79888a)
    group.add(x2)

    const x3 = HCN(45, 3, 18 , 0, 45, -40, 0x79888a)
    group.add(x3)

    const x4 = HCN(45, 3, 18 , 0, 64, -40, 0x79888a)
    group.add(x4 )

    const geometry7 = new THREE.BoxGeometry(325, 2, 85);
    const m11 = new THREE.Mesh(geometry7, material4) // sàn tầng 2
    m11.position.y = 75
    m11.position.z = -75
    m11.castShadow = true;
    m11.receiveShadow = true; 

    group.add(m11)

    //cột trụ phụ 
    const geometry8 = new THREE.BoxGeometry(1, 40, 5);
    const a1 = new THREE.Mesh(geometry8, material4)
    a1.position.x = 13
    a1.position.y = 55
    a1.position.z = -44.5
    a1.castShadow = true;
    a1.receiveShadow = true; 
    group.add(a1)

    const a2 = new THREE.Mesh(geometry8, material4)
    a2.position.x = 11
    a2.position.y = 55
    a2.position.z = -44.5
    a2.castShadow = true;
    a2.receiveShadow = true; 
    group.add(a2)

    const a3 = new THREE.Mesh(geometry8, material4)
    a3.position.x = -13
    a3.position.y = 55
    a3.position.z = -44.5
    a3.castShadow = true;
    a3.receiveShadow = true; 
    group.add(a3)

    const a4 = new THREE.Mesh(geometry8, material4)
    a4.position.x = -11
    a4.position.y = 55
    a4.position.z = -44.5
    a4.castShadow = true;
    a4.receiveShadow = true; 
    group.add(a4)

    // sàn phụ tầng 2
    const a5 = new THREE.Mesh(geometry6, material4) // sàn tầng 2.1
    a5.position.x = 135
    a5.position.y = 75
    a5.position.z = -89
    a5.castShadow = true;
    a5.receiveShadow = true; 

    group.add(a5)

    const a6 = new THREE.Mesh(geometry6, material4) // sàn tầng 2.2
    a6.position.x = -135
    a6.position.y = 75
    a6.position.z = -89
    a6.castShadow = true;
    a6.receiveShadow = true; 

    group.add(a6)
    //list trụ phía trước
    const arrow = createRepeatedArrowShapes() // tạo list trụ mũi tên >
    arrow.scale.setScalar(8)
    arrow.position.y = 12
    arrow.position.z = - 46
    
    group.add(arrow)
    
    const tru = createRepeatedOctagonalPrisms()
    tru.position.x = 132
    tru.position.y = 24
    tru.position.z = -46
    group.add(tru)

    const truXien = createArrowShapeMesh1()
    truXien.scale.setScalar(8)
    truXien.position.x = 96
    truXien.position.y = 12
    truXien.position.z = -56

    group.add(truXien)


    const tru1 = createRepeatedOctagonalPrisms()
    tru1.position.x = -132
    tru1.position.y = 24
    tru1.position.z = -46
    group.add(tru1)

    const truXien1 = createArrowShapeMesh1()
    truXien1.scale.setScalar(8)
    truXien1.position.x = -96
    truXien1.position.y = 12
    truXien1.position.z = -44
    truXien1.rotation.y = Math.PI

    group.add(truXien1)

    // trường cạnh bên 
    
    const x5 = HCN(3, 24, 88 , 147, 24, -88, 0x79888a)
    group.add(x5 )

    const x6 = HCN(3, 24, 88 , -147, 24, -88, 0x79888a)
    group.add(x6 )

    // list trụ cột mặt tiền tầng 2
    const x7 = cot(11, 1, 40, 10, 11, 0x79888a)
    x7.position.x = 90
    x7.position.y = 35
    x7.position.z = - 40
    group.add(x7)

    const x8 = cot(11, 1, 40, 10, 11, 0x79888a)
    x8.position.x = -90
    x8.position.y = 35
    x8.position.z = - 40
    group.add(x8)

    // cột con lồng trong
    const x9 = cot(35, 0.6, 20, 2, 2, 0x566263)
    x9.position.x = -66.5
    x9.position.y = 44
    x9.position.z = - 40
    group.add(x9)

    const y9 = cot(35, 0.6, 20, 2, 2, 0x566263)
    y9.position.x = 66.5
    y9.position.y = 44
    y9.position.z = - 40
    group.add(y9)

    // 3 thanh ngang mặt tiền
    const y1 = HCN(300, 4, 2 , 0, 63, -38, 0x79888a)
    group.add(y1)

    const y2 = HCN(300, 2, 2 , 0, 67, -38, 0x79888a)
    group.add(y2)

    const y3 = HCN(300, 4, 2 , 0, 42, -38, 0x79888a)
    group.add(y3)

    //list cột trụ mặt bên
    const y4 = cot(8, 1, 40, 9, 11.6, 0x79888a)
    y4.position.x = 154
    y4.position.y = 35
    y4.position.z = - 87
    y4.rotation.y = Math.PI/2
    group.add(y4)

    const y5 = cot(8, 1, 40, 9, 11.6, 0x79888a)
    y5.position.x = -154
    y5.position.y = 35
    y5.position.z = - 87
    y5.rotation.y = Math.PI/2
    group.add(y5)

    // 6 thanh ngang mặt tiền
    const y6 = HCN(2, 4, 90 , 155, 63, -87, 0x79888a)
    group.add(y6)

    const y7 = HCN(2, 2, 90 , 155, 67, -87, 0x79888a)
    group.add(y7)

    const y8 = HCN(2, 4, 90 , 155, 43, -87, 0x79888a)
    group.add(y8)

    const y12 = HCN(2, 4, 90 , -155, 63, -87, 0x79888a)
    group.add(y12)

    const y10 = HCN(2, 2, 90 , -155, 67, -87, 0x79888a)
    group.add(y10)

    const y11 = HCN(2, 4, 90 , -155, 43, -87, 0x79888a)
    group.add(y11)

    //sân thượng
    const z1 = HCN(280, 5, 67 , 0, 78, -75, 0xffffff)
    group.add(z1)

    // sân con 1
    const z2 = HCN(70, 4, 80 , 0, 95, -75, 0xffffff)
    group.add(z2)

    const z3 = HCN(60, 4, 70 , 0, 98, -75, 0x79888a)
    group.add(z3)

    // SÂN CON phải
    
    const z4 = HCN(40, 4, 50 , 128, 90, -75, 0xffffff)
    group.add(z4)

    // SÂN CON TRÁi
    
    const z5 = HCN(40, 4, 50 , -128, 90, -75, 0xffffff)
    group.add(z5)






    return group


    //function con 

    function HCN(length, height, width, x, y, z, color){
      const material = new THREE.MeshLambertMaterial({ color: color})
      const geometry = new THREE.BoxGeometry(length, height, width)
      const Box = new THREE.Mesh(geometry, material)
      Box.position.x = x
      Box.position.y = y
      Box.position.z = z
      Box.receiveShadow = true
      Box.castShadow = true
      return Box
    }

    function createArrowShapeMesh(color = 0x79888a) {
      // Vẽ hình dấu ">" trên mặt phẳng XY
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(1.5, 1.5);
      shape.lineTo(0, 3);
      shape.lineTo(0.5, 3);
      shape.lineTo(2, 1.5);
      shape.lineTo(0.5, 0);
      shape.lineTo(0, 0);
    
      // Extrude để tạo khối 3D từ shape 2D
      const extrudeSettings = {
        depth: 0.15,          // sẽ đùn theo trục Z
        bevelEnabled: false,
      };
    
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshStandardMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);
    
      // Quay để mũi tên nhọn theo trục Z
      mesh.rotation.y = Math.PI / 2;

      mesh.castShadow = true;
      mesh.receiveShadow = true; 
    
      return mesh;
    }

    function createArrowShapeMesh1(color = 0x79888a) {
      // Vẽ hình dấu ">" trên mặt phẳng XY
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0.5, 1.5);
      shape.lineTo(0, 3);
      shape.lineTo(1, 3);
      shape.lineTo(1, 1.5);
      shape.lineTo(1, 0);
      shape.lineTo(0, 0);
    
      // Extrude để tạo khối 3D từ shape 2D
      const extrudeSettings = {
        depth: 1.5,          // sẽ đùn theo trục Z
        bevelEnabled: false,
      };
    
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshStandardMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.castShadow = true;
      mesh.receiveShadow = true; 
    
      return mesh;
    }
    
function createRepeatedArrowShapes(count = 14, spacing = 1.6) {
  const group = new THREE.Group();
  const offset = (count - 1) / 2;

  for (let i = 0; i < count; i++) {
    const arrow = createArrowShapeMesh();
    arrow.position.x = (i - offset) * spacing;
    group.add(arrow);
  }

  return group;
}

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

    function cot(numColumns, columnWidth, columnHeight, columnDepth, spacing, color) {
        const columnsGroup = new THREE.Group(); // Tạo một nhóm để chứa tất cả các cột
    
        // Đặt giá trị mặc định và đảm bảo các tham số hợp lệ
        numColumns = Math.max(1, Math.floor(numColumns || 5)); // Tối thiểu 1 cột
        columnWidth = columnWidth || 1;    // Chiều rộng mặc định
        columnHeight = columnHeight || 20; // Chiều cao mặc định
        columnDepth = columnDepth || 5;    // Chiều sâu mặc định
        spacing = spacing || 10;           // Khoảng cách mặc định giữa các cột
    
        // Vật liệu cho các cột (ví dụ: màu xám đá)
        const material = new THREE.MeshLambertMaterial({ color: color }); 
    
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


    function createOctagonalPrism(radius = 3, height = 24, color = 0x79888a) {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 6);
    const material = new THREE.MeshStandardMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
    }

    function createRepeatedOctagonalPrisms(count = 3, spacing = 14) {
    const group = new THREE.Group();

    // Tính offset để trải đều từ tâm
    const offset = (count - 1) / 2;

    for (let i = 0; i < count; i++) {
      const prism = createOctagonalPrism();
      prism.position.x = (i - offset) * spacing;
      group.add(prism);
    }

    return group;
  }


}