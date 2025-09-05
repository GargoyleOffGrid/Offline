// Build the text we encode in QR labels
export function makeItemLabelText(item) {
    const p = new URLSearchParams()
    if (item.name) p.set('name', item.name)
    if (item.location) p.set('loc', item.location)
    if (item.par != null) p.set('par', String(item.par))
    return `gog://item?${p.toString()}`
  }
  
  // Parse a scanned QR string back into fields
  export function parseItemLabelText(txt) {
    try {
      if (!txt.startsWith('gog://item?')) return null
      const qs = txt.split('?')[1] || ''
      const p = new URLSearchParams(qs)
      return {
        name: p.get('name') || '',
        location: p.get('loc') || '',
        par: p.get('par') ? Number(p.get('par')) : undefined,
      }
    } catch { return null }
  }