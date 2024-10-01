import crypto from 'crypto';

export function verifyMomoSignature(rawBody: string, signature: string): boolean {
  const secretKey = process.env.MOMO_SECRET_KEY as string;
  const hmac = crypto.createHmac('sha256', secretKey);
  const computedSignature = hmac.update(rawBody).digest('hex');
  return computedSignature === signature;
}

export function verifyVNPaySignature(params: Record<string, string>): boolean {
  const secretKey = process.env.VNPAY_HASH_SECRET as string;
  const signData = Object.keys(params)
    .filter(key => key.startsWith('vnp_') && key !== 'vnp_SecureHash')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const computedSignature = hmac.update(signData).digest('hex');
  return computedSignature === params.vnp_SecureHash;
}