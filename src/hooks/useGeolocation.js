import { useState, useCallback } from 'react'
import { getCoordinatesFromZip } from '@/utils/helpers'

export function useGeolocation() {
  const [coords, setCoords]   = useState(null)
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setError(null)
        setLoading(false)
      },
      () => {
        setError('Unable to retrieve your location')
        setLoading(false)
      }
    )
  }, [])

  const lookupZip = useCallback(async (zip) => {
    setLoading(true)
    setError(null)
    const result = await getCoordinatesFromZip(zip)
    if (result) {
      setCoords(result)
    } else {
      setError('ZIP code not found')
    }
    setLoading(false)
    return result
  }, [])

  return { coords, error, loading, detectLocation, lookupZip }
}
