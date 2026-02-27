import { useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { changePasswordSchema } from '../../../validations/auth.schema';
import authService from '../../../services/auth.service';
import { useToast } from '../../../context/UIContext';
import { getErrorMessage } from '../../../utils/helpers';

const ChangePassword = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const formik = useFormik({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema: changePasswordSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await authService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
        toast.success('Password changed! 🔒');
        resetForm();
        navigate('/profile');
      } catch (err) {
        toast.error('Failed', getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const f = formik;

  const pwdField = (name, label, placeholder) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="input-wrapper">
        <span className="input-icon">🔒</span>
        <input type={show ? 'text' : 'password'} name={name} placeholder={placeholder}
          className={`form-control ${f.touched[name] && f.errors[name] ? 'error' : ''}`}
          value={f.values[name]} onChange={f.handleChange} onBlur={f.handleBlur} />
        <span className="input-suffix" onClick={() => setShow(!show)}>{show ? '🙈' : '👁️'}</span>
      </div>
      {f.touched[name] && f.errors[name] && <span className="form-error">⚠ {f.errors[name]}</span>}
    </div>
  );

  return (
    <div className="page-container">
      <button className="btn btn-ghost btn-sm mb-24" onClick={() => navigate('/profile')}>← Back</button>
      <div className="page-header"><h1 className="page-title">Change Password 🔒</h1></div>

      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={f.handleSubmit}>
          {pwdField('currentPassword', 'Current Password', '••••••••')}
          {pwdField('newPassword', 'New Password', '••••••••')}
          {pwdField('confirmPassword', 'Confirm New Password', '••••••••')}
          <div className="flex gap-12">
            <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate('/profile')}>Cancel</button>
            <button type="submit" className={`btn btn-primary btn-full ${f.isSubmitting ? 'btn-loading' : ''}`} disabled={f.isSubmitting}>
              <span className="btn-text">Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
