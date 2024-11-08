interface SelectType {
  type: "date" | "time";
  dateTime: string;
}

export const splitDateTime = ({ type, dateTime }: SelectType) => {
  const splitDateTime = dateTime.split("T");
  if (type === "date") {
    // return dateTime.split("T", 1);
    return splitDateTime[0];
  } else if (type === "time") {
    return splitDateTime[1];
  } else {
    return;
  }
};
