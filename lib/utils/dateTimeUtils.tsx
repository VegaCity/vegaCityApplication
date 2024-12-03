interface SelectType {
  type: "date" | "time";
  dateTime: string;
}

export const formatDateTime = ({ type, dateTime }: SelectType) => {
  const splitDateTime = dateTime?.split("T");
  const formatVNDate = new Date(dateTime).toLocaleDateString("vi-VN");
  const formatVNTime = new Date(dateTime).toLocaleTimeString("vi-VN");

  // console.log(formatVNTime, "timeee");
  if (type === "date") {
    return formatVNDate;
  } else if (type === "time") {
    return formatVNTime;
  } else {
    return;
  }
};
