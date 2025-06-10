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
  directionalLight.position.set(1, 1, 1).normalize().multiplyScalar(100); // Góc xiên 45 độ
  directionalLight.castShadow = true;

  directionalLight.shadow.mapSize.setScalar(2048);
  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.normalBias = 0.0001;

  const shadowCameraSize = 100;
  directionalLight.shadow.camera.left = -shadowCameraSize;
  directionalLight.shadow.camera.right = shadowCameraSize;
  directionalLight.shadow.camera.top = shadowCameraSize;
  directionalLight.shadow.camera.bottom = -shadowCameraSize;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 500;

  scene.add(directionalLight);

  // Helpers (bật nếu cần debug)
  const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 10, 0xffff00);
  scene.add(lightHelper);
  // const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  // scene.add(shadowCameraHelper);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // 🌱 Mặt đất
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshLambertMaterial({
      color: 0x87ceeb,
      side: THREE.DoubleSide,
    })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  scene.add(plane);

  // 🏠 Ngôi nhà
  const house = House(10);
  scene.add(house);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

export function House(numColumns, columnWidth, columnHeight, columnDepth, spacing) {
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