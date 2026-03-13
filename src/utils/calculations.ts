/**
 * Format a number as Indian currency (₹ with commas: 1,00,000.00)
 * FIX: use 'en-IN' locale so thousands are separated by commas, not dots.
 */
export function formatCurrency(amount: number): string {
  const n = typeof amount === 'number' && isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// ─── numberToWords ────────────────────────────────────────────────────────────

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
  'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

function belowHundred(n: number): string {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
}

function belowThousand(n: number): string {
  if (n < 100) return belowHundred(n);
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + belowHundred(n % 100) : '');
}

export function numberToWords(amount: number): string {
  if (!amount || amount === 0) return 'Zero Only';

  const rupees = Math.floor(Math.abs(amount));
  const paise  = Math.round((Math.abs(amount) - rupees) * 100);

  const convert = (n: number): string => {
    if (n === 0) return '';
    if (n < 1000) return belowThousand(n);

    const crore  = Math.floor(n / 10_000_000);
    const lakh   = Math.floor((n % 10_000_000) / 100_000);
    const thous  = Math.floor((n % 100_000) / 1_000);
    const rest   = n % 1_000;

    const parts: string[] = [];
    if (crore)  parts.push(belowThousand(crore)  + ' Crore');
    if (lakh)   parts.push(belowThousand(lakh)   + ' Lakh');
    if (thous)  parts.push(belowThousand(thous)  + ' Thousand');
    if (rest)   parts.push(belowThousand(rest));
    return parts.join(' ');
  };

  let words = convert(rupees);
  if (paise > 0) {
    words += ' and ' + belowHundred(paise) + ' Paise';
  }
  return words.trim() + ' Only';
}