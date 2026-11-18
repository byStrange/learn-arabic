/** A daily reminder as an iCalendar file. time is 'HH:MM' (floating local time). */
export function buildReminderIcs(time: string, now: Date = new Date()): string {
  const [hh, mm] = /^\d{2}:\d{2}$/.test(time) ? time.split(':') : ['07', '00'];
  const p = (n: number) => String(n).padStart(2, '0');
  const day = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}`;
  const stamp = `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}T${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}Z`;
  const endMin = Math.min(59, Number(mm) + 5);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Qalam//Daily reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:qalam-daily-${hh}${mm}@qalam.local`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${day}T${hh}${mm}00`,
    `DTEND:${day}T${hh}${p(endMin)}00`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:Qalam: one ayah (5 min)',
    'DESCRIPTION:Open Qalam and read one ayah. Three answers keep your streak.',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Qalam: one ayah (5 min)',
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}
