// dương văn kiên

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

  // light
  const ambient = new THREE.HemisphereLight(0xffffff, 0xbfd4d2, 1.5);
  scene.add(ambient);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(1, 1, 1).normalize().multiplyScalar(100); // Góc xiên 45 độ, đèn ở xa
  directionalLight.castShadow = true;

  directionalLight.target.position.set(0, 45, -20); 
  scene.add(directionalLight.target); 

  directionalLight.shadow.mapSize.setScalar(2048); 
  directionalLight.shadow.bias = -0.0001;
  directionalLight.shadow.normalBias = 0.0001;

  const shadowCameraSize = 200; 
  directionalLight.shadow.camera.left = -shadowCameraSize;
  directionalLight.shadow.camera.right = shadowCameraSize;
  directionalLight.shadow.camera.top = shadowCameraSize;
  directionalLight.shadow.camera.bottom = -shadowCameraSize;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.updateProjectionMatrix(); // Cập nhật camera sau khi thay đổi thông số

  scene.add(directionalLight);


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

  // plane
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

////////// =========== ko sửa dưới này ==================
//load textures
const woodTexture = new THREE.TextureLoader().load('/textures/wood.png');
const leafTexture = new THREE.TextureLoader().load('/textures/leaf.png');
const fTextures = new THREE.TextureLoader().load('/textures/rock.jpg')

const clock = new THREE.Clock();

//tree1
const tree = Tree1(16,1.2,1, woodTexture, leafTexture);
tree.position.y = -2;
tree.scale.set(0.5,0.5,0.5);
scene.add(tree);

//tree2
const pine = Tree2();
pine.position.set(4,0.5,15);
pine.scale.set(0.5,0.5,0.5);
scene.add(pine);

// hồ nước
const { fountain, jets } = createFountain({ baseRadius: 3, jetCount: 8 , fTextures});
fountain.position.set(13, 0.5, 0);
scene.add(fountain);

animate()

function animate(){
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  //sway cay
  tree.rotation.z = Math.sin(t)*0.15;
  tree.rotation.x = Math.sin(t*1.5)*0.05;
  pine.rotation.x = Math.sin(t*1.5)*0.1;
  pine.rotation.z = Math.sin(t)*0.15

  jets.forEach((jet,i)=>{
  const s = 0.5+0.5*Math.abs(Math.sin(t*3+i)); //tăng giảm theo thời gian
  jet.scale.y = s;
  jet.position.y = fountain.children[1].position.y + (s*0.5); //cập nhật vị trí theo chiều cao
})
  controls.update()

  renderer.render(scene,camera);
}
}

export function Tree1(length,radius,depth, woodTexture, leafTexture){
  const group = new THREE.Group();

  //than nhanh
  const geoBranch = new THREE.CylinderGeometry(radius*0.7, radius, length,7);
  const matBranch = new THREE.MeshStandardMaterial({map:woodTexture,roughness: 0.7});
  const meshBranch = new THREE.Mesh(geoBranch,matBranch);
  meshBranch.position.y = length/2;
  meshBranch.castShadow = true; // tao bong
  group.add(meshBranch);

  if(depth===0){
    //tan la cuoi 
    const leafGeo = new THREE.SphereGeometry(radius * 11,16,16);
    const leafMat = new THREE.MeshStandardMaterial({map:leafTexture, roughness:0.8});
    const leaves = new THREE.Mesh(leafGeo,leafMat);
    leaves.scale.set(1,0.7,1);
    leaves.position.y=length;
    leaves.castShadow=true;
    group.add(leaves);
  }
  else{
    //de quy cho nhanh con
    const sub = 5;
    for(let i =  0; i <sub; i++){
      const child = Tree1(
        length*(0.6+Math.random()*0.1), radius * 0.6, depth-1, woodTexture, leafTexture //giam de quy
      );
      child.rotation.z = (Math.random()*0.4+0.5)*(i%2? 1.1:-1.1);
      child.rotation.x = (Math.random() * 0.4 -0.2)*(i);
      child.rotation.y = (Math.random()*0.2+0.2)*(i);
      child.position.y = length; //gan nhanh con vao dau nhanh cha
      group.add(child);
    }
  }

  return group;

  
}

export function Tree2({
  trunkHeight = 10,
  trunkRadius = 1,
  foliageLevels = 5,
  foloageHeight = 4,
  foliageRadius = 7,
  spacing = 0.5
}={}){
  const group = new THREE.Group();

  //than cay
  const geoTrunk = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight,12);
  const matTrunk = new THREE.MeshStandardMaterial({color:0x8b5a2b,roughness:0.7});
  const meshTrunk = new THREE.Mesh(geoTrunk,matTrunk);
  meshTrunk.position.y = length/2;
  meshTrunk.castShadow = true;
  meshTrunk.receiveShadow = true;
  group.add(meshTrunk);
  

  for(let i = 0; i < foliageLevels; i++){
    const levelHeight = trunkHeight + i * (foloageHeight + spacing);
    const levelRadius = trunkRadius * (1 - i / foliageLevels) * foliageRadius;
    const geoFoliage = new THREE.ConeGeometry(levelRadius, foloageHeight, 8);
    const matFoliage = new THREE.MeshStandardMaterial({color:0x02a164,roughness:0.8});
    const meshFoliage = new THREE.Mesh(geoFoliage,matFoliage);
    meshFoliage.position.set(0, levelHeight*0.8-1, 0);
    meshFoliage.castShadow = true;
    meshFoliage.receiveShadow = true;
    group.add(meshFoliage);
  }
  
  return group;
}

export function createFountain({baseRadius=5, baseHeight=1.7,poolDepth = 0.2, jetCount = 6, fTextures}={}){
  const fountain = new THREE.Group();
// a.2) Tạo thêm 2 thành chậu rỗng: 
//    – inner basin radius = baseRadius*2
//    – outer basin radius = baseRadius*2.3
const basinRadii = [ baseRadius * 2, baseRadius * 2.3 ];
const basinHeight = poolDepth * 10; // hoặc tùy chỉnh độ cao

basinRadii.forEach(radius => {
  const geo = new THREE.CylinderGeometry(
    radius,    // bán kính trên
    radius,    // bán kính dưới
    basinHeight,
    32,        // radial segments
    1,         // height segments
    true       // openEnded = true (bỏ nắp)
  );
  const mat = new THREE.MeshStandardMaterial({
    map:      fTextures,
    side:       THREE.DoubleSide,
    roughness:  1
  });
  const mesh = new THREE.Mesh(geo, mat);
  // đặt chính giữa, lên cao bằng nửa chiều cao chậu trừ bù offset
  mesh.position.y = basinHeight / 2 - 0.45;
  mesh.castShadow   = true;
  mesh.receiveShadow = true;
  fountain.add(mesh);
});








// g) Tạo 2 ring trang trí với bán kính = baseRadius * 2.3,
//    cách nhau 2 đơn vị trên trục Y
const ringRadius      = baseRadius * 2.3;
const ringThickness   = 1;         // độ dày vòng ring
const ringInnerRadius = ringRadius - ringThickness;
const ringOuterRadius = ringRadius;
const ringSegments    = 64;

// chọn độ cao bắt đầu (vd: trên mặt chậu ngoài)
const yStart = baseHeight/2 + poolDepth*6 + 0.5;

for (let i = 0; i < 2; i++) {
  const geo = new THREE.RingGeometry(
    ringInnerRadius,
    ringOuterRadius,
    ringSegments,
    1
  );
  const mat = new THREE.MeshStandardMaterial({
    map:      fTextures,
    side:       THREE.DoubleSide,
    roughness:  1
  });
  const mesh = new THREE.Mesh(geo, mat);
  // xoay để ring thành đứng dựng
  mesh.rotation.x = -Math.PI / 2;
  // mỗi ring cao hơn yStart thêm 2*i
  mesh.position.y = yStart + i * 2 - 3;
  mesh.receiveShadow = true;
  fountain.add(mesh);
}



  // b) Phần bể nước
  let currentRadius = baseRadius * 1.4;
  for(let i=0;i<5;i++){
    const geometry = new THREE.CylinderGeometry(currentRadius*1.4, currentRadius, poolDepth*3, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4682b4,
      transparent: true,
      opacity: 0.6,
      roughness: 0.2,
      metalness: 0.1
    });
    if(i!== 0) {
      
      const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = baseHeight/2 + poolDepth/2+i*0.6 -1;
    mesh.receiveShadow = true;
    fountain.add(mesh);
    currentRadius *= 0.8; // giảm bán kính mỗi tầng
    }
    else {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = baseHeight/2 + poolDepth/2 -1;
      mesh.receiveShadow = true;
      fountain.add(mesh);
    }
    
  }
  

  // c) Các tia nước (cones nhỏ) — có thể animate sau
  const jetGeo = new THREE.ConeGeometry(0.1, 15, 8);
  const jetMat = new THREE.MeshStandardMaterial({
    color: 0xadd8e6,
    transparent: true,
    opacity: 0.8,
    roughness: 0.2
  });
  const jets = [];
  const waterLevel = baseHeight/2 + poolDepth*3; // vị trí nước
  for (let i = 0; i < jetCount; i++) {
    const jet = new THREE.Mesh(jetGeo, jetMat);
    const angle = (i / jetCount) * Math.PI * 2;
    const r = baseRadius * 0.7;
    jet.position.set(
      Math.cos(angle) * r,
      waterLevel,
      Math.sin(angle) * r 
    
    );
          
    jet.castShadow = true;
    fountain.add(jet);
    jets.push(jet);
  }
 

  // d) (tuỳ chọn) trả về luôn array jets để animate trong loop
  return { fountain, jets };
}


