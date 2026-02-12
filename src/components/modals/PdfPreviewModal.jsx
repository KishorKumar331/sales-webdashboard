import React, { useRef, useState } from 'react';
import { X, Download, AlertCircle, Loader2 } from 'lucide-react';

const PdfPreviewModal = ({ 
  visible, 
  pdfUri, 
  pdfHtml, 
  onClose, 
  onShare, 
  clientName = 'Quotation' 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGeneratingPdf(true);
      
      if (pdfHtml) {
        console.log("🔄 Opening print dialog for PDF...");
        
        // Create a temporary div with the HTML content
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '210mm'; // A4 width
        tempDiv.style.padding = '20px';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.innerHTML = pdfHtml;
        
        document.body.appendChild(tempDiv);
        
        // Wait for content to render then print
        setTimeout(() => {
          const printWindow = window.open('', '_blank');
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${clientName} Quotation</title>
                <style>
                  body { 
                    margin: 20px; 
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                  }
                  @media print {
                    body { margin: 0; }
                  }
                </style>
              </head>
              <body>
                ${pdfHtml}
              </body>
            </html>
          `);
          printWindow.document.close();
          
          // Trigger print dialog
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
            document.body.removeChild(tempDiv);
            console.log("✅ Print dialog opened successfully");
          }, 500);
        }, 300);
        
        // Call onShare callback to submit quotation to API
        if (onShare) {
          await onShare();
        }
      } else if (pdfUri) {
        // Fallback to existing PDF
        const link = document.createElement('a');
        link.href = pdfUri;
        link.download = `${clientName}_Quotation.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("✅ PDF downloaded successfully");
        
        if (onShare) {
          await onShare();
        }
      } else {
        throw new Error("No PDF content available");
      }
    } catch (error) {
      console.error('❌ Error generating/downloading PDF:', error);
      alert('Failed to generate PDF: ' + (error?.message || error));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generatePdfFromHtml = async (html) => {
    // Simple PDF generation for web using print functionality
    // In a real implementation, you'd use a library like jsPDF or Puppeteer
    return new Promise((resolve) => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${clientName} Quotation</title>
            <style>
              body { 
                margin: 20px; 
                font-family: Arial, sans-serif;
                line-height: 1.6;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        resolve('pdf-generated');
      }, 500);
    });
  };

  const iframeRef=useRef(null)
    const handlePrint = () => {
    try {
      if (!iframeRef.current) return;

      setIsPrinting(true);

      const printWindow = iframeRef.current.contentWindow;

      printWindow.focus();

      // Delay slightly to ensure content is fully rendered
      setTimeout(() => {
        printWindow.print();
        setIsPrinting(false);
      }, 300);

    } catch (err) {
      console.error("Print error:", err);
      setError(true);
      setIsPrinting(false);
    }
  };


  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-gray-50 w-full  h-full rounded-2xl overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 pt-6 flex justify-between items-center border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={24} className="text-gray-700" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Quotation Preview</h2>
          <button 
            onClick={handleDownload} 
            className={`p-2 rounded-lg transition-colors ${
              isGeneratingPdf 
                ? 'bg-gray-100 cursor-not-allowed' 
                : 'bg-purple-100 hover:bg-purple-200'
            }`}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            ) : (
              <Download size={24} className="text-purple-600" />
            )}
          </button>
        </div>

        {/* PDF Preview */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
              <AlertCircle size={60} className="text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to preview PDF</h3>
              <p className="text-gray-600 text-center">Use the download button below to view the quotation</p>
            </div>
          )}
          
          {pdfHtml && !error && (
            <iframe
            ref={iframeRef}
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                      body {
                        margin: 0;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        // zoom: 0.44;
                        min-height: 100vh;
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                      }
                      @media print {
                        body { 
                          margin: 0;
                          zoom: 1.0;
                        }
                      }
                    </style>
                  </head>
                  <body>
                    <div>
                      ${pdfHtml}
                    </div>
                  </body>
                </html>
              `}
              className="w-full h-full bg-white"
              style={{ border: 'none' }}
              onError={(e) => {
                console.error('iframe error:', e);
                setLoading(false);
                setError(true);
              }}
              onLoad={() => {
                setLoading(false);
              }}
            />
          )}
        </div>

        {/* Bottom Actions */}
        <div className="bg-white p-4 border-t border-gray-200">
          <button 
            className={`w-full flex items-center justify-center gap-3 bg-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors ${
              isGeneratingPdf 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-purple-700'
            }`}
            onClick={handleDownload}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={20} />
                <span>Download & Share PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
