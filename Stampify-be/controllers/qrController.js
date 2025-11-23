const { generateQRCodeBase64, getOrCreateQRToken } = require('../services/qrService');

/**
 * Get QR code for the authenticated business owner
 * Returns base64 encoded image
 */
const getMyQR = async (req, res) => {
  try {
    const qrToken = await getOrCreateQRToken(req.user._id);
    const qrCodeBase64 = await generateQRCodeBase64(qrToken);

    res.json({
      success: true,
      data: {
        qrCode: qrCodeBase64,
        qrToken: qrToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating QR code',
      error: error.message
    });
  }
};

module.exports = {
  getMyQR
};

