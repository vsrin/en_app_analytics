import React, { useState, useEffect } from 'react';
import { analyticsAPI } from './services/api';
import { formatTime, formatPercent } from './utils/formatters';
import { App as AppType } from './types';
import './App.css';

type TimeRange = 'today' | 'week' | 'month' | 'all';

function App() {
  const [apps, setApps] = useState<AppType[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('today');

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      loadAppData(selectedApp);
    }
  }, [selectedApp]);

  const loadApps = async () => {
    try {
      const response = await analyticsAPI.getApps();
      setApps(response.data.apps);
      setLoading(false);
    } catch (error) {
      console.error('Error loading apps:', error);
      setLoading(false);
    }
  };

  const loadAppData = async (appId: string) => {
    try {
      const [health, usersData, batchesData] = await Promise.all([
        analyticsAPI.getSystemHealth(appId, 30), // Get 30 days for calculations
        analyticsAPI.getUsers(appId, { limit: 10 }),
        analyticsAPI.getBatches(appId, { limit: 10 })
      ]);
      
      setHealthData(health.data);
      setUsers(usersData.data.users);
      setBatches(batchesData.data.batches);
    } catch (error) {
      console.error('Error loading app data:', error);
    }
  };

  const getAggregatedStats = () => {
    if (!healthData || !healthData.trend) {
      return {
        total_batches: 0,
        total_policies: 0,
        match_rate: 0,
        avg_processing_time: 0
      };
    }

    const now = new Date();
    let filteredData = [];

    switch (timeRange) {
      case 'today':
        const todayStr = now.toISOString().split('T')[0];
        filteredData = healthData.trend.filter((d: any) => d.date === todayStr);
        break;
      
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        filteredData = healthData.trend.filter((d: any) => d.date >= weekAgoStr);
        break;
      
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const monthAgoStr = monthAgo.toISOString().split('T')[0];
        filteredData = healthData.trend.filter((d: any) => d.date >= monthAgoStr);
        break;
      
      case 'all':
        filteredData = healthData.trend;
        break;
    }

    if (filteredData.length === 0) {
      return {
        total_batches: 0,
        total_policies: 0,
        match_rate: 0,
        avg_processing_time: 0
      };
    }

    // Aggregate the data
    const totals = filteredData.reduce((acc: any, day: any) => {
      return {
        total_batches: acc.total_batches + (day.total_batches || 0),
        total_policies: acc.total_policies + (day.total_policies || 0),
        total_claims: acc.total_claims + (day.total_claims || 0),
        matched_claims: acc.matched_claims + (day.matched_claims || 0),
        sum_processing_time: acc.sum_processing_time + (day.avg_processing_time || 0),
        count: acc.count + 1
      };
    }, {
      total_batches: 0,
      total_policies: 0,
      total_claims: 0,
      matched_claims: 0,
      sum_processing_time: 0,
      count: 0
    });

    return {
      total_batches: totals.total_batches,
      total_policies: totals.total_policies,
      match_rate: totals.total_claims > 0 ? (totals.matched_claims / totals.total_claims) * 100 : 0,
      avg_processing_time: totals.count > 0 ? totals.sum_processing_time / totals.count : 0
    };
  };

  const stats = getAggregatedStats();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!selectedApp) {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="logo-section">
            <img src="/ElevatenowLogo.jpg" alt="Elevatenow" className="app-logo" />
            <span className="logo-text">Elevatenow</span>
          </div>
          <h1>App Tracker Dashboard</h1>
          <div className="header-spacer"></div>
        </header>

        <div className="content-area">
          <div className="app-selector-intro">
            <p>Select an application to view analytics</p>
          </div>

          <div className="app-grid">
            {apps.map(app => (
              <div
                key={app.app_id}
                className="app-card"
                onClick={() => setSelectedApp(app.app_id)}
              >
                <h2>{app.app_name}</h2>
                {app.stats && (
                  <div className="app-stats">
                    <div><strong>{app.stats.total_users}</strong> Users</div>
                    <div><strong>{app.stats.total_batches}</strong> Batches</div>
                    <div><strong>{app.stats.active_today}</strong> Active Today</div>
                  </div>
                )}
                <button>View Analytics</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <img src="/ElevatenowLogo.jpg" alt="Elevatenow" className="app-logo" />
          <span className="logo-text">Elevatenow</span>
        </div>
        <h1>App Tracker Dashboard</h1>
        <button className="back-button" onClick={() => setSelectedApp(null)}>← Back to Apps</button>
      </header>

      {healthData && (
        <div className="dashboard">
          <section className="kpi-section">
            <div className="section-header-with-filter">
              <h2>System Health</h2>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="time-range-selector"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-label">Total Batches</div>
                <div className="kpi-value">{stats.total_batches}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Policies Processed</div>
                <div className="kpi-value">{stats.total_policies}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Match Rate</div>
                <div className="kpi-value">{formatPercent(stats.match_rate)}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Avg Processing Time</div>
                <div className="kpi-value">{formatTime(stats.avg_processing_time)}</div>
              </div>
            </div>
          </section>

          <section className="table-section">
            <h2>Active Users</h2>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Organization</th>
                  <th>Batches</th>
                  <th>Policies</th>
                  <th>Match Rate</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.username}>
                    <td>{user.username}</td>
                    <td>{user.organization}</td>
                    <td>{user.total_batches}</td>
                    <td>{user.total_policies}</td>
                    <td>{formatPercent(user.match_rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="table-section">
            <h2>Recent Batches</h2>
            <table>
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Policies</th>
                  <th>Match Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(batch => (
                  <tr key={batch.batch_id}>
                    <td><code>{batch.batch_id.substring(0, 8)}...</code></td>
                    <td>{batch.username}</td>
                    <td>{batch.date}</td>
                    <td>{batch.policy_count}</td>
                    <td>{formatPercent(batch.match_rate)}</td>
                    <td><span className="badge-success">{batch.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;