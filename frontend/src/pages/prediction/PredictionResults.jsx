import React, { useEffect, useState } from 'react';
import { Card, Empty, Skeleton, Space, Table, Typography, message } from 'antd';

import PageHeader from '../../components/PageHeader.jsx';
import RiskGauge from '../../components/RiskGauge.jsx';
import { earlyWarning, listModels } from '../../api/ml.js';

export default function PredictionResults() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [activeModel, setActiveModel] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [models, warn] = await Promise.all([listModels(), earlyWarning(0.7, 50)]);
        if (!mounted) return;
        setActiveModel(models.find((m) => m.is_active) || null);
        setItems(warn);
      } catch {
        message.error('Chưa có dự báo. Hãy train và predict all.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const columns = [
    { title: '#', render: (_, __, idx) => idx + 1, width: 60 },
    { title: 'Mã HS', dataIndex: 'student_id' },
    {
      title: 'P(Dropout)',
      dataIndex: 'prob_dropout',
      render: (v) => <RiskGauge probDropout={v} />
    },
    { title: 'Nhãn dự báo', dataIndex: 'predicted_label', render: (v) => v ?? '--' }
  ];

  return (
    <div>
      <PageHeader title="🚨 Cảnh báo sớm" items={[{ label: 'Dự báo' }, { label: 'Kết quả' }]} />

      <Card style={{ marginBottom: 16 }}>
        <Typography.Text>
          Model đang dùng: {activeModel ? `${activeModel.model_name} (F1=${activeModel.f1_score})` : '--'}
        </Typography.Text>
      </Card>

      <Card title="Top học sinh nguy cơ Dropout cao nhất">
        {loading ? (
          <Skeleton active />
        ) : items.length === 0 ? (
          <Empty description="Chưa có dự báo" />
        ) : (
          <Table rowKey="student_id" columns={columns} dataSource={items} pagination={false} />
        )}
      </Card>
    </div>
  );
}
