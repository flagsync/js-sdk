export function isLocalStorageAvailable(): boolean {
  const value = '0xDEADBEEF';
  try {
    localStorage.setItem(value, value);
    localStorage.removeItem(value);
    return true;
  } catch (e) {
    return false;
  }
}
