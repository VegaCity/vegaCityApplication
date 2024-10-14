'use client';
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ETagTypeServices } from '@/components/services/etagtypeServices';
import { GenerateEtag } from '@/components/services/etagService';
import { ETagServices } from '@/components/services/etagService';
import BackButton from '@/components/BackButton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createOrder, confirmOrder, deleteOrder } from '@/components/services/orderuserServices';
import paymentService from '@/components/services/paymentService';
import { API } from '@/components/services/api';
import axios, { AxiosError } from 'axios';
import { Card } from '@/components/ui/card';
const customerFormSchema = z.object({
  customerName: z.string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name must not exceed 100 characters' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Name should only contain letters and spaces' }),

  phoneNumber: z.string()
    .regex(/^(0|\+84)(\s|-)?[1-9]\d{8}$/, { message: 'Invalid phone number format' }),

  address: z.string()
    .min(5, { message: 'Address must be at least 5 characters long' })
    .max(200, { message: 'Address must not exceed 200 characters' }),

  cccd: z.string()
    .regex(/^\d{12}$/, { message: 'CCCD must be exactly 12 digits' }),

  paymentMethod: z.enum(['cash', 'momo', 'vnpay', 'payos'], {
    required_error: 'Payment method is required',
    invalid_type_error: 'Invalid payment method selected',
  }),

  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required',
    invalid_type_error: 'Invalid gender selected',
  }),

  quantity: z.number()
    .int({ message: 'Quantity must be a whole number' })
    .min(1, { message: 'Quantity must be at least 1' })
    .max(100, { message: 'Quantity cannot exceed 100' }),

  price: z.number()
    .min(0, { message: 'Price cannot be negative' })
    .max(1000000000, { message: 'Price cannot exceed 1 billion' }),
});

const etagFormSchema = z.object({
  etagStartDate: z.string()
    .refine((date) => {
      const startDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return startDate >= today;
    }, { message: "Start date must be today or a future date" }),

  etagEndDate: z.string()
    .refine((date) => {
      const endDate = new Date(date);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 5);
      return endDate <= maxDate;
    }, { message: "End date cannot be more than 5 years in the future" }),
}).refine((data) => {
  const startDate = new Date(data.etagStartDate);
  const endDate = new Date(data.etagEndDate);
  return endDate > startDate;
}, {
  message: "End date must be after start date",
  path: ["etagEndDate"],
});
interface GenerateEtagProps {
  params: { id: string; };
}
type CustomerFormValues = z.infer<typeof customerFormSchema>;
type EtagFormValues = z.infer<typeof etagFormSchema>;
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    currencyDisplay: 'symbol',
  }).format(amount).replace('₫', 'đ');
};

const GenerateEtagById = ({ params }: GenerateEtagProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isCustomerInfoConfirmed, setIsCustomerInfoConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isEtagInfoConfirmed, setIsEtagInfoConfirmed] = useState(false);
  const [cachedEtagFormData, setCachedEtagFormData] = useState({});
  const [isCashPaymentConfirmed, setIsCashPaymentConfirmed] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [etagData, setEtagData] = useState<{
    startDate: Date;
    endDate: Date;

  } | null>(null);
  const deleteExistingOrder = async () => {
    const storedOrderId = localStorage.getItem('orderId');
    if (storedOrderId) {
      try {
        await deleteOrder(storedOrderId);
        localStorage.removeItem('orderId');
        localStorage.removeItem('invoiceId');
        toast({
          title: 'Order Deleted',
          description: 'The existing order has been successfully deleted.',
        });
      } catch (err) {
        console.error('Error deleting order:', err);
        toast({
          title: 'Error',
          description: 'Failed to delete the existing order. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };
  // const handleCancelEtag = () => {
  //   setIsEtagInfoConfirmed(false);
  //   setIsCustomerInfoConfirmed(false);
  //   Object.entries(cachedEtagFormData).forEach(([key, value]) => {
  //     if (typeof value === 'string' || typeof value === 'number') {
  //       etagForm.setValue(key as keyof EtagFormValues, value);
  //     }
  //   });
  //   toast({
  //     title: 'Information Editing Enabled',
  //     description: 'You can now edit both customer and E-tag information.',
  //   });
  // };
  const handleCancelOrder = async () => {
    await deleteExistingOrder();
    setIsCustomerInfoConfirmed(false);
    setIsEtagInfoConfirmed(false);
    setIsCashPaymentConfirmed(false);
    customerForm.reset();
    etagForm.reset();
    setOrderId(null);
    toast({
      title: 'Order Cancelled',
      description: 'Your order has been cancelled and deleted.',
    });
  };
  const handleCustomerInfoSubmit = async (data: CustomerFormValues) => {
    setIsCustomerInfoConfirmed(true);
    try {
      const orderData = {
        saleType: 'EtagType',
        paymentType: data.paymentMethod,
        totalAmount: data.price * data.quantity,
        productData: [{
          id: etagInfo.id,
          name: etagInfo.name,
          price: data.price,
          imgUrl: etagInfo.imageUrl,
          quantity: data.quantity,
        }],
        customerInfo: {
          fullName: data.customerName,
          phoneNumber: data.phoneNumber,
          address: data.address,
          gender: data.gender,
          cccd: data.cccd
        }
      };
      const response = await createOrder(orderData);


      localStorage.setItem('orderId', response.data.orderId);
      localStorage.setItem('invoiceId', response.data.invoiceId);

      setOrderId(response.data.invoiceId);
      toast({
        title: 'Order Created',
        description: 'Customer information confirmed and order created.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while creating the order');
      toast({
        title: 'Error',
        description: 'Failed to create order. Please try again.',
        variant: 'destructive',
      });
    }
  };
  const handleEtagSubmit = async (data: EtagFormValues) => {
    if (!isOrderConfirmed) {
      toast({
        title: 'Error',
        description: 'Please confirm your order before generating E-Tag.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const generateEtagData: GenerateEtag = {
        quantity: Number(customerForm.getValues('quantity')),
        etagTypeId: localStorage.getItem('etagTypeId') || '',
        generateEtagRequest: {
          startDate: new Date(data.etagStartDate),
          endDate: new Date(data.etagEndDate),
        }
      };

      const response = await ETagServices.generateEtag(generateEtagData);

      if (response.data) {
        setEtagData({
          startDate: new Date(data.etagStartDate),
          endDate: new Date(data.etagEndDate),
        });

        toast({
          title: 'E-Tag generated successfully',
          description: `E-Tag for ${etagInfo.name} has been generated.`,
        });
      } else {
        throw new Error('Failed to generate E-Tag');
      }
    } catch (err) {
      console.error('Error in handleEtagSubmit:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate E-Tag. Please try again.',
        variant: 'destructive',
      });
    }
  };
  const handleConfirmEtag = async () => {
    const isValid = await etagForm.trigger();
    
    if (isValid) {
      setIsEtagInfoConfirmed(true);
      setCachedEtagFormData(etagForm.getValues());
      toast({
        title: 'E-tag Information Confirmed',
        description: 'You can now generate the E-tag.',
      });
    } else {
      const errors = etagForm.formState.errors;
      let errorMessage = 'Please fill in all required E-tag information fields correctly:';
      if (errors.etagStartDate) errorMessage += ' Start Date is invalid.';
      if (errors.etagEndDate) errorMessage += ' End Date is invalid.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  const handleConfirmOrder = async () => {
    const invoiceId = localStorage.getItem('invoiceId');
    if (!invoiceId) {
      toast({
        title: 'Error',
        description: 'Invoice ID not found. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    const paymentMethod = customerForm.getValues('paymentMethod');

    try {
      const confirmData = {
        invoiceId: invoiceId,
        etagTypeId: localStorage.getItem('etagTypeId') || '',
        generateEtagRequest: {
          startDate: new Date(etagForm.getValues('etagStartDate')),
          endDate: new Date(etagForm.getValues('etagEndDate')),
          // day: etagForm.getValues('etagDuration'),
          // moneyStart: etagForm.getValues('etagMoney')
        }
      };

      if (paymentMethod === 'cash') {
        // await confirmOrder(confirmData);
        setIsOrderConfirmed(true);
        toast({
          title: 'Order Confirmed',
          description: 'Your cash order has been successfully confirmed.',
        });
      } else if (paymentMethod === 'momo' || paymentMethod === 'vnpay' || paymentMethod === 'payos') {
        try {
          await initiatePayment(paymentMethod, invoiceId);
        } catch (paymentError) {
          console.error('Payment initiation error:', paymentError);
          toast({
            title: 'Payment Error',
            description: `Failed to initiate ${paymentMethod} payment. Please try again.`,
            variant: 'destructive',
          });
        }
      } else {
        throw new Error('Invalid payment method');
      }
    } catch (err) {
      console.error('Error confirming order:', err);
      toast({
        title: 'Error',
        description: 'Failed to confirm order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const initiatePayment = async (paymentMethod: string, invoiceId: string) => {
    try {
      console.log(`Initiating ${paymentMethod} payment for invoice ${invoiceId}`);
  
      let paymentResponse;
  
      if (paymentMethod === 'momo') {
        paymentResponse = await paymentService.momo({ invoiceId });
      } else if (paymentMethod === 'vnpay') {
        paymentResponse = await paymentService.vnpay({ invoiceId });
      } else if (paymentMethod === 'payos') {
        paymentResponse = await paymentService.payos({ invoiceId });
      } else {
        throw new Error('Invalid payment method');
      }
  
      console.log('Raw payment response:', JSON.stringify(paymentResponse, null, 2));
  
      if (paymentResponse && paymentResponse.statusCode === 200) {
        if (paymentMethod === 'momo') {
          console.log('Handling MoMo response');
          const momoData = paymentResponse.data;
          if (momoData.payUrl) {
            console.log('Redirecting to payUrl:', momoData.payUrl);
            window.location.href = momoData.payUrl;
          } else if (momoData.shortLink) {
            console.log('Redirecting to shortLink:', momoData.shortLink);
            window.location.href = momoData.shortLink;
          } else {
            console.error('MoMo payment URL not found in the response');
            throw new Error('MoMo payment URL not found in the response');
          }
        } else if (paymentMethod === 'vnpay') {
          console.log('Handling VNPay response');
          if (paymentResponse.data.vnPayResponse) {
            console.log('Redirecting to VNPay URL:', paymentResponse.data.vnPayResponse);
            window.location.href = paymentResponse.data.vnPayResponse;
          } else {
            console.error('VNPay payment URL not found in the response');
            throw new Error('VNPay payment URL not found in the response');
          }
        } else if (paymentMethod === 'payos') {
          console.log('Handling PayOS response');
          const payosData = paymentResponse.data;
          if (payosData.checkoutUrl) {
            console.log('Redirecting to PayOS checkout URL:', payosData.checkoutUrl);
            window.location.href = payosData.checkoutUrl;
          } else {
            console.error('PayOS checkout URL not found in the response');
            throw new Error('PayOS checkout URL not found in the response');
          }
        }
      } else {
        console.error('Invalid payment response structure or status code');
        throw new Error('Invalid payment response structure or status code');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: 'Payment Error',
        description: `Failed to initiate ${paymentMethod} payment. Please try again.`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerName: '',
      phoneNumber: '',
      address: '',
      cccd: '',
      paymentMethod: 'cash',
      gender: 'male',
      quantity: 1,
      price: 0,
    },
  });

  const etagForm = useForm<EtagFormValues>({
    resolver: zodResolver(etagFormSchema),
    defaultValues: {
      etagStartDate: new Date().toISOString().split('T')[0],
      etagEndDate: new Date().toISOString().split('T')[0],
    },
    mode: 'all', // This ensures validation runs on every change and blur
  });
  useEffect(() => {
    const validateForm = async () => {
      await etagForm.trigger();
    };
    validateForm();
  }, [endDate, etagForm]);

  useEffect(() => {
    const { etagStartDate, etagEndDate } = etagForm.watch();
    if (etagStartDate && etagEndDate) {
      const start = new Date(etagStartDate);
      const end = new Date(etagEndDate);

    }
  }, [etagForm.watch('etagStartDate'), etagForm.watch('etagEndDate')]);
  const [isLoading, setIsLoading] = useState(true);
  const [etagInfo, setEtagInfo] = useState({ id: '', name: '', bonusRate: 0, amount: 0, imageUrl: '' });
  useEffect(() => {
    const fetchEtagData = async () => {
      try {
        const response = await ETagTypeServices.getETagTypeById(params.id);
        const etagData = response.data.data.etagType;
        console.log('E-Tag Data:', etagData);
        if (etagData) {
          setEtagInfo({
            id: etagData.id,
            name: etagData.name,
            bonusRate: etagData.bonusRate,
            amount: etagData.amount,
            imageUrl: etagData.imageUrl || '/path/to/placeholder-image.jpg',
          });
        } else {
          setError('No E-Tag data found');
        }
      } catch (err) {
        console.error('Error fetching E-Tag data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEtagData();
  }, [params.id]);



  if (isLoading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (

    <div className="container mx-auto p-4">
      <BackButton text="Back To E-Tag Types" link="/user/etagtypes" />
      <h3 className="text-2xl font-bold mb-6">Generate E-Tag for {etagInfo.name}</h3>
      <div className="mb-8 flex justify-center">
        <Card className="overflow-hidden w-full max-w-4xl">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <img src={etagInfo.imageUrl} alt={etagInfo.name} className="w-full h-full object-cover" />
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-semibold mb-2">{etagInfo.name}</h2>
              <p className="text-xl font-bold text-green-600 mb-2">{formatCurrency(etagInfo.amount)}</p>
              <p className="text-sm text-gray-600">Bonus Rate: <span className="font-semibold text-red-500">{etagInfo.bonusRate}%</span></p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Information Section */}
      <Form {...customerForm}>
        <form onSubmit={customerForm.handleSubmit(handleCustomerInfoSubmit)} className="space-y-6">
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Customer Information</h3>
            <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
              <FormField
                control={customerForm.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem className="md:w-1/2">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-gray-100 dark:bg-gray-700 border-1 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                        placeholder="Enter Full Name"
                        {...field}
                        disabled={isCustomerInfoConfirmed}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={customerForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="md:w-1/2">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                        placeholder="Enter Phone Number"
                        {...field}
                        disabled={isCustomerInfoConfirmed}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
              <FormField
                control={customerForm.control}
                name="cccd"
                render={({ field }) => (
                  <FormItem className="md:w-1/2">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">CCCD:</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                        placeholder="Enter ID Number"
                        {...field}
                        disabled={isCustomerInfoConfirmed}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={customerForm.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="md:w-1/2">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCustomerInfoConfirmed}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
            <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
              <FormField
                control={customerForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="md:w-1/2">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                        disabled={isCustomerInfoConfirmed}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={customerForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="md:w-1/2">
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                        disabled={isCustomerInfoConfirmed}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:flex md:space-x-4 space-y-4 md:space-y-0"></div>
            <FormField
              control={customerForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                      placeholder="Enter Address"
                      {...field}
                      disabled={isCustomerInfoConfirmed}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={customerForm.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem >
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCustomerInfoConfirmed}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="momo">Momo</SelectItem>
                      <SelectItem value="vnpay">VNPay</SelectItem>
                      <SelectItem value="payos">PayOs</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {!isCustomerInfoConfirmed && (
            <div className="flex justify-end">
              <Button type="submit" className="w-full sm:w-auto" >
                Confirm Information
              </Button>
            </div>
          )}
        </form>
      </Form>
      {isCustomerInfoConfirmed && (
        <Form {...etagForm}>
          <form onSubmit={(e) => {
            console.log('Form submitted');
            console.log('Form is valid:', etagForm.formState.isValid);
            console.log('Form errors:', etagForm.formState.errors);
            etagForm.handleSubmit(handleEtagSubmit)(e);
          }} className="space-y-6 mt-8">
            <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">E-Tag Information</h3>
              <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
                <FormField
                  control={etagForm.control}
                  name="etagStartDate"
                  render={({ field }) => (
                    <FormItem className="md:w-1/2">
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">E-Tag Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ''}  // Ensure a valid value is always set
                          onChange={(e) => field.onChange(e.target.value)}
                          className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
      control={etagForm.control}
      name="etagEndDate"
      render={({ field }) => (
        <FormItem className="md:w-1/2">
          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">E-Tag End Date</FormLabel>
          <FormControl>
            <Input
              type="date"
              {...field}
              value={endDate || field.value || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                setEndDate(newValue);
                field.onChange(newValue);
              }}
              onBlur={() => {
                field.onBlur();
                etagForm.trigger('etagEndDate');
              }}
              className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
              </div>

            </div>
            <div className="flex justify-end space-x-4">
              {!isEtagInfoConfirmed ? (
                <>
                  {/* <Button type="button" onClick={handleCancelEtag}>
                    Cancel
                  </Button> */}
                  <Button type="button" onClick={handleConfirmEtag}>
                    Confirm E-tag Information
                  </Button>
                </>
              ) : !isOrderConfirmed ? (
                <>
                  <Button type="button" onClick={handleCancelOrder}>
                    Cancel Order
                  </Button>
                  <Button type="button" onClick={handleConfirmOrder}>
                    Confirm Order
                  </Button>
                </>
              ) : (
                <>
                  <Button type="submit">
                    Generate E-Tag
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
export default GenerateEtagById;