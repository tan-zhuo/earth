/**
 * 给 globe.gl 的地球材质注入地形能力（不替换材质，只改注 three 的 Phong 着色器）：
 *
 *   顶点：按高程贴图沿法线位移 → 山脉凸起、海盆下凹，轮廓线上能看出起伏
 *   片元：由局部起伏贴图现算山体阴影 → 山脉/洋中脊/海沟的纹理感（不依赖场景光照方向）
 *   片元：可选高程着色（海拔/水深色带），与图例共用同一张 256 色查找表
 *
 * 三个效果都由 uniform 控制强度，关掉时开销可忽略，也不影响时间旅行等既有图层。
 */
import {
  DataTexture,
  LinearFilter,
  MeshPhongMaterial,
  NoColorSpace,
  RGBAFormat,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
} from 'three'
import type { Texture } from 'three'
import {
  EARTH_RADIUS_M,
  ELEVATION_TEXTURE,
  ELEV_STEP,
  HEIGHT_OFFSET,
  RELIEF_STEP,
  RELIEF_TEXTURE,
  SEA_BYTE,
  TEX_H,
  TEX_W,
  palette256,
} from '../data/terrain'

/** three-globe 的地球半径（世界单位） */
const GLOBE_RADIUS = 100
/** 赤道上一个纹素的地面距离（米），用于把起伏贴图的差分换算成真实坡度 */
const TEXEL_M = 40_075_017 / TEX_W
/** 单位起伏差分 → 坡度的系数（两个纹素间距） */
const SLOPE_PER_UNIT = (255 * RELIEF_STEP) / (2 * TEXEL_M)
/** 山体阴影相对垂直夸张再加一点，全球网格上的细小坡度需要适度增强 */
const SHADE_BOOST = 2

const VERT_PARS = /* glsl */ `
uniform sampler2D tElevation;
uniform float uDisplace;      // 米 → 世界单位（含垂直夸张）
varying vec2 vTerrainUv;
float heightAt(vec2 point) {
  vec2 encoded = texture2D(tElevation, point).rg;
  return dot(encoded, vec2(65280.0, 255.0)) - ${HEIGHT_OFFSET}.0;
}
`

const VERT_BODY = /* glsl */ `
vTerrainUv = uv;
if (uDisplace != 0.0) {
  float meters = heightAt(uv);
  transformed += normalize(position) * (meters * uDisplace);
}
`

// Spherical tangent basis reconstructs slope normals from the same height samples.
const TERRAIN_NORMAL = /* glsl */ `
if (uDisplace != 0.0) {
  vec2 stepUv = vec2(1.0 / ${TEX_W}.0, 1.0 / ${TEX_H}.0);
  float longitude = uv.x * 2.0 * PI;
  float latitude = (uv.y - 0.5) * PI;
  float eastSlope = (heightAt(uv + vec2(stepUv.x, 0.0)) - heightAt(uv - vec2(stepUv.x, 0.0))) * uDisplace / (${GLOBE_RADIUS}.0 * 4.0 * PI * stepUv.x * max(cos(latitude), 0.05));
  float northSlope = (heightAt(uv + vec2(0.0, stepUv.y)) - heightAt(uv - vec2(0.0, stepUv.y))) * uDisplace / (${GLOBE_RADIUS}.0 * 2.0 * PI * stepUv.y);
  vec3 east = vec3(sin(longitude), 0.0, cos(longitude));
  vec3 north = vec3(cos(longitude) * sin(latitude), cos(latitude), -sin(longitude) * sin(latitude));
  objectNormal = normalize(objectNormal - east * eastSlope - north * northSlope);
}
`

const FRAG_PARS = /* glsl */ `
uniform sampler2D tElevation;
uniform sampler2D tRelief;
uniform sampler2D tPalette;
uniform sampler2D tMask;      // R = 悬停国家，G = 选中国家，B = 选中边界
uniform float uTint;          // 高程着色混合比 0~1
uniform float uShade;         // 山体阴影强度（0 = 关）
uniform float uMask;          // 高亮总开关（0 = 关）
varying vec2 vTerrainUv;
float heightAt(vec2 point) {
  vec2 encoded = texture2D(tElevation, point).rg;
  return dot(encoded, vec2(65280.0, 255.0)) - ${HEIGHT_OFFSET}.0;
}
`

const FRAG_BODY = /* glsl */ `
if (uTint > 0.0) {
  vec3 tint = texture2D(tPalette, vec2((heightAt(vTerrainUv) / ${ELEV_STEP}.0 + ${SEA_BYTE}.0) / 255.0, 0.5)).rgb;
  diffuseColor.rgb = mix(diffuseColor.rgb, tint, uTint);
}
if (uMask > 0.0) {
  // 高亮直接画在地表上：悬停青色、选中琥珀色，随地形起伏，不会悬空或被戳穿
  vec3 m = texture2D(tMask, vTerrainUv).rgb * uMask;
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.22, 0.74, 0.97), m.r * (1.0 - m.g) * 0.12);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.98, 0.75, 0.14), m.g * 0.05);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.98, 0.80, 0.36), m.b * 0.55);
}
if (uShade > 0.0) {
  vec2 texel = vec2(1.0 / ${TEX_W}.0, 1.0 / ${TEX_H}.0);
  // 高纬度纹素在地面上更窄，同样落差对应更陡的坡；夹住极区避免阴影爆掉
  float lat = (vTerrainUv.y - 0.5) * PI;
  float ew = 1.0 / max(cos(lat), 0.25);
  float dx = texture2D(tRelief, vTerrainUv + vec2(texel.x, 0.0)).r
           - texture2D(tRelief, vTerrainUv - vec2(texel.x, 0.0)).r;
  float dy = texture2D(tRelief, vTerrainUv + vec2(0.0, texel.y)).r
           - texture2D(tRelief, vTerrainUv - vec2(0.0, texel.y)).r;
  vec3 n = normalize(vec3(-dx * ew * uShade, -dy * uShade, 1.0));
  // 固定西北方向光（地图学惯例），与场景光照无关，任何视角下山形都成立
  float lit = clamp(dot(n, normalize(vec3(-0.55, 0.55, 0.62))), 0.0, 1.0);
  diffuseColor.rgb *= 0.74 + 0.48 * lit;
}
`

export interface TerrainController {
  /** 贴图就绪（失败时 reject） */
  ready: Promise<void>
  /** 垂直夸张倍数，0 = 完全关闭起伏与阴影 */
  setExaggeration(x: number): void
  /** 高程着色混合比 0~1 */
  setTint(v: number): void
  /** 悬停/选中高亮掩码贴图（R 悬停 / G 选中） */
  setMask(texture: Texture | null): void
  dispose(): void
}

/** 给地球材质挂上地形着色器，返回控制器（幂等由调用方保证：每个材质挂一次） */
export function attachTerrain(material: MeshPhongMaterial): TerrainController {
  const lut = new DataTexture(palette256(), 256, 1, RGBAFormat)
  lut.colorSpace = SRGBColorSpace
  lut.minFilter = lut.magFilter = LinearFilter
  lut.needsUpdate = true

  const uniforms = {
    tElevation: { value: null as Texture | null },
    tRelief: { value: null as Texture | null },
    tPalette: { value: lut },
    tMask: { value: null as Texture | null },
    uDisplace: { value: 0 },
    uShade: { value: 0 },
    uTint: { value: 0 },
    uMask: { value: 0 },
  }

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERT_PARS}`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n${TERRAIN_NORMAL}`)
      .replace('#include <displacementmap_vertex>', VERT_BODY)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAG_PARS}`)
      .replace('#include <map_fragment>', `#include <map_fragment>\n${FRAG_BODY}`)
  }
  material.needsUpdate = true

  let disposed = false
  const ownedTextures: Texture[] = []
  const loader = new TextureLoader()
  /** 高程/起伏是数据不是颜色：禁用色彩空间转换，经度方向环绕以便在换日线取邻域 */
  const loadData = async (url: string) => {
    const tex = await loader.loadAsync(url)
    if (disposed) { tex.dispose(); return tex }
    ownedTextures.push(tex)
    tex.colorSpace = NoColorSpace
    tex.wrapS = RepeatWrapping
    // Mipmap byte rounding would break packed RG heights at channel carries.
    tex.generateMipmaps = false
    tex.minFilter = tex.magFilter = LinearFilter
    return tex
  }

  let exaggeration = 0
  let tint = 0
  const apply = () => {
    const loaded = !!uniforms.tElevation.value
    uniforms.uDisplace.value = loaded ? (exaggeration * GLOBE_RADIUS) / EARTH_RADIUS_M : 0
    uniforms.uShade.value = loaded ? Math.min(exaggeration, 18) * SHADE_BOOST * SLOPE_PER_UNIT : 0
    uniforms.uTint.value = loaded ? tint : 0
    // 高亮掩码只在地形生效时使用（平地时仍用 globe.gl 原本的多边形高亮）
    uniforms.uMask.value = loaded && uniforms.tMask.value && exaggeration > 0 ? 1 : 0
  }

  const ready = Promise.all([loadData(ELEVATION_TEXTURE), loadData(RELIEF_TEXTURE)]).then(
    ([elevation, relief]) => {
      if (disposed) return
      uniforms.tElevation.value = elevation
      uniforms.tRelief.value = relief
      apply()
    },
  )

  return {
    ready,
    setExaggeration(x) {
      exaggeration = x
      apply()
    },
    setTint(v) {
      tint = v
      apply()
    },
    setMask(texture) {
      uniforms.tMask.value = texture
      apply()
    },
    dispose() {
      disposed = true
      ownedTextures.forEach(texture => texture.dispose())
      lut.dispose()
      material.onBeforeCompile = () => {}
      material.needsUpdate = true
    },
  }
}
