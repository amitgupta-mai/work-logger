// Utility functions for logger

export function getManualDuration({
  startHour,
  startMinute,
  endHour,
  endMinute,
  startAmPm,
  endAmPm,
}: {
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  startAmPm: string;
  endAmPm: string;
}): number {
  if (
    !startHour ||
    !startMinute ||
    !endHour ||
    !endMinute ||
    !startAmPm ||
    !endAmPm
  )
    return 0;
  let sh = parseInt(startHour, 10);
  let eh = parseInt(endHour, 10);
  const sm = parseInt(startMinute, 10);
  const em = parseInt(endMinute, 10);
  if (isNaN(sh) || isNaN(eh) || isNaN(sm) || isNaN(em)) return 0;
  if (startAmPm === 'PM' && sh !== 12) sh += 12;
  if (startAmPm === 'AM' && sh === 12) sh = 0;
  if (endAmPm === 'PM' && eh !== 12) eh += 12;
  if (endAmPm === 'AM' && eh === 12) eh = 0;
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  return end > start ? end - start : 0;
}

export function formatTime(h: string, m: string, ampm: string): string {
  if (!h || !m || !ampm) return '';
  return `${h}:${m} ${ampm}`;
}
