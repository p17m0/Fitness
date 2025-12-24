import React, { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Clock, Tag, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Program } from '../api/types';
import { formatPrice } from '../utils/format';
import { ListSkeleton } from '../components/ui/Skeleton';
import { AuthRequiredState, NoProgramsState } from '../components/ui/EmptyState';

export const ProgramsPage: React.FC = () => {
  const { isAuthenticated, services } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const ready = useMemo(() => isAuthenticated, [isAuthenticated]);

  useEffect(() => {
    if (!ready) {
      setLoading(false);
      return;
    }
    let aborted = false;
    setLoading(true);

    services.programs
      .list()
      .then((data) => {
        if (!aborted) setPrograms(data);
      })
      .catch((err) => {
        toast.error('Не удалось загрузить программы');
        console.error(err);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });

    return () => { aborted = true; };
  }, [ready, services]);

  const getDurationLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  const getDifficultyLevel = (duration: number) => {
    if (duration <= 30) return { label: 'Лёгкая', color: 'bg-green-100 text-green-800' };
    if (duration <= 60) return { label: 'Средняя', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Интенсивная', color: 'bg-red-100 text-red-800' };
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
      <div className="brutal-card">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-primary border-4 border-gray-dark brutal-shadow-sm flex items-center justify-center">
            <Dumbbell size={24} className="text-white" />
          </div>
          <div>
            <h2 className="brutal-title text-2xl md:text-3xl mb-0">Программы тренировок</h2>
            <p className="text-sm font-body text-gray-medium">Профессиональные программы от наших тренеров</p>
          </div>
        </div>

        {loading ? (
          <ListSkeleton count={4} />
        ) : programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((program, index) => {
              const difficulty = getDifficultyLevel(program.duration_minutes);

              return (
                <div
                  key={program.id}
                  className="brutal-card-interactive opacity-0 animate-fade-in-up group"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-primary border-4 border-gray-dark brutal-shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Dumbbell size={24} className="text-white" />
                    </div>
                    <span className={`px-2 py-1 text-xs font-display font-bold uppercase ${difficulty.color}`}>
                      {difficulty.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-display font-bold text-lg uppercase mb-2">{program.name}</h4>

                  {/* Description */}
                  <p className="font-body text-gray-medium text-sm mb-4 line-clamp-2">
                    {program.description || 'Описание программы будет добавлено в ближайшее время.'}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-orange-primary" />
                      <span className="font-display font-bold">
                        {getDurationLabel(program.duration_minutes)}
                      </span>
                    </div>
                    <div className="text-xl font-display font-bold text-orange-primary">
                      {formatPrice(program.price_cents, program.currency)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <NoProgramsState />
        )}

        {/* Info Banner */}
        {programs.length > 0 && (
          <div className="mt-6 p-4 bg-gray-light border-4 border-gray-200 flex items-center gap-4 animate-fade-in">
            <div className="w-10 h-10 bg-orange-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold uppercase text-sm">Персональные тренировки</p>
              <p className="font-body text-gray-medium text-sm">
                Для индивидуальной программы свяжитесь с нашими тренерами
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
