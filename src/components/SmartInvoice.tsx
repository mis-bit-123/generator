import type { InvoiceData, InvoiceItem } from '@/types/invoice';
import { formatCurrency, numberToWords } from '@/utils/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Download, Building2, User, Banknote, FileText } from 'lucide-react';

interface SmartInvoiceProps {
  data: InvoiceData;
  onDataChange: (data: InvoiceData) => void;
  onExportPDF: () => void;
}

const LOGO_URL = 'https://i.imghippo.com/files/RfC9405A.jpg';

export default function SmartInvoice({ data, onDataChange, onExportPDF }: SmartInvoiceProps) {
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

  const handleBuyerChange = (field: string, value: string) => {
    const updates: Partial<InvoiceData> = {};
    if (field === 'buyerName') updates.buyerName = value;
    if (field === 'buyerAddress') updates.buyerAddress = value;
    if (field === 'buyerGstNo') updates.buyerGstNo = value;
    
    if (field === 'buyerName' && !data.consigneeName) updates.consigneeName = value;
    if (field === 'buyerAddress' && !data.consigneeAddress) updates.consigneeAddress = value;
    if (field === 'buyerGstNo' && !data.consigneeGstNo) updates.consigneeGstNo = value;
    
    onDataChange({ ...data, ...updates });
  };

  return (
    <div className="smart-invoice-container">
      {/* Export Button */}
      <div className="flex justify-end mb-4 no-print">
        <Button onClick={onExportPDF} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
          <Download className="w-4 h-4 mr-2" />
          Store as PDF
        </Button>
      </div>

      {/* Smart Invoice */}
      <div className="smart-invoice bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with Logo */}
        <div className="smart-header bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Coninfra" className="h-16 bg-white rounded-lg p-2" />
              <div>
                <h1 className="text-2xl font-bold">PROFORMA INVOICE</h1>
                <p className="text-slate-300 text-sm">Coninfra Machinery Pvt. Ltd.</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                <p className="text-xs text-slate-300">Invoice No.</p>
                <Input
                  value={data.proformaInvoiceNo}
                  onChange={(e) => updateField('proformaInvoiceNo', e.target.value)}
                  className="bg-transparent border-0 text-white font-mono text-lg p-0 h-auto focus-visible:ring-0 text-right"
                  placeholder="P###"
                />
              </div>
              <p className="text-sm text-slate-300 mt-2">{data.proformaInvoiceDate}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Document Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Your Reference</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-slate-500">PO Number</label>
                    <Input
                      value={data.yourPoNo}
                      onChange={(e) => updateField('yourPoNo', e.target.value)}
                      placeholder="Enter PO Number"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">PO Date</label>
                    <Input
                      value={data.yourPoDate}
                      onChange={(e) => updateField('yourPoDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Our Details</span>
                </div>
                <div className="text-sm space-y-1 text-slate-600">
                  <p><span className="font-medium">GST:</span> {data.companyInfo.gstNo}</p>
                  <p><span className="font-medium">CIN:</span> {data.companyInfo.cin}</p>
                  <p><span className="font-medium">State:</span> {data.companyInfo.stateCode}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Party Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-3">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Buyer</span>
                </div>
                <Input
                  value={data.buyerName}
                  onChange={(e) => handleBuyerChange('buyerName', e.target.value)}
                  placeholder="Company Name"
                  className="mb-2 font-medium"
                />
                <Textarea
                  value={data.buyerAddress}
                  onChange={(e) => handleBuyerChange('buyerAddress', e.target.value)}
                  placeholder="Full Address"
                  rows={3}
                  className="mb-2"
                />
                <Input
                  value={data.buyerGstNo}
                  onChange={(e) => handleBuyerChange('buyerGstNo', e.target.value)}
                  placeholder="GST Number"
                  className="text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-3">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Consignee</span>
                </div>
                <Input
                  value={data.consigneeName}
                  onChange={(e) => updateField('consigneeName', e.target.value)}
                  placeholder="Company Name"
                  className="mb-2 font-medium"
                />
                <Textarea
                  value={data.consigneeAddress}
                  onChange={(e) => updateField('consigneeAddress', e.target.value)}
                  placeholder="Full Address"
                  rows={3}
                  className="mb-2"
                />
                <Input
                  value={data.consigneeGstNo}
                  onChange={(e) => updateField('consigneeGstNo', e.target.value)}
                  placeholder="GST Number"
                  className="text-sm"
                />
              </CardContent>
            </Card>
          </div>

          {/* Items Table */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Line Items</h3>
                <div className="flex gap-2 no-print">
                  <Button onClick={addItem} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                  <Button onClick={addDiscount} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Discount
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full smart-table">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left p-3 rounded-tl-lg">#</th>
                      <th className="text-left p-3">Item Description</th>
                      <th className="text-center p-3">UOM</th>
                      <th className="text-right p-3">Qty</th>
                      <th className="text-right p-3">Rate (₹)</th>
                      <th className="text-right p-3 rounded-tr-lg">Amount (₹)</th>
                      <th className="no-print"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item.id} className={`border-b ${item.isDiscount ? 'bg-amber-50' : ''}`}>
                        <td className="p-3 text-slate-500">
                          {!item.isDiscount && item.no}
                        </td>
                        <td className="p-3">
                          {item.isDiscount ? (
                            <Input
                              value={item.discountLabel || ''}
                              onChange={(e) => updateItem(item.id, 'discountLabel', e.target.value)}
                              className="border-amber-300 bg-amber-50"
                            />
                          ) : (
                            <Textarea
                              value={item.itemDetails}
                              onChange={(e) => updateItem(item.id, 'itemDetails', e.target.value)}
                              rows={2}
                              placeholder="Enter item details..."
                              className="min-w-[250px]"
                            />
                          )}
                        </td>
                        <td className="p-3">
                          {!item.isDiscount && (
                            <Input
                              value={item.uom}
                              onChange={(e) => updateItem(item.id, 'uom', e.target.value)}
                              className="w-20 text-center"
                            />
                          )}
                        </td>
                        <td className="p-3">
                          {!item.isDiscount && (
                            <Input
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                          )}
                        </td>
                        <td className="p-3">
                          {!item.isDiscount && (
                            <Input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-28 text-right"
                            />
                          )}
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                            className={`w-32 text-right font-mono ${item.isDiscount ? 'text-amber-600' : ''}`}
                          />
                        </td>
                        <td className="p-2 no-print">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Special Notes */}
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <label className="text-sm font-medium text-amber-800 mb-2 block">Special Notes</label>
              <Textarea
                value={data.specialNotes}
                onChange={(e) => updateField('specialNotes', e.target.value)}
                placeholder="Enter any special notes or terms..."
                rows={2}
                className="bg-white border-amber-200"
              />
            </CardContent>
          </Card>

          {/* Bottom Section */}
          <div className="grid grid-cols-5 gap-6">
            {/* Bank & Terms */}
            <div className="col-span-3 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-3">
                    <Banknote className="w-4 h-4" />
                    <span className="font-medium">Bank Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <label className="text-xs text-slate-500">Account Name</label>
                      <Input
                        value={data.bankDetails.companyName}
                        onChange={(e) => updateNestedField('bankDetails', 'companyName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Account Number</label>
                      <Input
                        value={data.bankDetails.accountNo}
                        onChange={(e) => updateNestedField('bankDetails', 'accountNo', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Branch</label>
                      <Input
                        value={data.bankDetails.branchName}
                        onChange={(e) => updateNestedField('bankDetails', 'branchName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">IFSC Code</label>
                      <Input
                        value={data.bankDetails.ifscCode}
                        onChange={(e) => updateNestedField('bankDetails', 'ifscCode', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <span className="font-medium text-slate-700 mb-3 block">Terms & Conditions</span>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 w-20">Payment:</span>
                      <Input
                        value={data.paymentTerms.payment}
                        onChange={(e) => updateNestedField('paymentTerms', 'payment', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 w-20">Insurance:</span>
                      <Input
                        value={data.paymentTerms.insurance}
                        onChange={(e) => updateNestedField('paymentTerms', 'insurance', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 w-20">Freight:</span>
                      <Input
                        value={data.paymentTerms.freight}
                        onChange={(e) => updateNestedField('paymentTerms', 'freight', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <div className="col-span-2">
              <Card className="bg-slate-900 text-white">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 text-slate-300">Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Basic Amount</span>
                      <span>₹ {formatCurrency(data.basicAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">GST @ {data.gstRate}%</span>
                      <span>₹ {formatCurrency(data.gstAmount)}</span>
                    </div>
                    <div className="border-t border-slate-700 pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>₹ {formatCurrency(data.netAmount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-xs text-blue-600 font-medium mb-1">Amount in Words</p>
                  <p className="text-sm text-slate-700 font-medium">
                    Rupees {data.amountInWords || 'Zero only'}
                  </p>
                </CardContent>
              </Card>

              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-slate-700">For, CONINFRA MACHINERY PVT. LTD.</p>
                <div className="h-16 border-b border-slate-300 mt-2 mb-1"></div>
                <p className="text-xs text-slate-500">Authorised Signatory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 text-center text-xs text-slate-500 border-t">
          <p>Coninfra Machinery Pvt. Ltd. | GST: {data.companyInfo.gstNo} | CIN: {data.companyInfo.cin}</p>
          <p className="mt-1">Reg. Office: 12, Rupnagar Society, Nr. Dada Saheb Pagala, Navrangpura, Ahmedabad-380 009, INDIA</p>
          <p className="mt-1">📞 +91 90999 41311 / 90999 41336 | ✉ sales@coninfra.in | 🌐 www.coninfra.in</p>
        </div>
      </div>
    </div>
  );
}
