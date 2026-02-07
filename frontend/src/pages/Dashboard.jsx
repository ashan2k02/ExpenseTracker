import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { Card, Spinner } from '../components/ui';
import { useAuth } from '../context';
import { expenseService, reportService, incomeService } from '../services';
import {
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineChartPie,
  HiOutlineCalendar,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineDotsVertical,
  HiOutlineRefresh,
  HiOutlinePlus,
  HiOutlineEye,
} from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch both expense summary and income summary
      let expenseResponse, incomeResponse;
      
      try {
        expenseResponse = await expenseService.getSummary();
      } catch {
        expenseResponse = await reportService.getDashboard();
      }
      
      try {
        incomeResponse = await incomeService.getSummary();
      } catch {
        incomeResponse = { data: { totalIncome: 0 } };
      }
      
      // Merge income data into response
      const mergedData = {
        ...expenseResponse.data,
        totalIncome: incomeResponse.data?.totalIncome || 0,
        incomeCount: incomeResponse.data?.incomeCount || 0,
        yearlyIncome: incomeResponse.data?.yearlyTotal || 0,
      };
      
      setData(mergedData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get month name
  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineTrendingDown className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <HiOutlineRefresh className="w-5 h-5" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { summary, expensesByCategory, monthlyTrend, recentExpenses } = data || {};

  // Calculate values - now using real income data
  const totalIncome = data?.totalIncome || summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || summary?.monthlyTotal || 0;
  const remainingBalance = totalIncome - totalExpenses;
  const monthlyBudget = summary?.monthlyBudget || 3000;
  const budgetPercentage = monthlyBudget > 0 ? Math.round((totalExpenses / monthlyBudget) * 100) : 0;

  // Prepare pie chart data
  const pieData = expensesByCategory?.map((item) => ({
    name: item.category?.name || item.name || 'Unknown',
    value: parseFloat(item.dataValues?.total || item.total || item.amount || 0),
    color: item.category?.color || item.color || '#6366f1',
  })) || [
    { name: 'Food & Dining', value: 450, color: '#ef4444' },
    { name: 'Shopping', value: 320, color: '#f59e0b' },
    { name: 'Transportation', value: 180, color: '#10b981' },
    { name: 'Entertainment', value: 150, color: '#6366f1' },
    { name: 'Bills', value: 280, color: '#8b5cf6' },
  ];

  // Prepare trend chart data
  const trendData = monthlyTrend?.map((item) => ({
    name: getMonthName(item.month),
    expenses: parseFloat(item.total || item.expenses || 0),
    income: parseFloat(item.income || monthlyBudget),
  })) || [
    { name: 'Sep', expenses: 2100, income: 5000 },
    { name: 'Oct', expenses: 2400, income: 5000 },
    { name: 'Nov', expenses: 1800, income: 5000 },
    { name: 'Dec', expenses: 2800, income: 5200 },
    { name: 'Jan', expenses: 2200, income: 5000 },
    { name: 'Feb', expenses: totalExpenses || 1380, income: totalIncome },
  ];

  // Summary cards data
  const summaryCards = [
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: HiOutlineTrendingUp,
      change: '+12.5%',
      changeType: 'positive',
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: HiOutlineTrendingDown,
      change: '-8.2%',
      changeType: 'negative',
      bgColor: 'bg-gradient-to-br from-red-500 to-rose-600',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Remaining Balance',
      value: formatCurrency(remainingBalance),
      icon: HiOutlineCurrencyDollar,
      change: remainingBalance >= 0 ? 'On track' : 'Over budget',
      changeType: remainingBalance >= 0 ? 'positive' : 'negative',
      bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Monthly Budget',
      value: formatCurrency(monthlyBudget),
      icon: HiOutlineChartPie,
      change: `${budgetPercentage}% used`,
      changeType: budgetPercentage <= 80 ? 'positive' : budgetPercentage <= 100 ? 'warning' : 'negative',
      bgColor: 'bg-gradient-to-br from-amber-500 to-orange-600',
      iconBg: 'bg-white/20',
    },
  ];

  // COLORS for pie chart
  const COLORS = pieData.map(item => item.color);

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your finances today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
          <Link
            to="/expenses/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Expense</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className={`${card.iconBg} p-3 rounded-xl`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <HiOutlineDotsVertical className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-white/80 text-sm font-medium">{card.title}</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{card.value}</p>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {card.changeType === 'positive' && (
                <HiOutlineArrowUp className="w-4 h-4 text-green-300" />
              )}
              {card.changeType === 'negative' && (
                <HiOutlineArrowDown className="w-4 h-4 text-red-300" />
              )}
              <span className={`text-sm ${
                card.changeType === 'positive' ? 'text-green-200' :
                card.changeType === 'warning' ? 'text-yellow-200' :
                'text-red-200'
              }`}>
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Progress Bar */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Monthly Budget Progress</h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(totalExpenses)} spent of {formatCurrency(monthlyBudget)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${
              budgetPercentage <= 80 ? 'text-green-600' :
              budgetPercentage <= 100 ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {budgetPercentage}%
            </span>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              budgetPercentage <= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
              budgetPercentage <= 100 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
              'bg-gradient-to-r from-red-400 to-rose-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category - Pie Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Expenses by Category</h3>
              <p className="text-sm text-gray-500 mt-1">This month's spending breakdown</p>
            </div>
            <Link
              to="/categories"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
            >
              <HiOutlineEye className="w-4 h-4" />
              View all
            </Link>
          </div>
          {pieData.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                        padding: '12px 16px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 space-y-3">
                {pieData.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              <div className="text-center">
                <HiOutlineChartPie className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No expenses this month</p>
              </div>
            </div>
          )}
        </Card>

        {/* Monthly Trend - Bar/Line Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Trend</h3>
              <p className="text-sm text-gray-500 mt-1">Income vs Expenses over time</p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  chartType === 'bar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  chartType === 'line'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Line
              </button>
            </div>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              {chartType === 'bar' ? (
                <BarChart data={trendData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(value), name === 'expenses' ? 'Expenses' : 'Income']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                      padding: '12px 16px',
                    }}
                  />
                  <Legend
                    formatter={(value) => value === 'expenses' ? 'Expenses' : 'Income'}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="income" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} name="expenses" />
                </BarChart>
              ) : (
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(value), name === 'expenses' ? 'Expenses' : 'Income']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                      padding: '12px 16px',
                    }}
                  />
                  <Legend
                    formatter={(value) => value === 'expenses' ? 'Expenses' : 'Income'}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                    name="income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                    name="expenses"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-500">
              <div className="text-center">
                <HiOutlineTrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No expense history</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <p className="text-sm text-gray-500 mt-0.5">Your latest spending activity</p>
          </div>
          <Link
            to="/expenses"
            className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {(recentExpenses && recentExpenses.length > 0) ? (
            recentExpenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: `${expense.category?.color || '#6366f1'}15`,
                    }}
                  >
                    {expense.category?.icon || '💰'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${expense.category?.color || '#6366f1'}15`,
                          color: expense.category?.color || '#6366f1',
                        }}
                      >
                        {expense.category?.name || 'Uncategorized'}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <HiOutlineCalendar className="w-3 h-3" />
                        {formatDate(expense.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="font-semibold text-gray-900 text-lg">
                  -{formatCurrency(expense.amount)}
                </p>
              </div>
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineCurrencyDollar className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-1">No transactions yet</h4>
              <p className="text-gray-500 mb-4">Start tracking your expenses by adding your first transaction</p>
              <Link
                to="/expenses/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <HiOutlinePlus className="w-5 h-5" />
                Add your first expense
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
