exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method not allowed' };
  const API_KEY = process.env.NOWPAYMENTS_API_KEY;
  if (!API_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'No API key' }) };
  const id = event.queryStringParameters?.id;
  if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Payment ID required' }) };
  try {
    const res = await fetch(`https://api.nowpayments.io/v1/payment/${id}`, { headers: { 'x-api-key': API_KEY } });
    const data = await res.json();
    if (!res.ok) return { statusCode: res.status, body: JSON.stringify({ error: data.message }) };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentId: data.payment_id, status: data.payment_status, payAmount: data.pay_amount, payCurrency: data.pay_currency, isComplete: data.payment_status === 'finished', isPending: ['waiting','confirming','confirmed','sending'].includes(data.payment_status), isFailed: ['failed','expired'].includes(data.payment_status) }) };
  } catch (err) { return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) }; }
};
