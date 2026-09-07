import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export const DETAILED_CRAFT = new Set(['hubble', 'jwst', 'voyager1', 'apolloLm'])
const decoder = new DRACOLoader().setDecoderPath('/draco/').setWorkerLimit(2)
const loader = new GLTFLoader().setDRACOLoader(decoder)

/** Preserve the original UV layouts and embedded NASA texture atlases. */
export async function loadDetailedCraft(id: string) {
  const { scene } = await loader.loadAsync(`/models/nasa/${id}.glb`)
  scene.name = id
  scene.traverse(object => {
    const mesh = object as Mesh
    if (!mesh.isMesh) return
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (!(material instanceof MeshStandardMaterial)) continue
      if (material.map) material.map.anisotropy = 4
      // Webb's source uses named solid-color materials, not photographic textures.
      if (id === 'jwst') {
        const name = material.name.toLowerCase()
        if (name.includes('mirror')) { material.color.set('#e8bd61'); material.metalness = 1; material.roughness = 0.14 }
        else if (/foil|silver|gold|reflector/.test(name)) { material.metalness = 0.85; material.roughness = 0.32 }
        else if (name.includes('solarpanel')) { material.color.set('#142953'); material.metalness = 0.5; material.roughness = 0.3 }
      }
    }
  })
  const box = new Box3().setFromObject(scene)
  const size = box.getSize(new Vector3())
  scene.scale.multiplyScalar(10 / Math.max(size.x, size.y, size.z))
  scene.updateMatrixWorld(true)
  const center = new Box3().setFromObject(scene).getCenter(new Vector3())
  scene.position.sub(center)
  return scene
}
