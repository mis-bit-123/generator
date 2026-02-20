import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { InvoiceData } from '@/types/invoice';
import { defaultInvoiceData } from '@/types/invoice';
import ClassicInvoice from '@/components/ClassicInvoice';
import SmartInvoice from '@/components/SmartInvoice';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles, RotateCcw, Printer } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import './App.css';

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(defaultInvoiceData);
  const [activeTab, setActiveTab] = useState('classic');
  const classicRef = useRef<HTMLDivElement>(null);
  const smartRef = useRef<HTMLDivElement>(null);

  const handleDataChange = (newData: InvoiceData) => {
    setInvoiceData(newData);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data?')) {
      setInvoiceData(defaultInvoiceData);
      toast.success('Data reset successfully');
    }
  };

  const exportToPDF = async () => {
    const invoiceRef = activeTab === 'classic' ? classicRef.current : smartRef.current;
    
    if (!invoiceRef) {
      toast.error('Invoice not found');
      return;
    }

    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' });

      // Wait for any pending renders
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(invoiceRef, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: invoiceRef.scrollWidth,
        windowHeight: invoiceRef.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions (A4)
      const pdfWidth = 210; // mm
      const pdfHeight = 297; // mm
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      let imgY = 10;

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate how many pages needed
      const scaledHeight = imgHeight * ratio * (pdfWidth / (imgWidth * ratio));
      const pageHeight = pdfHeight - 20; // margin
      
      let heightLeft = scaledHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', imgX, imgY, pdfWidth - 20, imgHeight * ratio * ((pdfWidth - 20) / (imgWidth * ratio)));
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position + imgY, pdfWidth - 20, imgHeight * ratio * ((pdfWidth - 20) / (imgWidth * ratio)));
        heightLeft -= pageHeight;
      }

      // Generate filename
      const filename = `Proforma_Invoice_${invoiceData.proformaInvoiceNo || 'Draft'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      pdf.save(filename);
      
      toast.success('PDF downloaded successfully!', { id: 'pdf-export' });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: 'pdf-export' });
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Proforma Invoice Generator</h1>
                <p className="text-xs text-slate-500">Coninfra Machinery Pvt. Ltd.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 no-print">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-slate-600"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={printInvoice}
                className="text-slate-600"
              >
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Format Selection */}
        <div className="mb-6 no-print">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="classic" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Classic Format
              </TabsTrigger>
              <TabsTrigger value="smart" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Smart Format
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="classic" className="mt-6">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4 no-print">
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <FileText className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Classic Format</p>
                    <p className="text-sm text-amber-700">Exact replica of the Excel template with logo and footer alignment fixed</p>
                  </div>
                </div>
              </div>
              <div ref={classicRef}>
                <ClassicInvoice
                  data={invoiceData}
                  onDataChange={handleDataChange}
                  onExportPDF={exportToPDF}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="smart" className="mt-6">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4 no-print">
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Smart Format</p>
                    <p className="text-sm text-blue-700">Modern, professional design with improved visual hierarchy and user experience</p>
                  </div>
                </div>
              </div>
              <div ref={smartRef}>
                <SmartInvoice
                  data={invoiceData}
                  onDataChange={handleDataChange}
                  onExportPDF={exportToPDF}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Print-only content */}
        <div className="print-only hidden">
          {activeTab === 'classic' ? (
            <ClassicInvoice
              data={invoiceData}
              onDataChange={handleDataChange}
              onExportPDF={exportToPDF}
            />
          ) : (
            <SmartInvoice
              data={invoiceData}
              onDataChange={handleDataChange}
              onExportPDF={exportToPDF}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-600 font-medium">Coninfra Machinery Pvt. Ltd.</p>
              <p className="text-xs text-slate-500">Professional Construction Equipment Manufacturer</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>GST: {invoiceData.companyInfo.gstNo}</span>
              <span>|</span>
              <span>CIN: {invoiceData.companyInfo.cin}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
