import { formatDistanceToNow, format, isPast } from 'date-fns'

export function timeAgo(date) {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  return format(d, fmt)
}

export function isExpired(date) {
  if (!date) return false
  const d = date?.toDate ? date.toDate() : new Date(date)
  return isPast(d)
}

export function degreesToRadians(deg) {
  return deg * (Math.PI / 180)
}

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8 // Earth radius in miles
  const dLat = degreesToRadians(lat2 - lat1)
  const dLng = degreesToRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function getCoordinatesFromZip(zip) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch {
    // silently fail — caller handles null
  }
  return null
}

export function getBoundingBox(lat, lng, radiusMiles) {
  const latDelta = radiusMiles / 69
  const lngDelta = radiusMiles / (69 * Math.cos(degreesToRadians(lat)))
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  }
}

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatSalary(min, max, period = 'year') {
  const fmt = (n) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
  if (!min && !max) return 'Unpaid / Volunteer'
  if (min && max) return `${fmt(min)}–${fmt(max)} / ${period}`
  if (min) return `${fmt(min)}+ / ${period}`
  return `Up to ${fmt(max)} / ${period}`
}
