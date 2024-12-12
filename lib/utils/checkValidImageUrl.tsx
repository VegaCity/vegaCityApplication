export const validImageUrl = (imageUrl: string | null): string => {
  return imageUrl && imageUrl.startsWith("http")
    ? imageUrl
    : "https://firebasestorage.googleapis.com/v0/b/vegacity-utility-card.appspot.com/o/defaultImage.jpg?alt=media&token=fa241d02-9c86-4886-8980-41955b6ea9dd";
};
