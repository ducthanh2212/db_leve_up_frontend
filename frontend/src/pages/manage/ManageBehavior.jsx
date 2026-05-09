import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Form, Input, Modal, Skeleton, Space, Table, Tag, message } from 'antd';

import PageHeader from '../../components/PageHeader.jsx';
import { createBehavior, deleteBehavior, getBehavior, updateBehavior } from '../../api/behavior.js';

function trendTag(v) {
  if (v === null || v === undefined) return '--';
  const val = Number(v);
  if (val > 0.2) return <Tag color="green">+{val}</Tag>;
  if (val >= -0.2) return <Tag color="gold">{val}</Tag>;
  return <Tag color="red">{val}</Tag>;
}

export default function ManageBehavior() {
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getBehavior({ page: 1, limit: 200 });
      setRows(res.items || res.data?.items || []);
    } catch {
      message.error('Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing({ mode: 'create' });
    form.resetFields();
  };

  const openEdit = (row) => {
    setEditing({ mode: 'edit', row });
    form.setFieldsValue(row);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing.mode === 'create') {
        await createBehavior(values);
        message.success('Tạo bản ghi hành vi thành công');
      } else {
        await updateBehavior(editing.row.behavior_id, values);
        message.success('Cập nhật thành công');
      }
      setEditing(null);
      load();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.detail || 'Có lỗi xảy ra');
    }
  };

  const onDelete = (row) => {
    Modal.confirm({
      title: `Xóa behavior_id=${row.behavior_id}?`,
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteBehavior(row.behavior_id);
          message.success('Đã xóa');
          load();
        } catch {
          message.error('Không xóa được');
        }
      }
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'behavior_id', width: 80 },
    { title: 'Mã HS', dataIndex: 'student_id' },
    { title: 'Năm học', dataIndex: 'academic_year' },
    { title: 'Kỳ', dataIndex: 'semester' },
    { title: 'Nghỉ', dataIndex: 'absent_days' },
    { title: 'Trend', dataIndex: 'engagement_trend', render: trendTag },
    {
      title: 'Action',
      render: (_, row) => (
        <Space>
          <Button onClick={() => openEdit(row)}>Sửa</Button>
          <Button danger onClick={() => onDelete(row)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Quản lý FACT_BEHAVIOR" items={[{ label: 'Quản lý' }, { label: 'FACT_BEHAVIOR' }]} />

      <Card>
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" onClick={openCreate}>
            + Thêm bản ghi mới
          </Button>
        </Space>

        {loading ? (
          <Skeleton active />
        ) : rows.length === 0 ? (
          <Empty />
        ) : (
          <Table rowKey="behavior_id" columns={columns} dataSource={rows} />
        )}
      </Card>

      <Modal
        open={!!editing}
        title={editing?.mode === 'create' ? 'Thêm FACT_BEHAVIOR' : 'Cập nhật FACT_BEHAVIOR'}
        onCancel={() => setEditing(null)}
        onOk={onSubmit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="student_id" label="Mã HS" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="academic_year" label="Năm học" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input placeholder="2023-2024" />
          </Form.Item>
          <Form.Item name="semester" label="Học kỳ" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input placeholder="HK1" />
          </Form.Item>
          <Form.Item name="absent_days" label="Số ngày nghỉ">
            <Input />
          </Form.Item>
          <Form.Item name="conduct_rank_code" label="Hạnh kiểm">
            <Input />
          </Form.Item>
          <Form.Item name="total_assignments" label="Bài tập">
            <Input />
          </Form.Item>
          <Form.Item name="total_time_online" label="Thời gian online">
            <Input />
          </Form.Item>
          <Form.Item name="engagement_trend" label="Engagement trend" rules={[{ type: 'number', transform: (v) => (v === '' ? undefined : Number(v)), min: -1, max: 1 }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
