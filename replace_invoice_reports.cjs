const fs = require('fs')

const file = 'src/App.jsx'

let s = fs.readFileSync(file, 'utf8')

s = s.replace(
  "const [reportType, setReportType] = useState('invoices')",
  "const [reportType, setReportType] = useState('invoice_collected')"
)

s = s.replace(
  "invoices: 'تقرير الفواتير',",
  "invoice_collected: 'تقرير الفواتير المحصلة',\n    invoice_uncollected: 'تقرير الفواتير غير المحصلة',"
)

s = s.replace(
  "invoices: 'invoices',",
  "invoice_collected: 'invoices',\n    invoice_uncollected: 'invoices',"
)

const oldQuery = `      if (month && reportType !== 'employees') {
        const startDate = month + '-01'`

const newQuery = `      if (
        (reportType === 'invoice_collected' ||
          reportType === 'invoice_uncollected') &&
        reportType !== 'employees'
      ) {
        query = query.eq(
          'status',
          reportType === 'invoice_collected'
            ? 'محصلة'
            : 'غير محصلة'
        )
      }

      if (month && reportType !== 'employees') {
        const startDate = month + '-01'`

if (!s.includes(oldQuery)) {
  throw new Error('Load section not found')
}

s = s.replace(oldQuery, newQuery)

s = s.replace(
  `<option value="invoices">الفواتير</option>`,
  `<option value="invoice_collected">الفواتير المحصلة</option>
              <option value="invoice_uncollected">الفواتير غير المحصلة</option>`
)

fs.writeFileSync(file, s, 'utf8')

console.log('Invoice reports updated successfully.')