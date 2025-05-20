'use client';

import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Link from 'next/link';

export default function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  trendLabel,
  linkHref,
  linkLabel,
  variant = 'primary',
  loading = false,
}) {
  // Styles de couleurs en fonction de la variante
  const variantStyles = {
    primary: 'text-primary-700 bg-primary-50',
    success: 'text-green-700 bg-green-50',
    danger: 'text-red-700 bg-red-50',
    warning: 'text-yellow-700 bg-yellow-50',
    info: 'text-blue-700 bg-blue-50',
  };

  const iconContainerStyle = variantStyles[variant] || variantStyles.primary;

  // Détermine le style du trend (positif ou négatif)
  let trendIcon = null;
  let trendStyle = '';

  if (trend === 'up') {
    trendIcon = <FiArrowUp className="mr-1 h-4 w-4 text-green-500" />;
    trendStyle = 'text-green-700';
  } else if (trend === 'down') {
    trendIcon = <FiArrowDown className="mr-1 h-4 w-4 text-red-500" />;
    trendStyle = 'text-red-700';
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          {icon && (
            <div className={`flex-shrink-0 p-3 rounded-md ${iconContainerStyle}`}>
              {icon}
            </div>
          )}
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                {loading ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    {(trendValue || trendLabel) && (
                      <p className={`ml-2 flex items-baseline text-sm font-semibold ${trendStyle}`}>
                        {trendIcon}
                        <span>{trendValue} {trendLabel}</span>
                      </p>
                    )}
                  </div>
                )}
              </dd>
              {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            </dl>
          </div>
        </div>
      </div>
      {linkHref && linkLabel && (
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
          <div className="text-sm">
            <Link href={linkHref} className="font-medium text-primary-600 hover:text-primary-700">
              {linkLabel} &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}