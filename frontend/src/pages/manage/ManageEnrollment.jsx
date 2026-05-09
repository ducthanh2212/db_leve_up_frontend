import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Form, Input, Modal, Select, Skeleton, Space, Table, message } from 'antd';

import PageHeader from '../../components/PageHeader.jsx';
import TargetBadge from '../../components/TargetBadge.jsx';
import { createEnrollment, deleteEnrollment, getEnrollment, updateEnrollment } from '../../api/enrollment.js';

export default function ManageEnrollment() {
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getEnrollment({ page: 1, limit: 200 });
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
        await createEnrollment(values);
        message.success('Tạo FACT_ENROLLMENT thành công');
      } else {
        await updateEnrollment(editing.row.status_id, values);
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
      title: `Xóa status_id=${row.status_id}?`,
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteEnrollment(row.status_id);
          message.success('Đã xóa');
          load();
        } catch {
          message.error('Không xóa được');
        }
      }
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'status_id', width: 80 },
    { title: 'Mã HS', dataIndex: 'student_id' },
    { title: 'Trạng thái', dataIndex: 'original_status', render: (v) => v ?? '--' },
    { title: 'TARGET', dataIndex: 'target', render: (v) => <TargetBadge value={v} /> },
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
      <PageHeader title="Quản lý FACT_ENROLLMENT" items={[{ label: 'Quản lý' }, { label: 'FACT_ENROLLMENT' }]} />

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
          <Table rowKey="status_id" columns={columns} dataSource={rows} />
        )}
      </Card>

      <Modal
        open={!!editing}
        title={editing?.mode === 'create' ? 'Thêm FACT_ENROLLMENT' : 'Cập nhật FACT_ENROLLMENT'}
        onCancel={() => setEditing(null)}
        onOk={onSubmit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="student_id" label="Mã HS" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="original_status" label="Original status">
            <Input />
          </Form.Item>
          <Form.Item name="dropout_reason" label="Dropout reason">
            <Input />
          </Form.Item>
          <Form.Item name="promotion_result" label="Promotion result">
            <Input />
          </Form.Item>
          <Form.Item name="previous_retained" label="Previous retained">
            <Input />
          </Form.Item>
          <Form.Item name="target" label="TARGET" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Select
              options={[
                { value: 'Dropout', label: 'Dropout' },
                { value: 'Enrolled', label: 'Enrolled' },
                { value: 'Graduate', label: 'Graduate' }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
