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

export function formatTime(h: string, m: string, ampm: string) {
  return h && m ? `${h}:${m} ${ampm}` : '--:--';
}

export function getMinutes(hour: string, minute: string, ampm: string) {
  let h = parseInt(hour, 10);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + parseInt(minute, 10);
}

export function getEndTimeError({
  durationMode,
  startHour,
  startMinute,
  startAmPm,
  endHour,
  endMinute,
  endAmPm,
}: {
  durationMode: 'dropdown' | 'manual';
  startHour: string;
  startMinute: string;
  startAmPm: string;
  endHour: string;
  endMinute: string;
  endAmPm: string;
}): string {
  const allFilled =
    !!startHour &&
    !!startMinute &&
    !!startAmPm &&
    !!endHour &&
    !!endMinute &&
    !!endAmPm;
  if (
    durationMode === 'manual' &&
    allFilled &&
    getMinutes(endHour, endMinute, endAmPm) <=
      getMinutes(startHour, startMinute, startAmPm)
  ) {
    return 'End time must be after start time';
  }
  return '';
}

export function getCalculatedDuration({
  durationMode,
  startHour,
  startMinute,
  startAmPm,
  endHour,
  endMinute,
  endAmPm,
  selectedDuration,
}: {
  durationMode: 'dropdown' | 'manual';
  startHour: string;
  startMinute: string;
  startAmPm: string;
  endHour: string;
  endMinute: string;
  endAmPm: string;
  selectedDuration?: { value: number } | null;
}): string | number {
  if (durationMode === 'manual') {
    if (!startHour || !startMinute || !endHour || !endMinute) return '';
    const start = getMinutes(startHour, startMinute, startAmPm);
    const end = getMinutes(endHour, endMinute, endAmPm);
    return end > start ? end - start : '';
  }
  return selectedDuration?.value || '';
}
