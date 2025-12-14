import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'dd/MM', { locale: ptBR });
}

export function formatDateFull(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "dd 'de' MMMM", { locale: ptBR });
}

export function formatDayOfWeek(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'EEE', { locale: ptBR });
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
