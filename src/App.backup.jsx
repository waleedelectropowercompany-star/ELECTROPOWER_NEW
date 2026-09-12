import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const menuItems = [
  { id: 'dashboard', title: 'الرئيسية', icon: '⌂', roles: ['admin', 'invoice_entry'] },
  { id: 'employees', title: 'الموظفين', icon: '👥', roles: ['admin'] },
  { id: 'vacations', title: 'الإجازات', icon: '📅', roles: ['admin'] },
  { id: 'salaries', title: 'المرتبات', icon: '💰', roles: ['admin'] },
  { id: 'advances', title: 'السلف', icon: '💵', roles: ['admin'] },
  { id: 'purchases', title: 'المشتريات', icon: '🛒', roles: ['admin'] },
  { id: 'custody', title: 'العهدة', icon: '📦', roles: ['admin'] },
  { id: 'invoices', title: 'الفواتير', icon: '🧾', roles: ['admin', 'invoice_entry'] },
  { id: 'collections', title: 'الشيكات والتحويلات', icon: '🏦', roles: ['admin'] },
  { id: 'reports', title: 'التقارير', icon: '📊', roles: ['admin'] },
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
        جاري التحميل...
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
          ☰
        </button>

        <div style={styles.headerTitle}>
          <div style={styles.companyName}>
            شركة الكتروباور للمقاولات
          </div>
          <div style={styles.companySub}>
            شركة الكتروباور - صيانة بنوك
          </div>
        </div>
      </header>

      {menuOpen && (
        <div style={styles.overlay} onClick={() => setMenuOpen(false)}>
          <aside
            style={styles.sidebar}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.sidebarHeader}>
              <div style={styles.logoBox}>EP</div>

              <div>
                <div style={styles.sidebarCompany}>
                  شركة الكتروباور
                </div>
                <div style={styles.sidebarSub}>
                  صيانة بنوك
                </div>
              </div>
            </div>

            <div style={styles.userBox}>
              <strong>{profile?.display_name || 'المستخدم'}</strong>

              <span>
                {role === 'admin'
                  ? 'مدير النظام'
                  : 'إدخال الفواتير'}
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
                  <span style={styles.menuIcon}>{item.icon}</span>
                  <span>{item.title}</span>
                </button>
              ))}
            </div>

            <button style={styles.logoutButton} onClick={logout}>
              تسجيل الخروج
            </button>
          </aside>
        </div>
      )}

      <main style={styles.main}>
        <div style={styles.welcomeCard}>
          <div>
            <div style={styles.welcomeTitle}>
              مرحبًا {profile?.display_name || 'بك'}
            </div>

            <div style={styles.welcomeText}>
              {role === 'admin'
                ? 'أنت تستخدم حساب مدير النظام'
                : 'أنت تستخدم صلاحية إدخال الفواتير'}
            </div>
          </div>

          <div style={styles.userCircle}>👤</div>
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
                  <div style={styles.cardIcon}>{item.icon}</div>
                  <div style={styles.cardTitle}>{item.title}</div>
                </button>
              ))}
          </div>
        )}

        {activePage === 'invoices' && (
          <InvoicesPage session={session} role={role} />
        )}

        {activePage !== 'dashboard' && activePage !== 'invoices' && (
          <div style={styles.emptyPage}>
            <div style={styles.emptyIcon}>
              {menuItems.find((x) => x.id === activePage)?.icon}
            </div>

            <h3>{getPageTitle(activePage)}</h3>

            <p>
              سيتم تجهيز شاشة {getPageTitle(activePage)} في الخطوة التالية.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

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
    status: 'غير محصلة',
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
      setError('تعذر تحميل الفواتير: ' + error.message)
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
      setError('اكتب رقم الفاتورة')
      return
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError('اكتب مبلغ الفاتورة')
      return
    }

    setSaving(true)

    const invoice = {
      id: crypto.randomUUID(),
      invoice_number: form.invoice_number.trim(),
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
      setError('لم يتم حفظ الفاتورة: ' + error.message)
    } else {
      setMessage('تم حفظ الفاتورة بنجاح ✅')

      setForm({
        invoice_number: '',
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        company: '',
        statement: '',
        status: 'غير محصلة',
      })

      await loadInvoices()
    }

    setSaving(false)
  }

  async function deleteInvoice(id) {
    if (role !== 'admin') {
      setError('ليس لديك صلاحية حذف الفواتير')
      return
    }

    const confirmed = window.confirm(
      'هل أنت متأكد من حذف هذه الفاتورة؟'
    )

    if (!confirmed) return

    setError('')
    setMessage('')

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      setError('لم يتم حذف الفاتورة: ' + error.message)
    } else {
      setMessage('تم حذف الفاتورة ✅')
      await loadInvoices()
    }
  }

  return (
    <div>
      <div style={styles.invoiceFormCard}>
        <h3 style={styles.formTitle}>إضافة فاتورة جديدة</h3>

        <form onSubmit={saveInvoice}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>رقم الفاتورة</label>
              <input
                style={styles.input}
                value={form.invoice_number}
                onChange={(e) =>
                  updateForm('invoice_number', e.target.value)
                }
                placeholder="رقم الفاتورة"
              />
            </div>

            <div>
              <label style={styles.label}>التاريخ</label>
              <input
                style={styles.input}
                type="date"
                value={form.date}
                onChange={(e) =>
                  updateForm('date', e.target.value)
                }
              />
            </div>

            <div>
              <label style={styles.label}>المبلغ</label>
              <input
                style={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  updateForm('amount', e.target.value)
                }
                placeholder="المبلغ"
              />
            </div>

            <div>
              <label style={styles.label}>الشركة</label>
              <input
                style={styles.input}
                value={form.company}
                onChange={(e) =>
                  updateForm('company', e.target.value)
                }
                placeholder="اسم الشركة"
              />
            </div>

            <div>
              <label style={styles.label}>حالة الفاتورة</label>
              <select
                style={styles.input}
                value={form.status}
                onChange={(e) =>
                  updateForm('status', e.target.value)
                }
              >
                <option value="غير محصلة">غير محصلة</option>
                <option value="محصلة">محصلة</option>
              </select>
            </div>

            <div style={styles.fullWidth}>
              <label style={styles.label}>البيان</label>
              <textarea
                style={styles.textarea}
                value={form.statement}
                onChange={(e) =>
                  updateForm('statement', e.target.value)
                }
                placeholder="بيان الفاتورة"
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
            {saving ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
          </button>
        </form>
      </div>

      <div style={styles.invoiceListCard}>
        <div style={styles.listHeader}>
          <h3>الفواتير المسجلة</h3>

          <button
            style={styles.refreshButton}
            onClick={loadInvoices}
          >
            تحديث
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingSmall}>
            جاري تحميل الفواتير...
          </div>
        ) : invoices.length === 0 ? (
          <div style={styles.noData}>
            لا توجد فواتير مسجلة حتى الآن.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>رقم الفاتورة</th>
                  <th style={styles.th}>التاريخ</th>
                  <th style={styles.th}>المبلغ</th>
                  <th style={styles.th}>الشركة</th>
                  <th style={styles.th}>البيان</th>
                  <th style={styles.th}>الحالة</th>
                  {role === 'admin' && (
                    <th style={styles.th}>إجراء</th>
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
                      {Number(invoice.amount || 0).toLocaleString(
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
                          invoice.status === 'محصلة'
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
                          style={styles.deleteButton}
                          onClick={() =>
                            deleteInvoice(invoice.id)
                          }
                        >
                          حذف
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

function getPageTitle(id) {
  const item = menuItems.find((x) => x.id === id)
  return item?.title || 'الرئيسية'
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function login(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('بيانات الدخول غير صحيحة')
    }

    setLoading(false)
  }

  return (
    <div dir="rtl" style={styles.loginPage}>
      <div style={styles.loginCard}>
        <div style={styles.logoBoxLarge}>EP</div>

        <h1 style={styles.loginTitle}>
          شركة الكتروباور للمقاولات
        </h1>

        <p style={styles.loginSub}>
          شركة الكتروباور - صيانة بنوك
        </p>

        <form onSubmit={login}>
          <input
            style={styles.input}
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  )
}

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
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
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
    maxWidth: '1100px',
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
    boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '15px',
  },

  card: {
    background: '#fff',
    border: 'none',
    borderRadius: '16px',
    padding: '25px 15px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
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
    boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
  },

  formTitle: {
    marginTop: 0,
    marginBottom: '20px',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
    boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
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

  emptyPage: {
    background: '#fff',
    borderRadius: '18px',
    padding: '50px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
  },

  emptyIcon: {
    fontSize: '55px',
    marginBottom: '15px',
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
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
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

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    fontSize: '16px',
    textAlign: 'right',
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