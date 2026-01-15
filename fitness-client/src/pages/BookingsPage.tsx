import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Trash2, User, Clock, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Booking, CoachSlot } from '../api/types';
import { ListSkeleton } from '../components/ui/Skeleton';
import { NoBookingsState, AuthRequiredState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/Modal';
import { formatDateTime } from '../utils/format';
import { HttpError } from '../api/ApiClient';

export const BookingsPage: React.FC = () => {
  const { isAuthenticated, services, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const [bookingForCoach, setBookingForCoach] = useState<Booking | null>(null);
  const [coachSlots, setCoachSlots] = useState<CoachSlot[]>([]);
  const [loadingCoachSlots, setLoadingCoachSlots] = useState(false);
  const [assigningCoachId, setAssigningCoachId] = useState<number | null>(null);

  const ready = useMemo(() => isAuthenticated, [isAuthenticated]);

  useEffect(() => {
    if (!ready) {
      setLoading(false);
      return;
    }
    let aborted = false;
    setLoading(true);

    services.bookings
      .list()
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
  }, [ready, services]);

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

  const openCoachModal = (booking: Booking) => {
    setCoachModalOpen(true);
    setBookingForCoach(booking);
    setCoachSlots([]);
    setLoadingCoachSlots(true);

    services.coachSlots
      .list({ startsAt: booking.starts_at })
      .then(setCoachSlots)
      .catch((err) => {
        toast.error('Не удалось загрузить слоты тренеров');
        console.error(err);
      })
      .finally(() => setLoadingCoachSlots(false));
  };

  const handleSelectCoach = async (coachSlotId: number) => {
    if (!bookingForCoach) return;
    setAssigningCoachId(coachSlotId);
    try {
      await services.bookings.createCoachBooking(bookingForCoach.id, {
        booking: { coach_slot_id: coachSlotId }
      });
      const fresh = await services.bookings.list();
      setBookings(fresh);
      toast.success('Тренер добавлен к бронированию');
      setCoachModalOpen(false);
      setBookingForCoach(null);
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

      {/* Bookings Card */}
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
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-lg uppercase">
                    Бронь #{booking.id}
                  </span>
                </div>

                <div className="space-y-2 text-sm font-body">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-orange-primary" />
                    <span>{formatDateTime(booking.starts_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-orange-primary" />
                    <span>Тренер: {booking.coach_name || 'не выбран'}</span>
                  </div>
                </div>

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
                        Отменить
                      </>
                    )}
                  </button>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      className="brutal-button w-full flex items-center justify-center gap-2 text-sm"
                      onClick={() => openCoachModal(booking)}
                      disabled={coachModalOpen && bookingForCoach?.id === booking.id}
                    >
                      <UserPlus size={16} />
                      Добавить тренера
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
                          Отменить
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <NoBookingsState onNavigate={() => navigate('/new-booking')} />
        )}
      </div>

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

      {/* Coach selection modal */}
      {coachModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-gray-light border-4 border-gray-dark brutal-shadow max-w-lg w-full p-4 space-y-4 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => { setCoachModalOpen(false); setBookingForCoach(null); }}
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-orange-primary" />
              <h4 className="font-display font-bold text-lg">Выберите тренера</h4>
            </div>
            <p className="text-sm font-body text-gray-medium">
              Бронь #{bookingForCoach?.id} — {bookingForCoach ? formatDateTime(bookingForCoach.starts_at) : ''}
            </p>
            {loadingCoachSlots ? (
              <div className="grid grid-cols-1 gap-2">
                {[1,2].map((i) => (
                  <div key={i} className="h-14 bg-gray-200 animate-pulse border-3 border-gray-200" />
                ))}
              </div>
            ) : coachSlots.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {coachSlots.map((slot) => {
                  const coachName = slot.coach
                    ? [slot.coach.first_name, slot.coach.last_name].filter(Boolean).join(' ') || slot.coach.email
                    : `Тренер #${slot.coach_id}`;
                  const isLoading = assigningCoachId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      className="p-3 border-3 border-gray-200 hover:border-orange-primary text-left transition-all"
                      onClick={() => handleSelectCoach(slot.id)}
                      disabled={isLoading}
                    >
                      <div className="font-display font-bold">{coachName}</div>
                      {isLoading && <div className="mt-2 text-sm text-orange-primary">Сохранение...</div>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-gray-light border-3 border-gray-200 text-center">
                <p className="font-body text-gray-medium">Нет доступных тренеров на это время</p>
                <p className="font-body text-sm text-gray-400 mt-1">Попробуйте позже</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
