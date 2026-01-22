export function productImageBaseUrl(imageId: number) {
  const digits = String(imageId).split('');
  return `/media/img/p/${digits.join('/')}`;
}

export function productImageUrls(imageId: number) {
  const base = productImageBaseUrl(imageId);

  return {
    original: `${base}/original.jpg`,
    cart_default: `${base}/cart_default.jpg`,
    small_default: `${base}/small_default.jpg`,
    medium_default: `${base}/medium_default.jpg`,
    home_default: `${base}/home_default.jpg`,
    large_default: `${base}/large_default.jpg`,
  };
}