import { format } from 'date-fns';

export const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
}

export const numberWith0 = (number) => {
  return (number < 10 ? '0' + number : number)
}

export const numberWithCommas = (x) => {
  if (x) return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return '';
}

export function formatNumber(num) {
  if (num === null || num === undefined) return "";
  if (num < 1000) return num.toString();
  if (num < 1_000_000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
}
