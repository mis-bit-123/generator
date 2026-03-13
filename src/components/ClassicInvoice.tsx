// import { useRef, useState } from 'react';
// import type { InvoiceData, InvoiceItem } from '@/types/invoice';
// import { formatCurrency, numberToWords } from '@/utils/calculations';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Plus, Trash2, Download } from 'lucide-react';

// import riyaStamp from "@/components/img/riya-stamp.jpg";
// import shStamp from "@/components/img/sh-stamp.jpg";
// import hpStamp from "@/components/img/hp-stamp.jpg";
// import shivaniStamp from "@/components/img/shivani-stamp.jpg";
// import sssStamp from "@/components/img/sss-stamp.jpg";


// interface ClassicInvoiceProps {
//   data: InvoiceData;
//   onDataChange: (data: InvoiceData) => void;
//   onExportPDF: () => void;
// }

// const LOGO_URL = 'https://i.imghippo.com/files/RfC9405A.jpg';
// const FOOTER_URL = 'https://i.imghippo.com/files/mFd4056UY.png';

// /*const STAMP_OPTIONS = [
//   { value: 'default', label: 'Default (Sweta Harit Sharma)', file: null },
//   { value: 'riya', label: 'Riya', file: 'riya-stamp.jpg' },
//   { value: 'sh', label: 'SH', file: 'sh-stamp.jpg' },
//   { value: 'hp', label: 'HP', file: 'hp-stamp.jpg' },
//   { value: 'shivani', label: 'Shivani', file: 'shivani-stamp.jpg' },
//   { value: 'sss', label: 'SSS', file: 'sss-stamp.jpg' },
// ];*/

// const STAMP_OPTIONS = [
//   { value: "default", label: "Default (Sweta Harit Sharma)", file: null },
//   { value: "riya", label: "Riya", file: riyaStamp },
//   { value: "sh", label: "SH", file: shStamp },
//   { value: "hp", label: "HP", file: hpStamp },
//   { value: "shivani", label: "Shivani", file: shivaniStamp },
//   { value: "sss", label: "SSS", file: sssStamp },
// ];

// export default function ClassicInvoice({ data, onDataChange, onExportPDF }: ClassicInvoiceProps) {
//   const invoiceRef = useRef<HTMLDivElement>(null);
//   const [selectedStamp, setSelectedStamp] = useState<string>('default');

//   const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
//     const updatedItems = data.items.map(item => {
//       if (item.id === id) {
//         const updatedItem = { ...item, [field]: value };
//         if (field === 'qty' || field === 'rate') {
//           const qty = field === 'qty' ? (value as number) || 0 : updatedItem.qty || 0;
//           const rate = field === 'rate' ? (value as number) || 0 : updatedItem.rate || 0;
//           updatedItem.amount = qty * rate;
//         }
//         return updatedItem;
//       }
//       return item;
//     });
    
//     calculateTotals(updatedItems);
//   };

//   const calculateTotals = (items: InvoiceItem[]) => {
//     // Calculate basic amount from regular items only
//     const regularItems = items.filter(item => !item.isDiscount);
//     const discountItems = items.filter(item => item.isDiscount);
    
//     const basicAmount = regularItems.reduce((sum, item) => sum + (item.amount || 0), 0);
//     const discountAmount = discountItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    
//     // Subtract discount from basic amount
//     const taxableAmount = basicAmount - discountAmount;
//     const gstAmount = Math.round(taxableAmount * (data.gstRate / 100));
//     const netAmount = taxableAmount + gstAmount;
    
//     onDataChange({
//       ...data,
//       items,
//       basicAmount: taxableAmount,
//       gstAmount,
//       netAmount,
//       amountInWords: numberToWords(netAmount),
//     });
//   };

//   const addItem = () => {
//     const newItem: InvoiceItem = {
//       id: Date.now().toString(),
//       no: data.items.filter(i => !i.isDiscount).length + 1,
//       itemDetails: '',
//       uom: 'Nos.',
//       qty: undefined as any,
//       rate: undefined as any,
//       amount: 0,
//     };
//     onDataChange({ ...data, items: [...data.items, newItem] });
//   };

//   const addDiscount = () => {
//     const newDiscount: InvoiceItem = {
//       id: Date.now().toString(),
//       no: 0,
//       itemDetails: '',
//       uom: '',
//       qty: 0,
//       rate: 0,
//       amount: 0,
//       isDiscount: true,
//       discountLabel: 'Special Discount',
//     };
//     onDataChange({ ...data, items: [...data.items, newDiscount] });
//   };

//   const removeItem = (id: string) => {
//     const updatedItems = data.items.filter(item => item.id !== id);
//     let itemNo = 1;
//     updatedItems.forEach(item => {
//       if (!item.isDiscount) {
//         item.no = itemNo++;
//       }
//     });
    
//     calculateTotals(updatedItems);
//   };

//   const updateField = (field: keyof InvoiceData, value: string | number) => {
//     if (field === 'gstRate') {
//       const newData = { ...data, gstRate: value as number };
//       const regularItems = data.items.filter(item => !item.isDiscount);
//       const discountItems = data.items.filter(item => item.isDiscount);
//       const basicAmount = regularItems.reduce((sum, item) => sum + (item.amount || 0), 0);
//       const discountAmount = discountItems.reduce((sum, item) => sum + (item.amount || 0), 0);
//       const taxableAmount = basicAmount - discountAmount;
//       const gstAmount = Math.round(taxableAmount * ((value as number) / 100));
//       const netAmount = taxableAmount + gstAmount;
//       onDataChange({
//         ...newData,
//         gstAmount,
//         netAmount,
//         amountInWords: numberToWords(netAmount),
//       });
//     } else {
//       onDataChange({ ...data, [field]: value });
//     }
//   };

//   const updateNestedField = (
//     parent: 'bankDetails' | 'paymentTerms' | 'companyInfo',
//     field: string,
//     value: string
//   ) => {
//     onDataChange({
//       ...data,
//       [parent]: { ...data[parent], [field]: value },
//     });
//   };

//   const handleBuyerChange = (field: string, value: string) => {
//     const updates: Partial<InvoiceData> = {};
//     if (field === 'buyerName') updates.buyerName = value;
//     if (field === 'buyerAddress') updates.buyerAddress = value;
//     if (field === 'buyerGstNo') updates.buyerGstNo = value;
    
//     // Auto-fill consignee with full text
//     if (field === 'buyerName') updates.consigneeName = value;
//     if (field === 'buyerAddress') updates.consigneeAddress = value;
//     if (field === 'buyerGstNo') updates.consigneeGstNo = value;
    
//     onDataChange({ ...data, ...updates });
//   };

//   const handleStampChange = (value: string) => {
//     setSelectedStamp(value);
//   };

//   const getStampUrl = () => {
//     if (!selectedStamp || selectedStamp === 'default') return null;
//     const stamp = STAMP_OPTIONS.find(s => s.value === selectedStamp);
//      return stamp?.file || null; //
//      };

//   const gstOptions = Array.from({ length: 100 }, (_, i) => i + 1);

//   // Calculate display values
//   const regularItems = data.items.filter(item => !item.isDiscount);
//   const discountItems = data.items.filter(item => item.isDiscount);
//   const grossAmount = regularItems.reduce((sum, item) => sum + (item.amount || 0), 0);
//   const discountAmount = discountItems.reduce((sum, item) => sum + (item.amount || 0), 0);

//   return (
//     <div className="classic-invoice-container">
//       {/* Export Button - Web Only */}
//       <div className="flex justify-end mb-4 no-print gap-2 flex-wrap">
//         <div className="flex items-center gap-2 mr-4">
//           <span className="text-sm font-medium">GST Rate:</span>
//           <Select value={data.gstRate.toString()} onValueChange={(v) => updateField('gstRate', parseInt(v))}>
//             <SelectTrigger className="w-20">
//               <SelectValue placeholder="18%" />
//             </SelectTrigger>
//             <SelectContent>
//               {gstOptions.map(rate => (
//                 <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="flex items-center gap-2 mr-4">
//           <span className="text-sm font-medium">Stamp:</span>
//           <Select value={selectedStamp} onValueChange={handleStampChange}>
//             <SelectTrigger className="w-48">
//               <SelectValue placeholder="Select" />
//             </SelectTrigger>
//             <SelectContent>
//               {STAMP_OPTIONS.map(stamp => (
//                 <SelectItem key={stamp.value} value={stamp.value}>{stamp.label}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <Button onClick={onExportPDF} className="bg-blue-600 hover:bg-blue-700">
//           <Download className="w-4 h-4 mr-2" />
//           Store as PDF
//         </Button>
//       </div>

//       {/* Invoice Content */}
//       <div ref={invoiceRef} className="classic-invoice bg-white">
//         {/* Logo Section - Right Aligned */}
//         <div className="invoice-logo-section">
//           <img src={LOGO_URL} alt="Coninfra Machinery" className="invoice-logo" />
//         </div>

//         {/* Title */}
//         <div className="invoice-title-section">
//           <h1 className="invoice-title">PROFORMA INVOICE</h1>
//         </div>

//         {/* Header Info */}
//         <div className="invoice-header-info">
//           <div className="header-left">
//             <div className="info-row">
//               <span className="info-label">Your PO no.</span>
//               <Input
//                 value={data.yourPoNo}
//                 onChange={(e) => updateField('yourPoNo', e.target.value)}
//                 className="info-input"
//                 placeholder="Enter PO Number"
//               />
//             </div>
//             <div className="info-row">
//               <span className="info-label">Date:</span>
//               <Input
//                 value={data.yourPoDate}
//                 onChange={(e) => updateField('yourPoDate', e.target.value)}
//                 className="info-input"
//               />
//             </div>
//           </div>
//           <div className="header-right">
//             <div className="info-row">
//               <span className="info-label">Proforma Invoice No.:</span>
//               <Input
//                 value={data.proformaInvoiceNo}
//                 onChange={(e) => updateField('proformaInvoiceNo', e.target.value)}
//                 className="info-input"
//                 placeholder="P###"
//               />
//             </div>
//             <div className="info-row">
//               <span className="info-label">Date:</span>
//               <Input
//                 value={data.proformaInvoiceDate}
//                 onChange={(e) => updateField('proformaInvoiceDate', e.target.value)}
//                 className="info-input"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Buyer & Consignee */}
//         <div className="party-section">
//           <div className="party-box">
//             <div className="party-title">Buyer's Name & Address</div>
//             <div className="party-content">
//               <div className="party-line">{data.buyerName || 'M/s. Company Name'}</div>
//               <div className="party-address-text">{data.buyerAddress || 'Full Address'}</div>
//               <div className="party-gst">GST No.: {data.buyerGstNo || '##XXXXXXXXXX#X#'}</div>
//             </div>
//             {/* Hidden inputs for web editing */}
//             <div className="no-print party-inputs">
//               <Input
//                 value={data.buyerName}
//                 onChange={(e) => handleBuyerChange('buyerName', e.target.value)}
//                 className="party-input party-name"
//                 placeholder="M/s. Company Name"
//               />
//               <Textarea
//                 value={data.buyerAddress}
//                 onChange={(e) => handleBuyerChange('buyerAddress', e.target.value)}
//                 className="party-input party-address"
//                 placeholder="Full Address"
//                 rows={3}
//               />
//               <div className="gst-row">
//                 <span className="gst-label">GST No.:</span>
//                 <Input
//                   value={data.buyerGstNo}
//                   onChange={(e) => handleBuyerChange('buyerGstNo', e.target.value)}
//                   className="gst-input"
//                   placeholder="##XXXXXXXXXX#X#"
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="party-box">
//             <div className="party-title">Consignee's Name & Address:</div>
//             <div className="party-content">
//               <div className="party-line">{data.consigneeName || 'M/s. Company Name'}</div>
//               <div className="party-address-text">{data.consigneeAddress || 'Full Address'}</div>
//               <div className="party-gst">GST No.: {data.consigneeGstNo || '##XXXXXXXXXX#X#'}</div>
//             </div>
//             {/* Hidden inputs for web editing */}
//             <div className="no-print party-inputs">
//               <Input
//                 value={data.consigneeName}
//                 onChange={(e) => updateField('consigneeName', e.target.value)}
//                 className="party-input party-name"
//                 placeholder="M/s. Company Name"
//               />
//               <Textarea
//                 value={data.consigneeAddress}
//                 onChange={(e) => updateField('consigneeAddress', e.target.value)}
//                 className="party-input party-address"
//                 placeholder="Full Address"
//                 rows={3}
//               />
//               <div className="gst-row">
//                 <span className="gst-label">GST No.:</span>
//                 <Input
//                   value={data.consigneeGstNo}
//                   onChange={(e) => updateField('consigneeGstNo', e.target.value)}
//                   className="gst-input"
//                   placeholder="##XXXXXXXXXX#X#"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Items Table */}
//         <div className="items-table-section">
//           <table className="items-table">
//             <thead>
//               <tr>
//                 <th className="col-no">No.</th>
//                 <th className="col-item">Item Details</th>
//                 <th className="col-uom">UOM</th>
//                 <th className="col-qty">Qty.</th>
//                 <th className="col-rate">Rate (INR)</th>
//                 <th className="col-amount">Amount (INR)</th>
//                 <th className="col-action no-print"></th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.items.map((item) => (
//                 <tr key={item.id} className={item.isDiscount ? 'discount-row' : ''}>
//                   <td className="col-no">
//                     {!item.isDiscount && item.no}
//                   </td>
//                   <td className="col-item">
//                     {item.isDiscount ? (
//                       <Input
//                         value={item.discountLabel || ''}
//                         onChange={(e) => updateItem(item.id, 'discountLabel', e.target.value)}
//                         className="table-input discount-label no-print"
//                       />
//                     ) : (
//                       <Textarea
//                         value={item.itemDetails}
//                         onChange={(e) => updateItem(item.id, 'itemDetails', e.target.value)}
//                         className="table-input item-details no-print"
//                         rows={2}
//                         placeholder="Enter item details..."
//                       />
//                     )}
//                     <span className="print-only">{item.isDiscount ? item.discountLabel : item.itemDetails}</span>
//                   </td>
//                   <td className="col-uom">
//                     {!item.isDiscount && (
//                       <>
//                         <Input
//                           value={item.uom}
//                           onChange={(e) => updateItem(item.id, 'uom', e.target.value)}
//                           className="table-input no-print"
//                         />
//                         <span className="print-only">{item.uom}</span>
//                       </>
//                     )}
//                   </td>
//                   <td className="col-qty">
//                     {!item.isDiscount && (
//                       <>
//                         <Input
//                           type="number"
//                           value={item.qty === undefined || item.qty === null ? '' : item.qty}
//                           onChange={(e) => updateItem(item.id, 'qty', e.target.value === '' ? 0 : parseFloat(e.target.value))}
//                           className="table-input no-print"
//                           placeholder=""
//                         />
//                         <span className="print-only">{item.qty}</span>
//                       </>
//                     )}
//                   </td>
//                   <td className="col-rate">
//                     {!item.isDiscount && (
//                       <>
//                         <Input
//                           type="number"
//                           value={item.rate === undefined || item.rate === null ? '' : item.rate}
//                           onChange={(e) => updateItem(item.id, 'rate', e.target.value === '' ? 0 : parseFloat(e.target.value))}
//                           className="table-input no-print"
//                           placeholder=""
//                         />
//                         <span className="print-only">{item.rate}</span>
//                       </>
//                     )}
//                   </td>
//                   <td className="col-amount">
//                     <Input
//                       type="number"
//                       value={item.amount === 0 ? '' : item.amount}
//                       onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
//                       className={`table-input ${item.isDiscount ? 'discount-amount' : ''} no-print`}
//                       placeholder=""
//                     />
//                     <span className={`print-only ${item.isDiscount ? 'discount-text' : ''}`}>
//                       {formatCurrency(item.amount)}
//                     </span>
//                   </td>
//                   <td className="col-action no-print">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => removeItem(item.id)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
          
//           {/* Add Buttons */}
//           <div className="add-buttons no-print">
//             <Button onClick={addItem} variant="outline" size="sm" className="mr-2">
//               <Plus className="w-4 h-4 mr-1" />
//               Add Item
//             </Button>
//             <Button onClick={addDiscount} variant="outline" size="sm">
//               <Plus className="w-4 h-4 mr-1" />
//               Add Discount
//             </Button>
//           </div>
//         </div>

//         {/* Bottom Section */}
//         <div className="bottom-section">
//           <div className="bottom-left">
//             <div className="bank-details">
//               <div className="section-title">Bank Details:</div>
//               <div className="bank-instruction">Please deposit the Payment in our below mentioned account.</div>
//               <div className="bank-row">
//                 <span className="bank-label">- Our Company Name:</span>
//                 <Input
//                   value={data.bankDetails.companyName}
//                   onChange={(e) => updateNestedField('bankDetails', 'companyName', e.target.value)}
//                   className="bank-input no-print"
//                 />
//                 <span className="print-only bank-value">{data.bankDetails.companyName}</span>
//               </div>
//               <div className="bank-row">
//                 <span className="bank-label">- Our Current A/C No.:</span>
//                 <Input
//                   value={data.bankDetails.accountNo}
//                   onChange={(e) => updateNestedField('bankDetails', 'accountNo', e.target.value)}
//                   className="bank-input no-print"
//                 />
//                 <span className="print-only bank-value">{data.bankDetails.accountNo}</span>
//               </div>
//               <div className="bank-row">
//                 <span className="bank-label">- Branch Name:</span>
//                 <Input
//                   value={data.bankDetails.branchName}
//                   onChange={(e) => updateNestedField('bankDetails', 'branchName', e.target.value)}
//                   className="bank-input no-print"
//                 />
//                 <span className="print-only bank-value">{data.bankDetails.branchName}</span>
//               </div>
//               <div className="bank-row">
//                 <span className="bank-label">- RTGS / IFS Code:</span>
//                 <Input
//                   value={data.bankDetails.ifscCode}
//                   onChange={(e) => updateNestedField('bankDetails', 'ifscCode', e.target.value)}
//                   className="bank-input no-print"
//                 />
//                 <span className="print-only bank-value">{data.bankDetails.ifscCode}</span>
//               </div>
//             </div>
            
//             <div className="terms-section">
//               <div className="term-row">
//                 <span className="term-label">Payment:</span>
//                 <Input
//                   value={data.paymentTerms.payment}
//                   onChange={(e) => updateNestedField('paymentTerms', 'payment', e.target.value)}
//                   className="term-input no-print"
//                 />
//                 <span className="print-only term-value">{data.paymentTerms.payment}</span>
//               </div>
//               <div className="term-row">
//                 <span className="term-label">Insurance:</span>
//                 <Input
//                   value={data.paymentTerms.insurance}
//                   onChange={(e) => updateNestedField('paymentTerms', 'insurance', e.target.value)}
//                   className="term-input no-print"
//                 />
//                 <span className="print-only term-value">{data.paymentTerms.insurance}</span>
//               </div>
//               <div className="term-row">
//                 <span className="term-label">Freight:</span>
//                 <Input
//                   value={data.paymentTerms.freight}
//                   onChange={(e) => updateNestedField('paymentTerms', 'freight', e.target.value)}
//                   className="term-input no-print"
//                 />
//                 <span className="print-only term-value">{data.paymentTerms.freight}</span>
//               </div>
//             </div>
//           </div>
          
//           <div className="bottom-right">
//             <div className="summary-table">
//               <div className="summary-row">
//                 <span className="summary-label">Basic Amount</span>
//                 <span className="summary-value">{formatCurrency(grossAmount)}</span>
//               </div>
//               {discountAmount > 0 && (
//                 <div className="summary-row discount-summary">
//                   <span className="summary-label">Less: Discount</span>
//                   <span className="summary-value discount-value">-{formatCurrency(discountAmount)}</span>
//                 </div>
//               )}
//               <div className="summary-row">
//                 <span className="summary-label">Taxable Amount</span>
//                 <span className="summary-value">{formatCurrency(data.basicAmount)}</span>
//               </div>
//               <div className="summary-row">
//                 <span className="summary-label">GST @ {data.gstRate}%</span>
//                 <span className="summary-value">{formatCurrency(data.gstAmount)}</span>
//               </div>
//               <div className="summary-row total-row">
//                 <span className="summary-label">Total with GST</span>
//                 <span className="summary-value">{formatCurrency(data.netAmount)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Amount in Words */}
//         <div className="amount-words-section">
//           <span className="amount-words-label">Rupees</span>
//           <span className="amount-words-value">{data.amountInWords || 'Zero only'}</span>
//         </div>

//         {/* Footer Info */}
//         <div className="footer-info-section">
//           <div className="footer-left">
//             <div className="company-info-row">
//               <span className="info-label">GST No.:</span>
//               <Input
//                 value={data.companyInfo.gstNo}
//                 onChange={(e) => updateNestedField('companyInfo', 'gstNo', e.target.value)}
//                 className="company-info-input no-print"
//               />
//               <span className="print-only company-value">{data.companyInfo.gstNo}</span>
//             </div>
//             <div className="company-info-row">
//               <span className="info-label">State Code:</span>
//               <Input
//                 value={data.companyInfo.stateCode}
//                 onChange={(e) => updateNestedField('companyInfo', 'stateCode', e.target.value)}
//                 className="company-info-input no-print"
//               />
//               <span className="print-only company-value">{data.companyInfo.stateCode}</span>
//             </div>
//             <div className="company-info-row">
//               <span className="info-label">CIN:</span>
//               <Input
//                 value={data.companyInfo.cin}
//                 onChange={(e) => updateNestedField('companyInfo', 'cin', e.target.value)}
//                 className="company-info-input no-print"
//               />
//               <span className="print-only company-value">{data.companyInfo.cin}</span>
//             </div>
//           </div>
//           <div className="footer-right">
//             <div className="signature-section">
//               {getStampUrl() ? (
//                 <div className="stamp-container">
//                   <img 
//                     src={getStampUrl()!} 
//                     alt="Authorised Stamp" 
//                     className="stamp-image"
//                     onError={(e) => {
//                       (e.target as HTMLImageElement).style.display = 'none';
//                     }}
//                   />
//                   <div className="signature-label">Authorised Signatory</div>
//                 </div>
//               ) : (
//                 <>
//                   <div className="for-company">For, CONINFRA MACHINERY PVT. LTD.</div>
//                   <div className="signature-name">Sweta Harit Sharma</div>
//                   <div className="signature-line"></div>
//                   <div className="signature-label">Authorised Signatory</div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Footer Image */}
//         <div className="footer-image-section">
//           <img src={FOOTER_URL} alt="Coninfra Footer" className="footer-image" />
//         </div>
//       </div>
//     </div>
//   );
// }

///-------------------------------------------------------------------------------------------------------------------------------------///

///-------------------------------------------------------------------------------------------------------------------------------------///
import { useRef, useState, useEffect } from 'react';
import type { InvoiceData, InvoiceItem } from '@/types/invoice';
import { formatCurrency, numberToWords } from '@/utils/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, ZoomIn, ZoomOut } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL FIX: import images as ES modules.
//
// Using a raw string like 'src/components/img/Coninfra.jpg' does NOT work
// because Vite never processes it — the browser receives a literal string path
// that doesn't exist at runtime, so the <img> tag shows as broken.
//
// With ES module imports Vite copies the files to /assets/, hashes them, and
// returns the correct resolved URL (e.g. /assets/Coninfra-abc123.jpg).
// That URL is same-origin, so html2canvas can also read it without CORS errors.
// ─────────────────────────────────────────────────────────────────────────────
import logoUrl   from '@/components/img/image.png';
import footerUrl from '@/components/img/Coninfra,New-18,Footer-Picsart-AiImageEnhancer.png';

import riyaStamp    from '@/components/img/riya-stamp.jpg';
import shStamp      from '@/components/img/sh-stamp.jpg';
import hpStamp      from '@/components/img/hp-stamp.jpg';
import shivaniStamp from '@/components/img/shivani-stamp.jpg';
import sssStamp     from '@/components/img/sss-stamp.jpg';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClassicInvoiceProps {
  data: InvoiceData;
  onDataChange: (data: InvoiceData) => void;
  onExportPDF: () => void;
}

const STAMP_OPTIONS = [
  { value: 'default',  label: 'Default (Sweta Harit Sharma)', file: null        },
  { value: 'riya',     label: 'Riya',                         file: riyaStamp    },
  { value: 'sh',       label: 'SH',                           file: shStamp      },
  { value: 'hp',       label: 'HP',                           file: hpStamp      },
  { value: 'shivani',  label: 'Shivani',                      file: shivaniStamp },
  { value: 'sss',      label: 'SSS',                          file: sssStamp     },
];

// ─── Colour palette ───────────────────────────────────────────────────────────
const PRESET_COLORS = [
  'transparent',
  '#000000','#333333','#666666','#999999',
  '#c41e3a','#e53935','#c62828','#b71c1c',
  '#e91e63','#c2185b','#880e4f',
  '#9c27b0','#7b1fa2','#4a148c',
  '#673ab7','#512da8','#311b92',
  '#3f51b5','#303f9f','#1a237e',
  '#2196f3','#1976d2','#0d47a1',
  '#03a9f4','#0288d1','#01579b',
  '#009688','#00796b','#004d40',
  '#4caf50','#388e3c','#1b5e20',
  '#ff9800','#f57c00','#e65100',
  '#ff5722','#e64a19','#bf360c',
  '#795548','#5d4037','#3e2723',
];

// ─── Color Picker ────────────────────────────────────────────────────────────
interface CPProps { color:string; onChange:(c:string)=>void; onClose:()=>void; }
function ColorPickerPopup({ color, onChange, onClose }: CPProps) {
  const [hex, setHex] = useState(color&&color!=='transparent'?color.replace('#',''):'000000');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown',h);
    return ()=>document.removeEventListener('mousedown',h);
  },[onClose]);
  return (
    <div ref={ref} className="color-picker-popup no-print">
      <div className="color-picker-header">
        <span>Text Color</span>
        <button className="color-picker-close" onClick={onClose}>×</button>
      </div>
      <div className="color-picker-grid">
        {PRESET_COLORS.map((c,i)=>(
          <div key={i}
            className={`color-swatch-cell${c===color?' selected':''}${c==='transparent'?' transparent-cell':''}`}
            style={{backgroundColor:c==='transparent'?'white':c}}
            title={c==='transparent'?'Default':c}
            onClick={()=>onChange(c)}>
            {c==='transparent'&&<span style={{fontSize:10,color:'#999'}}>∅</span>}
            {c===color&&<span className="color-check">✓</span>}
          </div>
        ))}
      </div>
      <div className="color-picker-custom-row">
        <span style={{fontSize:11,fontWeight:'bold',color:'#555'}}>Custom:</span>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <span>#</span>
          <input value={hex} onChange={e=>setHex(e.target.value.replace(/[^0-9a-fA-F]/g,'').slice(0,6))}
            maxLength={6} placeholder="000000" className="color-hex-input"/>
          <div className="color-preview-box" style={{backgroundColor:hex.length===6?'#'+hex:'#000'}}/>
        </div>
      </div>
      <div style={{display:'flex',gap:6,padding:'0 8px 8px',justifyContent:'flex-end'}}>
        <button className="color-btn-cancel" onClick={()=>onChange('transparent')}>Default</button>
        <button className="color-btn-select" onClick={()=>onChange(hex.startsWith('#')?hex:'#'+hex)}>Select</button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ClassicInvoice({ data, onDataChange, onExportPDF }: ClassicInvoiceProps) {
  const invoiceRef                  = useRef<HTMLTableElement>(null);
  const [selectedStamp, setStamp]   = useState('default');
  const [zoom, setZoom]             = useState(100);
  const [openColorPicker, setColor] = useState<string|null>(null);

  const getTextStyle = (item:InvoiceItem):React.CSSProperties =>
    item.rowColor&&item.rowColor!=='transparent' ? {color:item.rowColor} : {};

  const getStampUrl = ():string|null => {
    if (!selectedStamp||selectedStamp==='default') return null;
    return STAMP_OPTIONS.find(s=>s.value===selectedStamp)?.file||null;
  };

  // ─── mutations ──────────────────────────────────────────────────────────────
  const updateItemColor = (id:string,color:string) =>
    onDataChange({...data, items:data.items.map(i=>i.id===id?{...i,rowColor:color}:i)});

  const updateItem = (id:string, field:keyof InvoiceItem, value:string|number) => {
    const updated = data.items.map(item=>{
      if(item.id!==id) return item;
      const next={...item,[field]:value};
      if(field==='qty'||field==='rate'){
        const q=field==='qty'?(value as number)||0:next.qty||0;
        const r=field==='rate'?(value as number)||0:next.rate||0;
        next.amount=q*r;
      }
      return next;
    });
    calculateTotals(updated);
  };

  const calculateTotals = (items:InvoiceItem[]) => {
    const regular   = items.filter(i=>!i.isDiscount&&!i.isAdvance);
    const discounts = items.filter(i=>i.isDiscount);
    const advances  = items.filter(i=>i.isAdvance);
    const basicAmt    = regular.reduce((s,i)=>s+(i.amount||0),0);
    const discountAmt = discounts.reduce((s,i)=>s+(i.amount||0),0);
    const advanceAmt  = advances.reduce((s,i)=>s+(i.amount||0),0);
    const taxable = basicAmt-discountAmt-advanceAmt;
    const gstAmt  = Math.round(taxable*(data.gstRate/100));
    const netAmt  = taxable+gstAmt;
    onDataChange({...data,items,basicAmount:taxable,gstAmount:gstAmt,netAmount:netAmt,
      amountInWords:numberToWords(netAmt),discountAmount:discountAmt,advanceAmount:advanceAmt});
  };

  const addItem = () => {
    const newItem:InvoiceItem={
      id:Date.now().toString(),
      no:data.items.filter(i=>!i.isDiscount&&!i.isAdvance).length+1,
      itemDetails:'',uom:'Nos.',qty:undefined as any,rate:undefined as any,amount:0,
    };
    onDataChange({...data,items:[...data.items,newItem]});
  };
  const addDiscount = () => onDataChange({...data,items:[...data.items,{
    id:Date.now().toString(),no:0,itemDetails:'',uom:'',qty:0,rate:0,
    amount:0,isDiscount:true,discountLabel:'Special Discount',
  }]});
  const addAdvance = () => onDataChange({...data,items:[...data.items,{
    id:Date.now().toString(),no:0,itemDetails:'',uom:'',qty:0,rate:0,
    amount:0,isAdvance:true,advanceLabel:'Less: Advance',
  }]});

  const removeItem = (id:string) => {
    const updated=data.items.filter(i=>i.id!==id);
    let n=1; updated.forEach(i=>{if(!i.isDiscount&&!i.isAdvance)i.no=n++;});
    calculateTotals(updated);
  };

  const updateField = (field:keyof InvoiceData, value:string|number) => {
    if(field==='gstRate'){
      const regular   = data.items.filter(i=>!i.isDiscount&&!i.isAdvance);
      const discounts = data.items.filter(i=>i.isDiscount);
      const advances  = data.items.filter(i=>i.isAdvance);
      const basic   = regular.reduce((s,i)=>s+(i.amount||0),0);
      const disc    = discounts.reduce((s,i)=>s+(i.amount||0),0);
      const adv     = advances.reduce((s,i)=>s+(i.amount||0),0);
      const taxable = basic-disc-adv;
      const gstAmt  = Math.round(taxable*((value as number)/100));
      const netAmt  = taxable+gstAmt;
      onDataChange({...data,gstRate:value as number,gstAmount:gstAmt,netAmount:netAmt,
        amountInWords:numberToWords(netAmt)});
    } else { onDataChange({...data,[field]:value}); }
  };

  const updateNestedField = (parent:'bankDetails'|'paymentTerms'|'companyInfo',field:string,value:string) =>
    onDataChange({...data,[parent]:{...data[parent],[field]:value}});

  const handleBuyerChange = (field:string,value:string) => {
    const u:Partial<InvoiceData>={};
    if(field==='buyerName')   {u.buyerName=value;   u.consigneeName=value;   }
    if(field==='buyerAddress'){u.buyerAddress=value; u.consigneeAddress=value;}
    if(field==='buyerGstNo')  {u.buyerGstNo=value;  u.consigneeGstNo=value;  }
    onDataChange({...data,...u});
  };

  // ─── derived ─────────────────────────────────────────────────────────────────
  const gstOptions    = Array.from({length:100},(_,i)=>i+1);
  const regularItems  = data.items.filter(i=>!i.isDiscount&&!i.isAdvance);
  const discountItems = data.items.filter(i=>i.isDiscount);
  const advanceItems  = data.items.filter(i=>i.isAdvance);
  const grossAmount   = regularItems.reduce((s,i)=>s+(i.amount||0),0);
  const discountAmt   = data.discountAmount||0;
  const advanceAmt    = data.advanceAmount||0;

  // ─── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="classic-invoice-container">

      {/* toolbar */}
      <div className="flex justify-end mb-4 no-print gap-2 flex-wrap items-center">
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={()=>setZoom(z=>Math.max(50,z-10))}><ZoomOut className="w-3 h-3"/></button>
          <span className="zoom-label">{zoom}%</span>
          <button className="zoom-btn" onClick={()=>setZoom(z=>Math.min(200,z+10))}><ZoomIn className="w-3 h-3"/></button>
        </div>

        <div className="flex items-center gap-2 mr-2">
          <span className="text-sm font-medium">GST Rate:</span>
          <Select value={data.gstRate.toString()} onValueChange={v=>updateField('gstRate',parseInt(v))}>
            <SelectTrigger className="w-20"><SelectValue placeholder="18%"/></SelectTrigger>
            <SelectContent>{gstOptions.map(r=><SelectItem key={r} value={r.toString()}>{r}%</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 mr-2">
          <span className="text-sm font-medium">Stamp:</span>
          <Select value={selectedStamp} onValueChange={setStamp}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select"/></SelectTrigger>
            <SelectContent>{STAMP_OPTIONS.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <Button onClick={onExportPDF} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2"/>Store as PDF
        </Button>
      </div>

      {/*
        LOGO HEADER — outside the table entirely.
        Screen: normal document flow above the invoice.
        Print:  position:fixed top:0 — pinned to top of EVERY printed page.
      */}
      <div className="invoice-page-logo">
        <img src={logoUrl} alt="Coninfra Machinery" className="invoice-logo"/>
      </div>

      {/* PRINT CONTENT AREA — transparent on screen; in print has padding so
          content never hides behind the fixed logo or fixed footer image */}
      <div className="invoice-print-content">

      {/* zoom wrapper */}
      <div className="invoice-zoom-wrapper" style={{
        transform:`scale(${zoom/100})`, transformOrigin:'top center',
        transition:'transform 0.2s ease',
        marginBottom:zoom<100?`${(1-zoom/100)*-600}px`:zoom>100?`${(zoom/100-1)*400}px`:'0',
      }}>

        <table ref={invoiceRef} className="classic-invoice"
          style={{borderCollapse:'collapse',tableLayout:'fixed',width:'210mm'}}>

          {/* ══ THEAD — title + party + col headers repeat on every printed page ══ */}
          <thead>
            {/* Title */}
            <tr>
              <td colSpan={6} className="invoice-title-section">
                <h1 className="invoice-title">PROFORMA INVOICE</h1>
              </td>
              <td className="col-action no-print"></td>
            </tr>

            {/* PO / Invoice numbers */}
            <tr>
              <td colSpan={3} className="header-left">
                <div className="info-row">
                  <span className="info-label">Your PO No.:</span>
                  <Input value={data.yourPoNo} onChange={e=>updateField('yourPoNo',e.target.value)} className="info-input no-print" placeholder="Enter PO Number"/>
                  <span className="print-only" style={{fontSize:10}}>{data.yourPoNo}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Date:</span>
                  <Input value={data.yourPoDate} onChange={e=>updateField('yourPoDate',e.target.value)} className="info-input no-print"/>
                  <span className="print-only" style={{fontSize:10}}>{data.yourPoDate}</span>
                </div>
              </td>
              <td colSpan={3} className="header-right">
                <div className="info-row">
                  <span className="info-label">Proforma Invoice No.:</span>
                  <Input value={data.proformaInvoiceNo} onChange={e=>updateField('proformaInvoiceNo',e.target.value)} className="info-input no-print" placeholder="P###"/>
                  <span className="print-only" style={{fontSize:10}}>{data.proformaInvoiceNo}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Date:</span>
                  <Input value={data.proformaInvoiceDate} onChange={e=>updateField('proformaInvoiceDate',e.target.value)} className="info-input no-print"/>
                  <span className="print-only" style={{fontSize:10}}>{data.proformaInvoiceDate}</span>
                </div>
              </td>
              <td className="col-action no-print"></td>
            </tr>

            {/* Buyer / Consignee */}
            <tr>
              <td colSpan={3} className="party-box">
                <div className="party-title">Buyer's Name &amp; Address</div>
                <div className="party-content">
                  <div className="party-line">{data.buyerName||'M/s. Company Name'}</div>
                  <div className="party-address-text">{data.buyerAddress||'Full Address'}</div>
                  <div className="party-gst">GST No.: {data.buyerGstNo||'##XXXXXXXXXX#X#'}</div>
                </div>
                <div className="no-print party-inputs">
                  <Input value={data.buyerName} onChange={e=>handleBuyerChange('buyerName',e.target.value)} className="party-input party-name" placeholder="M/s. Company Name"/>
                  <Textarea value={data.buyerAddress} onChange={e=>handleBuyerChange('buyerAddress',e.target.value)} className="party-input party-address" placeholder="Full Address" rows={3}/>
                  <div className="gst-row">
                    <span className="gst-label">GST No.:</span>
                    <Input value={data.buyerGstNo} onChange={e=>handleBuyerChange('buyerGstNo',e.target.value)} className="gst-input" placeholder="##XXXXXXXXXX#X#"/>
                  </div>
                </div>
              </td>
              <td colSpan={3} className="party-box">
                <div className="party-title">Consignee's Name &amp; Address</div>
                <div className="party-content">
                  <div className="party-line">{data.consigneeName||'M/s. Company Name'}</div>
                  <div className="party-address-text">{data.consigneeAddress||'Full Address'}</div>
                  <div className="party-gst">GST No.: {data.consigneeGstNo||'##XXXXXXXXXX#X#'}</div>
                </div>
                <div className="no-print party-inputs">
                  <Input value={data.consigneeName} onChange={e=>updateField('consigneeName',e.target.value)} className="party-input party-name" placeholder="M/s. Company Name"/>
                  <Textarea value={data.consigneeAddress} onChange={e=>updateField('consigneeAddress',e.target.value)} className="party-input party-address" placeholder="Full Address" rows={3}/>
                  <div className="gst-row">
                    <span className="gst-label">GST No.:</span>
                    <Input value={data.consigneeGstNo} onChange={e=>updateField('consigneeGstNo',e.target.value)} className="gst-input" placeholder="##XXXXXXXXXX#X#"/>
                  </div>
                </div>
              </td>
              <td className="col-action no-print"></td>
            </tr>

            {/* Column headers */}
            <tr>
              <th className="col-no">No.</th>
              <th className="col-item">Item Details</th>
              <th className="col-uom">UOM</th>
              <th className="col-qty">Qty.</th>
              <th className="col-rate">Rate (INR)</th>
              <th className="col-amount">Amount (INR)</th>
              <th className="col-action no-print"></th>
            </tr>
          </thead>

          {/* ══ TBODY ══ */}
          <tbody>
            {data.items.map(item=>(
              <tr key={item.id} className={item.isDiscount?'discount-row':item.isAdvance?'advance-row':''}>
                {/* No. + colour picker */}
                <td className="col-no">
                  <div style={{position:'relative',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                    <div className="row-color-btn no-print"
                      style={{backgroundColor:item.rowColor&&item.rowColor!=='transparent'?item.rowColor:'#555',border:'1.5px solid #bbb'}}
                      title="Change text colour"
                      onClick={e=>{e.stopPropagation();setColor(openColorPicker===item.id?null:item.id);}}/>
                    {openColorPicker===item.id&&(
                      <ColorPickerPopup color={item.rowColor||'transparent'}
                        onChange={c=>{updateItemColor(item.id,c);setColor(null);}}
                        onClose={()=>setColor(null)}/>
                    )}
                    <span>{!item.isDiscount&&!item.isAdvance?item.no:''}</span>
                  </div>
                </td>

                {/* Description */}
                <td className="col-item" style={getTextStyle(item)}>
                  {item.isDiscount?(
                    <Input value={item.discountLabel||''} onChange={e=>updateItem(item.id,'discountLabel',e.target.value)} className="table-input discount-label no-print"/>
                  ):item.isAdvance?(
                    <Input value={item.advanceLabel||''} onChange={e=>updateItem(item.id,'advanceLabel',e.target.value)} className="table-input advance-label no-print"/>
                  ):(
                    <Textarea value={item.itemDetails} onChange={e=>updateItem(item.id,'itemDetails',e.target.value)} className="table-input item-details no-print" rows={2} placeholder="Enter item details…"/>
                  )}
                  <span className="print-only" style={getTextStyle(item)}>
                    {item.isDiscount?item.discountLabel:item.isAdvance?item.advanceLabel:item.itemDetails}
                  </span>
                </td>

                {/* UOM */}
                <td className="col-uom" style={getTextStyle(item)}>
                  {!item.isDiscount&&!item.isAdvance&&(<>
                    <Input value={item.uom} onChange={e=>updateItem(item.id,'uom',e.target.value)} className="table-input no-print"/>
                    <span className="print-only">{item.uom}</span>
                  </>)}
                </td>

                {/* Qty */}
                <td className="col-qty" style={getTextStyle(item)}>
                  {!item.isDiscount&&!item.isAdvance&&(<>
                    <Input type="number" value={item.qty===undefined||item.qty===null?'':item.qty}
                      onChange={e=>updateItem(item.id,'qty',e.target.value===''?0:parseFloat(e.target.value))} className="table-input no-print"/>
                    <span className="print-only">{item.qty}</span>
                  </>)}
                </td>

                {/* Rate */}
                <td className="col-rate" style={getTextStyle(item)}>
                  {!item.isDiscount&&!item.isAdvance&&(<>
                    <Input type="number" value={item.rate===undefined||item.rate===null?'':item.rate}
                      onChange={e=>updateItem(item.id,'rate',e.target.value===''?0:parseFloat(e.target.value))} className="table-input no-print"/>
                    <span className="print-only">{item.rate!=null?item.rate.toLocaleString('en-IN'):''}</span>
                  </>)}
                </td>

                {/* Amount */}
                <td className="col-amount" style={getTextStyle(item)}>
                  <Input type="number" value={item.amount===0?'':item.amount}
                    onChange={e=>updateItem(item.id,'amount',parseFloat(e.target.value)||0)}
                    className={`table-input ${item.isDiscount?'discount-amount':item.isAdvance?'advance-amount':''} no-print`}/>
                  <span className={`print-only ${item.isDiscount?'discount-text':item.isAdvance?'advance-text':''}`} style={getTextStyle(item)}>
                    {formatCurrency(item.amount)}
                  </span>
                </td>

                {/* Delete */}
                <td className="col-action no-print">
                  <Button variant="ghost" size="sm" onClick={()=>removeItem(item.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4"/>
                  </Button>
                </td>
              </tr>
            ))}

            {/* Add buttons */}
            <tr className="no-print">
              <td colSpan={7} className="add-buttons">
                <Button onClick={addItem}     variant="outline" size="sm" className="mr-2"><Plus className="w-4 h-4 mr-1"/>Add Item</Button>
                <Button onClick={addDiscount} variant="outline" size="sm" className="mr-2"><Plus className="w-4 h-4 mr-1"/>Add Discount</Button>
                <Button onClick={addAdvance}  variant="outline" size="sm"><Plus className="w-4 h-4 mr-1"/>Add Advance</Button>
              </td>
            </tr>

          {/*
            ══════════════════════════════════════════════════════════════
            BOTTOM CONTENT ROWS — inside tbody so they appear ONCE at the
            end of the content, NOT repeated on every page.
            The footer image is now a fixed div outside the table.
            ══════════════════════════════════════════════════════════════
          */}

            {/* Bank Details + Summary */}
            <tr>
              <td colSpan={4} className="bottom-left">
                <div className="bank-details">
                  <div className="section-title">Bank Details:</div>
                  <div className="bank-instruction">Please deposit the Payment in our below mentioned account.</div>
                  {[
                    {label:'- Our Company Name:',    field:'companyName'},
                    {label:'- Our Current A/C No.:', field:'accountNo'  },
                    {label:'- Branch Name:',          field:'branchName' },
                    {label:'- RTGS / IFS Code:',      field:'ifscCode'   },
                  ].map(({label,field})=>(
                    <div className="bank-row" key={field}>
                      <span className="bank-label">{label}</span>
                      <Input value={(data.bankDetails as any)[field]} onChange={e=>updateNestedField('bankDetails',field,e.target.value)} className="bank-input no-print"/>
                      <span className="bank-value">{(data.bankDetails as any)[field]}</span>
                    </div>
                  ))}
                </div>
                <div className="terms-section">
                  {[
                    {label:'Payment:',  field:'payment'  },
                    {label:'Insurance:',field:'insurance'},
                    {label:'Freight:',  field:'freight'  },
                  ].map(({label,field})=>(
                    <div className="term-row" key={field}>
                      <span className="term-label">{label}</span>
                      <Input value={(data.paymentTerms as any)[field]} onChange={e=>updateNestedField('paymentTerms',field,e.target.value)} className="term-input no-print"/>
                      <span className="term-value">{(data.paymentTerms as any)[field]}</span>
                    </div>
                  ))}
                </div>
              </td>

              <td colSpan={2} className="bottom-right">
                <div className="summary-table">
                  <div className="summary-row">
                    <span className="summary-label">Basic Amount</span>
                    <span className="summary-value">{formatCurrency(grossAmount)}</span>
                  </div>
                  {discountAmt>0&&(
                    <div className="summary-row discount-summary">
                      <span className="summary-label">Less: Discount</span>
                      <span className="summary-value discount-value">- {formatCurrency(discountAmt)}</span>
                    </div>
                  )}
                  {advanceAmt>0&&(
                    <div className="summary-row advance-summary">
                      <span className="summary-label">Less: Advance</span>
                      <span className="summary-value advance-value">- {formatCurrency(advanceAmt)}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span className="summary-label">GST @ {data.gstRate}%</span>
                    <span className="summary-value">{formatCurrency(data.gstAmount)}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span className="summary-label">Total with GST</span>
                    <span className="summary-value">{formatCurrency(data.netAmount)}</span>
                  </div>
                </div>
              </td>
              <td className="col-action no-print"></td>
            </tr>

            {/* Amount in words */}
            <tr>
              <td colSpan={6} className="amount-words-section">
                <span className="amount-words-label">Rupees</span>
                <span className="amount-words-value">{data.amountInWords||'Zero Only'}</span>
              </td>
              <td className="col-action no-print"></td>
            </tr>

            {/* Company info (left) + Authorised Signatory (right) */}
            <tr>
              <td colSpan={3} className="footer-left">
                {[
                  {label:'GST No.:',   field:'gstNo'    },
                  {label:'State Code:',field:'stateCode'},
                  {label:'CIN:',       field:'cin'      },
                ].map(({label,field})=>(
                  <div className="company-info-row" key={field}>
                    <span className="info-label">{label}</span>
                    <Input value={(data.companyInfo as any)[field]} onChange={e=>updateNestedField('companyInfo',field,e.target.value)} className="company-info-input no-print"/>
                    <span className="company-value">{(data.companyInfo as any)[field]}</span>
                  </div>
                ))}
              </td>
              <td colSpan={3} className="footer-right">
                <div className="signature-section">
                  {getStampUrl()?(
                    <div className="stamp-container">
                      <img src={getStampUrl()!} alt="Authorised Stamp" className="stamp-image"
                        onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
                      <div className="signature-label">Authorised Signatory</div>
                    </div>
                  ):(
                    <>
                      <div className="for-company">For, CONINFRA MACHINERY PVT. LTD.</div>
                      <div className="signature-name">Sweta Harit Sharma</div>
                      <div className="signature-line"></div>
                      <div className="signature-label">Authorised Signatory</div>
                    </>
                  )}
                </div>
              </td>
              <td className="col-action no-print"></td>
            </tr>
          </tbody>

        </table>
      </div>{/* end zoom wrapper */}
      </div>{/* end invoice-print-content */}

      {/*
        FOOTER IMAGE — outside the table entirely.
        Screen: normal document flow below the invoice.
        Print:  position:fixed bottom:0 — pinned to bottom of EVERY printed page.
      */}
      <div className="invoice-page-footer">
        <img src={footerUrl} alt="Coninfra Footer" className="footer-image"/>
      </div>
    </div>
  );
}