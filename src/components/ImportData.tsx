import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { dbService } from '../services/db_service';

export const ImportData: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ customers: 0, orders: 0 });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      parseExcel(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcel(selectedFile);
    }
  };

  const parseExcel = (file: File) => {
    setImporting(true);
    setStatus('processing');
    setMessage('Parsing file...');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        setPreviewData(jsonData);
        setStep(2);
        setStatus('idle');
        setMessage(`Detected ${jsonData.length} rows of data.`);
      } catch (error: any) {
        setStatus('error');
        setMessage(`Error parsing file: ${error.message}`);
      } finally {
        setImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFinalImport = async () => {
    if (previewData.length === 0) return;

    setImporting(true);
    setStatus('processing');
    setMessage('Synchronizing with local database...');

    const safeDateParse = (val: any) => {
      if (!val) return null;
      if (val instanceof Date) return val;
      if (typeof val !== 'string') return new Date(val);
      
      // If it's a string like DD-MM-YYYY
      if (val.includes('-')) {
        const parts = val.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
      return new Date(val);
    };

    try {
      const payload = {
        customers: previewData.map(d => ({
          name: d['Customer'] || d['Customer Name'],
          type: d['Type'] || 'End User',
          industry_type: d['Industry'] || 'Others',
          gst_number: d['GST'] || '',
          orders: {
            create: [{
              order_number: d['Order_No'],
              year: parseInt(d['Year']),
              product_type: d['Product_Type'],
              size: d['Size'],
              quantity: parseInt(d['Quantity']),
              basic_value: parseFloat(d['Basic_Value']),
              tax_amount: parseFloat(d['Tax']),
              final_amount: parseFloat(d['Basic_Value']) + parseFloat(d['Tax']),
              delivery_date: safeDateParse(d['Delivery_Date']),
              invoice_no: d['Invoice_No'],
              invoice_date: safeDateParse(d['Invoice_Date']),
              status: 'Imported'
            }]
          }
        }))
      };

      await dbService.bulkImport(payload);
      
      setStatus('success');
      setMessage('Import completed successfully!');
      setStats({ 
        customers: previewData.length, 
        orders: 0 
      });
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-black tracking-[0.2em] uppercase">Data Injection</h2>
        <p className="text-black/40 text-[10px] uppercase font-bold tracking-widest">Bulk upload customers and orders from Excel spreadsheets</p>
      </div>

      {/* Upload Section - Top Full Width */}
      <div className="industrial-card p-12 border-dashed border-2 border-black/10 bg-white flex flex-col items-center justify-center text-center gap-6 relative group hover:border-black/20 transition-all cursor-pointer">
        <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center border border-black/10 group-hover:scale-110 transition-transform">
          <Upload className="w-10 h-10 text-black/20 group-hover:text-black/60 transition-colors" />
        </div>
        <div>
          <p className="text-xs font-black text-black uppercase tracking-[0.2em]">Initialize Upload</p>
          <p className="text-[9px] text-black/30 mt-2 uppercase font-bold tracking-widest">Excel files (.xlsx, .xls, .csv) // MAX 10MB</p>
        </div>
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={handleFileChange}
        />
        {file && (
          <div className="mt-4 flex items-center gap-2 bg-black/5 px-4 py-2 rounded border border-black/10 animate-pulse">
            <FileSpreadsheet className="w-4 h-4 text-black" />
            <span className="text-[10px] font-bold text-black uppercase tracking-widest">{file.name}</span>
          </div>
        )}
      </div>

      {/* Status & Preview Section */}
      <div className="space-y-6">
        {previewData.length > 0 && status !== 'success' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="industrial-card p-8 space-y-6 bg-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Data Stream Preview</h3>
              <span className="text-[9px] font-black text-black/30 uppercase tracking-widest">{previewData.length} indices detected</span>
            </div>
            
            <div className="overflow-x-auto border border-black/5 rounded bg-black/[0.02]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/5 border-b border-black/5 text-[9px] font-black text-black/30 uppercase tracking-widest">
                    {['Year', 'Order_No', 'Customer', 'Product_Type', 'Quantity', 'Basic_Value'].map(key => (
                      <th key={key} className="px-4 py-3">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-black/5 last:border-0 hover:bg-black/[0.01] transition-colors">
                      {['Year', 'Order_No', 'Customer', 'Product_Type', 'Quantity', 'Basic_Value'].map((key, j) => (
                        <td key={j} className="px-4 py-3 text-[11px] text-black/60 font-medium">{row[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleFinalImport}
                disabled={importing}
                className="industrial-btn-primary flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    SYNCHRONIZING...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    EXECUTE IMPORT
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="industrial-card p-12 bg-white border-black/10 flex flex-col items-center text-center gap-6"
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-[0.3em]">Sync Completed</h3>
              <p className="text-[10px] text-black/40 mt-2 uppercase font-bold tracking-widest">{message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-6">
              <div className="bg-black/5 p-6 rounded border border-black/5">
                <p className="text-[9px] font-black text-black/30 uppercase tracking-widest mb-1">Entities</p>
                <p className="text-3xl font-black text-black tracking-widest">{stats.customers}</p>
              </div>
              <div className="bg-black/5 p-6 rounded border border-black/5">
                <p className="text-[9px] font-black text-black/30 uppercase tracking-widest mb-1">Transactions</p>
                <p className="text-3xl font-black text-black tracking-widest">{stats.orders}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setFile(null);
                setPreviewData([]);
                setStatus('idle');
              }}
              className="mt-6 text-[9px] font-black text-black/40 uppercase tracking-[0.3em] hover:text-black transition-colors border-b border-transparent hover:border-black pb-1"
            >
              Clear for new session
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <div className="industrial-card p-8 bg-red-50 border-red-500/20 flex items-start gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0 border border-red-500/30">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-xs font-black text-black uppercase tracking-widest">Protocol Failure</h3>
              <p className="text-[10px] text-red-600 mt-2 uppercase font-bold tracking-widest">{message}</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-4 text-[9px] font-black text-red-600 uppercase tracking-widest hover:underline"
              >
                Retry Operation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Box 1: Excel Template */}
        <div className="industrial-card p-8 bg-white text-black border-black/5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
            <FileSpreadsheet className="w-4 h-4 text-black/40" />
            Protocol Documentation
          </h3>
          <p className="text-[10px] text-black/40 uppercase font-bold tracking-widest leading-relaxed mb-8">
            Ensure your localized dataset adheres to the Edgeflex Industrial Specification v4.0.
          </p>
          
          <div className="space-y-6">
            {[
              "Fields must maintain absolute naming convention integrity",
              "ISO-8601 or Industrial Date Formats (DD-MM-YYYY) validated",
              "Float32/64 Numeric values processed without symbolic prefixes"
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-6 h-6 bg-black/5 border border-black/10 rounded flex items-center justify-center text-[10px] font-black text-black/40 shrink-0">{i+1}</div>
                <p className="text-[11px] text-black/60 font-medium leading-normal">{text}</p>
              </div>
            ))}
          </div>

          <button className="w-full mt-10 industrial-btn-secondary">
            Fetch Template Structure
          </button>
        </div>

        {/* Box 2: Required Columns */}
        <div className="industrial-card p-8 bg-white">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black mb-8">Field Integrity Requirements</h3>
          <ul className="grid grid-cols-1 gap-3">
            {['Year', 'Order_No', 'Customer', 'Branch', 'Industry', 'Location', 'Product_Type', 'Size', 'Quantity', 'Basic_Value', 'Tax'].map(col => (
              <li key={col} className="flex items-center justify-between p-2.5 bg-black/5 rounded border border-black/[0.02]">
                <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">{col}</span>
                <span className="text-[8px] font-black text-black/60 px-2 py-0.5 border border-black/20 rounded uppercase">Mandatory</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
