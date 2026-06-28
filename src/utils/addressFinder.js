const AF_KEY = import.meta.env.VITE_ADDRESSFINDER_KEY

export const addressFinderEnabled = !!AF_KEY

export async function searchAddresses(query) {
  if (!AF_KEY || query.length < 3) return []
  try {
    const url = `https://api.addressfinder.io/api/nz/address/autocomplete/?key=${AF_KEY}&q=${encodeURIComponent(query)}&format=json&max=8`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.completions || []
  } catch {
    return []
  }
}

export async function getAddressDetail(pxid) {
  if (!AF_KEY) return null
  try {
    const url = `https://api.addressfinder.io/api/nz/address/info/?key=${AF_KEY}&pxid=${encodeURIComponent(pxid)}&format=json`
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/** Extract the structured fields we need from an AddressFinder info response */
export function parseAddressDetail(detail) {
  if (!detail) return null
  return {
    streetAddress: detail.address_line_1 || detail.street || '',
    suburb:        detail.suburb          || detail.locality_name || '',
    city:          detail.city            || detail.locality      || '',
    postcode:      detail.postcode        || '',
  }
}
