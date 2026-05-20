exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const API_KEY = process.env.NOWPAYMENTS_API_KEY;
  if (!API_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Invalid JSON' }; }
  const { amount, currency, userEmail, userName, taskId } = body;
  try {
    const res = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_amount: amount, price_currency: 'eur', pay_currency: currency.toLowerCase(), success_url: 'https://motiontask.netlify.app/?payment=success', cancel_url: 'https://motiontask.netlify.app/?payment=cancelled', order_id: `MT-${taskId||'withdraw'}-${Date.now()}`, order_description: `MotionTask withdrawal for ${userName||userEmail}` })
    });
    const data = await res.json();
    if (!res.ok) return { statusCode: res.status, body: JSON.stringify({ error: data.message }) };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: data.payment_id, payAddress: data.pay_address, payAmount: data.pay_amount, payCurrency: data.pay_currency, paymentUrl: data.invoice_url || null, status: data.payment_status }) };
  } catch (err) { return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) }; }
};
