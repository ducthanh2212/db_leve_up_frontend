import React, { useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Space } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  RobotOutlined,
  ExperimentOutlined,
  ToolOutlined,
  LogoutOutlined
} from '@ant-design/icons';

import { useAuth } from '../contexts/AuthContext.jsx';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const location = useLocation();
  const { logout } = useAuth();

  const selectedKeys = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return ['dashboard'];
    if (p.startsWith('/students')) return ['students'];
    if (p.startsWith('/manage/students')) return ['manage_students'];
    if (p.startsWith('/manage/family')) return ['manage_family'];
    if (p.startsWith('/manage/academic')) return ['manage_academic'];
    if (p.startsWith('/manage/behavior')) return ['manage_behavior'];
    if (p.startsWith('/manage/enrollment')) return ['manage_enrollment'];
    if (p.startsWith('/prediction/train')) return ['pred_train'];
    if (p.startsWith('/prediction/results')) return ['pred_results'];
    if (p.startsWith('/prediction/analysis')) return ['pred_analysis'];
    if (p.startsWith('/simulation')) return ['simulation'];
    if (p.startsWith('/tools')) return ['tools'];
    return [];
  }, [location.pathname]);

  const openKeys = useMemo(() => {
    const p = location.pathname;
    const keys = [];
    if (p.startsWith('/manage')) keys.push('manage');
    if (p.startsWith('/prediction')) keys.push('prediction');
    return keys;
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={260}>
        <div style={{ padding: 16 }}>
          <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
            🎓 DEWS
          </Typography.Title>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.75)' }}>
            Dropout Early Warning
          </Typography.Text>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: <Link to="/dashboard">Dashboard</Link>
            },
            {
              key: 'students',
              icon: <TeamOutlined />,
              label: <Link to="/students">Học sinh</Link>
            },
            {
              key: 'manage',
              icon: <SettingOutlined />,
              label: 'Quản lý',
              children: [
                {
                  key: 'manage_students',
                  label: <Link to="/manage/students">DIM_STUDENTS</Link>
                },
                {
                  key: 'manage_family',
                  label: <Link to="/manage/family">DIM_FAMILY</Link>
                },
                {
                  key: 'manage_academic',
                  label: <Link to="/manage/academic">FACT_ACADEMIC</Link>
                },
                {
                  key: 'manage_behavior',
                  label: <Link to="/manage/behavior">FACT_BEHAVIOR</Link>
                },
                {
                  key: 'manage_enrollment',
                  label: <Link to="/manage/enrollment">FACT_ENROLLMENT</Link>
                }
              ]
            },
            {
              key: 'prediction',
              icon: <RobotOutlined />,
              label: 'Dự báo ML',
              children: [
                {
                  key: 'pred_train',
                  label: <Link to="/prediction/train">Train mô hình</Link>
                },
                {
                  key: 'pred_results',
                  label: <Link to="/prediction/results">Kết quả dự báo</Link>
                },
                {
                  key: 'pred_analysis',
                  label: <Link to="/prediction/analysis">Feature importance</Link>
                }
              ]
            },
            {
              key: 'simulation',
              icon: <ExperimentOutlined />,
              label: <Link to="/simulation">Mô phỏng</Link>
            },
            {
              key: 'tools',
              icon: <ToolOutlined />,
              label: <Link to="/tools">Công cụ</Link>
            }
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: 'white',
            paddingInline: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography.Text strong>DEWS — Research Admin</Typography.Text>
          <Space>
            <Button icon={<LogoutOutlined />} onClick={logout}>
              Đăng xuất
            </Button>
          </Space>
        </Header>

        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
