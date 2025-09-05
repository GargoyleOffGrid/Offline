import { db } from '../db'

// add more tables here if you create them later
async function dump() {
  return {
    items: await db.items.toArray()
  }
}

export async function exportAll() {
  const data = await dump()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'gargoyle-offline-export.json'
  a.click()
  URL.revokeObjectURL(url)
}

export async function importAll(file) {
  const text = await file.text()
  const data = JSON.parse(text)
  if (Array.isArray(data.items)) await db.items.bulkPut(data.items)
}