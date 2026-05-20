const crypto = require('crypto');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
  if (IPN_SECRET) {
    const sig = event.headers['x-nowpayments-sig'];
    if (!sig) return { statusCode: 401, body: 'Missing signature' };
    const payload = JSON.parse(event.body);
    const sorted = JSON.stringify(Object.keys(payload).sort().reduce((s,k)=>{s[k]=payload[k];return s},{}));
    const hmac = crypto.createHmac('sha512',IPN_SECRET).update(sorted).digest('hex');
    if (hmac !== sig) return { statusCode: 401, body: 'Invalid signature' };
  }
  const payment = JSON.parse(event.body);
  console.log(`IPN: ${payment.payment_id} - ${payment.payment_status}`);
  return { statusCode: 200, body: 'OK' };
};
