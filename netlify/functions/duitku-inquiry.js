const crypto = require('crypto');

// Duitku API Sandbox Credentials
const DEFAULT_MERCHANT_CODE = 'DS37511';
const DEFAULT_API_KEY = 'af12edbc311afba784bc7c8bd19a2c61';
const SANDBOX_INQUIRY_URL = 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry';
const PRODUCTION_INQUIRY_URL = 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry';

exports.handler = async (event, context) => {
  // Handle CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const merchantCode = process.env.DUITKU_MERCHANT_CODE || DEFAULT_MERCHANT_CODE;
    const apiKey = process.env.DUITKU_API_KEY || DEFAULT_API_KEY;
    const env = process.env.DUITKU_ENV || 'sandbox';
    const targetUrl = env === 'production' ? PRODUCTION_INQUIRY_URL : SANDBOX_INQUIRY_URL;

    const paymentAmount = parseInt(body.paymentAmount, 10);
    const merchantOrderId = String(body.merchantOrderId || '').trim();
    const paymentMethod = body.paymentMethod || 'SP'; // Default SP (ShopeePay QRIS)
    const productDetails = body.productDetails || 'Game PS4 Digital';
    const email = body.email || 'customer@gmail.com';
    const phoneNumber = body.phoneNumber || '081234567890';
    const callbackUrl = body.callbackUrl || process.env.DUITKU_CALLBACK_URL || 'https://aliansistore-ps.netlify.app/callback';
    const returnUrl = body.returnUrl || 'https://aliansistore-ps.netlify.app/';

    if (!merchantOrderId || !paymentAmount || paymentAmount <= 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Parameter merchantOrderId dan paymentAmount wajib diisi.' })
      };
    }

    // Formula Signature: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
    const rawSig = `${merchantCode}${merchantOrderId}${paymentAmount}${apiKey}`;
    const signature = crypto.createHash('md5').update(rawSig).digest('hex');

    const payload = {
      merchantCode: merchantCode,
      paymentAmount: paymentAmount,
      paymentMethod: paymentMethod,
      merchantOrderId: merchantOrderId,
      productDetails: productDetails,
      email: email,
      phoneNumber: phoneNumber,
      callbackUrl: callbackUrl,
      returnUrl: returnUrl,
      signature: signature,
      expiryPeriod: 60 // Expired dalam 60 menit
    };

    // Panggil Endpoint Duitku Inquiry
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: err.message || 'Internal Server Error' })
    };
  }
};
