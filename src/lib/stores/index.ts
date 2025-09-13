import { writable } from 'svelte/store';

// Cart store
export const cart = writable({
  items: [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0
});

// Current user store
export const currentUser = writable(null);

// Online status store
export const isOnline = writable(true);
window.addEventListener('online', () => isOnline.set(true));
window.addEventListener('offline', () => isOnline.set(false));