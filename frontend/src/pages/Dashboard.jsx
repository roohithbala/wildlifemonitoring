import React, { useState, useEffect } from 'react';
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
  Line
} from 'recharts';
import { 
  Camera, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { analyticsAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import { formatNumber, formatPercentage } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getDashboard(timeframe);
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              <TrendingUp size={16} className="mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={loadDashboardData}
          className="btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { overview, speciesDistribution, timeline, confidenceDistribution, recentHighConfidence } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Wildlife monitoring overview</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="input-field"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          
          <button className="btn-secondary flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Detections"
          value={formatNumber(overview.totalDetections)}
          icon={Camera}
          trend={`+${overview.recentDetections} this period`}
          color="primary"
        />
        <StatCard
          title="Species Detected"
          value={formatNumber(overview.uniqueSpecies)}
          icon={Users}
          color="nature"
        />
        <StatCard
          title="Avg Confidence"
          value={formatPercentage(overview.averageConfidence)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Recent Activity"
          value={formatNumber(overview.recentDetections)}
          icon={Calendar}
          color="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Species Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Species Distribution
          </h3>
          {speciesDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={speciesDistribution.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {speciesDistribution.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No species data available
            </div>
          )}
        </div>

        {/* Detection Timeline */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Detection Timeline
          </h3>
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No timeline data available
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Species */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Top Species
          </h3>
          <div className="space-y-3">
            {speciesDistribution.slice(0, 5).map((species, index) => (
              <div key={species._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {species._id}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {species.count} detections
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Confidence Levels
          </h3>
          {confidenceDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={confidenceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No confidence data available
            </div>
          )}
        </div>

        {/* Recent High Confidence Detections */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            High Confidence Detections
          </h3>
          <div className="space-y-3">
            {recentHighConfidence.length > 0 ? (
              recentHighConfidence.map((detection) => (
                <div key={detection._id} className="flex items-center space-x-3">
                  <img
                    src={`http://localhost:5001${detection.imageUrl}`}
                    alt={detection.topPrediction.species}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {detection.topPrediction.species}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPercentage(detection.topPrediction.confidence)} confidence
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No high confidence detections yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;