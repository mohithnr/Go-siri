function startOfDay(date) {
  const d = new Date(date || Date.now());
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date || Date.now());
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfMonth(date) {
  const d = new Date(date || Date.now());
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

module.exports = { startOfDay, endOfDay, startOfMonth, addDays };


