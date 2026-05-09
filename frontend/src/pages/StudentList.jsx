import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Empty, Form, Input, Row, Select, Skeleton, Space, Table, message } from 'antd';
import { Link } from 'react-router-dom';

import PageHeader from '../components/PageHeader.jsx';
import TargetBadge from '../components/TargetBadge.jsx';
import RiskGauge from '../components/RiskGauge.jsx';
import { getStudents } from '../api/students.js';
import { getPrediction } from '../api/ml.js';

export default function StudentList() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchData = async (p = page, l = limit) => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      const res = await getStudents({
        page: p,
        limit: l,
        search: values.search,
        gender: values.gender,
        distance_to_school: values.distance_to_school
      });

  // API shape: GET /students returns { success, data: [...], meta }
  // `getStudents()` already returns `res.data.data` (the array).
  const items = Array.isArray(res) ? res : res?.items || [];
  const meta = Array.isArray(res) ? null : res?.meta;
      setRows(items);
      setTotal(meta?.total ?? items.length);

      // Attach prediction probability if available: fetch per student (cheap for 20/page)
      // If backend has no predictions, endpoint returns 404 -> show "--".
      const withPred = await Promise.all(
        items.map(async (it) => {
          try {
            const pred = await getPrediction(it.student_id);
            return { ...it, prob_dropout: pred.prob_dropout };
          } catch {
            return { ...it, prob_dropout: null };
          }
        })
      );
      setRows(withPred);
    } catch (e) {
      message.error('Không tải được danh sách học sinh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(
    () => [
      {
        title: '#',
        render: (_, __, idx) => (page - 1) * limit + idx + 1,
        width: 60
      },
      {
        title: 'Mã HS',
        dataIndex: 'student_id',
        render: (v) => <Link to={`/students/${v}`}>{v}</Link>
      },
      { title: 'Họ tên', dataIndex: 'full_name' },
      { title: 'GPA', dataIndex: 'gpa', render: (v) => (v ?? '--') },
      {
        title: 'TARGET',
        dataIndex: 'target',
        render: (v) => <TargetBadge value={v} />
      },
      {
        title: 'Nguy cơ',
        dataIndex: 'prob_dropout',
        render: (v) => <RiskGauge probDropout={v} />
      }
    ],
    [limit, page]
  );

  return (
    <div>
      <PageHeader title="Danh sách học sinh" items={[{ label: 'Học sinh' }]} />

      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" onFinish={() => fetchData(1, limit)}>
          <Row gutter={16} align="bottom">
            <Col xs={24} md={8}>
              <Form.Item label="🔍 Tên / Mã HS" name="search">
                <Input placeholder="Nhập tên hoặc mã" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Giới tính" name="gender">
                <Select allowClear options={[{ value: 1, label: 'Nam' }, { value: 0, label: 'Nữ' }]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label="Khoảng cách" name="distance_to_school">
                <Select allowClear options={[{ value: 'Gần', label: 'Gần' }, { value: 'Xa', label: 'Xa' }, { value: 'Rất xa', label: 'Rất xa' }]} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Space>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    fetchData(1, limit);
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        {loading ? (
          <Skeleton active />
        ) : rows.length === 0 ? (
          <Empty description="Không có dữ liệu" />
        ) : (
          <Table
            rowKey="student_id"
            columns={columns}
            dataSource={rows}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              onChange: (p, ps) => {
                setPage(p);
                setLimit(ps);
                fetchData(p, ps);
              }
            }}
          />
        )}
      </Card>
    </div>
  );
}
