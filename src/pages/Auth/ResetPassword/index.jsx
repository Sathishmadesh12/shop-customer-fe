import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "../../../context/index";
import { getErr } from "../../../utils/index";
import { authService } from "../../../services/index";

const EyeIcon = ({ show, toggle }) => (
  <button
    type="button"
    onClick={toggle}
    style={{
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--text-muted)",
      display: "flex",
      alignItems: "center",
    }}
  >
    {show ? (
      <svg
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
      <svg
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </button>
);

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { showToast } = useToast();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const formik = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(8, "Minimum 8 characters")
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords do not match")
        .required("Please confirm your password"),
    }),
    onSubmit: async (vals, { setSubmitting }) => {
      try {
        await authService.resetPassword({
          token,
          newPassword: vals.newPassword,
        });
        setDone(true);
        showToast("Password reset successfully!", "success");
      } catch (e) {
        showToast(getErr(e) || "Link expired. Request a new one.", "error");
      }
      setSubmitting(false);
    },
  });

  // No token
  if (!token)
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
            Invalid
            <br />
            <span>reset link.</span>
          </h1>
          <p className="auth-subtitle">
            This link is invalid or has already been used.
          </p>
        </div>
        <div className="auth-right animate-slideup">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
            <h2 className="auth-title">Link Invalid</h2>
            <p className="auth-desc" style={{ marginBottom: 24 }}>
              This password reset link is invalid or has expired.
            </p>
            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate("/forgot-password")}
            >
              Request New Link
            </button>
            <p className="auth-switch" style={{ marginTop: 16 }}>
              Back to{" "}
              <span className="auth-link" onClick={() => navigate("/login")}>
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    );

  // Done
  if (done)
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
            Password
            <br />
            <span>updated!</span>
          </h1>
          <p className="auth-subtitle">
            Your password has been reset successfully.
          </p>
        </div>
        <div className="auth-right animate-slideup">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 className="auth-title">All Done!</h2>
            <p className="auth-desc" style={{ marginBottom: 24 }}>
              You can now log in with your new password.
            </p>
            <button
              className="btn btn-primary btn-full"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );

  // Main form
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
          Reset your
          <br />
          <span>password</span>
          <br />
          easily.
        </h1>
        <p className="auth-subtitle">
          Choose a strong new password to keep your account secure.
        </p>
      </div>

      <div className="auth-right animate-slideup">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
        <h2 className="auth-title">New Password</h2>
        <p className="auth-desc">Enter and confirm your new password below.</p>

        <form onSubmit={formik.handleSubmit} style={{ marginTop: 24 }}>
          {/* New Password */}
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: "relative" }}>
              <input
                name="newPassword"
                type={showPw ? "text" : "password"}
                className={`form-input${formik.touched.newPassword && formik.errors.newPassword ? " input-error" : ""}`}
                placeholder="Minimum 8 characters"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{ paddingRight: 44 }}
              />
              <EyeIcon show={showPw} toggle={() => setShowPw(!showPw)} />
            </div>
            {formik.touched.newPassword && formik.errors.newPassword && (
              <div className="form-error">{formik.errors.newPassword}</div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className={`form-input${formik.touched.confirmPassword && formik.errors.confirmPassword ? " input-error" : ""}`}
                placeholder="Repeat new password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                style={{ paddingRight: 44 }}
              />
              <EyeIcon
                show={showConfirm}
                toggle={() => setShowConfirm(!showConfirm)}
              />
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <div className="form-error">
                  {formik.errors.confirmPassword}
                </div>
              )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={formik.isSubmitting}
            style={{ marginTop: 8 }}
          >
            {formik.isSubmitting ? "Resetting..." : "Reset Password"}
          </button>

          <p className="auth-switch" style={{ marginTop: 16 }}>
            Remember your password?{" "}
            <span className="auth-link" onClick={() => navigate("/login")}>
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
