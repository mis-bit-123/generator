export interface InvoiceItem {
  id: string;
  no: number;
  itemDetails: string;
  uom: string;
  qty: number;
  rate: number;
  amount: number;
  isDiscount?: boolean;
  discountLabel?: string;
}

export interface BankDetails {
  companyName: string;
  accountNo: string;
  branchName: string;
  ifscCode: string;
}

export interface PaymentTerms {
  payment: string;
  insurance: string;
  freight: string;
}

export interface CompanyInfo {
  gstNo: string;
  stateCode: string;
  cin: string;
}

export interface InvoiceData {
  // Header
  yourPoNo: string;
  yourPoDate: string;
  proformaInvoiceNo: string;
  proformaInvoiceDate: string;
  
  // Buyer & Consignee
  buyerName: string;
  buyerAddress: string;
  buyerGstNo: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeGstNo: string;
  
  // Items
  items: InvoiceItem[];
  
  // Bank & Terms
  bankDetails: BankDetails;
  paymentTerms: PaymentTerms;
  
  // Company Info
  companyInfo: CompanyInfo;
  
  // Calculated fields
  basicAmount: number;
  gstRate: number;
  gstAmount: number;
  netAmount: number;
  amountInWords: string;
  
  // Notes
  specialNotes: string;
}

export const defaultInvoiceData: InvoiceData = {
  yourPoNo: '',
  yourPoDate: new Date().toLocaleDateString('en-GB'),
  proformaInvoiceNo: '',
  proformaInvoiceDate: new Date().toLocaleDateString('en-GB'),
  
  buyerName: '',
  buyerAddress: '',
  buyerGstNo: '',
  consigneeName: '',
  consigneeAddress: '',
  consigneeGstNo: '',
  
  items: [
    {
      id: '1',
      no: 1,
      itemDetails: '',
      uom: 'Nos.',
      qty: 1,
      rate: 0,
      amount: 0,
    }
  ],
  
  bankDetails: {
    companyName: 'Coninfra Machinery P. Ltd.',
    accountNo: '59229099941311',
    branchName: 'Usmanpura, Ahmedabad',
    ifscCode: 'HDFC0001682',
  },
  
  paymentTerms: {
    payment: '100% Advance against P.I.',
    insurance: 'Transit Insurance at actual should be borne by you.',
    freight: 'Extra at actual.',
  },
  
  companyInfo: {
    gstNo: '24AAJCC0082C1Z7',
    stateCode: '24',
    cin: 'U29308GJ2020PTC116940',
  },
  
  basicAmount: 0,
  gstRate: 18,
  gstAmount: 0,
  netAmount: 0,
  amountInWords: '',
  
  specialNotes: '',
};
