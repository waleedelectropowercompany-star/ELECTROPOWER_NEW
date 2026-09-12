const fs = require('fs')

const file = 'src/App.jsx'

let s = fs.readFileSync(file, 'utf8')

const oldText = `    if (reportType === 'invoices') {`

const newText = `    if (
      reportType === 'invoices' ||
      reportType === 'invoice_collected' ||
      reportType === 'invoice_uncollected'
    ) {`

const count = (s.match(
  /if \(reportType === 'invoices'\) \{/g
) || []).length

if (count === 0) {
  throw new Error('Invoice columns condition not found')
}

s = s.replace(oldText, newText)

fs.writeFileSync(file, s, 'utf8')

console.log('Invoice columns fixed successfully.')