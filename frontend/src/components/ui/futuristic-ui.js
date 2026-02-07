import { useState } from 'react';

// Futuristic Button Component
export const FuturisticButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  onClick, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = `
    btn
    flex items-center justify-center
    font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500',
    secondary: 'bg-gray-800 text-gray-100 border border-gray-700 hover:bg-gray-700 focus:ring-gray-500',
    accent: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 focus:ring-pink-500',
    ghost: 'bg-transparent text-gray-300 hover:bg-gray-800 focus:ring-gray-600'
  };
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg',
    md: 'text-sm px-4 py-2 rounded-xl',
    lg: 'text-base px-6 py-3 rounded-xl'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

// Futuristic Card Component
export const FuturisticCard = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`card bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>}
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>
      )}
      {children}
      {actions && <div className="mt-6 flex justify-end space-x-3">{actions}</div>}
    </div>
  );
};

// Futuristic Input Component
export const FuturisticInput = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full
            px-4 py-3
            bg-gray-800
            border ${error ? 'border-red-500' : 'border-gray-700'}
            rounded-lg
            text-white
            placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            ${icon ? 'pl-10' : ''}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Futuristic Select Component
export const FuturisticSelect = ({ 
  label, 
  error, 
  options, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full
          px-4 py-3
          bg-gray-800
          border ${error ? 'border-red-500' : 'border-gray-700'}
          rounded-lg
          text-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        `}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Futuristic Toggle Component
export const FuturisticToggle = ({ 
  label, 
  enabled, 
  onChange, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {label && <span className="text-sm font-medium text-gray-300">{label}</span>}
      <button
        type="button"
        className={`${
          enabled ? 'bg-indigo-600' : 'bg-gray-700'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
        onClick={() => onChange(!enabled)}
      >
        <span
          className={`${
            enabled ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};

// Futuristic Progress Bar Component
export const FuturisticProgressBar = ({ 
  value, 
  max = 100, 
  label, 
  showPercentage = true 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="mb-4">
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">{label}</span>
          {showPercentage && <span className="text-gray-400">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Futuristic Stat Card Component
export const FuturisticStatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendLabel,
  color = 'indigo'
}) => {
  const colorClasses = {
    indigo: 'text-indigo-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    teal: 'text-teal-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400'
  };
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${colorClasses[color].replace('text', 'bg')} ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center mt-3 text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}</span>
        </div>
      )}
    </div>
  );
};

// Futuristic Modal Component
export const FuturisticModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div 
            className="absolute inset-0 bg-black bg-opacity-75"
            onClick={onClose}
          />
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-700">
          <div className="px-6 py-5 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-white">
                {title}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-white focus:outline-none"
                onClick={onClose}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="px-6 py-5">
            {children}
          </div>
          {actions && (
            <div className="px-6 py-4 bg-gray-800 bg-opacity-50 flex justify-end space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};