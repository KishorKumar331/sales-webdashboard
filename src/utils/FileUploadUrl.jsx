import axios from 'axios';
import React from 'react'

export const FileToDataUrl = (file) => {
    console.log('FileToDataUrl called with file:', file);
    console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate
    });
    
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
        console.log('FileReader onload triggered');
        const result = event.target.result;
        console.log('Base64 result (first 100 chars):', result ? result.substring(0, 100) + '...' : 'null');
        console.log('Base64 length:', result ? result.length : 0);
        resolve(result);
    };
    
    reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
    };
    
    reader.onprogress = (progress) => {
        console.log('FileReader progress:', progress.loaded, 'of', progress.total);
    };
    
    console.log('Starting file read as data URL...');
    reader.readAsDataURL(file);
  });
};

/**
 * Upload file to profile resources API
 * @param {File} file - The file to upload
 * @param {string} filePath - The file path (e.g., "invoice_pdf_assets/tesla/invoice_001.jpeg")
 * @returns {Promise<string>} - Returns the uploaded file URL
 */
export const uploadFileToProfileAPI = async (file, filePath) => {
  try {
    console.log('Starting file upload to profile API...');
    console.log('File path:', filePath);
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Convert file to base64
    const base64Data = await FileToDataUrl(file);
    
    // Extract the base64 content (remove data:image/...;base64, prefix)
    const base64Content = base64Data.split(',')[1];
    
    console.log('Base64 content length:', base64Content.length);
    console.log('Base64 content (first 100 chars):', base64Content.substring(0, 100) + '...');
    
    // Prepare the payload
    const payload = {
      file_path: filePath,
      image_data: base64Content
    };
    
    console.log('API payload prepared:', {
      file_path: payload.file_path,
      image_data_length: payload.image_data.length
    });
    
    // Make API call
    const response = await axios.post('https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/profile/resources', payload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('API response:', response.data);
    
    // Assuming the API returns the URL in the response
    // Adjust this based on actual API response structure
    return response.data.url || response.data.fileUrl || response.data.location || response.data;
    
  } catch (error) {
    console.error('File upload error:', error);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Upload company logo with predefined path
 * @param {File} file - Logo file
 * @param {string} company - Company identifier
 * @returns {Promise<string>} - Uploaded logo URL
 */
export const uploadCompanyLogo = (file, company) => {
    console.log(file)
  const filePath = `${company}/profile/${file.name}`;
  return uploadFileToProfileAPI(file, filePath);
};

/**
 * Upload payment QR code with predefined path
 * @param {File} file - QR code file
 * @param {string} company - Company identifier
 * @returns {Promise<string>} - Uploaded QR code URL
 */
export const uploadPaymentQR = (file, company) => {
  const filePath = `${company}/profile/${file.name}`;
  return uploadFileToProfileAPI(file, filePath);
};

/**
 * Upload invoice PDF with predefined path
 * @param {File} file - PDF file
 * @param {string} company - Company identifier
 * @param {string} invoiceNumber - Invoice number
 * @returns {Promise<string>} - Uploaded PDF URL
 */
export const uploadInvoicePDF = (file, company, invoiceNumber) => {
  const filePath = `invoice_pdf_assets/${company}/invoice_${invoiceNumber}.${file.name.split('.').pop()}`;
  return uploadFileToProfileAPI(file, filePath);
};