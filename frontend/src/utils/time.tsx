export function dateToString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function stringToDate(dateStr: string, date?: Date) {
  const [year, month, day] = dateStr.split("-");
  const updatedDatetime = date ? new Date(date) : new Date();
  updatedDatetime.setFullYear(Number(year));
  updatedDatetime.setMonth(Number(month) - 1);
  updatedDatetime.setDate(Number(day));
  return updatedDatetime;
}
export function timeToString(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
