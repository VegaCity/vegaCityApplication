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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import posts from '@/data/posts';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import { Packages } from '@/types/package';
import { register } from 'module';
import { ZoneServices } from '@/components/services/zoneServices';

const zoneSchema = z.object({
  id: z.string().min(1, {
    message: 'Zone Id is required',
  }),
  marketZoneId: z.string().min(1, {
    message: 'Market Zone Id is required',
  }),
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  location: z.string().min(1, {
    message: 'Location is required',
  }),
  crDate: z.string().min(1, {
    message: 'Creation date is required',
  }),
  upsDate: z.string().min(1, {
    message: 'Update date is required',
  }),
  deflag: z.boolean().optional(), // Assuming deflag is optional
});

interface ZoneEditPageProps {
  params: {
    id: string;
  };
}

type FormValues = z.infer<typeof zoneSchema>;

const ZoneEditPage = ({ params }: ZoneEditPageProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // const pkg = packageList.find((pkg) => pkg.id === params.id);
  const form = useForm<FormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      id: '',
      marketZoneId: '',
      name: '',
      location: '',
      crDate: '',
      upsDate: '',
      deflag: false,
    },
  });

  useEffect(() => {
    setIsLoading(true);
    const fetchZones = async () => {
      try {
        setIsLoading(true);
        const response = await ZoneServices.getZoneById(params.id);
        const zoneData = response.data.data.zone;
        console.log(zoneData, 'Get package by Id'); // Log the response for debugging
        if(zoneData){
          form.reset({
            id: zoneData.id,
            marketZoneId: zoneData.marketZoneId,
            name: zoneData.name,
            location: zoneData.location,
            crDate: zoneData.crDate,
            upsDate: zoneData.upsDate,
            deflag: zoneData.deflag,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchZones();
  }, [params.id, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      // Assuming you have an update method in ZoneServices
      await ZoneServices.editZone(params.id, data);
      toast({
        title: 'Zone has been updated successfully',
        description: `Zone ${data.name} was updated!`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <BackButton text='Back To Zones' link='/admin/zones' />
      <h3 className='text-2xl mb-4'>Edit Zone</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
          <FormField
            control={form.control}
            disabled
            name='id'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Id Zone
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Id'
                    disabled
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
            control={form.control}
            disabled
            name='marketZoneId'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Id MarketZone
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='MarketZone Id'
                    disabled
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Zone Name
                </FormLabel>
                <FormControl>
                  <Textarea
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Enter Zone Name'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Location
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Enter Location'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            disabled
            name='crDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Create Date
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Create Date'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            disabled
            name='upsDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Update Date
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    placeholder='Update Date'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}


          <Button className='w-full dark:bg-slate-800 dark:text-white'>
            Update Zone
          </Button>
        </form>
      </Form>
    </>
  );
};

export default ZoneEditPage;
