/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import QRCode from 'qrcode';

/**
 * Generate a QR code Data URL representing an in-app verification link
 */
export async function generateVerificationQR(certIdOrHash: string): Promise<string> {
  try {
    const origin = window.location.origin;
    const verificationUrl = `${origin}/#verify/${encodeURIComponent(certIdOrHash)}`;
    
    return await QRCode.toDataURL(verificationUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

export const generateQRCodeDataURL = generateVerificationQR;
