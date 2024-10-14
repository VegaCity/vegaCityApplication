import * as z from 'zod';

export const customerFormSchema = z.object({
  customerName: z.string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name must not exceed 100 characters' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Name should only contain letters and spaces' }),

  phoneNumber: z.string()
    .regex(/^(0|\+84)(\s|-)?[1-9]\d{8}$/, { message: 'Invalid phone number format' }),

  address: z.string()
    .min(5, { message: 'Address must be at least 5 characters long' })
    .max(200, { message: 'Address must not exceed 200 characters' }),

  cccd: z.string()
    .regex(/^\d{12}$/, { message: 'CCCD must be exactly 12 digits' }),

  paymentMethod: z.enum(['cash', 'momo', 'vnpay', 'payos'], {
    required_error: 'Payment method is required',
    invalid_type_error: 'Invalid payment method selected',
  }),

  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required',
    invalid_type_error: 'Invalid gender selected',
  }),

  quantity: z.number()
    .int({ message: 'Quantity must be a whole number' })
    .min(1, { message: 'Quantity must be at least 1' })
    .max(100, { message: 'Quantity cannot exceed 100' }),

  price: z.number()
    .min(0, { message: 'Price cannot be negative' })
    .max(1000000000, { message: 'Price cannot exceed 1 billion' }),
});

export const etagFormSchema = z.object({
  etagStartDate: z.string()
    .refine((date) => {
      const startDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return startDate >= today;
    }, { message: "Start date must be today or a future date" }),

  etagEndDate: z.string()
    .refine((date) => {
      const endDate = new Date(date);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 5);
      return endDate <= maxDate;
    }, { message: "End date cannot be more than 5 years in the future" }),
}).refine((data) => {
  const startDate = new Date(data.etagStartDate);
  const endDate = new Date(data.etagEndDate);
  return endDate > startDate;
}, {
  message: "End date must be after start date",
  path: ["etagEndDate"],
});

///////// etag validation /////


export const formSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name must not exceed 100 characters'),
  
  etagCode: z.string()
    .regex(/^[A-Z0-9]{10}$/, 'ETag code must be 10 characters long and contain only uppercase letters and numbers'),
  
  phoneNumber: z.string()
    .regex(/^(\+84|0)[3|5|7|8|9][0-9]{8}$/, 'Invalid phone number format. Please use a valid Vietnamese phone number'),
  
  cccd: z.string()
    .regex(/^[0-9]{12}$/, 'CCCD must be exactly 12 digits'),
  
  birthday: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const minAge = 16;
      const maxAge = 100;
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= minAge && age <= maxAge;
    }, 'Birthday must be between 16 and 100 years ago'),
  
  gender: z.enum(['0', '1', '2'], {
    errorMap: () => ({ message: 'Please select a valid gender option' }),
  }),
  
  startDate: z.string()
    .refine((date) => new Date(date) >= new Date(), 'Start date must be today or in the future'),
  
  endDate: z.string(),

  status: z.number()
    .min(0, 'Status must be a non-negative number')
    .max(2, 'Status must not exceed 2'),
  
  imageUrl: z.string()
    .url('Invalid image URL format')
    .optional(),
  
  etagType: z.object({
    name: z.string()
      .min(1, 'ETag type name is required')
      .max(50, 'ETag type name must not exceed 50 characters'),
    bonusRate: z.number()
      .min(0, 'Bonus rate must be a non-negative number')
      .max(100, 'Bonus rate must not exceed 100%'),
    amount: z.number()
      .min(0, 'Amount must be a non-negative number')
      .max(1000000000, 'Amount must not exceed 1,000,000,000'),
  }),
  
  marketZone: z.object({
    name: z.string()
      .min(1, 'Market zone name is required')
      .max(100, 'Market zone name must not exceed 100 characters'),
    shortName: z.string()
      .min(1, 'Market zone short name is required')
      .max(20, 'Market zone short name must not exceed 20 characters'),
  }),
  
  wallet: z.object({
    balance: z.number()
      .min(0, 'Balance must be a non-negative number')
      .max(1000000000, 'Balance must not exceed 1,000,000,000'),
    balanceHistory: z.number()
      .min(0, 'Balance history must be a non-negative number')
      .max(1000000000, 'Balance history must not exceed 1,000,000,000'),
  }),
}).refine((data) => {
  const endDate = new Date(data.endDate);
  const startDate = new Date(data.startDate);
  return endDate > startDate;
}, {
  message: 'End date must be after the start date',
  path: ['endDate'],
});
//// form types
export type FormValues = z.infer<typeof formSchema>;
export type CustomerFormValues = z.infer<typeof customerFormSchema>;
export type EtagFormValues = z.infer<typeof etagFormSchema>;


/// interface
export interface EtagDetailPageProps {
  params: { id: string };
}

export interface GenerateEtagProps {
  params: { id: string };
}