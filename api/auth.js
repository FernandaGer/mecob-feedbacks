const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action, email, password, token } = req.body

  try {
    // LOGIN
    if (action === 'login') {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('active', true)
        .single()

      if (error || !user) return res.status(401).json({ error: 'Email ou senha incorretos' })

      const valid = await bcrypt.compare(password, user.password_hash)
      if (!valid) return res.status(401).json({ error: 'Email ou senha incorretos' })

      // Cria sessao
      const sessionToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

      await supabase.from('sessions').insert({
        token: sessionToken,
        user_id: user.id,
        expires_at: expiresAt.toISOString()
      })

      return res.status(200).json({
        token: sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          leader_id: user.leader_id
        }
      })
    }

    // VERIFICAR SESSAO
    if (action === 'verify') {
      if (!token) return res.status(401).json({ error: 'Token ausente' })

      const { data: session, error } = await supabase
        .from('sessions')
        .select('*, users(*)')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !session) return res.status(401).json({ error: 'Sessao invalida' })

      const user = session.users
      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          leader_id: user.leader_id
        }
      })
    }

    // LOGOUT
    if (action === 'logout') {
      if (token) await supabase.from('sessions').delete().eq('token', token)
      return res.status(200).json({ ok: true })
    }

    // CRIAR USUARIO (so admin)
    if (action === 'create_user') {
      const { newEmail, newPassword, newName, newRole, newLeaderId } = req.body
      const hash = await bcrypt.hash(newPassword, 10)
      const { error } = await supabase.from('users').insert({
        email: newEmail.toLowerCase().trim(),
        password_hash: hash,
        name: newName,
        role: newRole || 'employee',
        leader_id: newLeaderId || null
      })
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    // LISTAR USUARIOS (so admin)
    if (action === 'list_users') {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role, leader_id, active, created_at')
        .order('name')
      if (error) throw error
      return res.status(200).json({ users: data })
    }

    // TOGGLE ATIVO
    if (action === 'toggle_active') {
      const { userId, active } = req.body
      const { error } = await supabase
        .from('users')
        .update({ active })
        .eq('id', userId)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    // ALTERAR SENHA
    if (action === 'change_password') {
      const { userId, newPassword } = req.body
      const hash = await bcrypt.hash(newPassword, 10)
      const { error } = await supabase
        .from('users')
        .update({ password_hash: hash })
        .eq('id', userId)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'Action invalida' })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
