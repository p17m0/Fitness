import React, { useEffect, useState } from 'react';
import { ShieldCheck, User, Mail, Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

type AuthMode = 'login' | 'register';

interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Email обязателен';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Некорректный формат email';
  return undefined;
};

const validatePhone = (phone: string): string | undefined => {
  if (!phone.trim()) return 'Телефон обязателен';
  if (!/^[\d\s+()-]{10,}$/.test(phone)) return 'Некорректный формат телефона';
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Пароль обязателен';
  if (password.length < 6) return 'Минимум 6 символов';
  return undefined;
};

const InputField: React.FC<{
  icon: React.ElementType;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}> = ({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  touched,
  required,
  showPasswordToggle,
  showPassword,
  onTogglePassword
}) => (
  <div className="space-y-1">
    <div className="relative">
      <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        className={`brutal-input pl-10 ${showPasswordToggle ? 'pr-10' : ''} ${error && touched ? 'border-red-500 focus:border-red-500' : ''}`}
        placeholder={placeholder}
        type={showPasswordToggle && showPassword ? 'text' : type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {showPasswordToggle && onTogglePassword && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={onTogglePassword}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && touched && (
      <p className="text-red-500 text-xs font-body font-medium animate-fade-in">{error}</p>
    )}
  </div>
);

export const AuthPage: React.FC = () => {
  const { register, login, error, resetError, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);

  const [registerForm, setRegisterForm] = useState<Record<string, FormField>>({
    email: { value: '', touched: false },
    phone_number: { value: '', touched: false },
    password: { value: '', touched: false },
    first_name: { value: '', touched: false },
    last_name: { value: '', touched: false }
  });

  const [loginForm, setLoginForm] = useState<Record<string, FormField>>({
    identifier: { value: '', touched: false },
    password: { value: '', touched: false }
  });

  const updateRegisterField = (field: string, value: string) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: { ...prev[field], value, touched: true }
    }));
  };

  const updateLoginField = (field: string, value: string) => {
    setLoginForm(prev => ({
      ...prev,
      [field]: { ...prev[field], value, touched: true }
    }));
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    resetError();

    // Validate all fields
    const emailError = validateEmail(registerForm.email.value);
    const phoneError = validatePhone(registerForm.phone_number.value);
    const passwordError = validatePassword(registerForm.password.value);

    if (emailError || phoneError || passwordError) {
      toast.error('Пожалуйста, заполните все обязательные поля корректно');
      return;
    }

    setActionLoading(true);
    try {
      await register({
        user: {
          email: registerForm.email.value,
          phone_number: registerForm.phone_number.value,
          password: registerForm.password.value,
          first_name: registerForm.first_name.value,
          last_name: registerForm.last_name.value
        }
      });
      toast.success('Регистрация успешна! Добро пожаловать!');
      navigate('/bookings', { replace: true });
    } catch {
      toast.error('Не удалось зарегистрироваться');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    resetError();

    const trimmed = loginForm.identifier.value.trim();
    const passwordError = validatePassword(loginForm.password.value);

    if (!trimmed || passwordError) {
      toast.error('Введите логин и пароль');
      return;
    }

    setActionLoading(true);
    const payload = trimmed.indexOf('@') !== -1
      ? { email: trimmed, password: loginForm.password.value }
      : { phone_number: trimmed, password: loginForm.password.value };

    try {
      await login({ user: payload });
      toast.success('Вход выполнен успешно!');
      navigate('/bookings', { replace: true });
    } catch {
      toast.error('Неверный логин или пароль');
    } finally {
      setActionLoading(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    resetError();
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/bookings', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="container mx-auto max-w-lg">
      <div className="brutal-card space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-primary border-4 border-gray-dark brutal-shadow mb-4">
            {mode === 'login' ? (
              <User size={32} className="text-white" />
            ) : (
              <ShieldCheck size={32} className="text-white" />
            )}
          </div>
          <h2 className="brutal-title text-2xl md:text-3xl">
            {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
          </h2>
          <p className="brutal-text text-sm">
            {mode === 'login'
              ? 'Войдите, чтобы управлять бронированиями'
              : 'Создайте аккаунт и начните тренироваться'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-4 border-gray-dark">
          <button
            className={`flex-1 py-3 font-display font-bold uppercase text-sm tracking-wide transition-colors ${
              mode === 'login'
                ? 'bg-orange-primary text-white'
                : 'bg-white text-gray-dark hover:bg-gray-light'
            }`}
            type="button"
            onClick={() => switchMode('login')}
          >
            Вход
          </button>
          <button
            className={`flex-1 py-3 font-display font-bold uppercase text-sm tracking-wide border-l-4 border-gray-dark transition-colors ${
              mode === 'register'
                ? 'bg-orange-primary text-white'
                : 'bg-white text-gray-dark hover:bg-gray-light'
            }`}
            type="button"
            onClick={() => switchMode('register')}
          >
            Регистрация
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="brutal-alert-error animate-shake">
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <InputField
              icon={Mail}
              placeholder="Email или телефон"
              value={loginForm.identifier.value}
              onChange={(v) => updateLoginField('identifier', v)}
              required
            />
            <InputField
              icon={Lock}
              type="password"
              placeholder="Пароль"
              value={loginForm.password.value}
              onChange={(v) => updateLoginField('password', v)}
              error={loginForm.password.touched ? validatePassword(loginForm.password.value) : undefined}
              touched={loginForm.password.touched}
              required
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={togglePassword}
            />
            <button
              type="submit"
              className="brutal-button w-full flex items-center justify-center gap-2"
              disabled={actionLoading || loading}
            >
              {actionLoading ? (
                <span className="loader" />
              ) : (
                <>
                  Войти
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
            <InputField
              icon={Mail}
              type="email"
              placeholder="Email *"
              value={registerForm.email.value}
              onChange={(v) => updateRegisterField('email', v)}
              error={registerForm.email.touched ? validateEmail(registerForm.email.value) : undefined}
              touched={registerForm.email.touched}
              required
            />
            <InputField
              icon={Phone}
              placeholder="Телефон *"
              value={registerForm.phone_number.value}
              onChange={(v) => updateRegisterField('phone_number', v)}
              error={registerForm.phone_number.touched ? validatePhone(registerForm.phone_number.value) : undefined}
              touched={registerForm.phone_number.touched}
              required
            />
            <InputField
              icon={Lock}
              type="password"
              placeholder="Пароль *"
              value={registerForm.password.value}
              onChange={(v) => updateRegisterField('password', v)}
              error={registerForm.password.touched ? validatePassword(registerForm.password.value) : undefined}
              touched={registerForm.password.touched}
              required
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={togglePassword}
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                icon={User}
                placeholder="Имя"
                value={registerForm.first_name.value}
                onChange={(v) => updateRegisterField('first_name', v)}
              />
              <InputField
                icon={User}
                placeholder="Фамилия"
                value={registerForm.last_name.value}
                onChange={(v) => updateRegisterField('last_name', v)}
              />
            </div>
            <button
              type="submit"
              className="brutal-button w-full flex items-center justify-center gap-2"
              disabled={actionLoading || loading}
            >
              {actionLoading ? (
                <span className="loader" />
              ) : (
                <>
                  Создать аккаунт
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-400 font-body">
              * Обязательные поля
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
