const fs = require('fs');
const path = require('path');

const pages = [
  'vendors/VendorsList.jsx',
  'vendors/VendorNew.jsx',
  'vendors/VendorShow.jsx',
  'transactions/TransactionsList.jsx',
  'transactions/TransactionNew.jsx',
  'salaries/SalariesList.jsx',
  'salaries/SalaryNew.jsx',
  'reports/ReportsHub.jsx',
  'loans/LoansList.jsx',
  'loans/LoanNew.jsx',
  'invoices/InvoicesList.jsx',
  'invoices/InvoiceNew.jsx',
  'expenses/ExpensesList.jsx',
  'expenses/ExpenseNew.jsx',
  'fuel/FuelList.jsx',
  'fuel/FuelNew.jsx',
  'inventory/InventoryList.jsx',
  'inventory/InventoryNew.jsx',
  'drivers/DriversList.jsx',
  'drivers/DriverNew.jsx',
  'documents/DocumentsList.jsx',
  'documents/DocumentNew.jsx',
  'attendance/AttendanceManager.jsx',
  'bilties/BiltiesList.jsx',
  'bilties/BiltyNew.jsx',
];

const base = path.join('c:', 'Users', 'AzmatAli', 'Desktop', 'zipkart-integrated-logistics', 'zipkart react', 'client', 'src', 'pages');

pages.forEach(p => {
  const fp = path.join(base, p);
  if (!fs.existsSync(fp)) {
    console.log('MISSING:', p);
    return;
  }
  let src = fs.readFileSync(fp, 'utf8');

  // Remove the AppShell import line
  src = src.replace(/^import AppShell from ['"].*AppShell.*['"];\r?\n/m, '');

  // Remove opening <AppShell> (with optional whitespace/newline after)
  src = src.replace(/^\s*<AppShell>\r?\n/m, '');

  // Remove closing </AppShell>
  src = src.replace(/^\s*<\/AppShell>\r?\n/m, '');

  fs.writeFileSync(fp, src, 'utf8');
  console.log('FIXED:', p);
});

console.log('All done!');
