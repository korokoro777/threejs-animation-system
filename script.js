import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const gui = new GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const gltfLoader = new GLTFLoader()

let mixer = null
// .gltfファイルのURLを指定してロード
gltfLoader.load(
    'Fox.gltf',
    (gltf) => {

      gltf.scene.scale.set(0.02, 0.02, 0.02)
      scene.add(gltf.scene)
      console.log(gltf)
      
    // Animation（初期設定）
      mixer = new THREE.AnimationMixer(gltf.scene)
      let currentAction = mixer.clipAction(gltf.animations[0])
      currentAction.play()
      
    /*
    GUIでアニメーションclipを変更
    */  
      // アニメーション名のリストを作成
       const animationNames = gltf.animations.map(clip => clip.name);
      // GUIにアニメーションの選択肢を追加
      const animationController = gui.add({ クリップ: animationNames[0] }, 'クリップ', animationNames);
      // GUIでアニメーションが変更されたときにplayAnimationを呼び出すよう設定
      animationController.onChange(playAnimation);
        // GUIで選択したアニメーションを再生する関数
          function playAnimation(clipName) {
            // 既に再生中のアニメーションを停止
            if (currentAction) {
                currentAction.stop();
            }
            // 新しいアニメーションクリップを取得して再生
            const newClip = THREE.AnimationClip.findByName(gltf.animations, clipName);
            currentAction = mixer.clipAction(newClip);
            currentAction.play();
          }

    }
);


//Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

//Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

//Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

//Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//Animate
const clock = new THREE.Clock()
let previousTime = 0
const tick = () =>{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    //各フレームでミキサーを更新
    if(mixer){
        mixer.update(deltaTime)
    }

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()

//resize
window.addEventListener('resize', () =>{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

