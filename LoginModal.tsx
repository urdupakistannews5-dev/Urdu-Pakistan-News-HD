import { Eye, EyeOff, Lock, Shield, UserCheck, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { PortalPasswords } from '../types/news';

interface LoginModalProps {
  isOpen: boolean;
  passwords: PortalPasswords;
  onClose: () => void;
  onLoginSuccess: (role: 'staff' | 'admin') => void;
}

export function LoginModal({
  isOpen,
  passwords,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [selectedRole, setSelectedRole] = useState<'staff' | 'admin'>('staff');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPasswordInput('');
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = passwordInput.trim();
    if (!trimmed) {
      setError('براہ کرم پاس ورڈ درج کریں۔');
      return;
    }

    const expected =
      selectedRole === 'admin'
        ? passwords.adminPassword
        : passwords.staffPassword;

    if (trimmed !== expected) {
      setError(
        selectedRole === 'admin'
          ? 'ایڈمن پاس ورڈ درست نہیں ہے۔ دوبارہ کوشش کریں۔'
          : 'اسٹاف پاس ورڈ درست نہیں ہے۔ دوبارہ کوشش کریں۔'
      );
      return;
    }

    onLoginSuccess(selectedRole);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b-2 border-[#C8102E] bg-[#0D0D0D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#C8102E]" aria-hidden="true" />
            <h2 id="login-modal-title" className="text-base font-bold">
              اسٹاف / ایڈمن لاگ اِن (Staff / Admin Login)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بند کریں"
            className="p-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Role Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#4A4A4A]">
              لاگ اِن کی قسم منتخب کریں
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F2F2F2] rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('staff');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 min-h-[44px] rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  selectedRole === 'staff'
                    ? 'bg-[#0D0D0D] text-white shadow-sm'
                    : 'text-[#4A4A4A] hover:text-[#0D0D0D]'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>اسٹاف (Staff)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 min-h-[44px] rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-[#C8102E] text-white shadow-sm'
                    : 'text-[#4A4A4A] hover:text-[#0D0D0D]'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>ایڈمن (Admin)</span>
              </button>
            </div>
          </div>

          {/* Role Permission Summary */}
          <div className="text-xs leading-relaxed text-[#4A4A4A] bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-3.5">
            {selectedRole === 'staff' ? (
              <p>
                <strong className="text-[#0D0D0D]">اسٹاف اختیارات:</strong> نئی
                خبریں شائع کریں، موجودہ خبروں میں ترمیم کریں اور بریکنگ نیوز ٹکر
                اپ ڈیٹ کریں۔ (خبر حذف کرنے، کارڈ منظوری یا پاس ورڈ تبدیل کرنے کی
                اجازت نہیں)
              </p>
            ) : (
              <p>
                <strong className="text-[#0D0D0D]">ایڈمن اختیارات:</strong> مکمل
                کنٹرول — خبریں شائع، ترمیم اور حذف کریں، بریکنگ ٹکر بدلیں،
                ڈیجیٹل کارڈ درخواستیں منظور/مسترد کریں، پاس ورڈ تبدیل کریں اور
                بیک اپ JSON ایکسپورٹ/امپورٹ کریں۔
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="portal-password-input"
              className="block text-xs font-semibold text-[#0D0D0D]"
            >
              {selectedRole === 'admin' ? 'ایڈمن پاس ورڈ' : 'اسٹاف پاس ورڈ'}
            </label>
            <div className="relative">
              <input
                id="portal-password-input"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder={
                  selectedRole === 'admin'
                    ? 'Enter Admin Password'
                    : 'Enter Staff Password'
                }
                autoFocus
                className="w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-lg bg-white border border-[#D4D4D4] text-sm font-mono-num text-[#0D0D0D] focus:outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'پاس ورڈ چھپائیں' : 'پاس ورڈ دیکھیں'}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#4A4A4A] hover:text-[#0D0D0D] cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="text-xs font-semibold text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-md px-3 py-2.5"
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] rounded-md border border-[#D4D4D4] bg-white text-xs sm:text-sm font-semibold text-[#333333] hover:bg-[#F7F7F7] cursor-pointer"
            >
              منسوخ کریں
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 min-h-[44px] rounded-md bg-[#C8102E] text-white text-xs sm:text-sm font-semibold hover:bg-[#A00D24] transition-colors cursor-pointer"
            >
              لاگ اِن کریں
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
