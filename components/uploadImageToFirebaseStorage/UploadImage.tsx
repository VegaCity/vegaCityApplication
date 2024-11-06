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
    const storageRef = ref(storage, `images/${file.name}`);

    try {
      // Upload the file
      await uploadBytes(storageRef, file);
      // Get the download URL after upload on firebase storage
      const imageUrl = await getDownloadURL(storageRef);
      setImageUploaded(imageUrl); //set image to display on UI
      //   return imageUrl; // Return the URL for use
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const fileChange: File | null = event.target.files?.[0] || null;
  if (fileChange) {
    const imageUrl = await uploadImage(fileChange); // Upload and get the URL
    // You can then use this URL to display the image
    console.log("Image uploaded:", imageUrl);
  }
};

export default handleImageFileChange;
