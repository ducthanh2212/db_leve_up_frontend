import React, { useState } from 'react';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import { login as loginApi } from '../api/auth.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await loginApi(values.username, values.password);
      login(res.token, res.user || { username: values.username });
      message.success('Đăng nhập thành công');
      navigate('/dashboard');
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: 24
      }}
    >
      <Card style={{ width: 420 }}>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>
          🎓 Dropout Early Warning System
        </Typography.Title>
        <Typography.Paragraph style={{ textAlign: 'center', marginTop: -8 }}>
          Hệ thống Dự báo Nguy cơ Bỏ học
        </Typography.Paragraph>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input placeholder="admin" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng nhập
          </Button>
        </Form>

        <Typography.Paragraph
          type="secondary"
          style={{ textAlign: 'center', marginTop: 16, marginBottom: 0 }}
        >
          v2.0 — HCMUE Research 2026
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
