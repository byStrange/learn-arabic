import { describe, expect, it } from 'vitest';
import { buildReminderIcs } from '../src/lib/ics';

describe('ics', () => {
  it('is a valid daily VCALENDAR with an alarm', () => {
    const ics = buildReminderIcs('07:30', new Date(2025, 2, 5, 12, 0));
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('RRULE:FREQ=DAILY');
    expect(ics).toContain('SUMMARY:Qalam: one ayah (5 min)');
    expect(ics).toContain('DTSTART:20250305T073000');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics.match(/^BEGIN:/gm)?.length).toBe(ics.match(/^END:/gm)?.length);
  });
  it('falls back to a default time for bad input', () => {
    expect(buildReminderIcs('oops', new Date(2025, 2, 5))).toContain('T070000');
  });
});
