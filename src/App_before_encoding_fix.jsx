import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const menuItems = [
  { id: 'dashboard', title: 'Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©', icon: 'âŒ‚', roles: ['admin', 'invoice_entry'] },
  { id: 'employees', title: 'Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†', icon: 'ðŸ‘¥', roles: ['admin'] },
  { id: 'vacations', title: 'Ø§Ù„Ø¥Ø¬Ø§Ø²Ø§Øª', icon: 'ðŸ“…', roles: ['admin'] },
  { id: 'salaries', title: 'Ø§Ù„Ù…Ø±ØªØ¨Ø§Øª', icon: 'ðŸ’°', roles: ['admin'] },
  { id: 'advances', title: 'Ø§Ù„Ø³Ù„Ù', icon: 'ðŸ’µ', roles: ['admin'] },
  { id: 'purchases', title: 'Ø§Ù„Ù…Ø´ØªØ±ÙŠØ§Øª', icon: 'ðŸ›’', roles: ['admin'] },
  { id: 'custody', title: 'Ø§Ù„Ø¹Ù‡Ø¯Ø©', icon: 'ðŸ“¦', roles: ['admin'] },
  { id: 'invoices', title: 'Ø§Ù„ÙÙˆØ§ØªÙŠØ±', icon: 'ðŸ§¾', roles: ['admin', 'invoice_entry'] },
  { id: 'collections', title: 'Ø§Ù„Ø´ÙŠÙƒØ§Øª ÙˆØ§Ù„ØªØ­ÙˆÙŠÙ„Ø§Øª', icon: 'ðŸ¦', roles: ['admin'] },
  { id: 'reports', title: 'Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±', icon: 'ðŸ“Š', roles: ['admin'] },
]

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  useEffect(() => {
    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)

      if (newSession) {
        loadProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setSession(session)

    if (session) {
      await loadProfile(session.user.id)
    }

    setLoading(false)
  }

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, role')
      .eq('id', userId)
      .single()

    if (!error) {
      setProfile(data)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  function openPage(id) {
    setActivePage(id)
    setMenuOpen(false)
  }

  const role = profile?.role || 'invoice_entry'

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(role)
  )

  if (loading) {
    return (
      <div dir="rtl" style={styles.loading}>
        Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„...
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <div dir="rtl" style={styles.app}>
      <header style={styles.header}>
        <button
          style={styles.menuButton}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          â˜°
        </button>

        <img src="/images/logo.png" alt="Electropower" style={{height:"48px",width:"48px",objectFit:"contain",marginLeft:"10px"}} />
        <div style={styles.headerTitle}>
          <div style={styles.companyName}>
            Ø´Ø±ÙƒØ© Ø§Ù„ÙƒØªØ±ÙˆØ¨Ø§ÙˆØ± Ù„Ù„Ù…Ù‚Ø§ÙˆÙ„Ø§Øª
          </div>
          <div style={styles.companySub}>
            Ø´Ø±ÙƒØ© Ø§Ù„ÙƒØªØ±ÙˆØ¨Ø§ÙˆØ± - ØµÙŠØ§Ù†Ø© Ø¨Ù†ÙˆÙƒ
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          style={styles.overlay}
          onClick={() => setMenuOpen(false)}
        >
          <aside
            style={styles.sidebar}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.sidebarHeader}>
              <div style={styles.logoBox}>EP</div>

              <div>
                <div style={styles.sidebarCompany}>
                  Ø´Ø±ÙƒØ© Ø§Ù„ÙƒØªØ±ÙˆØ¨Ø§ÙˆØ±
                </div>
                <div style={styles.sidebarSub}>
                  ØµÙŠØ§Ù†Ø© Ø¨Ù†ÙˆÙƒ
                </div>
              </div>
            </div>

            <div style={styles.userBox}>
              <strong>
                {profile?.display_name || 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…'}
              </strong>

              <span>
                {role === 'admin'
                  ? 'Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…'
                  : 'Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„ÙÙˆØ§ØªÙŠØ±'}
              </span>
            </div>

            <div style={styles.menuList}>
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  style={{
                    ...styles.menuItem,
                    ...(activePage === item.id
                      ? styles.menuItemActive
                      : {}),
                  }}
                  onClick={() => openPage(item.id)}
                >
                  <span style={styles.menuIcon}>
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </button>
              ))}
            </div>

            <button
              style={styles.logoutButton}
              onClick={logout}
            >
              ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬
            </button>
          </aside>
        </div>
      )}

      <main style={styles.main}>
        <div style={styles.welcomeCard}>
          <div>
            <div style={styles.welcomeTitle}>
              Ù…Ø±Ø­Ø¨Ù‹Ø§ {profile?.display_name || 'Ø¨Ùƒ'}
            </div>

            <div style={styles.welcomeText}>
              {role === 'admin'
                ? 'Ø£Ù†Øª ØªØ³ØªØ®Ø¯Ù… Ø­Ø³Ø§Ø¨ Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…'
                : 'Ø£Ù†Øª ØªØ³ØªØ®Ø¯Ù… ØµÙ„Ø§Ø­ÙŠØ© Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„ÙÙˆØ§ØªÙŠØ±'}
            </div>
          </div>

          <div style={styles.userCircle}>ðŸ‘¤</div>
        </div>

        <h2 style={styles.sectionTitle}>
          {getPageTitle(activePage)}
        </h2>

        {activePage === 'dashboard' && (
          <div style={styles.cards}>
            {visibleItems
              .filter((item) => item.id !== 'dashboard')
              .map((item) => (
                <button
                  key={item.id}
                  style={styles.card}
                  onClick={() => openPage(item.id)}
                >
                  <div style={styles.cardIcon}>
                    {item.icon}
                  </div>
                  <div style={styles.cardTitle}>
                    {item.title}
                  </div>
                </button>
              ))}
          </div>
        )}

        {activePage === 'employees' && (
          <EmployeesPage session={session} />
        )}

        {activePage === 'vacations' && (
          <VacationsPage session={session} />
        )}

        {activePage === 'salaries' && (
          <SalariesPage session={session} />
        )}

        {activePage === 'advances' && (
          <AdvancesPage session={session} />
        )}

        {activePage === 'purchases' && (
          <PurchasesPage session={session} />
        )}

        {activePage === 'custody' && (
          <CustodyPage session={session} />
        )}

        {activePage === 'invoices' && (
          <InvoicesPage
            session={session}
            role={role}
          />
        )}

        {activePage === 'collections' && (
          <CollectionsPage session={session} />
        )}

        {activePage === 'reports' && (
          <ReportsPage />
        )}
      </main>
    </div>
  )
}

/* =========================================================
   Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†
========================================================= */

function EmployeesPage({ session }) {
  const empty = {
    name: '',
    phone: '',
    job_title: '',
    base_salary: '',
    notes: '',
  }

  const [form, setForm] = useState(empty)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setRows(data || [])

    setLoading(false)
  }

  function update(field, value) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }))
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!form.name.trim()) {
      setError('Ø§ÙƒØªØ¨ Ø§Ø³Ù… Ø§Ù„Ù…ÙˆØ¸Ù')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('employees')
      .insert({
        id: crypto.randomUUID(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        job_title: form.job_title.trim(),
        base_salary: Number(form.base_salary || 0),
        notes: form.notes.trim(),
        created_by: session.user.id,
      })

    if (error) {
      setError('Ù„Ù… ÙŠØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…ÙˆØ¸Ù: ' + error.message)
    } else {
      setMessage('ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…ÙˆØ¸Ù Ø¨Ù†Ø¬Ø§Ø­ âœ…')
      setForm(empty)
      await load()
    }

    setSaving(false)
  }

  async function remove(id) {
    if (!window.confirm('Ù‡Ù„ ØªØ±ÙŠØ¯ Ø­Ø°Ù Ø§Ù„Ù…ÙˆØ¸ÙØŸ')) return

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setMessage('ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…ÙˆØ¸Ù âœ…')
      await load()
    }
  }

  return (
    <div>
      <FormCard title="Ø¥Ø¶Ø§ÙØ© Ù…ÙˆØ¸Ù Ø¬Ø¯ÙŠØ¯">
        <form onSubmit={save}>
          <div style={styles.formGrid}>
            <Field
              label="Ø§Ø³Ù… Ø§Ù„Ù…ÙˆØ¸Ù"
              value={form.name}
              onChange={(v) => update('name', v)}
            />

            <Field
              label="Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ"
              value={form.phone}
              onChange={(v) => update('phone', v)}
            />

            <Field
              label="Ø§Ù„ÙˆØ¸ÙŠÙØ©"
              value={form.job_title}
              onChange={(v) => update('job_title', v)}
            />

            <Field
              label="Ø§Ù„Ù…Ø±ØªØ¨ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ"
              type="number"
              value={form.base_salary}
              onChange={(v) => update('base_salary', v)}
            />

            <Field
              label="Ù…Ù„Ø§Ø­Ø¸Ø§Øª"
              value={form.notes}
              onChange={(v) => update('notes', v)}
              full
            />
          </div>

          <Messages
            error={error}
            message={message}
          />

          <SaveButton loading={saving}>
            Ø­ÙØ¸ Ø§Ù„Ù…ÙˆØ¸Ù
          </SaveButton>
        </form>
      </FormCard>

      <ListCard
        title="Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ† Ø§Ù„Ù…Ø³Ø¬Ù„ÙŠÙ†"
        loading={loading}
        empty={!rows.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ø§Ù„Ù…ÙˆØ¸Ù</th>
              <th style={styles.th}>Ø§Ù„Ù‡Ø§ØªÙ</th>
              <th style={styles.th}>Ø§Ù„ÙˆØ¸ÙŠÙØ©</th>
              <th style={styles.th}>Ø§Ù„Ù…Ø±ØªØ¨</th>
              <th style={styles.th}>Ø¥Ø¬Ø±Ø§Ø¡</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={styles.td}>{row.name}</td>
                <td style={styles.td}>{row.phone || '-'}</td>
                <td style={styles.td}>
                  {row.job_title || '-'}
                </td>
                <td style={styles.td}>
                  {money(row.base_salary)}
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.deleteButton}
                    onClick={() => remove(row.id)}
                  >
                    Ø­Ø°Ù
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListCard>
    </div>
  )
}

/* =========================================================
   Ø§Ù„Ø¥Ø¬Ø§Ø²Ø§Øª
========================================================= */

function VacationsPage({ session }) {
  const [employees, setEmployees] = useState([])
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({
    employee_id: '',
    date_from: '',
    date_to: '',
    days: '',
    statement: '',
  })

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const [emp, vac] = await Promise.all([
      supabase
        .from('employees')
        .select('*')
        .order('name'),

      supabase
        .from('vacations')
        .select('*')
        .order('date_from', { ascending: false }),
    ])

    if (!emp.error) setEmployees(emp.data || [])
    if (!vac.error) setRows(vac.data || [])
  }

  function update(field, value) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }))
  }

  function calculateDays() {
    if (!form.date_from || !form.date_to) return

    const from = new Date(form.date_from)
    const to = new Date(form.date_to)

    const diff =
      Math.floor(
        (to - from) / (1000 * 60 * 60 * 24)
      ) + 1

    update('days', diff > 0 ? diff : 0)
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!form.employee_id) {
      setError('Ø§Ø®ØªØ± Ø§Ù„Ù…ÙˆØ¸Ù')
      return
    }

    if (!form.date_from || !form.date_to) {
      setError('Ø§Ø®ØªØ± ÙØªØ±Ø© Ø§Ù„Ø¥Ø¬Ø§Ø²Ø©')
      return
    }

    let days = Number(form.days)

    if (!days) {
      const from = new Date(form.date_from)
      const to = new Date(form.date_to)

      days =
        Math.floor(
          (to - from) / (1000 * 60 * 60 * 24)
        ) + 1
    }

    if (days <= 0) {
      setError('ØªØ£ÙƒØ¯ Ù…Ù† ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥Ø¬Ø§Ø²Ø©')
      return
    }

    const { error } = await supabase
      .from('vacations')
      .insert({
        id: crypto.randomUUID(),
        employee_id: form.employee_id,
        date_from: form.date_from,
        date_to: form.date_to,
        days,
        statement: form.statement.trim(),
        created_by: session.user.id,
      })

    if (error) {
      setError('Ù„Ù… ÙŠØªÙ… Ø­ÙØ¸ Ø§Ù„Ø¥Ø¬Ø§Ø²Ø©: ' + error.message)
    } else {
      setMessage('ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø¥Ø¬Ø§Ø²Ø© âœ…')

      setForm({
        employee_id: '',
        date_from: '',
        date_to: '',
        days: '',
        statement: '',
      })

      await load()
    }
  }

  async function remove(id) {
    if (!window.confirm('Ø­Ø°Ù Ø§Ù„Ø¥Ø¬Ø§Ø²Ø©ØŸ')) return

    const { error } = await supabase
      .from('vacations')
      .delete()
      .eq('id', id)

    if (error) setError(error.message)
    else {
      setMessage('ØªÙ… Ø§Ù„Ø­Ø°Ù âœ…')
      await load()
    }
  }

  const employeeName = (id) =>
    employees.find((e) => e.id === id)?.name || '-'

  return (
    <div>
      <FormCard title="ØªØ³Ø¬ÙŠÙ„ Ø¥Ø¬Ø§Ø²Ø©">
        <form onSubmit={save}>
          <div style={styles.formGrid}>
            <SelectField
              label="Ø§Ù„Ù…ÙˆØ¸Ù"
              value={form.employee_id}
              onChange={(v) =>
                update('employee_id', v)
              }
              options={employees.map((e) => ({
                value: e.id,
                label: e.name,
              }))}
            />

            <Field
              label="Ù…Ù†"
              type="date"
              value={form.date_from}
              onChange={(v) => {
                update('date_from', v)
              }}
            />

            <Field
              label="Ø¥Ù„Ù‰"
              type="date"
              value={form.date_to}
              onChange={(v) => {
                update('date_to', v)
              }}
            />

            <Field
              label="Ø¹Ø¯Ø¯ Ø§Ù„Ø£ÙŠØ§Ù…"
              type="number"
              value={form.days}
              onChange={(v) => update('days', v)}
            />

            <Field
              label="Ø§Ù„Ø¨ÙŠØ§Ù†"
              value={form.statement}
              onChange={(v) => update('statement', v)}
              full
            />
          </div>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={calculateDays}
          >
            Ø­Ø³Ø§Ø¨ Ø§Ù„Ø£ÙŠØ§Ù… Ù…Ù† Ø§Ù„ØªØ§Ø±ÙŠØ®
          </button>

          <Messages
            error={error}
            message={message}
          />

          <SaveButton>Ø­ÙØ¸ Ø§Ù„Ø¥Ø¬Ø§Ø²Ø©</SaveButton>
        </form>
      </FormCard>

      <ListCard
        title="Ø³Ø¬Ù„ Ø§Ù„Ø¥Ø¬Ø§Ø²Ø§Øª"
        loading={false}
        empty={!rows.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ø§Ù„Ù…ÙˆØ¸Ù</th>
              <th style={styles.th}>Ù…Ù†</th>
              <th style={styles.th}>Ø¥Ù„Ù‰</th>
              <th style={styles.th}>Ø§Ù„Ø£ÙŠØ§Ù…</th>
              <th style={styles.th}>Ø§Ù„Ø¨ÙŠØ§Ù†</th>
              <th style={styles.th}>Ø¥Ø¬Ø±Ø§Ø¡</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={styles.td}>
                  {employeeName(row.employee_id)}
                </td>
                <td style={styles.td}>
                  {row.date_from}
                </td>
                <td style={styles.td}>
                  {row.date_to}
                </td>
                <td style={styles.td}>
                  {row.days}
                </td>
                <td style={styles.td}>
                  {row.statement || '-'}
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.deleteButton}
                    onClick={() => remove(row.id)}
                  >
                    Ø­Ø°Ù
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListCard>
    </div>
  )
}

/* =========================================================
   Ø§Ù„Ø³Ù„Ù
========================================================= */

function AdvancesPage({ session }) {
  const [employees, setEmployees] = useState([])
  const [rows, setRows] = useState([])

  const [form, setForm] = useState({
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    installments: '1',
    statement: '',
  })

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const [emp, adv] = await Promise.all([
      supabase.from('employees').select('*').order('name'),
      supabase
        .from('advances')
        .select('*')
        .order('date', { ascending: false }),
    ])

    if (!emp.error) setEmployees(emp.data || [])
    if (!adv.error) setRows(adv.data || [])
  }

  function update(field, value) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }))
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const amount = Number(form.amount || 0)
    const installments = Math.max(
      1,
      Number(form.installments || 1)
    )

    if (!form.employee_id) {
      setError('Ø§Ø®ØªØ± Ø§Ù„Ù…ÙˆØ¸Ù')
      return
    }

    if (amount <= 0) {
      setError('Ø§ÙƒØªØ¨ Ù‚ÙŠÙ…Ø© Ø§Ù„Ø³Ù„ÙØ©')
      return
    }

    const installmentAmount = amount / installments

    const { error } = await supabase
      .from('advances')
      .insert({
        id: crypto.randomUUID(),
        employee_id: form.employee_id,
        date: form.date || null,
        amount,
        installments,
        installment_amount: installmentAmount,
        deducted_amount: 0,
        remaining_amount: amount,
        statement: form.statement.trim(),
        created_by: session.user.id,
      })

    if (error) {
      setError('Ù„Ù… ÙŠØªÙ… Ø­ÙØ¸ Ø§Ù„Ø³Ù„ÙØ©: ' + error.message)
    } else {
      setMessage(
        'ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø³Ù„ÙØ© ÙˆØ­Ø³Ø§Ø¨ Ù‚ÙŠÙ…Ø© Ø§Ù„Ù‚Ø³Ø· ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§ âœ…'
      )

      setForm({
        employee_id: '',
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        installments: '1',
        statement: '',
      })

      await load()
    }
  }

  async function remove(id) {
    if (!window.confirm('Ø­Ø°Ù Ø§Ù„Ø³Ù„ÙØ©ØŸ')) return

    const { error } = await supabase
      .from('advances')
      .delete()
      .eq('id', id)

    if (error) setError(error.message)
    else {
      setMessage('ØªÙ… Ø§Ù„Ø­Ø°Ù âœ…')
      await load()
    }
  }

  const employeeName = (id) =>
    employees.find((e) => e.id === id)?.name || '-'

  return (
    <div>
      <FormCard title="Ø¥Ø¶Ø§ÙØ© Ø³Ù„ÙØ©">
        <form onSubmit={save}>
          <div style={styles.formGrid}>
            <SelectField
              label="Ø§Ù„Ù…ÙˆØ¸Ù"
              value={form.employee_id}
              onChange={(v) =>
                update('employee_id', v)
              }
              options={employees.map((e) => ({
                value: e.id,
                label: e.name,
              }))}
            />

            <Field
              label="Ø§Ù„ØªØ§Ø±ÙŠØ®"
              type="date"
              value={form.date}
              onChange={(v) => update('date', v)}
            />

            <Field
              label="Ù‚ÙŠÙ…Ø© Ø§Ù„Ø³Ù„ÙØ©"
              type="number"
              value={form.amount}
              onChange={(v) => update('amount', v)}
            />

            <Field
              label="Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ù‚Ø³Ø§Ø·"
              type="number"
              min="1"
              value={form.installments}
              onChange={(v) =>
                update('installments', v)
              }
            />

            <Field
              label="Ø§Ù„Ø¨ÙŠØ§Ù†"
              value={form.statement}
              onChange={(v) => update('statement', v)}
              full
            />
          </div>

          {form.amount &&
            Number(form.installments) > 0 && (
              <div style={styles.infoBox}>
                Ù‚ÙŠÙ…Ø© Ø§Ù„Ù‚Ø³Ø·:
                {' '}
                <strong>
                  {money(
                    Number(form.amount) /
                      Number(form.installments)
                  )}
                </strong>
              </div>
            )}

          <Messages
            error={error}
            message={message}
          />

          <SaveButton>Ø­ÙØ¸ Ø§Ù„Ø³Ù„ÙØ©</SaveButton>
        </form>
      </FormCard>

      <ListCard
        title="Ø§Ù„Ø³Ù„Ù Ø§Ù„Ù…Ø³Ø¬Ù„Ø©"
        loading={false}
        empty={!rows.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ø§Ù„Ù…ÙˆØ¸Ù</th>
              <th style={styles.th}>Ø§Ù„ØªØ§Ø±ÙŠØ®</th>
              <th style={styles.th}>Ø§Ù„Ø³Ù„ÙØ©</th>
              <th style={styles.th}>Ø§Ù„Ø£Ù‚Ø³Ø§Ø·</th>
              <th style={styles.th}>Ù‚ÙŠÙ…Ø© Ø§Ù„Ù‚Ø³Ø·</th>
              <th style={styles.th}>Ø§Ù„Ù…Ø®ØµÙˆÙ…</th>
              <th style={styles.th}>Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ</th>
              <th style={styles.th}>Ø¥Ø¬Ø±Ø§Ø¡</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={styles.td}>
                  {employeeName(row.employee_id)}
                </td>
                <td style={styles.td}>
                  {row.date || '-'}
                </td>
                <td style={styles.td}>
                  {money(row.amount)}
                </td>
                <td style={styles.td}>
                  {row.installments}
                </td>
                <td style={styles.td}>
                  {money(row.installment_amount)}
                </td>
                <td style={styles.td}>
                  {money(row.deducted_amount)}
                </td>
                <td style={styles.td}>
                  {money(row.remaining_amount)}
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.deleteButton}
                    onClick={() => remove(row.id)}
                  >
                    Ø­Ø°Ù
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListCard>
    </div>
  )
}

/* =========================================================
   Ø§Ù„Ù…Ø±ØªØ¨Ø§Øª
========================================================= */

function SalariesPage({ session }) {
  const [employees, setEmployees] = useState([])
  const [advances, setAdvances] = useState([])
  const [rows, setRows] = useState([])

  const [form, setForm] = useState({
    employee_id: '',
    month:
      new Date().toISOString().slice(0, 7) + '-01',
    base_salary: '',
    deductions: '',
    statement: '',
  })

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const [emp, adv, sal] = await Promise.all([
      supabase.from('employees').select('*').order('name'),
      supabase
        .from('advances')
        .select('*')
        .order('date', { ascending: false }),
      supabase
        .from('salaries')
        .select('*')
        .order('month', { ascending: false }),
    ])

    if (!emp.error) setEmployees(emp.data || [])
    if (!adv.error) setAdvances(adv.data || [])
    if (!sal.error) setRows(sal.data || [])
  }

  function update(field, value) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }))
  }

  function selectEmployee(id) {
    const employee = employees.find(
      (e) => e.id === id
    )

    update('employee_id', id)
    update(
      'base_salary',
      employee?.base_salary || ''
    )
  }

  function employeeAdvance(id) {
    return advances
      .filter(
        (a) =>
          a.employee_id === id &&
          Number(a.remaining_amount || 0) > 0
      )
      .reduce(
        (sum, a) =>
          sum +
          Math.min(
            Number(a.installment_amount || 0),
            Number(a.remaining_amount || 0)
          ),
        0
      )
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!form.employee_id) {
      setError('Ø§Ø®ØªØ± Ø§Ù„Ù…ÙˆØ¸Ù')
      return
    }

    const base = Number(form.base_salary || 0)
    const deductions = Number(form.deductions || 0)
    const advance = employeeAdvance(form.employee_id)
    const net = base - advance - deductions

    if (base <= 0) {
      setError('Ø§Ù„Ù…Ø±ØªØ¨ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ ØºÙŠØ± ØµØ­ÙŠØ­')
      return
    }

    const { error } = await supabase
      .from('salaries')
      .insert({
        id: crypto.randomUUID(),
        employee_id: form.employee_id,
        month: form.month,
        base_salary: base,
        advances: advance,
        deductions,
        net_salary: net,
        statement: form.statement.trim(),
        created_by: session.user.id,
      })

    if (error) {
      setError('Ù„Ù… ÙŠØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ø±ØªØ¨: ' + error.message)
      return
    }

    /*
      Ø®ØµÙ… Ù‚Ø³Ø· Ø§Ù„Ø³Ù„ÙØ© ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§.
      Ù„Ø§ ÙŠØªÙ… Ø®ØµÙ… Ø£ÙƒØ«Ø± Ù…Ù† Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ.
    */
    let remainingToDeduct = advance

    const employeeAdvances = advances.filter(
      (a) =>
        a.employee_id === form.employee_id &&
        Number(a.remaining_amount || 0) > 0
    )

    for (const adv of employeeAdvances) {
      if (remainingToDeduct <= 0) break

      const remaining = Number(
        adv.remaining_amount || 0
      )

      const deduction = Math.min(
        Number(adv.installment_amount || 0),
        remainingToDeduct,
        remaining
      )

      if (deduction > 0) {
        await supabase
          .from('advances')
          .update({
            deducted_amount:
              Number(adv.deducted_amount || 0) +
              deduction,
            remaining_amount:
              remaining - deduction,
          })
          .eq('id', adv.id)

        remainingToDeduct -= deduction
      }
    }

    setMessage(
      `ØªÙ… Ø­ÙØ¸ Ù…Ø±ØªØ¨ ${form.month.slice(
        0,
        7
      )} ÙˆØ®ØµÙ… Ø§Ù„Ø³Ù„Ù ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§ âœ…`
    )

    setForm({
      employee_id: '',
      month:
        new Date().toISOString().slice(0, 7) +
        '-01',
      base_salary: '',
      deductions: '',
      statement: '',
    })

    await load()
  }

  async function remove(id) {
    if (!window.confirm('Ø­Ø°Ù Ø§Ù„Ù…Ø±ØªØ¨ØŸ')) return

    const { error } = await supabase
      .from('salaries')
      .delete()
      .eq('id', id)

    if (error) setError(error.message)
    else {
      setMessage('ØªÙ… Ø§Ù„Ø­Ø°Ù âœ…')
      await load()
    }
  }

  const selectedAdvance = employeeAdvance(
    form.employee_id
  )

  const previewNet =
    Number(form.base_salary || 0) -
    selectedAdvance -
    Number(form.deductions || 0)

  const employeeName = (id) =>
    employees.find((e) => e.id === id)?.name || '-'

  return (
    <div>
      <FormCard title="ØªØ³Ø¬ÙŠÙ„ Ù…Ø±ØªØ¨">
        <form onSubmit={save}>
          <div style={styles.formGrid}>
            <SelectField
              label="Ø§Ù„Ù…ÙˆØ¸Ù"
              value={form.employee_id}
              onChange={selectEmployee}
              options={employees.map((e) => ({
                value: e.id,
                label: e.name,
              }))}
            />

            <Field
              label="Ø´Ù‡Ø± Ø§Ù„Ù…Ø±ØªØ¨"
              type="date"
              value={form.month}
              onChange={(v) => update('month', v)}
            />

            <Field
              label="Ø§Ù„Ù…Ø±ØªØ¨ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ"
              type="number"
              value={form.base_salary}
              onChange={(v) =>
                update('base_salary', v)
              }
            />

            <div>
              <label style={styles.label}>
                Ø§Ù„Ø³Ù„Ù Ø§Ù„Ù…Ø³ØªØ­Ù‚Ø© Ù‡Ø°Ø§ Ø§Ù„Ø´Ù‡Ø±
              </label>

              <div style={styles.readonlyBox}>
                {money(selectedAdvance)}
              </div>
            </div>

            <Field
              label="Ø§Ù„Ø®ØµÙˆÙ…Ø§Øª"
              type="number"
              value={form.deductions}
              onChange={(v) =>
                update('deductions', v)
              }
            />

            <div>
              <label style={styles.label}>
                ØµØ§ÙÙŠ Ø§Ù„Ù…Ø±ØªØ¨
              </label>

              <div style={styles.netBox}>
                {money(previewNet)}
              </div>
            </div>

            <Field
              label="Ø§Ù„Ø¨ÙŠØ§Ù†"
              value={form.statement}
              onChange={(v) =>
                update('statement', v)
              }
              full
            />
          </div>

          <Messages
            error={error}
            message={message}
          />

          <SaveButton>Ø­ÙØ¸ Ø§Ù„Ù…Ø±ØªØ¨</SaveButton>
        </form>
      </FormCard>

      <ListCard
        title="Ø³Ø¬Ù„ Ø§Ù„Ù…Ø±ØªØ¨Ø§Øª"
        loading={false}
        empty={!rows.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ø§Ù„Ù…ÙˆØ¸Ù</th>
              <th style={styles.th}>Ø§Ù„Ø´Ù‡Ø±</th>
              <th style={styles.th}>Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ</th>
              <th style={styles.th}>Ø§Ù„Ø³Ù„Ù</th>
              <th style={styles.th}>Ø§Ù„Ø®ØµÙˆÙ…Ø§Øª</th>
              <th style={styles.th}>Ø§Ù„ØµØ§ÙÙŠ</th>
              <th style={styles.th}>Ø¥Ø¬Ø±Ø§Ø¡</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={styles.td}>
                  {employeeName(row.employee_id)}
                </td>
                <td style={styles.td}>
                  {row.month}
                </td>
                <td style={styles.td}>
                  {money(row.base_salary)}
                </td>
                <td style={styles.td}>
                  {money(row.advances)}
                </td>
                <td style={styles.td}>
                  {money(row.deductions)}
                </td>
                <td style={styles.td}>
                  <strong>
                    {money(row.net_salary)}
                  </strong>
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.deleteButton}
                    onClick={() => remove(row.id)}
                  >
                    Ø­Ø°Ù
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListCard>
    </div>
  )
}

/* =========================================================
   Ø§Ù„Ù…Ø´ØªØ±ÙŠØ§Øª
========================================================= */

function PurchasesPage({ session }) {
  const [rows, setRows] = useState([])

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    item: '',
    quantity: '',
    price: '',
    statement: '',
  })

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('date', { ascending: false })

    if (error) setError(error.message)
    else setRows(data || [])
  }

  function update(field, value) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }))
  }

  async function save(e) {
    e.preventDefault()

    setError('')
    setMessage('')

    if (!form.item.trim()) {
      setError('Ø§ÙƒØªØ¨ Ø§Ù„ØµÙ†Ù')
      return
    }

    const quantity = Number(form.quantity || 0)
    const price = Number(form.price || 0)
    const total = quantity * price

    if (quantity <= 0 || price <= 0) {
      setError('Ø£Ø¯Ø®Ù„ Ø§Ù„ÙƒÙ…ÙŠØ© ÙˆØ§Ù„Ø³Ø¹Ø±')
      return
    }

    const { error } = await supabase
      .from('purchases')
      .insert({
        id: crypto.randomUUID(),
        date: form.date || null,
        item: form.item.trim(),
        quantity,
        price,
        total,
        statement: form.statement.trim(),
        created_by: session.user.id,
      })

    if (error) {
      setError('Ù„Ù… ÙŠØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ø´ØªØ±ÙŠØ§Øª: ' + error.message)
    } else {
      setMessage('ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ø´ØªØ±ÙŠØ§Øª âœ…')

      setForm({
        date: new Date().toISOString().slice(0, 10),
        item: '',
        quantity: '',
        price: '',
        statement: '',
      })

      await load()
    }
  }

  async function remove(id) {
    if (!window.confirm('Ø­Ø°Ù Ø§Ù„Ø¹Ù…Ù„ÙŠØ©ØŸ')) return

    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id)

    if (error) setError(error.message)
    else await load()
  }

  const total =
    Number(form.quantity || 0) *
    Number(form.price || 0)

  return (
    <div>
      <FormCard title="Ø¥Ø¶Ø§ÙØ© Ù…Ø´ØªØ±ÙŠØ§Øª">
        <form onSubmit={save}>
          <div style={styles.formGrid}>
            <Field
              label="Ø§Ù„ØªØ§Ø±ÙŠØ®"
              type="date"
              value={form.date}
              onChange={(v) => update('date', v)}
            />

            <Field
              label="Ø§Ù„ØµÙ†Ù"
              value={form.item}
              onChange={(v) => update('item', v)}
            />

            <Field
              label="Ø§Ù„ÙƒÙ…ÙŠØ©"
              type="number"
              value={form.quantity}
              onChange={(v) =>
                update('quantity', v)
              }
            />

            <Field
              label="Ø§Ù„Ø³Ø¹Ø±"
              type="number"
              value={form.price}
              onChange={(v) => update('price', v)}
            />

            <div>
              <label style={styles.label}>
                Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ
              </label>

              <div style={styles.netBox}>
                {money(total)}
              </div>
            </div>

            <Field
              label="Ø§Ù„Ø¨ÙŠØ§Ù†"
              value={form.statement}
              onChange={(v) =>
                update('statement', v)
              }
              full
            />
          </div>

          <Messages
            error={error}
            message={message}
          />

          <SaveButton>Ø­ÙØ¸ Ø§Ù„Ù…Ø´ØªØ±ÙŠØ§Øª</SaveButton>
        </form>
      </FormCard>

      <ListCard
        title="Ø³Ø¬Ù„ Ø§Ù„Ù…Ø´ØªØ±ÙŠØ§Øª"
        loading={false}
        empty={!rows.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ø§Ù„ØªØ§Ø±ÙŠØ®</th>
              <th style={styles.th}>Ø§Ù„ØµÙ†Ù</th>
              <th style={styles.th}>Ø§Ù„ÙƒÙ…ÙŠØ©</th>
              <th style={styles.th}>Ø§Ù„Ø³Ø¹Ø±</th>
              <th style={styles.th}>Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ</th>
              <th style={styles.th}>Ø§Ù„Ø¨ÙŠØ§Ù†</th>
              <th style={styles.th}>Ø¥Ø¬Ø±Ø§Ø¡</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={styles.td}>{row.date}</td>
                <td style={styles.td}>{row.item}</td>
                <td style={styles.td}>
                  {row.quantity}
                </td>
                <td style={styles.td}>
                  {money(row.price)}
                </td>
                <td style={styles.td}>
                  {money(row.total)}
                </td>
                <td style={styles.td}>
                  {row.statement || '-'}
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.deleteButton}
                    onClick={() => remove(row.id)}
                  >
                    Ø­Ø°Ù
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListCard>
    </div>
  )
}

/* =========================================================
   Ø§Ù„Ø¹Ù‡Ø¯Ø© + ØªØµÙÙŠØ© Ø§Ù„Ø¹Ù‡Ø¯Ø©
========================================================= */

function CustodyPage({ session }) {
  const [employees, setEmployees] = useState([])
  const [custody, setCustody] = useState([])
  const [settlements, setSettlements] = useState([])

  const [form, setForm] = useState({
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    statement: '',
  })

  const [settlementForm, setSettlementForm] = useState({
    custody_id: '',
    date: new Date().toISOString().slice(0, 10),
    item: '',
    quantity: '',
    price: '',
    statement: '',
  })

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const [emp, cus, set] = await Promise.all([
      supabase.from('employees').select('*').order('name'),

      supabase
        .from('custody')
        .select('*')
        .order('date', { ascending: false }),

      supabase
        .from('custody_settlements')
        .select('*')
        .order('date', { ascending: false }),
    ])

    if (!emp.error) setEmployees(emp.data || [])
    if (!cus.error) setCustody(cus.data || [])
    if (!set.error) setSettlements(set.data || [])
  }

  function update(field, value) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }))
  }

  function updateSettlement(field, value) {
    setSettlementForm((old) => ({
      ...old,
      [field]: value,
    }))
  }

  async function saveCustody(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const amount = Number(form.amount || 0)

    if (!form.employee_id) {
      setError('Ø§Ø®ØªØ± Ø§Ù„Ù…ÙˆØ¸Ù')
      return
    }

    if (amount <= 0) {
      setError('Ø§ÙƒØªØ¨ Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¹Ù‡Ø¯Ø©')
      return
    }

    const { error } = await supabase
      .from('custody')
      .insert({
        id: crypto.randomUUID(),
        employee_id: form.employee_id,
        date: form.date || null,
        amount,
        statement: form.statement.trim(),
        created_by: session.user.id,
      })

    if (error) {
      setError('Ù„Ù… ÙŠØªÙ… Ø­ÙØ¸ Ø§Ù„Ø¹Ù‡Ø¯Ø©: ' + error.message)
    } else {
      setMessage('ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¹Ù‡Ø¯Ø© âœ…')

      setForm({
        employee_id: '',
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        statement: '',
      })

      await load()
    }
  }

  async function saveSettlement(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const quantity = Number(
      settlementForm.quantity || 0
    )

    const price = Number(
      settlementForm.price || 0
    )

    const total = quantity * price

    if (!settlementForm.custody_id) {
      setError('Ø§Ø®ØªØ± Ø§Ù„Ø¹Ù‡Ø¯Ø©')
      return
    }

    if (!settlementForm.item.trim()) {
      setError('Ø§ÙƒØªØ¨ Ø§Ù„ØµÙ†Ù')
      return
    }

    if (total <= 0) {
      setError('Ø£Ø¯Ø®Ù„ Ø§Ù„ÙƒÙ…ÙŠØ© ÙˆØ§Ù„Ø³Ø¹Ø±')
      return
    }

    const balance = custodyBalance(
      settlementForm.custody_id
    )

    if (total > balance) {
      setError(
        `Ù‚ÙŠÙ…Ø© Ø§Ù„ØªØµÙÙŠØ© Ø£ÙƒØ¨Ø± Ù…Ù† Ø±ØµÙŠØ¯ Ø§Ù„Ø¹Ù‡Ø¯Ø© Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ (${money(
          balance
        )})`
      )
      return
    }

    const { error } = await supabase
      .from('custody_settlements')
      .insert({
        id: crypto.randomUUID(),
        custody_id: settlementForm.custody_id,
        date: settlementForm.date || null,
        item: settlementForm.item.trim(),
        quantity,
        price,
        total,
        statement:
          settlementForm.statement.trim(),
        created_by: session.user.id,
      })

    if (error) {
      setError(
        'Ù„Ù… ÙŠØªÙ… Ø­ÙØ¸ ØªØµÙÙŠØ© Ø§Ù„Ø¹Ù‡Ø¯Ø©: ' +
          error.message
      )
    } else {
      setMessage(
        'ØªÙ… Ø­ÙØ¸ ØªØµÙÙŠØ© Ø§Ù„Ø¹Ù‡Ø¯Ø© ÙˆØ®ØµÙ…Ù‡Ø§ Ù…Ù† Ø§Ù„Ø±ØµÙŠØ¯ âœ…'
      )

      setSettlementForm({
        custody_id: '',
        date: new Date().toISOString().slice(0, 10),
        item: '',
        quantity: '',
        price: '',
        statement: '',
      })

      await load()
    }
  }

  function custodyBalance(id) {
    const original =
      Number(
        custody.find((c) => c.id === id)?.amount || 0
      )

    const spent = settlements
      .filter((s) => s.custody_id === id)
      .reduce(
        (sum, s) => sum + Number(s.total || 0),
        0
      )

    return original - spent
  }

  async function removeCustody(id) {
    if (!window.confirm('Ø­Ø°Ù Ø§Ù„Ø¹Ù‡Ø¯Ø© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ØŸ'))
      return

    const { error } = await supabase
      .from('custody')
      .delete()
      .eq('id', id)

    if (error) setError(error.message)
    else {
      setMessage('ØªÙ… Ø­Ø°Ù Ø§Ù„Ø¹Ù‡Ø¯Ø© âœ…')
      await load()
    }
  }

  async function removeSettlement(id) {
    if (!window.confirm('Ø­Ø°Ù Ø¹Ù…Ù„ÙŠØ© Ø§Ù„ØªØµÙÙŠØ©ØŸ'))
      return

    const { error } = await supabase
      .from('custody_settlements')
      .delete()
      .eq('id', id)

    if (error) setError(error.message)
    else {
      setMessage('ØªÙ… Ø­Ø°Ù Ø§Ù„ØªØµÙÙŠØ© âœ…')
      await load()
    }
  }

  const employeeName = (id) =>
    employees.find((e) => e.id === id)?.name || '-'

  const settlementTotal =
    Number(settlementForm.quantity || 0) *
    Number(settlementForm.price || 0)

  return (
    <div>
      <FormCard title="ØªØ³Ø¬ÙŠÙ„ Ø¹Ù‡Ø¯Ø© Ø¬Ø¯ÙŠØ¯Ø©">
        <form onSubmit={saveCustody}>
          <div style={styles.formGrid}>
            <SelectField
              label="Ø§Ù„Ù…ÙˆØ¸Ù"
              value={form.employee_id}
              onChange={(v) =>
                update('employee_id', v)
              }
              options={employees.map((e) => ({
                value: e.id,
                label: e.name,
              }))}
            />

            <Field
              label="Ø§Ù„ØªØ§Ø±ÙŠØ®"
              type="date"
              value={form.date}
              onChange={(v) => update('date', v)}
            />

            <Field
              label="Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¹Ù‡Ø¯Ø©"
              type="number"
              value={form.amount}
              onChange={(v) =>
                update('amount', v)
              }
            />

            <Field
              label="Ø§Ù„Ø¨ÙŠØ§Ù†"
              value={form.statement}
              onChange={(v) =>
                update('statement', v)
              }
              full
            />
          </div>

          <Messages
            error={error}
            message={message}
          />

          <SaveButton>Ø­ÙØ¸ Ø§Ù„Ø¹Ù‡Ø¯Ø©</SaveButton>
        </form>
      </FormCard>

      <ListCard
        title="Ø§Ù„Ø¹Ù‡Ø¯ Ø§Ù„Ù…Ø³Ø¬Ù„Ø©"
        loading={false}
        empty={!custody.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ø§Ù„Ù…ÙˆØ¸Ù</th>
              <th style={styles.th}>Ø§Ù„ØªØ§Ø±ÙŠØ®</th>
              <th style={styles.th}>Ù‚ÙŠÙ…Ø© Ø§Ù„Ø¹Ù‡Ø¯Ø©</th>
              <th style={styles.th}>Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…</th>
              <th style={styles.th}>Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ</th>
              <th style={styles.th}>Ø¥Ø¬Ø±Ø§Ø¡</th>
            </tr>
          </thead>

          <tbody>
            {custody.map((row) => (
              <tr key={row.id}>
                <td style={styles.td}>
                  {employeeName(row.employee_id)}
                </td>

                <td style={styles.td}>
                  {row.date || '-'}
                </td>

                <td style={styles.td}>
                  {money(row.amount)}
                </td>

                <td style={styles.td}>
                  {money(
                    Number(row.amount || 0) -
                      custodyBalance(row.id)
                  )}
                </td>

                <td style={styles.td}>
                  <strong>
                    {money(custodyBalance(row.id))}
                  </strong>
                </td>

                <td style={styles.td}>
                  <button
                    style={styles.deleteButton}
                    onClick={() =>
                      removeCustody(row.id)
                    }
                  >
                    Ø­Ø°Ù
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListCard>

      <FormCard title="ØªØµÙÙŠØ© Ø§Ù„Ø¹Ù‡Ø¯Ø©">
        <form onSubmit={saveSettlement}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>
                Ø§Ù„Ø¹Ù‡Ø¯Ø©
              </label>

              <select
                style={styles.input}
                value={settlementForm.custody_id}
                onChange={(e) =>
                  updateSettlement(
                    'custody_id',
                    e.target.value
                  )
                }
              >
                <option value="">
                  Ø§Ø®ØªØ± Ø§Ù„Ø¹Ù‡Ø¯Ø©
                </option>

                {custody.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {employeeName(
                      c.employee_id
                    )}{' '}
                    - Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ:{' '}
                    {money(custodyBalance(c.id))}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Ø§Ù„ØªØ§Ø±ÙŠØ®"
              type="date"
              value={settlementForm.date}
              onChange={(v) =>
                updateSettlement('date', v)
              }
            />

            <Field
              label="Ø§Ù„ØµÙ†Ù"
              value={settlementForm.item}
              onChange={(v) =>
                updateSettlement('item', v)
              }
            />

            <Field
              label="Ø§Ù„ÙƒÙ…ÙŠØ©"
              type="number"
              value={settlementForm.quantity}
              onChange={(v) =>
                updateSettlement(
                  'quantity',
                  v
                )
              }
            />

            <Field
              label="Ø§Ù„Ø³Ø¹Ø±"
              type="number"
              value={settlementForm.price}
              onChange={(v) =>
                updateSettlement(
                  'price',
                  v
                )
              }
            />

            <div>
              <label style={styles.label}>
                Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ØªØµÙÙŠØ©
              </label>

              <div style={styles.netBox}>
                {money(settlementTotal)}
              </div>
            </div>

            <Field
              label="Ø§Ù„Ø¨ÙŠØ§Ù†"
              value={settlementForm.statement}
              onChange={(v) =>
                updateSettlement(
                  'statement',
                  v
                )
              }
              full
            />
          </div>

          <Messages
            error={error}
            message={message}
          />

          <SaveButton>
            Ø­ÙØ¸ ØªØµÙÙŠØ© Ø§Ù„Ø¹Ù‡Ø¯Ø©
          </SaveButton>
        </form>
      </FormCard>

      <ListCard
        title="Ø¹Ù…Ù„ÙŠØ§Øª ØªØµÙÙŠØ© Ø§Ù„Ø¹Ù‡Ø¯"
        loading={false}
        empty={!settlements.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ø§Ù„ØªØ§Ø±ÙŠØ®</th>
              <th style={styles.th}>Ø§Ù„Ø¹Ù‡Ø¯Ø©</th>
              <th style={styles.th}>Ø§Ù„ØµÙ†Ù</th>
              <th style={styles.th}>Ø§Ù„ÙƒÙ…ÙŠØ©</th>
              <th style={styles.th}>Ø§Ù„Ø³Ø¹Ø±</th>
              <th style={styles.th}>Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ</th>
              <th style={styles.th}>Ø¥Ø¬Ø±Ø§Ø¡</th>
            </tr>
          </thead>

          <tbody>
            {settlements.map((row) => {
              const c = custody.find(
                (x) => x.id === row.custody_id
              )

              return (
                <tr key={row.id}>
                  <td style={styles.td}>
                    {row.date || '-'}
                  </td>

                  <td style={styles.td}>
                    {c
                      ? employeeName(
                          c.employee_id
                        )
                      : '-'}
                  </td>

                  <td style={styles.td}>
                    {row.item}
                  </td>

                  <td style={styles.td}>
                    {row.quantity}
                  </td>

                  <td style={styles.td}>
                    {money(row.price)}
                  </td>

                  <td style={styles.td}>
                    {money(row.total)}
                  </td>

                  <td style={styles.td}>
                    <button
                      style={styles.deleteButton}
                      onClick={() =>
                        removeSettlement(
                          row.id
                        )
                      }
                    >
                      Ø­Ø°Ù
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ListCard>
    </div>
  )
}

/* =========================================================
   Ø§Ù„Ø´ÙŠÙƒØ§Øª ÙˆØ§Ù„ØªØ­ÙˆÙŠÙ„Ø§Øª
========================================================= */

function CollectionsPage({ session }) {
  const [rows, setRows] = useState([])
  const [invoices, setInvoices] = useState([])

  const [form, setForm] = useState({
    type: 'Ø´ÙŠÙƒØ§Øª',
    number: '',
    bank: '',
    date: new Date().toISOString().slice(0, 10),
    invoice_ids: [],
    amount: '',
    statement: '',
  })

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const [col, inv] = await Promise.all([
      supabase
        .from('collections')
        .select('*')
        .order('date', { ascending: false }),

      supabase
        .from('invoices')
        .select('*')
        .eq('status', 'ØºÙŠØ± Ù…Ø­ØµÙ„Ø©')
        .order('date', { ascending: false }),
    ])

    if (!col.error) setRows(col.data || [])
    if (!inv.error) setInvoices(inv.data || [])

    if (col.error) setError(col.error.message)
  }

  function update(field, value) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }))
  }

  function toggleInvoice(id) {
    setForm((old) => ({
      ...old,
      invoice_ids: old.invoice_ids.includes(id)
        ? old.invoice_ids.filter(
            (x) => x !== id
          )
        : [...old.invoice_ids, id],
    }))
  }

  const selectedInvoices = invoices.filter((i) =>
    form.invoice_ids.includes(i.id)
  )

  const selectedTotal = selectedInvoices.reduce(
    (sum, i) => sum + Number(i.amount || 0),
    0
  )

  async function save(e) {
    e.preventDefault()

    setError('')
    setMessage('')

    if (!form.number.trim()) {
      setError('Ø§ÙƒØªØ¨ Ø±Ù‚Ù… Ø§Ù„Ø´ÙŠÙƒ Ø£Ùˆ Ø§Ù„ØªØ­ÙˆÙŠÙ„')
      return
    }

    if (!form.bank.trim()) {
      setError('Ø§ÙƒØªØ¨ Ø§Ø³Ù… Ø§Ù„Ø¨Ù†Ùƒ')
      return
    }

    if (!form.invoice_ids.length) {
      setError('Ø§Ø®ØªØ± ÙØ§ØªÙˆØ±Ø© Ø£Ùˆ Ø£ÙƒØ«Ø±')
      return
    }

    const amount =
      Number(form.amount || 0) ||
      selectedTotal

    const collectionId = crypto.randomUUID()

    const { error: collectionError } =
      await supabase
        .from('collections')
        .insert({
          id: collectionId,
          type: form.type,
          number: form.number.trim(),
          bank: form.bank.trim(),
          date: form.date || null,
          invoice_ids: form.invoice_ids,
          amount,
          statement: form.statement.trim(),
          created_by: session.user.id,
        })

    if (collectionError) {
      setError(
        'Ù„Ù… ÙŠØªÙ… Ø­ÙØ¸ Ø§Ù„ØªØ­ØµÙŠÙ„: ' +
          collectionError.message
      )
      return
    }

    /*
      Ø±Ø¨Ø· Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø¨Ø§Ù„Ø´ÙŠÙƒ/Ø§Ù„ØªØ­ÙˆÙŠÙ„
      ÙˆØªØ­ÙˆÙŠÙ„ Ø­Ø§Ù„ØªÙ‡Ø§ ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§ Ø¥Ù„Ù‰ Ù…Ø­ØµÙ„Ø©.
    */

    for (const invoice of selectedInvoices) {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'Ù…Ø­ØµÙ„Ø©',
          collection_id: collectionId,
          collection_type: form.type,
          collection_number:
            form.number.trim(),
          collection_bank: form.bank.trim(),
          collection_date:
            form.date || null,
          collection_statement:
            form.statement.trim(),
        })
        .eq('id', invoice.id)

      if (error) {
        setError(
          'ØªÙ… Ø­ÙØ¸ Ø§Ù„ØªØ­ØµÙŠÙ„ ÙˆÙ„ÙƒÙ† Ø­Ø¯Ø« Ø®Ø·Ø£ ÙÙŠ Ø±Ø¨Ø· Ø§Ù„ÙØ§ØªÙˆØ±Ø©: ' +
            error.message
        )
        await load()
        return
      }
    }

    setMessage(
      'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø´ÙŠÙƒ/Ø§Ù„ØªØ­ÙˆÙŠÙ„ ÙˆØªØ­ÙˆÙŠÙ„ Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø¥Ù„Ù‰ Ù…Ø­ØµÙ„Ø© ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§ âœ…'
    )

    setForm({
      type: 'Ø´ÙŠÙƒØ§Øª',
      number: '',
      bank: '',
      date: new Date().toISOString().slice(0, 10),
      invoice_ids: [],
      amount: '',
      statement: '',
    })

    await load()
  }

  async function remove(id) {
    if (!window.confirm('Ø­Ø°Ù Ø¹Ù…Ù„ÙŠØ© Ø§Ù„ØªØ­ØµÙŠÙ„ØŸ'))
      return

    const row = rows.find((x) => x.id === id)

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    /*
      Ø¹Ù†Ø¯ Ø­Ø°Ù Ø§Ù„ØªØ­ØµÙŠÙ„ Ù†Ø¹ÙŠØ¯ Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ù…Ø±ØªØ¨Ø·Ø©
      Ø¥Ù„Ù‰ ØºÙŠØ± Ù…Ø­ØµÙ„Ø©.
    */

    if (row?.invoice_ids?.length) {
      for (const invoiceId of row.invoice_ids) {
        await supabase
          .from('invoices')
          .update({
            status: 'ØºÙŠØ± Ù…Ø­ØµÙ„Ø©',
            collection_id: null,
            collection_type: null,
            collection_number: null,
            collection_bank: null,
            collection_date: null,
            collection_statement: null,
          })
          .eq('id', invoiceId)
      }
    }

    setMessage('ØªÙ… Ø­Ø°Ù Ø§Ù„ØªØ­ØµÙŠÙ„ ÙˆØ¥Ø¹Ø§Ø¯Ø© Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ù„ØºÙŠØ± Ù…Ø­ØµÙ„Ø© âœ…')
    await load()
  }

  return (
    <div>
      <FormCard title="ØªØ³Ø¬ÙŠÙ„ Ø´ÙŠÙƒ Ø£Ùˆ ØªØ­ÙˆÙŠÙ„ Ø¨Ù†ÙƒÙŠ">
        <form onSubmit={save}>
          <div style={styles.formGrid}>
            <SelectField
              label="Ù†ÙˆØ¹ Ø§Ù„ØªØ­ØµÙŠÙ„"
              value={form.type}
              onChange={(v) =>
                update('type', v)
              }
              options={[
                {
                  value: 'Ø´ÙŠÙƒØ§Øª',
                  label: 'Ø´ÙŠÙƒØ§Øª',
                },
                {
                  value: 'ØªØ­ÙˆÙŠÙ„Ø§Øª Ø¨Ù†ÙƒÙŠØ©',
                  label: 'ØªØ­ÙˆÙŠÙ„Ø§Øª Ø¨Ù†ÙƒÙŠØ©',
                },
              ]}
            />

            <Field
              label="Ø±Ù‚Ù… Ø§Ù„Ø´ÙŠÙƒ / Ø§Ù„ØªØ­ÙˆÙŠÙ„"
              value={form.number}
              onChange={(v) =>
                update('number', v)
              }
            />

            <Field
              label="Ø§Ù„Ø¨Ù†Ùƒ"
              value={form.bank}
              onChange={(v) =>
                update('bank', v)
              }
            />

            <Field
              label="Ø§Ù„ØªØ§Ø±ÙŠØ®"
              type="date"
              value={form.date}
              onChange={(v) =>
                update('date', v)
              }
            />

            <Field
              label="Ø§Ù„Ù…Ø¨Ù„Øº"
              type="number"
              value={form.amount}
              onChange={(v) =>
                update('amount', v)
              }
            />

            <Field
              label="Ø§Ù„Ø¨ÙŠØ§Ù†"
              value={form.statement}
              onChange={(v) =>
                update('statement', v)
              }
              full
            />
          </div>

          <div style={styles.invoicePicker}>
            <h3 style={{ marginTop: 0 }}>
              Ø§Ù„ÙÙˆØ§ØªÙŠØ± ØºÙŠØ± Ø§Ù„Ù…Ø­ØµÙ„Ø©
            </h3>

            {invoices.length === 0 ? (
              <div style={styles.noData}>
                Ù„Ø§ ØªÙˆØ¬Ø¯ ÙÙˆØ§ØªÙŠØ± ØºÙŠØ± Ù…Ø­ØµÙ„Ø©.
              </div>
            ) : (
              invoices.map((invoice) => (
                <label
                  key={invoice.id}
                  style={styles.invoiceCheck}
                >
                  <input
                    type="checkbox"
                    checked={form.invoice_ids.includes(
                      invoice.id
                    )}
                    onChange={() =>
                      toggleInvoice(
                        invoice.id
                      )
                    }
                  />

                  <span>
                    ÙØ§ØªÙˆØ±Ø© Ø±Ù‚Ù…{' '}
                    <strong>
                      {invoice.invoice_number}
                    </strong>
                    {' - '}
                    {money(invoice.amount)}
                    {' - '}
                    {invoice.company || '-'}
                  </span>
                </label>
              ))
            )}

            {selectedInvoices.length > 0 && (
              <div style={styles.infoBox}>
                Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©:
                {' '}
                <strong>
                  {money(selectedTotal)}
                </strong>
              </div>
            )}
          </div>

          <Messages
            error={error}
            message={message}
          />

          <SaveButton>
            Ø­ÙØ¸ Ø§Ù„ØªØ­ØµÙŠÙ„ ÙˆØ±Ø¨Ø· Ø§Ù„ÙÙˆØ§ØªÙŠØ±
          </SaveButton>
        </form>
      </FormCard>

      <ListCard
        title="Ø§Ù„Ø´ÙŠÙƒØ§Øª ÙˆØ§Ù„ØªØ­ÙˆÙŠÙ„Ø§Øª Ø§Ù„Ù…Ø³Ø¬Ù„Ø©"
        loading={false}
        empty={!rows.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ø§Ù„Ù†ÙˆØ¹</th>
              <th style={styles.th}>Ø§Ù„Ø±Ù‚Ù…</th>
              <th style={styles.th}>Ø§Ù„Ø¨Ù†Ùƒ</th>
              <th style={styles.th}>Ø§Ù„ØªØ§Ø±ÙŠØ®</th>
              <th style={styles.th}>Ø§Ù„Ù…Ø¨Ù„Øº</th>
              <th style={styles.th}>Ø£Ø±Ù‚Ø§Ù… Ø§Ù„ÙÙˆØ§ØªÙŠØ±</th>
              <th style={styles.th}>Ø§Ù„Ø¨ÙŠØ§Ù†</th>
              <th style={styles.th}>Ø¥Ø¬Ø±Ø§Ø¡</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={styles.td}>
                  {row.type}
                </td>

                <td style={styles.td}>
                  {row.number}
                </td>

                <td style={styles.td}>
                  {row.bank}
                </td>

                <td style={styles.td}>
                  {row.date || '-'}
                </td>

                <td style={styles.td}>
                  {money(row.amount)}
                </td>

                <td style={styles.td}>
                  {Array.isArray(row.invoice_ids) ? row.invoice_ids.map(id => invoices.find(inv => inv.id === id)?.invoice_number || id).join('ØŒ ') : '-'}
                </td>

                <td style={styles.td}>
                  {row.statement || '-'}
                </td>

                <td style={styles.td}>
                  <button
                    style={styles.deleteButton}
                    onClick={() =>
                      remove(row.id)
                    }
                  >
                    Ø­Ø°Ù
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListCard>
    </div>
  )
}

/* =========================================================
   Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±
========================================================= */

function ReportsPage() {
  const [employees, setEmployees] = useState([])
  const [vacations, setVacations] = useState([])
  const [salaries, setSalaries] = useState([])
  const [advances, setAdvances] = useState([])
  const [purchases, setPurchases] = useState([])
  const [custody, setCustody] = useState([])
  const [settlements, setSettlements] =
    useState([])
  const [invoices, setInvoices] = useState([])
  const [collections, setCollections] =
    useState([])

  const [loading, setLoading] = useState(true)
  const [employeeFilter, setEmployeeFilter] =
    useState('all')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)

    const results = await Promise.all([
      supabase.from('employees').select('*'),
      supabase.from('vacations').select('*'),
      supabase.from('salaries').select('*'),
      supabase.from('advances').select('*'),
      supabase.from('purchases').select('*'),
      supabase.from('custody').select('*'),
      supabase
        .from('custody_settlements')
        .select('*'),
      supabase.from('invoices').select('*'),
      supabase
        .from('collections')
        .select('*'),
    ])

    if (!results[0].error)
      setEmployees(results[0].data || [])

    if (!results[1].error)
      setVacations(results[1].data || [])

    if (!results[2].error)
      setSalaries(results[2].data || [])

    if (!results[3].error)
      setAdvances(results[3].data || [])

    if (!results[4].error)
      setPurchases(results[4].data || [])

    if (!results[5].error)
      setCustody(results[5].data || [])

    if (!results[6].error)
      setSettlements(results[6].data || [])

    if (!results[7].error)
      setInvoices(results[7].data || [])

    if (!results[8].error)
      setCollections(results[8].data || [])

    setLoading(false)
  }

  const employeeName = (id) =>
    employees.find((e) => e.id === id)?.name || '-'

  const filteredSalaries =
    employeeFilter === 'all'
      ? salaries
      : salaries.filter(
          (x) =>
            x.employee_id === employeeFilter
        )

  const filteredAdvances =
    employeeFilter === 'all'
      ? advances
      : advances.filter(
          (x) =>
            x.employee_id === employeeFilter
        )

  const filteredVacations =
    employeeFilter === 'all'
      ? vacations
      : vacations.filter(
          (x) =>
            x.employee_id === employeeFilter
        )

  const filteredCustody =
    employeeFilter === 'all'
      ? custody
      : custody.filter(
          (x) =>
            x.employee_id === employeeFilter
        )

  const totalSalaries =
    filteredSalaries.reduce(
      (s, x) =>
        s + Number(x.net_salary || 0),
      0
    )

  const totalAdvances =
    filteredAdvances.reduce(
      (s, x) =>
        s + Number(x.amount || 0),
      0
    )

  const totalPurchases =
    purchases.reduce(
      (s, x) =>
        s + Number(x.total || 0),
      0
    )

  const totalInvoices =
    invoices.reduce(
      (s, x) =>
        s + Number(x.amount || 0),
      0
    )

  const collectedInvoices =
    invoices.filter(
      (x) => x.status === 'Ù…Ø­ØµÙ„Ø©'
    )

  const unpaidInvoices =
    invoices.filter(
      (x) => x.status !== 'Ù…Ø­ØµÙ„Ø©'
    )

  const totalCollected =
    collectedInvoices.reduce(
      (s, x) =>
        s + Number(x.amount || 0),
      0
    )

  const totalUnpaid =
    unpaidInvoices.reduce(
      (s, x) =>
        s + Number(x.amount || 0),
      0
    )

  const totalCustody =
    filteredCustody.reduce(
      (s, x) =>
        s + Number(x.amount || 0),
      0
    )

  const settlementForCustody = (id) =>
    settlements
      .filter((x) => x.custody_id === id)
      .reduce(
        (s, x) =>
          s + Number(x.total || 0),
        0
      )

  const remainingCustody =
    filteredCustody.reduce(
      (s, x) =>
        s +
        Number(x.amount || 0) -
        settlementForCustody(x.id),
      0
    )

  if (loading) {
    return (
      <div style={styles.loadingSmall}>
        Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±...
      </div>
    )
  }

  return (
    <div>
      <FormCard title="ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…">
        <div style={styles.formGrid}>
          <div>
            <label style={styles.label}>
              Ø§Ù„Ù…ÙˆØ¸Ù
            </label>

            <select
              style={styles.input}
              value={employeeFilter}
              onChange={(e) =>
                setEmployeeFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                ÙƒÙ„ Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†
              </option>

              {employees.map((e) => (
                <option
                  key={e.id}
                  value={e.id}
                >
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormCard>

      <div style={styles.reportCards}>
        <ReportCard
          title="ØµØ§ÙÙŠ Ø§Ù„Ù…Ø±ØªØ¨Ø§Øª"
          value={money(totalSalaries)}
          icon="ðŸ’°"
        />

        <ReportCard
          title="Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø³Ù„Ù"
          value={money(totalAdvances)}
          icon="ðŸ’µ"
        />

        <ReportCard
          title="Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø´ØªØ±ÙŠØ§Øª"
          value={money(totalPurchases)}
          icon="ðŸ›’"
        />

        <ReportCard
          title="Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙÙˆØ§ØªÙŠØ±"
          value={money(totalInvoices)}
          icon="ðŸ§¾"
        />

        <ReportCard
          title="Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ù…Ø­ØµÙ„Ø©"
          value={money(totalCollected)}
          icon="âœ…"
        />

        <ReportCard
          title="Ø§Ù„ÙÙˆØ§ØªÙŠØ± ØºÙŠØ± Ø§Ù„Ù…Ø­ØµÙ„Ø©"
          value={money(totalUnpaid)}
          icon="â³"
        />

        <ReportCard
          title="Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø¹Ù‡Ø¯"
          value={money(totalCustody)}
          icon="ðŸ“¦"
        />

        <ReportCard
          title="Ø±ØµÙŠØ¯ Ø§Ù„Ø¹Ù‡Ø¯ Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ"
          value={money(remainingCustody)}
          icon="ðŸ“‹"
        />
      </div>

      <ListCard
        title="ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ø±ØªØ¨Ø§Øª"
        loading={false}
        empty={!filteredSalaries.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ø§Ù„Ù…ÙˆØ¸Ù</th>
              <th style={styles.th}>Ø§Ù„Ø´Ù‡Ø±</th>
              <th style={styles.th}>Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ</th>
              <th style={styles.th}>Ø§Ù„Ø³Ù„Ù</th>
              <th style={styles.th}>Ø§Ù„Ø®ØµÙˆÙ…Ø§Øª</th>
              <th style={styles.th}>Ø§Ù„ØµØ§ÙÙŠ</th>
            </tr>
          </thead>

          <tbody>
            {filteredSalaries.map((x) => (
              <tr key={x.id}>
                <td style={styles.td}>
                  {employeeName(x.employee_id)}
                </td>
                <td style={styles.td}>
                  {x.month}
                </td>
                <td style={styles.td}>
                  {money(x.base_salary)}
                </td>
                <td style={styles.td}>
                  {money(x.advances)}
                </td>
                <td style={styles.td}>
                  {money(x.deductions)}
                </td>
                <td style={styles.td}>
                  {money(x.net_salary)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListCard>

      <ListCard
        title="ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ø¥Ø¬Ø§Ø²Ø§Øª"
        loading={false}
        empty={!filteredVacations.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ø§Ù„Ù…ÙˆØ¸Ù</th>
              <th style={styles.th}>Ù…Ù†</th>
              <th style={styles.th}>Ø¥Ù„Ù‰</th>
              <th style={styles.th}>Ø¹Ø¯Ø¯ Ø§Ù„Ø£ÙŠØ§Ù…</th>
              <th style={styles.th}>Ø§Ù„Ø¨ÙŠØ§Ù†</th>
            </tr>
          </thead>

          <tbody>
            {filteredVacations.map((x) => (
              <tr key={x.id}>
                <td style={styles.td}>
                  {employeeName(x.employee_id)}
                </td>
                <td style={styles.td}>
                  {x.date_from}
                </td>
                <td style={styles.td}>
                  {x.date_to}
                </td>
                <td style={styles.td}>
                  {x.days}
                </td>
                <td style={styles.td}>
                  {x.statement || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListCard>

      <ListCard
        title="ØªÙ‚Ø±ÙŠØ± Ø§Ù„ÙÙˆØ§ØªÙŠØ±"
        loading={false}
        empty={!invoices.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                Ø±Ù‚Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø©
              </th>
              <th style={styles.th}>
                Ø§Ù„ØªØ§Ø±ÙŠØ®
              </th>
              <th style={styles.th}>
                Ø§Ù„Ø´Ø±ÙƒØ©
              </th>
              <th style={styles.th}>
                Ø§Ù„Ù…Ø¨Ù„Øº
              </th>
              <th style={styles.th}>
                Ø§Ù„Ø­Ø§Ù„Ø©
              </th>
              <th style={styles.th}>
                Ø±Ù‚Ù… Ø§Ù„ØªØ­ØµÙŠÙ„
              </th>
              <th style={styles.th}>
                Ø§Ù„Ø¨Ù†Ùƒ
              </th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((x) => (
              <tr key={x.id}>
                <td style={styles.td}>
                  {x.invoice_number}
                </td>
                <td style={styles.td}>
                  {x.date || '-'}
                </td>
                <td style={styles.td}>
                  {x.company || '-'}
                </td>
                <td style={styles.td}>
                  {money(x.amount)}
                </td>
                <td style={styles.td}>
                  {x.status}
                </td>
                <td style={styles.td}>
                  {x.collection_number || '-'}
                </td>
                <td style={styles.td}>
                  {x.collection_bank || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListCard>

      <ListCard
        title="ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ø´ÙŠÙƒØ§Øª ÙˆØ§Ù„ØªØ­ÙˆÙŠÙ„Ø§Øª"
        loading={false}
        empty={!collections.length}
        onRefresh={load}
      >
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ø§Ù„Ù†ÙˆØ¹</th>
              <th style={styles.th}>Ø§Ù„Ø±Ù‚Ù…</th>
              <th style={styles.th}>Ø§Ù„Ø¨Ù†Ùƒ</th>
              <th style={styles.th}>Ø§Ù„ØªØ§Ø±ÙŠØ®</th>
              <th style={styles.th}>Ø§Ù„Ù…Ø¨Ù„Øº</th>
              <th style={styles.th}>Ø§Ù„ÙÙˆØ§ØªÙŠØ±</th>
              <th style={styles.th}>Ø§Ù„Ø¨ÙŠØ§Ù†</th>
            </tr>
          </thead>

          <tbody>
            {collections.map((x) => (
              <tr key={x.id}>
                <td style={styles.td}>
                  {x.type}
                </td>
                <td style={styles.td}>
                  {x.number}
                </td>
                <td style={styles.td}>
                  {x.bank}
                </td>
                <td style={styles.td}>
                  {x.date || '-'}
                </td>
                <td style={styles.td}>
                  {money(x.amount)}
                </td>
                <td style={styles.td}>
                  {Array.isArray(x.invoice_ids) ? x.invoice_ids.map(id => invoices.find(inv => inv.id === id)?.invoice_number || id).join('ØŒ ') : '-'}
                </td>
                <td style={styles.td}>
                  {x.statement || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ListCard>
    </div>
  )
}

/* =========================================================
   Ø§Ù„ÙÙˆØ§ØªÙŠØ± - Ø§Ù„ÙƒÙˆØ¯ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ø§Ù„Ø¹Ø§Ù…Ù„
========================================================= */

function InvoicesPage({ session, role }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    invoice_number: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    company: '',
    statement: '',
    status: 'ØºÙŠØ± Ù…Ø­ØµÙ„Ø©',
  })

  useEffect(() => {
    loadInvoices()

    const channel = supabase
      .channel('invoices-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
        },
        () => {
          loadInvoices()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadInvoices() {
    setLoading(true)

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(
        'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„ÙÙˆØ§ØªÙŠØ±: ' +
          error.message
      )
    } else {
      setInvoices(data || [])
      setError('')
    }

    setLoading(false)
  }

  function updateForm(field, value) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }))
  }

  async function saveInvoice(e) {
    e.preventDefault()

    setMessage('')
    setError('')

    if (!form.invoice_number.trim()) {
      setError('Ø§ÙƒØªØ¨ Ø±Ù‚Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø©')
      return
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      setError('Ø§ÙƒØªØ¨ Ù…Ø¨Ù„Øº Ø§Ù„ÙØ§ØªÙˆØ±Ø©')
      return
    }

    setSaving(true)

    const invoice = {
      id: crypto.randomUUID(),
      invoice_number:
        form.invoice_number.trim(),
      date: form.date || null,
      amount: Number(form.amount),
      company: form.company.trim(),
      statement: form.statement.trim(),
      status: form.status,
      created_by: session.user.id,
    }

    const { error } = await supabase
      .from('invoices')
      .insert(invoice)

    if (error) {
      setError(
        'Ù„Ù… ÙŠØªÙ… Ø­ÙØ¸ Ø§Ù„ÙØ§ØªÙˆØ±Ø©: ' +
          error.message
      )
    } else {
      setMessage(
        'ØªÙ… Ø­ÙØ¸ Ø§Ù„ÙØ§ØªÙˆØ±Ø© Ø¨Ù†Ø¬Ø§Ø­ âœ…'
      )

      setForm({
        invoice_number: '',
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        company: '',
        statement: '',
        status: 'ØºÙŠØ± Ù…Ø­ØµÙ„Ø©',
      })

      await loadInvoices()
    }

    setSaving(false)
  }

  async function deleteInvoice(id) {
    if (role !== 'admin') {
      setError(
        'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ø­Ø°Ù Ø§Ù„ÙÙˆØ§ØªÙŠØ±'
      )
      return
    }

    const confirmed = window.confirm(
      'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„ÙØ§ØªÙˆØ±Ø©ØŸ'
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      setError(
        'Ù„Ù… ÙŠØªÙ… Ø­Ø°Ù Ø§Ù„ÙØ§ØªÙˆØ±Ø©: ' +
          error.message
      )
    } else {
      setMessage(
        'ØªÙ… Ø­Ø°Ù Ø§Ù„ÙØ§ØªÙˆØ±Ø© âœ…'
      )
      await loadInvoices()
    }
  }

  return (
    <div>
      <div style={styles.invoiceFormCard}>
        <h3 style={styles.formTitle}>
          Ø¥Ø¶Ø§ÙØ© ÙØ§ØªÙˆØ±Ø© Ø¬Ø¯ÙŠØ¯Ø©
        </h3>

        <form onSubmit={saveInvoice}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>
                Ø±Ù‚Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø©
              </label>

              <input
                style={styles.input}
                value={
                  form.invoice_number
                }
                onChange={(e) =>
                  updateForm(
                    'invoice_number',
                    e.target.value
                  )
                }
                placeholder="Ø±Ù‚Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø©"
              />
            </div>

            <div>
              <label style={styles.label}>
                Ø§Ù„ØªØ§Ø±ÙŠØ®
              </label>

              <input
                style={styles.input}
                type="date"
                value={form.date}
                onChange={(e) =>
                  updateForm(
                    'date',
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label style={styles.label}>
                Ø§Ù„Ù…Ø¨Ù„Øº
              </label>

              <input
                style={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  updateForm(
                    'amount',
                    e.target.value
                  )
                }
                placeholder="Ø§Ù„Ù…Ø¨Ù„Øº"
              />
            </div>

            <div>
              <label style={styles.label}>
                Ø§Ù„Ø´Ø±ÙƒØ©
              </label>

              <input
                style={styles.input}
                value={form.company}
                onChange={(e) =>
                  updateForm(
                    'company',
                    e.target.value
                  )
                }
                placeholder="Ø§Ø³Ù… Ø§Ù„Ø´Ø±ÙƒØ©"
              />
            </div>

            <div>
              <label style={styles.label}>
                Ø­Ø§Ù„Ø© Ø§Ù„ÙØ§ØªÙˆØ±Ø©
              </label>

              <select
                style={styles.input}
                value={form.status}
                onChange={(e) =>
                  updateForm(
                    'status',
                    e.target.value
                  )
                }
              >
                <option value="ØºÙŠØ± Ù…Ø­ØµÙ„Ø©">
                  ØºÙŠØ± Ù…Ø­ØµÙ„Ø©
                </option>

                <option value="Ù…Ø­ØµÙ„Ø©">
                  Ù…Ø­ØµÙ„Ø©
                </option>
              </select>
            </div>

            <div style={styles.fullWidth}>
              <label style={styles.label}>
                Ø§Ù„Ø¨ÙŠØ§Ù†
              </label>

              <textarea
                style={styles.textarea}
                value={form.statement}
                onChange={(e) =>
                  updateForm(
                    'statement',
                    e.target.value
                  )
                }
                placeholder="Ø¨ÙŠØ§Ù† Ø§Ù„ÙØ§ØªÙˆØ±Ø©"
              />
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          {message && (
            <div style={styles.successBox}>
              {message}
            </div>
          )}

          <button
            style={styles.saveButton}
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸...'
              : 'Ø­ÙØ¸ Ø§Ù„ÙØ§ØªÙˆØ±Ø©'}
          </button>
        </form>
      </div>

      <div style={styles.invoiceListCard}>
        <div style={styles.listHeader}>
          <h3>Ø§Ù„ÙÙˆØ§ØªÙŠØ± Ø§Ù„Ù…Ø³Ø¬Ù„Ø©</h3>

          <button
            style={styles.refreshButton}
            onClick={loadInvoices}
          >
            ØªØ­Ø¯ÙŠØ«
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingSmall}>
            Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ÙÙˆØ§ØªÙŠØ±...
          </div>
        ) : invoices.length === 0 ? (
          <div style={styles.noData}>
            Ù„Ø§ ØªÙˆØ¬Ø¯ ÙÙˆØ§ØªÙŠØ± Ù…Ø³Ø¬Ù„Ø© Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Ø±Ù‚Ù… Ø§Ù„ÙØ§ØªÙˆØ±Ø©
                  </th>

                  <th style={styles.th}>
                    Ø§Ù„ØªØ§Ø±ÙŠØ®
                  </th>

                  <th style={styles.th}>
                    Ø§Ù„Ù…Ø¨Ù„Øº
                  </th>

                  <th style={styles.th}>
                    Ø§Ù„Ø´Ø±ÙƒØ©
                  </th>

                  <th style={styles.th}>
                    Ø§Ù„Ø¨ÙŠØ§Ù†
                  </th>

                  <th style={styles.th}>
                    Ø§Ù„Ø­Ø§Ù„Ø©
                  </th>

                  {role === 'admin' && (
                    <th style={styles.th}>
                      Ø¥Ø¬Ø±Ø§Ø¡
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td style={styles.td}>
                      {invoice.invoice_number}
                    </td>

                    <td style={styles.td}>
                      {invoice.date || '-'}
                    </td>

                    <td style={styles.td}>
                      {Number(
                        invoice.amount || 0
                      ).toLocaleString(
                        'ar-EG',
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </td>

                    <td style={styles.td}>
                      {invoice.company || '-'}
                    </td>

                    <td style={styles.td}>
                      {invoice.statement || '-'}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={
                          invoice.status ===
                          'Ù…Ø­ØµÙ„Ø©'
                            ? styles.collected
                            : styles.notCollected
                        }
                      >
                        {invoice.status}
                      </span>
                    </td>

                    {role === 'admin' && (
                      <td style={styles.td}>
                        <button
                          style={
                            styles.deleteButton
                          }
                          onClick={() =>
                            deleteInvoice(
                              invoice.id
                            )
                          }
                        >
                          Ø­Ø°Ù
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   Login
========================================================= */

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function login(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      setError('Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ ØºÙŠØ± ØµØ­ÙŠØ­Ø©')
    }

    setLoading(false)
  }

  return (
    <div
      dir="rtl"
      style={styles.loginPage}
    >
      <div style={styles.loginCard}>
        <div style={styles.logoBoxLarge}>
          EP
        </div>

        <h1 style={styles.loginTitle}>
          Ø´Ø±ÙƒØ© Ø§Ù„ÙƒØªØ±ÙˆØ¨Ø§ÙˆØ± Ù„Ù„Ù…Ù‚Ø§ÙˆÙ„Ø§Øª
        </h1>

        <p style={styles.loginSub}>
          Ø´Ø±ÙƒØ© Ø§Ù„ÙƒØªØ±ÙˆØ¨Ø§ÙˆØ± - ØµÙŠØ§Ù†Ø© Ø¨Ù†ÙˆÙƒ
        </p>

        <form onSubmit={login}>
          <input
            style={styles.input}
            type="email"
            placeholder="Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <button
            style={styles.loginButton}
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¯Ø®ÙˆÙ„...'
              : 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* =========================================================
   Ù…ÙƒÙˆÙ†Ø§Øª Ù…Ø³Ø§Ø¹Ø¯Ø©
========================================================= */

function Field({
  label,
  value,
  onChange,
  type = 'text',
  full = false,
  min,
}) {
  return (
    <div style={full ? styles.fullWidth : {}}>
      <label style={styles.label}>
        {label}
      </label>

      {label === 'Ø§Ù„Ø¨ÙŠØ§Ù†' ||
      label === 'Ù…Ù„Ø§Ø­Ø¸Ø§Øª' ? (
        <textarea
          style={styles.textarea}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={label}
        />
      ) : (
        <input
          style={styles.input}
          type={type}
          min={min}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={label}
        />
      )}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label style={styles.label}>
        {label}
      </label>

      <select
        style={styles.input}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        <option value="">
          Ø§Ø®ØªØ± {label}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function FormCard({ title, children }) {
  return (
    <div style={styles.invoiceFormCard}>
      <h3 style={styles.formTitle}>
        {title}
      </h3>

      {children}
    </div>
  )
}

function ListCard({
  title,
  children,
  empty,
  onRefresh,
}) {
  return (
    <div style={styles.invoiceListCard}>
      <div style={styles.listHeader}>
        <h3>{title}</h3>

        <button
          style={styles.refreshButton}
          onClick={onRefresh}
        >
          ØªØ­Ø¯ÙŠØ«
        </button>
      </div>

      {empty ? (
        <div style={styles.noData}>
          Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¨ÙŠØ§Ù†Ø§Øª Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          {children}
        </div>
      )}
    </div>
  )
}

function SaveButton({
  children,
  loading = false,
}) {
  return (
    <button
      style={styles.saveButton}
      type="submit"
      disabled={loading}
    >
      {loading
        ? 'Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸...'
        : children}
    </button>
  )
}

function Messages({ error, message }) {
  return (
    <>
      {error && (
        <div style={styles.errorBox}>
          {error}
        </div>
      )}

      {message && (
        <div style={styles.successBox}>
          {message}
        </div>
      )}
    </>
  )
}

function ReportCard({
  title,
  value,
  icon,
}) {
  return (
    <div style={styles.reportCard}>
      <div style={styles.reportIcon}>
        {icon}
      </div>

      <div>
        <div style={styles.reportTitle}>
          {title}
        </div>

        <div style={styles.reportValue}>
          {value}
        </div>
      </div>
    </div>
  )
}

function money(value) {
  return Number(value || 0).toLocaleString(
    'ar-EG',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )
}

function getPageTitle(id) {
  const item = menuItems.find(
    (x) => x.id === id
  )

  return item?.title || 'Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©'
}

/* =========================================================
   Styles
========================================================= */

const styles = {
  app: {
    minHeight: '100vh',
    background: '#f3f6f9',
    fontFamily: 'Arial, sans-serif',
  },

  header: {
    height: '70px',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    padding: '0 18px',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },

  menuButton: {
    width: '45px',
    height: '45px',
    border: 'none',
    borderRadius: '10px',
    background: '#1f2937',
    color: '#fff',
    fontSize: '25px',
    cursor: 'pointer',
  },

  headerTitle: {
    marginRight: '15px',
  },

  companyName: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#172033',
  },

  companySub: {
    fontSize: '13px',
    color: '#777',
    marginTop: '3px',
  },

  main: {
    maxWidth: '1200px',
    margin: 'auto',
    padding: '25px 18px',
  },

  welcomeCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow:
      '0 4px 18px rgba(0,0,0,0.06)',
  },

  welcomeTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '7px',
  },

  welcomeText: {
    color: '#777',
  },

  userCircle: {
    width: '55px',
    height: '55px',
    borderRadius: '50%',
    background: '#eef1f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '25px',
  },

  sectionTitle: {
    marginTop: '30px',
    marginBottom: '18px',
  },

  cards: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '15px',
  },

  card: {
    background: '#fff',
    border: 'none',
    borderRadius: '16px',
    padding: '25px 15px',
    cursor: 'pointer',
    boxShadow:
      '0 4px 15px rgba(0,0,0,0.06)',
  },

  cardIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },

  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    zIndex: 100,
  },

  sidebar: {
    width: '300px',
    maxWidth: '85%',
    height: '100%',
    background: '#fff',
    padding: '20px',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },

  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  },

  logoBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#1f2937',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
  },

  logoBoxLarge: {
    width: '70px',
    height: '70px',
    borderRadius: '18px',
    background: '#1f2937',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '25px',
    margin: '0 auto 15px',
  },

  sidebarCompany: {
    fontWeight: 'bold',
    fontSize: '18px',
  },

  sidebarSub: {
    color: '#777',
    fontSize: '13px',
    marginTop: '4px',
  },

  userBox: {
    background: '#f5f7fa',
    borderRadius: '12px',
    padding: '14px',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },

  menuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },

  menuItem: {
    width: '100%',
    border: 'none',
    background: '#fff',
    padding: '13px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    textAlign: 'right',
    fontSize: '15px',
  },

  menuItemActive: {
    background: '#eef1f5',
    fontWeight: 'bold',
  },

  menuIcon: {
    width: '28px',
    textAlign: 'center',
    fontSize: '20px',
  },

  logoutButton: {
    width: '100%',
    marginTop: '25px',
    padding: '13px',
    border: 'none',
    borderRadius: '10px',
    background: '#b42318',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '15px',
  },

  invoiceFormCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '22px',
    boxShadow:
      '0 4px 18px rgba(0,0,0,0.06)',
  },

  formTitle: {
    marginTop: 0,
    marginBottom: '20px',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '15px',
  },

  fullWidth: {
    gridColumn: '1 / -1',
  },

  label: {
    display: 'block',
    marginBottom: '7px',
    fontWeight: 'bold',
    fontSize: '14px',
  },

  textarea: {
    width: '100%',
    minHeight: '90px',
    boxSizing: 'border-box',
    padding: '13px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    fontSize: '15px',
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif',
  },

  saveButton: {
    marginTop: '18px',
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    background: '#1f2937',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },

  secondaryButton: {
    marginTop: '5px',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '9px',
    background: '#eef1f5',
    color: '#172033',
    cursor: 'pointer',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    fontSize: '16px',
    textAlign: 'right',
    background: '#fff',
  },

  readonlyBox: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    fontSize: '16px',
    background: '#f5f7fa',
  },

  netBox: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    background: '#ecfdf3',
    color: '#067647',
  },

  infoBox: {
    background: '#eff6ff',
    color: '#1d4ed8',
    padding: '12px',
    borderRadius: '10px',
    marginTop: '8px',
  },

  successBox: {
    background: '#ecfdf3',
    color: '#067647',
    padding: '10px',
    borderRadius: '8px',
    marginTop: '12px',
  },

  errorBox: {
    background: '#fef3f2',
    color: '#b42318',
    padding: '10px',
    borderRadius: '8px',
    marginTop: '12px',
  },

  invoiceListCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '22px',
    marginTop: '20px',
    boxShadow:
      '0 4px 18px rgba(0,0,0,0.06)',
  },

  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px',
  },

  refreshButton: {
    border: 'none',
    borderRadius: '8px',
    padding: '9px 15px',
    background: '#eef1f5',
    cursor: 'pointer',
  },

  tableWrapper: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px',
  },

  th: {
    background: '#f5f7fa',
    padding: '12px',
    borderBottom: '1px solid #ddd',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },

  td: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    textAlign: 'right',
  },

  collected: {
    display: 'inline-block',
    background: '#ecfdf3',
    color: '#067647',
    padding: '5px 9px',
    borderRadius: '7px',
  },

  notCollected: {
    display: 'inline-block',
    background: '#fff7ed',
    color: '#c2410c',
    padding: '5px 9px',
    borderRadius: '7px',
  },

  deleteButton: {
    border: 'none',
    background: '#fee4e2',
    color: '#b42318',
    padding: '7px 10px',
    borderRadius: '7px',
    cursor: 'pointer',
  },

  loadingSmall: {
    padding: '30px',
    textAlign: 'center',
  },

  noData: {
    padding: '30px',
    textAlign: 'center',
    color: '#777',
  },

  invoicePicker: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '15px',
    marginTop: '10px',
  },

  invoiceCheck: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '11px',
    background: '#fff',
    borderRadius: '8px',
    marginBottom: '7px',
    cursor: 'pointer',
  },

  reportCards: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '15px',
    marginTop: '20px',
  },

  reportCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow:
      '0 4px 15px rgba(0,0,0,0.06)',
  },

  reportIcon: {
    fontSize: '32px',
  },

  reportTitle: {
    color: '#777',
    fontSize: '14px',
    marginBottom: '7px',
  },

  reportValue: {
    fontSize: '20px',
    fontWeight: 'bold',
  },

  loginPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f6f9',
    padding: '20px',
    boxSizing: 'border-box',
  },

  loginCard: {
    width: '100%',
    maxWidth: '430px',
    background: '#fff',
    padding: '35px 25px',
    borderRadius: '20px',
    boxShadow:
      '0 8px 30px rgba(0,0,0,0.1)',
    textAlign: 'center',
    boxSizing: 'border-box',
  },

  loginTitle: {
    fontSize: '22px',
    margin: '10px 0 5px',
  },

  loginSub: {
    color: '#777',
    marginBottom: '25px',
  },

  loginButton: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    background: '#1f2937',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },

  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
  },
}

export default App



