import React, { useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Skeleton, Space, Typography } from 'antd';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import PageHeader from '../components/PageHeader.jsx';
import { getDashboardCharts, getDashboardStats } from '../api/dashboard.js';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [s, c] = await Promise.all([getDashboardStats(), getDashboardCharts()]);
        if (!mounted) return;
        setStats(s);
        setCharts(c);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const pieData = useMemo(() => {
    const dist = charts?.target_distribution || [];
    return dist.map((x) => ({ name: x.target, value: x.count }));
  }, [charts]);

  const gpaBar = useMemo(() => charts?.gpa_by_target || [], [charts]);
  const absentBar = useMemo(() => charts?.absent_by_target || [], [charts]);

  return (
    <div>
      <PageHeader title="📊 Dashboard tổng quan" items={[{ label: 'Dashboard' }]} />

      {loading ? (
        <Skeleton active />
      ) : !stats ? (
        <Card>Chưa có dữ liệu. Hãy vào Tools để sinh dữ liệu mẫu.</Card>
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Card>
                <Typography.Text type="secondary">Học sinh</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {stats.total_students ?? '--'}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Typography.Text type="secondary">Dropout</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {stats.dropout_count ?? '--'}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Typography.Text type="secondary">GPA TB</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {stats.avg_gpa ?? '--'}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Typography.Text type="secondary">Nghỉ TB/kỳ</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {stats.avg_absent_days ?? '--'}
                </Typography.Title>
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card title="Phân bổ TARGET" style={{ height: 380 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie dataKey="value" data={pieData} label />
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="GPA theo TARGET" style={{ height: 380 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gpaBar}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="target" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg_gpa" name="GPA TB" fill="#1677ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Card title="Phân bổ Absent_Days theo TARGET" style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={absentBar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="target" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg_absent_days" name="Nghỉ TB/kỳ" fill="#faad14" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Space>
      )}
    </div>
  );
}
