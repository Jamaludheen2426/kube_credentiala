import React, { useState } from 'react'
import { ISSUANCE_API } from '../api'

export default function Issue() {
  const [jsonText, setJsonText] = useState(`{
  "name": "Alice",
  "role": "admin"
}`)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async () => {
    setError(null)
    setResult(null)
    let payload: any
    try {
      payload = JSON.parse(jsonText)
      if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) throw new Error('Object required')
    } catch (e: any) {
      setError('Invalid JSON object')
      return
    }
    setLoading(true)
    try {
      const r = await fetch(`${ISSUANCE_API}/issue`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const body = await r.json()
      if (!r.ok && body?.error) throw new Error(body.error)
      setResult(body)
    } catch (e: any) {
      setError(e.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p>Enter a credential JSON object to issue.</p>
      <textarea style={{ width: '100%', height: 160 }} value={jsonText} onChange={e => setJsonText(e.target.value)} />
      <div style={{ marginTop: 12 }}>
        <button onClick={onSubmit} disabled={loading}>{loading ? 'Issuing...' : 'Issue credential'}</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <pre style={{ background: '#f6f8fa', padding: 12, marginTop: 12 }}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  )
}
