import React, { useState } from 'react'
import Issue from './pages/Issue'
import Verify from './pages/Verify'

export default function App() {
  const [tab, setTab] = useState<'issue' | 'verify'>('issue')
  return (
    <div style={{ fontFamily: 'sans-serif', margin: '2rem auto', maxWidth: 800 }}>
      <h1>Kube Credential</h1>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setTab('issue')} disabled={tab==='issue'}>Issuance</button>
        <button onClick={() => setTab('verify')} disabled={tab==='verify'}>Verification</button>
      </div>
      <div style={{ marginTop: 24 }}>
        {tab === 'issue' ? <Issue /> : <Verify />}
      </div>
    </div>
  )
}
