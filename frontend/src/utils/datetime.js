// `<input type="datetime-local">` reads and writes wall-clock time in the
// browser's own zone, while `Date.prototype.toISOString()` returns UTC.
// Mixing the two shifts every value by the local offset — which is why these
// helpers exist and should be used for any datetime-local `value` or `min`.

// Date → "YYYY-MM-DDTHH:mm" in local time, ready for a datetime-local input.
export const toLocalInputValue = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const offsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
};

// The earliest value a scheduling input should accept: one minute from now,
// expressed in local time.
export const minScheduleValue = () =>
  toLocalInputValue(new Date(Date.now() + 60 * 1000));

// A datetime-local string is already local time, so `new Date(...)` parses it
// correctly; this just guards against empty/invalid input.
export const fromLocalInputValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
