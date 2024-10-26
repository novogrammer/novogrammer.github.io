// three.js/examples/jsm/physics/RapierPhysics.jsより
import * as THREE from "three";
import type RAPIER from "@dimforge/rapier3d-compat"

type TypeOfRAPIER = typeof RAPIER;

const _scale = new THREE.Vector3(1, 1, 1);
const _vector = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _matrix = new THREE.Matrix4();

const ZERO = new THREE.Vector3();
const gravity = new THREE.Vector3(0.0, - 9.81, 0.0);

export default class RapierPhysics {
  RAPIER: TypeOfRAPIER;
  world: RAPIER.World;
  meshes: THREE.Mesh[] = [];
  meshMap: WeakMap<THREE.Mesh, RAPIER.RigidBody | (RAPIER.RigidBody[])> = new WeakMap<THREE.Mesh, RAPIER.RigidBody | (RAPIER.RigidBody[])>();
  fps: number;

  constructor(RAPIER: TypeOfRAPIER, fps: number) {
    this.RAPIER = RAPIER;
    this.fps = fps;
    this.world = new RAPIER.World(gravity);

    setInterval(() => {
      this.step();
    }, 1000 / fps);
  }
  resetWorld() {
    this.world.free();
    this.world = new this.RAPIER.World(gravity);
    this.meshes = [];
    this.meshMap = new WeakMap<THREE.Mesh, RAPIER.RigidBody | (RAPIER.RigidBody[])>();

  }
  getShape(geometry: THREE.BufferGeometry): RAPIER.ColliderDesc | null {

    const parameters = (geometry as any).parameters;

    // TODO change type to is*

    if (geometry.type === 'BoxGeometry') {

      const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
      const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
      const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;

      return this.RAPIER.ColliderDesc.cuboid(sx, sy, sz);

    } 
    if (geometry.type === 'SphereGeometry' || geometry.type === 'IcosahedronGeometry') {

      const radius = parameters.radius !== undefined ? parameters.radius : 1;
      return this.RAPIER.ColliderDesc.ball(radius);

    }

    // 他はConvexHullとして扱う
    return this.RAPIER.ColliderDesc.convexHull(geometry.getAttribute("position").array as Float32Array);

  }
  addScene(scene: THREE.Scene) {
    scene.traverse((child) => {

      if (child instanceof THREE.Mesh && child.isMesh) {

        const physics = child.userData.physics;

        if (physics) {

          this.addMesh(child, physics.mass, physics.restitution);

        }

      }

    });
  }

  addMesh(mesh: THREE.Mesh, mass = 0, restitution = 0) {

    const shape = this.getShape(mesh.geometry);

    if (shape === null) return;

    shape.setMass(mass);
    shape.setRestitution(restitution);

    const body = (mesh instanceof THREE.InstancedMesh && (mesh as any).isInstancedMesh)
      ? this.createInstancedBody(mesh, mass, shape)
      : this.createBody(mesh.position, mesh.quaternion, mass, shape);

    if (mass > 0) {

      this.meshes.push(mesh);
      this.meshMap.set(mesh, body);

    }

  }
  createInstancedBody(mesh: THREE.InstancedMesh, mass: number, shape: RAPIER.ColliderDesc) {

    const array = mesh.instanceMatrix.array;

    const bodies = [];

    for (let i = 0; i < mesh.count; i++) {

      const position = _vector.fromArray(array, i * 16 + 12);
      bodies.push(this.createBody(position, null, mass, shape));

    }

    return bodies;

  }

  createBody(position: THREE.Vector3, quaternion: THREE.Quaternion | null, mass: number, shape: RAPIER.ColliderDesc) {

    const desc = mass > 0 ? this.RAPIER.RigidBodyDesc.dynamic() : this.RAPIER.RigidBodyDesc.fixed();
    desc.setTranslation(...(position as any as [number, number, number]));
    if (quaternion !== null) desc.setRotation(quaternion);

    const body = this.world.createRigidBody(desc);
    this.world.createCollider(shape, body);

    return body;

  }

  setMeshPosition(mesh: THREE.Mesh, position: RAPIER.Vector, index = 0) {

    let bodyOrBodies = this.meshMap.get(mesh);
    if (!bodyOrBodies) {
      throw new Error("bodyOrBodies is null");
    }

    let body: RAPIER.RigidBody;
    if (Array.isArray(bodyOrBodies)) {
      body = bodyOrBodies[index];
    } else {
      body = bodyOrBodies;
    }

    body.setAngvel(ZERO, false);
    body.setLinvel(ZERO, false);
    body.setTranslation(position, false);

  }

  setMeshVelocity(mesh: THREE.Mesh, velocity: RAPIER.Vector, index = 0) {

    let bodyOrBodies = this.meshMap.get(mesh);
    if (!bodyOrBodies) {
      throw new Error("bodyOrBodies is null");
    }

    let body: RAPIER.RigidBody;
    if (Array.isArray(bodyOrBodies)) {
      body = bodyOrBodies[index];
    } else {
      body = bodyOrBodies;
    }

    body.setLinvel(velocity, false);

  }
  step() {


    this.world.timestep = 1 / this.fps;
    this.world.step();

    //

    for (let i = 0, l = this.meshes.length; i < l; i++) {

      const mesh = this.meshes[i];

      if (mesh instanceof THREE.InstancedMesh && mesh.isInstancedMesh) {

        const array = mesh.instanceMatrix.array;
        const bodies = this.meshMap.get(mesh);
        if (!bodies) {
          throw new Error("bodies is null");
        }
        if (!Array.isArray(bodies)) {
          throw new Error("bodies is not Array");
        }

        for (let j = 0; j < bodies.length; j++) {

          const body = bodies[j];

          const position = body.translation();
          _quaternion.copy(body.rotation());

          _matrix.compose(position as THREE.Vector3, _quaternion, _scale).toArray(array, j * 16);

        }

        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();

      } else {

        const body = this.meshMap.get(mesh);
        if (!body) {
          throw new Error("body is null");
        }
        if (Array.isArray(body)) {
          throw new Error("body is Array");
        }

        mesh.position.copy(body.translation());
        mesh.quaternion.copy(body.rotation());

      }

    }

  }

}

