import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createPlayer(camera, canvas, getSensitivity) {
  const keys = new Set();
  let enabled = false;
  let yaw = Math.PI;
  let pitch = 0;
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const playerPosition = new THREE.Vector3(0, 1.65, 2.8);
  const body = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({color:0x9b725a,roughness:0.85});
  const sleeve = new THREE.MeshStandardMaterial({color:0x202a35,roughness:0.9});
  const armGeometry = new THREE.CylinderGeometry(0.065,0.09,0.48,8);
  const handGeometry = new THREE.SphereGeometry(0.075,10,8);
  const leftArm = new THREE.Mesh(armGeometry,sleeve);
  const rightArm = new THREE.Mesh(armGeometry,sleeve);
  const leftHand = new THREE.Mesh(handGeometry,skin);
  const rightHand = new THREE.Mesh(handGeometry,skin);
  leftArm.position.set(-0.25,-0.28,-0.48);
  rightArm.position.set(0.25,-0.28,-0.48);
  leftHand.position.set(-0.25,-0.51,-0.48);
  rightHand.position.set(0.25,-0.51,-0.48);
  body.add(leftArm,rightArm,leftHand,rightHand);
  camera.add(body);

  function onKeyDown(event){keys.add(event.code)}
  function onKeyUp(event){keys.delete(event.code)}
  function onMouseMove(event){
    if (!enabled || document.pointerLockElement !== canvas) return;
    const sensitivity = getSensitivity() * 0.0017;
    yaw -= event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;
    pitch = THREE.MathUtils.clamp(pitch,-1.45,1.45);
    camera.rotation.set(pitch,yaw,0,"YXZ");
  }
  function onClick(){
    if(enabled && document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
  }
  document.addEventListener("keydown",onKeyDown);
  document.addEventListener("keyup",onKeyUp);
  document.addEventListener("mousemove",onMouseMove);
  canvas.addEventListener("click",onClick);

  return {
    setEnabled(value){enabled=value;if(!value)document.exitPointerLock?.();},
    releasePointer(){document.exitPointerLock?.()},
    setPosition(x,y,z){playerPosition.set(x,y,z);yaw=Math.PI;pitch=0;camera.rotation.set(pitch,yaw,0,"YXZ");camera.position.copy(playerPosition)},
    getPosition(){return playerPosition.clone()},
    update(delta){
      if(!enabled)return;
      const forward=(keys.has("KeyW")?1:0)-(keys.has("KeyS")?1:0);
      const side=(keys.has("KeyD")?1:0)-(keys.has("KeyA")?1:0);
      direction.set(side,0,-forward);
      if(direction.lengthSq()>0)direction.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
      const speed=keys.has("ShiftLeft")?4.4:2.5;
      velocity.x=direction.x*speed;
      velocity.z=direction.z*speed;
      playerPosition.x+=velocity.x*delta;
      playerPosition.z+=velocity.z*delta;
      playerPosition.x=THREE.MathUtils.clamp(playerPosition.x,-10,10);
      playerPosition.z=THREE.MathUtils.clamp(playerPosition.z,-4,32);
      camera.position.copy(playerPosition);
      const moving=direction.lengthSq()>0;
      body.position.y=moving?Math.sin(performance.now()*.012)*.012:0;
    }
  };
}
