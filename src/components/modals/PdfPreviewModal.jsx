import React, { useState } from "react";
import { X, Download, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import styles from "./PdfPreviewModal.module.css";

const API_URL =
  "https://0rq0f90i05.execute-api.ap-south-1.amazonaws.com/salesapp/packages-pdf-html";

const PdfPreviewModal = ({
  visible,
  data,
  pdfHtml,
  onClose,
  clientName = "Quotation",
  onShare,
}) => {
  console.log(data)
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(false);



  const handleDownload = async () => {
    try {
      if (!pdfHtml) {
        toast.error("No HTML available");
        return;
      }

      setIsGenerating(true);

      const response = await axios.post(API_URL, {
        mode: "pdf",
        type: "quotation",
        html: pdfHtml,
        fileName: `${clientName}.pdf`,
        tripId: data?.TripId,
        quoteId: data?.QuoteId,

      });

      const fileUrl = response?.data?.url;
      console.log(fileUrl)
      if (!fileUrl) {
        throw new Error("No file URL received");
      }

      // ✅ FORCE DOWNLOAD VIA BLOB
      const fileResponse = await axios.get(fileUrl, {
        responseType: "blob",
      });
      console.log(fileResponse)
      const blob = new Blob([fileResponse.data], {
        type: "application/pdf",
      });
      console.log(blob)
      const blobUrl = window.URL.createObjectURL(blob);
      console.log(blobUrl)
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `${clientName}.pdf`);
      console.log(link)
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean memory
      window.URL.revokeObjectURL(blobUrl);

      toast.success("PDF downloaded successfully ✅");

      // Only call onShare if it's provided
      onShare();

    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };


  if (!visible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <button
            onClick={onClose}
            className={styles.headerButton}
          >
            <X size={22} />
          </button>

          <h2 className={styles.headerTitle}>
            Pdf Preview
          </h2>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={styles.headerButton}
          >
            {isGenerating ? (
              <Loader2 className={`${styles.loadingSpinner} text-purple-600`} />
            ) : (
              <Download className="text-purple-600" />
            )}
          </button>
        </div>

        {/* Preview Area */}
        <div className={styles.previewArea}>
          {error && (
            <div className={styles.errorContainer}>
              <AlertCircle size={50} className={styles.errorIcon} />
              <h3 className={styles.errorTitle}>Unable to preview PDF</h3>
              <p className={styles.errorDescription}>
                Use the download button below to view the quotation
              </p>
            </div>
          )}

          {!error && pdfHtml && (
            <iframe
              srcDoc={pdfHtml}
              className={styles.iframe}
              title="PDF Preview"
              onError={() => {
                console.error('iframe error');
                setError(true);
              }}
              onLoad={() => {
                setLoading(false);
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={styles.downloadButton}
          >
            {isGenerating ? (
              <>
                <Loader2 className={styles.loadingSpinner} />
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
