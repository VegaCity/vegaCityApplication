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
import { createOrder, confirmOrder } from '@/components/services/orderuserServices';
import paymentService from '@/components/services/paymentService';
import { API } from '@/components/services/api';
import axios, { AxiosError } from 'axios';
const customerFormSchema = z.object({
  customerName: z.string().min(1, { message: 'Customer Name is required' }),
  phoneNumber: z.string().min(1, { message: 'Phone Number is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  cccd: z.string().min(1, { message: 'CCCD Number is required' }),
  paymentMethod: z.enum(['cash', 'momo', 'vnpay'], { required_error: 'Payment method is required' }),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required' }),
  quantity: z.coerce.number().min(1, { message: 'Quantity is required and must be at least 1' }),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number' }),
});
const etagFormSchema = z.object({
  etagStartDate: z.string().min(1, { message: 'E-Tag Start Date is required' }),
  etagEndDate: z.string().min(1, { message: 'E-Tag End Date is required' }),
  etagDuration: z.coerce.number().min(1, { message: 'E-Tag Duration is required' }),
  etagMoney: z.coerce.number().min(0, { message: 'E-Tag Money must be a positive number' }),
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
  const [etagData, setEtagData] = useState<{
    startDate: string;
    endDate: string;
    day: number;
    moneyStart: number;
  
  } | null>(null);
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
    console.log('handleEtagSubmit started');
    
    const storedEtagTypeId = localStorage.getItem('etagTypeId');
    if (!storedEtagTypeId) {
      console.error('EtagType ID is missing in localStorage');
      toast({
        title: 'Error',
        description: 'EtagType ID is missing. Please reload the page and try again.',
        variant: 'destructive',
      });
      return;
    }
  
    try {
      const generateEtagData: GenerateEtag = {
        quantity: Number(customerForm.getValues('quantity')),
        etagTypeId: storedEtagTypeId,
        generateEtagRequest: {
          startDate: new Date(data.etagStartDate).toISOString(),
          endDate: new Date(data.etagEndDate).toISOString(),
          day: data.etagDuration,
          
        }
      };
  
      if (!isValidEtagData(generateEtagData)) {
        console.error('Invalid generateEtagData:', generateEtagData);
        toast({
          title: 'Error',
          description: 'Invalid E-Tag data. Please check your inputs and try again.',
          variant: 'destructive',
        });
        return;
      }
  
      const response = await ETagServices.generateEtag(generateEtagData);
      console.log('generateEtag API response:', response);
  
      if (response.data) {
        setEtagData({
          startDate: data.etagStartDate,
          endDate: data.etagEndDate,
          day: data.etagDuration,
          moneyStart: data.etagMoney,
        });
  
        toast({
          title: 'E-Tag generated successfully',
          description: `E-Tag for package ${etagInfo.name} has been generated.`,
        });
  
        const paymentMethod = customerForm.getValues('paymentMethod');
        const invoiceId = localStorage.getItem('invoiceId');
        
        if (paymentMethod === 'cash' && invoiceId) {
          // For cash payments, use the confirm order API with the complete request body
          const confirmData = {
            invoiceId: invoiceId,
            generateEtagRequest: {
              startDate: new Date(data.etagStartDate).toISOString(),
              endDate: new Date(data.etagEndDate).toISOString(),
              day: data.etagDuration,
              moneyStart: data.etagMoney
            }
          };
          const confirmResponse = await API.post('/order/cashier/confirm', confirmData);
          console.log('Confirm order response:', confirmResponse);
          toast({
            title: 'Order Confirmed',
            description: 'Your cash order has been successfully confirmed.',
          });
        } else if (paymentMethod !== 'cash' && invoiceId) {
          await initiatePayment(paymentMethod, invoiceId);
        } else {
          throw new Error('Missing payment information');
        }
      } else {
        throw new Error('Failed to generate E-Tag');
      }
    } catch (err) {
      console.error('Error in handleEtagSubmit:', err);
      let errorMessage = 'Failed to generate E-Tag or process payment. Please try again.';
      if (err instanceof Error) {
        errorMessage += ` Error: ${err.message}`;
      }
     
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  const initiatePayment = async (paymentMethod: string, invoiceId: string) => {
    try {
      let paymentResponse;
      if (paymentMethod === 'momo') {
        paymentResponse = await paymentService.momo({ invoiceId });
      } else if (paymentMethod === 'vnpay') {
        paymentResponse = await paymentService.vnpay({ invoiceId });
      } else {
        throw new Error('Invalid payment method');
      }
      
      console.log('Payment response:', paymentResponse);
  
      if (paymentResponse && paymentResponse.data) {
        if (paymentMethod === 'vnpay' && paymentResponse.data.vnPayResponse) {
          window.location.href = paymentResponse.data.vnPayResponse;
        } else if (paymentResponse.data.urlDirect) {
          window.location.href = paymentResponse.data.urlDirect;
        } else {
          throw new Error('Payment URL not found in the response');
        }
      } else {
        throw new Error('Invalid payment response structure');
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
      etagStartDate: '',
      etagEndDate: '',
      etagDuration: 0,
      etagMoney: 0,
    },
  });
  const isValidEtagData = (data: GenerateEtag): boolean => {
    return (
      typeof data.quantity === 'number' &&
      !isNaN(data.quantity) &&
      typeof data.etagTypeId === 'string' &&
      data.etagTypeId.length > 0 &&
      typeof data.generateEtagRequest.startDate === 'string' &&
      typeof data.generateEtagRequest.endDate === 'string' &&
      typeof data.generateEtagRequest.day === 'number' &&
      !isNaN(data.generateEtagRequest.day) 
    );
  };
  useEffect(() => {
    const { etagStartDate, etagEndDate } = etagForm.watch();
    if (etagStartDate && etagEndDate) {
      const start = new Date(etagStartDate);
      const end = new Date(etagEndDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      etagForm.setValue('etagDuration', duration);
    }
  }, [etagForm.watch('etagStartDate'), etagForm.watch('etagEndDate')]);
  const [isLoading, setIsLoading] = useState(true);
  const [etagInfo, setEtagInfo] = useState({ id:'',name: '', bonusRate: 0, amount: 0, imageUrl: '' });
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
        <BackButton text="Back To E-Tag Types" link="/" />
        <h3 className="text-2xl font-bold mb-6">Generate E-Tag for {etagInfo.name}</h3>
        <div className="flex flex-col md:flex-row gap-8 mb-8 mt-4">
          <div className="md:w-1/2">
            <img src={etagInfo.imageUrl} alt={etagInfo.name} className="w-48 h-48 rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{etagInfo.name}</h2>
              <p className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6">{formatCurrency(etagInfo.amount)}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Bonus Rate</h3>
              <p className="text-red-400">{etagInfo.bonusRate}%</p>
            </div>
          </div>
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
                        className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white" 
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
                        <Input type="date" {...field} className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white" />
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
                        <Input type="date" {...field} className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
                <FormField
                  control={etagForm.control}
                  name="etagDuration"
                  render={({ field }) => (
                    <FormItem className="md:w-1/2">
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">E-Tag Duration (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} readOnly className="bg-gray-200 dark:bg-gray-600 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="w-full sm:w-auto">
                Generate E-Tag
              </Button>
            </div>
          </form>
        </Form>
      )}    
    </div>
  );
};
export default GenerateEtagById;