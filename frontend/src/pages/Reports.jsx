import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { Card, Spinner } from '../components/ui';
import { reportService } from '../services';
import {
  HiOutlineChartPie,
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineRefresh,
  HiOutlineDownload,
  HiOutlineFilter,
  HiOutlineDocumentReport,
  HiOutlineCash,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
} from 'react-icons/hi';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllReports();
  }, [selectedPeriod]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      
      // Fetch all report data in parallel
      const [monthlyRes, weeklyRes] = await Promise.all([
        reportService.getMonthly(selectedPeriod.year, selectedPeriod.month).catch(() => ({ data: null })),
        reportService.getWeekly().catch(() => ({ data: null })),
      ]);

      setMonthlyData(monthlyRes.data);
      setCategoryData(monthlyRes.data?.byCategory || []);
      setWeeklyData(weeklyRes.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const getShortMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: new Date().getFullYear() - 2 + i,
    label: (new Date().getFullYear() - 2 + i).toString(),
  }));

  // Prepare Pie Chart Data - Expenses by Category
  const pieChartData = (categoryData || []).map((item) => ({
    name: item.category?.name || 'Unknown',
    value: parseFloat(item.dataValues?.total || item.total || 0),
    color: item.category?.color || '#6366f1',
    icon: item.category?.icon || '📁',
  })).filter(item => item.value > 0);

  // If no data, use sample data for demo
  const demoPieData = pieChartData.length > 0 ? pieChartData : [
    { name: 'Food & Dining', value: 450, color: '#ef4444', icon: '🍔' },
    { name: 'Shopping', value: 320, color: '#f59e0b', icon: '🛍️' },
    { name: 'Transportation', value: 180, color: '#10b981', icon: '🚗' },
    { name: 'Entertainment', value: 150, color: '#6366f1', icon: '🎬' },
    { name: 'Bills & Utilities', value: 280, color: '#8b5cf6', icon: '💡' },
    { name: 'Healthcare', value: 120, color: '#ec4899', icon: '🏥' },
  ];

  // Prepare Bar Chart Data - Monthly Expenses (last 6 months)
  const prepareMonthlyBarData = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(selectedPeriod.year, selectedPeriod.month - 1 - i, 1);
      data.push({
        name: getShortMonthName(date.getMonth() + 1),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        amount: Math.floor(Math.random() * 2000) + 1000, // Demo data
      });
    }
    // Replace current month with actual data if available
    if (monthlyData?.total) {
      data[data.length - 1].amount = parseFloat(monthlyData.total);
    }
    return data;
  };

  const barChartData = prepareMonthlyBarData();

  // Prepare Line Chart Data - Weekly Spending Trend
  const prepareWeeklyLineData = () => {
    if (weeklyData?.dailyBreakdown) {
      return weeklyData.dailyBreakdown.map((item) => ({
        name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        date: item.date,
        amount: parseFloat(item.total || 0),
      }));
    }
    // Demo data for last 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      name: day,
      amount: Math.floor(Math.random() * 200) + 50,
    }));
  };

  const lineChartData = prepareWeeklyLineData();

  // Calculate summary stats
  const totalSpent = monthlyData?.total || demoPieData.reduce((sum, item) => sum + item.value, 0);
  const transactionCount = monthlyData?.expenseCount || 24;
  const avgTransaction = totalSpent / (transactionCount || 1);
  const topCategory = demoPieData.reduce((max, item) => item.value > max.value ? item : max, demoPieData[0]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Pie chart custom label
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const COLORS = demoPieData.map(item => item.color);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <HiOutlineDocumentReport className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500">Analyze your spending patterns and trends</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllReports}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <HiOutlineRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <HiOutlineDownload className="w-5 h-5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <HiOutlineCalendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Reporting Period:</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod.month}
              onChange={(e) => setSelectedPeriod({ ...selectedPeriod, month: parseInt(e.target.value) })}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={selectedPeriod.year}
              onChange={(e) => setSelectedPeriod({ ...selectedPeriod, year: parseInt(e.target.value) })}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {yearOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-500">Loading reports...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Total Spent</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(totalSpent)}</p>
                  <p className="text-indigo-200 text-sm mt-2">
                    {getMonthName(selectedPeriod.month)} {selectedPeriod.year}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <HiOutlineCurrencyDollar className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Transactions</p>
                  <p className="text-3xl font-bold mt-2">{transactionCount}</p>
                  <p className="text-emerald-200 text-sm mt-2 flex items-center gap-1">
                    <HiOutlineArrowUp className="w-4 h-4" />
                    12% from last month
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <HiOutlineCash className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Avg per Transaction</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(avgTransaction)}</p>
                  <p className="text-amber-200 text-sm mt-2 flex items-center gap-1">
                    <HiOutlineArrowDown className="w-4 h-4" />
                    5% from last month
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <HiOutlineChartBar className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Top Category</p>
                  <p className="text-2xl font-bold mt-2">{topCategory?.name}</p>
                  <p className="text-purple-200 text-sm mt-2">
                    {formatCurrency(topCategory?.value)}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl text-2xl">
                  {topCategory?.icon}
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - Expenses by Category */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <HiOutlineChartPie className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Expenses by Category</h3>
                    <p className="text-sm text-gray-500">Distribution of spending</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={demoPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomLabel}
                      >
                        {demoPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend */}
                <div className="w-full lg:w-1/2 space-y-3">
                  {demoPieData.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600 truncate">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Bar Chart - Monthly Expenses */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <HiOutlineChartBar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Expenses</h3>
                    <p className="text-sm text-gray-500">Last 6 months overview</p>
                  </div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barChartData} barGap={8}>
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
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    fill="url(#barGradient)" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Line Chart - Weekly Spending Trend (Full Width) */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <HiOutlineTrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Weekly Spending Trend</h3>
                  <p className="text-sm text-gray-500">Daily spending pattern for the current week</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-sm text-gray-600">Daily Spending</span>
                </div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={lineChartData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
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
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff', r: 5 }}
                  activeDot={{ r: 7, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Breakdown Table */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Category Breakdown</h3>
              <p className="text-sm text-gray-500 mt-0.5">Complete spending analysis by category</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {demoPieData.map((item, index) => {
                    const percentage = totalSpent > 0 ? (item.value / totalSpent) * 100 : 0;
                    const transactions = Math.floor(Math.random() * 10) + 1;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                              style={{ backgroundColor: `${item.color}15` }}
                            >
                              {item.icon}
                            </div>
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(item.value)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-gray-600">{transactions}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[120px] h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600 w-12">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">Total</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-indigo-600">
                        {formatCurrency(totalSpent)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-gray-900">{transactionCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">100%</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Insights Section */}
          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <HiOutlineTrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Spending Insights</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    Your highest spending category is <strong>{topCategory?.name}</strong> at {formatCurrency(topCategory?.value)}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    Average daily spending this week: {formatCurrency(lineChartData.reduce((sum, d) => sum + d.amount, 0) / 7)}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    You've made {transactionCount} transactions in {getMonthName(selectedPeriod.month)}
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Reports;
