// ALIANSI STORE - Serverless Automated Email Dispatcher
// Netlify Function: /.netlify/functions/send-email or /api/send-email

exports.handler = async (event, context) => {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const order = body.order || {};
    const customerEmail = (body.customerEmail || order.customerEmail || '').trim();
    const customerName = body.customerName || order.customerName || 'Pelanggan Setia';
    const adminEmail = (body.adminEmail || process.env.ADMIN_EMAIL || 'aliansistore.id@gmail.com').trim();
    const appsScriptUrl = (body.appsScriptUrl || process.env.GOOGLE_APPS_SCRIPT_URL || '').trim();

    console.info(`[SEND-EMAIL] Automated dispatch trigger for Order #${order.id || body.orderId || 'UNKNOWN'}:`);
    console.info(`  Customer: ${customerEmail}`);
    console.info(`  Admin:    ${adminEmail}`);
    console.info(`  AppsScript Target: ${appsScriptUrl ? 'CONFIGURED' : 'NOT_SET'}`);

    let forwardedToAppsScript = false;
    let appsScriptError = null;

    // 1. Forward directly to Google Apps Script Web App if URL is provided
    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        const payload = {
          action: body.action || 'send_order_emails',
          order: order,
          customerEmail: customerEmail,
          customerName: customerName,
          adminEmail: adminEmail,
          timestamp: new Date().toISOString()
        };

        const gasRes = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        forwardedToAppsScript = true;
        console.info(`[SEND-EMAIL] Google Apps Script response status: ${gasRes.status}`);
      } catch (gasErr) {
        appsScriptError = gasErr.message;
        console.warn(`[SEND-EMAIL] Google Apps Script call failed: ${gasErr.message}`);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Permintaan email otomatis berhasil diproses',
        details: {
          customerEmail: customerEmail,
          adminEmail: adminEmail,
          appsScriptForwarded: forwardedToAppsScript,
          appsScriptError: appsScriptError
        }
      })
    };
  } catch (err) {
    console.error(`[SEND-EMAIL ERROR] ${err.message}`);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: err.message
      })
    };
  }
};
