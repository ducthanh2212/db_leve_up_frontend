import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Empty, Row, Skeleton, Space, Table, Typography, message } from 'antd';

import PageHeader from '../components/PageHeader.jsx';
import { listScenarios, runSimulation } from '../api/simulation.js';

export default function Simulation() {
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await listScenarios();
        if (mounted) setScenarios(res);
      } catch {
        message.error('Không tải được kịch bản');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onRun = async (scenario) => {
    try {
      setRunning(true);
      const res = await runSimulation(scenario);
      setResult(res);
      message.success('Đã chạy mô phỏng');
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Mô phỏng thất bại');
    } finally {
      setRunning(false);
    }
  };

  const columns = [
    { title: '', dataIndex: 'label' },
    { title: 'Hiện tại', dataIndex: 'before' },
    { title: 'Sau mô phỏng', dataIndex: 'after' }
  ];

  const dataSource = result
    ? [
        {
          key: 'rate',
          label: 'Tỉ lệ Dropout',
          before: `${result.before.dropout_rate}%`,
          after: `${result.after.dropout_rate}%`
        },
        {
          key: 'count',
          label: 'Số Dropout (p>=0.5)',
          before: `${result.before.dropout_count}`,
          after: `${result.after.dropout_count}`
        },
        {
          key: 'avg_prob',
          label: 'Xác suất Dropout TB',
          before: result.prob_metrics
            ? `${(result.prob_metrics.avg_prob_dropout_before * 100).toFixed(2)}%`
            : '--',
          after: result.prob_metrics
            ? `${(result.prob_metrics.avg_prob_dropout_after * 100).toFixed(2)}%`
            : '--'
        },
        {
          key: 'changed',
          label: 'Số HS có xác suất thay đổi',
          before: '-',
          after: result.prob_metrics ? `${result.prob_metrics.students_with_prob_change}` : '--'
        },
        {
          key: 'affected',
          label: 'Số dòng bị tác động',
          before: '-',
          after: `${result.affected_students}`
        }
      ]
    : [];

  return (
    <div>
      <PageHeader title="🔬 PEDP — Mô phỏng chính sách" items={[{ label: 'Mô phỏng' }]} />

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Kịch bản" loading={loading}>
            {scenarios.map((s) => (
              <Card key={s.scenario_name} style={{ marginBottom: 12 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Typography.Text strong>{s.scenario_name}</Typography.Text>
                  <Typography.Text type="secondary">
                    {s.description || `${s.modifications?.length || 0} modifications`}
                  </Typography.Text>
                  <Button type="primary" onClick={() => onRun(s)} loading={running}>
                    🚀 Chạy mô phỏng
                  </Button>
                </Space>
              </Card>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Kết quả mô phỏng">
            {running ? (
              <Skeleton active />
            ) : !result ? (
              <Empty description="Chưa chạy mô phỏng" />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Table columns={columns} dataSource={dataSource} pagination={false} />
                <Typography.Text>
                  Delta: dropout_change={result.delta.dropout_change}, rate_change={result.delta.rate_change}%
                </Typography.Text>

                {result.prob_metrics ? (
                  <Typography.Text type="secondary">
                    Gợi ý: kể cả khi số dropout (p≥0.5) không đổi, xác suất trung bình có thể giảm/tăng.
                  </Typography.Text>
                ) : null}
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
