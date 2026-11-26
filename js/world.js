import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createWorld(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080d12);
  scene.fog = new THREE.FogExp2(0x080d12,0.035);
  const camera = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,150);
  camera.position.set(0,1.65,2.8);
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  const clock = new THREE.Clock();

  const materials={
    blue:new THREE.MeshStandardMaterial({color:0x29476a,roughness:.95}),
    tile:new THREE.MeshStandardMaterial({color:0xd4d4cf,roughness:.7}),
    dark:new THREE.MeshStandardMaterial({color:0x171d20,roughness:.9}),
    wood:new THREE.MeshStandardMaterial({color:0x493326,roughness:.9}),
    glass:new THREE.MeshStandardMaterial({color:0x152331,roughness:.25,metalness:.2}),
    green:new THREE.MeshStandardMaterial({color:0x344c32,roughness:.95}),
    red:new THREE.MeshStandardMaterial({color:0x791b17,roughness:.8})
  };

  scene.add(new THREE.HemisphereLight(0x8194b0,0x17120d,1.1));
  const moon=new THREE.DirectionalLight(0x9eb7d8,1.1);
  moon.position.set(-5,9,5);
  moon.castShadow=true;
  scene.add(moon);

  function box(name,x,y,z,sx,sy,sz,material,cast=true){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);
    mesh.name=name;
    mesh.position.set(x,y,z);
    mesh.castShadow=cast;
    mesh.receiveShadow=true;
    scene.add(mesh);
    return mesh;
  }

  function makeRoom(){
    box("floor",0,-.12,0,8,.24,9,materials.tile,false);
    for(let x=-3.5;x<=3.5;x+=1)for(let z=-4;z<=4;z+=1){
      const line=new THREE.Mesh(new THREE.BoxGeometry(.012,.006,8),new THREE.MeshBasicMaterial({color:0x999995}));
      line.position.set(x,.006,0);scene.add(line);
      const line2=new THREE.Mesh(new THREE.BoxGeometry(8,.006,.012),new THREE.MeshBasicMaterial({color:0x999995}));
      line2.position.set(0,.006,z);scene.add(line2);
    }
    box("backwall",0,2,-4.5,8,4,.2,materials.blue);
    box("leftwall",-4,2,0,.2,4,9,materials.blue);
    box("rightwall",4,2,0,.2,4,9,materials.blue);
    box("ceiling",0,4,0,8,.15,9,materials.dark,false);
    box("bedframe",-2,.35,-1.3,2.4,.45,1.2,materials.dark);
    box("mattress",-2,.62,-1.3,2.35,.18,1.15,materials.tile);
    box("pillow",-2,.78,-.85,.65,.16,.4,new THREE.MeshStandardMaterial({color:0xb9c0c4}));
    box("desk",2,.8,-2.6,1.5,.12,.8,materials.wood);
    box("deskleg",1.4,.38,-2.3,.1,.8,.1,materials.dark);
    box("deskleg",2.6,.38,-2.3,.1,.8,.1,materials.dark);
    box("window",2.5,2.5,-4.37,1.6,1.4,.06,materials.glass);
    box("windowFrame",2.5,2.5,-4.32,1.72,.08,.08,materials.dark);
    box("windowFrame",2.5,2.5,-4.32,.08,1.5,.08,materials.dark);
    box("doorframe",0,1.15,4.35,1.35,2.3,.18,materials.wood);
    const door=box("door",0,1.1,4.24,1.15,2.15,.12,materials.wood);
    door.userData.closedRotation=0;
    door.userData.open=false;
    door.geometry.translate(.575,0,0);
    door.position.x=-.575;
    door.userData.hingeX=-.575;
    return door;
  }

  const door=makeRoom();

  function makeStreet(){
    box("street",0,-.18,17,18,.3,30,new THREE.MeshStandardMaterial({color:0x242728,roughness:1}),false);
    box("leftbuilding",-8,2,17,3,4,25,materials.dark);
    box("rightbuilding",8,2,17,3,4,25,materials.dark);
    box("stallbase",0,.9,27,5,1.8,2.5,materials.green);
    box("stallroof",0,2.05,27,5.5,.25,3,materials.dark);
    box("stallcounter",0,.65,25.65,4.8,.9,.25,materials.wood);
    box("stallboard",0,2.8,26,3.8,.9,.12,materials.wood);
    const signCanvas=document.createElement("canvas");
    signCanvas.width=1024;signCanvas.height=256;
    const ctx=signCanvas.getContext("2d");
    ctx.fillStyle="#253c25";ctx.fillRect(0,0,1024,256);
    ctx.fillStyle="#e5dfc6";ctx.textAlign="center";ctx.font="bold 82px Georgia";
    ctx.fillText("BAKSO MAGELANG RIZKI",512,155);
    const signTexture=new THREE.CanvasTexture(signCanvas);
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.7,.85),new THREE.MeshBasicMaterial({map:signTexture}));
    sign.position.set(0,2.8,25.92);scene.add(sign);
    for(let i=0;i<5;i++){
      const light=new THREE.PointLight(0xffd59a,1.2,8);
      light.position.set(-6+i*3,3,8+i*3);
      scene.add(light);
    }
  }
  makeStreet();

  const handsLight=new THREE.PointLight(0xffd9b0,.15,2);
  handsLight.position.set(0,1.5,0);
  scene.add(handsLight);

  function setRoomLighting(){
    scene.fog=new THREE.FogExp2(0x101a25,.025);
  }
  function setStreetLighting(){
    scene.fog=new THREE.FogExp2(0x080d12,.025);
  }
  function openDoor(){
    if(door.userData.open)return;
    door.userData.open=true;
    const start=door.rotation.y;
    const end=-Math.PI/2;
    const began=performance.now();
    function animateDoor(now){
      const t=Math.min((now-began)/900,1);
      door.rotation.y=start+(end-start)*(1-Math.pow(1-t,3));
      if(t<1)requestAnimationFrame(animateDoor);
    }
    requestAnimationFrame(animateDoor);
  }
  function isNearDoor(pos){return pos.z>2.6&&pos.z<4.2&&Math.abs(pos.x)<1.5}
  function isOutside(pos){return pos.z>5.0}
  function isNearStall(pos){return pos.z>22&&pos.z<31&&Math.abs(pos.x)<4}
  function getHint(pos,phase){
    if(phase==="room"&&isNearDoor(pos))return "TEKAN E UNTUK MEMBUKA PINTU";
    if(phase==="room")return "CARI PINTU KELUAR";
    if(phase==="door")return "BERJALAN MENUJU JALAN";
    if(phase==="street"&&isNearStall(pos))return "TEKAN E UNTUK MELANJUTKAN";
    return "";
  }
  function resize(){
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  }

  return {scene,camera,renderer,clock,resize,setRoomLighting,setStreetLighting,openDoor,isNearDoor,isOutside,isNearStall,getHint};
}
