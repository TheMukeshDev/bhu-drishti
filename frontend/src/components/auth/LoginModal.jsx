import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { OFFICER_REGISTRY } from '../../data/mockData';

/** Role options for the login form */
const ROLE_OPTIONS = [
  { value: 'CENTRAL', label: 'Central Administrator' },
  { value: 'STATE', label: 'State Administrator' },
  { value: 'DISTRICT', label: 'District Administrator' },
  { value: 'PROJECT', label: 'Project Officer' },
  { value: 'FIELD_OFFICER', label: 'Field Officer' },
];

/** Map role values to OFFICER_REGISTRY role codes for demo matching */
const ROLE_MAP = {
  CENTRAL: 'CENTRAL',
  STATE: 'DISTRICT', // no STATE in registry, map to DISTRICT
  DISTRICT: 'DISTRICT',
  PROJECT: 'DISTRICT',
  FIELD_OFFICER: 'FIELD_OFFICER',
};

/**
 * LoginModal — Demo frontend authentication modal.
 *
 * @param {{ isOpen: boolean, onClose: () => void, onLoginSuccess: (officer: object) => void }} props
 */
export const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(null);

  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Trap focus inside modal & restore on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Delay focus to after mount
      setTimeout(() => firstInputRef.current?.focus(), 100);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setRole('');
      setRememberDevice(false);
      setErrors({});
      setIsSubmitting(false);
      setLoginSuccess(null);
    }
  }, [isOpen]);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Official email or User ID is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && !/^[A-Za-z0-9._-]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address or User ID.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters.';
    }
    if (!role) {
      newErrors.role = 'Please select your administrative role.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, role]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setLoginSuccess(null);
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate authentication delay
    setTimeout(() => {
      // Find a matching officer from the registry by role
      const targetRole = ROLE_MAP[role] || role;
      const matchedOfficer =
        OFFICER_REGISTRY.find((o) => o.role === targetRole) || OFFICER_REGISTRY[0];

      setLoginSuccess(matchedOfficer);
      setIsSubmitting(false);

      // Auto-complete after brief success display
      setTimeout(() => {
        onLoginSuccess(matchedOfficer);
        onClose();
      }, 1200);
    }, 600);
  }, [email, password, role, validate, onLoginSuccess, onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      aria-modal="true"
      role="dialog"
      aria-labelledby="login-modal-title"
      aria-describedby="login-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        style={{ maxWidth: '460px', width: 'min(460px, calc(100% - 32px))' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-slate-900 px-5 py-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gov-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 id="login-modal-title" className="text-sm sm:text-base font-bold text-white tracking-wide">
                BHU-DRISHTI
              </h2>
              <p id="login-modal-desc" className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Secure Administrative Access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close login dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-5">

          {/* Success banner */}
          {loginSuccess && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-emerald-900">Authentication Successful</div>
                <div className="text-xs text-emerald-700 truncate">
                  {loginSuccess.fullName} — {loginSuccess.role}
                </div>
              </div>
            </div>
          )}

          {/* FORM */}
          {!loginSuccess && (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Email / User ID */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-gov-text mb-1.5">
                  Official Email / User ID <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    ref={firstInputRef}
                    id="login-email"
                    type="text"
                    autoComplete="username"
                    placeholder="e.g. collector-sitapur@nic.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                    className={`w-full pl-10 pr-4 py-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-primary transition-colors ${
                      errors.email ? 'border-red-400 focus:ring-red-300' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p id="login-email-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-gov-text mb-1.5">
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                    className={`w-full pl-10 pr-12 py-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-primary transition-colors ${
                      errors.password ? 'border-red-400 focus:ring-red-300' : 'border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="login-password-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Role selector */}
              <div>
                <label htmlFor="login-role" className="block text-xs font-semibold text-gov-text mb-1.5">
                  Role <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    id="login-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    aria-invalid={!!errors.role}
                    aria-describedby={errors.role ? 'login-role-error' : undefined}
                    className={`w-full pl-10 pr-4 py-3 text-sm bg-white border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-gov-primary transition-colors ${
                      !role ? 'text-slate-400' : 'text-gov-text'
                    } ${errors.role ? 'border-red-400 focus:ring-red-300' : 'border-slate-300'}`}
                  >
                    <option value="" disabled>Select your role</option>
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.role && (
                  <p id="login-role-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.role}
                  </p>
                )}
              </div>

              {/* Remember device + Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-gov-primary focus:ring-gov-primary"
                  />
                  <span className="text-xs text-slate-600">Remember this device</span>
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-gov-primary hover:text-gov-primary-hover transition-colors min-h-[44px] px-1"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[48px] ${
                  isSubmitting
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gov-primary hover:bg-gov-primary-hover text-white shadow-sm'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Demo quick-select section */}
          {!loginSuccess && (
            <div className="border-t border-slate-200 pt-4">
              <div className="text-[10px] font-mono uppercase font-semibold text-slate-400 tracking-wider mb-2">
                Demo Quick Select
              </div>
              <div className="space-y-1.5">
                {OFFICER_REGISTRY.map((officer) => (
                  <button
                    key={officer.officerId}
                    type="button"
                    onClick={() => {
                      setEmail(officer.email);
                      setPassword('demo1234');
                      setRole(
                        officer.role === 'CENTRAL'
                          ? 'CENTRAL'
                          : officer.role === 'FIELD_OFFICER'
                            ? 'FIELD_OFFICER'
                            : 'DISTRICT'
                      );
                      setErrors({});
                      setLoginSuccess(null);
                    }}
                    className="w-full text-left px-3 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-between min-h-[44px]"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gov-text truncate">{officer.fullName}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{officer.designation}</div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 ml-2">
                      {officer.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {!loginSuccess && (
          <div className="bg-slate-50 px-5 py-3 sm:px-6 border-t border-slate-200 shrink-0">
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Department of Land Resources (DoLR) — Government of India.{' '}
              <span className="text-gov-primary font-medium">Demo mode</span> — no real authentication.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
