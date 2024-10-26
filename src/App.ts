

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from "gsap";
import Stats from "stats-gl";

import RAPIER from "@dimforge/rapier3d-compat"
import { getElementSize } from './dom_utils';
import { BREAK_WIDTH_PC, IS_DEBUG } from './constants';
import RapierPhysics from './RapierPhysics';
import { calcCameraZ } from './three_utils';


const MAIN_SCALE=0.5;
const WALL_THICKNESS=1*MAIN_SCALE;
const WALL_LENGTH=5*MAIN_SCALE;
const WALL_WIDTH=10*MAIN_SCALE;
const BODY_SIZE=1*MAIN_SCALE;

interface ThreeObjects{
  renderer:THREE.WebGLRenderer;
  scene:THREE.Scene;
  camera:THREE.PerspectiveCamera;
  meshList:THREE.Mesh[];
  wallTop:THREE.Mesh;
  wallBottom:THREE.Mesh;
  wallFront:THREE.Mesh;
  wallBack:THREE.Mesh;
  wallLeft:THREE.Mesh;
  wallRight:THREE.Mesh;
}

function getTime(){
  return performance.now()*0.001;
}
function getScrollPositionY(){
  return window.scrollY;
}

function createDynamicCube():THREE.Mesh{
  const geometry = new THREE.BoxGeometry(BODY_SIZE,BODY_SIZE,BODY_SIZE);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    metalness:0,
    roughness:0.3,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.userData.physics = { mass: 1 };
  return cube;
}
function createDynamicSphere():THREE.Mesh{
  const geometry = new THREE.IcosahedronGeometry(BODY_SIZE*0.5,3);
  const material = new THREE.MeshStandardMaterial({
    color: 0x0000ff,
    metalness:0,
    roughness:0.3,
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.userData.physics = { mass: 1 };
  return sphere;
}

function createWall(width:number,height:number,depth:number):THREE.Mesh{
  const geometry = new THREE.BoxGeometry(width,height,depth);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness:0,
    roughness:1,
  });
  const wall = new THREE.Mesh(geometry, material);
  wall.userData.physics = { mass: 0 };
  return wall;
}

export default class App{
  containerElement:HTMLElement;
  threeObjects?:ThreeObjects;
  rapierPhysics:RapierPhysics;

  previousTime:number;
  previousScrollPositionY:number;
  previousScrollVelocityY:number;
  stats?:Stats;
  gravity={x:0,y:-9.8,z:0};
  static suzanneOriginal?:THREE.Mesh;
  constructor(){
    {
      const containerElement=document.querySelector<HTMLElement>(".p-section-rapier");
      if(!containerElement){
        throw new Error("containerElement is null");
      }
      this.containerElement=containerElement;
    }
    this.rapierPhysics=new RapierPhysics(RAPIER,60);
    this.previousTime=getTime();
    this.previousScrollPositionY=0;
    this.previousScrollVelocityY=0;
    this.setupThree();
    this.setupStats();
    this.setupGsap();
    this.setupEvents();
  }
  setupThree():void{

    const {width,height}=getElementSize(this.containerElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.001, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    this.containerElement.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff,0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(2, 5, 10).normalize();
    scene.add(directionalLight);

    const meshList:THREE.Mesh[]=[];
    const task01=()=>{
      const mesh=createDynamicCube();
      meshList.push(mesh);
      scene.add(mesh);
    };
    const task02=()=>{
      const mesh=createDynamicSphere();
      meshList.push(mesh);
      scene.add(mesh);
    };
    const task03=()=>{
      if(!App.suzanneOriginal){
        task01();
        return;
      }
      const mesh=App.suzanneOriginal.clone(true);
      mesh.userData.physics={mass:1};
      meshList.push(mesh);
      scene.add(mesh);
    }
    const taskList=[
      task01,
      task02,
      task03,
      task02,
    ];
    for(let i=0;i<3*3*3;i++){
      taskList[i%taskList.length]();
    }

    const wallTop=createWall(WALL_WIDTH,WALL_THICKNESS,WALL_LENGTH);
    scene.add(wallTop);
    const wallBottom=createWall(WALL_WIDTH,WALL_THICKNESS,WALL_LENGTH);
    scene.add(wallBottom);
    const wallFront=createWall(WALL_WIDTH,WALL_LENGTH,WALL_THICKNESS);
    wallFront.visible=false;
    scene.add(wallFront);
    const wallBack=createWall(WALL_WIDTH,WALL_LENGTH,WALL_THICKNESS);
    scene.add(wallBack);
    const wallLeft=createWall(WALL_THICKNESS,WALL_LENGTH,WALL_LENGTH);
    scene.add(wallLeft);
    const wallRight=createWall(WALL_THICKNESS,WALL_LENGTH,WALL_LENGTH);
    scene.add(wallRight);


    this.threeObjects={
      renderer,
      scene,
      camera,
      meshList,
      wallTop,
      wallBottom,
      wallFront,
      wallBack,
      wallLeft,
      wallRight,
    };

  }
  setupStats(){
    if(!this.threeObjects){
      throw new Error("threeObjects is null");
    }
    const {renderer}=this.threeObjects;
    this.stats=new Stats();
    this.stats.init( renderer );
    document.body.appendChild( this.stats.dom );

  }
  setupGsap():void{
    const mm = gsap.matchMedia();
    mm.add({
      isSp: `(max-width: ${BREAK_WIDTH_PC - 1}px)`,
      isPc: `(min-width: ${BREAK_WIDTH_PC}px)`,
    }, (context) => {
      if (!context.conditions) {
        throw new Error("context.conditions is null");
      }
      const { isSp, isPc } = context.conditions;
      if (IS_DEBUG) {
        console.log(`isSp: ${isSp}`);
        console.log(`isPc: ${isPc}`);
      }

      if(!this.threeObjects){
        throw new Error("threeObjects is null");
      }

      const {
        scene,
        camera,
        meshList,
        wallTop,
        wallBottom,
        wallFront,
        wallBack,
        wallLeft,
        wallRight,
      }=this.threeObjects;

      this.rapierPhysics.resetWorld();

      this.previousTime=getTime();
      this.previousScrollPositionY=getScrollPositionY();
      this.previousScrollVelocityY=0;
  
      // length^(1/3)
      const l=Math.ceil(Math.pow(meshList.length,1/3));
      for(let iz=0;iz<l;iz++){
        const z=(iz-(l-1)/2)*BODY_SIZE;
        for(let iy=0;iy<l;iy++){
          const y=(iy-(l-1)/2)*BODY_SIZE;
          for(let ix=0;ix<l;ix++){
            const x=(ix-(l-1)/2)*BODY_SIZE;
            const i=iz*l*l+iy*l+ix;
            if(i<meshList.length){
              const mesh=meshList[i];
              mesh.position.set(x,y+WALL_LENGTH*0.5,z);
            }
          }
        }
      }
      wallTop.position.set(0,WALL_LENGTH+WALL_THICKNESS*0.5,0);
      wallBottom.position.set(0,WALL_THICKNESS*-0.5,0);
      wallFront.position.set(0,WALL_LENGTH*0.5,WALL_LENGTH*0.5+WALL_THICKNESS*0.5);
      wallBack.position.set(0,WALL_LENGTH*0.5,WALL_LENGTH*-0.5+WALL_THICKNESS*-0.5);

      const cameraZ=calcCameraZ(WALL_LENGTH,camera.fov)+WALL_LENGTH*0.5;
      const wallWidth=WALL_LENGTH*camera.aspect;

      camera.position.set(0,WALL_LENGTH*0.5,cameraZ);
      wallLeft.position.set(wallWidth*-0.5+WALL_THICKNESS*-0.5,WALL_LENGTH*0.5,0);
      wallRight.position.set(wallWidth*0.5+WALL_THICKNESS*0.5,WALL_LENGTH*0.5,0);

      if(isSp){

      }
      if(isPc){

      }

      this.rapierPhysics.addScene(scene);


    });

  }

  setupEvents():void{

    window.addEventListener("resize",()=>{
      this.onResize();
    })
    this.onResize();

    const animate=()=> {
      requestAnimationFrame(animate);
      this.onTick();
      if(this.stats){
        this.stats.update();
      }
    }
    animate();

    const addOnMotion=()=>{
      window.addEventListener("devicemotion",(deviceMotionEvent)=>{
        this.onMotion(deviceMotionEvent);
      })
    }
    if(typeof (DeviceMotionEvent as any).requestPermission === 'function'){
      this.setupRequestButton(addOnMotion);
    }else{
      addOnMotion();
    }

  }
  setupRequestButton(addOnMotion:()=>void){
    const button=document.createElement("button");
    button.classList.add("p-section-rapier__button")
    button.innerText="Request DeviceMotionEvent";
    button.addEventListener("click",()=>{
      const promiseRequestPermission:Promise<'granted'|'denied'>=(DeviceMotionEvent as any).requestPermission();
      promiseRequestPermission.then((result)=>{
        if(result=="granted"){
          addOnMotion();
        }
        button.remove();
      }).catch((error)=>{
        console.error(error);
      })
  
    });
    this.containerElement.appendChild(button);
  
  }
  onResize():void{
    if (!this.threeObjects) {
      throw new Error("threeObjects is null");
    }
    const { renderer, camera } = this.threeObjects;

    const {
      width,
      height,
    } = getElementSize(this.containerElement);

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

  }
  onMotion(deviceMotionEvent:DeviceMotionEvent){
    if(deviceMotionEvent.accelerationIncludingGravity){
      if(deviceMotionEvent.accelerationIncludingGravity.x!==null){
        this.gravity.x=deviceMotionEvent.accelerationIncludingGravity.x*-1;
      }
      if(deviceMotionEvent.accelerationIncludingGravity.y!==null){
        this.gravity.y=deviceMotionEvent.accelerationIncludingGravity.y*-1;
      }
      if(deviceMotionEvent.accelerationIncludingGravity.z!==null){
        this.gravity.z=deviceMotionEvent.accelerationIncludingGravity.z*-1;
      }
      console.log(`this.gravity: ${this.gravity}`);
    }
  }

  onTick():void{

    if(!this.threeObjects){
      throw new Error("threeObjects is null");
    }
    if(!this.rapierPhysics){
      throw new Error("rapierPhysics is null");
    }

    const time=getTime();
    // 0割りを回避する
    const deltaTime=Math.max(0.001,time-this.previousTime);
    // console.log(`deltaTime: ${deltaTime}`);
    if(0.1<=deltaTime){
      const scrollPositionY=getScrollPositionY();
      const scrollVelocityY=(scrollPositionY - this.previousScrollPositionY)/deltaTime;
  
      // console.log(`scrollVelocityY: ${scrollVelocityY}`);
  
      const scrollAccelerationY=(scrollVelocityY-this.previousScrollVelocityY)/deltaTime;
  
      // console.log(`scrollAccelerationY: ${scrollAccelerationY}`);
  
      const {height}=getElementSize(this.containerElement);
      // console.log(`height: ${height}`);
      const px2m = WALL_LENGTH / height * -1;
      // console.log(`px2m: ${px2m}`);
      const scrollAccelerationYM=scrollAccelerationY*px2m;
      // console.log(`scrollAccelerationYM: ${scrollAccelerationYM}`);
  
      this.previousTime=time;
      this.previousScrollPositionY=scrollPositionY;
      this.previousScrollVelocityY=scrollVelocityY;
  
      this.rapierPhysics.world.gravity.x=this.gravity.x;  
      this.rapierPhysics.world.gravity.y=scrollAccelerationYM+this.gravity.y;
      this.rapierPhysics.world.gravity.z=this.gravity.z;  
      this.rapierPhysics.world.bodies.forEach((body)=>{
        body.wakeUp();
      })
  
    }

    const {renderer,scene,camera}=this.threeObjects;


    renderer.render(scene, camera);

  }

  static async initAsync():Promise<void>{
    await RAPIER.init();
    const gltfLoader=new GLTFLoader();

    const gltf= await gltfLoader.loadAsync("./suzanne-smooth.glb");
    gltf.scene.traverse((object)=>{
      if(object instanceof THREE.Mesh){
        const geometry=object.geometry as THREE.BufferGeometry;
        geometry.scale(BODY_SIZE,BODY_SIZE,BODY_SIZE);
        this.suzanneOriginal=object;
      }
    })
  }
}