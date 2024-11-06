"use client";

import BackButton from "@/components/BackButton";
import { Loader } from "@/components/loader/Loader";
import { UserServices } from "@/components/services/User/userServices";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import handleImageFileChange from "@/components/uploadImageToFirebaseStorage/UploadImage";
import { handlePlusOneDayFromBe } from "@/lib/utils/convertDatePlusOne";
import { userAccountFormSchema, UserAccountFormValues } from "@/lib/validation";
import { useFirebase } from "@/providers/FirebaseProvider";
import {
  genders,
  handleGenderToBe,
  handleGenderToFe,
  UserAccount,
} from "@/types/userAccount";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getDownloadURL,
  getStorage,
  ref,
  StorageReference,
  uploadBytes,
} from "firebase/storage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface UserEditPageProps {
  params: {
    id: string;
  };
}

interface UserAccountPost {
  userData: {
    user: UserAccount;
    imageUrl: string;
  };
}

const UserEditPage = ({ params }: UserEditPageProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserAccountPost | null>(null);
  const router = useRouter();
  const [imageUploaded, setImageUploaded] = useState<string | null>("");
  const [isLoadingImageUpload, setIsLoadingImageUpload] =
    useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const form = useForm<UserAccountFormValues>({
    resolver: zodResolver(userAccountFormSchema),
    defaultValues: {
      fullName: "",
      address: "",
      description: "",
      phoneNumber: "",
      birthday: "",
      gender: "",
      cccdPassport: "",
      imageUrl: null,
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await UserServices.getUserById(params.id);
        console.log(response.data.data, "edit user data");
        const user = response.data.data;
        console.log(user?.birthday, "user birthday fetchhhh");
        console.log(user, "user fetchhhhhhhh");
        if (user) {
          const convertGenderToDisplay = handleGenderToFe(user.gender);
          setUserData(user);
          form.reset({
            fullName: user.fullName,
            address: user.address,
            description: user.description,
            phoneNumber: user.phoneNumber,
            birthday: handlePlusOneDayFromBe(user?.birthday) || null,
            gender: convertGenderToDisplay,
            cccdPassport: user.cccdPassport,
            imageUrl: user.imageUrl,
          });
        } else {
          throw new Error("User data is missing in the response");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [params.id, toast]);

  // Loader function
  // const myLoader = ({ src }: File) => {
  //   return src; // Return the src directly, you can modify this if needed
  // };

  const uploadImage = async (file: File) => {
    const storage = getStorage();
    const storageRef = ref(storage, `images/${file.name}`);

    try {
      // Upload the file
      await uploadBytes(storageRef, file);
      // Get the download URL after upload on firebase storage
      const imageUrl = await getDownloadURL(storageRef);
      setImageUploaded(imageUrl); //set image to display on UI
      return imageUrl; // Return the URL for use
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const imageUrl = await uploadImage(file); // Upload and get the URL
      // You can then use this URL to display the image
      console.log("Image uploaded:", imageUrl);
      setIsLoadingImageUpload(true);
    }
    setIsLoadingImageUpload(false);

    // setIsLoadingImageUpload(false);

    // setSelectedFile(file);
    console.log(file, "handleFileChangeee");
  };

  // const handleUploadImage = async (imageUrl: string | null) => {
  //   if (!selectedFile || !storage) {
  //     toast({ title: "No file selected or Firebase not initialized" });
  //     return;
  //   }
  //   //upload image and store to firebase store
  //   const imagesRef = ref(storage, `images/${selectedFile.name}`);
  //   await uploadBytes(imagesRef, selectedFile);
  //   const downloadUrl = await getDownloadURL(imagesRef);
  //   setImageUploaded(downloadUrl);
  //   console.log(downloadUrl, "imageUploaded");
  // };

  const handleSubmit = async (data: UserAccountFormValues) => {
    const { birthday, gender, ...rest } = data;
    // console.log(birthday, "birthdayyyyyy");
    const renderGenderToNumber: number = handleGenderToBe(gender as string);

    try {
      const userUpdated = await UserServices.updateUserById(params.id, {
        ...data,
        imageUrl: imageUploaded,
        gender: renderGenderToNumber,
      });
      toast({
        title: "User has been updated successfully",
        description: `User ${data.fullName} was updated.`,
      });
      if (userUpdated) {
        router.back();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <BackButton text="Back To Users" link="/admin/usersAccount" />
      <h3 className="text-2xl mb-4">Edit User</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Full Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Address
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Description"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    // {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Phone Number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Birthday
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split("T")[0]
                        : ""
                    } //value property is field that display data on UI, should solve login in here
                    onChange={(e) => field.onChange(e.target.value)} //onChange property that change and set on field.birthday, should not change it's data change receive
                    // {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Gender
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    {...field}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender.id} value={gender.name}>
                          {gender.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cccdPassport"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  cccdPassport
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter cccdPassport"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Image URL
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Image URL"
                    value={field.value || ""} // Use an empty string if field.value is null
                    onChange={(e) => field.onChange(e.target.value || null)} // Convert empty string back to null if needed
                  />
                </FormControl>
                <Image
                  src={field.value || ""}
                  alt={field.value || "image"}
                  width={300}
                  height={250}
                />
                <FormMessage />
              </FormItem>
            )}
          /> */}

          {/* sửa ở đây Form React.children.only */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Image URL
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    className=" w-30 bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Image URL"
                    onChange={(event) =>
                      handleImageFileChange({
                        event: event,
                        setImageUploaded: setImageUploaded,
                      })
                    } // Convert empty string back to null if needed
                  />
                </FormControl>
                <Image
                  src={imageUploaded || field.value || ""}
                  alt={field.value || "image"}
                  width={300}
                  height={250}
                  // onLoadingComplete={() => setIsLoadingImageUpload(false)} // Set loading to false when loading completes
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Update User
          </Button>
        </form>
      </Form>
    </>
  );
};

export default UserEditPage;
