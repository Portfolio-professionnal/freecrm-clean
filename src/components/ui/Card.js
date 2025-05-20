'use client';

export default function Card({
  title,
  subtitle,
  children,
  footer,
  headerActions,
  className = '',
  contentClassName = '',
  noPadding = false,
}) {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      {(title || subtitle || headerActions) && (
        <div className="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            {title && (
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="mt-3 sm:mt-0 flex space-x-3">
              {headerActions}
            </div>
          )}
        </div>
      )}
      
      <div className={`${noPadding ? '' : 'px-6 py-4'} ${contentClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className="border-t border-gray-200 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}