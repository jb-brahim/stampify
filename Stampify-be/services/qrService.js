const QRCode = require('qrcode');
const BusinessOwner = require('../models/BusinessOwner');

/**
 * Generate QR code as base64 string
 */
const generateQRCodeBase64 = async (qrToken) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrToken, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

/**
 * Generate QR code as PNG buffer
 */
const generateQRCodeBuffer = async (qrToken) => {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(qrToken, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300
    });
    return qrCodeBuffer;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

/**
 * Get or generate QR token for a business owner
 */
const getOrCreateQRToken = async (businessOwnerId) => {
  try {
    const businessOwner = await BusinessOwner.findById(businessOwnerId);
    
    if (!businessOwner) {
      throw new Error('Business owner not found');
    }

    // QR token is auto-generated on creation, so it should always exist
    return businessOwner.qrToken;
  } catch (error) {
    throw new Error(`Failed to get QR token: ${error.message}`);
  }
};

module.exports = {
  generateQRCodeBase64,
  generateQRCodeBuffer,
  getOrCreateQRToken
};

