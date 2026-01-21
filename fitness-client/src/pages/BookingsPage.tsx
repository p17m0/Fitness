import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Trash2, User, Clock, UserPlus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Booking, CoachSlot, ClientSubscription } from '../api/types';
import { ListSkeleton } from '../components/ui/Skeleton';
import { NoBookingsState, AuthRequiredState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/Modal';
import { formatDate, formatDateTime, formatTime } from '../utils/format';
import { HttpError } from '../api/ApiClient';

export const BookingsPage: React.FC = () => {
  const { isAuthenticated, services, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'subscriptions'>('bookings');
  const [showExpiredBookings, setShowExpiredBookings] = useState(false);
  const [showExpiredSubscriptions, setShowExpiredSubscriptions] = useState(false);
  const [clientSubscriptions, setClientSubscriptions] = useState<ClientSubscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingForCoach, setBookingForCoach] = useState<Booking | null>(null);
  const [coachSlots, setCoachSlots] = useState<CoachSlot[]>([]);
  const [loadingCoachSlots, setLoadingCoachSlots] = useState(false);
  const [assigningCoachId, setAssigningCoachId] = useState<number | null>(null);
  const [selectedCoachSlotId, setSelectedCoachSlotId] = useState<number | null>(null);
  const coachSlotsRequestIdRef = useRef(0);

  const ready = useMemo(() => isAuthenticated, [isAuthenticated]);
  const subscriptionsCountLabel = showExpiredSubscriptions ? 'Архив' : 'Активные';
  const subscriptionsCount = clientSubscriptions.length;

  useEffect(() => {
    if (!ready) {
      setLoading(false);
      return;
    }
    let aborted = false;
    setLoading(true);

    services.bookings
      .list({ isExpired: showExpiredBookings })
      .then((data) => {
        if (!aborted) setBookings(data);
      })
      .catch((err) => {
        toast.error('Не удалось загрузить бронирования');
        console.error(err);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });

    return () => { aborted = true; };
  }, [ready, services, showExpiredBookings]);

  useEffect(() => {
    if (!ready) {
      setClientSubscriptions([]);
      setLoadingSubscriptions(false);
      return;
    }
    let aborted = false;
    setLoadingSubscriptions(true);

    services.clientSubscriptions
      .list({ isExpired: showExpiredSubscriptions })
      .then((data) => {
        if (!aborted) setClientSubscriptions(data);
      })
      .catch((err) => {
        if (err instanceof HttpError && err.status === 401) {
          if (!aborted) setClientSubscriptions([]);
          return;
        }
        toast.error('Не удалось загрузить абонементы');
        console.error(err);
      })
      .finally(() => {
        if (!aborted) setLoadingSubscriptions(false);
      });

    return () => { aborted = true; };
  }, [ready, services, toast, showExpiredSubscriptions]);

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setConfirmModalOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancellingId(selectedBooking.id);
    try {
      await services.bookings.cancel(selectedBooking.id);
      setBookings((prev) => prev.filter((b) => b.id !== selectedBooking.id));
      toast.success('Бронирование отменено');
    } catch (err) {
      if (err instanceof HttpError && err.status >= 400 && err.status < 500) {
        toast.error(err.message || 'Не удалось отменить бронь');
      } else {
        toast.error('Не удалось отменить бронь');
      }
    } finally {
      setCancellingId(null);
      setConfirmModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const closeCoachPanel = () => {
    coachSlotsRequestIdRef.current += 1;
    setBookingForCoach(null);
    setCoachSlots([]);
    setLoadingCoachSlots(false);
    setSelectedCoachSlotId(null);
  };

  const handleBookingsFilterChange = (expired: boolean) => {
    if (showExpiredBookings === expired) return;
    closeCoachPanel();
    setShowExpiredBookings(expired);
  };

  const handleSubscriptionsFilterChange = (expired: boolean) => {
    if (showExpiredSubscriptions === expired) return;
    setShowExpiredSubscriptions(expired);
  };

  const openCoachPanel = (booking: Booking) => {
    if (bookingForCoach?.id === booking.id) {
      closeCoachPanel();
      return;
    }

    const requestId = coachSlotsRequestIdRef.current + 1;
    coachSlotsRequestIdRef.current = requestId;

    setBookingForCoach(booking);
    setCoachSlots([]);
    setLoadingCoachSlots(true);
    setSelectedCoachSlotId(null);

    services.coachSlots
      .list({ startsAt: booking.starts_at })
      .then((data) => {
        if (coachSlotsRequestIdRef.current === requestId) {
          setCoachSlots(data);
        }
      })
      .catch((err) => {
        if (coachSlotsRequestIdRef.current !== requestId) return;
        toast.error('Не удалось загрузить слоты тренеров');
        console.error(err);
      })
      .finally(() => {
        if (coachSlotsRequestIdRef.current === requestId) {
          setLoadingCoachSlots(false);
        }
      });
  };

  const handleSelectCoach = async (coachSlotId: number) => {
    if (!bookingForCoach) return;
    setAssigningCoachId(coachSlotId);
    try {
      await services.bookings.createCoachBooking(bookingForCoach.id, {
        booking: { coach_slot_id: coachSlotId }
      });
      const fresh = await services.bookings.list({ isExpired: showExpiredBookings });
      setBookings(fresh);
      toast.success('Тренер добавлен к бронированию');
      closeCoachPanel();
    } catch (err) {
      if (err instanceof HttpError && err.status >= 400 && err.status < 500) {
        toast.error(err.message || 'Не удалось добавить тренера');
      } else {
        toast.error('Не удалось добавить тренера');
      }
    } finally {
      setAssigningCoachId(null);
    }
  };

  const handleConfirmCoach = () => {
    if (selectedCoachSlotId === null) return;
    handleSelectCoach(selectedCoachSlotId);
  };

  if (!ready) {
    return (
      <div className="container mx-auto">
        <div className="brutal-card">
          <AuthRequiredState onNavigate={() => navigate('/auth')} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* User Info Card */}
      <div className="brutal-card bg-orange-primary text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-light border-4 border-gray-dark brutal-shadow flex items-center justify-center">
            <User size={32} className="text-orange-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl uppercase">Личный кабинет</h2>
            <p className="font-body text-white/80">
              {user?.email || user?.phone_number || 'Клиент'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="brutal-card p-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 border-3 text-sm font-display uppercase transition-all
              ${activeTab === 'bookings'
                ? 'bg-orange-primary text-white border-gray-dark'
                : 'bg-gray-light border-gray-200 hover:border-gray-dark'}`}
          >
            Мои бронирования
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 border-3 text-sm font-display uppercase transition-all
              ${activeTab === 'subscriptions'
                ? 'bg-orange-primary text-white border-gray-dark'
                : 'bg-gray-light border-gray-200 hover:border-gray-dark'}`}
          >
            Мои подписки
          </button>
        </div>
      </div>

      {/* Bookings Card */}
      {activeTab === 'bookings' && (
        <div className="brutal-card">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-primary border-4 border-gray-dark brutal-shadow-sm flex items-center justify-center">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <h3 className="brutal-title text-xl md:text-2xl mb-0">Мои бронирования</h3>
            <p className="text-sm font-body text-gray-medium">
              {bookings.length} {bookings.length === 1 ? 'бронь' : bookings.length < 5 ? 'брони' : 'броней'}
              {' • '}
              {showExpiredBookings ? 'прошедшие' : 'предстоящие'}
            </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/new-booking')}
            className="brutal-button flex items-center gap-2"
          >
            <Calendar size={18} />
            Новая бронь
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleBookingsFilterChange(false)}
            className={`px-4 py-2 border-3 text-sm font-display uppercase transition-all
              ${!showExpiredBookings
                ? 'bg-orange-primary text-white border-gray-dark'
                : 'bg-gray-light border-gray-200 hover:border-gray-dark'}`}
          >
            Предстоящие
          </button>
          <button
            type="button"
            onClick={() => handleBookingsFilterChange(true)}
            className={`px-4 py-2 border-3 text-sm font-display uppercase transition-all
              ${showExpiredBookings
                ? 'bg-orange-primary text-white border-gray-dark'
                : 'bg-gray-light border-gray-200 hover:border-gray-dark'}`}
          >
            Прошедшие
          </button>
        </div>

        {loading ? (
          <ListSkeleton count={3} />
        ) : bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((booking, index) => (
              <div
                key={booking.id}
                className="bg-gray-light border-4 border-gray-dark p-4 brutal-shadow-sm space-y-3 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="space-y-2">
                  <div className="bg-white border-3 border-gray-200 px-3 py-2 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] font-body uppercase tracking-wide text-gray-medium">
                        Дата
                      </div>
                      <div className="font-display font-bold text-lg text-right">
                        {formatDate(booking.starts_at)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] font-body uppercase tracking-wide text-gray-medium">
                        Время
                      </div>
                      <div className="font-display font-bold text-lg text-right">
                        {formatTime(booking.starts_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-body text-gray-medium">
                    Бронь #{booking.id}
                  </div>
                </div>

                {booking.coach_name && (
                  <div className="space-y-2 text-sm font-body">
                    <div className="flex items-start gap-2">
                      <User size={16} className="text-orange-primary mt-0.5" />
                      <div>
                        <div>Тренер: {booking.coach_name}</div>
                        {booking.coach_number && (
                          <div className="text-xs text-gray-medium">
                            Телефон: {booking.coach_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!showExpiredBookings && (
                  <div className="pt-3 mt-1 border-t-3 border-gray-200 space-y-2">
                    {booking.coach_name ? (
                      <button
                        className="brutal-button-danger w-full flex items-center justify-center gap-2 text-sm"
                        onClick={() => handleCancelClick(booking)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? (
                          <span className="loader" />
                        ) : (
                          <>
                            <Trash2 size={16} />
                            Отменить бронь
                          </>
                        )}
                      </button>
                    ) : (
                      <>
                        <button
                          className="brutal-button w-full flex items-center justify-center gap-2 text-sm"
                          onClick={() => openCoachPanel(booking)}
                          disabled={assigningCoachId !== null}
                        >
                          <UserPlus size={16} />
                          {bookingForCoach?.id === booking.id ? 'Скрыть выбор' : 'Выбрать тренера'}
                        </button>
                        <button
                          className="brutal-button-danger w-full flex items-center justify-center gap-2 text-sm"
                          onClick={() => handleCancelClick(booking)}
                          disabled={cancellingId === booking.id}
                        >
                          {cancellingId === booking.id ? (
                            <span className="loader" />
                          ) : (
                            <>
                              <Trash2 size={16} />
                              Отменить бронь
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {bookingForCoach?.id === booking.id && (
                  <div className="mt-4 border-4 border-gray-dark bg-white p-4 space-y-4 brutal-shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-display font-bold text-lg">Выбор тренера</div>
                        <div className="text-sm font-body text-gray-medium">
                          Подберите тренера на выбранное время
                        </div>
                      </div>
                      <button
                        className="text-sm font-body text-orange-primary hover:underline"
                        onClick={closeCoachPanel}
                        disabled={assigningCoachId !== null}
                      >
                        Скрыть
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-body text-gray-medium">
                      <Clock size={16} className="text-orange-primary" />
                      <span>{formatDateTime(booking.starts_at)}</span>
                    </div>

                    {loadingCoachSlots ? (
                      <div className="grid grid-cols-1 gap-3">
                        {[1,2].map((i) => (
                          <div key={i} className="h-14 bg-gray-200 animate-pulse border-3 border-gray-200" />
                        ))}
                      </div>
                    ) : coachSlots.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {coachSlots.map((slot) => {
                          const coachName = slot.coach
                            ? [slot.coach.first_name, slot.coach.last_name].filter(Boolean).join(' ') || slot.coach.email
                            : `Тренер #${slot.coach_id}`;
                          const isSelected = selectedCoachSlotId === slot.id;
                          return (
                            <button
                              key={slot.id}
                              className={`p-4 border-3 text-left transition-all
                                ${isSelected
                                  ? 'bg-orange-primary text-white border-gray-dark'
                                  : 'bg-gray-light border-gray-200 hover:border-orange-primary'}`}
                              onClick={() => setSelectedCoachSlotId(slot.id)}
                              disabled={assigningCoachId !== null}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-display font-bold">{coachName}</div>
                                  <div className={`text-sm font-body ${isSelected ? 'text-white/80' : 'text-gray-medium'}`}>
                                    {slot.coach?.specialization || 'Персональный тренер'}
                                  </div>
                                </div>
                                {isSelected && (
                                  <span className="text-[11px] font-body uppercase tracking-wide border-2 border-white/70 px-2 py-1">
                                    Выбрано
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-light border-3 border-gray-200 text-center">
                        <p className="font-body text-gray-medium">Нет доступных тренеров на это время</p>
                        <p className="font-body text-sm text-gray-400 mt-1">Попробуйте выбрать другое время</p>
                      </div>
                    )}

                    {coachSlots.length > 0 && (
                      <>
                        <p className="text-xs font-body text-gray-medium">
                          {selectedCoachSlotId === null
                            ? 'Выберите тренера, чтобы продолжить.'
                            : 'Нажмите "Добавить тренера", чтобы подтвердить.'}
                        </p>
                        <button
                          onClick={handleConfirmCoach}
                          className="brutal-button w-full flex items-center justify-center gap-2"
                          disabled={assigningCoachId !== null || selectedCoachSlotId === null}
                        >
                          {assigningCoachId !== null ? (
                            <span className="loader" />
                          ) : (
                            <>
                              <UserPlus size={16} />
                              Добавить тренера
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <NoBookingsState onNavigate={() => navigate('/new-booking')} />
        )}
        </div>
      )}

      {/* My Subscriptions */}
      {activeTab === 'subscriptions' && (
        <div className="brutal-card">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-dark border-4 border-gray-dark brutal-shadow-sm flex items-center justify-center">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h3 className="brutal-title text-xl md:text-2xl mb-0">Мои подписки</h3>
              <p className="text-sm font-body text-gray-medium">
                {loadingSubscriptions
                  ? 'Загрузка...'
                  : `${subscriptionsCountLabel}: ${subscriptionsCount}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/subscriptions')}
            className="brutal-button flex items-center gap-2"
          >
            <ShoppingCart size={18} />
            Купить абонемент
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleSubscriptionsFilterChange(false)}
            className={`px-4 py-2 border-3 text-sm font-display uppercase transition-all
              ${!showExpiredSubscriptions
                ? 'bg-orange-primary text-white border-gray-dark'
                : 'bg-gray-light border-gray-200 hover:border-gray-dark'}`}
            disabled={loadingSubscriptions}
          >
            Активные
          </button>
          <button
            type="button"
            onClick={() => handleSubscriptionsFilterChange(true)}
            className={`px-4 py-2 border-3 text-sm font-display uppercase transition-all
              ${showExpiredSubscriptions
                ? 'bg-orange-primary text-white border-gray-dark'
                : 'bg-gray-light border-gray-200 hover:border-gray-dark'}`}
            disabled={loadingSubscriptions}
          >
            Архив
          </button>
        </div>

        {loadingSubscriptions ? (
          <ListSkeleton count={2} />
        ) : clientSubscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientSubscriptions.map((sub, index) => (
              <div
                key={sub.id}
                className="bg-gray-light border-4 border-gray-dark p-4 brutal-shadow-sm opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="text-xs font-body text-gray-medium uppercase tracking-wide">Подписка</div>
                    <div className="font-display font-bold text-lg">#{sub.id}</div>
                  </div>
                  <span className={`
                    px-2 py-1 text-xs font-display font-bold uppercase
                    ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {sub.status === 'active' ? 'Активна' : sub.status}
                  </span>
                </div>

                <div className="bg-white border-3 border-gray-200 p-3 mb-3">
                  <div className="text-[11px] font-body uppercase tracking-wide text-gray-medium">
                    Осталось посещений
                  </div>
                  <div className="font-display font-bold text-3xl text-orange-primary">
                    {sub.remaining_visits}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm font-body">
                  <span className="text-gray-medium">Истекает</span>
                  <span className="font-display font-bold">
                    {sub.expires_at ? formatDateTime(sub.expires_at) : 'Бессрочно'}
                  </span>
                </div>

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
          <div className="text-center py-8 space-y-3">
            <p className="font-body text-gray-medium">
              {showExpiredSubscriptions
                ? 'Архив подписок пока пуст.'
                : 'У вас пока нет активных подписок.'}
            </p>
            {!showExpiredSubscriptions && (
              <button
                className="brutal-button"
                onClick={() => navigate('/subscriptions')}
              >
                Выбрать абонемент
              </button>
            )}
          </div>
        )}
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleCancelBooking}
        title="Отмена бронирования"
        message={`Вы уверены, что хотите отменить бронь #${selectedBooking?.id}? Это действие нельзя отменить.`}
        confirmText="Да, отменить"
        cancelText="Назад"
        variant="danger"
        loading={cancellingId !== null}
      />

    </div>
  );
};
