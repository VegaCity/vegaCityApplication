'use client';

import BackButton from '@/components/BackButton';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import { ETagTypeServices } from '@/components/services/etagtypeServices';
import { EtagType } from '@/types/etagtype';
import { useRouter } from 'next/navigation';

const etagTypesSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  imageUrl: z.string().url({ message: 'Image URL must be a valid URL' }),
  bonusRate: z.coerce.number({
    required_error: "Bonus Rate is required!",
    invalid_type_error: "Price must be a number!"
  }),
  amount: z.coerce.number({
    required_error: "Amount is required!",
    invalid_type_error: "Price must be a number!"
  }),
});

interface EtagTypeEditPageProps {
  params: { id: string; };
}

type FormValues = z.infer<typeof etagTypesSchema>;

const EtagTypeEditPage = ({ params }: EtagTypeEditPageProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(etagTypesSchema),
    defaultValues: { name: '', imageUrl: '', bonusRate: 0, amount: 0 },
  });

  useEffect(() => {
    const fetchEtagType = async () => {
      setIsLoading(true);
      try {
        const response = await ETagTypeServices.getETagTypeById(params.id);
        const etagData = response.data.data.etagType; 
        console.log(etagData, 'etagDataaaaaa')
        if (etagData) {
          form.reset({ 
            name: etagData.name,  
            imageUrl: etagData.imageUrl || '',
            bonusRate: etagData.bonusRate, 
            amount: etagData.amount 
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchEtagType();
  }, [params.id, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      await ETagTypeServices.editEtagType(params.id, data);
      toast({ title: 'Etag Type updated successfully', description: `Etag Type ${data.name} was updated.` });
      router.push('/admin/etagtypes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <BackButton text='Back To Etag Types' link='/admin/etagtypes' />
      <h3 className='text-2xl mb-4'>Edit Etag Type</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Etag Type Name
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Enter Etag Type Name'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='imageUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Image URL
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Enter Image URL'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='bonusRate'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Bonus Rate
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Enter Bonus Rate'
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='amount'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Amount
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Enter Amount'
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className='w-full dark:bg-slate-800 dark:text-white'>Update Etag Type</Button>
        </form>
      </Form>
    </>
  );
};

export default EtagTypeEditPage;