// Supabase Edge Function: DOKU HTTP Notification (Webhook) Receiver
// Deploy in Supabase Dashboard -> Edge Functions -> Create function "doku-webhook"
// PENTING: Matikan "Enforce JWT Verification" pada function doku-webhook agar server DOKU bisa mengirim callback!
// Notification URL untuk ditempel di DOKU Dashboard:
//   https://fgotjbcabnragtpijuvk.supabase.co/functions/v1/doku-webhook
//
// Required Secrets (Edge Functions -> Secrets):
//   DOKU_CLIENT_ID   = Client-Id dari DOKU Dashboard
//   DOKU_SECRET_KEY  = Secret Key dari DOKU Dashboard
//   (SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah otomatis tersedia di Supabase Edge Functions)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, client-id, request-id, request-timestamp, signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      JSON.stringify({ received: false, message: 'Method Not Allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const rawBody = await req.text();
    const secretKey = (Deno.env.get('DOKU_SECRET_KEY') || '').trim();
    const supabaseUrl = (Deno.env.get('SUPABASE_URL') || '').trim();
    const serviceRoleKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim();

    // 1. Verifikasi Signature DOKU (jika header Signature & secretKey tersedia)
    const incomingClientId = req.headers.get('Client-Id') || req.headers.get('client-id') || '';
    const incomingRequestId = req.headers.get('Request-Id') || req.headers.get('request-id') || '';
    const incomingTimestamp = req.headers.get('Request-Timestamp') || req.headers.get('request-timestamp') || '';
    const incomingSignature = req.headers.get('Signature') || req.headers.get('signature') || '';

    if (secretKey && incomingSignature) {
      const digest = await sha256Base64(rawBody);
      const reqPathname = new URL(req.url).pathname;
      const candidateTargets = Array.from(new Set([
        '/functions/v1/doku-webhook',
        reqPathname,
      ]));

      let signatureValid = false;
      for (const target of candidateTargets) {
        const componentSignature =
          `Client-Id:${incomingClientId}\n` +
          `Request-Id:${incomingRequestId}\n` +
          `Request-Timestamp:${incomingTimestamp}\n` +
          `Request-Target:${target}\n` +
          `Digest:${digest}`;
        const expected = `HMACSHA256=${await hmacSha256Base64(secretKey, componentSignature)}`;
        if (expected === incomingSignature) {
          signatureValid = true;
          break;
        }
      }

      if (!signatureValid) {
        return new Response(
          JSON.stringify({ received: false, message: 'Invalid DOKU Signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    const payload = JSON.parse(rawBody || '{}');
    const invoiceNumber = String(payload?.order?.invoice_number || '').trim();
    const txStatus = String(payload?.transaction?.status || '').trim().toUpperCase();
    const channelId = String(payload?.channel?.id || payload?.service?.id || 'DOKU').trim();
    const paidDate = payload?.transaction?.date || new Date().toISOString();

    if (!invoiceNumber) {
      return new Response(
        JSON.stringify({ received: false, message: 'Missing order.invoice_number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 2. Update status pesanan di tabel orders Supabase jika pembayaran SUCCESS
    if (txStatus === 'SUCCESS' && supabaseUrl && serviceRoleKey) {
      const restHeaders = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      };

      // Ambil order eksisting agar metadata fulfillment sebelumnya tidak hilang
      const getResp = await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(invoiceNumber)}&select=*`,
        { headers: restHeaders },
      );
      const existingRows = getResp.ok ? await getResp.json() : [];
      const existingOrder = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null;

      if (existingOrder) {
        const currentFulfillment = (existingOrder.fulfillment && typeof existingOrder.fulfillment === 'object')
          ? existingOrder.fulfillment
          : {};

        const updatedFulfillment = {
          ...currentFulfillment,
          doku: {
            ...(currentFulfillment.doku || {}),
            status: 'SUCCESS',
            channel: channelId,
            paidAt: paidDate,
            webhookReceivedAt: new Date().toISOString(),
          },
        };

        await fetch(
          `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(invoiceNumber)}`,
          {
            method: 'PATCH',
            headers: restHeaders,
            body: JSON.stringify({
              payment_status: 'PAID',
              status: existingOrder.status === 'COMPLETED' ? 'COMPLETED' : 'PROCESSING',
              fulfillment: updatedFulfillment,
            }),
          },
        );
      }
    }

    return new Response(
      JSON.stringify({
        received: true,
        invoiceNumber,
        transactionStatus: txStatus || 'RECEIVED',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        received: false,
        message: err instanceof Error ? err.message : 'Internal Server Error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
