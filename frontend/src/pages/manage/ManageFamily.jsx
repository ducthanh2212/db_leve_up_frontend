import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Form, Input, Modal, Skeleton, Space, Table, message } from 'antd';

import PageHeader from '../../components/PageHeader.jsx';
import { createFamily, deleteFamily, getFamily, updateFamily } from '../../api/family.js';

export default function ManageFamily() {
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getFamily({ page: 1, limit: 200 });
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
        await createFamily(values);
        message.success('Tạo bản ghi gia đình thành công');
      } else {
        await updateFamily(editing.row.family_id, values);
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
      title: `Xóa bản ghi family_id=${row.family_id}?`,
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteFamily(row.family_id);
          message.success('Đã xóa');
          load();
        } catch {
          message.error('Không xóa được');
        }
      }
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'family_id', width: 80 },
    { title: 'Mã HS', dataIndex: 'student_id' },
    { title: 'Father occ', dataIndex: 'father_occupation_code', render: (v) => v ?? '--' },
    { title: 'Mother occ', dataIndex: 'mother_occupation_code', render: (v) => v ?? '--' },
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
      <PageHeader title="Quản lý DIM_FAMILY" items={[{ label: 'Quản lý' }, { label: 'DIM_FAMILY' }]} />

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
          <Table rowKey="family_id" columns={columns} dataSource={rows} />
        )}
      </Card>

      <Modal
        open={!!editing}
        title={editing?.mode === 'create' ? 'Thêm DIM_FAMILY' : 'Cập nhật DIM_FAMILY'}
        onCancel={() => setEditing(null)}
        onOk={onSubmit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="student_id" label="Mã HS" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="father_occupation_code" label="Father occupation code">
            <Input />
          </Form.Item>
          <Form.Item name="father_age" label="Father age">
            <Input />
          </Form.Item>
          <Form.Item name="mother_occupation_code" label="Mother occupation code">
            <Input />
          </Form.Item>
          <Form.Item name="mother_age" label="Mother age">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
