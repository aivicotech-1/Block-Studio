import * as THREE from './vendor/xr/three.module.js';

// Screen-relative pan; dolly changes distance without moving the orbit focus.
export function navigateCamera(camera,controls,direction){
 const distance=camera.position.distanceTo(controls.target);
 if(direction==='forward'||direction==='back'){
  const offset=camera.position.clone().sub(controls.target);
  const next=THREE.MathUtils.clamp(distance*(direction==='forward'?.88:1/.88),controls.minDistance||.1,controls.maxDistance||5000);
  if(distance>0)camera.position.copy(controls.target).add(offset.multiplyScalar(next/distance));
 }else{
  const axis=(direction==='left'||direction==='right')?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
  const sign=direction==='left'||direction==='down'?-1:1;
  const delta=axis.applyQuaternion(camera.quaternion).multiplyScalar(sign*THREE.MathUtils.clamp(distance*.045,.02,200));
  camera.position.add(delta);controls.target.add(delta);
 }
 controls.update();
}
