import { useFormik } from 'formik';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../../../validations/auth.schema';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/UIContext';
import { getErrorMessage } from '../../../utils/helpers';

const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const formik = useFormik({
    initialValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { confirmPassword, ...data } = values;
        await register(data);
        toast.success('Account created! 🎉', 'Welcome to ShopFlow');
        navigate('/');
      } catch (err) {
        toast.error('Registration failed', getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const f = formik;

  const field = (name, label, type = 'text', icon, placeholder) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="input-wrapper">
        <span className="input-icon">{icon}</span>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          className={`form-control ${f.touched[name] && f.errors[name] ? 'error' : ''}`}
          value={f.values[name]}
          onChange={f.handleChange}
          onBlur={f.handleBlur}
        />
        {(name === 'password' || name === 'confirmPassword') && (
          <span className="input-suffix" onClick={() => setShowPass(!showPass)}>
            {showPass ? '🙈' : '👁️'}
          </span>
        )}
      </div>
      {f.touched[name] && f.errors[name] && (
        <span className="form-error">⚠ {f.errors[name]}</span>
      )}
    </div>
  );

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
          Join the<br />
          <span>smarter way</span><br />to shop.
        </h1>
        <p className="auth-subtitle">
          Access exclusive offers, manage your wallet, and track every order in one place.
        </p>
      </div>

      <div className="auth-right animate-slideup" style={{ overflowY: 'auto' }}>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-desc">Fill in your details to get started</p>

        <form onSubmit={f.handleSubmit}>
          {field('name', 'Full Name', 'text', '👤', 'Your full name')}
          {field('email', 'Email Address', 'email', '📧', 'you@example.com')}
          {field('phone', 'Phone Number', 'tel', '📱', '9876543210')}
          {field('password', 'Password', showPass ? 'text' : 'password', '🔒', '••••••••')}
          {field('confirmPassword', 'Confirm Password', showPass ? 'text' : 'password', '🔒', '••••••••')}

          <button
            type="submit"
            className={`btn btn-primary btn-full btn-lg ${f.isSubmitting ? 'btn-loading' : ''}`}
            disabled={f.isSubmitting}
          >
            <span className="btn-text">Create Account</span>
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
