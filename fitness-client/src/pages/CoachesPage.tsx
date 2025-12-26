import React, { useEffect, useMemo, useState } from 'react';
import { UserCheck, Mail, Phone, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Coach } from '../api/types';
import { ListSkeleton } from '../components/ui/Skeleton';
import { AuthRequiredState, EmptyState } from '../components/ui/EmptyState';

export const CoachesPage: React.FC = () => {
  const { isAuthenticated, services } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  const ready = useMemo(() => isAuthenticated, [isAuthenticated]);

  useEffect(() => {
    if (!ready) {
      setLoading(false);
      return;
    }
    let aborted = false;
    setLoading(true);

    services.coaches
      .list()
      .then((data) => {
        if (!aborted) setCoaches(data);
      })
      .catch((err) => {
        toast.error('Не удалось загрузить список тренеров');
        console.error(err);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });

    return () => { aborted = true; };
  }, [ready, services]);

  const getInitials = (coach: Coach) => {
    const first = coach.first_name?.[0] || '';
    const last = coach.last_name?.[0] || '';
    return (first + last).toUpperCase() || coach.email[0].toUpperCase();
  };

  const getFullName = (coach: Coach) => {
    if (coach.first_name || coach.last_name) {
      return [coach.first_name, coach.last_name].filter(Boolean).join(' ');
    }
    return coach.email.split('@')[0];
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
            <UserCheck size={24} className="text-white" />
          </div>
          <div>
            <h2 className="brutal-title text-2xl md:text-3xl mb-0">Наши тренеры</h2>
            <p className="text-sm font-body text-gray-medium">
              {coaches.length} {coaches.length === 1 ? 'тренер' : coaches.length < 5 ? 'тренера' : 'тренеров'} в команде
            </p>
          </div>
        </div>

        {loading ? (
          <ListSkeleton count={4} />
        ) : coaches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coaches.map((coach, index) => (
              <div
                key={coach.id}
                className="brutal-card-interactive opacity-0 animate-fade-in-up group"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                {/* Avatar & Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-orange-primary border-4 border-gray-dark brutal-shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="font-display font-bold text-xl text-white">
                      {getInitials(coach)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg uppercase truncate">
                      {getFullName(coach)}
                    </h3>
                    {coach.specialization && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Award size={14} className="text-orange-primary flex-shrink-0" />
                        <span className="text-sm font-body text-gray-medium truncate">
                          {coach.specialization}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {coach.bio && (
                  <p className="font-body text-gray-medium text-sm mb-4 line-clamp-3">
                    {coach.bio}
                  </p>
                )}

                {/* Contact Info */}
                <div className="space-y-2 pt-4 border-t-2 border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-orange-primary flex-shrink-0" />
                    <span className="font-body text-gray-medium truncate">{coach.email}</span>
                  </div>
                  {coach.phone_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-orange-primary flex-shrink-0" />
                      <a
                        href={`tel:${coach.phone_number}`}
                        className="font-body text-gray-medium hover:text-orange-primary transition-colors"
                      >
                        {coach.phone_number}
                      </a>
                    </div>
                  )}
                </div>

                {/* Rating placeholder */}
                <div className="flex items-center gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= 4 ? 'text-orange-primary fill-orange-primary' : 'text-gray-300'}
                    />
                  ))}
                  <span className="text-xs font-display font-bold text-gray-medium ml-2">4.0</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UserCheck}
            title="Тренеры не найдены"
            description="Список тренеров пока пуст. Скоро здесь появится наша команда профессионалов!"
          />
        )}

        {/* Info Banner */}
        {coaches.length > 0 && (
          <div className="mt-6 p-4 bg-gray-light border-4 border-gray-200 flex items-center gap-4 animate-fade-in">
            <div className="w-10 h-10 bg-orange-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold uppercase text-sm">Индивидуальные занятия</p>
              <p className="font-body text-gray-medium text-sm">
                Запишитесь на персональную тренировку в разделе «Залы»
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



