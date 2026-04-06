import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

export const registerSchema = Yup.object({
  name: Yup.string().min(2, 'Min 2 characters').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().matches(/^[6-9]\d{9}$/, 'Invalid phone').required('Phone is required'),
  password: Yup.string().min(8, 'Min 8 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password required'),
  newPassword: Yup.string().min(8, 'Min 8 characters').required('New password required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password required'),
});
