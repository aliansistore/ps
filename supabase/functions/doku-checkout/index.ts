// Supabase Edge Function: DOKU Checkout (Jokul) v1 Payment Creator
// Deploy in Supabase Dashboard -> Edge Functions -> Create function "doku-checkout"
// Required Secrets (Edge Functions -> Secrets):
//   DOKU_CLIENT_ID   = Client-Id dari DOKU Dashboard (Settings -> API Keys)
//   DOKU_SECRET_KEY  = Secret Key dari DOKU Dashboard (Settings -> API Keys)
//   DOKU_ENV         = "sandbox" (default) atau "production"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const METHOD_MAP: Record<string, string[]> = {
  qris: ['QRIS'],
  bca: ['VIRTUAL_ACCOUNT_BCA'],
  mandiri: ['VIRTUAL_ACCOUNT_BANK_MANDIRI'],
  bri: ['VIRTUAL_ACCOUNT_BRI'],
  bni: ['VIRTUAL_ACCOUNT_BNI'],
  permata: ['VIRTUAL_ACCOUNT_BANK_PERMATA'],
  cimb: ['VIRTUAL_ACCOUNT_BANK_CIMB'],
  dana: ['EMONEY_DANA'],
  ovo: ['EMONEY_OVO'],
  gopay: ['EMONEY_GOPAY'],
  shopeepay: ['EMONEY_SHOPEEPAY'],
};

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function sha256Base64(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return toBase64(new Uint8Array(hashBuffer));
}

async function hmacSha256Base64(secret: string, message: string): Promise<string> {
  const keyData = new TextEncoder().encode(secret);
  const msgData = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return toBase64(new Uint8Array(sigBuffer));
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method Not Allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const clientId = (Deno.env.get('DOKU_CLIENT_ID') || '').trim();
    const secretKey = (Deno.env.get('DOKU_SECRET_KEY') || '').trim();
    const env = (Deno.env.get('DOKU_ENV') || 'sandbox').trim().toLowerCase();

    if (!clientId || !secretKey) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'MISSING_DOKU_CREDENTIALS',
          message: 'DOKU_CLIENT_ID dan DOKU_SECRET_KEY belum diatur di Supabase Edge Function Secrets.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = await req.json();
    const invoiceNumber = String(body.invoiceNumber || body.merchantOrderId || '').trim();
    const amount = Math.round(Number(body.amount || body.paymentAmount || 0));
    const paymentMethodKey = String(body.paymentMethod || '').trim().toLowerCase();
    const customerName = String(body.customerName || 'Customer Aliansi Store').trim().slice(0, 50);
    const customerEmail = String(body.customerEmail || 'customer@aliansistore.com').trim();
    const customerPhone = String(body.customerPhone || '081234567890').replace(/[^0-9]/g, '') || '081234567890';
    const callbackUrl = String(body.returnUrl || body.callbackUrl || 'https://aliansistore.github.io/ps/').trim();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!invoiceNumber || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Parameter invoiceNumber dan amount wajib diisi.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const requestTarget = '/checkout/v1/payment';
    const baseUrl = env === 'production'
      ? 'https://api.doku.com'
      : 'https://api-sandbox.doku.com';

    const lineItems = items.length > 0
      ? items.map((item: { title?: string; unitPrice?: number; qty?: number }) => ({
          name: String(item.title || 'Game PlayStation Digital').slice(0, 64),
          price: Math.round(Number(item.unitPrice || amount)),
          quantity: Math.max(1, Math.round(Number(item.qty || 1))),
        }))
      : [{ name: 'Game PlayStation Digital', price: amount, quantity: 1 }];

    // Pastikan total line_items sama dengan order.amount (jika ada diskon voucher, kirim 1 ringkasan item)
    const lineItemsSum = lineItems.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0,
    );

    const orderObj: Record<string, unknown> = {
      amount,
      invoice_number: invoiceNumber,
      currency: 'IDR',
      callback_url: callbackUrl,
      auto_redirect: false,
    };

    if (lineItemsSum === amount) {
      orderObj.line_items = lineItems;
    }

    const sendToDoku = async (includePaymentMethodFilter: boolean) => {
      const paymentObj: Record<string, unknown> = {
        payment_due_date: 60, // berlaku 60 menit
      };

      if (includePaymentMethodFilter && paymentMethodKey && METHOD_MAP[paymentMethodKey]) {
        paymentObj.payment_method_types = METHOD_MAP[paymentMethodKey];
      }

      const dokuPayload = {
        order: orderObj,
        payment: paymentObj,
        customer: {
          id: invoiceNumber,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
      };

      const rawBody = JSON.stringify(dokuPayload);
      const reqId = crypto.randomUUID();
      const reqTs = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
      const digest = await sha256Base64(rawBody);
      const componentSignature =
        `Client-Id:${clientId}\n` +
        `Request-Id:${reqId}\n` +
        `Request-Timestamp:${reqTs}\n` +
        `Request-Target:${requestTarget}\n` +
        `Digest:${digest}`;
      const signature = `HMACSHA256=${await hmacSha256Base64(secretKey, componentSignature)}`;

      const resp = await fetch(`${baseUrl}${requestTarget}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': clientId,
          'Request-Id': reqId,
          'Request-Timestamp': reqTs,
          'Digest': digest,
          'Signature': signature,
        },
        body: rawBody,
      });

      const data = await resp.json();
      return { resp, data };
    };

    // 1. Coba sesuai metode yang dipilih user; jika channel belum aktif di akun DOKU, fallback ke semua channel aktif
    let { resp: dokuResp, data: dokuData } = await sendToDoku(true);
    if (!dokuResp.ok && paymentMethodKey && METHOD_MAP[paymentMethodKey]) {
      const retry = await sendToDoku(false);
      if (retry.resp.ok) {
        dokuResp = retry.resp;
        dokuData = retry.data;
      }
    }

    if (!dokuResp.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          env,
          status: dokuResp.status,
          message: dokuData?.error?.message || dokuData?.message || 'DOKU Checkout gagal membuat transaksi.',
          raw: dokuData,
        }),
        { status: dokuResp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const paymentUrl = dokuData?.response?.payment?.url || null;
    const tokenId = dokuData?.response?.payment?.token_id || null;
    const expiredDate = dokuData?.response?.payment?.expired_date || null;

    return new Response(
      JSON.stringify({
        success: true,
        env,
        invoiceNumber,
        amount,
        paymentUrl,
        tokenId,
        expiredDate,
        paymentMethod: paymentMethodKey || 'doku_all',
        raw: dokuData,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: err instanceof Error ? err.message : 'Internal Server Error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
