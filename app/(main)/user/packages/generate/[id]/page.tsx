'use client'
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PackageServices } from '@/components/services/packageServices';
import BackButton from '@/components/BackButton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createOrder, confirmOrder } from '@/components/services/orderuserServices';
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
type CustomerFormValues = z.infer<typeof customerFormSchema>;
type EtagFormValues = z.infer<typeof etagFormSchema>;
interface GenerateEtagProps {
  params: { id: string };
}
const GenerateEtagById = ({ params }: GenerateEtagProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomerInfoConfirmed, setIsCustomerInfoConfirmed] = useState(false);
  const [packageData, setPackageData] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [etagData, setEtagData] = useState<{
    startDate: string;
    endDate: string;
    day: number;
    moneyStart: number;
  } | null>(null);
  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerName: '',
      phoneNumber: '',
      address: '',
      cccd: '',
      paymentMethod: 'cash',
      gender: 'male',
      quantity: 1,  // Default quantity can be 1
      price: 0,     // Default price can be 0 or any other value
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
  useEffect(() => {
    const fetchPackageData = async () => {
      setIsLoading(true);
      try {
        const response = await PackageServices.getPackageById(params.id);
        const pkgData = response.data.data.package;
        if (pkgData) {
          setPackageData(pkgData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackageData();
  }, [params.id]);
  const handleCustomerInfoSubmit = async (data: CustomerFormValues) => {
    setIsCustomerInfoConfirmed(true);
    try {
      const orderData = {
        saleType: 'Package',
        paymentType: data.paymentMethod,
        totalAmount: data.price * data.quantity, 
        productData: [{
          id: packageData.id,
          name: packageData.name,
          price: data.price, 
          imgUrl: packageData.imageUrl,
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
      
      // Save orderId and invoiceId to local storage
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
    console.log('handleEtagSubmit called with data:', data);
    try {
      const invoiceId = localStorage.getItem('invoiceId');
      console.log('Retrieved invoiceId from localStorage:', invoiceId);
      
      if (!invoiceId) {
        console.error('No invoice ID found in localStorage');
        throw new Error('No invoice ID found. Please create an order first.');
      }
  
      const confirmData = {
        invoiceId: invoiceId,
        generateEtagRequest: {
          startDate: new Date(data.etagStartDate),
          endDate: new Date(data.etagEndDate),
          day: data.etagDuration,
          moneyStart: data.etagMoney,
        }
      };
      console.log('Confirm Data:', confirmData);
      
      const response = await confirmOrder(confirmData);
      console.log('confirmOrder response:', response);
  
      setEtagData({
        startDate: data.etagStartDate,
        endDate: data.etagEndDate,
        day: data.etagDuration,
        moneyStart: data.etagMoney,
      });
  
      toast({
        title: 'E-Tag generated successfully',
        description: `E-Tag for package ${packageData.name} has been generated and order confirmed.`,
      });
    } catch (err) {
      console.error('Error in handleEtagSubmit:', err);
      let errorMessage = 'Failed to generate E-Tag and confirm order. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('status code 500')) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        }
        console.error('Detailed error:', err.message);
      }
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
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
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="container mx-auto p-4">
      <BackButton text="Back To Packages" link="/" />
      <h3 className="text-2xl mb-4">Generate E-Tag</h3>
      {packageData && (
        <div className="flex flex-col md:flex-row gap-8 mb-6">
          <div className="md:w-1/2">
            <img src={packageData.imageUrl} alt={packageData.name} className="w-full h-auto rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{packageData.name}</h2>
              <p className="text-xl font-semibold text-green-600 dark:text-green-400 mt-6">{packageData.price}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400">{packageData.description}</p>
            </div>
            {packageData.packageETagTypeMappings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Bao gồm E-Tag Type</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {packageData.packageETagTypeMappings[0]?.etagType?.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                  {packageData.packageETagTypeMappings[0]?.etagType?.amount}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
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
                <FormField
                  control={etagForm.control}
                  name="etagMoney"
                  render={({ field }) => (
                    <FormItem className="md:w-1/2">
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">E-Tag Money</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white" />
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