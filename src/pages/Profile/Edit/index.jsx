import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/UIContext';
import authService from '../../../services/auth.service';
import { getErrorMessage } from '../../../utils/helpers';
import { profileSchema } from '../../../validations/profile.schema';

const ProfileEdit = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { name: user?.name || '', phone: user?.phone || '', address: user?.address || '' },
    validationSchema: profileSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await authService.getProfile(); // would be updateProfile in real
        updateUser(values);
        toast.success('Profile updated! ✅');
        navigate('/profile');
      } catch (err) {
        toast.error('Error', getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const f = formik;

  return (
    <div className="page-container">
      <button className="btn btn-ghost btn-sm mb-24" onClick={() => navigate('/profile')}>← Back</button>
      <div className="page-header">
        <h1 className="page-title">Edit Profile</h1>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <form onSubmit={f.handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input type="text" name="name" className={`form-control ${f.touched.name && f.errors.name ? 'error' : ''}`}
                value={f.values.name} onChange={f.handleChange} onBlur={f.handleBlur} placeholder="Your full name" />
            </div>
            {f.touched.name && f.errors.name && <span className="form-error">⚠ {f.errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-wrapper">
              <span className="input-icon">📱</span>
              <input type="tel" name="phone" className={`form-control ${f.touched.phone && f.errors.phone ? 'error' : ''}`}
                value={f.values.phone} onChange={f.handleChange} onBlur={f.handleBlur} placeholder="9876543210" />
            </div>
            {f.touched.phone && f.errors.phone && <span className="form-error">⚠ {f.errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Address (optional)</label>
            <textarea name="address" className="form-control" rows={3}
              value={f.values.address} onChange={f.handleChange} placeholder="Your delivery address" style={{ resize: 'vertical' }} />
          </div>

          <div className="flex gap-12">
            <button type="button" className="btn btn-ghost btn-full" onClick={() => navigate('/profile')}>Cancel</button>
            <button type="submit" className={`btn btn-primary btn-full ${f.isSubmitting ? 'btn-loading' : ''}`} disabled={f.isSubmitting}>
              <span className="btn-text">Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
