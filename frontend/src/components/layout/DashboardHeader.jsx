import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context';
import { formatCurrency } from '../../utils/formatters';

const DashboardHeader = ({ 
  totalBalance = 0, 
  totalIncome = 0, 
  totalExpenses = 0,
  notifications = [] 
}) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 mb-6 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Section - Welcome Message & Date */}
        <div className="flex-1">
          <div className="flex items-center gap-4">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
                <span className="text-xl font-bold text-white">
                  {getInitials(user?.name)}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>

            <div>
              <p className="text-indigo-100 text-sm font-medium">{getGreeting()}</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {user?.name || 'User'}
              </h1>
              <p className="text-indigo-200 text-sm mt-0.5 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {currentDate}
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Balance Cards */}
        <div className="flex flex-wrap gap-3 lg:gap-4">
          {/* Total Balance */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 min-w-[140px]">
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">Total Balance</p>
            <p className="text-white text-xl lg:text-2xl font-bold mt-1">
              {formatCurrency(totalBalance)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xs font-medium ${totalBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {totalBalance >= 0 ? '↑' : '↓'} {totalBalance >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
          </div>

          {/* Income */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 min-w-[130px]">
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">Income</p>
            <p className="text-green-300 text-xl lg:text-2xl font-bold mt-1">
              {formatCurrency(totalIncome)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <svg className="w-3 h-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-green-300">This month</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 min-w-[130px]">
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide">Expenses</p>
            <p className="text-red-300 text-xl lg:text-2xl font-bold mt-1">
              {formatCurrency(totalExpenses)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <svg className="w-3 h-3 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-red-300">This month</span>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Add Button */}
          <Link
            to="/expenses/new"
            className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Add Expense</span>
          </Link>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification, index) => (
                      <div
                        key={index}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                          !notification.read ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.type === 'warning' ? 'bg-yellow-400' :
                            notification.type === 'success' ? 'bg-green-400' :
                            notification.type === 'error' ? 'bg-red-400' : 'bg-indigo-400'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-100">
                    <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700 w-full text-center">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Link */}
          <Link
            to="/profile"
            className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Bottom Stats Bar - Optional Quick Stats */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-indigo-100">Budget on track</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-indigo-100">3 upcoming bills</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
              <span className="text-sm text-indigo-100">Last sync: Just now</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/reports"
              className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1"
            >
              View detailed reports
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
