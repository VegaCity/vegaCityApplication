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
  fullName: z.string(),
  etagCode: z.string(),
  phoneNumber: z.string(),
  cccd: z.string(),
  birthday: z.string().nullable(),
  gender: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.number(),
  imageUrl: z.string(),
  etagType: z.object({
    name: z.string(),
    bonusRate: z.number(),
    amount: z.number(),
  }),
  marketZone: z.object({
    name: z.string(),
    shortName: z.string(),
  }),
  wallet: z.object({
    balance: z.number(),
    balanceHistory: z.number(),
  }),
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
      fullName: '',
      etagCode: '',
      phoneNumber: '',
      cccd: '',
      birthday: '',
      gender: 0,
      startDate: '',
      endDate: '',
      status: 0,
      imageUrl: '',
      etagType: {
        name: '',
        bonusRate: 0,
        amount: 0,
      },
      marketZone: {
        name: '',
        shortName: '',
      },
      wallet: {
        balance: 0,
        balanceHistory: 0,
      },
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
          fullName: etagData.fullName,
          etagCode: etagData.etagCode,
          phoneNumber: etagData.phoneNumber,
          cccd: etagData.cccd,
          birthday: etagData.birthday,
          gender: etagData.gender,
          startDate: etagData.startDate,
          endDate: etagData.endDate,
          status: etagData.status,
          imageUrl: etagData.imageUrl,
          etagType: {
            name: etagData.etagType?.name || 'N/A',
            bonusRate: etagData.etagType?.bonusRate || 0,
            amount: etagData.etagType?.amount || 0,
          },
          marketZone: {
            name: etagData.marketZone?.name || 'N/A',
            shortName: etagData.marketZone?.shortName || 'N/A',
          },
          wallet: {
            balance: etagData.wallet?.balance || 0,
            balanceHistory: etagData.wallet?.balanceHistory || 0,
          },
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusString = (status: number) => {
    switch (status) {
      case 0:
        return 'Inactive';
      case 1:
        return 'Active';
      default:
        return 'Blocked';
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

          {/* Customer Information */}
          <h4 className="text-xl font-semibold mt-6 mb-4">Customer Information</h4>
          <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
            <FormItem className="md:w-1/2">
              <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                Full Name
              </FormLabel>
              <FormControl>
                <Input
                  className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                  {...form.register('fullName')}
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem className="md:w-1/2">
              <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                Etag Code
              </FormLabel>
              <FormControl>
                <Input
                  className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                  {...form.register('etagCode')}
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
            <FormItem className="md:w-1/2">
              <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                Phone Number
              </FormLabel>
              <FormControl>
                <Input
                  className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                  {...form.register('phoneNumber')}
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem className="md:w-1/2">
              <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                CCCD
              </FormLabel>
              <FormControl>
                <Input
                  className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                  {...form.register('cccd')}
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <div className="md:flex md:space-x-4 space-y-4 md:space-y-0 mb-11">
            <FormItem className="md:w-1/2">
              <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                Birthday
              </FormLabel>
              <FormControl>
                <Input
                  className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                  value={formatDate(etag.birthday)}
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem className="md:w-1/2">
              <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                Gender
              </FormLabel>
              <FormControl>
                <Input
                  className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                  value={getGenderString(etag.gender)}
                  readOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          {/* ETag Information */}
          <div className='mt-10'>
            <h4 className="text-xl font-semibold mt-24 mb-4">ETag Information</h4>
            <div className="md:flex md:space-x-4 space-y-4 md:space-y-0 mt-6">
              <FormItem className="md:w-1/2">
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  Start Date
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    value={formatDate(etag.startDate)}
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem className="md:w-1/2">
                <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                  End Date
                </FormLabel>
                <FormControl>
                  <Input
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    value={formatDate(etag.endDate)}
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <FormItem className='md:w-1/3'>
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
          </div>
          {/* ETag Type Information */}
          <h4 className="text-xl font-semibold mt-6 mb-4">ETag Type Information</h4>
          <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
            <FormItem className="md:w-1/2">
              <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                ETag Type Name
              </FormLabel>
              <FormControl>
                <Input
                  className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                  {...form.register('etagType.name')}
                  readOnly
                />
              </FormControl>
            </FormItem>

            <FormItem className="md:w-1/2">
              <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                Amount
              </FormLabel>
              <FormControl>
                <Input
                  className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                  {...form.register('etagType.amount')}
                  readOnly
                />
              </FormControl>
            </FormItem>
          </div>
          {/* Wallet Information */}
          <h4 className="text-xl font-semibold mt-6 mb-4">Wallet Information</h4>
          <div className="md:flex md:space-x-4 space-y-4 md:space-y-0">
            <FormItem className="md:w-1/2">
              <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                Balance
              </FormLabel>
              <FormControl>
                <Input
                  className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                  {...form.register('wallet.balance')}
                  readOnly
                />
              </FormControl>
            </FormItem>
            <FormItem className="md:w-1/2">
              <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                Balance History
              </FormLabel>
              <FormControl>
                <Input
                  className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                  {...form.register('wallet.balanceHistory')}
                  readOnly
                />
              </FormControl>
            </FormItem>
          </div>
        </form>
      </Form>
    </>
  );
};

export default EtagDetailPage;