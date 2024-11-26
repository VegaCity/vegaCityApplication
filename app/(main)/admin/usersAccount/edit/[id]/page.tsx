"use client";

import BackButton from "@/components/BackButton";
import { Loader } from "@/components/loader/Loader";
import { UserServices } from "@/components/services/User/userServices";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  handleUserStatusFromBe,
  UserAccount,
} from "@/types/user/userAccount";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getDownloadURL,
  getStorage,
  ref,
  StorageReference,
  uploadBytes,
} from "firebase/storage";
import { Camera, Edit, Upload, X } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      status: "",
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
          const convertGenderToDisplay: string = handleGenderToFe(user.gender);
          const convertUserStatustoDisplay: string = handleUserStatusFromBe(
            user.status
          );
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
            status: convertUserStatustoDisplay,
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

  const handleSubmit = async (data: UserAccountFormValues) => {
    const { birthday, gender, ...rest } = data;
    // console.log(birthday, "birthdayyyyyy");
    const renderGenderToNumber: number = handleGenderToBe(gender as string);

    setIsSubmitting(true);
    try {
      const userUpdated = await UserServices.updateUserById(params.id, {
        ...data,
        imageUrl: imageUploaded,
        gender: renderGenderToNumber,
      });
      toast({
        variant: "success",
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div>
        <Loader isLoading={isLoading} />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <BackButton text="Back To Users" link="/admin/usersAccount" />
      {/* Body Container */}
      <div className="max-w-7xl px-10">
        <div className="mb-2">
          <h4 className="text-2xl font-semibold text-zinc-700 dark:text-white">
            Edit User Information
          </h4>
          <p className="text-md text-zinc-500 dark:text-zinc-400">
            Provide details about User Account.
          </p>
        </div>
        <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              {/* Div Container */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md space-y-4">
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
                                ? new Date(field.value)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            } //value property is field that display data on UI, should solve login in here
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              console.log(e.target.value, "birthdayyy");
                            }} //onChange property that change and set on field.birthday, should not change it's data change receive
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
                            onValueChange={(value) => {
                              field.onChange(value);
                              console.log(value, "gender");
                            }}
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
                </Card>

                <Card className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md space-y-4">
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                          Status
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              console.log(value, "status");
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Ban">Ban</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                        {imageUploaded ? (
                          <div className="relative">
                            <Image
                              className="relative"
                              src={imageUploaded || field.value || ""}
                              alt={field.value || "image"}
                              width={350}
                              height={250}
                              // onLoadingComplete={() => setIsLoadingImageUpload(false)} // Set loading to false when loading completes
                            />
                            {/* Delete image */}
                            <div className="absolute top-1 left-1">
                              <X
                                size={30}
                                className="text-red-600 bg-red-400 p-2 cursor-pointer"
                                onClick={() => {
                                  setImageUploaded("");
                                  field.onChange(null);
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-2/3  p-6 border-2 border-dashed border-slate-300 text-slate-300">
                            <Camera size={30} />
                            Image unavailable
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              </div>
              <div className="flex justify-end items-end w-full mt-4">
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Updating..."
                  ) : (
                    <>
                      <Upload /> <p>Update</p>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default UserEditPage;
