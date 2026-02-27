import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import authService from '../../../services/auth.service';
import { useToast } from '../../../context/UIContext';
import { getErrorMessage } from '../../../utils/helpers';

const schema = Yup.object({ email: Yup.string().email('Invalid email').required('Email required') });

const ForgotPassword = () => {
  const toast = useToast();

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await authService.forgotPassword(values.email);
        toast.success('Email sent!', 'Check your inbox for reset instructions');
        resetForm();
      } catch (err) {
        toast.error('Error', getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-bg-grid" />

      <div className="auth-left animate-fadein">
        <div className="auth-brand">
          <div className="auth-brand-icon">🛒</div>
          <span className="auth-brand-name">ShopFlow</span>
        </div>
        <h1 className="auth-tagline">
          Reset your<br /><span>password</span><br />easily.
        </h1>
        <p className="auth-subtitle">
          We'll send a secure link to your registered email address.
        </p>
      </div>

      <div className="auth-right animate-slideup">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
        <h2 className="auth-title">Forgot password?</h2>
        <p className="auth-desc">Enter your email and we'll send you a reset link.</p>

        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className={`form-control ${formik.touched.email && formik.errors.email ? 'error' : ''}`}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <span className="form-error">⚠ {formik.errors.email}</span>
            )}
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full btn-lg ${formik.isSubmitting ? 'btn-loading' : ''}`}
            disabled={formik.isSubmitting}
          >
            <span className="btn-text">Send Reset Link</span>
          </button>
        </form>

        <p className="auth-link">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
