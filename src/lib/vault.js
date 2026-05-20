import { generateSalt, deriveKey, encryptJSON, decryptJSON, toBase64, fromBase64 } from './crypto.js';

const VAULT_KEY = 'hashimotos_vault_v1';
const LEGACY_KEY = 'hashimotos_labs_v1';

export function vaultExists() {
  return !!localStorage.getItem(VAULT_KEY);
}

export function legacyDataExists() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Object.keys(parsed).length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function clearLegacyData() {
  localStorage.removeItem(LEGACY_KEY);
}

export async function createVault(passphrase) {
  const salt = generateSalt();
  const key = await deriveKey(passphrase, salt);
  const data = { sessions: [] };
  const { iv, data: ciphertext } = await encryptJSON(key, data);
  localStorage.setItem(VAULT_KEY, JSON.stringify({ salt: toBase64(salt), iv, data: ciphertext }));
  return { key, data };
}

export async function openVault(passphrase) {
  const raw = localStorage.getItem(VAULT_KEY);
  if (!raw) throw new Error('No vault found');
  const stored = JSON.parse(raw);
  const salt = fromBase64(stored.salt);
  const key = await deriveKey(passphrase, salt);
  // decryptJSON throws DOMException if the passphrase is wrong
  const data = await decryptJSON(key, stored);
  return { key, data };
}

export async function saveToVault(key, data) {
  const raw = localStorage.getItem(VAULT_KEY);
  const stored = JSON.parse(raw);
  const { iv, data: ciphertext } = await encryptJSON(key, data);
  localStorage.setItem(VAULT_KEY, JSON.stringify({ salt: stored.salt, iv, data: ciphertext }));
}

export function deleteVault() {
  localStorage.removeItem(VAULT_KEY);
  localStorage.removeItem(LEGACY_KEY);
}
