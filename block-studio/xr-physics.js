import * as C from './vendor/xr/cannon-es.js';
export function createSoftSphere(world,{position,radii,mass,bounce}){
  const points=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  const nodes=points.map(p=>{const b=new C.Body({mass:mass/6,shape:new C.Sphere(Math.max(.02,Math.min(...radii)*.15)),material:new C.Material({friction:.4,restitution:bounce})});b.position.set(...p.map((v,i)=>position[i]+v*radii[i]));b.linearDamping=.08;world.addBody(b);return b;});
  const springs=[];for(let a=0;a<nodes.length;a++)for(let b=a+1;b<nodes.length;b++)springs.push(new C.Spring(nodes[a],nodes[b],{restLength:nodes[a].position.distanceTo(nodes[b].position),stiffness:50*Math.max(.1,mass),damping:2*Math.max(.1,mass)}));
  world.addEventListener('preStep',()=>springs.forEach(s=>s.applyForce()));
  return {nodes,radii};
}
