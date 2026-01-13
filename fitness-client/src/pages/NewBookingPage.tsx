import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Gym, GymSlot, CoachSlot, ClientSubscription } from '../api/types';
import { AuthRequiredState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Loader';
import { HttpError } from '../api/ApiClient';

// Форматирование даты
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
};

const formatTime = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.toDateString() === d2.toDateString();
};

// Генерация дней для выбора (следующие 14 дней)
const generateDays = (count: number = 14): Date[] => {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    days.push(day);
  }
  return days;
};

export const NewBookingPage: React.FC = () => {
  const { isAuthenticated, services } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const preselectedGymId = searchParams.get('gym');

  // Data states
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [gymSlots, setGymSlots] = useState<GymSlot[]>([]);
  const [coachSlots, setCoachSlots] = useState<CoachSlot[]>([]);
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);

  // Loading states
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Selection states
  const [selectedGymId, setSelectedGymId] = useState<number | null>(
    preselectedGymId ? Number(preselectedGymId) : null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedCoachSlotId, setSelectedCoachSlotId] = useState<number | null>(null);

  // UI state
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: gym, 2: date/time, 3: coach

  const days = useMemo(() => generateDays(14), []);
  const ready = useMemo(() => isAuthenticated, [isAuthenticated]);

  const selectedSlot = useMemo(
    () => gymSlots.find((s) => s.id === selectedSlotId) || null,
    [gymSlots, selectedSlotId]
  );

  const hasActiveSubscription = useMemo(
    () =>
      subscriptions.some(
        (sub) =>
          sub.status === 'active' &&
          sub.remaining_visits > 0 &&
          (!sub.expires_at || new Date(sub.expires_at) >= new Date())
      ),
    [subscriptions]
  );

  // Фильтрация слотов по выбранной дате
  const slotsForSelectedDate = useMemo(() => {
    return gymSlots
      .filter((slot) => {
        const slotDate = new Date(slot.starts_at);
        return isSameDay(slotDate, selectedDate) && slot.status === 'available';
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }, [gymSlots, selectedDate]);

  // Группировка одинаковых слотов по времени (capacity)
  const groupedSlots = useMemo(() => {
    const map = new Map<string, { slot: GymSlot; count: number }>();
    slotsForSelectedDate.forEach((slot) => {
      const key = `${slot.starts_at}-${slot.ends_at}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { slot, count: 1 });
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.slot.starts_at).getTime() - new Date(b.slot.starts_at).getTime()
    );
  }, [slotsForSelectedDate]);

  // Загрузка залов и подписок
  useEffect(() => {
    if (!ready) {
      setLoadingGyms(false);
      return;
    }
    let aborted = false;

    Promise.all([services.gyms.list(), services.clientSubscriptions.list()])
      .then(([gymsData, subsData]) => {
        if (aborted) return;
        setGyms(gymsData);
        setSubscriptions(subsData);
        if (preselectedGymId && gymsData.some((g) => g.id === Number(preselectedGymId))) {
          setSelectedGymId(Number(preselectedGymId));
          setStep(2);
        }
      })
      .catch((err) => {
        toast.error('Не удалось загрузить данные');
        console.error(err);
      })
      .finally(() => {
        if (!aborted) setLoadingGyms(false);
      });

    return () => { aborted = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, services, preselectedGymId]);

  // Загрузка слотов зала
  useEffect(() => {
    if (!ready || !selectedGymId || !hasActiveSubscription) {
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
  }, [ready, selectedGymId, services, hasActiveSubscription]);

  // Загрузка слотов тренеров
  useEffect(() => {
    if (!ready || !selectedSlot || !hasActiveSubscription) {
      setCoachSlots([]);
      return;
    }
    let aborted = false;
    setLoadingCoaches(true);

    const startsAt = selectedSlot.starts_at;

    services.coachSlots
      .list({ startsAt })
      .then((data) => {
        if (!aborted) setCoachSlots(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!aborted) setLoadingCoaches(false);
      });

    return () => { aborted = true; };
  }, [ready, selectedSlot, services, hasActiveSubscription]);

  const handleGymSelect = useCallback((gymId: number) => {
    setSelectedGymId(gymId);
    setSelectedSlotId(null);
    setSelectedCoachSlotId(null);
    setStep(2);
  }, []);

  const handleSlotSelect = useCallback((slotId: number) => {
    setSelectedSlotId(slotId);
    setSelectedCoachSlotId(null);
    setStep(3);
  }, []);

  const handleSubmit = async () => {
    if (!selectedSlotId) return;

    setSubmitting(true);
    try {
      await services.bookings.create({
        booking: {
          gym_slot_id: selectedSlotId,
          coach_slot_id: selectedCoachSlotId || undefined
        }
      });
      toast.success('Бронирование создано!');
      navigate('/bookings');
    } catch (err) {
      if (err instanceof HttpError && err.status >= 400 && err.status < 500) {
        toast.error(err.message || 'Ошибка бронирования');
      } else {
        toast.error('Ошибка бронирования');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedGym = gyms.find((g) => g.id === selectedGymId);

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
        <PageLoader text="Загрузка..." />
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="container mx-auto">
        <div className="brutal-card text-center py-12">
          <Calendar size={48} className="mx-auto text-orange-primary mb-4" />
          <h2 className="brutal-title text-2xl mb-2">Нужен абонемент</h2>
          <p className="font-body text-gray-medium mb-6">
            Для бронирования слотов необходим активный абонемент
          </p>
          <button
            onClick={() => navigate('/subscriptions')}
            className="brutal-button"
          >
            Выбрать абонемент
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="brutal-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="brutal-title text-xl md:text-2xl mb-0">Новое бронирование</h2>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 flex items-center justify-center font-display font-bold text-sm border-3 border-gray-dark
                  ${step >= s ? 'bg-orange-primary text-white' : 'bg-gray-light text-gray-medium'}`}
              >
                {step > s ? <Check size={16} /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Gym */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="brutal-subtitle flex items-center gap-2">
              <MapPin size={20} className="text-orange-primary" />
              Выберите зал
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {gyms.map((gym) => (
                <button
                  key={gym.id}
                  onClick={() => handleGymSelect(gym.id)}
                  className={`p-4 border-4 text-left transition-all duration-200
                    ${selectedGymId === gym.id
                      ? 'bg-orange-primary text-white border-gray-dark brutal-shadow'
                      : 'bg-white border-gray-dark hover:border-orange-primary brutal-shadow-sm'}`}
                >
                  <div className="font-display font-bold uppercase">{gym.name}</div>
                  <div className={`text-sm font-body mt-1 ${selectedGymId === gym.id ? 'text-white/80' : 'text-gray-medium'}`}>
                    {gym.address}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && selectedGym && (
          <div className="space-y-6 animate-fade-in">
            {/* Selected Gym Header */}
            <div className="flex items-center justify-between p-3 bg-gray-light border-3 border-gray-200">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-orange-primary" />
                <span className="font-display font-bold">{selectedGym.name}</span>
              </div>
              <button
                onClick={() => { setStep(1); setSelectedSlotId(null); }}
                className="text-sm font-body text-orange-primary hover:underline"
              >
                Изменить
              </button>
            </div>

            {/* Date Picker */}
            <div>
              <h3 className="brutal-subtitle flex items-center gap-2 mb-3">
                <Calendar size={20} className="text-orange-primary" />
                Выберите дату
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                {days.map((day, index) => {
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);
                  return (
                    <button
                      key={index}
                      onClick={() => { setSelectedDate(day); setSelectedSlotId(null); }}
                      className={`flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center border-3 transition-all
                        ${isSelected
                          ? 'bg-orange-primary text-white border-gray-dark brutal-shadow-sm'
                          : 'bg-white border-gray-200 hover:border-orange-primary'}`}
                    >
                      <span className={`text-xs font-body uppercase ${isSelected ? 'text-white/80' : 'text-gray-medium'}`}>
                        {isToday ? 'Сегодня' : day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                      </span>
                      <span className="text-xl font-display font-bold">{day.getDate()}</span>
                      <span className={`text-xs font-body ${isSelected ? 'text-white/80' : 'text-gray-medium'}`}>
                        {day.toLocaleDateString('ru-RU', { month: 'short' })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="brutal-subtitle flex items-center gap-2 mb-3">
                <Clock size={20} className="text-orange-primary" />
                Выберите время
              </h3>
              {loadingSlots ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 animate-pulse border-3 border-gray-200" />
                  ))}
                </div>
              ) : groupedSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {groupedSlots.map(({ slot, count }) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <button
                        key={`${slot.starts_at}-${slot.ends_at}`}
                        onClick={() => handleSlotSelect(slot.id)}
                        className={`h-12 flex flex-col items-center justify-center font-display font-bold border-3 transition-all text-center leading-tight
                          ${isSelected
                            ? 'bg-orange-primary text-white border-gray-dark brutal-shadow-sm'
                            : 'bg-white border-gray-200 hover:border-orange-primary'}`}
                      >
                        <span>{formatTime(slot.starts_at)}</span>
                        <span className={`text-xs font-body ${isSelected ? 'text-white/80' : 'text-gray-medium'}`}>
                          мест: {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-light border-3 border-gray-200">
                  <Clock size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="font-body text-gray-medium">Нет доступных слотов на эту дату</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Coach & Confirm */}
        {step === 3 && selectedSlot && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary */}
            <div className="p-4 bg-orange-primary/10 border-3 border-orange-primary">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-orange-primary" />
                  <div>
                    <div className="text-xs font-body text-gray-medium">Зал</div>
                    <div className="font-display font-bold">{selectedGym?.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-orange-primary" />
                  <div>
                    <div className="text-xs font-body text-gray-medium">Дата</div>
                    <div className="font-display font-bold">{formatDate(selectedDate)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-orange-primary" />
                  <div>
                    <div className="text-xs font-body text-gray-medium">Время</div>
                    <div className="font-display font-bold">
                      {formatTime(selectedSlot.starts_at)} - {formatTime(selectedSlot.ends_at)}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-sm font-body text-orange-primary hover:underline mt-3"
              >
                Изменить дату/время
              </button>
            </div>

            {/* Coach Selection */}
            <div>
              <h3 className="brutal-subtitle flex items-center gap-2 mb-3">
                <User size={20} className="text-orange-primary" />
                Тренер (опционально)
              </h3>
              {loadingCoaches ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 animate-pulse border-3 border-gray-200" />
                  ))}
                </div>
              ) : coachSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedCoachSlotId(null)}
                    className={`p-4 border-3 text-left transition-all
                      ${selectedCoachSlotId === null
                        ? 'bg-gray-dark text-white border-gray-dark'
                        : 'bg-white border-gray-200 hover:border-gray-dark'}`}
                  >
                    <div className="font-display font-bold">Без тренера</div>
                    <div className={`text-sm font-body ${selectedCoachSlotId === null ? 'text-white/80' : 'text-gray-medium'}`}>
                      Самостоятельная тренировка
                    </div>
                  </button>
                  {coachSlots.map((slot) => {
                    const coachName = slot.coach
                      ? [slot.coach.first_name, slot.coach.last_name].filter(Boolean).join(' ') || slot.coach.email
                      : `Тренер #${slot.coach_id}`;
                    const isSelected = selectedCoachSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedCoachSlotId(slot.id)}
                        className={`p-4 border-3 text-left transition-all
                          ${isSelected
                            ? 'bg-orange-primary text-white border-gray-dark'
                            : 'bg-white border-gray-200 hover:border-orange-primary'}`}
                      >
                        <div className="font-display font-bold">{coachName}</div>
                        <div className={`text-sm font-body ${isSelected ? 'text-white/80' : 'text-gray-medium'}`}>
                          {slot.coach?.specialization || 'Персональный тренер'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-gray-light border-3 border-gray-200 text-center">
                  <p className="font-body text-gray-medium">На это время нет доступных тренеров</p>
                  <p className="font-body text-sm text-gray-400 mt-1">Вы можете забронировать без тренера</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="brutal-button w-full flex items-center justify-center gap-2 text-lg py-4"
            >
              {submitting ? (
                <span className="loader" />
              ) : (
                <>
                  <Check size={20} />
                  Подтвердить бронирование
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

