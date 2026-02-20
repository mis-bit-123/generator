import { useRef } from 'react';
import type { InvoiceData, InvoiceItem } from '@/types/invoice';
import { formatCurrency, numberToWords } from '@/utils/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Download } from 'lucide-react';

interface ClassicInvoiceProps {
  data: InvoiceData;
  onDataChange: (data: InvoiceData) => void;
  onExportPDF: () => void;
}

const LOGO_URL = 'https://i.imghippo.com/files/RfC9405A.jpg';
const FOOTER_URL = 'https://i.imghippo.com/files/rtrV3514D.jpg';

export default function ClassicInvoice({ data, onDataChange, onExportPDF }: ClassicInvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = data.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          updatedItem.amount = updatedItem.qty * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    });
    
    const basicAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const gstAmount = Math.round(basicAmount * (data.gstRate / 100));
    const netAmount = basicAmount + gstAmount;
    
    onDataChange({
      ...data,
      items: updatedItems,
      basicAmount,
      gstAmount,
      netAmount,
      amountInWords: numberToWords(netAmount),
    });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      no: data.items.filter(i => !i.isDiscount).length + 1,
      itemDetails: '',
      uom: 'Nos.',
      qty: 1,
      rate: 0,
      amount: 0,
    };
    onDataChange({ ...data, items: [...data.items, newItem] });
  };

  const addDiscount = () => {
    const newDiscount: InvoiceItem = {
      id: Date.now().toString(),
      no: 0,
      itemDetails: '',
      uom: '',
      qty: 0,
      rate: 0,
      amount: 0,
      isDiscount: true,
      discountLabel: 'Special Discount',
    };
    onDataChange({ ...data, items: [...data.items, newDiscount] });
  };

  const removeItem = (id: string) => {
    const updatedItems = data.items.filter(item => item.id !== id);
    // Renumber items
    let itemNo = 1;
    updatedItems.forEach(item => {
      if (!item.isDiscount) {
        item.no = itemNo++;
      }
    });
    
    const basicAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const gstAmount = Math.round(basicAmount * (data.gstRate / 100));
    const netAmount = basicAmount + gstAmount;
    
    onDataChange({
      ...data,
      items: updatedItems,
      basicAmount,
      gstAmount,
      netAmount,
      amountInWords: numberToWords(netAmount),
    });
  };

  const updateField = (field: keyof InvoiceData, value: string) => {
    onDataChange({ ...data, [field]: value });
  };

  const updateNestedField = (
    parent: 'bankDetails' | 'paymentTerms' | 'companyInfo',
    field: string,
    value: string
  ) => {
    onDataChange({
      ...data,
      [parent]: { ...data[parent], [field]: value },
    });
  };

  // Auto-fill consignee when buyer changes (if consignee is empty)
  const handleBuyerChange = (field: string, value: string) => {
    const updates: Partial<InvoiceData> = {};
    if (field === 'buyerName') updates.buyerName = value;
    if (field === 'buyerAddress') updates.buyerAddress = value;
    if (field === 'buyerGstNo') updates.buyerGstNo = value;
    
    // Auto-fill consignee if empty
    if (field === 'buyerName' && !data.consigneeName) updates.consigneeName = value;
    if (field === 'buyerAddress' && !data.consigneeAddress) updates.consigneeAddress = value;
    if (field === 'buyerGstNo' && !data.consigneeGstNo) updates.consigneeGstNo = value;
    
    onDataChange({ ...data, ...updates });
  };

  return (
    <div className="classic-invoice-container">
      {/* Export Button */}
      <div className="flex justify-end mb-4 no-print">
        <Button onClick={onExportPDF} className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Store as PDF
        </Button>
      </div>

      {/* Invoice Content */}
      <div ref={invoiceRef} className="classic-invoice bg-white">
        {/* Logo Section */}
        <div className="invoice-logo-section">
          <img src={LOGO_URL} alt="Coninfra Machinery" className="invoice-logo" />
        </div>

        {/* Title */}
        <div className="invoice-title-section">
          <h1 className="invoice-title">PROFORMA INVOICE</h1>
        </div>

        {/* Header Info */}
        <div className="invoice-header-info">
          <div className="header-left">
            <div className="info-row">
              <span className="info-label">Your PO no.</span>
              <Input
                value={data.yourPoNo}
                onChange={(e) => updateField('yourPoNo', e.target.value)}
                className="info-input"
                placeholder="Enter PO Number"
              />
            </div>
            <div className="info-row">
              <span className="info-label">Date:</span>
              <Input
                value={data.yourPoDate}
                onChange={(e) => updateField('yourPoDate', e.target.value)}
                className="info-input"
              />
            </div>
          </div>
          <div className="header-right">
            <div className="info-row">
              <span className="info-label">Proforma Invoice No.:</span>
              <Input
                value={data.proformaInvoiceNo}
                onChange={(e) => updateField('proformaInvoiceNo', e.target.value)}
                className="info-input"
                placeholder="P###"
              />
            </div>
            <div className="info-row">
              <span className="info-label">Date:</span>
              <Input
                value={data.proformaInvoiceDate}
                onChange={(e) => updateField('proformaInvoiceDate', e.target.value)}
                className="info-input"
              />
            </div>
          </div>
        </div>

        {/* Buyer & Consignee */}
        <div className="party-section">
          <div className="party-box">
            <div className="party-title">Buyer's Name & Address</div>
            <Input
              value={data.buyerName}
              onChange={(e) => handleBuyerChange('buyerName', e.target.value)}
              className="party-input party-name"
              placeholder="M/s. Company Name"
            />
            <Textarea
              value={data.buyerAddress}
              onChange={(e) => handleBuyerChange('buyerAddress', e.target.value)}
              className="party-input party-address"
              placeholder="Full Address"
              rows={3}
            />
            <div className="gst-row">
              <span className="gst-label">GST No.:</span>
              <Input
                value={data.buyerGstNo}
                onChange={(e) => handleBuyerChange('buyerGstNo', e.target.value)}
                className="gst-input"
                placeholder="##XXXXXXXXXX#X#"
              />
            </div>
          </div>
          <div className="party-box">
            <div className="party-title">Consginee's Name & Address:</div>
            <Input
              value={data.consigneeName}
              onChange={(e) => updateField('consigneeName', e.target.value)}
              className="party-input party-name"
              placeholder="M/s. Company Name"
            />
            <Textarea
              value={data.consigneeAddress}
              onChange={(e) => updateField('consigneeAddress', e.target.value)}
              className="party-input party-address"
              placeholder="Full Address"
              rows={3}
            />
            <div className="gst-row">
              <span className="gst-label">GST No.:</span>
              <Input
                value={data.consigneeGstNo}
                onChange={(e) => updateField('consigneeGstNo', e.target.value)}
                className="gst-input"
                placeholder="##XXXXXXXXXX#X#"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="items-table-section">
          <table className="items-table">
            <thead>
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
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id} className={item.isDiscount ? 'discount-row' : ''}>
                  <td className="col-no">
                    {!item.isDiscount && item.no}
                  </td>
                  <td className="col-item">
                    {item.isDiscount ? (
                      <Input
                        value={item.discountLabel || ''}
                        onChange={(e) => updateItem(item.id, 'discountLabel', e.target.value)}
                        className="table-input discount-label"
                      />
                    ) : (
                      <Textarea
                        value={item.itemDetails}
                        onChange={(e) => updateItem(item.id, 'itemDetails', e.target.value)}
                        className="table-input item-details"
                        rows={2}
                        placeholder="Enter item details..."
                      />
                    )}
                  </td>
                  <td className="col-uom">
                    {!item.isDiscount && (
                      <Input
                        value={item.uom}
                        onChange={(e) => updateItem(item.id, 'uom', e.target.value)}
                        className="table-input"
                      />
                    )}
                  </td>
                  <td className="col-qty">
                    {!item.isDiscount && (
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                        className="table-input"
                      />
                    )}
                  </td>
                  <td className="col-rate">
                    {!item.isDiscount && (
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="table-input"
                      />
                    )}
                  </td>
                  <td className="col-amount">
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                      className={`table-input ${item.isDiscount ? 'discount-amount' : ''}`}
                    />
                  </td>
                  <td className="col-action no-print">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Add Buttons */}
          <div className="add-buttons no-print">
            <Button onClick={addItem} variant="outline" size="sm" className="mr-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
            <Button onClick={addDiscount} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Discount
            </Button>
          </div>
        </div>

        {/* Special Notes */}
        <div className="special-notes-section">
          <Textarea
            value={data.specialNotes}
            onChange={(e) => updateField('specialNotes', e.target.value)}
            className="notes-input"
            placeholder="Please Note: Service Charges will be Extra Rs. 3500 Per Day + Travelling Expenses"
            rows={2}
          />
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div className="bottom-left">
            <div className="bank-details">
              <div className="section-title">Bank Details:</div>
              <div className="bank-instruction">Please deposit the Payment in our below mentioned account.</div>
              <div className="bank-row">
                <span className="bank-label">- Our Company Name:</span>
                <Input
                  value={data.bankDetails.companyName}
                  onChange={(e) => updateNestedField('bankDetails', 'companyName', e.target.value)}
                  className="bank-input"
                />
              </div>
              <div className="bank-row">
                <span className="bank-label">- Our Current A/C No.:</span>
                <Input
                  value={data.bankDetails.accountNo}
                  onChange={(e) => updateNestedField('bankDetails', 'accountNo', e.target.value)}
                  className="bank-input"
                />
              </div>
              <div className="bank-row">
                <span className="bank-label">- Branch Name:</span>
                <Input
                  value={data.bankDetails.branchName}
                  onChange={(e) => updateNestedField('bankDetails', 'branchName', e.target.value)}
                  className="bank-input"
                />
              </div>
              <div className="bank-row">
                <span className="bank-label">- RTGS / IFS Code:</span>
                <Input
                  value={data.bankDetails.ifscCode}
                  onChange={(e) => updateNestedField('bankDetails', 'ifscCode', e.target.value)}
                  className="bank-input"
                />
              </div>
            </div>
            
            <div className="terms-section">
              <div className="term-row">
                <span className="term-label">Payment:</span>
                <Input
                  value={data.paymentTerms.payment}
                  onChange={(e) => updateNestedField('paymentTerms', 'payment', e.target.value)}
                  className="term-input"
                />
              </div>
              <div className="term-row">
                <span className="term-label">Insurance:</span>
                <Input
                  value={data.paymentTerms.insurance}
                  onChange={(e) => updateNestedField('paymentTerms', 'insurance', e.target.value)}
                  className="term-input"
                />
              </div>
              <div className="term-row">
                <span className="term-label">Freight:</span>
                <Input
                  value={data.paymentTerms.freight}
                  onChange={(e) => updateNestedField('paymentTerms', 'freight', e.target.value)}
                  className="term-input"
                />
              </div>
            </div>
          </div>
          
          <div className="bottom-right">
            <div className="summary-table">
              <div className="summary-row">
                <span className="summary-label">Basic Amount</span>
                <span className="summary-value">{formatCurrency(data.basicAmount)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">GST @ {data.gstRate}%</span>
                <span className="summary-value">{formatCurrency(data.gstAmount)}</span>
              </div>
              <div className="summary-row total-row">
                <span className="summary-label">Total with GST</span>
                <span className="summary-value">{formatCurrency(data.netAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="amount-words-section">
          <span className="amount-words-label">Rupees</span>
          <span className="amount-words-value">{data.amountInWords || 'Zero only'}</span>
        </div>

        {/* Footer Info */}
        <div className="footer-info-section">
          <div className="footer-left">
            <div className="company-info-row">
              <span className="info-label">GST No.:</span>
              <Input
                value={data.companyInfo.gstNo}
                onChange={(e) => updateNestedField('companyInfo', 'gstNo', e.target.value)}
                className="company-info-input"
              />
            </div>
            <div className="company-info-row">
              <span className="info-label">State Code:</span>
              <Input
                value={data.companyInfo.stateCode}
                onChange={(e) => updateNestedField('companyInfo', 'stateCode', e.target.value)}
                className="company-info-input"
              />
            </div>
            <div className="company-info-row">
              <span className="info-label">CIN:</span>
              <Input
                value={data.companyInfo.cin}
                onChange={(e) => updateNestedField('companyInfo', 'cin', e.target.value)}
                className="company-info-input"
              />
            </div>
          </div>
          <div className="footer-right">
            <div className="signature-section">
              <div className="for-company">For, CONINFRA MACHINERY PVT. LTD.</div>
              <div className="signature-line"></div>
              <div className="signature-label">Authorised Signatory</div>
            </div>
          </div>
        </div>

        {/* Footer Image */}
        <div className="footer-image-section">
          <img src={FOOTER_URL} alt="Coninfra Footer" className="footer-image" />
        </div>
      </div>
    </div>
  );
}
