import { useEffect, useState } from 'react'
import YAML from 'js-yaml'

export default function Checklists(){
  const [lists,setLists] = useState([])
  const [progress, setProgress] = useState({}) // key: `${id}|${label}` -> boolean

  useEffect(()=>{ (async()=>{
    try {
      const txt = await (await fetch('/content/checklists.yaml')).text()
      const data = YAML.load(txt)
      setLists(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load checklists:', e)
    }
  })() },[])

  const toggle = (cid, label) =>
    setProgress(p => ({ ...p, [`${cid}|${label}`]: !p[`${cid}|${label}`] }))

  return (
    <div className="list">
      {lists.map(list => (
        <div className="card" key={list.id}>
          <h2>{list.title}</h2>
          <ul>
            {list.items.map((label, idx) => {
              const text = typeof label === 'string' ? label : label.label
              const key = `${list.id}|${text}`
              const critical = typeof label === 'object' && label.critical
              return (
                <li key={idx}>
                  <label style={{display:'flex', gap:8, alignItems:'center'}}>
                    <input
                      type="checkbox"
                      checked={!!progress[key]}
                      onChange={() => toggle(list.id, text)}
                    />
                    <span>{text}</span>
                    {critical && <em style={{color:'#f59e0b', marginLeft:8}}>(critical)</em>}
                  </label>
                </li>
              )
            })}
          </ul>
          <button onClick={()=>window.print()}>Print</button>
        </div>
      ))}
    </div>
  )
}