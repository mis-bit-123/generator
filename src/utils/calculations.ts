import type { InvoiceItem } from '@/types/invoice';

export function calculateItemAmount(qty: number, rate: number): number {
  return qty * rate;
}

export function calculateBasicAmount(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateGST(basicAmount: number, gstRate: number): number {
  return Math.round(basicAmount * (gstRate / 100));
}

export function calculateNetAmount(basicAmount: number, gstAmount: number): number {
  return basicAmount + gstAmount;
}

// Convert number to words in Indian format
export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    }
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  }
  
  function convert(n: number): string {
    if (n === 0) return '';
    
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;
    
    let result = '';
    
    if (crore > 0) {
      result += convertLessThanThousand(crore) + ' Crore';
    }
    if (lakh > 0) {
      result += (result ? ' ' : '') + convertLessThanThousand(lakh) + ' Lakh';
    }
    if (thousand > 0) {
      result += (result ? ' ' : '') + convertLessThanThousand(thousand) + ' Thousand';
    }
    if (remainder > 0) {
      result += (result ? ' ' : '') + convertLessThanThousand(remainder);
    }
    
    return result;
  }
  
  return convert(Math.floor(num)) + ' only';
}

// Format currency with Indian number format
export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Format number without decimals for display
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}
