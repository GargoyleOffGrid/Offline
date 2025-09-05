import { useState, useRef } from 'react'
import Inventory from './features/Inventory.jsx'
import Checklists from './features/Checklists.jsx'
import { exportAll, importAll } from './utils/exportImport.js'
import './style.css'

const TABS = ['Inventory', 'Checklists', 'Library', 'Maps', 'Power']

export default function App() {
  const [tab, setTab] = useState('Inventory')
  const fileRef = useRef(null)

  return (
    <div className="container">
      <header>
        <h1>Offline</h1>
        <nav>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={t === tab ? 'active' : ''}
            >
              {t}
            </button>
          ))}
          <button onClick={() => window.print()} className="secondary">Print</button>
          <button onClick={exportAll} className="secondary">Export</button>
          <button onClick={() => fileRef.current?.click()} className="secondary">Import</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={async e => {
              const f = e.target.files?.[0]
              if (f) await importAll(f)
              e.target.value = ''
            }}
          />
        </nav>
      </header>

      <main>
        {tab === 'Inventory' && <Inventory />}
        {tab === 'Checklists' && <Checklists />}
        {tab !== 'Inventory' && tab !== 'Checklists' && (
          <>
            <h2>{tab}</h2>
            <p>Feature coming soon…</p>
          </>
        )}
      </main>
    </div>
  )
}