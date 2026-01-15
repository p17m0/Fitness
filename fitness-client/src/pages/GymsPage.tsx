import React, { useEffect, useState } from 'react';
import { MapPin, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Gym } from '../api/types';
import { ListSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const GymsPage: React.FC = () => {
  const { isAuthenticated, services } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aborted = false;
    setLoading(true);

    services.gyms
      .list()
      .then((data) => {
        if (!aborted) setGyms(data);
      })
      .catch((err) => {
        toast.error('Не удалось загрузить залы');
        console.error(err);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });

    return () => { aborted = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]);

  return (
    <div className="container mx-auto space-y-6">
      <div className="brutal-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-primary border-4 border-gray-dark brutal-shadow-sm flex items-center justify-center">
              <MapPin size={24} className="text-white" />
            </div>
            <div>
              <h2 className="brutal-title text-2xl md:text-3xl mb-0">Наши залы</h2>
              <p className="text-sm font-body text-gray-medium">
                {gyms.length > 0 && `${gyms.length} ${gyms.length === 1 ? 'зал' : gyms.length < 5 ? 'зала' : 'залов'}`}
                {!isAuthenticated && gyms.length > 0 && ' — Войдите, чтобы забронировать слот'}
              </p>
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate('/new-booking')}
              className="brutal-button flex items-center gap-2"
            >
              <Clock size={18} />
              Забронировать
            </button>
          )}
        </div>

        {loading ? (
          <ListSkeleton count={3} />
        ) : gyms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gyms.map((gym, index) => (
              <div
                key={gym.id}
                className="bg-gray-light border-4 border-gray-dark p-5 brutal-shadow-sm opacity-0 animate-fade-in-up hover:brutal-shadow transition-all duration-200"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-primary border-3 border-gray-dark flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg uppercase truncate">
                      {gym.name}
                    </h3>
                    <p className="text-sm font-body text-gray-medium truncate">
                      {gym.address}
                    </p>
                  </div>
                </div>

                {gym.description && (
                  <p className="font-body text-gray-medium text-sm mb-4 line-clamp-2">
                    {gym.description}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-3 border-t-2 border-gray-200">
                  <div className="flex items-center gap-1.5">
                    <Users size={16} className="text-orange-primary" />
                    <span className="text-sm font-display font-bold">
                      до {gym.capacity} чел.
                    </span>
                  </div>
                </div>

                {isAuthenticated ? (
                  <button
                    onClick={() => navigate(`/new-booking?gym=${gym.id}`)}
                    className="brutal-button w-full mt-4 text-sm"
                  >
                    Забронировать слот
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/auth')}
                    className="brutal-button-secondary w-full mt-4 text-sm"
                  >
                    Войти для бронирования
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MapPin}
            title="Залы не найдены"
            description="Список залов пока пуст"
          />
        )}
      </div>
    </div>
  );
};
