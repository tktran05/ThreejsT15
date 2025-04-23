import * as THREE from 'three';

export function init(container){
  const scene = new THREE.Scene()

  const car = Car()
  scene.add(car)

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
}