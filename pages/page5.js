
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



//Scene, camera, renderer, shadowmap
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; //bong mem hon



//Anh sang
const ambient = new THREE.AmbientLight(0xffffff,0.4);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(12,8,9);
dirLight.castShadow = true;

//chinh camera cua shadow de do bong cay
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right= 20;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
scene.add(dirLight);



//mat phang nhan bong
const groundGeo = new THREE.PlaneGeometry(100,100);
const groundMat = new THREE.MeshStandardMaterial({color:0x666666, side: THREE.DoubleSide});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI/2;
ground.position.y = -2; //ngay duoi goc cay
ground.receiveShadow = true; //nhan bong
scene.add(ground);



//tao mat troi (sphere va anh sang rieng)
function Sun(sunRadius, orbitRadius, speed){
  const group = new THREE.Group();

  //mesh
  const sunGeo = new THREE.SphereGeometry(sunRadius,32,32); //32: phan doan chieu ngang, doc de muot hon
  const sunMat = new THREE.MeshStandardMaterial({color:0xffdd33});
  const sunMesh = new THREE.Mesh(sunGeo,sunMat);
  sunMesh.castShadow = false;
  group.add(sunMesh);

  const sunLight = new THREE.DirectionalLight(0xffffff,0.1); //cuong do sang
  sunLight.castShadow = true;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 100;
  sunLight.shadow.mapSize.set(100,100);
  sunLight.target.position.set(10,10,10);
  group.add(sunLight);
  scene.add(sunLight.target);

  // return object, method, light, method update
  return{
    group,
    update: (t) => {
      const ang = t*speed; //t: elapsed time
      const x = orbitRadius*Math.cos(ang); 
      const y = orbitRadius*Math.sin(ang); //toa do (dong + tay tren x-y)
      //cap nhat vi tri mesh va light
      sunMesh.position.set(x,y,0);
      sunLight.position.copy(sunMesh.position);
      
      //tang cuong do sang (theo y tu -r den +r)
      const norm = THREE.MathUtils.clamp((y/orbitRadius+1)/2,0,1);
      sunLight.intensity = 2 + 0.8*norm;

    }
  };

}

const sun = Sun(5,50,0.1);
scene.add(sun.group);


const woodTexture = new THREE.TextureLoader().load('/wood.png');
const leafTexture = new THREE.TextureLoader().load('/leaf.png');
//tao nhanh va tan la
function createBranch(length,radius,depth){
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
      const child = createBranch(
        length*(0.6+Math.random()*0.1), radius * 0.6, depth-1 //giam de quy
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



//tao cay va bong
const tree = createBranch(16,1.2,1);
tree.position.y = -2;
tree.scale.set(0.5,0.5,0.5);
tree.traverse(obj => {  //de quy de duyet tree va branch
  //mesh con do bong
  if(obj.isMesh){
    obj.castShadow = true;
    obj.receiveShadow = true;
  }
});
scene.add(tree);


function createFlower(petalRadius = 0.45, petalLength = 0.8){
  const flower = new THREE.Group();
  const petalGeo = new THREE.SphereGeometry(petalRadius,8,8);
  const petalMat = new THREE.MeshStandardMaterial({color:0xffc0cb,roughness:0.9});
  //tao 10 canh
  for(let i = 0;i<5;i++){
    const petal = new THREE.Mesh(petalGeo,petalMat);
    petal.scale.set(1,0.3,2);
    petal.rotation.y = (i)* (2*Math.PI/5);
    petal.position.set(0,petalLength,petalLength);
    flower.add(petal);
  }
  //tao nhuy hoa o trung tam
  const centerGeo = new THREE.SphereGeometry(petalRadius*0.6,8,8);
  const centerMat = new THREE.MeshStandardMaterial({color:0xffff99,roughness:0.9});
  const center = new THREE.Mesh(centerGeo, centerMat);
  center.position.set(0,petalLength,petalLength);
  flower.add(center);
  
  return flower;
}



//ham tao cay hoa anh dao
function createCherryTree(length,radius,depth,flowerPerBranch){
  const group = new THREE.Group();
  const initialDepth = depth;

  //de quy canh cay
  function createBranch(length,radius,depth,isRoot){
    const branch = new THREE.Group();

    //than nhanh
    const branchGeo = new THREE.CylinderGeometry(radius*0.5, radius,length,8);
    const branchMat = new THREE.MeshStandardMaterial({color:0x8b5a2b,roughness:0.7})
    const meshBranch = new THREE.Mesh(branchGeo,branchMat);
    meshBranch.castShadow = true;
    meshBranch.receiveShadow = true;
    meshBranch.position.y = length/2;
    meshBranch.castShadow = meshBranch.receiveShadow = true;
    branch.add(meshBranch);

    //rai hoa tren than (all nhanh, ke ca depth = 0)
    if(!isRoot){
      for(let i = 0; i<flowerPerBranch;i++){
        const t = Math.random();  //0->1 doc chieu dai
        const theta = Math.random()*2*Math.PI;
        const x = Math.cos(theta)*radius*1.5;
        const z = Math.sin(theta)*radius*1.5;
        const y = length * t;
        const flower = createFlower(radius*2,radius);
        flower.position.set(x,y,z);
        flower.rotation.y = theta;
        flower.traverse(node => {
          if(node.isMesh) 
            {
              node.castShadow=true;
              node.receiveShadow=true;
            }
        });
        branch.add(flower);
      }
    }
    //tiep tuc de quy neu con depth
    if(depth>0){
      const childCount = 4+Math.random();
      for(let i = 0;i<childCount;i++){
        const child = createBranch(
          length * (0.6 + Math.random()*0.1),
          radius*0.6,
          depth-1,
          false
        );
        const angle = (i/childCount)*Math.PI *2;
        child.rotation.z = (Math.random()*1+0.2)*(i%2? 1:-1);
        child.rotation.x = Math.random()*0.8;
        child.rotation.y = angle+1;
        child.position.y = length;
        branch.add(child);
      }

    }
    return branch;

  }
  //build tu goc
  const trunk = createBranch(length,radius,depth,true);
  trunk.position.y = -2;
  group.add(trunk);
  return group;

}

const cherry = createCherryTree(10,0.5,3,2)
cherry.position.set(10,-1,5);
cherry.scale.set(0.5,0.5,0.5);
scene.add(cherry);


//hàm tạo cây thông
function createPineTree({
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
    const matFoliage = new THREE.MeshStandardMaterial({color:0x228b22,roughness:0.8});
    const meshFoliage = new THREE.Mesh(geoFoliage,matFoliage);
    meshFoliage.position.set(0, levelHeight*0.8-1, 0);
    meshFoliage.castShadow = true;
    meshFoliage.receiveShadow = true;
    group.add(meshFoliage);
  }
  

  return group;
}
const pine = createPineTree();
pine.position.set(4,0.5,15);
pine.scale.set(0.5,0.5,0.5);
scene.add(pine);



//tạo đài phun nước
function createFountain({baseRadius=5, baseHeight=1.7,poolDepth = 0.2, jetCount = 6}={}){
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
    color:      0x888888,
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
    color:      0x888888,
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
// tạo đài phun với 8 tia nước
const { fountain, jets } = createFountain({ baseRadius: 3, jetCount: 8 });
fountain.position.set(10, -1, 12);
scene.add(fountain);





//khoi tao vi tri cam
camera.position.set(20,8,0);
camera.lookAt(0,1,0);

//animation: sway + xoay cam 360 do
const clock = new THREE.Clock();
const camRadius = 20;  //ban kinhb quy dao
const camSpeed = 0.2;  //rad/s


// … sau khi tạo camera, renderer …
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;      // mượt hơn khi xoay
controls.dampingFactor  = 0.05;
controls.screenSpacePanning = false;
controls.minDistance    = 10;       // không zoom quá gần
controls.maxDistance    = 100;      // không zoom quá xa
controls.maxPolarAngle  = Math.PI;  // giới hạn góc lên/xuống nếu cần


camera.fov = 60;                     // Field of View rộng hơn
camera.updateProjectionMatrix();

camera.position.set(30, 20, 30);     // đặt xa hơn để bao trọn cây và mặt trời
camera.lookAt(0, 0, 0);




function animate(){
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  //sway cay
  tree.rotation.z = Math.sin(t)*0.1;
  tree.rotation.x = Math.sin(t*0.5)*0.05;
  cherry.rotation.z = Math.sin(t)*0.1;
  cherry.rotation.x = Math.sin(t*0.5)*0.05;

  jets.forEach((jet,i)=>{
    const s = 0.5+0.5*Math.abs(Math.sin(t*3+i)); //tăng giảm theo thời gian
    jet.scale.y = s;
    jet.position.y = fountain.children[1].position.y + (s*0.5); //cập nhật vị trí theo chiều cao
  })


  sun.update(t);

  controls.update();

  renderer.render(scene,camera);
}



animate();

//hien thi dung ti le va khong meo hinh
window.addEventListener('resize',()=>{
  camera.aspect = window.innerWidth/window.innerHeight; //cap nhat ti le khung hinh
  camera.updateProjectionMatrix(); //cap nhat lai ma tran chieu
  renderer.setSize(window.innerWidth,window.innerHeight);
});
