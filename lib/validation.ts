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

export type FormValues = z.infer<typeof formSchema>;
export type CustomerFormValues = z.infer<typeof customerFormSchema>;
export type EtagFormValues = z.infer<typeof etagFormSchema>;

export interface EtagDetailPageProps {
  params: { id: string };
}

export interface GenerateEtagProps {
  params: { id: string };
}
