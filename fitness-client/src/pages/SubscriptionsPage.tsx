import React, { useEffect, useRef, useState } from 'react';
import { Wallet, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { SubscriptionPlan } from '../api/types';
import { formatPrice } from '../utils/format';
import { NoSubscriptionsState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Loader';

export const SubscriptionsPage: React.FC = () => {
  const { isAuthenticated, services } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const toastRef = useRef(toast);
  const [searchParams] = useSearchParams();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [step, setStep] = useState<'plan' | 'payment'>('plan');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    cardNumber?: string;
    name?: string;
    expMonth?: string;
    expYear?: string;
    cvv?: string;
  }>({});

  const sanitizeNumericInput = (event: React.FormEvent<HTMLInputElement>, maxLength: number) => {
    const input = event.currentTarget;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, maxLength);
    if (digitsOnly !== input.value) {
      input.value = digitsOnly;
    }
  };

  const formatCardNumberInput = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 16);
    const grouped = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    if (grouped !== input.value) {
      input.value = grouped;
    }
  };

  const padTwoDigitsOnBlur = (event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const digitsOnly = input.value.replace(/\D/g, '');
    if (digitsOnly.length === 1) {
      input.value = `0${digitsOnly}`;
    }
  };

  const readCardField = (selector: string) =>
    formRef.current?.querySelector<HTMLInputElement>(selector)?.value?.trim() ?? '';

  const validateCardFields = () => {
    const errors: {
      cardNumber?: string;
      name?: string;
      expMonth?: string;
      expYear?: string;
      cvv?: string;
    } = {};
    const cardNumber = readCardField('[data-cp="cardNumber"]').replace(/\D/g, '');
    const expMonth = readCardField('[data-cp="expDateMonth"]');
    const expYear = readCardField('[data-cp="expDateYear"]');
    const cvv = readCardField('[data-cp="cvv"]');

    if (cardNumber.length !== 16) {
      errors.cardNumber = 'Номер карты должен быть из 16 цифр';
    }
    const month = Number(expMonth);
    if (!expMonth || expMonth.length !== 2 || Number.isNaN(month) || month < 1 || month > 12) {
      errors.expMonth = 'Месяц от 01 до 12';
    }
    if (!expYear || expYear.length !== 2) {
      errors.expYear = 'Введите год (YY)';
    }
    if (cvv.length !== 3) {
      errors.cvv = 'CVV из 3 цифр';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const publicId = import.meta.env.VITE_CLOUDPAYMENTS_PUBLIC_ID as string | undefined;

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    let aborted = false;
    setLoading(true);

    const load = async () => {
      try {
        const plans = await services.subscriptionPlans.list();
        if (aborted) return;
        setSubscriptionPlans(plans);
      } catch (err) {
        if (!aborted) {
          toastRef.current.error('Не удалось загрузить данные');
          console.error(err);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    load();

    return () => { aborted = true; };
  }, [services]);

  useEffect(() => {
    const status = searchParams.get('payment_status');
    if (!status) return;
    if (status === 'success') {
      toastRef.current.success('Оплата прошла успешно, абонемент активирован');
    } else if (status === 'fail') {
      toastRef.current.error('Оплата не прошла, попробуйте ещё раз');
    }
  }, [searchParams]);

  const loadCloudPaymentsScript = async () => {
    if (window.cp?.Checkout) return;
    const waitForCp = async () => {
      const timeoutMs = 5000;
      const start = Date.now();
      while (!window.cp?.Checkout) {
        if (Date.now() - start > timeoutMs) {
          throw new Error('Скрипт оплаты не загружен. Проверьте доступ к widget.cloudpayments.ru');
        }
        await new Promise(requestAnimationFrame);
      }
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-cp-checkout]');
    if (existing) {
      await new Promise<void>((resolve, reject) => {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Скрипт оплаты не загружен')), { once: true });
      });
      await waitForCp();
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.cloudpayments.ru/checkout.js';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-cp-checkout', 'true');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Скрипт оплаты не загружен'));
      document.head.appendChild(script);
    });
    await waitForCp();
  };

  const createCryptogram = async () => {
    if (!publicId) {
      throw new Error('Не задан Public ID для CloudPayments');
    }
    const form = formRef.current;
    if (!form) {
      throw new Error('Форма оплаты недоступна');
    }
    await loadCloudPaymentsScript();
    if (!window.cp?.Checkout) {
      throw new Error('Скрипт оплаты не загружен');
    }
    const checkoutCtor = window.cp?.Checkout ?? window.CloudPayments?.Checkout;
    if (!checkoutCtor) {
      throw new Error('Скрипт оплаты не загружен');
    }
    const checkout = new checkoutCtor(publicId, form);
    const result = checkout.createCryptogramPacket();
    if (typeof result === 'string') {
      if (result.length === 0) {
        throw new Error('Проверьте корректность данных карты');
      }
      return result;
    }
    if (result?.success && result.packet) {
      return result.packet;
    }
    console.error('CloudPayments cryptogram error', result);
    throw new Error(result?.message || 'Проверьте корректность данных карты');
  };

  const submit3ds = (acsUrl: string, paReq: string, transactionId: string, termUrl: string) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = acsUrl;

    const addField = (name: string, value: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    addField('PaReq', paReq);
    addField('MD', transactionId);
    addField('TermUrl', termUrl);

    document.body.appendChild(form);
    form.submit();
  };

  const handlePurchasePlan = async () => {
    if (!selectedPlanId) return;
    if (!isAuthenticated) {
      toast.info('Войдите, чтобы купить абонемент');
      navigate('/auth');
      return;
    }

    setActionLoading(true);
    setFormError(null);
    try {
      const isValid = validateCardFields();
      if (!isValid) {
        return;
      }
      const cryptogram = await createCryptogram();
      const cardholderName = readCardField('[data-cp="name"]');

      const response = await services.payments.create({
        payment: {
          subscription_plan_id: selectedPlanId,
          card_cryptogram_packet: cryptogram,
          cardholder_name: cardholderName || undefined
        }
      });

      if (response.status === '3ds_required') {
        submit3ds(response.acs_url, response.pa_req, response.transaction_id, response.term_url);
        return;
      }

      setSelectedPlanId(null);
      formRef.current?.reset();
      toast.success('Абонемент успешно приобретён!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось купить абонемент';
      setFormError(message);
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);
  const isPlanStep = step === 'plan';
  const isPaymentStep = step === 'payment';
  const canGoBack = isPaymentStep;

  if (loading) {
    return (
      <div className="container mx-auto">
        <PageLoader text="Загрузка абонементов..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Plans Section */}
      <div className="brutal-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-primary border-4 border-gray-dark brutal-shadow-sm flex items-center justify-center">
            <Wallet size={24} className="text-white" />
          </div>
          <div>
            <h2 className="brutal-title text-2xl md:text-3xl mb-0">Абонементы</h2>
            <p className="text-sm font-body text-gray-medium">Выберите подходящий план</p>
          </div>
        </div>

        {subscriptionPlans.length > 0 && isPlanStep ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {subscriptionPlans.map((plan, index) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  setFormError(null);
                  setFieldErrors({});
                }}
                className={`
                  text-left p-5 border-4 border-gray-dark transition-all duration-200
                  opacity-0 animate-fade-in-up
                  ${selectedPlanId === plan.id
                    ? 'bg-orange-primary text-white brutal-shadow-lg scale-[1.02]'
                    : 'bg-gray-light hover:bg-cream brutal-shadow'}
                `}
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-display font-bold text-lg uppercase">{plan.name}</div>
                  {selectedPlanId === plan.id && <CheckCircle size={20} />}
                </div>

                <div className={`text-3xl font-display font-bold mb-3 ${selectedPlanId === plan.id ? '' : 'text-orange-primary'}`}>
                  {formatPrice(plan.price)}
                </div>

                <div className={`space-y-2 text-sm ${selectedPlanId === plan.id ? 'text-white/80' : 'text-gray-medium'}`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span>{plan.visits_count} посещений</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{plan.duration_days} дней</span>
                  </div>
                </div>

                {plan.description && (
                  <p className={`text-xs mt-3 ${selectedPlanId === plan.id ? 'text-white/70' : 'text-gray-400'}`}>
                    {plan.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        ) : isPlanStep ? (
          <NoSubscriptionsState />
        ) : null}

        {isPlanStep && selectedPlan && (
          <div className="border-4 border-gray-dark p-4 bg-cream brutal-shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-display font-bold uppercase">Вы выбрали</p>
                <p className="text-sm text-gray-medium">
                  {selectedPlan.name} — {formatPrice(selectedPlan.price)}
                </p>
              </div>
              <button
                type="button"
                className="brutal-button w-full sm:w-auto flex items-center justify-center gap-2"
                onClick={() => {
                  setFormError(null);
                  setFieldErrors({});
                  setStep('payment');
                }}
              >
                Перейти к оплате
              </button>
            </div>
          </div>
        )}

        {/* Purchase Section */}
        {selectedPlan && isPaymentStep && (
          <div className="border-t-4 border-gray-dark pt-6 animate-fade-in space-y-4">
            <div className="flex flex-col gap-3 p-4 bg-orange-primary/10 border-4 border-orange-primary">
              <div className="flex flex-col gap-1">
                <p className="font-display font-bold uppercase">Выбранный план</p>
                <p className="font-body text-lg">
                  {selectedPlan.name} — {formatPrice(selectedPlan.price)}
                </p>
              </div>
            </div>

            <div className="bg-cream border-4 border-gray-dark p-4 brutal-shadow-sm">
              <form ref={formRef} className="grid grid-cols-1 gap-3">
                <label className="flex flex-col gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    data-cp="cardNumber"
                    className="brutal-input"
                    autoComplete="cc-number"
                    onInput={(event) => {
                      formatCardNumberInput(event);
                      if (fieldErrors.cardNumber) {
                        setFieldErrors((prev) => ({ ...prev, cardNumber: undefined }));
                      }
                    }}
                  />
                  {fieldErrors.cardNumber && (
                    <span className="text-xs text-red-600 font-body">{fieldErrors.cardNumber}</span>
                  )}
                  <span className="text-xs font-body text-gray-dark/80 uppercase tracking-wide">Номер карты</span>
                </label>
                <label className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="IVAN IVANOV"
                    data-cp="name"
                    className="brutal-input"
                    autoComplete="cc-name"
                    onInput={() => {
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                  />
                  {fieldErrors.name && (
                    <span className="text-xs text-red-600 font-body">{fieldErrors.name}</span>
                  )}
                  <span className="text-xs font-body text-gray-dark/80 uppercase tracking-wide">Имя держателя</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM"
                      data-cp="expDateMonth"
                      className="brutal-input"
                      autoComplete="cc-exp-month"
                      onInput={(event) => {
                        sanitizeNumericInput(event, 2);
                        if (fieldErrors.expMonth) {
                          setFieldErrors((prev) => ({ ...prev, expMonth: undefined }));
                        }
                      }}
                    onBlur={padTwoDigitsOnBlur}
                    />
                    {fieldErrors.expMonth && (
                      <span className="text-xs text-red-600 font-body">{fieldErrors.expMonth}</span>
                    )}
                    <span className="text-xs font-body text-gray-dark/80 uppercase tracking-wide">Месяц</span>
                  </label>
                  <label className="flex flex-col gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="YY"
                      data-cp="expDateYear"
                      className="brutal-input"
                      autoComplete="cc-exp-year"
                      onInput={(event) => {
                        sanitizeNumericInput(event, 2);
                        if (fieldErrors.expYear) {
                          setFieldErrors((prev) => ({ ...prev, expYear: undefined }));
                        }
                      }}
                    onBlur={padTwoDigitsOnBlur}
                    />
                    {fieldErrors.expYear && (
                      <span className="text-xs text-red-600 font-body">{fieldErrors.expYear}</span>
                    )}
                    <span className="text-xs font-body text-gray-dark/80 uppercase tracking-wide">Год</span>
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="***"
                    data-cp="cvv"
                    className="brutal-input"
                    autoComplete="cc-csc"
                    onInput={(event) => {
                      sanitizeNumericInput(event, 3);
                      if (fieldErrors.cvv) {
                        setFieldErrors((prev) => ({ ...prev, cvv: undefined }));
                      }
                    }}
                  />
                  {fieldErrors.cvv && (
                    <span className="text-xs text-red-600 font-body">{fieldErrors.cvv}</span>
                  )}
                  <span className="text-xs font-body text-gray-dark/80 uppercase tracking-wide">CVV</span>
                </label>
              </form>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {canGoBack && (
                  <button
                    type="button"
                    className="brutal-button w-full sm:w-auto bg-gray-light text-gray-dark border-4 border-gray-dark"
                    onClick={() => {
                      setFormError(null);
                      setFieldErrors({});
                      setStep('plan');
                    }}
                    disabled={actionLoading}
                  >
                    Назад
                  </button>
                )}
                <button
                  type="button"
                  className="brutal-button w-full sm:w-auto flex items-center justify-center gap-2"
                  onClick={handlePurchasePlan}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="loader" />
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Оплатить
                    </>
                  )}
                </button>
              </div>
            </div>
            {formError && (
              <div className="text-sm text-red-600 font-body">{formError}</div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
