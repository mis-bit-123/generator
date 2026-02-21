import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { InvoiceData } from '@/types/invoice';
import { defaultInvoiceData } from '@/types/invoice';
import ClassicInvoice from '@/components/ClassicInvoice';
import SmartInvoice from '@/components/SmartInvoice';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles, RotateCcw, Printer, Calculator } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import './App.css';

// Calculator Component
interface CalculatorProps {
  onClose: () => void;
  initialPosition: { x: number; y: number };
}

function DraggableCalculator({ onClose, initialPosition }: CalculatorProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).closest('.calculator-widget')?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (op: string) => {
    const currentValue = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculate(previousValue, currentValue, operation);
      setPreviousValue(result);
      setDisplay(String(result));
    }
    
    setWaitingForOperand(true);
    setOperation(op);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const performCalculation = () => {
    const currentValue = parseFloat(display);
    
    if (previousValue !== null && operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div 
      className="calculator-widget no-print"
      style={{ left: position.x, top: position.y }}
    >
      <div className="calculator-header" onMouseDown={handleMouseDown}>
        <span className="calculator-title">Calculator</span>
        <button className="calculator-close" onClick={onClose}>×</button>
      </div>
      <div className="calculator-body">
        <input type="text" className="calculator-display" value={display} readOnly />
        <div className="calculator-buttons">
          <button className="calculator-btn clear" onClick={clear}>C</button>
          <button className="calculator-btn" onClick={backspace}>←</button>
          <button className="calculator-btn operator" onClick={() => inputOperation('/')}>/</button>
          <button className="calculator-btn operator" onClick={() => inputOperation('*')}>×</button>
          
          <button className="calculator-btn" onClick={() => inputNumber('7')}>7</button>
          <button className="calculator-btn" onClick={() => inputNumber('8')}>8</button>
          <button className="calculator-btn" onClick={() => inputNumber('9')}>9</button>
          <button className="calculator-btn operator" onClick={() => inputOperation('-')}>-</button>
          
          <button className="calculator-btn" onClick={() => inputNumber('4')}>4</button>
          <button className="calculator-btn" onClick={() => inputNumber('5')}>5</button>
          <button className="calculator-btn" onClick={() => inputNumber('6')}>6</button>
          <button className="calculator-btn operator" onClick={() => inputOperation('+')}>+</button>
          
          <button className="calculator-btn" onClick={() => inputNumber('1')}>1</button>
          <button className="calculator-btn" onClick={() => inputNumber('2')}>2</button>
          <button className="calculator-btn" onClick={() => inputNumber('3')}>3</button>
          <button className="calculator-btn" onClick={() => inputNumber('.')}>.</button>
          
          <button className="calculator-btn" onClick={() => inputNumber('0')}>0</button>
          <button className="calculator-btn equals" onClick={performCalculation}>=</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(defaultInvoiceData);
  const [activeTab, setActiveTab] = useState('classic');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorPosition, setCalculatorPosition] = useState({ x: window.innerWidth - 320, y: 100 });
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

      // Create a clone for PDF generation to avoid UI elements
      const clone = invoiceRef.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '210mm';
      clone.style.background = 'white';
      document.body.appendChild(clone);

      // Remove all no-print elements from clone
      const noPrintElements = clone.querySelectorAll('.no-print');
      noPrintElements.forEach(el => el.remove());

      // Fix inputs to show as text in PDF
      const inputs = clone.querySelectorAll('input, textarea');
      inputs.forEach((input: any) => {
        const value = input.value || input.placeholder || '';
        const span = document.createElement('span');
        span.textContent = value;
        span.style.fontFamily = 'Arial, sans-serif';
        span.style.fontSize = input.classList.contains('party-name') ? '12px' : '12px';
        span.style.fontWeight = input.classList.contains('party-name') ? 'bold' : 'normal';
        span.style.display = 'inline-block';
        span.style.padding = '2px 0';
        span.style.minHeight = '20px';
        span.style.whiteSpace = 'pre-wrap';
        span.style.wordWrap = 'break-word';
        input.parentNode?.replaceChild(span, input);
      });

      // Wait for images to load
      const images = Array.from(clone.querySelectorAll('img'));
      await Promise.all(images.map(img => {
        return new Promise((resolve) => {
          if (img.complete) resolve(null);
          else {
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
          }
        });
      }));

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
        width: clone.scrollWidth,
        height: clone.scrollHeight,
      });

      // Remove clone
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = imgWidth / imgHeight;
      const pdfImgWidth = pdfWidth;
      const pdfImgHeight = pdfWidth / ratio;

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = pdfImgHeight;
      let position = 0;
      let pageCount = 0;

      // Add pages as needed
      while (heightLeft > 0) {
        if (pageCount > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(
          imgData, 
          'PNG', 
          0, 
          position, 
          pdfImgWidth, 
          pdfImgHeight
        );
        
        heightLeft -= pdfHeight;
        position -= pdfHeight;
        pageCount++;
      }

      const filename = `Proforma_Invoice_${invoiceData.proformaInvoiceNo || 'Draft'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      pdf.save(filename);
      
      toast.success('PDF downloaded successfully!', { id: 'pdf-export' });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: 'pdf-export' });
    }
  };

  const printInvoice = () => {
    const invoiceRef = activeTab === 'classic' ? classicRef.current : smartRef.current;
    
    if (!invoiceRef) {
      toast.error('Invoice not found');
      return;
    }

    // Create print window content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const invoiceContent = invoiceRef.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Proforma Invoice - Print</title>
          <style>
            @page {
              size: A4;
              margin: 5mm;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12px;
              color: #000;
              line-height: 1.4;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .print-container {
              width: 200mm;
              min-height: 287mm;
              margin: 0 auto;
              background: white;
              padding: 10mm;
            }
            
            .no-print, .calculator-widget, .calculator-toggle {
              display: none !important;
            }
            
            input, textarea {
              border: none !important;
              background: transparent !important;
              padding: 0 !important;
              resize: none !important;
              overflow: visible !important;
              font-family: 'Arial', sans-serif !important;
              font-size: 11px !important;
              width: auto !important;
              outline: none !important;
            }
            
            .gst-row-web {
              display: none !important;
            }
            
            .gst-row-print {
              display: flex !important;
            }
            
            /* Copy all CSS from App.css for print */
            .classic-invoice {
              width: 100% !important;
              transform: none !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .invoice-logo-section {
              text-align: right;
              padding: 10px 20px 10px 0;
              border-bottom: 2px solid #c41e3a;
            }
            
            .invoice-logo {
              max-width: 350px;
              height: auto;
            }
            
            .invoice-title-section {
              text-align: center;
              padding: 15px 0;
              border-bottom: 1px solid #000;
            }
            
            .invoice-title {
              font-size: 18px;
              font-weight: bold;
              margin: 0;
              letter-spacing: 2px;
            }
            
            .invoice-header-info {
              display: flex;
              justify-content: space-between;
              padding: 10px;
              border-bottom: 1px solid #000;
            }
            
            .header-left, .header-right {
              width: 48%;
            }
            
            .info-row {
              display: flex;
              align-items: center;
              margin-bottom: 5px;
            }
            
            .info-label {
              font-weight: bold;
              min-width: 140px;
              font-size: 11px;
            }
            
            .party-section {
              display: flex;
              border-bottom: 1px solid #000;
            }
            
            .party-box {
              flex: 1;
              padding: 10px;
              border-right: 1px solid #000;
            }
            
            .party-box:last-child {
              border-right: none;
            }
            
            .party-title {
              font-weight: bold;
              font-size: 11px;
              margin-bottom: 8px;
            }
            
            .party-input {
              width: 100%;
              margin-bottom: 5px;
            }
            
            .party-name {
              font-weight: bold;
            }
            
            .gst-row {
              display: flex;
              align-items: center;
              margin-top: 5px;
            }
            
            .gst-label {
              font-weight: bold;
              font-size: 11px;
              margin-right: 5px;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .items-table th {
              background-color: #f5f5f5;
              border: 1px solid #000;
              padding: 8px 5px;
              font-size: 11px;
              font-weight: bold;
              text-align: center;
            }
            
            .items-table td {
              border: 1px solid #000;
              padding: 5px;
              vertical-align: top;
            }
            
            .col-no { width: 5%; text-align: center; }
            .col-item { width: 45%; text-align: left; }
            .col-uom { width: 8%; text-align: center; }
            .col-qty { width: 10%; text-align: center; }
            .col-rate { width: 15%; text-align: right; }
            .col-amount { width: 17%; text-align: right; }
            
            .bottom-section {
              display: flex;
              border-bottom: 1px solid #000;
            }
            
            .bottom-left {
              flex: 1.2;
              padding: 10px;
              border-right: 1px solid #000;
            }
            
            .bottom-right {
              flex: 0.8;
              padding: 10px;
            }
            
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              border-bottom: 1px solid #ddd;
            }
            
            .total-row {
              border-top: 2px solid #000;
              border-bottom: none;
              padding-top: 8px;
              margin-top: 5px;
            }
            
            .amount-words-section {
              padding: 10px;
              border-bottom: 1px solid #000;
              background-color: #f9f9f9;
            }
            
            .footer-info-section {
              display: flex;
              padding: 10px;
              border-bottom: 1px solid #000;
            }
            
            .footer-left { flex: 1; }
            .footer-right {
              flex: 1;
              display: flex;
              justify-content: flex-end;
              align-items: flex-end;
            }
            
            .signature-section {
              text-align: center;
            }
            
            .stamp-image {
              max-width: 120px;
              max-height: 80px;
              object-fit: contain;
              margin-bottom: 5px;
            }
            
            .footer-image-section {
              width: 100%;
              margin-top: 10px;
            }
            
            .footer-image {
              width: 100%;
              height: auto;
            }
            
            @media print {
              .print-container {
                width: 100%;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${invoiceContent}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const toggleCalculator = () => {
    if (!showCalculator) {
      // Center calculator initially
      setCalculatorPosition({
        x: window.innerWidth / 2 - 140,
        y: window.innerHeight / 2 - 200
      });
    }
    setShowCalculator(!showCalculator);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Toaster position="top-right" richColors />
      
      {/* Calculator Toggle Button */}
      <Button
        className="calculator-toggle no-print"
        onClick={toggleCalculator}
        size="lg"
      >
        <Calculator className="w-5 h-5 mr-2" />
        {showCalculator ? 'Hide Calculator' : 'Calculator'}
      </Button>

      {/* Draggable Calculator */}
      {showCalculator && (
        <DraggableCalculator 
          onClose={() => setShowCalculator(false)} 
          initialPosition={calculatorPosition}
        />
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 no-print">
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
            
            <div className="flex items-center gap-2">
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
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
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
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
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

        {/* Print-only content - Hidden but available for print */}
        <div className="hidden print:block">
          {activeTab === 'classic' && (
            <div className="classic-invoice bg-white">
              {/* Simplified print version will be handled by CSS */}
            </div>
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