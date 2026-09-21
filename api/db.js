import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  const { table, action, data, key } = req.method === 'GET'
    ? req.query
    : req.body

  try {
    // GET — buscar valor por chave
    if (req.method === 'GET') {
      const { data: rows, error } = await supabase
        .from('store')
        .select('value')
        .eq('key', key)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return res.status(200).json({ value: rows?.value ?? null })
    }

    // POST — salvar/atualizar valor
    if (req.method === 'POST') {
      const { error } = await supabase
        .from('store')
        .upsert({ key, value: data }, { onConflict: 'key' })

      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
