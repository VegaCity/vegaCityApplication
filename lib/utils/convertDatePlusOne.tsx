export const handlePlusOneDayFromBe = (date: string): string => {
  const dateUI = new Date(date); // Parse the input date
  dateUI.setDate(dateUI.getDate() + 1); // Add one day

  // Manually format the date in "yyyy-MM-ddTHH:mm:ss" format, respecting local time
  const year = dateUI.getFullYear();
  const month = String(dateUI.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed, add the zero at start before get month, because get month is 1 2 3 we must add zero at the first, 01 02 03
  const day = String(dateUI.getDate()).padStart(2, "0");
  const hours = String(dateUI.getHours()).padStart(2, "0");
  const minutes = String(dateUI.getMinutes()).padStart(2, "0");
  const seconds = String(dateUI.getSeconds()).padStart(2, "0");

  //   Return the date in "yyyy-MM-ddTHH:mm:ss" format
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};
