import { useFormik } from 'formik';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema } from '../../../validations/auth.schema';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/UIContext';
import { getErrorMessage } from '../../../utils/helpers';

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [showPass, setShowPass] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values);
        toast.success('Welcome back! 👋');
        navigate(from, { replace: true });
      } catch (err) {
        toast.error('Login failed', getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-bg-grid" />

      {/* Left panel */}
      <div className="auth-left animate-fadein">
        <div className="auth-brand">
          <div className="auth-brand-icon">🛒</div>
          <span className="auth-brand-name">ShopFlow</span>
        </div>
        <h1 className="auth-tagline">
          Shop smarter,<br />
          <span>save better.</span>
        </h1>
        <p className="auth-subtitle">
          Your all-in-one platform for seamless shopping, smart billing, and exclusive rewards.
        </p>
      </div>

      {/* Right panel */}
      <div className="auth-right animate-slideup">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-desc">Sign in to your account to continue</p>

        <form onSubmit={formik.handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
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

          <div className="form-group">
            <div className="flex justify-between items-center">
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--primary-light)' }}>Forgot password?</Link>
            </div>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                className={`form-control ${formik.touched.password && formik.errors.password ? 'error' : ''}`}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <span className="input-suffix" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</span>
            </div>
            {formik.touched.password && formik.errors.password && (
              <span className="form-error">⚠ {formik.errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full btn-lg ${formik.isSubmitting ? 'btn-loading' : ''}`}
            disabled={formik.isSubmitting}
          >
            <span className="btn-text">Sign In</span>
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
