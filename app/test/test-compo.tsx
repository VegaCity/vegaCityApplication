"use client";

// import React from "react";
// import { getOrders } from "@/lib/actions/order";
// import { useGetOrders } from "@/lib/react-query/queries";
// import { SearchParams } from "@/types/table";


// import BackButton from "@/components/BackButton";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Form,
//   FormControl,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormField,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";
// import { useEffect, useState } from "react";
// import { ETagServices } from "@/components/services/etagService";
// import { ETag } from "@/types/etag";
// import Image from "next/image";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import paymentService from "@/components/services/paymentService";
// import { formSchema, FormValues, EtagDetailPageProps } from "@/lib/validation";
// import {
//   AlertDialog,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogCancel,
// } from "@/components/ui/alert-dialog";
// import { confirmOrder } from "@/components/services/orderuserServices";
// import { AlertDialogAction } from "@radix-ui/react-alert-dialog";
// import { ConfirmOrderData } from "@/types/orderUser";

// const EtagDetailPage = ({ params }: EtagDetailPageProps) => {
//   const { toast } = useToast();
//   const [etag, setEtag] = useState<ETag | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isConfirming, setIsConfirming] = useState(false);
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [isProcessingPopupOpen, setIsProcessingPopupOpen] = useState(false);
//   const [pendingInvoiceId, setPendingInvoiceId] = useState<string | null>(null);

//   const handleUpdateInformation = async (
//     data: { phoneNumber: string; gender: string; birthday: string },
//   ) => {
//     try {
//       console.log("Data Update Information", data.phoneNumber);
//       console.log("Data Update Information", data.gender);
//       console.log("Data Update Information", data.birthday);
//       if (!data.phoneNumber ||
//         !data.gender ||
//         !data.birthday
//       ) {
//         toast({
//           title: "Error",
//           description:
//             "Please provide all required fields and a valid Information.",
//           variant: "destructive",
//         });
//         return;
//       }
//       const response = await ETagServices.editInfoEtag(
//         "cd741e68-dcd9-470a-8611-0404e2e679c6",
//         {
//           phoneNumber: data.phoneNumber,
//           gender: data.gender,
//           birthday: data.birthday,
//         }

//       );
//       if (response.status === 200) {
//         const responseData = response.data;
//         if (responseData && responseData.data) {
//           const { etagId } = responseData.data;
//           localStorage.setItem("etagId", etagId);
//         } else {
//           toast({
//             title: "Error",
//             description:
//               "Invalid response structure from information API. Please try again later.",
//             variant: "destructive",
//           });
//         }
//       } else {
//         toast({
//           title: "Error",
//           description: `Failed to update information. Status code: ${response.status}`,
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       console.error("Error Update Information Fail", error);
//       toast({
//         title: "Error",
//         description: "Failed to Update Information. Please try again later.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//       setIsPopupOpen(false);
//     }
//   };



//   const handleConfirmPayment = async () => {
//     if (!pendingInvoiceId) {
//       toast({
//         title: "Lỗi",
//         description: "Không có hóa đơn chờ xác nhận",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsConfirming(true);
//     try {
//       const confirmData = {
//         invoiceId: pendingInvoiceId,
//       };

//       console.log("Đang xác nhận đơn hàng với dữ liệu:", confirmData);
//       const result = await confirmOrder(confirmData);
//       console.log("Kết quả xác nhận:", result);

//       if (result.statusCode === 200 || result.statusCode === "200") {
//         toast({
//           title: "Thanh toán thành công",
//           description: "Đơn hàng đã được xác nhận",
//         });
//         setIsProcessingPopupOpen(false);
//         setPendingInvoiceId(null);
//         setTimeout(() => {
//           window.location.reload();
//         }, 3000);
//       } else {
//         throw new Error(
//           result.messageResponse || "Không thể xác nhận đơn hàng"
//         );
//       }
//     } catch (error) {
//       console.error("Lỗi khi xác nhận đơn hàng:", error);
//       let errorMessage = "Có lỗi xảy ra khi xác nhận đơn hàng";
//       if (error instanceof Error) {
//         errorMessage = error.message;
//       } else if (typeof error === "object" && error !== null) {
//         errorMessage = JSON.stringify(error);
//       }
//       toast({
//         title: "Lỗi xác nhận",
//         description: errorMessage,
//         variant: "destructive",
//       });
//     } finally {
//       setIsConfirming(false);
//     }
//   };
//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       fullName: "",
//       etagCode: "",
//       phoneNumber: "",
//       cccd: "",
//       birthday: "",
//       gender: "0",
//       startDate: "",
//       endDate: "",
//       status: 0,
//       imageUrl: "",
//       etagType: {
//         name: "",
//         bonusRate: 0,
//         amount: 0,
//       },
//       marketZone: {
//         name: "",
//         shortName: "",
//       },
//       wallet: {
//         balance: 0,
//         balanceHistory: 0,
//       },
//     },
//   });
//   const formCharge = useForm({
//     defaultValues: {
//       etagCode: form.getValues("etagCode"),
//       chargeAmount: 0,
//       cccd: form.getValues("cccd"),
//       paymentType: "Cash",
//       startDate: form.getValues("startDate"),
//       endDate: form.getValues("endDate"),

//     },
//   });
//   const formUpdate = useForm({
//     defaultValues: {
//       // etagCode: form.getValues("etagCode"),
//       // chargeAmount: 0,
//       // cccd: form.getValues("cccd"),
//       // paymentType: "Cash",
//       // startDate: form.getValues("startDate"),
//       // endDate: form.getValues("endDate"),
//       phoneNumber: form.getValues("phoneNumber"),
//       birthday: form.getValues("birthday"),
//       gender: form.getValues("gender"),
//     },
//   });
//   const formatDateForInput = (dateString: string | null) => {
//     if (!dateString) return "";
//     return new Date(dateString).toISOString().split("T")[0];
//   };
//   const formatDateTimeForInput = (dateString: string | null) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     return date.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:mm"
//   };

//   const formatDateTimeForDisplay = (dateString: string | null) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     return date.toLocaleString(); // Format: "M/D/YYYY, h:mm:ss AM/PM"
//   };

//   useEffect(() => {
//     const fetchEtag = async () => {
//       setIsLoading(true);
//       try {
//         const response = await ETagServices.getETagById("cd741e68-dcd9-470a-8611-0404e2e679c6");
//         const etagData = response.data.data.etag;
//         setEtag(etagData);
//         form.reset({
//           fullName: etagData.fullName.trim(),
//           etagCode: etagData.etagCode.trim(),
//           phoneNumber: etagData.phoneNumber.trim(),
//           cccd: etagData.cccd.trim(),
//           birthday: formatDateForInput(etagData.birthday),
//           startDate: formatDateTimeForInput(etagData.startDate),
//           endDate: formatDateTimeForInput(etagData.endDate),
//           gender: etagData.gender.toString(),
//           status: etagData.status,
//           imageUrl: etagData.imageUrl,
//           etagType: {
//             name: etagData.etagType?.name || "N/A",
//             bonusRate: etagData.etagType?.bonusRate || 0,
//             amount: etagData.etagType?.amount || 0,
//           },
//           wallet: {
//             balance: etagData.wallet?.balance || 0,
//             balanceHistory: etagData.wallet?.balanceHistory || 0,
//           },
//         });
//         formCharge.reset({
//           etagCode: etagData.etagCode,
//           chargeAmount: 0,
//           cccd: etagData.cccd.trim(),
//           paymentType: "Cash",
//         });
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "An unknown error occurred"
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchEtag();
//   }, ["cd741e68-dcd9-470a-8611-0404e2e679c6", form]);

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!etag) return <div>Loading ...</div>;

//   // const getStatusString = (status: number) => {
//   //   switch (status) {
//   //     case 0:
//   //       return "Inactive";
//   //     case 1:
//   //       return "Active";
//   //     default:
//   //       return "Block";
//   //   }
//   // };

//   const getGenderString = (gender: number) => {
//     switch (gender) {
//       case 0:
//         return "Male";
//       case 1:
//         return "Female";
//       case 2:
//         return "Other";
//       default:
//         return "Unknown";
//     }
//   };
//   // const handleActivateEtag = async () => {
//   //   if (!etag) return;

//   //   if (isEditing) {
//   //     setIsConfirming(true);
//   //     setIsEditing(false);
//   //   } else {
//   //     setIsEditing(true);
//   //   }
//   // };

//   // const handleConfirmActivation = async () => {
//   //   if (!etag) return;

//   //   setIsLoading(true);
//   //   try {
//   //     const formData = form.getValues();
//   //     const activateData = {
//   //       cccd: formData.cccd,
//   //       name: formData.fullName,
//   //       phone: formData.phoneNumber,
//   //       gender: formData.gender,
//   //       birthday: formData.birthday || new Date().toISOString(),
//   //       startDate: formData.startDate || new Date().toISOString(),
//   //       endDate:
//   //         formData.endDate ||
//   //         new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
//   //     };

//   //     await ETagServices.activateEtag(etag.id, activateData);
//   //     toast({
//   //       title: "ETag Activated",
//   //       description: "The ETag has been successfully activated.",
//   //     });
//   //     window.location.reload();
//   //     // Optionally refresh ETag data here
//   //   } catch (err) {
//   //     toast({
//   //       title: "Activation Failed",
//   //       description:
//   //         err instanceof Error ? err.message : "An unknown error occurred",
//   //       variant: "destructive",
//   //     });
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   // const handleCancelActivation = () => {
//   //   setIsEditing(false);
//   //   setIsConfirming(false);
//   //   form.reset();
//   // };

//   const validImageUrl =
//     etag.imageUrl && etag.imageUrl.startsWith("http")
//       ? etag.imageUrl
//       : "/default-image.png";
//   return (
//     <>
//       <BackButton text="Back To Etag List" link="/user/etags" />
//       <h3 className="text-2xl mb-4">Etag Detail</h3>

//       <Form {...form}>
//         <form onSubmit={formUpdate.handleSubmit(handleUpdateInformation)} className="space-y-4">
//           <div className="relative w-full h-48">
//             <Image
//               src={validImageUrl}
//               alt={etag.fullName || "Image"}
//               layout="fill"
//               objectFit="cover"
//               className="rounded-lg"
//             />
//           </div>

//           {/* Customer Information */}
//           <h4 className="text-xl font-semibold mt-6 mb-4">
//             Customer Information
//           </h4>
//           <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
//             <FormItem className="md:w-1/2">
//               <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                 Full Name
//               </FormLabel>
//               <FormControl>
//                 <Input
//                   className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                   {...form.register("fullName")}
//                   readOnly={!isEditing}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>

//             <FormItem className="md:w-1/2">
//               <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                 Etag Code
//               </FormLabel>
//               <FormControl>
//                 <Input
//                   className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                   {...form.register("etagCode")}
//                   readOnly
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           </div>

//           <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
//             <FormItem className="md:w-1/2">
//               <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                 Phone Number
//               </FormLabel>
//               <FormControl>
//                 <Input
//                   className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                   {...form.register("phoneNumber")}
//                 // readOnly={!isEditing}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>

//             <FormItem className="md:w-1/2">
//               <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                 CCCD
//               </FormLabel>
//               <FormControl>
//                 <Input
//                   className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                   {...form.register("cccd")}
//                   readOnly={!isEditing}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           </div>

//           <div className="md:flex md:space-x-4 space-y-4 md:space-y-0 mb-11">
//             <FormItem className="md:w-1/2">
//               <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                 Birthday
//               </FormLabel>
//               <FormControl>
//                 <Input
//                   type="date"
//                   className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                   {...form.register("birthday")}
//                 // readOnly={!isEditing}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>

//             <FormField
//               control={form.control}
//               name="gender"
//               render={({ field }) => (
//                 <FormItem className="md:w-1/2">
//                   <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                     Gender
//                   </FormLabel>
//                   <Select
//                     onValueChange={(value) => field.onChange(value)}
//                     defaultValue={field.value}
//                   // disabled={!isEditing}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select gender" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="0">Female</SelectItem>
//                       <SelectItem value="1">Male</SelectItem>
//                       <SelectItem value="2">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>

//           {/* ETag Information */}
//           <div className="mt-10">
//             <h4 className="text-xl font-semibold mt-24 mb-4">
//               ETag Information
//             </h4>
//             <div className="md:flex md:space-x-4 space-y-4 md:space-y-0 mt-6">
//               <FormItem className="md:w-1/2">
//                 <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                   Start Date and Time
//                 </FormLabel>
//                 <FormControl>
//                   <Input
//                     type="datetime-local"
//                     className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                     {...form.register("startDate")}
//                     readOnly={!isEditing}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>


//               <FormItem className="md:w-1/2">
//                 <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                   End Date and Time
//                 </FormLabel>
//                 <FormControl>
//                   <Input
//                     type="datetime-local"
//                     className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                     {...form.register("endDate")}
//                     readOnly={!isEditing}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             </div>
//             {/* <div className="mt-4"> 
//   <p>Start Date and Time: {formatDateTimeForDisplay(form.getValues('startDate'))}</p>
//   <p>End Date and Time: {formatDateTimeForDisplay(form.getValues('endDate'))}</p>
// </div> */}

//             {/* <FormItem className="md:w-1/3">
//               <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                 Status
//               </FormLabel>
//               <FormControl>
//                 <Input
//                   className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                   value={getStatusString(etag.status)}
//                   readOnly
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem> */}
//           </div>

//           {/* ETag Type Information */}
//           <h4 className="text-xl font-semibold mt-6 mb-4">
//             ETag Type Information
//           </h4>
//           <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
//             <FormItem className="md:w-1/2">
//               <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                 ETag Type Name
//               </FormLabel>
//               <FormControl>
//                 <Input
//                   className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                   {...form.register("etagType.name")}
//                   readOnly
//                 />
//               </FormControl>
//             </FormItem>

//             <FormItem className="md:w-1/2">
//               <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                 Amount
//               </FormLabel>
//               <FormControl>
//                 <Input
//                   className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                   {...form.register("etagType.amount")}
//                   readOnly
//                 />
//               </FormControl>
//             </FormItem>
//           </div>
//           {/* Wallet Information */}
//           <h4 className="text-xl font-semibold mt-16 mb-4">
//             Wallet Information
//           </h4>
//           <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
//             <FormItem className="md:w-1/2">
//               <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                 Balance
//               </FormLabel>
//               <FormControl>
//                 <Input
//                   className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                   {...form.register("wallet.balance")}
//                   readOnly
//                 />
//               </FormControl>
//             </FormItem>
//             {/* <FormItem className="md:w-1/2">
//               <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
//                 Balance History
//               </FormLabel>
//               <FormControl>
//                 <Input
//                   className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
//                   {...form.register("wallet.balanceHistory")}
//                   readOnly
//                 />
//               </FormControl>
//             </FormItem> */}
//           </div>
//           <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
//             <DialogTrigger asChild>
//               <Button>Update Information</Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Do you want to update this Information?</DialogTitle>
//                 {/* <DialogDescription>
//                   Enter the necessary details to charge money.
//                 </DialogDescription> */}
//               </DialogHeader>
//               <form onSubmit={formUpdate.handleSubmit(handleUpdateInformation)}>
//                 <div className="space-y-4">
//                   <label>Phone Number</label>
//                   <Input
//                   name="phoneNumber"
//                     type="text"
//                     {...form.register("phoneNumber")}
//                     readOnly
//                   />

//                   <label>Birthday</label>
//                   <Input
//                     type="text"
//                     {...form.register("birthday")}
//                     readOnly
//                   />

//                   <label>Gender</label>
//                   <Input
//                     type="text"
//                     {...form.register("gender")}
//                     readOnly
//                   />

                  {/* <label>Payment Type</label>
                  <Select
                    defaultValue={formCharge.getValues("paymentType")}
                    onValueChange={(value) =>
                      formCharge.setValue("paymentType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Payment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Momo">MoMo</SelectItem>
                      <SelectItem value="VnPay">VnPay</SelectItem>
                      <SelectItem value="PayOS">PayOs</SelectItem>
                    </SelectContent>
                  </Select> */}
                {/* </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <Button type="submit">Submit</Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPopupOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog> */}

          {/* <AlertDialog */}
          {/* open={isProcessingPopupOpen}
            onOpenChange={(open) => {
              if (!open) {
                setPendingInvoiceId(null);
              }
              setIsProcessingPopupOpen(open);
            }}
          > */}
          {/* <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Đơn hàng đang chờ xác nhận</AlertDialogTitle>
                <AlertDialogDescription>
                  Vui lòng xác nhận khi đã nhận được tiền mặt.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setIsProcessingPopupOpen(false);
                    setPendingInvoiceId(null);
                  }}
                >
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmPayment}
                  disabled={isConfirming || !pendingInvoiceId}
                >
                  {isConfirming ? "Đang xác nhận..." : "Xác nhận đã thanh toán"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent> */}
          {/* </AlertDialog> */}
          {/* Popup charge money */}
          {/* <div className="flex justify-end mt-4 space-x-2">
            <Button type="submit">Submit</Button>
            <Button
              variant="outline"
              onClick={() => setIsPopupOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form> */}
      {/* <div className="flex justify-end mt-6 pr-4 pb-4 space-x-4">
        {etag && etag.status === 0 && !isConfirming && (
          <Button
            className="mt-12 px-6 py-2"
            onClick={handleActivateEtag}
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : isEditing
              ? "Confirm"
              : "Activate ETag"}
          </Button>
        )}
        {isConfirming && (
          <>
            <Button
              className="mt-12 px-6 py-2"
              onClick={handleConfirmActivation}
              disabled={isLoading}
            >
              {isLoading ? "Activating..." : "Confirm Activation"}
            </Button>
            <Button
              className="mt-12 px-6 py-2"
              onClick={handleCancelActivation}
              disabled={isLoading}
              variant="outline"
            >
              Cancel
            </Button>
          </>
        )}
      </div> */}
    // </>
//   );
// };

// export default EtagDetailPage;

// interface TestCompoProps {
//   housePromise: ReturnType<typeof getOrders>;
//   searchParams: SearchParams;
// }

// const TestCompo = ({ housePromise, searchParams }: TestCompoProps) => {
//   const { data, pageCount, error } = React.use(housePromise);

//   const { data: clientData, isLoading } = useGetOrders(searchParams);

//   console.log(clientData);
//   return (
//     <>
//       <div>TestCompo call data and see in terminal</div>
//     </>
//   );
// };

// export default TestCompo;
// "use client";

import BackButton from "@/components/BackButton";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import posts from "@/data/posts";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { PackageServices } from "@/components/services/packageServices";
import { register } from "module";
import { Package } from "@/types/package";
import Image from "next/image";


import { getStorage, ref } from "firebase/storage";
import { ETagServices } from "@/components/services/etagService";
import { ETag } from "@/types/etag";

const formSchema = z.object({
  phoneNumber: z.string().min(1, {
    message: "phoneNumber is required",
  }),
  gender: z.string().min(1, {
    message: "gender is required",
  }),
  birthday: z.string().min(1, {
    message: "Description is required",
  }),
});

interface EtagEditPageProps {
  params: {
    id: string;
  };
}

type FormValues = z.infer<typeof formSchema>;

const EtagEditPage = ({ params }: EtagEditPageProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [etagData, setEtagData] = useState<ETag | null>(null);
  const [uploadImage, setUploadImage] = useState<string | null>("");
  //get store from firebase storage
  const storage = getStorage();
  // Points to the root reference
  const storageRef = ref(storage);
  //Points to images ref
  const imagesRef = ref(storageRef, "images");
  // Points to 'images/thien.jpg'
  // Note that you can use variables to create child values
  const fileName = "thien.png";
  const thienRef = ref(imagesRef, fileName);

  // File path is 'images/thien.jpg'
  const path = thienRef.fullPath;

  // File name is 'space.jpg'
  const name = thienRef.name;

  // Points to 'images'
  const imagesRefAgain = thienRef.parent;

  console.log(path, "pathhhhh");
  console.log(name, "nameeeeee");
  console.log(imagesRefAgain, "imagesRefAgainnnn");

  // const pkg = packageList.find((pkg) => pkg.id === params.id);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      gender: "",
      birthday: "",
    },
  });

  const handleSubmit = async (data: FormValues) => {
    const { phoneNumber, gender, birthday  } = data;
    try {
      // Assuming you have an update method in PackageServices
      console.log(data, "dataaaaaa");
      await ETagServices.editInfoEtag(params.id, {phoneNumber, gender, birthday});
      toast({
        title: "Package has been updated successfully",
        description: `Package ${data.phoneNumber} was updated with price ${data.birthday} VND`,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  useEffect(() => {
    const fetchEtagData = async () => {
      setIsLoading(true);
      try {
        const response = await ETagServices.editInfoEtag(params.id,{birthday,gender,phoneNumber});
        const etagData: ETag = response.data.data;
        if (etagData) {
          setEtagData(etagData);
          if (
            etagData?.birthday &&
            etagData?.birthday.length > 0
          ) {
            const etagTypeMapping =
            etagData?.gender?.length > 0
                ? etagData.gender[0]
                : undefined;
            console.log(etagTypeMapping, "etagTypeMappingggg");

            if (
              etagTypeMapping &&
              etagTypeMapping.etagType &&
              etagTypeMapping?.etagTypeId
            ) {
              const etagId = etagTypeMapping?.etagType.id;
              localStorage.setItem("etagTypeId", etagId);
              console.log("EtagTypeId stored in localStorage:", etagId);
            } else {
              console.warn("EtagType or its ID is missing in the package data");
              setError(
                "EtagType information is incomplete. Please check the package configuration."
              );
            }
          } else {
            console.warn(
              "No packageETagTypeMappings found in the package data"
            );
            setError(
              "No E-Tag type information found for this package. Please check the package configuration."
            );
          }
        } else {
          throw new Error("Package data is missing in the response");
        }
      } catch (err) {
        console.error("Error fetching package data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while fetching package data"
        );
        toast({
          title: "Error",
          description: "Failed to load package data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEtagData();
  }, [params.id]);

  // useEffect(() => {
  //   const firebaseConfig = {
  //     apiKey: process.env.FIREBASE_API_KEY,
  //     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  //     projectId: process.env.FIREBASE_PROJECT_ID,
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  //     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  //     appId: process.env.FIREBASE_APP_ID,
  //     measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  //   };

  //   const app = initializeApp(firebaseConfig);
  //   const analytics = getAnalytics(app);
  //   // Use app and analytics here
  //   console.log(app, "appppppp");
  //   console.log(analytics, "analyticssss");
  // }, []);

  // Only then check for loading or error state | return must be below useEffect
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  console.log(packageData, "package Dataaa");
  return (
    <>
      <BackButton text="Back To Packages" link="/admin/packages" />
      <h3 className="text-2xl mb-4">Edit Package</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            phoneNumber="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Package Name"
                    {...field}
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
                  Uploade Image
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Upload image"
                    {...field}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        const fileName = file.name;

                        reader.onloadend = () => {
                          // const imageDataUrl: ArrayBuffer | string | null = reader.result;
                          setUploadImage(reader.result as string); // Save the image data to state
                          field.onChange(""); // Update the form field with the file name
                        };
reader.readAsDataURL(file); // Read the file as a data URL (base64)
                        console.log(`File name: ${fileName}`);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Image Preview */}
          {uploadImage && (
            <div className="image-preview">
              <Image
                src={uploadImage}
                alt="Image Preview"
                width={450}
                height={350}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name=""
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Description
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Price
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Price"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  Start Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
<FormItem>
                <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                  End Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                    placeholder="Enter Date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full dark:bg-slate-800 dark:text-white">
            Update Package
          </Button>
        </form>
      </Form>
    </>
  );
};

export default PackageEditPage;