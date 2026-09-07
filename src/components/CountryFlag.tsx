import type { Country } from '../types'

/** Keep SVG proportions and use the existing high-resolution PNG only on failure. */
export function flagFallback(image: HTMLImageElement, country: Country) {
  if (!image.dataset.fallback) {
    image.dataset.fallback = 'png'
    image.src = country.flagPng
  } else if (image.dataset.fallback === 'png') {
    image.dataset.fallback = 'code'
    image.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="64"><rect width="96" height="64" rx="4" fill="#1e293b"/><text x="48" y="41" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#e2e8f0">${country.cca2}</text></svg>`)}`
  }
}

export default function CountryFlag({ country, alt = '', className = '' }: { country: Country; alt?: string; className?: string }) {
  return <img key={country.cca2} src={country.flagSvg} alt={alt} decoding="async" className={`object-contain ${className}`} onError={e => flagFallback(e.currentTarget, country)} />
}
