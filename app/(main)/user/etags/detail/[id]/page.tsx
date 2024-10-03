'use client';

import BackButton from '@/components/BackButton';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import { ETagServices } from '@/components/services/etagService';
import { ETag } from '@/types/etag';
import Image from 'next/image';
// Define validation schema with zod (optional for detail view)
const formSchema = z.object({
  fullname: z.string(),
  etagCode: z.string(),
  phoneNumber: z.string(),
  cccd: z.string(),
  birthday: z.string(),
  gender: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.number(),
  imageUrl: z.string(),
});

interface EtagDetailPageProps {
  params: { id: string };
}

// Type for form values inferred from the schema
type FormValues = z.infer<typeof formSchema>;

const EtagDetailPage = ({ params }: EtagDetailPageProps) => {
  const { toast } = useToast();
  const [etag, setEtag] = useState<ETag | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: '',
      etagCode: '',
      phoneNumber: '',
      cccd: '',
      birthday: '',
      gender: 0,
      startDate: '',
      endDate: '',
      status: 0,
      imageUrl: '',
    },
  });

  useEffect(() => {
    const fetchEtag = async () => {
      setIsLoading(true);
      try {
        const response = await ETagServices.getETagById(params.id);
        const etagData = response.data.data.etag;
        setEtag(etagData);
        form.reset({
          fullname: etagData.fullname,
          etagCode: etagData.etagCode,
          phoneNumber: etagData.phoneNumber,
          cccd: etagData.cccd,
          birthday: etagData.birthday,
          gender: etagData.gender, // Gender được lưu dưới dạng số (0, 1, 2)
          startDate: etagData.startDate,
          endDate: etagData.endDate,
          status: etagData.status,
          imageUrl: etagData.imageUrl, // Thêm trường imageUrl
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEtag();
  }, [params.id, form]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!etag) return <div>No Etag found</div>;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusString = (status: number) => {
    switch (status) {
      case 0:
        return 'Active';
      case 1:
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  const getGenderString = (gender: number) => {
    switch (gender) {
      case 0:
        return 'Male';
      case 1:
        return 'Female';
      case 2:
        return 'Other';
      default:
        return 'Unknown';
    }
  };
  const validImageUrl = etag.imageUrl && etag.imageUrl.startsWith('http') ? etag.imageUrl : '/default-image.png';
  return (
    <>
      <BackButton text='Back To Etag List' link='/user/etags' />
      <h3 className='text-2xl mb-4'>Etag Detail</h3>
      <Form {...form}>
        <form className='space-y-4'>
          <div className="relative w-full h-48">
            <Image
              src={validImageUrl}
              alt={etag.fullname || 'Image'}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>

          <FormItem>
            <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
              Full Name
            </FormLabel>
            <FormControl>
              <Input
                className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                placeholder=''
                {...form.register('fullname')}
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
              Etag Code
            </FormLabel>
            <FormControl>
              <Input
                className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                placeholder='Enter Etag Code'
                {...form.register('etagCode')}
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
              Phone Number
            </FormLabel>
            <FormControl>
              <Input
                className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                placeholder='Enter Phone Number'
                {...form.register('phoneNumber')}
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
              CCCD
            </FormLabel>
            <FormControl>
              <Input
                className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                placeholder='Enter CCCD'
                {...form.register('cccd')}
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
              Birthday
            </FormLabel>
            <FormControl>
              <Input
                className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                placeholder='Enter Birthday'
                value={formatDate(etag.birthday)}
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
              Gender
            </FormLabel>
            <FormControl>
              <Input
                className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                placeholder='Enter Gender'
                value={getGenderString(etag.gender)}
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
              Start Date
            </FormLabel>
            <FormControl>
              <Input
                className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                placeholder='Enter Start Date'
                value={formatDate(etag.startDate)}
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
              End Date
            </FormLabel>
            <FormControl>
              <Input
                className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                placeholder='Enter End Date'
                value={formatDate(etag.endDate)}
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
              Status
            </FormLabel>
            <FormControl>
              <Input
                className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                value={getStatusString(etag.status)}
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </form>
      </Form>
    </>
  );
};

export default EtagDetailPage;
