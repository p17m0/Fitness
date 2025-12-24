import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Tag, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Product } from '../api/types';
import { formatPrice } from '../utils/format';
import { ListSkeleton } from '../components/ui/Skeleton';
import { AuthRequiredState, NoProductsState } from '../components/ui/EmptyState';

export const ProductsPage: React.FC = () => {
  const { isAuthenticated, services } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const ready = useMemo(() => isAuthenticated, [isAuthenticated]);

  useEffect(() => {
    if (!ready) {
      setLoading(false);
      return;
    }
    let aborted = false;
    setLoading(true);

    services.products
      .list()
      .then((data) => {
        if (!aborted) setProducts(data);
      })
      .catch((err) => {
        toast.error('Не удалось загрузить продукты');
        console.error(err);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });

    return () => { aborted = true; };
  }, [ready, services]);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'SubscriptionPlan': 'Абонемент',
      'Program': 'Программа',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'SubscriptionPlan': 'bg-blue-100 text-blue-800',
      'Program': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-200 text-gray-600';
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
            <ShoppingBag size={24} className="text-white" />
          </div>
          <div>
            <h2 className="brutal-title text-2xl md:text-3xl mb-0">Продукты</h2>
            <p className="text-sm font-body text-gray-medium">Каталог доступных предложений</p>
          </div>
        </div>

        {loading ? (
          <ListSkeleton count={4} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="brutal-card-interactive opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-light border-3 border-gray-dark flex items-center justify-center">
                      <Package size={20} className="text-orange-primary" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg uppercase">{product.name}</h4>
                      <span className={`inline-block px-2 py-0.5 text-xs font-display font-bold uppercase ${getTypeColor(product.purchasable_type)}`}>
                        {getTypeLabel(product.purchasable_type)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-display font-bold text-orange-primary">
                      {formatPrice(product.price_cents, product.currency)}
                    </div>
                  </div>
                </div>

                <p className="font-body text-gray-medium text-sm mb-3">
                  {product.description || 'Без описания'}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Tag size={12} />
                  <span className="font-display uppercase">ID: {product.purchasable_id}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoProductsState />
        )}
      </div>
    </div>
  );
};
