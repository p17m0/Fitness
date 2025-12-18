import React from 'react';
import {
  Dumbbell,
  Calendar,
  ShoppingCart,
  User,
  Phone,
  QrCode,
  Clock,
  MapPin,
  CheckCircle
} from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-light">
      {/* Header */}
      <header className="bg-white p-8 brutal-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 brutal-shadow flex items-center justify-center bg-orange-primary">
                <img src="/logo.jpg" alt="HHsportFit" className="w-12 h-12 object-contain" />
              </div>
              <h1 className="text-6xl font-black text-orange-primary uppercase tracking-wider">
                HHSportFit
              </h1>
            </div>
            <div className="flex gap-6">
              <button className="brutal-button flex items-center gap-3">
                <Calendar size={24} />
                ЗАБРОНИРОВАТЬ
              </button>
              <button className="brutal-button flex items-center gap-3">
                <User size={24} />
                ЛИЧНЫЙ КАБИНЕТ
              </button>
              <button className="brutal-button flex items-center gap-3">
                <Phone size={24} />
                КОНТАКТЫ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-white brutal-border">
        <div className="container mx-auto text-center px-8">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto brutal-shadow flex items-center justify-center bg-orange-primary">
              <img src="/logo.jpg" alt="HHsportFit Logo" className="w-24 h-24 object-contain" />
            </div>
          </div>
          <h2 className="brutal-title text-7xl">
            HHSportFit
          </h2>
          <p className="brutal-text max-w-4xl mx-auto text-xl">
            СОВРЕМЕННЫЙ ФИТНЕС-КЛУБ С ПРОФЕССИОНАЛЬНЫМ ОБОРУДОВАНИЕМ И ЖЕСТКИМ ПОДХОДОМ К РЕЗУЛЬТАТАМ
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-20 bg-gray-light">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* О нас */}
            <div className="brutal-card">
              <h3 className="brutal-title text-4xl">
                О НАС
              </h3>
              <p className="brutal-text">
                HHSportFit — ЭТО НЕ ПРОСТО ФИТНЕС-КЛУБ. ЭТО МЕСТО, ГДЕ СЛАБАКИ СТАНОВЯТСЯ СИЛЬНЫМИ.
                МЫ ДАЕМ ЖЕСТКОЕ ОБОРУДОВАНИЕ, БЕЗЖАЛОСТНЫХ ТРЕНЕРОВ И АТМОСФЕРУ, ГДЕ НЕТ МЕСТА ОПРАВДАНИЯМ.
                ЕСЛИ ТЫ ГОТОВ К ЖЕСТКОЙ РАБОТЕ — МЫ ГОТОВЫ К ТЕБЕ.
              </p>
            </div>

            {/* Спортзалы */}
            <div className="brutal-card">
              <h3 className="brutal-title text-4xl">
                СПОРТЗАЛЫ
              </h3>

              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <MapPin size={32} className="text-orange-primary mr-4" />
                  <h4 className="brutal-subtitle text-xl">
                    ОСНОВНОЙ ЗАЛ
                  </h4>
                </div>
                <p className="brutal-text mb-6">
                  ПОЛНОСТЬЮ ОБОРУДОВАННЫЙ ЗАЛ С ТЯЖЕЛЫМ ОБОРУДОВАНИЕМ ДЛЯ НАСТОЯЩИХ МУЖЧИН И ЖЕНЩИН
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-orange-primary text-white px-4 py-2 font-black text-sm uppercase border-2 border-gray-dark">
                    КАРДИО
                  </span>
                  <span className="bg-orange-primary text-white px-4 py-2 font-black text-sm uppercase border-2 border-gray-dark">
                    СИЛОВЫЕ
                  </span>
                  <span className="bg-orange-primary text-white px-4 py-2 font-black text-sm uppercase border-2 border-gray-dark">
                    СВОБОДНЫЕ ВЕСА
                  </span>
                </div>
              </div>

              <div className="border-t-4 border-gray-dark pt-8">
                <div className="flex items-center mb-6">
                  <Clock size={32} className="text-orange-primary mr-4" />
                  <h4 className="brutal-subtitle text-xl">
                    РАСПИСАНИЕ
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { day: 'ПН-ПТ', time: '06:00 - 23:00' },
                    { day: 'СБ', time: '08:00 - 22:00' },
                    { day: 'ВС', time: '09:00 - 21:00' }
                  ].map((schedule, index) => (
                    <div key={index} className="bg-gray-dark text-white p-6 border-4 border-gray-dark">
                      <div className="font-black text-lg uppercase mb-2">{schedule.day}</div>
                      <div className="font-bold text-sm">{schedule.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Правила посещения */}
            <div className="brutal-card">
              <h3 className="brutal-title text-4xl">
                ПРАВИЛА ПОСЕЩЕНИЯ
              </h3>
              <div className="space-y-4">
                {[
                  'ОБЯЗАТЕЛЬНАЯ РЕГИСТРАЦИЯ ПРИ ПЕРВОМ ПОСЕЩЕНИИ',
                  'ИСПОЛЬЗОВАНИЕ ИНДИВИДУАЛЬНОГО ПОЛОТЕНЦА',
                  'СОБЛЮДЕНИЕ ЧИСТОТЫ И ПОРЯДКА В РАЗДЕВАЛКАХ',
                  'СОБЛЮДЕНИЕ ТЕХНИКИ БЕЗОПАСНОСТИ НА ТРЕНАЖЕРАХ',
                  'ЗАПРЕЩЕНО КУРЕНИЕ И УПОТРЕБЛЕНИЕ АЛКОГОЛЯ'
                ].map((rule, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <CheckCircle size={24} className="text-orange-primary mt-1 flex-shrink-0" />
                    <span className="brutal-text text-base">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Продукты */}
            <div className="brutal-card">
              <h3 className="brutal-title text-4xl">
                ПРОДУКТЫ
              </h3>

              {/* Абонементы */}
              <div className="mb-8">
                <h4 className="brutal-subtitle text-2xl mb-6">
                  АБОНЕМЕНТЫ
                </h4>
                <div className="space-y-6">
                  {[
                    { name: '5 ПОСЕЩЕНИЙ', price: '2500 ₽', desc: 'ДЛЯ ТЕХ, КТО ХОЧЕТ ПОПРОБОВАТЬ' },
                    { name: '10 ПОСЕЩЕНИЙ', price: '4500 ₽', desc: 'ДЛЯ СЕРЬЕЗНЫХ ЛЮДЕЙ' }
                  ].map((plan, index) => (
                    <div key={index} className="bg-white p-6 border-4 border-gray-dark brutal-shadow">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-black text-2xl text-gray-dark uppercase">{plan.name}</span>
                        <span className="font-black text-4xl text-orange-primary">{plan.price}</span>
                      </div>
                      <p className="brutal-text mb-6 text-base">{plan.desc}</p>
                      <button className="brutal-button w-full flex items-center justify-center gap-3">
                        <ShoppingCart size={20} />
                        КУПИТЬ
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t-4 border-gray-dark pt-8">
                <h4 className="brutal-subtitle text-2xl mb-6">
                  ИНДИВИДУАЛЬНЫЕ ЗАНЯТИЯ
                </h4>
                <div className="bg-white p-6 border-4 border-gray-dark brutal-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-black text-2xl text-gray-dark uppercase">ПЕРСОНАЛЬНАЯ ТРЕНИРОВКА</span>
                    <span className="font-black text-4xl text-orange-primary">ОТ 3000 ₽</span>
                  </div>
                  <p className="brutal-text mb-6 text-base">
                    ЖЕСТКИЙ ИНДИВИДУАЛЬНЫЙ ПОДХОД С ПРОФЕССИОНАЛЬНЫМ ТРЕНЕРОМ
                  </p>
                  <button className="brutal-button w-full flex items-center justify-center gap-3">
                    <User size={20} />
                    ЗАПИСАТЬСЯ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-20 text-center brutal-card max-w-2xl mx-auto">
            <QrCode size={80} className="text-orange-primary mx-auto mb-6" />
            <h3 className="brutal-title text-3xl">
              ЛИЧНЫЙ QR-КОД
            </h3>
            <p className="brutal-text max-w-lg mx-auto">
              ПОСЛЕ РЕГИСТРАЦИИ ПОЛУЧИШЬ ПЕРСОНАЛЬНЫЙ QR-КОД. ПОКАЗЫВАЙ ЕГО НА ВХОДЕ И ТРЕНИРУЙСЯ.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-dark text-white py-12 brutal-border">
        <div className="container mx-auto text-center px-8">
          <p className="text-xl font-black uppercase tracking-wider">
            © 2024 HHSportFit. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
