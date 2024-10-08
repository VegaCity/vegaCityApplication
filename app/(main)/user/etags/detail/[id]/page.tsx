'use client';

import BackButton from '@/components/BackButton';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormItem, FormLabel, FormMessage, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import { ETagServices } from '@/components/services/etagService';
import { ETag } from '@/types/etag';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import paymentService from '@/components/services/paymentService'; 

const formSchema = z.object({
  fullName: z.string(),
  etagCode: z.string(),
  phoneNumber: z.string(),
  cccd: z.string(),
  birthday: z.string().nullable(),
  gender: z.string(),
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
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  const handleChargeMoney = async (data: { etagCode: string, chargeAmount: number, cccd: string, paymentType: string }) => {
    try {
      const response = await ETagServices.chargeMoney({
        etagCode: data.etagCode,
        chargeAmount: data.chargeAmount,
        cccd: data.cccd,
        paymentType: data.paymentType,
      });
  
      console.log('Complete response:', JSON.stringify(response, null, 2));
  
      if (response.status === 200) {
        const { data: responseData } = response;
  
        if (responseData && responseData.data) {
          const { urlDirect, key, invoiceId } = responseData.data; 
  
          if (urlDirect) {
            console.log('Redirecting to payment URL:', urlDirect);
  
            
            const paymentData = {
              invoiceId: invoiceId,
              key: key,
              urlDirect: urlDirect,
              urlIpn: responseData.data.urlIpn, 
            };
  
            let paymentResponse;
            if (data.paymentType === 'momo') {
              paymentResponse = await paymentService.momo(paymentData);
            } else if (data.paymentType === 'vnpay') {
              paymentResponse = await paymentService.vnpay(paymentData);
            } else {
              throw new Error('Invalid payment method');
            }
  
            
            if (paymentResponse && paymentResponse.data) {
              
              console.log('Payment processed successfully:', paymentResponse);
            } else {
              console.error('Payment response is invalid.');
              toast({
                title: 'Error',
                description: 'Payment response is invalid. Please try again.',
                variant: 'destructive',
              });
            }
  
            // Redirect to the initial payment URL if needed
            window.location.href = urlDirect; 
          } else {
            console.error('Payment URL not found in the response data.');
            toast({
              title: 'Error',
              description: 'Payment URL not found. Please try again later.',
              variant: 'destructive',
            });
          }
        } else {
          console.error('Invalid response data structure.');
          toast({
            title: 'Error',
            description: 'Invalid response data structure.',
            variant: 'destructive',
          });
        }
      } else {
        console.error('Unexpected response status:', response.status);
        toast({
          title: 'Error',
          description: `Failed to charge money. Status code: ${response.status}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error charging money:', error);
      toast({
        title: 'Error',
        description: 'Failed to charge money. Please check your details and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPopupOpen(false);
    }
  };
  
  
  
  

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      etagCode: '',
      phoneNumber: '',
      cccd: '',
      birthday: '',
      gender: '0',
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
  const formCharge = useForm({
    defaultValues: {
      etagCode: form.getValues('etagCode'),
      chargeAmount: 0,
      cccd: form.getValues('cccd'),
      paymentType: 'cash', 
    },
  });
  // date
  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };
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
          birthday: formatDateForInput(etagData.birthday),
          startDate: formatDateForInput(etagData.startDate),
          endDate: formatDateForInput(etagData.endDate),
          gender: etagData.gender.toString(),
          status: etagData.status,
          imageUrl: etagData.imageUrl,
          etagType: {
            name: etagData.etagType?.name || 'N/A',
            bonusRate: etagData.etagType?.bonusRate || 0,
            amount: etagData.etagType?.amount || 0,
          },
          // marketZone: {
          //   name: etagData.marketZone?.name || 'N/A',
          //   shortName: etagData.marketZone?.shortName || 'N/A',
          // },
          wallet: {
            balance: etagData.wallet?.balance || 0,
            balanceHistory: etagData.wallet?.balanceHistory || 0,
          },
        });
        formCharge.reset({
          etagCode: etagData.etagCode,
          chargeAmount: 0,
          cccd: etagData.cccd,
          paymentType: 'cash',
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
        return 'Block';
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
  const handleActivateEtag = async () => {
    if (!etag) return;

    if (isEditing) {
      setIsConfirming(true);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleConfirmActivation = async () => {
    if (!etag) return;

    setIsLoading(true);
    try {
      const formData = form.getValues();
      const activateData = {
        cccd: formData.cccd,
        name: formData.fullName,
        phone: formData.phoneNumber,
        gender: formData.gender,
        birthday: formData.birthday || new Date().toISOString(),
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await ETagServices.activateEtag(etag.id, activateData);
      toast({
        title: "ETag Activated",
        description: "The ETag has been successfully activated.",
      });

      // Optionally refresh ETag data here
    } catch (err) {
      toast({
        title: "Activation Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleCancelActivation = () => {
    setIsEditing(false);
    setIsConfirming(false);
    form.reset();
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
              alt={etag.fullName || 'Image'}
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
                  readOnly={!isEditing}
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
                  readOnly={!isEditing}
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
                  readOnly={!isEditing}
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
                  type='date'
                  className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                  {...form.register('birthday')}
                  readOnly={!isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="md:w-1/2">
                  <FormLabel className='uppercase text-xs font-bold text-zinc-500 dark:text-white'>
                    Gender
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)} 
                    defaultValue={field.value}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Female</SelectItem>
                      <SelectItem value="1">Male</SelectItem>
                      <SelectItem value="2">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    type='date'
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    {...form.register('startDate')}
                    readOnly={!isEditing}
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
                    type='date'
                    className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0'
                    {...form.register('endDate')}
                    readOnly={!isEditing}
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
          <h4 className="text-xl font-semibold mt-16 mb-4">Wallet Information</h4>
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
          {etag.status === 1 && (
        <div className="flex justify-end mt-6 pr-4 pb-4 space-x-4">
          <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogTrigger asChild>
          <Button>Charge Money</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Charge Money</DialogTitle>
            <DialogDescription>
              Enter the necessary details to charge money.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={formCharge.handleSubmit(handleChargeMoney)}>
            <div className="space-y-4">
              <label>Etag Code</label>
              <Input type="text" {...formCharge.register('etagCode')} readOnly />

              <label>Amount</label>
              <Input type="number" {...formCharge.register('chargeAmount')} placeholder="Enter amount" required />

              <label>CCCD</label>
              <Input type="text" {...formCharge.register('cccd')} readOnly />

              <label>Payment Type</label>
              <Select
          defaultValue={formCharge.getValues('paymentType')}
          onValueChange={(value) => formCharge.setValue('paymentType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Payment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="momo">MoMo</SelectItem>
            <SelectItem value="vnpay">VnPay</SelectItem>
          </SelectContent>
        </Select>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button type="submit">Submit</Button>
              <Button variant="outline" onClick={() => setIsPopupOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
        </div>
      )}

      {/* Popup charge money */}
    
        </form>
      </Form>
      <div className="flex justify-end mt-6 pr-4 pb-4 space-x-4">
        {etag && etag.status === 0 && !isConfirming && (
          <Button className='mt-12 px-6 py-2' onClick={handleActivateEtag} disabled={isLoading}>
            {isLoading ? "Processing..." : (isEditing ? "Confirm" : "Activate ETag")}
          </Button>
        )}
        {isConfirming && (
          <>
            <Button className='mt-12 px-6 py-2' onClick={handleConfirmActivation} disabled={isLoading}>
              {isLoading ? "Activating..." : "Confirm Activation"}
            </Button>
            <Button className='mt-12 px-6 py-2' onClick={handleCancelActivation} disabled={isLoading} variant="outline">
              Cancel
            </Button>
          </>
        )}
        
      </div>
    </>
  );
};

export default EtagDetailPage;