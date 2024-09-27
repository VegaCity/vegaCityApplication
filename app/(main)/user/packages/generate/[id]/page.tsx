'use client'
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { PackageServices } from '@/components/services/packageServices';
import BackButton from '@/components/BackButton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  id: z.string().min(1, { message: 'Package Id is required' }),
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  price: z.coerce.number({ required_error: 'Price is required!', invalid_type_error: 'Price must be a number!' }),
  startDate: z.string().min(1, { message: 'Start Date is required' }),
  endDate: z.string().min(1, { message: 'End Date is required' }),
  imageUrl: z.string().optional(),
  customerName: z.string().min(1, { message: 'Customer Name is required' }),
  phoneNumber: z.string().min(1, { message: 'Phone Number is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  idNumber: z.string().min(1, { message: 'ID Number is required' }),
  paymentMethod: z.enum(['cash', 'momo', 'vnpay'], { required_error: 'Payment method is required' }), // Add payment method validation
});

type FormValues = z.infer<typeof formSchema>;

interface GenerateEtagProps {
  params: { id: string };
}

const GenerateEtagById = ({ params }: GenerateEtagProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: params.id,
      name: '',
      description: '',
      price: 1,
      startDate: '',
      endDate: '',
      customerName: '',
      phoneNumber: '',
      address: '',
      idNumber: '',
      paymentMethod: 'cash', // Default payment method
    },
  });

  useEffect(() => {
    const fetchPackageData = async () => {
      setIsLoading(true);
      try {
        const response = await PackageServices.getPackageById(params.id);
        const pkgData = response.data.data.package;
        if (pkgData) {
          form.reset({
            id: pkgData.id,
            name: pkgData.name,
            description: pkgData.description,
            price: pkgData.price,
            startDate: pkgData.startDate,
            endDate: pkgData.endDate,
            imageUrl: pkgData.imageUrl,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageData();
  }, [params.id, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      toast({
        title: 'E-Tag generated successfully',
        description: `E-Tag for package ${data.name} has been generated for ${data.customerName} using ${data.paymentMethod}.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <BackButton text="Back To Packages" link="/" />
      <h3 className="text-2xl mb-4">Generate E-Tag</h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <input type="hidden" {...form.register("id")} />
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <img src={form.getValues('imageUrl')} alt={form.getValues('name')} className="w-full h-auto rounded-lg shadow-lg" />
            </div>

            <div className="md:w-1/2 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{form.getValues('name')}</h2>
                <p className="text-xl font-semibold text-green-600 dark:text-green-400">${form.getValues('price')}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{form.getValues('description')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</FormLabel>
                  <FormControl>
                    <Input className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white" placeholder="Enter Start Date" {...field} readOnly />
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
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</FormLabel>
                  <FormControl>
                    <Controller
                      name="endDate"
                      control={form.control}
                      render={({ field: { onChange, value } }) => (
                        <DatePicker
                          selected={value ? new Date(value) : null}
                          onChange={(date) => onChange(date ? date.toISOString() : '')}
                          showTimeSelect
                          dateFormat="Pp"
                          className="w-full bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white rounded-md"
                          placeholderText="Select End Date and Time"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Customer Information</h3>
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                  <FormControl>
                    <Input className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white" placeholder="Enter Full Name" {...field} />
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
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</FormLabel>
                  <FormControl>
                    <Input className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white" placeholder="Enter Phone Number" {...field} />
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
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</FormLabel>
                  <FormControl>
                    <Input className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white" placeholder="Enter Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">ID Number</FormLabel>
                  <FormControl>
                    <Input className="bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white" placeholder="Enter ID Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Payment Method</h3>
  <div className="flex flex-col space-y-4">
    <label className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg transition duration-200 hover:bg-gray-200 dark:hover:bg-gray-600">
      <input
        type="radio"
        {...form.register("paymentMethod")}
        value="cash"
        className="mr-3 accent-blue-600"
      />
      <span className="text-gray-800 dark:text-gray-200">Cash</span>
    </label>
    <label className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg transition duration-200 hover:bg-gray-200 dark:hover:bg-gray-600">
      <input
        type="radio"
        {...form.register("paymentMethod")}
        value="momo"
        className="mr-3 accent-blue-600"
      />
      <span className="text-gray-800 dark:text-gray-200">MoMo</span>
    </label>
    <label className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg transition duration-200 hover:bg-gray-200 dark:hover:bg-gray-600">
      <input
        type="radio"
        {...form.register("paymentMethod")}
        value="vnpay"
        className="mr-3 accent-blue-600"
      />
      <span className="text-gray-800 dark:text-gray-200">VNPay</span>
    </label>
    {form.formState.errors.paymentMethod && (
      <span className="text-red-600">{form.formState.errors.paymentMethod.message}</span>
    )}
  </div>
</div>


          <Button type="submit" className="w-full mt-4">Generate E-Tag</Button>
        </form>
      </Form>
    </div>
  );
};

export default GenerateEtagById;
