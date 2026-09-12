const fs = require('fs')

const file = 'src/App.jsx'
const backup = 'src/App.before_reports_final.jsx'

let source = fs.readFileSync(backup, 'utf8')

const start = source.indexOf('function ReportsPage')
const marker = source.indexOf('/* =========================================================', start)

if (start === -1) {
  throw new Error('ReportsPage start not found')
}

if (marker === -1) {
  throw new Error('Invoices section marker not found')
}

const newReportsPage = String.raw`
function ReportsPage() {
  const [reportType, setReportType] = useState('invoices')
  const [month, setMonth] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [employees, setEmployees] = useState([])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const reportTitles = {
    salaries: 'تقرير المرتبات',
    vacations: 'تقرير الإجازات',
    advances: 'تقرير السلف',
    collections: 'تقرير الشيكات والتحويلات البنكية',
    invoices: 'تقرير الفواتير',
    custody: 'تقرير العهدة',
    custody_settlements: 'تقرير تصفية العهدة',
    employees: 'تقرير الموظفين',
    purchases: 'تقرير المشتريات',
  }

  const tableNames = {
    salaries: 'salaries',
    vacations: 'vacations',
    advances: 'advances',
    collections: 'collections',
    invoices: 'invoices',
    custody: 'custody',
    custody_settlements: 'custody_settlements',
    employees: 'employees',
    purchases: 'purchases',
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  async function loadEmployees() {
    const { data: rows } = await supabase
      .from('employees')
      .select('*')
      .order('name', { ascending: true })

    setEmployees(rows || [])
  }

  async function load() {
    setLoading(true)

    try {
      let query = supabase
        .from(tableNames[reportType])
        .select('*')

      if (month && reportType !== 'employees') {
        const startDate = month + '-01'
        const endDate = new Date(
          Number(month.slice(0, 4)),
          Number(month.slice(5, 7)),
          0
        )
          .toISOString()
          .slice(0, 10)

        query = query
          .gte('date', startDate)
          .lte('date', endDate)
      }

      if (employeeId && reportType !== 'employees') {
        query = query.eq('employee_id', employeeId)
      }

      const { data: rows, error } = await query

      if (error) {
        console.error(error)
        setData([])
        return
      }

      setData(rows || [])
    } finally {
      setLoading(false)
    }
  }

  function getValue(row, keys) {
    for (const key of keys) {
      if (
        row[key] !== undefined &&
        row[key] !== null &&
        row[key] !== ''
      ) {
        return row[key]
      }
    }

    return ''
  }

  function formatNumber(value) {
    const number = Number(value)

    if (!Number.isFinite(number)) {
      return value || ''
    }

    return number.toLocaleString('ar-EG')
  }

  function formatDate(value) {
    if (!value) return ''

    try {
      return new Date(value).toLocaleDateString('ar-EG')
    } catch {
      return value
    }
  }

  function getEmployeeName(row) {
    const direct = getValue(row, [
      'employee_name',
      'name',
      'employee',
    ])

    if (direct) return direct

    const id = getValue(row, [
      'employee_id',
      'employeeId',
    ])

    const employee = employees.find(
      (item) => String(item.id) === String(id)
    )

    return employee?.name || ''
  }

  function renderCell(row, key) {
    const value = row[key]

    if (key === 'date') {
      return formatDate(value)
    }

    if (
      typeof value === 'number' ||
      [
        'amount',
        'salary',
        'basic_salary',
        'deductions',
        'advances',
        'net',
        'price',
        'total',
        'quantity',
        'installments',
        'installment_count',
      ].includes(key)
    ) {
      return formatNumber(value)
    }

    if (Array.isArray(value)) {
      return value.join('، ')
    }

    return value ?? ''
  }

  function getColumns() {
    if (reportType === 'salaries') {
      return [
        ['employee', 'الموظف'],
        ['salary', 'المرتب'],
        ['deductions', 'الخصومات'],
        ['advances', 'السلف'],
        ['net', 'الصافي'],
      ]
    }

    if (reportType === 'vacations') {
      return [
        ['employee', 'الموظف'],
        ['from', 'من'],
        ['to', 'إلى'],
        ['days', 'عدد الأيام'],
        ['statement', 'البيان'],
      ]
    }

    if (reportType === 'advances') {
      return [
        ['employee', 'الموظف'],
        ['amount', 'قيمة السلفة'],
        ['installments', 'عدد الأقساط'],
        ['deduction', 'الخصم'],
        ['salary_month', 'شهر المرتب'],
        ['statement', 'البيان'],
      ]
    }

    if (reportType === 'collections') {
      return [
        ['type', 'النوع'],
        ['number', 'رقم الشيك / التحويل'],
        ['bank', 'البنك'],
        ['date', 'التاريخ'],
        ['invoice_ids', 'الفواتير'],
        ['amount', 'المبلغ'],
        ['statement', 'البيان'],
      ]
    }

    if (reportType === 'invoices') {
      return [
        ['invoice_number', 'رقم الفاتورة'],
        ['date', 'التاريخ'],
        ['company', 'الشركة'],
        ['amount', 'المبلغ'],
        ['status', 'الحالة'],
        ['collection_number', 'رقم التحصيل'],
        ['bank', 'البنك'],
      ]
    }

    if (reportType === 'custody') {
      return [
        ['employee', 'الموظف'],
        ['item', 'الصنف'],
        ['quantity', 'الكمية'],
        ['price', 'السعر'],
        ['total', 'الإجمالي'],
        ['date', 'التاريخ'],
      ]
    }

    if (reportType === 'custody_settlements') {
      return [
        ['employee', 'الموظف'],
        ['amount', 'المبلغ'],
        ['date', 'التاريخ'],
        ['statement', 'البيان'],
      ]
    }

    if (reportType === 'employees') {
      return [
        ['name', 'الاسم'],
        ['phone', 'الهاتف'],
        ['job', 'الوظيفة'],
        ['salary', 'المرتب'],
        ['address', 'العنوان'],
      ]
    }

    if (reportType === 'purchases') {
      return [
        ['item', 'الصنف'],
        ['quantity', 'الكمية'],
        ['price', 'السعر'],
        ['total', 'الإجمالي'],
        ['date', 'التاريخ'],
        ['statement', 'البيان'],
      ]
    }

    return []
  }

  function displayValue(row, key) {
    if (key === 'employee') {
      return getEmployeeName(row)
    }

    if (key === 'salary') {
      return getValue(row, [
        'salary',
        'basic_salary',
      ])
    }

    if (key === 'deductions') {
      return getValue(row, [
        'deductions',
        'deduction',
      ])
    }

    if (key === 'advances') {
      return getValue(row, [
        'advances',
        'advance',
      ])
    }

    if (key === 'net') {
      const direct = getValue(row, ['net'])

      if (direct !== '') return direct

      const salary = Number(
        getValue(row, ['salary', 'basic_salary']) || 0
      )

      const advances = Number(
        getValue(row, ['advances', 'advance']) || 0
      )

      const deductions = Number(
        getValue(row, ['deductions', 'deduction']) || 0
      )

      return salary - advances - deductions
    }

    if (key === 'from') {
      return formatDate(
        getValue(row, [
          'from',
          'from_date',
          'start_date',
        ])
      )
    }

    if (key === 'to') {
      return formatDate(
        getValue(row, [
          'to',
          'to_date',
          'end_date',
        ])
      )
    }

    if (key === 'days') {
      const direct = getValue(row, [
        'days',
        'leave_days',
        'number_of_days',
      ])

      if (direct !== '') return direct

      const from = new Date(
        getValue(row, [
          'from',
          'from_date',
          'start_date',
        ])
      )

      const to = new Date(
        getValue(row, [
          'to',
          'to_date',
          'end_date',
        ])
      )

      if (
        !Number.isNaN(from.getTime()) &&
        !Number.isNaN(to.getTime())
      ) {
        return Math.floor(
          (to - from) / 86400000
        ) + 1
      }

      return ''
    }

    if (key === 'installments') {
      return getValue(row, [
        'installments',
        'installment_count',
        'number_of_installments',
      ])
    }

    if (key === 'deduction') {
      return getValue(row, [
        'deduction',
        'installment',
        'installment_amount',
      ])
    }

    if (key === 'salary_month') {
      return getValue(row, [
        'salary_month',
        'month',
      ])
    }

    if (key === 'collection_number') {
      return getValue(row, [
        'collection_number',
        'collection_number',
        'number',
      ])
    }

    if (key === 'invoice_ids') {
      const ids = getValue(row, [
        'invoice_ids',
      ])

      if (Array.isArray(ids)) {
        return ids.join('، ')
      }

      return ids
    }

    return renderCell(row, key)
  }

  function renderTable() {
    const columns = getColumns()

    if (!data.length) {
      return (
        <div style={{
          padding: '30px',
          textAlign: 'center',
          color: '#777',
        }}>
          لا توجد بيانات لهذا التقرير
        </div>
      )
    }

    return (
      <div style={{
        overflowX: 'auto',
        marginTop: '20px',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: '#fff',
        }}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>

              {columns.map(([key, title]) => (
                <th
                  key={key}
                  style={thStyle}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr key={row.id || index}>
                <td style={tdStyle}>
                  {index + 1}
                </td>

                {columns.map(([key]) => (
                  <td
                    key={key}
                    style={tdStyle}
                  >
                    {displayValue(row, key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  function printReport() {
    if (!showReport) {
      alert('اضغط أولاً على عرض التقرير')
      return
    }

    const columns = getColumns()

    const rowsHtml = data
      .map((row, index) => {
        const cells = columns
          .map(
            ([key]) =>
              '<td>' +
              String(displayValue(row, key) ?? '') +
              '</td>'
          )
          .join('')

        return '<tr><td>' + (index + 1) + '</td>' + cells + '</tr>'
      })
      .join('')

    const headersHtml = columns
      .map(([, title]) => '<th>' + title + '</th>')
      .join('')

    const win = window.open('', '_blank')

    if (!win) {
      alert('يرجى السماح بفتح نافذة الطباعة')
      return
    }

    win.document.write(
      '<!DOCTYPE html>' +
      '<html dir="rtl">' +
      '<head>' +
      '<meta charset="UTF-8">' +
      '<title>' +
      reportTitles[reportType] +
      '</title>' +
      '<style>' +
      'body{font-family:Arial,sans-serif;direction:rtl;padding:25px}' +
      'h1{text-align:center;margin-bottom:5px}' +
      'p{text-align:center;color:#666}' +
      'table{width:100%;border-collapse:collapse;margin-top:25px}' +
      'th,td{border:1px solid #999;padding:8px;text-align:center}' +
      'th{background:#eee}' +
      '@media print{button{display:none}}' +
      '</style>' +
      '</head>' +
      '<body>' +
      '<h1>شركة الكتروباور للمقاولات</h1>' +
      '<h2 style="text-align:center">' +
      reportTitles[reportType] +
      '</h2>' +
      '<p>' +
      (month ? 'الشهر: ' + month : '') +
      '</p>' +
      '<table>' +
      '<thead><tr><th>#</th>' +
      headersHtml +
      '</tr></thead>' +
      '<tbody>' +
      rowsHtml +
      '</tbody>' +
      '</table>' +
      '<script>' +
      'window.onload=function(){window.print()}' +
      '<\/script>' +
      '</body></html>'
    )

    win.document.close()
  }

  return (
    <div dir="rtl">
      <FormCard title="التقارير">

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: '15px',
        }}>

          <div>
            <label style={labelStyle}>
              نوع التقرير
            </label>

            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value)
                setShowReport(false)
                setData([])
              }}
              style={inputStyle}
            >
              <option value="salaries">المرتبات</option>
              <option value="vacations">الإجازات</option>
              <option value="advances">السلف</option>
              <option value="collections">
                الشيكات والتحويلات البنكية
              </option>
              <option value="invoices">الفواتير</option>
              <option value="custody">العهدة</option>
              <option value="custody_settlements">
                تصفية العهدة
              </option>
              <option value="employees">الموظفين</option>
              <option value="purchases">المشتريات</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              الشهر
            </label>

            <input
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value)
                setShowReport(false)
              }}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              الموظف
            </label>

            <select
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value)
                setShowReport(false)
              }}
              style={inputStyle}
            >
              <option value="">
                كل الموظفين
              </option>

              {employees.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px',
          flexWrap: 'wrap',
        }}>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={async () => {
              setShowReport(true)
              await load()
            }}
          >
            عرض التقرير
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={printReport}
          >
            طباعة / PDF
          </button>

        </div>

      </FormCard>

      {showReport && (
        <ListCard
          title={reportTitles[reportType]}
          loading={loading}
          empty={!data.length}
          onRefresh={load}
        >
          {renderTable()}
        </ListCard>
      )}
    </div>
  )
}

const thStyle = {
  border: '1px solid #ddd',
  padding: '10px',
  background: '#f5f5f5',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  border: '1px solid #ddd',
  padding: '9px',
  textAlign: 'center',
}

const labelStyle = {
  display: 'block',
  marginBottom: '7px',
  fontWeight: 'bold',
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '6px',
  boxSizing: 'border-box',
}
`

source =
  source.slice(0, start) +
  newReportsPage +
  '\n\n' +
  source.slice(marker)

fs.writeFileSync(file, source, 'utf8')

console.log('ReportsPage replaced successfully.')