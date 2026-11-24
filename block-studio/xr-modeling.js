import * as THREE from './vendor/xr/three.module.js';
export function solidForBoolean(root){
 if(!root)return null;
 if(root.isMesh)return root;
 const vertices=[];let supported=true;
 root.updateWorldMatrix(true,true);
 root.traverse(node=>{if(node===root)return;if(!node.isMesh){if(!node.isGroup)supported=false;return;}const source=node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone();source.applyMatrix4(node.matrixWorld);const p=source.getAttribute('position');if(p)for(let i=0;i<p.count;i++)vertices.push(p.getX(i),p.getY(i),p.getZ(i));source.dispose();});
 if(!supported||!vertices.length||vertices.length>900000)return null;
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial());mesh.userData.temporaryBoolean=true;return mesh;
}
