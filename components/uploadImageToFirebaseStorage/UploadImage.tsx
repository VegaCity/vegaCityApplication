import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React from "react";

interface UploadImageProps {
  event: React.ChangeEvent<HTMLInputElement>;
  setImageUploaded: React.Dispatch<React.SetStateAction<string | null>>;
}

const handleImageFileChange = async ({
  event,
  setImageUploaded,
}: UploadImageProps) => {
  const uploadImage = async (file: File) => {
    const storage = getStorage();
    // const storage = firebase.app().storage("vegacity-utility-card.appspot.com");
    // const storageRef = await storage.ref(storage, `images/${file.name}`);
    const storageRef = ref(storage, `images/${file.name}`);
    console.log("a");
    try {
      console.log("b");
      // Upload the file
      await uploadBytes(storageRef, file);
      // Get the download URL after upload on firebase storage
      const imageUrl = await getDownloadURL(storageRef);
      setImageUploaded(imageUrl); //set image to display on UI
      //   return imageUrl; // Return the URL for use
      console.log(imageUrl, "image upload");
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const fileChange: File | null = event.target.files?.[0] || null;
  if (fileChange) {
    console.log("c");
    const imageUrl = await uploadImage(fileChange); // Upload and get the URL
    // You can then use this URL to display the image
    // const downloadImageUrl = await getDownloadURL(imageUrl || null);
    // setImageUploaded(downloadImageUrl);
    console.log("Image uploaded:", imageUrl);
  }
};

export default handleImageFileChange;
