import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

// Original NASA Git blob hashes, recorded at download; texture atlases stay embedded.
const assets = {
  hubble: '8ce60c684cb45e06962782158a87afa6ef42d504',
  jwst: 'f4bfcd2a09e31cf2e32d932e66fee1d9eb311ce2',
  voyager1: 'bb997a2f539b54574d6e24a8123855ecc83748ac',
  apolloLm: '74b7b99a60f9903a0592fd763ed14482204e24d9',
}
for (const [id, expected] of Object.entries(assets)) {
  const data = await readFile(new URL(`../public/models/nasa/${id}.glb`, import.meta.url))
  assert.equal(data.toString('ascii', 0, 4), 'glTF')
  assert.equal(data.readUInt32LE(4), 2)
  assert.equal(data.readUInt32LE(8), data.length)
  const hash = createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex')
  assert.equal(hash, expected, `${id}: source integrity`)
  const gltf = JSON.parse(data.toString('utf8', 20, 20 + data.readUInt32LE(12)))
  assert(gltf.meshes.length > 0)
  assert(gltf.buffers.every(buffer => !buffer.uri), 'Geometry must be self-contained')
  assert((gltf.images ?? []).every(image => image.bufferView !== undefined), 'Textures must be self-contained')
  if (id !== 'jwst') assert(gltf.materials.some(m => m.pbrMetallicRoughness?.baseColorTexture), `${id}: missing texture atlas`)
  console.log(`${id}: original geometry and ${gltf.images?.length ?? 0} embedded images verified`)
}
for (const kind of ['elevation', 'relief']) {
  const data = await readFile(new URL(`../public/textures/earth-${kind}-4k.png`, import.meta.url))
  assert.equal(data.readUInt32BE(16), 4096)
  assert.equal(data.readUInt32BE(20), 2048)
}
console.log('4K terrain texture dimensions verified')
