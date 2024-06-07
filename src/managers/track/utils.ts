export function canListenToDocument() {
  return typeof document !== 'undefined' && document.addEventListener;
}

export function canListenToWindow() {
  return typeof window !== 'undefined' && window.addEventListener;
}
