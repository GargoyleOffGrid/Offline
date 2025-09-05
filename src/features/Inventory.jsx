import { useEffect, useState } from 'react'
import { db } from '../db'
import Scanner from '../components/Scanner.jsx'
import QRCode from 'qrcode'
import { makeItemLabelText, parseItemLabelText } from '../utils/labels'

export default function Inventory(){
  const [items,setItems] = useState([])
  const [form,setForm] = useState({ name:'', qty:1, par:5, category:'Food', location:'Pantry', expiresOn:'' })
  const [showScan, setShowScan] = useState(false)

  // QR modal state
  const [qrFor, setQrFor] = useState(null)     // item object
  const [qrDataUrl, setQrDataUrl] = useState('')

  const load = async()=> setItems(await db.items.orderBy('name').toArray())
  useEffect(()=>{ load() },[])

  const add = async()=>{
    if(!form.name) return
    await db.items.add(form)
    setForm({ ...form, name:'', qty:1 })
    load()
  }
  const inc = async(id,delta)=>{ const it = await db.items.get(id); await db.items.update(id,{ qty: Math.max(0,(it.qty||0)+delta) }); load() }
  const del = async(id)=>{ await db.items.delete(id); load() }

  // --- Scanner: parse our custom label format if present
  const handleScan = txt => {
    setShowScan(false)
    const parsed = parseItemLabelText(txt)
    if (parsed) {
      setForm(f => ({
        ...f,
        name: parsed.name || f.name,
        location: parsed.location || f.location,
        par: parsed.par ?? f.par
      }))
    } else {
      setForm(f => ({ ...f, name: f.name || txt }))
    }
  }

  // --- QR label generator
  const showQr = async (it) => {
    const text = makeItemLabelText(it)
    const url = await QRCode.toDataURL(text, { margin: 1, width: 256 })
    setQrFor(it)
    setQrDataUrl(url)
  }
  const closeQr = () => { setQrFor(null); setQrDataUrl('') }

  const printQr = () => {
    const title = (qrFor?.name || 'Label').replace(/</g,'&lt;')
    const html = `
<!doctype html><html><head><meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: 2in 2in; margin: 0; }   /* tweak for your label paper */
  body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; }
  .label { display:flex; flex-direction:column; align-items:center; gap:6px; font-family:system-ui,sans-serif; }
  img { width:1.6in; height:1.6in; }
  h3 { margin:0; font-size:12pt; }
  small { color:#555 }
</style>
</head><body>
  <div class="label">
    <img src="${qrDataUrl}" />
    <h3>${title}</h3>
    <small>${qrFor?.location || ''}</small>
  </div>
  <script>window.print(); setTimeout(()=>window.close(), 300);</script>
</body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
  }

  const lowStock = items.filter(i => (i.par||0) > (i.qty||0))

  return (
    <div style={{display:'grid', gap:12}}>
      <div className="card">
        <h2>Add Item</h2>
        <div style={{display:'grid', gap:8, gridTemplateColumns:'2fr 1fr 1fr 1fr'}}>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input type="number" min="0" placeholder="Qty" value={form.qty} onChange={e=>setForm({...form,qty:+e.target.value})} />
          <input type="number" min="0" placeholder="PAR" value={form.par} onChange={e=>setForm({...form,par:+e.target.value})} />
          <button onClick={()=>setShowScan(true)}>Scan</button>
        </div>
        <div style={{display:'grid', gap:8, gridTemplateColumns:'1fr 1fr 1fr'}}>
          <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
          <input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
          <input type="date" value={form.expiresOn} onChange={e=>setForm({...form,expiresOn:e.target.value})} />
        </div>
        <div style={{marginTop:8}}>
          <button onClick={add}>Add</button>
        </div>
        {showScan && (
          <div className="card" style={{marginTop:8}}>
            <Scanner onScan={handleScan} />
            <div style={{marginTop:8}}><button onClick={()=>setShowScan(false)}>Close</button></div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Inventory</h2>
        <table className="table">
          <thead><tr><th>Name</th><th>Qty</th><th>PAR</th><th>Where</th><th>Expires</th><th></th></tr></thead>
          <tbody>
            {items.map(i=> (
              <tr key={i.id}>
                <td>{i.name}</td>
                <td>{i.qty}</td>
                <td>{i.par}</td>
                <td>{i.location}</td>
                <td>{i.expiresOn||''}</td>
                <td>
                  <button onClick={()=>inc(i.id, 1)}>+1</button>
                  <button onClick={()=>inc(i.id,-1)}>-1</button>
                  <button onClick={()=>showQr(i)}>QR</button>
                  <button onClick={()=>del(i.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {qrFor && (
        <div className="card">
          <h3>QR Label — {qrFor.name}</h3>
          <img src={qrDataUrl} alt="QR" style={{width:160, height:160}} />
          <div style={{marginTop:8, display:'flex', gap:8}}>
            <button onClick={printQr}>Print Label</button>
            <button onClick={closeQr}>Close</button>
          </div>
          <p className="muted">This QR encodes: <code>{makeItemLabelText(qrFor)}</code></p>
          <p className="muted">Tip: stick labels on bins/shelves. Use “Scan” to auto-fill name/location/PAR.</p>
        </div>
      )}

      <div className="card">
        <h2>Shopping List (PAR gaps)</h2>
        <ul>
          {lowStock.length===0 && <li>All stocked ✅</li>}
          {lowStock.map(i=> (<li key={i.id}>{i.name}: buy {Math.max(0,(i.par||0)-(i.qty||0))}</li>))}
        </ul>
      </div>
    </div>
  )
}