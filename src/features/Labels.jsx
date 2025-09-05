import { useEffect, useMemo, useState } from 'react'
import { db } from '../db'
import QRCode from 'qrcode'
import { makeItemLabelText } from '../utils/labels'

const SIZES = {
  '2x4in (10/page)': { wIn: 4, hIn: 2, cols: 2, rows: 5, gapIn: 0.15, marginIn: 0.5 }, // Avery 5163-ish
  '2x2in (12/page)': { wIn: 2, hIn: 2, cols: 3, rows: 4, gapIn: 0.25, marginIn: 0.5 },
  '3x3in (6/page)':  { wIn: 3, hIn: 3, cols: 2, rows: 3, gapIn: 0.25, marginIn: 0.5 },
}

export default function Labels(){
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [chosen, setChosen] = useState([]) // item ids
  const [sizeKey, setSizeKey] = useState('2x4in (10/page)')
  const [previews, setPreviews] = useState({}) // id -> dataUrl

  useEffect(()=>{ (async()=> setItems(await db.items.orderBy('name').toArray()))() },[])

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase()
    if(!q) return items
    return items.filter(i =>
      (i.name||'').toLowerCase().includes(q) ||
      (i.location||'').toLowerCase().includes(q) ||
      (i.category||'').toLowerCase().includes(q)
    )
  },[items, query])

  const toggle = (id) =>
    setChosen(sel => sel.includes(id) ? sel.filter(x=>x!==id) : [...sel,id])

  const selectAll = () => setChosen(filtered.map(i=>i.id))
  const clearAll  = () => setChosen([])

  // Generate QR previews for selected items
  useEffect(()=>{ (async()=>{
    const next = {}
    for(const id of chosen){
      const it = items.find(x=>x.id===id)
      if(!it) continue
      const txt = makeItemLabelText(it)
      next[id] = await QRCode.toDataURL(txt, { margin: 1, width: 512 })
    }
    setPreviews(next)
  })() },[chosen, items])

  // Print layout window
  const printSheet = () => {
    const cfg = SIZES[sizeKey]
    const px = (inches)=> inches*96 // 96dpi CSS pixels

    const cells = chosen.map(id => {
      const it = items.find(x=>x.id===id)
      const img = previews[id] || ''
      const title = (it?.name || '').replace(/</g,'&lt;')
      const loc = (it?.location || '').replace(/</g,'&lt;')
      return `<div class="cell">
        <img src="${img}" />
        <div class="text">
          <div class="name">${title}</div>
          <div class="loc">${loc}</div>
        </div>
      </div>`
    }).join('')

    const html = `
<!doctype html><html><head><meta charset="utf-8">
<title>Labels</title>
<style>
  :root{
    --W:${px(cfg.wIn)}px; --H:${px(cfg.hIn)}px;
    --M:${px(cfg.marginIn)}px; --G:${px(cfg.gapIn)}px;
  }
  @page { margin: ${cfg.marginIn}in; }
  body{ margin:0; font-family:system-ui,sans-serif; background:#fff; color:#000; }
  .sheet{
    display:grid;
    grid-template-columns: repeat(${cfg.cols}, var(--W));
    grid-auto-rows: var(--H);
    gap: var(--G);
    padding: var(--M);
    box-sizing:border-box;
  }
  .cell{
    border:1px solid #ccc; border-radius:8px;
    padding:6px; display:flex; align-items:center; gap:8px;
  }
  .cell img{ width:${px(cfg.hIn*0.9)}px; height:${px(cfg.hIn*0.9)}px; object-fit:contain }
  .text{ display:flex; flex-direction:column; gap:4px; overflow:hidden }
  .name{ font-weight:700; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
  .loc{ font-size:12px; color:#444; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
  @media print{
    .cell{ border-color:transparent }
  }
</style>
</head><body>
  <div class="sheet">
    ${cells}
  </div>
  <script>window.print();</script>
</body></html>`
    const w = window.open('', '_blank')
    w.document.write(html); w.document.close()
  }

  return (
    <div className="card">
      <h2>QR Labels</h2>

      <div style={{display:'grid', gap:8, gridTemplateColumns:'2fr 1fr 1fr'}}>
        <input placeholder="Filter by name/location/category…" value={query} onChange={e=>setQuery(e.target.value)} />
        <select value={sizeKey} onChange={e=>setSizeKey(e.target.value)}>
          {Object.keys(SIZES).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <div style={{display:'flex', gap:8}}>
          <button onClick={selectAll}>Select All</button>
          <button onClick={clearAll}>Clear</button>
        </div>
      </div>

      <table className="table" style={{marginTop:8}}>
        <thead><tr><th></th><th>Name</th><th>PAR</th><th>Location</th><th>Preview</th></tr></thead>
        <tbody>
          {filtered.map(i => (
            <tr key={i.id}>
              <td><input type="checkbox" checked={chosen.includes(i.id)} onChange={()=>toggle(i.id)} /></td>
              <td>{i.name}</td>
              <td>{i.par}</td>
              <td>{i.location}</td>
              <td>
                {chosen.includes(i.id) ? (
                  previews[i.id] ? <img src={previews[i.id]} alt="qr" style={{width:48,height:48}}/> : '…'
                ) : <span className="muted">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{marginTop:8}}>
        <button disabled={!chosen.length} onClick={printSheet}>
          Print {chosen.length || ''} label{chosen.length===1?'':'s'}
        </button>
        <span className="muted" style={{marginLeft:8}}>
          Layout targets {sizeKey}. Tweak in code if your sheet differs.
        </span>
      </div>
    </div>
  )
}