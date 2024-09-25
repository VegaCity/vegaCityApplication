'use client';

import BackButton from '@/components/BackButton';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ETagTypeServices } from '@/components/services/etagtypeServices'; 
import { EtagType } from '@/types/etagtype'; 

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  imageUrl: z.string().min(1, { message: 'Image URL is required' }),
  bonusRate: z.number().min(0, { message: 'Bonus rate must be a non-negative number' }),
  amount: z.number().min(0, { message: 'Amount must be a non-negative number' }),
});

const EtagTypeCreatePage = () => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
      bonusRate: 0,
      amount: 0,
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const etagTypeData: EtagType = {
        name: data.name,
        imageUrl: data.imageUrl,
        bonusRate: data.bonusRate,
        amount: data.amount,
        id: ''
      };
      
      await ETagTypeServices.uploadEtagType(etagTypeData); 
      toast({
        title: 'Etag type has been created successfully',
        description: `Created Etag type: ${data.name}`,
      });
    } catch (error) {
      toast({
        title: 'Error creating Etag type',
        description:  'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <BackButton text='Back To Etag Types' link='/etagtypes' />
      <h3 className='text-2xl mb-4'>Create New Etag Type</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Name
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Enter name'
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
                    placeholder='Enter image URL'
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
                    type='number'
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Enter bonus rate'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    type='number'
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Enter amount'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className='w-full dark:bg-slate-800 dark:text-white'>
            Create Etag Type
          </Button>
        </form>
      </Form>
    </>
  );
};

export default EtagTypeCreatePage;