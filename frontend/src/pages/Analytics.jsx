import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Eye, Camera, Clock, MapPin, BarChart3, RefreshCw } from 'lucide-react';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState(null);

  const createMockData = () => ({
    summary: {
      totalDetections: 742,
      uniqueSpecies: 28,
      averageConfidence: 87.3,
      topSpecies: 'Red-tailed Hawk'
    },
    speciesDistribution: [
      { species: 'Red-tailed Hawk', count: 45, percentage: 25 },
      { species: 'American Robin', count: 36, percentage: 20 },
      { species: 'Blue Jay', count: 27, percentage: 15 },
      { species: 'Northern Cardinal', count: 22, percentage: 12 },
      { species: 'House Sparrow', count: 18, percentage: 10 }
    ],
    locations: [
      { location: 'Forest Trail A', count: 145 },
      { location: 'Meadow View', count: 132 },
      { location: 'Lake Shore', count: 98 },
      { location: 'Mountain Ridge', count: 67 }
    ],
    recentDetections: [
      { id: 1, species: 'Red-tailed Hawk', confidence: 94.2, location: 'Forest Trail A', timestamp: '2 hours ago' },
      { id: 2, species: 'American Robin', confidence: 91.8, location: 'Meadow View', timestamp: '3 hours ago' },
      { id: 3, species: 'Blue Jay', confidence: 89.5, location: 'Lake Shore', timestamp: '5 hours ago' }
    ]
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAnalyticsData(createMockData());
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Wildlife detection analytics and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '1y' ? '1 Year' : range.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={() => setTimeRange(timeRange)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Detections</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.summary?.totalDetections?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Species</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.summary?.uniqueSpecies || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.summary?.averageConfidence || 0}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Top Species</p>
              <p className="text-lg font-bold text-gray-900">{analyticsData?.summary?.topSpecies || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Species Distribution</h3>
          <div className="space-y-3">
            {analyticsData?.speciesDistribution?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">{item.species}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detection Locations</h3>
          <div className="space-y-3">
            {analyticsData?.locations?.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{location.location}</span>
                </div>
                <span className="text-sm text-gray-600">{location.count} detections</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent High-Confidence Detections</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Species</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData?.recentDetections?.map((detection) => (
                  <tr key={detection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{detection.species}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        detection.confidence >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {detection.confidence}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detection.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detection.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
