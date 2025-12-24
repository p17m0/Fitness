import React from 'react';
import { CheckCircle, QrCode, Dumbbell, Clock, Users, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    icon: Dumbbell,
    title: 'Современное оборудование',
    description: 'Профессиональные тренажёры мирового класса для любых целей'
  },
  {
    icon: Users,
    title: 'Опытные тренеры',
    description: 'Сертифицированные специалисты с индивидуальным подходом'
  },
  {
    icon: Clock,
    title: 'Удобное расписание',
    description: 'Гибкий график работы и онлайн-бронирование'
  }
];

const rules = [
  'Обязательная регистрация перед первым визитом',
  'Индивидуальное полотенце обязательно',
  'Чистота и порядок в раздевалках',
  'Следуем технике безопасности на тренажёрах',
  'Курение и алкоголь — табу'
];

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto space-y-8 md:space-y-12">
      {/* Hero Section */}
      <section className="brutal-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative text-center max-w-4xl mx-auto py-6 md:py-10">
          <div
            className="mb-8 flex justify-center opacity-0 animate-bounce-in"
            style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
          >
            <div className="w-24 h-24 md:w-32 md:h-32 brutal-shadow-lg flex items-center justify-center bg-orange-primary transform hover:scale-105 transition-transform">
              <img
                src="/logo.jpg"
                alt="HHSportFit Logo"
                className="w-16 h-16 md:w-24 md:h-24 object-contain"
              />
            </div>
          </div>

          <h2
            className="brutal-title-accent text-4xl sm:text-5xl md:text-6xl mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            HHSportFit
          </h2>

          <p
            className="brutal-text max-w-2xl mx-auto text-base md:text-lg mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
          >
            Современный фитнес-клуб с профессиональным оборудованием,
            жёсткими тренерами и понятными правилами. Место, где слабые становятся сильными.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
          >
            {!isAuthenticated ? (
              <NavLink to="/auth" className="brutal-button flex items-center gap-2">
                Начать тренироваться
                <ArrowRight size={18} />
              </NavLink>
            ) : (
              <NavLink to="/gyms" className="brutal-button flex items-center gap-2">
                Забронировать зал
                <ArrowRight size={18} />
              </NavLink>
            )}
            <a href="tel:+70000000000" className="brutal-button-secondary">
              Связаться с нами
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="brutal-card-interactive opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${0.5 + index * 0.1}s`, animationFillMode: 'forwards' }}
          >
            <div className="w-14 h-14 bg-orange-primary border-4 border-gray-dark brutal-shadow-sm flex items-center justify-center mb-4">
              <feature.icon size={28} className="text-white" />
            </div>
            <h3 className="font-display font-bold text-lg uppercase tracking-wide mb-2">
              {feature.title}
            </h3>
            <p className="font-body text-gray-medium">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* About Card */}
        <div
          className="brutal-card opacity-0 animate-slide-in-left"
          style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
        >
          <h3 className="brutal-title text-2xl md:text-3xl">О нас</h3>
          <div className="space-y-4">
            <p className="brutal-text">
              HHSportFit — место, где слабые становятся сильными. Мы даём жёсткое оборудование,
              требовательных тренеров и атмосферу без оправданий.
            </p>
            <p className="brutal-text">
              Вся операционка — через прозрачный API, без хаоса. Бронируй слоты, покупай абонементы
              и следи за прогрессом в личном кабинете.
            </p>
            <div className="pt-4">
              <NavLink
                to={isAuthenticated ? "/programs" : "/auth"}
                className="font-display font-bold text-orange-primary uppercase tracking-wide inline-flex items-center gap-2 hover:gap-3 transition-all"
              >
                Смотреть программы
                <ArrowRight size={16} />
              </NavLink>
            </div>
          </div>
        </div>

        {/* Rules Card */}
        <div
          className="brutal-card opacity-0 animate-slide-in-right"
          style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}
        >
          <h3 className="brutal-title text-2xl md:text-3xl">Правила посещения</h3>
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div
                key={rule}
                className="flex items-start gap-3 p-3 bg-gray-light/50 border-2 border-gray-200 hover:border-orange-primary hover:bg-orange-primary/5 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-orange-primary text-white flex items-center justify-center font-display font-bold text-sm">
                  {index + 1}
                </div>
                <span className="font-body font-medium text-gray-dark">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <section
        className="brutal-card text-center max-w-2xl mx-auto opacity-0 animate-fade-in-up"
        style={{ animationDelay: '1s', animationFillMode: 'forwards' }}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-primary border-4 border-gray-dark brutal-shadow mb-6 animate-float">
          <QrCode size={40} className="text-white" />
        </div>
        <h3 className="brutal-title text-2xl md:text-3xl">Личный QR-код</h3>
        <p className="brutal-text max-w-lg mx-auto mb-6">
          После регистрации получишь персональный QR-код. Показывай на входе и тренируйся.
          Все данные связаны с абонементами и бронированиями.
        </p>
        {!isAuthenticated && (
          <NavLink to="/auth" className="brutal-button inline-flex items-center gap-2">
            Зарегистрироваться
            <ArrowRight size={18} />
          </NavLink>
        )}
      </section>
    </div>
  );
};
