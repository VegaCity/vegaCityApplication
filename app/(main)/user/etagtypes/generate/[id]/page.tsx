'use client'
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ETagTypeServices } from '@/components/services/etagtypeServices';
import BackButton from '@/components/BackButton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  id: z.string().min(1, { message: 'E-Tag Id is required' }),
  customerName: z.string().min(1, { message: 'Customer Name is required' }),
  phoneNumber: z.string().min(1, { message: 'Phone Number is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  idNumber: z.string().min(1, { message: 'ID Number is required' }),
  paymentMethod: z.enum(['cash', 'momo', 'vnpay'], { required_error: 'Payment method is required' }),
});

interface GenerateEtagProps {
  params: {
    id: string;
  };
}

type FormValues = z.infer<typeof formSchema>;

const GenerateEtagById = ({ params }: GenerateEtagProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [etagInfo, setEtagInfo] = useState({ name: '', bonusRate: 0, amount: 0 });

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: params.id,
      customerName: '',
      phoneNumber: '',
      address: '',
      idNumber: '',
      paymentMethod: 'cash',
    },
  });

  useEffect(() => {
    const fetchEtagData = async () => {
      try {
        const response = await ETagTypeServices.getETagTypeById(params.id);
        const etagData = response.data.data.etagType;
        console.log('E-Tag Data:', etagData);

        if (etagData) {
          setEtagInfo({
            name: etagData.name,
            bonusRate: etagData.bonusRate,
            amount: etagData.amount,
          });
          setImageUrl(etagData.imageUrl || null);
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

  const handleSubmit = async (data: FormValues) => {
    try {
      console.log('Generating E-Tag with data:', data);
      // Implement your E-Tag generation logic here
      
      toast({
        title: 'E-Tag generated successfully',
        description: `E-Tag for ${etagInfo.name} has been generated.`,
      });
    } catch (err) {
      console.error('Error generating E-Tag:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: 'Error',
        description: 'Failed to generate E-Tag. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto p-4">
        <BackButton text="Back To E-Tag Types" link="/" />
        <h3 className="text-2xl font-bold mb-6">Generate E-Tag for {etagInfo.name}</h3>

        <div className="flex mb-6">
          {/* Left side - Image */}
          <div className="w-1/2 pr-4">
            {imageUrl ? (
              <>
                <h4 className="text-lg font-semibold mb-2">E-Tag Image</h4>
                <img src={imageUrl} alt="E-Tag" className="max-w-xs h-auto rounded-md shadow-md" />
              </>
            ) : (
              <>
                <h4 className="text-lg font-semibold mb-2">E-Tag Image (Default)</h4>
                <img src="/path/to/placeholder-image.jpg" alt="Default E-Tag" className="max-w-xs h-auto rounded-md shadow-md" />
              </>
            )}
          </div>

          {/* Right side - E-Tag Info */}
          <div className="w-1/2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">E-Tag Information</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{etagInfo.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Bonus Rate:</span>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{etagInfo.bonusRate}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount:</span>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{etagInfo.amount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Customer Information</h3>
          <FormField
            control={methods.control}
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
            control={methods.control}
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
            control={methods.control}
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
            control={methods.control}
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
          <FormField
            control={methods.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</FormLabel>
                <FormControl>
                  <select {...field} className="w-full bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-2 focus-visible:ring-blue-500 text-gray-900 dark:text-white rounded-md p-2">
                    <option value="cash">Cash</option>
                    <option value="momo">Momo</option>
                    <option value="vnpay">VNPay</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6">
          <Button type="submit" onClick={methods.handleSubmit(handleSubmit)} className="w-full">Generate E-Tag</Button>
        </div>
      </div>
    </FormProvider>
  );
};

export default GenerateEtagById;