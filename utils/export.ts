import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { TransactionWithDetails } from '../types';
import { formatCurrency, formatDate } from './formatters';

async function writeAndShare(
  filename: string,
  content: string,
  mimeType: string,
  dialogTitle: string
): Promise<void> {
  const file = new File(Paths.cache, filename);
  await file.write(content);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle });
  }
}

export async function exportCSV(
  transactions: TransactionWithDetails[],
  currencyCode: string
): Promise<void> {
  const header = 'Date,Type,Category,Account,Amount,Note\n';
  const rows = transactions.map((t) =>
    [
      formatDate(t.date, 'medium'),
      t.type,
      `"${t.categoryName}"`,
      `"${t.accountName}"`,
      formatCurrency(t.amount, currencyCode),
      `"${(t.note ?? '').replace(/"/g, '""')}"`,
    ].join(',')
  );

  await writeAndShare(
    `transactions_${Date.now()}.csv`,
    header + rows.join('\n'),
    'text/csv',
    'Export Transactions'
  );
}

export async function exportSimplePDF(
  transactions: TransactionWithDetails[],
  currencyCode: string,
  month: string
): Promise<void> {
  const rows = transactions
    .map(
      (t) => `
    <tr>
      <td>${formatDate(t.date, 'short')}</td>
      <td>${t.categoryName}</td>
      <td>${t.accountName}</td>
      <td style="color:${t.type === 'income' ? 'green' : 'red'}">
        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount, currencyCode)}
      </td>
      <td>${t.note ?? ''}</td>
    </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <style>
      body { font-family: sans-serif; padding: 20px; }
      h1 { color: #1e293b; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #e2e8f0; padding: 8px; font-size: 13px; }
      th { background: #f1f5f9; }
    </style>
  </head><body>
    <h1>Transaction Report — ${month}</h1>
    <table>
      <thead><tr><th>Date</th><th>Category</th><th>Account</th><th>Amount</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </body></html>`;

  await writeAndShare(
    `report_${Date.now()}.html`,
    html,
    'text/html',
    'Export Report'
  );
}
