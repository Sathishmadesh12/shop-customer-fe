import * as Yup from 'yup';

export const profileSchema = Yup.object({
  name: Yup.string().min(2).required('Name is required'),
  phone: Yup.string().matches(/^[6-9]\d{9}$/, 'Invalid phone').required('Phone is required'),
  address: Yup.string().optional(),
});

export const orderSchema = Yup.object({
  paymentMethod: Yup.string().oneOf(['cash', 'qr', 'upi']).required('Select payment method'),
  notes: Yup.string().optional(),
});

export const couponSchema = Yup.object({
  code: Yup.string().min(3).required('Enter coupon code'),
});
