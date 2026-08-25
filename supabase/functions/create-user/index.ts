import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })

  const url = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })
  const { data: { user: caller }, error: callerError } = await userClient.auth.getUser()
  if (callerError || !caller) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })

  const { data: profile } = await userClient.from('profiles').select('role').eq('user_id', caller.id).single()
  if (profile?.role !== 'admin') return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } })

  const body = await req.json()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const full_name = String(body.full_name || '').trim()
  const role = body.role === 'admin' ? 'admin' : 'reviewer'
  if (!email || password.length < 8 || !full_name) return new Response(JSON.stringify({ error: 'Name, valid email and password of at least 8 characters are required' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

  const adminClient = createClient(url, serviceKey)
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({ email, password, email_confirm: true })
  if (createError) return new Response(JSON.stringify({ error: createError.message }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })

  const { error: profileError } = await adminClient.from('profiles').upsert({ user_id: created.user.id, full_name, role, updated_at: new Date().toISOString() })
  if (profileError) {
    await adminClient.auth.admin.deleteUser(created.user.id)
    return new Response(JSON.stringify({ error: profileError.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }

  await adminClient.from('audit_logs').insert({ user_id: caller.id, action: 'create', entity_type: 'profile', entity_id: created.user.id, details: { email, full_name, role } })
  return new Response(JSON.stringify({ id: created.user.id, email, full_name, role }), { status: 201, headers: { ...cors, 'Content-Type': 'application/json' } })
})
