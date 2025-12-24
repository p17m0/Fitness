import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Wallet, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { ClientSubscription, SubscriptionPlan } from '../api/types';
import { formatDateTime, formatPrice } from '../utils/format';
import { ListSkeleton } from '../components/ui/Skeleton';
import { AuthRequiredState, NoSubscriptionsState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Loader';

export const SubscriptionsPage: React.FC = () => {
  const { isAuthenticated, services } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [clientSubscriptions, setClientSubscriptions] = useState<ClientSubscription[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const ready = useMemo(() => isAuthenticated, [isAuthenticated]);

  useEffect(() => {
    if (!ready) {
      setLoading(false);
      return;
    }
    let aborted = false;
    setLoading(true);

    Promise.all([services.subscriptionPlans.list(), services.clientSubscriptions.list()])
      .then(([plans, subs]) => {
        if (aborted) return;
        setSubscriptionPlans(plans);
        setClientSubscriptions(subs);
      })
      .catch((err) => {
        toast.error('Не удалось загрузить данные');
        console.error(err);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });

    return () => { aborted = true; };
  }, [ready, services]);

  const handlePurchasePlan = async () => {
    if (!selectedPlanId) return;

    setActionLoading(true);
    try {
      await services.clientSubscriptions.create({
        client_subscription: { subscription_plan_id: selectedPlanId }
      });
      const fresh = await services.clientSubscriptions.list();
      setClientSubscriptions(fresh);
      setSelectedPlanId(null);
      toast.success('Абонемент успешно приобретён!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось купить абонемент');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);

  if (!ready) {
    return (
      <div className="container mx-auto">
        <div className="brutal-card">
          <AuthRequiredState onNavigate={() => navigate('/auth')} />
        </div>
      </div>
    );
  }

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

        {subscriptionPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {subscriptionPlans.map((plan, index) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={`
                  text-left p-5 border-4 border-gray-dark transition-all duration-200
                  opacity-0 animate-fade-in-up
                  ${selectedPlanId === plan.id
                    ? 'bg-orange-primary text-white brutal-shadow-lg scale-[1.02]'
                    : 'bg-white hover:bg-gray-light brutal-shadow'}
                `}
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-display font-bold text-lg uppercase">{plan.name}</div>
                  {selectedPlanId === plan.id && <CheckCircle size={20} />}
                </div>

                <div className={`text-3xl font-display font-bold mb-3 ${selectedPlanId === plan.id ? '' : 'text-orange-primary'}`}>
                  {formatPrice(plan.price_cents, plan.currency)}
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
        ) : (
          <NoSubscriptionsState />
        )}

        {/* Purchase Section */}
        {selectedPlan && (
          <div className="border-t-4 border-gray-dark pt-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 p-4 bg-orange-primary/10 border-4 border-orange-primary">
              <div>
                <p className="font-display font-bold uppercase">Выбранный план:</p>
                <p className="font-body text-lg">
                  {selectedPlan.name} — {formatPrice(selectedPlan.price_cents, selectedPlan.currency)}
                </p>
              </div>
              <button
                className="brutal-button flex items-center gap-2"
                onClick={handlePurchasePlan}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className="loader" />
                ) : (
                  <>
                    <CreditCard size={18} />
                    Купить
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* My Subscriptions */}
      <div className="brutal-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-dark border-4 border-gray-dark brutal-shadow-sm flex items-center justify-center">
            <ShoppingCart size={24} className="text-white" />
          </div>
          <div>
            <h3 className="brutal-title text-xl md:text-2xl mb-0">Мои абонементы</h3>
            <p className="text-sm font-body text-gray-medium">
              {clientSubscriptions.length} активных
            </p>
          </div>
        </div>

        {clientSubscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientSubscriptions.map((sub, index) => (
              <div
                key={sub.id}
                className="bg-white border-4 border-gray-dark p-4 brutal-shadow-sm opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-bold text-lg">Абонемент #{sub.id}</span>
                  <span className={`
                    px-2 py-1 text-xs font-display font-bold uppercase
                    ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {sub.status === 'active' ? 'Активен' : sub.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm font-body">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-medium">Осталось посещений:</span>
                    <span className="font-display font-bold text-orange-primary text-lg">
                      {sub.remaining_visits}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-medium">Истекает:</span>
                    <span className="font-display font-bold">
                      {sub.expires_at ? formatDateTime(sub.expires_at) : 'Бессрочно'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {sub.remaining_visits !== undefined && (
                  <div className="mt-3 h-2 bg-gray-200 border-2 border-gray-dark">
                    <div
                      className="h-full bg-orange-primary transition-all duration-500"
                      style={{ width: `${Math.min(100, (sub.remaining_visits / 30) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 font-body text-gray-medium">
            У вас пока нет активных абонементов. Выберите план выше!
          </p>
        )}
      </div>
    </div>
  );
};
