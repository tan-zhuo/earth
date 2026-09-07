import type { CSSProperties } from 'react'

const paths = {
  sun: 'M12 3V1m0 22v-2M3 12H1m22 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon: 'M20.5 14.3A8.8 8.8 0 0 1 9.7 3.5a8.8 8.8 0 1 0 10.8 10.8Z',
  earth: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
  solar: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 8c2 3-1 8-6 11S3 21 3 17 7 7 12 4s10-2 9 2M19 5h.01',
  galaxy: 'M12 12c-5-6-1-10 4-7 6 3 5 11-1 14-7 3-14-3-11-9 2-5 9-6 13-1 3 5-2 9-6 6-4-2-1-7 3-5',
  universe: 'm12 3 8 4v10l-8 4-8-4V7l8-4Zm0 0v9m0 9v-9m0 0 8-5m-8 5L4 7M4 17l8-5 8 5',
  layers: 'm12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5',
  mars: 'M18 13a7 7 0 1 1-14 0 7 7 0 0 1 14 0ZM16 8l5-5m-5 0h5v5',
  satellite: 'm9 8 7 7-3 3-7-7 3-3ZM4 3l4 4-3 3-4-4 3-3Zm14 11 4 4-3 3-4-4 3-3ZM14 4a6 6 0 0 1 6 6m-6-3a3 3 0 0 1 3 3M8 16l-3 3m-2-2 4 4',
  reset: 'M4 10a8 8 0 1 1 1 7M4 4v6h6',
  front: 'M5 4h14v16H5V4Zm4 4h6v8H9V8',
  top: 'm12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5',
  rotate: 'M4 8c3-6 13-6 16 0m0-5v5h-5M20 16c-3 6-13 6-16 0m0 5v-5h5',
  pin: 'M18 9c0 5-6 12-6 12S6 14 6 9a6 6 0 1 1 12 0ZM14 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  focus: 'M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
} as const
export type IconName = keyof typeof paths
export default function Icon({ name, size = 18, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0" style={style}><path d={paths[name]} /></svg>
}
