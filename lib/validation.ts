import * as z from "zod";

export const customerFormSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: "Tên phải có ít nhất 2 ký tự" })
    .max(100, { message: "Tên không được vượt quá 100 ký tự" })
    .regex(/^[\p{L}\s]+$/u, {
      message: "Tên chỉ được chứa chữ cái và khoảng trắng",
    }),

  phoneNumber: z.string().regex(/^(0|\+84)(\s|-)?[1-9]\d{8}$/, {
    message: "Số điện thoại không hợp lệ",
  }),

  address: z
    .string()
    .min(5, { message: "Địa chỉ phải có ít nhất 5 ký tự" })
    .max(200, { message: "Địa chỉ không được vượt quá 200 ký tự" }),

  cccd: z
    .string()
    .regex(/^\d{12}$/, { message: "CCCD phải bao gồm đúng 12 chữ số" }),

  paymentMethod: z.enum(["Cash", "Momo", "VnPay", "PayOS"], {
    required_error: "Phương thức thanh toán là bắt buộc",
    invalid_type_error: "Phương thức thanh toán không hợp lệ",
  }),

  gender: z.enum(["male", "female", "other"], {
    required_error: "Giới tính là bắt buộc",
    invalid_type_error: "Giới tính không hợp lệ",
  }),

  quantity: z
    .number()
    .int({ message: "Số lượng phải là số nguyên" })
    .min(1, { message: "Số lượng tối thiểu là 1" })
    .max(20, { message: "Số lượng không được vượt quá 20" }),

  price: z
    .number()
    .min(1000, { message: "Giá phải ít nhất là 1.000 VND" })
    .max(10000000, { message: "Giá không được vượt quá 10 triệu VND" }),
});

export const etagFormSchema = z
  .object({
    etagStartDate: z.string().refine(
      (date) => {
        const startDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return startDate >= today;
      },
      { message: "Ngày bắt đầu phải là ngày hôm nay hoặc trong tương lai" }
    ),

    etagEndDate: z.string().refine(
      (date) => {
        const endDate = new Date(date);
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 5);
        return endDate <= maxDate;
      },
      { message: "Ngày kết thúc không thể quá 5 năm trong tương lai" }
    ),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.etagStartDate);
      const endDate = new Date(data.etagEndDate);
      return endDate > startDate;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["etagEndDate"],
    }
  );

export const formSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Tên phải có ít nhất 2 ký tự" })
      .max(100, { message: "Tên không được vượt quá 100 ký tự" })
      .regex(/^[\p{L}\s]+$/u, {
        message: "Tên chỉ được chứa chữ cái và khoảng trắng",
      }),

    etagCode: z
      .string()
      .regex(
        /^[A-Z0-9]{10}$/,
        "Mã ETag phải có 10 ký tự và chỉ chứa chữ cái in hoa và số"
      ),

    phoneNumber: z
      .string()
      .regex(
        /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
        "Số điện thoại không hợp lệ. Vui lòng sử dụng số điện thoại Việt Nam hợp lệ"
      ),

    cccd: z.string().regex(/^[0-9]{12}$/, "CCCD phải có đúng 12 chữ số"),

    birthday: z.string().refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const minAge = 16;
      const maxAge = 100;
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= minAge && age <= maxAge;
    }, "Ngày sinh phải từ 16 đến 100 năm trước"),

    gender: z.enum(["0", "1", "2"], {
      errorMap: () => ({ message: "Vui lòng chọn giới tính hợp lệ" }),
    }),

    startDate: z
      .string()
      .refine(
        (date) => new Date(date) >= new Date(),
        "Ngày bắt đầu phải là ngày hôm nay hoặc trong tương lai"
      ),

    endDate: z.string(),

    status: z
      .number()
      .min(0, "Trạng thái phải là số không âm")
      .max(2, "Trạng thái không được vượt quá 2"),

    imageUrl: z.string().url("URL hình ảnh không hợp lệ").optional(),

    etagType: z.object({
      name: z
        .string()
        .min(1, "Tên loại ETag là bắt buộc")
        .max(50, "Tên loại ETag không được vượt quá 50 ký tự"),
      bonusRate: z
        .number()
        .min(0, "Tỷ lệ thưởng phải là số không âm")
        .max(100, "Tỷ lệ thưởng không được vượt quá 100%"),
      amount: z
        .number()
        .min(0, "Số tiền phải là số không âm")
        .min(1000, { message: "Giá phải ít nhất là 1.000 VND" })
        .max(10000000, { message: "Giá không được vượt quá 10 triệu VND" }),
    }),

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

    wallet: z.object({
      balance: z
        .number()
        .min(0, "Số dư phải là số không âm")
        .max(1000000000, "Số dư không được vượt quá 1.000.000.000"),
      balanceHistory: z
        .number()
        .min(0, "Lịch sử số dư phải là số không âm")
        .max(10000000, "Lịch sử số dư không được vượt quá 1.000.000.000"),
    }),
  })
  .refine(
    (data) => {
      const endDate = new Date(data.endDate);
      const startDate = new Date(data.startDate);
      return endDate > startDate;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
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
    .min(2, { message: "Tên phải có ít nhất 2 ký tự" })
    .max(100, { message: "Tên không được vượt quá 100 ký tự" })
    .regex(/^[\p{L}\s]+$/u, {
      message: "Tên chỉ được chứa chữ cái và khoảng trắng",
    }),
  address: z
    .string()
    .min(5, { message: "Địa chỉ phải có ít nhất 5 ký tự" })
    .max(200, { message: "Địa chỉ không được vượt quá 200 ký tự" }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  phoneNumber: z
    .string()
    .regex(
      /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
      "Số điện thoại không hợp lệ. Vui lòng sử dụng số điện thoại Việt Nam hợp lệ"
    ),
  birthday: z
    .string()
    .min(1, { message: "Birthday is required" })
    .refine(isOver18, { message: "You must be over 18 years old" }),
  gender: z.string().min(0, {
    message: "Gender is required",
  }),
  cccd: z.string().regex(/^[0-9]{12}$/, "CCCD phải có đúng 12 chữ số"),
  imageUrl: z.string().url("Invalid image URL").nullable(), //does not effect
});

export const serviceStoreFormSchema = z.object({
  name: z.string().min(1, "Name must be over 1 letter"),
  storeId: z.string().min(1, "Store Id is required!"),
});

export const loginFormSchema = z.object({
  email: z.string().email("Your email is invalid!"),
  // password: z
  //   .string()
  //   .regex(
  //     /^[A-Z](?=.*\d)[\w, \W]{6,40}$/,
  //     "Your password must minimium 6 characters"
  //   ), //password minimium 6 characters and Uppercase first character and one digit in
  password: z.string().min(1, "Your password must at least 1 letter"),
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
  cccd: z.string().regex(/^[0-9]{12}$/, "CCCD phải có đúng 12 chữ số"),
  paymentType: z.enum(["Cash", "Momo", "VnPay", "PayOS"], {
    required_error: "Phương thức thanh toán là bắt buộc",
    invalid_type_error: "Phương thức thanh toán không hợp lệ",
  }),
  startDate: z
    .string()
    .refine(
      (date) => new Date(date) >= new Date(),
      "Ngày bắt đầu phải là ngày hôm nay hoặc trong tương lai"
    ),
  endDate: z.string(),
});
export type ChargeFormValues = z.infer<typeof chargeFormSchema>;
export type FormValues = z.infer<typeof formSchema>;
export type CustomerFormValues = z.infer<typeof customerFormSchema>;
export type EtagFormValues = z.infer<typeof etagFormSchema>;
export type UserAccountFormValues = z.infer<typeof userAccountFormSchema>;
export type loginFormValues = z.infer<typeof loginFormSchema>;
export type ServiceStoreFormValues = z.infer<typeof serviceStoreFormSchema>;

export interface EtagDetailPageProps {
  params: { id: string };
}

export interface GenerateEtagProps {
  params: { id: string };
}
