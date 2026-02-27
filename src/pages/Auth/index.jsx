import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth, useToast } from '../../context/index';
import { getErr } from '../../utils/index';
import { PasswordInput } from '../../components/common/index.jsx';
import { authService } from '../../services/index';

const Logo = () => (
  <div className="auth-logo">
    <div className="auth-logo-icon">🛒</div>
    <span className="auth-logo-text">ShopFlow</span>
  </div>
);

// ---- Login ----
export const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const f = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({ email: Yup.string().email('Invalid email').required('Required'), password: Yup.string().required('Required') }),
    onSubmit: async (vals, { setSubmitting }) => {
      try {
        await login(vals.email, vals.password);
        toast.success('Welcome back! 👋');
        navigate('/');
      } catch (e) { toast.error('Login failed', getErr(e)); }
      finally { setSubmitting(false); }
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-box">
        <Logo />
        <h1 className="auth-title">Sign In</h1>
        <p className="auth-subtitle">Welcome back to ShopFlow</p>
        <form onSubmit={f.handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrap">
              <span className="input-icon">📧</span>
              <input type="email" name="email" className={`form-control ${f.touched.email && f.errors.email ? 'error' : ''}`} placeholder="you@example.com" value={f.values.email} onChange={f.handleChange} onBlur={f.handleBlur} />
            </div>
            {f.touched.email && f.errors.email && <span className="form-error">{f.errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input type={showPwd ? 'text' : 'password'} name="password" className={`form-control ${f.touched.password && f.errors.password ? 'error' : ''}`} placeholder="••••••••" value={f.values.password} onChange={f.handleChange} onBlur={f.handleBlur} />
              <span className="input-suffix" onClick={() => setShowPwd(!showPwd)}>{showPwd ? '🙈' : '👁️'}</span>
            </div>
            {f.touched.password && f.errors.password && <span className="form-error">{f.errors.password}</span>}
          </div>
          <div className="flex justify-between items-center" style={{ marginBottom: 18 }}>
            <span />
            <Link to="/forgot-password" className="auth-link text-sm">Forgot password?</Link>
          </div>
          <button type="submit" className={`btn btn-primary btn-full btn-lg ${f.isSubmitting ? 'btn-loading' : ''}`} disabled={f.isSubmitting}>
            <span className="btn-text">Sign In</span>
          </button>
        </form>
        <p className="text-muted text-sm text-center" style={{ marginTop: 20 }}>
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </p>
      </div>
    </div>
  );
};

// ---- Register ----
export const Register = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const f = useFormik({
    initialValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Name required'),
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(6, 'Min 6 characters').required('Required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Required'),
    }),
    onSubmit: async (vals, { setSubmitting }) => {
      try {
        const { authService } = await import('../../services/index');
        const res = await authService.register({ name: vals.name, email: vals.email, phone: vals.phone, password: vals.password });
        const { token } = res.data.data;
        localStorage.setItem('sf_token', token);
        toast.success('Account created! 🎉');
        navigate('/');
        window.location.reload(); // reload to init cart context
      } catch (e) { toast.error('Registration failed', getErr(e)); }
      finally { setSubmitting(false); }
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-box">
        <Logo />
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join ShopFlow today</p>
        <form onSubmit={f.handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrap">
              <span className="input-icon">👤</span>
              <input type="text" name="name" className={`form-control ${f.touched.name && f.errors.name ? 'error' : ''}`} placeholder="John Doe" value={f.values.name} onChange={f.handleChange} onBlur={f.handleBlur} />
            </div>
            {f.touched.name && f.errors.name && <span className="form-error">{f.errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrap">
              <span className="input-icon">📧</span>
              <input type="email" name="email" className={`form-control ${f.touched.email && f.errors.email ? 'error' : ''}`} placeholder="you@example.com" value={f.values.email} onChange={f.handleChange} onBlur={f.handleBlur} />
            </div>
            {f.touched.email && f.errors.email && <span className="form-error">{f.errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <div className="input-wrap">
              <span className="input-icon">📱</span>
              <input type="tel" name="phone" className="form-control" placeholder="+91 98765 43210" value={f.values.phone} onChange={f.handleChange} />
            </div>
          </div>
          <PasswordInput label="Password" name="password" placeholder="Min 6 characters" value={f.values.password} onChange={f.handleChange} error={f.touched.password && f.errors.password} />
          <PasswordInput label="Confirm Password" name="confirmPassword" placeholder="Re-enter password" value={f.values.confirmPassword} onChange={f.handleChange} error={f.touched.confirmPassword && f.errors.confirmPassword} />
          <button type="submit" className={`btn btn-primary btn-full btn-lg ${f.isSubmitting ? 'btn-loading' : ''}`} disabled={f.isSubmitting} style={{ marginTop: 8 }}>
            <span className="btn-text">Create Account</span>
          </button>
        </form>
        <p className="text-muted text-sm text-center" style={{ marginTop: 20 }}>
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

// ---- Forgot Password ----
export const ForgotPassword = () => {
  const toast = useToast();
  const [sent, setSent] = useState(false);

  const f = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({ email: Yup.string().email('Invalid email').required('Required') }),
    onSubmit: async (vals, { setSubmitting }) => {
      try {
        await authService.forgotPassword(vals);
        setSent(true);
        toast.success('Reset link sent!');
      } catch (e) { toast.error('Error', getErr(e)); }
      finally { setSubmitting(false); }
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-box">
        <Logo />
        <h1 className="auth-title">Forgot Password?</h1>
        <p className="auth-subtitle">We'll send you a reset link</p>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>📧</div>
            <p className="text-muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>Check your email for the reset link. It expires in 10 minutes.</p>
            <Link to="/login" className="btn btn-outline" style={{ marginTop: 20, display: 'inline-flex' }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={f.handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">📧</span>
                <input type="email" name="email" className={`form-control ${f.touched.email && f.errors.email ? 'error' : ''}`} placeholder="you@example.com" value={f.values.email} onChange={f.handleChange} onBlur={f.handleBlur} />
              </div>
              {f.touched.email && f.errors.email && <span className="form-error">{f.errors.email}</span>}
            </div>
            <button type="submit" className={`btn btn-primary btn-full ${f.isSubmitting ? 'btn-loading' : ''}`} disabled={f.isSubmitting}>
              <span className="btn-text">Send Reset Link</span>
            </button>
            <Link to="/login" className="btn btn-ghost btn-full" style={{ marginTop: 10 }}>Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  );
};
