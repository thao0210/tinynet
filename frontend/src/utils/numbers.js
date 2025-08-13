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