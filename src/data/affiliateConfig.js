// Replace 'YOUR-TAG-20' with your Amazon Associates tracking ID.
// Sign up free at https://affiliate-program.amazon.com
export const AMAZON_TAG = 'YOUR-TAG-20';

export function amz(query) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;
}
