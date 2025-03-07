import { requestWithdrawMoney } from "./../components/services/withdrawServices";
import * as z from "zod";

export const customerFormSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: "Full name must include at least 2 characters" })
    .max(100, { message: "Full name does not exceed 100 characters" })
    .regex(/^[\p{L}\s]+$/u, {
      message: "Name have not special character and space!",
    }),

  phoneNumber: z.string().regex(/^(0|\+84)(\s|-)?[1-9]\d{8}$/, {
    message: "Phone number is invalid. Please use Vietnam phone number!",
  }),

  cccdPassport: z
    .string()
    .regex(
      /(^\d{12}$)|(^[A-Z]\d{7}$)/,
      "CCCD must include 12 digits and Passport must include first character and 7 digits"
    ),

  paymentMethod: z.enum(["Cash", "Momo", "VnPay", "PayOS", "ZaloPay"], {
    required_error: "Payment method is required!",
    invalid_type_error: "Your payment method is invalid!",
  }),
  quantity: z
    .number()
    .int({ message: "Quality must be positive number!" })
    .min(1, { message: "Quantity must at least 1!" })
    .max(20, { message: "Quantity must below 20!" }),

  price: z
    .number()
    .min(1000, { message: "Price must at least 1.000 VND" })
    .max(10000000, { message: "Price does not exceed 10 millions VND" }),
  email: z.string().email("Your email is invalid! Please try again!"),
  isAdult: z.boolean().default(true),
});
// .refine(
//   (data) => {
//     if (data.quantity <= 1) {
//       return false; //invalid
//     }
//   },
//   {
//     message:
//       "If quantity is little than 1, then the information is required!",
//     path: ["quantity"],
//   }
// );

export const etagFormSchema = z
  .object({
    etagStartDate: z.string().refine(
      (date) => {
        const startDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return startDate >= today;
      },
      { message: "The begin date must be today or the following day!" }
    ),

    etagEndDate: z.string().refine(
      (date) => {
        const endDate = new Date(date);
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 5);
        return endDate <= maxDate;
      },
      { message: "The end date does not exceed 5 years!" }
    ),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.etagStartDate);
      const endDate = new Date(data.etagEndDate);
      return endDate > startDate;
    },
    {
      message: "The end date must higher than the begin date",
      path: ["etagEndDate"],
    }
  );
export interface GenerateEtag {
  quantity: number;
  etagTypeId: string;
  generateEtagRequest: {
    startDate: Date;
    endDate: Date;
  };
}
export const etagEditFormSchema = z
  .object({
    cusName: z
      .string()
      .min(2, { message: "Full name must include at least 2 characters" })
      .max(100, { message: "Full name does not exceed 100 characters" })
      .regex(/^[\p{L}\s]+$/u, {
        message: "Name have not special character and space!",
      }),

    phoneNumber: z
      .string()
      .regex(
        /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
        "Phone number is invalid. Please use Vietnam phone number!"
      ),
    isAdult: z.boolean(),
    // cccdPassport: z
    //   .string()
    //   .regex(/^[0-9]{12}$/, "CCCD phải có đúng 12 chữ số"),
    cusEmail: z.string().email("Your email is invalid! Please try again!"),
    cusCccdpassport: z
      .string()
      .regex(
        /(^\d{12}$)|(^[A-Z]\d{7}$)/,
        "CCCD must include 12 digits and Passport must include first character and 7 digits"
      ),
    customer: z.object({
      fullName: z
        .string()
        .min(2, { message: "Full name must include at least 2 characters" })
        .max(100, { message: "Full name does not exceed 100 characters" })
        .regex(/^[\p{L}\s]+$/u, {
          message: "Name have not special character and space!",
        }),
    }),
    birthday: z.string().refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const minAge = 16;
      const maxAge = 100;
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= minAge && age <= maxAge;
    }, "Ngày sinh phải từ 16 đến 100 năm trước"),

    gender: z.enum(["Male", "Female", "Other"], {
      required_error: "Giới tính là bắt buộc",
      invalid_type_error: "Giới tính không hợp lệ",
    }),

    startDate: z
      .string()
      .refine(
        (date) => new Date(date) >= new Date(),
        "The begin date must be today or the following day!"
      ),

    endDate: z.string(),

    status: z
      .number()
      .min(0, "Status does not below 0")
      .max(2, "Status does not exceed 2"),

    imageUrl: z.string().url("Your URL image is invalid").optional(),

    // etagType: z.object({
    //   name: z
    //     .string()
    //     .min(1, "Tên loại ETag là bắt buộc")
    //     .max(50, "Tên loại ETag không được vượt quá 50 ký tự"),
    //   bonusRate: z
    //     .number()
    //     .min(0, "Tỷ lệ thưởng phải là số không âm")
    //     .max(100, "Tỷ lệ thưởng không được vượt quá 100%"),
    //   amount: z
    //     .number()
    //     .min(0, "Số tiền phải là số không âm")
    //     .min(1000, { message: "Price must at least 1.000 VND" })
    //     .max(10000000, { message: "Price does not exceed 10 triệu VND" }),
    // }),
    vcardId: z.string().optional(),
    wallets: z.array(
      z.object({
        balance: z.number(),
        balanceHistory: z.number(),
      })
    ),
    marketZone: z.object({
      name: z
        .string()
        .min(1, "Tên khu vực thị trường là bắt buộc")
        .max(100, "Tên khu vực thị trường không được vượt quá 100 ký tự"),
      shortName: z
        .string()
        .min(1, "Tên viết tắt khu vực thị trường là bắt buộc")
        .max(
          20,
          "Tên viết tắt khu vực thị trường không được vượt quá 20 ký tự"
        ),
    }),
  })
  .refine(
    (data) => {
      const endDate = new Date(data.endDate);
      const startDate = new Date(data.startDate);
      return endDate > startDate;
    },
    {
      message: "The end date must higher than the begin date",
      path: ["endDate"],
    }
  );

// Utility function to check if the date is over 18 years ago
const isOver18 = (date: string) => {
  const today = new Date();
  const birthDate = new Date(date);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // Adjust the age if the current month and day are before the birth month/day
  return (
    age > 18 ||
    (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
  );
};

export const userAccountFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must include at least 2 characters" })
    .max(100, { message: "Full name does not exceed 100 characters" })
    .regex(/^[\p{L}\s]+$/u, {
      message: "Name have not special character and space!",
    }),
  address: z
    .string()
    .min(5, { message: "Address at least 5 characters" })
    .max(200, { message: "Address at least 5 characters" }),
  description: z.string().nullable(),
  phoneNumber: z
    .string()
    .regex(
      /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
      "Phone number is invalid. Please use Vietnam phone number!"
    ),
  birthday: z
    .string()
    .min(1, { message: "Your birthday is required!" })
    .refine(isOver18, { message: "Customer must be above 18 years old!" })
    .nullable(),
  gender: z.number().min(0, {
    message: "Gender is required!",
  }),
  cccdPassport: z
    .string()
    .regex(
      /(^\d{12}$)|(^[A-Z]\d{7}$)/,
      "CCCD must include 12 digits and Passport must include first character and 7 digits"
    ),
  imageUrl: z.string().nullable(), //does not effect
  status: z.string().min(1, "Status is required!"),
});

export const createUserAccountFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must include at least 2 characters" })
    .max(100, { message: "Full name does not exceed 100 characters" })
    .regex(/^[\p{L}\s]+$/u, {
      message: "Name have not special character and space!",
    }),
  phoneNumber: z
    .string()
    .regex(
      /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
      "Phone number is invalid. Please use Vietnam phone number!"
    ),
  cccdPassport: z
    .string()
    .regex(
      /(^\d{12}$)|(^[A-Z]\d{7}$)/,
      "CCCD must include 12 digits and Passport must include first character and 7 digits"
    ),
  address: z.string().min(1, { message: "Address is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email format" }),
  description: z.string().optional(),
  roleName: z.string().min(1, { message: "Role Name is required" }),
  registerStoreType: z.number().nullable(),
});

export const serviceStoreFormSchema = z.object({
  name: z.string().min(1, "Name must at least one character"),
  storeId: z.string().min(1, "StoreId is required!"),
  price: z
    .number()
    .min(1000, { message: "Price must at least 1.000 VND" })
    .max(10000000, { message: "Price does not exceed 10 millions VND" }),
});

export const editServiceStoreFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  price: z
    .number()
    .min(1000, { message: "Price must at least 1.000 VND" })
    .max(10000000, { message: "Price does not exceed 10 millions VND" }),
});

export const loginFormSchema = z.object({
  email: z.string().email("Your Email is invalid!"),
  // password: z
  //   .string()
  //   .regex(
  //     /^[A-Z](?=.*\d)[\w, \W]{6,40}$/,
  //     "Your password must minimium 6 characters"
  //   ), //password minimium 6 characters and Uppercase first character and one digit in
  password: z
    .string()
    .min(5, "Your Password must contain at least 5 characters!"),
});

export const chargeFormSchema = z.object({
  etagCode: z
    .string()
    .regex(
      /^[A-Z0-9]{10}$/,
      "Mã ETag phải có 10 ký tự và chỉ chứa chữ cái in hoa và số"
    ),
  chargeAmount: z
    .number()
    .positive({ message: "Số tiền nạp phải lớn hơn 0" })
    .min(10000, { message: "Số tiền nạp tối thiểu là 10.000 VND" })
    .max(10000000, { message: "Số tiền nạp tối đa là 10.000.000 VND" }),
  cccdPassport: z
    .string()
    .regex(
      /(^\d{12}$)|(^[A-Z]\d{7}$)/,
      "CCCD must include 12 digits and Passport must include first character and 7 digits"
    ),
  paymentType: z.enum(["Cash", "Momo", "VnPay", "PayOS"], {
    required_error: "Payment method is required!",
    invalid_type_error: "Your payment method is invalid!",
  }),
  startDate: z
    .string()
    .refine(
      (date) => new Date(date) >= new Date(),
      "The begin date must be today or the following day!"
    ),
  endDate: z.string(),
});

export const storeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tên store là bắt buộc")
    .max(50, "Tên store không được vượt quá 50 ký tự"),
  address: z
    .string()
    .min(5, { message: "Address at least 5 characters" })
    .max(200, { message: "Address at least 5 characters" }),
  phoneNumber: z
    .string()
    .regex(
      /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
      "Số điện thoại không hợp lệ. Vui lòng sử dụng số điện thoại Việt Nam hợp lệ"
    ),
  shortName: z
    .string()
    .min(2, { message: "Tên viết tắt phải có ít nhất 2 ký tự" })
    .max(10, { message: "Tên viết tắt không được vượt quá 10 ký tự" })
    .nullable(),
  email: z.string().email("Your email is invalid!"),
  description: z.string().min(1).nullable(),
  storeType: z.coerce.number({
    required_error: "Store Type is required!",
    invalid_type_error: "Store Type must be a number!",
  }),
  status: z.coerce.number({
    required_error: "Store Status is required!",
    invalid_type_error: "Store Status must be a number!",
  }),
});

export const etagTypeFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL" }),
  bonusRate: z.coerce.number({
    required_error: "Bonus Rate is required!",
    invalid_type_error: "Price must be a number!",
  }),
  amount: z.coerce.number({
    required_error: "Amount is required!",
    invalid_type_error: "Amount must be a number!",
  }),
});

export const userApproveFormSchema = z.object({
  locationZone: z.string().min(1, "Location zone is invalid"),
  storeName: z.string().min(1, "Store name is invalid"),
  storeType: z.number(),
  storeTransferRate: z
    .number()
    .min(0, "Store Transfer Rate must above 0!")
    .max(100, "Store Transfer Rate must below 100!"),
  storeAddress: z.string().min(1, "Store address is invalid"),
  phoneNumber: z.string().regex(/^(0|\+84)(\s|-)?[1-9]\d{8}$/, {
    message: "Phone number is invalid!",
  }),
  storeEmail: z.string().email("Your email is invalid!"),
  approvalStatus: z.string().min(1, "Approve status is invalid!"),
});

export const userReAssignEmailFormSchema = z.object({
  email: z.string().email("Your email is invalid! Please try again!"),
});

export const editPackageFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must include at least 2 characters" })
    .max(100, { message: "Name does not exceed 100 characters" }),
  // .regex(/^(.*[()]).*$/u, {
  //   message: "Name must have (...day)!",
  // }),

  price: z.coerce
    .number()
    .min(100000, { message: "Price must at least 100.000 VND" })
    .max(10000000, { message: "Price does not exceed 10 millions VND" }),
  description: z.string().min(1).nullable(),
  imageUrl: z.string().nullable(),
  duration: z.coerce.number().min(1, "Duration is required!"),
});

export const createPackageFormSchema = z
  .object({
    type: z.string().min(1, "Package's type is required!"),
    name: z
      .string()
      .min(2, { message: "Name must include at least 2 characters" })
      .max(100, { message: "Name does not exceed 100 characters" }),
    // .regex(/^.+\(\s\)$/u, {
    //   message: "Name is only string!",
    // })
    imageUrl: z.string().nullable(),
    description: z.string().min(1).nullable(),
    price: z
      .number()
      .min(100000, { message: "Price must at least 100.000 VND" })
      .max(10000000, { message: "Price does not exceed 10 millions VND" }),
    duration: z
      .number()
      .min(1, "At least 1 day!")
      .max(365, "Day must below 365 days!"),
    zoneId: z.string().min(1),
    walletTypeId: z.string(),
    moneyStart: z.number().min(100000, "Money start at least 100.000 VND"),
  })
  .refine(
    (data) => {
      let price = data.price; //200
      let moneyStart = data.moneyStart; //240
      let moneyStartSpecificBonus = price + price * 0.2; //Price * 20% bonus to Money Start
      let moneyStartServiceBonus = price + price * 0.05; //Price * 5% bonus to Money Start

      if (data.type === "SpecificPackage") {
        return moneyStart >= moneyStartSpecificBonus;
      } else if (data.type === "ServicePackage") {
        return moneyStart >= moneyStartServiceBonus;
      }
    },
    {
      message:
        "Money Start must higher 5% Price (if Service Package)! - Higher than 20% from Price (if Specific Package)! Please refill Price field!",
      path: ["moneyStart"],
    }
  );

export const createPromotionFormSchema = z
  .object({
    promotionCode: z.string().min(1, "Promotion code is required!"),
    name: z.string().min(1, "Name is required!"),
    description: z.string().min(1).nullable(),
    maxDiscount: z
      .number()
      .max(1000000000, "Max discount does not exceed 10 millions VND")
      .nullable(),
    quantity: z.number().max(100, "Quantity does not exceed 100").nullable(),
    discountPercent: z
      .number()
      .max(1000000000, "Discount percent does not exceed 10 millions VND")
      .nullable(),
    requireAmount: z
      .number()
      .min(100000, "Require amount does not below 100.000 VND")
      .max(1000000000, "Require amount does not exceed 10 millions VND")
      .nullable(),
    startDate: z
      .string()
      .refine(
        (date) => new Date(date) >= new Date(),
        "The begin date must be the following day!"
      ),
    endDate: z.string(),
    status: z.string().nullable(),
  })
  .refine(
    (data) => {
      const endDate = new Date(data.endDate);
      const startDate = new Date(data.startDate);
      return endDate > startDate;
    },
    {
      message: "The end date must higher than the begin date!",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.maxDiscount === null || data.requireAmount === null) {
        return true;
      }
      return data.maxDiscount <= data.requireAmount;
    },
    {
      message: "Max Discount must below Require Amount!",
      path: ["maxDiscount"],
    }
  );

export const editPromotionFormSchema = z
  .object({
    promotionCode: z.string().min(1, "Promotion code is required!"),
    name: z.string().min(1, "Name is required!"),
    description: z.string().min(1).nullable(),
    maxDiscount: z
      .number()
      .max(1000000000, "Max discount does not exceed 10 millions VND")
      .nullable(),
    quantity: z.number().max(100, "Quantity does not exceed 100").nullable(),
    discountPercent: z
      .number()
      .max(1000000000, "Discount percent does not exceed 10 millions VND")
      .nullable(),
    requireAmount: z
      .number()
      .min(100000, "Require amount does not below 100.000 VND")
      .max(1000000000, "Require amount does not exceed 10 millions VND")
      .nullable(),
    startDate: z
      .string()
      .refine(
        (date) => new Date(date) >= new Date(),
        "The begin date must be the following day!"
      ),
    endDate: z.string(),
  })
  .refine(
    (data) => {
      const endDate = new Date(data.endDate);
      const startDate = new Date(data.startDate);
      return endDate > startDate;
    },
    {
      message: "The end date must higher than the begin date!",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (data.maxDiscount === null || data.requireAmount === null) {
        return true;
      }
      return data.maxDiscount <= data.requireAmount;
    },
    {
      message: "Max Discount must below Require Amount!",
      path: ["maxDiscount"],
    }
  );

export const userSessionFormSchema = z
  .object({
    startDate: z
      .string()
      .refine(
        (date) => new Date(date) >= new Date(),
        "The begin date must be today or the following day!"
      ),
    endDate: z.string(),
    userId: z.string().min(1, { message: "User is required" }),
    zoneId: z.string().min(1, { message: "Zone is required" }),
  })
  .refine(
    (data) => {
      const endDate = new Date(data.endDate);
      const startDate = new Date(data.startDate);
      return endDate > startDate;
    },
    {
      message: "The end date must higher than the begin date!",
      path: ["endDate"],
    }
  );
export const requestWithdrawMoneyFormSchema = z.object({
  amount: z
    .number()
    .min(10000, { message: "Amount must at least 50.000 VND" })
    .max(5000000, { message: "Amount does not exceed 5 millions VND" }),
});

const MAX_HOURS = 24;
const MAX_MINUTES = 1440;

export const editProductStoreServiceFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Product name must be at least 2 characters" })
      .max(50, { message: "Product name does not exceed 50 characters" }),
    price: z
      .number()
      .min(0, { message: "Price must be greater than 0 VND" })
      .max(10000000, { message: "Price does not exceed 10 millions VND" }),
    quantity: z.coerce
      .number()
      .min(1, { message: "Quantity must be at least 1" })
      .max(1000, { message: "Quantity does not exceed 1000" }),
    duration: z.coerce
      .number()
      .min(1, { message: "Duration must be at least 1" }),
    unit: z.string().min(1, { message: "Unit is required" }),
    imageUrl: z.nullable(z.string()),
  })
  .refine(
    (data) => {
      if (data.unit === "Hour") {
        const overHours = data.duration <= MAX_HOURS;
        return overHours;
      }
      return true;
    },
    {
      message: "Duration can not over 24 hours!",
      path: ["duration"],
    }
  )
  .refine(
    (data) => {
      if (data.unit === "Minute") {
        const overMinute = data.duration <= MAX_MINUTES;
        return overMinute;
      }
      return true;
    },
    {
      message: "Duration can not over 1440 minutes!",
      path: ["duration"],
    }
  );

export type UserSessionFormValues = z.infer<typeof userSessionFormSchema>;
export type EditPromotionFormValues = z.infer<typeof editPromotionFormSchema>;
export type CreatePromotionFormValues = z.infer<
  typeof createPromotionFormSchema
>;
export type CreatePackageFormValues = z.infer<typeof createPackageFormSchema>;
export type EditPackageFormValues = z.infer<typeof editPackageFormSchema>;
export type ChargeFormValues = z.infer<typeof chargeFormSchema>;
export type CreateUserAccountFormValues = z.infer<
  typeof createUserAccountFormSchema
>;
export type CustomerFormValues = z.infer<typeof customerFormSchema>;
export type EtagFormValues = z.infer<typeof etagFormSchema>;
export type UserAccountFormValues = z.infer<typeof userAccountFormSchema>;
export type loginFormValues = z.infer<typeof loginFormSchema>;
export type ServiceStoreFormValues = z.infer<typeof serviceStoreFormSchema>;
export type EditServiceStoreFormValues = z.infer<
  typeof editServiceStoreFormSchema
>;
export type StoreFormValues = z.infer<typeof storeFormSchema>;
export type EtagTypeFormValues = z.infer<typeof etagTypeFormSchema>;
export type EtagEditFormValues = z.infer<typeof etagEditFormSchema>;
export type UserApproveFormValues = z.infer<typeof userApproveFormSchema>;
export type UserReAssignEmailValues = z.infer<
  typeof userReAssignEmailFormSchema
>;
export type RequestWithdrawMoneyValues = z.infer<
  typeof requestWithdrawMoneyFormSchema
>;
export type EditProductStoreServiceValues = z.infer<
  typeof editProductStoreServiceFormSchema
>;

export interface PackageItemDetailPageProps {
  params: { id: string };
}
export interface PackageItemEditPageProps {
  params: { id: string };
}

export interface GenerateEtagProps {
  params: { id: string };
}
