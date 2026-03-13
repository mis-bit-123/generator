import React, { useState, useRef, useEffect } from 'react';
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

// ─── FIX: import logo & footer as ES modules (same as ClassicInvoice.tsx)
// Vite resolves these to hashed asset URLs — same-origin, no CORS, always works.
import logoUrl   from '@/components/img/image.png';
import footerUrl from '@/components/img/Coninfra.New-18.Footer.png';

// ─── Calculator ────────────────────────────────────────────────────────────────
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
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const mv = (e: MouseEvent) => {
      if (isDragging) setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    };
    const up = () => setIsDragging(false);
    if (isDragging) { document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up); }
    return () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
  }, [isDragging, dragOffset]);

  const inputNumber = (num: string) => {
    if (waitingForOperand) { setDisplay(num); setWaitingForOperand(false); }
    else { setDisplay(display === '0' ? num : display + num); }
  };
  const calc = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b; case '-': return a - b;
      case '*': return a * b; case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };
  const inputOperation = (op: string) => {
    const v = parseFloat(display);
    if (previousValue === null) { setPreviousValue(v); }
    else if (operation) { const r = calc(previousValue, v, operation); setPreviousValue(r); setDisplay(String(r)); }
    setWaitingForOperand(true); setOperation(op);
  };
  const performCalculation = () => {
    const v = parseFloat(display);
    if (previousValue !== null && operation) {
      const r = calc(previousValue, v, operation);
      setDisplay(String(r)); setPreviousValue(null); setOperation(null); setWaitingForOperand(true);
    }
  };
  const clear    = () => { setDisplay('0'); setPreviousValue(null); setOperation(null); setWaitingForOperand(false); };
  const backspace = () => { setDisplay(display.length > 1 ? display.slice(0, -1) : '0'); };

  return (
    <div className="calculator-widget no-print" style={{ left: position.x, top: position.y }}>
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
          {['7','8','9'].map(n=><button key={n} className="calculator-btn" onClick={()=>inputNumber(n)}>{n}</button>)}
          <button className="calculator-btn operator" onClick={() => inputOperation('-')}>-</button>
          {['4','5','6'].map(n=><button key={n} className="calculator-btn" onClick={()=>inputNumber(n)}>{n}</button>)}
          <button className="calculator-btn operator" onClick={() => inputOperation('+')}>+</button>
          {['1','2','3'].map(n=><button key={n} className="calculator-btn" onClick={()=>inputNumber(n)}>{n}</button>)}
          <button className="calculator-btn" onClick={() => inputNumber('.')}>.</button>
          <button className="calculator-btn" onClick={() => inputNumber('0')}>0</button>
          <button className="calculator-btn equals" onClick={performCalculation}>=</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// imgToBase64
// Converts any image URL (including Vite asset URLs like /assets/Coninfra-abc.jpg)
// into a base64 data URI so html2canvas can embed it without CORS issues.
//
// WHY: Even though Vite assets are same-origin, html2canvas sometimes fails to
// read them from the canvas after taint. Converting to base64 first guarantees
// the image is embedded as a data: URI and always renders in the PDF.
// ─────────────────────────────────────────────────────────────────────────────
async function imgToBase64(src: string): Promise<string> {
  if (!src || src.startsWith('data:')) return src;

  // For Vite-resolved paths like /assets/Coninfra-abc123.jpg, fetch as blob
  // then convert to base64 — this always works for same-origin assets.
  try {
    const response = await fetch(src);
    if (response.ok) {
      const blob  = await response.blob();
      const b64   = await new Promise<string>((resolve, reject) => {
        const reader  = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      return b64;
    }
  } catch (_) { /* fall through to Image approach */ }

  // Fallback: draw into canvas
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width  = img.naturalWidth  || 800;
        c.height = img.naturalHeight || 200;
        c.getContext('2d')?.drawImage(img, 0, 0);
        resolve(c.toDataURL('image/jpeg', 0.95));
      } catch { resolve(src); }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// buildInvoiceHTML
//
// Generates a self-contained HTML string for the invoice.
// All images are passed as pre-converted base64 strings so html2canvas
// never has to fetch anything — images always appear in the PDF.
// ─────────────────────────────────────────────────────────────────────────────
function buildInvoiceHTML(data: InvoiceData, opts: {
  logoB64:   string;
  footerB64: string;
  stampB64?: string;
}): string {
  const { logoB64, footerB64, stampB64 } = opts;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const regularItems  = data.items.filter(i => !i.isDiscount && !i.isAdvance);
  const discountItems = data.items.filter(i =>  i.isDiscount);
  const grossAmt  = regularItems.reduce((s, i) => s + (i.amount || 0), 0);
  const discAmt   = data.discountAmount || 0;
  const advAmt    = data.advanceAmount  || 0;

  const itemRows = regularItems.map((item, idx) => `
    <tr>
      <td style="text-align:center;padding:5px 4px;border:1px solid #bbb;">${idx + 1}</td>
      <td style="text-align:left;padding:5px 8px;border:1px solid #bbb;color:#111;">${(item.itemDetails||'').replace(/\n/g,'<br/>')}</td>
      <td style="text-align:center;padding:5px 4px;border:1px solid #bbb;">${item.uom||''}</td>
      <td style="text-align:center;padding:5px 4px;border:1px solid #bbb;">${item.qty??''}</td>
      <td style="text-align:right;padding:5px 8px;border:1px solid #bbb;">${item.rate!=null?item.rate.toLocaleString('en-IN'):''}</td>
      <td style="text-align:right;padding:5px 8px;border:1px solid #bbb;">${fmt(item.amount||0)}</td>
    </tr>`).join('');

  const discountRows = discountItems.map(item => `
    <tr>
      <td style="border:1px solid #bbb;"></td>
      <td style="text-align:left;padding:5px 8px;border:1px solid #bbb;font-weight:600;color:#111;">${item.discountLabel||'Special Discount'}</td>
      <td style="border:1px solid #bbb;"></td>
      <td style="border:1px solid #bbb;"></td>
      <td style="border:1px solid #bbb;"></td>
      <td style="text-align:right;padding:5px 8px;border:1px solid #bbb;font-weight:600;color:#111;">${fmt(item.amount||0)}</td>
    </tr>`).join('');

  const summaryRows = `
    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;font-size:10.5px;">
      <span>Basic Amount</span><span style="font-weight:600;min-width:90px;text-align:right;">${fmt(grossAmt)}</span>
    </div>
    ${discAmt>0?`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;font-size:10.5px;color:#c41e3a;">
      <span>Less: Discount</span><span style="font-weight:600;min-width:90px;text-align:right;">- ${fmt(discAmt)}</span>
    </div>`:''}
    ${advAmt>0?`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;font-size:10.5px;color:#1565c0;">
      <span>Less: Advance</span><span style="font-weight:600;min-width:90px;text-align:right;">- ${fmt(advAmt)}</span>
    </div>`:''}
    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;font-size:10.5px;">
      <span>GST @ ${data.gstRate}%</span><span style="font-weight:600;min-width:90px;text-align:right;">${fmt(data.gstAmount)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:6px 0 0;font-size:11.5px;font-weight:700;border-top:2px solid #000;margin-top:4px;">
      <span>Total with GST</span><span style="min-width:90px;text-align:right;">${fmt(data.netAmount)}</span>
    </div>`;

  const sigBlock = stampB64
    ? `<div style="text-align:right;">
         <img src="${stampB64}" style="max-width:110px;max-height:80px;object-fit:contain;display:block;margin:0 0 4px auto;"/>
         <div style="font-size:9.5px;color:#555;">Authorised Signatory</div>
       </div>`
    : `<div style="text-align:right;">
         <div style="font-size:10.5px;font-weight:700;margin-bottom:24px;color:#222;">For, CONINFRA MACHINERY PVT. LTD.</div>
         <div style="font-size:11px;font-weight:700;color:#111;margin-bottom:2px;">Sweta Harit Sharma</div>
         <div style="width:140px;border-top:1px solid #333;margin:0 0 3px auto;"></div>
         <div style="font-size:9.5px;color:#555;">Authorised Signatory</div>
       </div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;background:#fff;
    -webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .page{width:210mm;margin:0 auto;background:#fff;padding:0 12mm;}
  .s-logo{display:flex;justify-content:flex-end;align-items:flex-end;padding:14px 0 12px;border-bottom:2.5px solid #c41e3a;}
  .s-logo img{max-width:260px;max-height:76px;object-fit:contain;display:block;}
  .s-title{text-align:center;padding:10px 0 9px;border-bottom:1px solid #333;}
  .s-title span{font-size:16px;font-weight:700;letter-spacing:4px;text-transform:uppercase;}
  .s-hdr{display:flex;border-bottom:1px solid #333;}
  .hcol{flex:1;padding:7px 0;}.hcol+.hcol{padding-left:20px;border-left:1px solid #ddd;}
  .irow{display:flex;align-items:baseline;margin-bottom:3px;}
  .ilbl{font-weight:700;font-size:10.5px;min-width:148px;color:#444;}
  .ival{font-size:10.5px;color:#111;}
  .s-party{display:flex;border-bottom:1px solid #333;}
  .pb{flex:1;padding:10px 0;}.pb+.pb{padding-left:16px;border-left:1px solid #333;}
  .pb-hd{font-size:10px;font-weight:700;color:#555;text-transform:uppercase;margin-bottom:6px;padding-bottom:3px;border-bottom:1px solid #eee;}
  .pb-name{font-size:12px;font-weight:700;margin-bottom:3px;}
  .pb-addr{font-size:10.5px;color:#333;line-height:1.55;margin-bottom:5px;white-space:pre-wrap;}
  .pb-gst{font-size:10.5px;font-weight:600;}
  .s-tbl{border-bottom:1px solid #333;}
  table{width:100%;border-collapse:collapse;font-size:10.5px;}
  th{background:#f2f2f2;border:1px solid #aaa;padding:7px 6px;font-weight:700;font-size:10.5px;text-align:center;}
  .cn{width:5%}.cd{width:42%}.cu{width:9%}.cq{width:9%}.cr{width:17%}.ca{width:18%}
  tbody tr:nth-child(even){background:#fafafa;}
  .s-bot{display:flex;border-bottom:1px solid #333;}
  .s-bank{flex:1.35;padding:11px 16px 11px 0;border-right:1px solid #333;}
  .s-sum{flex:.95;padding:11px 0 11px 16px;}
  .btitle{font-size:11px;font-weight:700;margin-bottom:4px;padding-bottom:3px;border-bottom:1px solid #ddd;}
  .bsub{font-size:10px;color:#777;margin-bottom:6px;font-style:italic;}
  .brow{display:flex;margin-bottom:2.5px;}
  .blbl{font-size:10px;min-width:130px;color:#444;font-weight:600;}
  .bval{font-size:10px;color:#111;}
  .tblk{margin-top:8px;}.trow{display:flex;margin-bottom:2px;}
  .tlbl{font-weight:700;font-size:10px;min-width:66px;color:#333;}.tval{font-size:10px;color:#111;}
  .s-words{display:flex;align-items:center;padding:8px 12mm;border-bottom:1px solid #333;background:#f8f8f8;margin:0 -12mm;}
  .wlbl{font-weight:700;font-size:11px;white-space:nowrap;margin-right:10px;color:#333;}
  .wval{font-size:11px;color:#111;font-style:italic;text-transform:capitalize;}
  .s-finf{display:flex;align-items:flex-end;justify-content:space-between;padding:10px 0;border-bottom:1px solid #333;}
  .fi-l{flex:1;}
  .firow{display:flex;align-items:baseline;margin-bottom:2.5px;}
  .fillbl{font-weight:700;font-size:10px;min-width:70px;color:#444;}
  .fival{font-size:10px;color:#111;}
  .s-fimg{margin:0 -12mm;line-height:0;font-size:0;}
  .s-fimg img{width:100%;height:auto;display:block;}
</style>
</head>
<body>
<div class="page">
  <div class="s-logo">
    <img src="${logoB64}" alt="Coninfra Machinery"/>
  </div>
  <div class="s-title"><span>Proforma Invoice</span></div>
  <div class="s-hdr">
    <div class="hcol">
      <div class="irow"><span class="ilbl">Your PO No.:</span><span class="ival">${data.yourPoNo||'—'}</span></div>
      <div class="irow"><span class="ilbl">Date:</span><span class="ival">${data.yourPoDate||'—'}</span></div>
    </div>
    <div class="hcol">
      <div class="irow"><span class="ilbl">Proforma Invoice No.:</span><span class="ival">${data.proformaInvoiceNo||'—'}</span></div>
      <div class="irow"><span class="ilbl">Date:</span><span class="ival">${data.proformaInvoiceDate||'—'}</span></div>
    </div>
  </div>
  <div class="s-party">
    <div class="pb">
      <div class="pb-hd">Buyer's Name &amp; Address</div>
      <div class="pb-name">${data.buyerName||'M/s. Company Name'}</div>
      <div class="pb-addr">${(data.buyerAddress||'Full Address').replace(/\n/g,'<br/>')}</div>
      <div class="pb-gst">GST No.: ${data.buyerGstNo||'##XXXXXXXXXX#X#'}</div>
    </div>
    <div class="pb">
      <div class="pb-hd">Consignee's Name &amp; Address</div>
      <div class="pb-name">${data.consigneeName||'M/s. Company Name'}</div>
      <div class="pb-addr">${(data.consigneeAddress||'Full Address').replace(/\n/g,'<br/>')}</div>
      <div class="pb-gst">GST No.: ${data.consigneeGstNo||'##XXXXXXXXXX#X#'}</div>
    </div>
  </div>
  <div class="s-tbl">
    <table>
      <thead>
        <tr>
          <th class="cn">No.</th><th class="cd">Item Details</th>
          <th class="cu">UOM</th><th class="cq">Qty.</th>
          <th class="cr">Rate (INR)</th><th class="ca">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>${itemRows}${discountRows}</tbody>
    </table>
  </div>
  <div class="s-bot">
    <div class="s-bank">
      <div class="btitle">Bank Details</div>
      <div class="bsub">Please deposit the payment in our below mentioned account.</div>
      <div class="brow"><span class="blbl">Our Company Name:</span><span class="bval">${data.bankDetails.companyName}</span></div>
      <div class="brow"><span class="blbl">Our Current A/C No.:</span><span class="bval">${data.bankDetails.accountNo}</span></div>
      <div class="brow"><span class="blbl">Branch Name:</span><span class="bval">${data.bankDetails.branchName}</span></div>
      <div class="brow"><span class="blbl">RTGS / IFS Code:</span><span class="bval">${data.bankDetails.ifscCode}</span></div>
      <div class="tblk">
        <div class="trow"><span class="tlbl">Payment:</span><span class="tval">${data.paymentTerms.payment}</span></div>
        <div class="trow"><span class="tlbl">Insurance:</span><span class="tval">${data.paymentTerms.insurance}</span></div>
        <div class="trow"><span class="tlbl">Freight:</span><span class="tval">${data.paymentTerms.freight}</span></div>
      </div>
    </div>
    <div class="s-sum">${summaryRows}</div>
  </div>
  <div class="s-words">
    <span class="wlbl">Rupees:</span>
    <span class="wval">${data.amountInWords||'Zero Only'}</span>
  </div>
  <div class="s-finf">
    <div class="fi-l">
      <div class="firow"><span class="fillbl">GST No.:</span><span class="fival">${data.companyInfo.gstNo}</span></div>
      <div class="firow"><span class="fillbl">State Code:</span><span class="fival">${data.companyInfo.stateCode}</span></div>
      <div class="firow"><span class="fillbl">CIN:</span><span class="fival">${data.companyInfo.cin}</span></div>
    </div>
    <div>${sigBlock}</div>
  </div>
</div>
</body></html>`;
/* footer image is drawn separately by jsPDF so it appears at the
   exact bottom of every page, not just where content ends */
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [invoiceData, setInvoiceData]       = useState<InvoiceData>(defaultInvoiceData);
  const [activeTab, setActiveTab]           = useState('classic');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcPos, setCalcPos]               = useState({ x: window.innerWidth - 320, y: 100 });
  const classicRef = useRef<HTMLDivElement>(null);
  const smartRef   = useRef<HTMLDivElement>(null);

  const handleDataChange = (d: InvoiceData) => setInvoiceData(d);
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data?')) {
      setInvoiceData(defaultInvoiceData);
      toast.success('Data reset successfully');
    }
  };

  /** Read the stamp <img> from the live DOM, if a non-default stamp is selected */
  const getStampSrcFromDOM = (): string | undefined => {
    const ref = activeTab === 'classic' ? classicRef.current : smartRef.current;
    if (!ref) return undefined;
    const img = ref.querySelector('.stamp-image') as HTMLImageElement | null;
    if (!img || img.style.display === 'none' || !img.src) return undefined;
    return img.src;
  };

  // ─── PDF Export ─────────────────────────────────────────────────────────────
  // HOW IT WORKS:
  // 1. Convert logo, footer (and stamp if any) to base64 via fetch — guaranteed
  //    to work for same-origin Vite assets, no CORS issues.
  // 2. Build a clean HTML string (no form inputs, no DOM artifacts).
  // 3. Inject that HTML into a hidden off-screen div.
  // 4. Wait for images (they're already base64 so they load instantly).
  // 5. Capture with html2canvas.
  // 6. Slice canvas into A4 pages and save PDF.
  const exportToPDF = async () => {
    try {
      toast.loading('Generating PDF…', { id: 'pdf' });

      // ── Step 1: Convert all images to base64 ─────────────────────────────
      // logo is embedded inside buildInvoiceHTML
      // footerB64 is drawn separately by jsPDF at the bottom of every page
      const [logoB64, footerB64] = await Promise.all([
        imgToBase64(logoUrl),
        imgToBase64(footerUrl),
      ]);
      const rawStamp = getStampSrcFromDOM();
      const stampB64 = rawStamp ? await imgToBase64(rawStamp) : undefined;

      // ── Step 2: Build content HTML (footer NOT included — drawn by jsPDF) ─
      const html = buildInvoiceHTML(invoiceData, { logoB64, footerB64, stampB64 });

      // ── Step 3: Measure actual footer image height in mm ──────────────────
      // We load the footer image to get its natural aspect ratio, then compute
      // how tall it will be at 210mm (full A4 width).
      const footerHeightMM = await new Promise<number>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const ratio = img.naturalHeight / img.naturalWidth;
          resolve(210 * ratio); // height in mm when stretched to A4 width
        };
        img.onerror = () => resolve(28); // fallback: 28mm
        img.src = footerB64;
      });

      // ── Step 4: Render HTML into off-screen container ─────────────────────
      // Add bottom padding equal to footer height so content is never hidden
      // behind where the footer will be drawn.
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:absolute;top:-99999px;left:0;width:794px;background:#fff;z-index:-9999;';
      // Convert footerHeightMM to px (794px = 210mm, so 1mm = 794/210 px)
      const footerHeightPX = Math.ceil(footerHeightMM * (794 / 210));
      const innerDiv = document.createElement('div');
      innerDiv.innerHTML = html;
      innerDiv.style.paddingBottom = `${footerHeightPX}px`;
      wrap.appendChild(innerDiv);
      document.body.appendChild(wrap);

      // ── Step 5: Wait for images to load (all base64 — nearly instant) ─────
      const imgs = Array.from(wrap.querySelectorAll('img'));
      await Promise.all(imgs.map(img =>
        new Promise<void>(res => {
          if (img.complete && img.naturalHeight !== 0) { res(); return; }
          img.onload  = () => res();
          img.onerror = () => res();
        })
      ));
      await new Promise(r => setTimeout(r, 400));

      // ── Step 6: Capture content canvas ───────────────────────────────────
      const canvas = await html2canvas(wrap, {
        scale:           2.5,
        useCORS:         true,
        allowTaint:      true,
        logging:         false,
        backgroundColor: '#ffffff',
        windowWidth:     794,
        width:           794,
      });
      document.body.removeChild(wrap);

      // ── Step 7: Slice canvas into A4 pages & draw footer on EVERY page ────
      //
      //   A4 = 210mm × 297mm
      //   canvas.width px = 210mm  →  pxPerMM = canvas.width / 210
      //   one full A4 page = 297 × pxPerMM pixels of canvas height
      //
      //   Footer is drawn last on every page at:
      //     x = 0, y = 297 - footerHeightMM  (absolute bottom of the page)
      //   It overlaps whatever content (or blank space) is there — so it
      //   always appears pinned to the bottom edge, exactly like a PDF footer.
      //
      const A4W = 210, A4H = 297;
      const pxPerMM  = canvas.width / A4W;
      const slicePX  = A4H * pxPerMM;         // pixels per A4 page
            // Pre-load footer as an Image object for drawImage (needed for canvas approach)
      const footerImg = await new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = footerB64;
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let page = 0, off = 0;

      while (off < canvas.height) {
        if (page > 0) pdf.addPage();

        // — Draw content slice for this page —
        const thisPX = Math.min(slicePX, canvas.height - off);
        const contentSlice = document.createElement('canvas');
        contentSlice.width  = canvas.width;
        contentSlice.height = slicePX; // always full A4 height (blank at bottom if short)
        const ctx = contentSlice.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, contentSlice.width, contentSlice.height);
        ctx.drawImage(canvas, 0, off, canvas.width, thisPX, 0, 0, canvas.width, thisPX);

        // — Draw footer image at absolute bottom of this canvas slice —
        const footerCanvasH = Math.ceil(footerHeightMM * pxPerMM);
        const footerCanvasY = slicePX - footerCanvasH - Math.round(5 * pxPerMM); // 5mm up from bottom
        if (footerImg.complete && footerImg.naturalWidth > 0) {
          ctx.drawImage(footerImg, 0, footerCanvasY, canvas.width, footerCanvasH);
        }

        // — Add to PDF (full A4 height so footer is always at the true bottom) —
        pdf.addImage(
          contentSlice.toDataURL('image/jpeg', 0.97),
          'JPEG', 0, 0, A4W, A4H
        );

        off += slicePX;
        page++;
      }

      const fn = `Proforma_Invoice_${invoiceData.proformaInvoiceNo||'Draft'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fn);
      toast.success('PDF downloaded successfully!', { id: 'pdf' });

    } catch (err) {
      console.error('PDF Export Error:', err);
      toast.error('Failed to generate PDF. Please try again.', { id: 'pdf' });
    }
  };

  // ─── Print ───────────────────────────────────────────────────────────────────
  const printInvoice = async () => {
    const pw = window.open('', '_blank');
    if (!pw) { toast.error('Please allow popups to print'); return; }

    const [logoB64, footerB64] = await Promise.all([
      imgToBase64(logoUrl),
      imgToBase64(footerUrl),
    ]);
    const rawStamp = getStampSrcFromDOM();
    const stampB64 = rawStamp ? await imgToBase64(rawStamp) : undefined;

    let html = buildInvoiceHTML(invoiceData, { logoB64, footerB64, stampB64 });

    // Add print @page and auto-print trigger
    html = html
      .replace('</style>', `
        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }
          .page { width:100%; padding:0 10mm; }
          .s-words { margin:0 -10mm; padding-left:10mm; padding-right:10mm; }
          .s-fimg { width:100%; margin:0; }
        }
      </style>`)
      .replace('</body>', `
        <script>
          window.onload=function(){
            setTimeout(function(){window.print();window.close();},400);
          };
        <\/script>
      </body>`);

    pw.document.open(); pw.document.write(html); pw.document.close();
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100">
      <Toaster position="top-right" richColors />

      <Button className="calculator-toggle no-print" onClick={() => {
        if (!showCalculator) setCalcPos({ x: window.innerWidth / 2 - 140, y: window.innerHeight / 2 - 200 });
        setShowCalculator(s => !s);
      }} size="lg">
        <Calculator className="w-5 h-5 mr-2"/>
        {showCalculator ? 'Hide Calculator' : 'Calculator'}
      </Button>

      {showCalculator && (
        <DraggableCalculator onClose={() => setShowCalculator(false)} initialPosition={calcPos}/>
      )}

      <header className="bg-white shadow-sm border-b sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg"><FileText className="w-6 h-6 text-white"/></div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Proforma Invoice Generator</h1>
                <p className="text-xs text-slate-500">Coninfra Machinery Pvt. Ltd.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset} className="text-slate-600">
                <RotateCcw className="w-4 h-4 mr-1"/>Reset
              </Button>
              <Button variant="outline" size="sm" onClick={printInvoice} className="text-slate-600">
                <Printer className="w-4 h-4 mr-1"/>Print
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 no-print">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="classic" className="flex items-center gap-2"><FileText className="w-4 h-4"/>Classic Format</TabsTrigger>
              <TabsTrigger value="smart"   className="flex items-center gap-2"><Sparkles className="w-4 h-4"/>Smart Format</TabsTrigger>
            </TabsList>

            <TabsContent value="classic" className="mt-6">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <FileText className="w-5 h-5"/>
                  <div>
                    <p className="font-medium">Classic Format</p>
                    <p className="text-sm text-amber-700">Exact replica of the Excel template</p>
                  </div>
                </div>
              </div>
              <div ref={classicRef}>
                <ClassicInvoice data={invoiceData} onDataChange={handleDataChange} onExportPDF={exportToPDF}/>
              </div>
            </TabsContent>

            <TabsContent value="smart" className="mt-6">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <Sparkles className="w-5 h-5"/>
                  <div>
                    <p className="font-medium">Smart Format</p>
                    <p className="text-sm text-blue-700">Modern professional design</p>
                  </div>
                </div>
              </div>
              <div ref={smartRef}>
                <SmartInvoice data={invoiceData} onDataChange={handleDataChange} onExportPDF={exportToPDF}/>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

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