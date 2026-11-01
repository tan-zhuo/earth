/**
 * 地球真实感：
 *   - 昼夜光照：给地球材质注入夜景灯光（只在背光面亮起，晨昏线处平滑过渡）
 *   - 海面反光：海陆掩码做高光贴图，只有海洋会反射太阳
 *   - 云层：略高于地表的半透明球壳，缓慢漂移，贴近地表时淡出不挡地名
 *   - 太阳方位：按当前 UTC 时间计算太阳直射点
 *
 * 与地形着色器一样只改注 Phong 着色器，不替换 globe.gl 的材质。
 */
import {
  Color, Mesh, MeshPhongMaterial, SphereGeometry, SRGBColorSpace, TextureLoader, Vector3,
} from 'three'
import type { Texture } from 'three'

const NIGHT_TEXTURE = '/textures/earth-night.jpg'
const WATER_TEXTURE = '/textures/earth-water.jpg'
const CLOUDS_TEXTURE = '/textures/earth-clouds.jpg'
/** 云层高度（地球半径 100 的世界单位）：高于默认垂直夸张下的最高山峰 */
const CLOUD_RADIUS = 102.2

const VERT_PARS = /* glsl */ `
varying vec3 vEarthNormal;
`
const VERT_BODY = /* glsl */ `
vEarthNormal = normalize(mat3(modelMatrix) * objectNormal);
`
const FRAG_PARS = /* glsl */ `
uniform sampler2D tNightLights;
uniform vec3 uSunDir;      // 世界坐标下指向太阳的单位向量
uniform float uNight;      // 夜景灯光强度（0 = 关）
varying vec3 vEarthNormal;
`
const FRAG_BODY = /* glsl */ `
if (uNight > 0.0) {
  float sun = dot(normalize(vEarthNormal), uSunDir);
  // 晨昏线两侧约 6° 内渐变：城市灯光在黄昏时逐渐亮起
  float dark = 1.0 - smoothstep(-0.12, 0.08, sun);
  vec3 lights = texture2D(tNightLights, vMapUv).rgb;
  // 轻微提高对比：郊区的弥散光压暗，城市核心保持亮
  totalEmissiveRadiance += pow(lights, vec3(1.3)) * dark * uNight * 2.6;
}
`

/** 太阳直射点（纬度/经度，度），精度约 0.5°，足够画晨昏线 */
export function subsolarPoint(date = new Date()): { lat: number; lng: number } {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const day = (date.getTime() - start) / 86_400_000
  const lat = -23.44 * Math.cos(((2 * Math.PI) / 365) * (day + 10))
  // 均时差（分钟）：真太阳时与平太阳时之差
  const b = ((2 * Math.PI) / 364) * (day - 81)
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  let lng = -15 * (utcHours - 12 + eot / 60)
  lng = ((lng + 540) % 360) - 180
  return { lat, lng }
}

export interface EarthLighting {
  /** 夜景灯光强度 0~1，以及太阳方向（世界坐标） */
  setNight(strength: number, sunDir?: Vector3): void
  /** 海面高光：0 = 关 */
  setOceanGloss(on: boolean): void
  /** 云层不透明度（0 = 隐藏）；每帧可调 */
  setCloudOpacity(opacity: number): void
  /** 云层随时间缓慢漂移 */
  tick(deltaSeconds: number): void
  /** 当前云层不透明度（用于判断是否需要每帧更新） */
  readonly cloudOpacity: number
  dispose(): void
}

export function attachEarthLighting(
  material: MeshPhongMaterial,
  globeMesh: Mesh,
  onTexture: (texture: Texture) => void,
): EarthLighting {
  const loader = new TextureLoader()
  const owned: Texture[] = []
  let disposed = false
  const load = async (url: string, color: boolean) => {
    const tex = await loader.loadAsync(url)
    if (disposed) { tex.dispose(); return null }
    if (color) tex.colorSpace = SRGBColorSpace
    owned.push(tex)
    onTexture(tex)
    return tex
  }

  const uniforms = {
    tNightLights: { value: null as Texture | null },
    uSunDir: { value: new Vector3(1, 0, 0) },
    uNight: { value: 0 },
  }
  let nightWanted = 0
  const applyNight = () => {
    uniforms.uNight.value = uniforms.tNightLights.value ? nightWanted : 0
  }

  const previous = material.onBeforeCompile
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer)
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERT_PARS}`)
      .replace('#include <defaultnormal_vertex>', `#include <defaultnormal_vertex>\n${VERT_BODY}`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAG_PARS}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${FRAG_BODY}`)
  }
  material.needsUpdate = true

  /* ---- 海面高光 ---- */
  let water: Texture | null = null
  let glossWanted = false
  const applyGloss = () => {
    const on = glossWanted && !!water
    material.specularMap = on ? water : null
    material.specular = new Color(on ? '#4a6a8a' : '#000000')
    material.shininess = on ? 22 : 0
    material.needsUpdate = true
  }
  void load(WATER_TEXTURE, false).then((tex) => {
    water = tex
    applyGloss()
  }).catch((err) => console.error('海陆掩码加载失败', err))

  /* ---- 云层 ---- */
  const cloudMaterial = new MeshPhongMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0,
    depthWrite: false,
    shininess: 0,
  })
  const clouds = new Mesh(new SphereGeometry(CLOUD_RADIUS, 96, 48), cloudMaterial)
  clouds.raycast = () => {} // 云层不参与拾取，点击穿透到国家
  clouds.visible = false
  clouds.renderOrder = 2
  // three-globe 把球面转了 -90° 让本初子午线朝 Z 轴，云层跟随地球网格的朝向
  clouds.rotation.copy(globeMesh.rotation)
  globeMesh.parent?.add(clouds)
  let cloudOpacity = 0
  let cloudsRequested = false
  const ensureClouds = () => {
    if (cloudsRequested) return
    cloudsRequested = true
    void load(CLOUDS_TEXTURE, false).then((tex) => {
      if (!tex) return
      cloudMaterial.alphaMap = tex
      cloudMaterial.needsUpdate = true
      clouds.visible = cloudOpacity > 0
    }).catch((err) => console.error('云层贴图加载失败', err))
  }

  return {
    setNight(strength, sunDir) {
      nightWanted = strength
      if (sunDir) uniforms.uSunDir.value.copy(sunDir).normalize()
      if (strength > 0 && !uniforms.tNightLights.value) {
        void load(NIGHT_TEXTURE, true).then((tex) => {
          if (!tex) return
          uniforms.tNightLights.value = tex
          applyNight()
        }).catch((err) => console.error('夜景灯光加载失败', err))
      }
      applyNight()
    },
    setOceanGloss(on) {
      glossWanted = on
      applyGloss()
    },
    setCloudOpacity(opacity) {
      if (opacity > 0) ensureClouds()
      cloudOpacity = opacity
      cloudMaterial.opacity = opacity
      clouds.visible = opacity > 0.01 && !!cloudMaterial.alphaMap
    },
    tick(dt) {
      if (clouds.visible) clouds.rotation.y += dt * 0.0012
    },
    get cloudOpacity() {
      return cloudOpacity
    },
    dispose() {
      disposed = true
      clouds.parent?.remove(clouds)
      clouds.geometry.dispose()
      cloudMaterial.dispose()
      owned.forEach((t) => t.dispose())
      material.onBeforeCompile = previous
      material.specularMap = null
      material.needsUpdate = true
    },
  }
}
