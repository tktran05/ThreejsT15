//AUTHOR: Trần Trung Kiên - ID: 20233859
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function init(container){
  const scene = new THREE.Scene()
  const house = House()
  
  scene.add(house)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
  dirLight.position.set(100, -300, 400)
  scene.add(dirLight)

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  
  camera.position.set(0, 100, 300); 
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const axesHelper = new THREE.AxesHelper(100); 
  scene.add(axesHelper);

  function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    renderer.render(scene, camera);
  }

  animate();

  function House() {
    const house = new THREE.Group()

    const main = new THREE.Mesh(
      new THREE.BoxGeometry(150, 10, 10),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )

    house.add(main)

    const main1 = new THREE.Mesh(
      new THREE.BoxGeometry(150, 20, 10),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main1.position.z = -10
    main1.position.y = 5
    house.add(main1)

    const main2 = new THREE.Mesh(
      new THREE.BoxGeometry(150, 30, 10),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main2.position.z = -20
    main2.position.y = 10
    house.add(main2)

    const main3 = new THREE.Mesh(
      new THREE.BoxGeometry(150, 30, 30),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main3.position.z = -40
    main3.position.y = 10
    house.add(main3)

    //c
    const main4 = new THREE.Mesh(
      new THREE.BoxGeometry(900, 36, 200),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main4.position.z = -155
    main4.position.y = 13
    house.add(main4)

    //c
    const main5 = new THREE.Mesh(
      new THREE.BoxGeometry(230, 170, 700),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main5.position.z = -420
    main5.position.y = 80
    house.add(main5)

    //c
    const main6 = new THREE.Mesh(
      new THREE.BoxGeometry(850, 170, 170),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main6.position.z = -155
    main6.position.y = 80
    house.add(main6)

    //c
    const main7 = new THREE.Mesh(
      new THREE.BoxGeometry(900, 15, 200),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main7.position.z = -155
    main7.position.y = 80
    house.add(main7)

    //c
    const main8 = new THREE.Mesh(
      new THREE.BoxGeometry(10, 180, 10),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main8.position.z = -70
    main8.position.y = 90
    main8.position.x = -15
    house.add(main8)

    //c
    const main9 = new THREE.Mesh(
      new THREE.BoxGeometry(10, 180, 10),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main9.position.z = -70
    main9.position.y = 90
    main9.position.x = 15
    house.add(main9)


    //c
    const main10 = new THREE.Mesh(
      new THREE.BoxGeometry(10, 180, 10),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main10.position.z = -70
    main10.position.y = 90
    main10.position.x = 50
    house.add(main10)


    //c
    const main11 = new THREE.Mesh(
      new THREE.BoxGeometry(10, 180, 10),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main11.position.z = -70
    main11.position.y = 90
    main11.position.x = -50
    house.add(main11)

    //c
    const main12 = new THREE.Mesh(
      new THREE.BoxGeometry(150, 10, 200),
      new THREE.MeshLambertMaterial({ color: 0xffffff})
    )
    main12.position.z = -130
    main12.position.y = 180

    house.add(main12)
    




    const shape = new THREE.Shape();

    // Tam giác vuông tại gốc (0,0)
    shape.moveTo(0, 0);           // A
    shape.lineTo(250, 0);       // B
    shape.lineTo(0, 30);      // C
    shape.lineTo(0, 0);           // quay lại A để đóng đường
  
    const extrudeSettings = {
      depth: 30,           // độ dày (theo trục Z)
      bevelEnabled: false         // không bo góc
    };
  
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -5
    mesh.position.x = 75
    mesh.position.z = -55
    house.add(mesh)

    const shape1 = new THREE.Shape();

    // Tam giác vuông tại gốc (0,0)
    shape1.moveTo(0, 0);           // A
    shape1.lineTo(-250, 0);       // B
    shape1.lineTo(0, 30);      // C
    shape1.lineTo(0, 0);           // quay lại A để đóng đường
  
    const extrudeSettings1 = {
      depth: 30,           // độ dày (theo trục Z)
      bevelEnabled: false         // không bo góc
    };
  
    const geometry1 = new THREE.ExtrudeGeometry(shape1, extrudeSettings1);
  
    const material1 = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.position.y = -5
    mesh1.position.x = -75
    mesh1.position.z = -55
    house.add(mesh1)

    

    return house;
  }
}