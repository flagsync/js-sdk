import { MESSAGE } from '~logger/messages';

export function formatISODateToCustom(date: Date) {
  const pad = (num: number) => num.toString().padStart(2, '0');

  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = date.getFullYear();
  let hours: string | number = date.getHours();
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? pad(hours) : 12;

  return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
}

export function formatMsg(
  prefix: string,
  message: (typeof MESSAGE)[keyof typeof MESSAGE],
) {
  return `${prefix}: ${message}`;
}
