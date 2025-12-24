import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Gym, GymSlot, CoachSlot } from '../api/types';
import { formatDateTime } from '../utils/format';
import { ListSkeleton, SlotSkeleton } from '../components/ui/Skeleton';
import { AuthRequiredState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Loader';

export const GymsPage: React.FC = () => {
  const { isAuthenticated, services } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<number | null>(null);
  const [gymSlots, setGymSlots] = useState<GymSlot[]>([]);
  const [coachSlots, setCoachSlots] = useState<CoachSlot[]>([]);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState<{ gym_slot_id: number | null; coach_slot_id?: number | null }>({
    gym_slot_id: null,
    coach_slot_id: null
  });

  const ready = useMemo(() => isAuthenticated, [isAuthenticated]);

  useEffect(() => {
    if (!ready) {
      setLoadingGyms(false);
      return;
    }
    let aborted = false;
    setLoadingGyms(true);

    Promise.all([services.gyms.list(), services.coachSlots.list()])
      .then(([gymsData, coachData]) => {
        if (aborted) return;
        setGyms(gymsData);
        setCoachSlots(coachData);
        if (!selectedGymId && gymsData.length) {
          setSelectedGymId(gymsData[0].id);
        }
      })
      .catch((err) => {
        toast.error('Не удалось загрузить залы');
        console.error(err);
      })
      .finally(() => {
        if (!aborted) setLoadingGyms(false);
      });

    return () => { aborted = true; };
  }, [ready, services]);

  useEffect(() => {
    if (!ready || !selectedGymId) {
      setGymSlots([]);
      return;
    }
    let aborted = false;
    setLoadingSlots(true);

    services.gymSlots
      .list(selectedGymId)
      .then((data) => {
        if (!aborted) setGymSlots(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!aborted) setLoadingSlots(false);
      });

    return () => { aborted = true; };
  }, [ready, selectedGymId, services]);

  const handleCreateBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingForm.gym_slot_id) return;

    setActionLoading(true);
    try {
      await services.bookings.create({
        booking: {
          gym_slot_id: bookingForm.gym_slot_id,
          coach_slot_id: bookingForm.coach_slot_id || undefined
        }
      });
      toast.success('Бронирование создано успешно!');
      setBookingForm({ gym_slot_id: null, coach_slot_id: null });
      // Refresh slots
      if (selectedGymId) {
        const freshSlots = await services.gymSlots.list(selectedGymId);
        setGymSlots(freshSlots);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось создать бронь');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedGym = gyms.find(g => g.id === selectedGymId);
  const selectedSlot = gymSlots.find(s => s.id === bookingForm.gym_slot_id);

  if (!ready) {
    return (
      <div className="container mx-auto">
        <div className="brutal-card">
          <AuthRequiredState onNavigate={() => navigate('/auth')} />
        </div>
      </div>
    );
  }

  if (loadingGyms) {
    return (
      <div className="container mx-auto">
        <PageLoader text="Загрузка залов..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="brutal-card">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-primary border-4 border-gray-dark brutal-shadow-sm flex items-center justify-center">
            <MapPin size={24} className="text-white" />
          </div>
          <div>
            <h2 className="brutal-title text-2xl md:text-3xl mb-0">Спортзалы</h2>
            <p className="text-sm font-body text-gray-medium">Выберите зал и забронируйте слот</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gyms List */}
          <div className="space-y-4">
            <label className="brutal-label">Выберите зал</label>
            <select
              className="brutal-select"
              value={selectedGymId ?? ''}
              onChange={(e) => {
                setSelectedGymId(Number(e.target.value));
                setBookingForm({ gym_slot_id: null, coach_slot_id: null });
              }}
            >
              <option value="">— Выберите зал —</option>
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name} · до {gym.capacity} чел.
                </option>
              ))}
            </select>

            {/* Gym Cards */}
            <div className="space-y-3">
              {gyms.map((gym, index) => (
                <button
                  key={gym.id}
                  type="button"
                  onClick={() => {
                    setSelectedGymId(gym.id);
                    setBookingForm({ gym_slot_id: null, coach_slot_id: null });
                  }}
                  className={`
                    w-full text-left p-4 border-4 border-gray-dark transition-all duration-200
                    opacity-0 animate-fade-in-up
                    ${selectedGymId === gym.id
                      ? 'bg-orange-primary text-white brutal-shadow'
                      : 'bg-white hover:bg-gray-light brutal-shadow-sm'}
                  `}
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className={selectedGymId === gym.id ? 'text-white' : 'text-orange-primary'} />
                    <div className="flex-1">
                      <div className="font-display font-bold text-lg uppercase">{gym.name}</div>
                      <p className={`text-sm font-body ${selectedGymId === gym.id ? 'text-white/80' : 'text-gray-medium'}`}>
                        {gym.address}
                      </p>
                      {gym.description && (
                        <p className={`text-xs font-body mt-1 ${selectedGymId === gym.id ? 'text-white/70' : 'text-gray-400'}`}>
                          {gym.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Users size={14} />
                        <span className="text-xs font-display font-bold uppercase">
                          Вместимость: {gym.capacity}
                        </span>
                      </div>
                    </div>
                    {selectedGymId === gym.id && (
                      <CheckCircle size={20} className="text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Slots */}
          <div className="space-y-4">
            <label className="brutal-label">
              Доступные слоты {selectedGym && `· ${selectedGym.name}`}
            </label>

            {loadingSlots ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => <SlotSkeleton key={i} />)}
              </div>
            ) : gymSlots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {gymSlots.map((slot, index) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setBookingForm((prev) => ({ ...prev, gym_slot_id: slot.id }))}
                    className={`
                      p-4 border-4 font-display text-left transition-all duration-200
                      opacity-0 animate-fade-in
                      ${bookingForm.gym_slot_id === slot.id
                        ? 'bg-orange-primary text-white border-gray-dark brutal-shadow'
                        : 'bg-white border-gray-dark hover:border-orange-primary brutal-shadow-sm'}
                    `}
                    style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} />
                      <span className="font-bold">{formatDateTime(slot.starts_at)}</span>
                    </div>
                    <div className={`text-xs uppercase ${bookingForm.gym_slot_id === slot.id ? 'text-white/80' : 'text-gray-medium'}`}>
                      до {formatDateTime(slot.ends_at)}
                    </div>
                    <div className={`
                      inline-block mt-2 px-2 py-1 text-xs font-bold uppercase
                      ${slot.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-600'}
                      ${bookingForm.gym_slot_id === slot.id ? 'bg-white/20 text-white' : ''}
                    `}>
                      {slot.status === 'available' ? 'Свободен' : slot.status}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-light border-4 border-gray-200">
                <Calendar size={40} className="mx-auto text-gray-400 mb-3" />
                <p className="font-body text-gray-medium">
                  {selectedGymId ? 'Нет доступных слотов' : 'Выберите зал для просмотра слотов'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleCreateBooking} className="border-t-4 border-gray-dark mt-6 pt-6 space-y-4">
          <h3 className="brutal-subtitle">Оформление бронирования</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="brutal-label">Тренер (опционально)</label>
              <select
                className="brutal-select"
                value={bookingForm.coach_slot_id ?? ''}
                onChange={(e) =>
                  setBookingForm((prev) => ({
                    ...prev,
                    coach_slot_id: e.target.value ? Number(e.target.value) : null
                  }))
                }
                disabled={!coachSlots.length}
              >
                <option value="">Без тренера</option>
                {coachSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    Тренер #{slot.id} · {formatDateTime(slot.starts_at)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="brutal-label">Выбранный слот</label>
              <div className={`
                p-3 border-4 border-gray-dark font-body font-medium
                ${selectedSlot ? 'bg-orange-primary/10 border-orange-primary' : 'bg-gray-light'}
              `}>
                {selectedSlot ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-orange-primary" />
                    <span>{formatDateTime(selectedSlot.starts_at)} - {formatDateTime(selectedSlot.ends_at)}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Выберите слот из списка</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="brutal-button w-full flex items-center justify-center gap-2"
            disabled={!bookingForm.gym_slot_id || actionLoading}
          >
            {actionLoading ? (
              <span className="loader" />
            ) : (
              <>
                <Calendar size={18} />
                Забронировать слот
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
