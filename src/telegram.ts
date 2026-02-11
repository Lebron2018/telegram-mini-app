declare global {
  interface Window {
    Telegram?: any;
  }
}

export const tg = window.Telegram?.WebApp;

export function isTelegram() {
  return typeof window !== "undefined" && !!tg;
}

export function getUser() {
  if (!tg?.initDataUnsafe?.user) return null;
  return tg.initDataUnsafe.user;
}

export function expand() {
  tg?.expand();
}
