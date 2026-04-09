import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Geocoding not configured' }, { status: 500 })
  }

  const { address } = await request.json()
  if (!address || typeof address !== 'string') {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', address)
  url.searchParams.set('region', 'nl')
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  const data = await res.json()

  if (data.status !== 'OK' || !data.results?.length) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }

  const { lat, lng } = data.results[0].geometry.location
  return NextResponse.json({ latitude: lat, longitude: lng })
}
