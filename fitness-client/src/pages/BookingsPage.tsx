import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Trash2, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Booking } from '../api/types';
import { ListSkeleton } from '../components/ui/Skeleton';
import { NoBookingsState, AuthRequiredState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/Modal';
import { formatDateTime } from '../utils/format';

export const BookingsPage: React.FC = () => {
  const { isAuthenticated, services, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
      toast.error(err instanceof Error ? err.message : 'Не удалось отменить бронь');
    } finally {
      setCancellingId(null);
      setConfirmModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      confirmed: 'Подтверждено',
      pending: 'Ожидает',
      cancelled: 'Отменено',
    };
    return (
      <span className={`px-2 py-1 text-xs font-display font-bold uppercase ${styles[status] || 'bg-gray-200 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
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
          <div className="w-16 h-16 bg-white border-4 border-gray-dark brutal-shadow flex items-center justify-center">
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
            onClick={() => navigate('/gyms')}
            className="brutal-button flex items-center gap-2"
          >
            <MapPin size={18} />
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
                className="bg-white border-4 border-gray-dark p-4 brutal-shadow-sm space-y-3 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-lg uppercase">
                    Бронь #{booking.id}
                  </span>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="space-y-2 text-sm font-body">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-orange-primary" />
                    <span>Зал слот: #{booking.gym_slot_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-orange-primary" />
                    <span>
                      Тренер: {booking.coach_slot_id ? `слот #${booking.coach_slot_id}` : 'не выбран'}
                    </span>
                  </div>
                </div>

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
            ))}
          </div>
        ) : (
          <NoBookingsState onNavigate={() => navigate('/gyms')} />
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
    </div>
  );
};
