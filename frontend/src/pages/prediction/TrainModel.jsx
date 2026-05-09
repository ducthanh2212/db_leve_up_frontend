import React, { useState } from 'react';
import { Button, Card, Checkbox, Progress, Space, Switch, Table, Typography, message } from 'antd';

import PageHeader from '../../components/PageHeader.jsx';
import { listModels, predictAll, trainModels } from '../../api/ml.js';

export default function TrainModel() {
  const [applySmote, setApplySmote] = useState(true);
  const [training, setTraining] = useState(false);
  const [models, setModels] = useState([]);

  const onTrain = async () => {
    try {
      setTraining(true);
      const res = await trainModels({ apply_smote: applySmote });
      message.success('Training completed');
      setModels(res);
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Train thất bại');
    } finally {
      setTraining(false);
    }
  };

  const refresh = async () => {
    try {
      const res = await listModels();
      setModels(res);
    } catch {
      message.error('Không tải được models');
    }
  };

  const onApply = async (modelId) => {
    try {
      await predictAll(modelId);
      message.success('Đã áp dụng model và cập nhật dự báo');
      refresh();
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Không áp dụng được');
    }
  };

  const columns = [
    { title: 'Model', dataIndex: 'model_name' },
    { title: 'F1', dataIndex: 'f1_score' },
    { title: 'AUC', dataIndex: 'auc_roc' },
    { title: 'Acc', dataIndex: 'accuracy' },
    {
      title: 'Active',
      dataIndex: 'is_active',
      render: (v) => (v ? '⭐' : '')
    },
    {
      title: 'Action',
      render: (_, row) => (
        <Button type="primary" onClick={() => onApply(row.model_id)}>
          Áp dụng
        </Button>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="🤖 Train & Đánh giá mô hình" items={[{ label: 'Dự báo', to: '/prediction/train' }, { label: 'Train' }]} />

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical">
          <Typography.Text strong>Cấu hình Training</Typography.Text>
          <Space>
            <span>Áp dụng SMOTE</span>
            <Switch checked={applySmote} onChange={setApplySmote} />
          </Space>
          <Button type="primary" onClick={onTrain} loading={training}>
            🚀 Bắt đầu Training
          </Button>
          {training && <Progress percent={60} status="active" />}
        </Space>
      </Card>

      <Card title="Kết quả đánh giá">
        <Table rowKey="model_id" columns={columns} dataSource={models} />
      </Card>
    </div>
  );
}
