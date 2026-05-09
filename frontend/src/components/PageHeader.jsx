import React from 'react';
import { Breadcrumb, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';

export default function PageHeader({ title, items = [] }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Space direction="vertical" size={4}>
        <Breadcrumb
          items={items.map((it) => ({
            title: it.to ? <Link to={it.to}>{it.label}</Link> : it.label
          }))}
        />
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
      </Space>
    </div>
  );
}
