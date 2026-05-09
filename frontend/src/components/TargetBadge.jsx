import React from 'react';
import { Tag } from 'antd';

const map = {
  Dropout: { color: 'red', label: 'Dropout' },
  Enrolled: { color: 'gold', label: 'Enrolled' },
  Graduate: { color: 'green', label: 'Graduate' }
};

export default function TargetBadge({ value }) {
  if (!value) return <span>--</span>;
  const info = map[value] || { color: 'default', label: String(value) };
  return <Tag color={info.color}>{info.label}</Tag>;
}
