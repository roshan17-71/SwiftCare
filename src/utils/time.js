/**
 * Convert HH:MM:SS or HH:MM string to a user-friendly 12-hour format (e.g., "10:00 AM").
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hoursStr, minsStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minsStr || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Format minutes since midnight into HH:MM (24-hour) string.
 */
function minutesToHHMM(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Generate back-to-back slot objects between startTime and endTime.
 * Only generates while current_start + duration <= end_time to avoid off-by-one slots.
 *
 * @param {string} startTime - "HH:MM"
 * @param {string} endTime - "HH:MM"
 * @param {number} durationMinutes - e.g. 15, 20, 30
 * @returns {Array<{start_time: string, end_time: string}>}
 */
export function generateTimeSlots(startTime, endTime, durationMinutes) {
  if (!startTime || !endTime || !durationMinutes || durationMinutes <= 0) {
    return [];
  }

  const [sH, sM] = startTime.split(':').map((v) => parseInt(v, 10));
  const [eH, eM] = endTime.split(':').map((v) => parseInt(v, 10));

  const startMins = sH * 60 + sM;
  const endMins = eH * 60 + eM;

  if (endMins <= startMins) {
    return [];
  }

  const slots = [];
  for (let curr = startMins; curr + durationMinutes <= endMins; curr += durationMinutes) {
    slots.push({
      start_time: minutesToHHMM(curr),
      end_time: minutesToHHMM(curr + durationMinutes),
    });
  }

  return slots;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in the local timezone.
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

