export const validImageUrl = (imageUrl: string | null): string => {
  return imageUrl && imageUrl.startsWith("http")
    ? imageUrl
    : "https://firebasestorage.googleapis.com/v0/b/vegacity-utility-card.appspot.com/o/userDefault.png?alt=media&token=8b6f51bf-140e-4d8f-9b5b-551bf6e20fc9";
};
