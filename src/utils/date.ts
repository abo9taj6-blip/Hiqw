export function calculateExpiryTimestamp(product: { isTemporary?: boolean, createdAt?: any, expiryDate?: any, durationDays?: any }): number {
  if (!product.isTemporary) return Infinity;
  
  let expiry = product.expiryDate;
  if (typeof expiry === 'string' && !isNaN(Number(expiry))) expiry = Number(expiry);
  else if (expiry && typeof expiry === 'string') expiry = new Date(expiry).getTime();
  else if (expiry && typeof expiry === 'object') {
    if (expiry.seconds) expiry = expiry.seconds * 1000;
    else if (expiry.toMillis) expiry = expiry.toMillis();
  }

  if (typeof expiry === 'number' && !isNaN(expiry) && expiry > 0) return expiry;

  // Fallback to createdAt + duration
  let createdTime = Date.now();
  if (product.createdAt) {
      if (typeof product.createdAt === 'number') createdTime = product.createdAt;
      else if (typeof product.createdAt === 'string' && !isNaN(Number(product.createdAt))) createdTime = Number(product.createdAt);
      else if (typeof product.createdAt === 'string') createdTime = new Date(product.createdAt).getTime();
      else if (product.createdAt.seconds) createdTime = product.createdAt.seconds * 1000;
      else if (product.createdAt.toMillis) createdTime = product.createdAt.toMillis();
  }
  
  if (isNaN(createdTime) || createdTime <= 0) createdTime = Date.now();

  const durDays = Number(product.durationDays) || 3;
  return createdTime + durDays * 24 * 60 * 60 * 1000;
}
