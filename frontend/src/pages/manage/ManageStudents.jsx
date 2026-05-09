import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Form, Input, Modal, Skeleton, Space, Switch, Table, message } from 'antd';

import PageHeader from '../../components/PageHeader.jsx';
import { createStudent, deleteStudent, getStudents, updateStudent } from '../../api/students.js';

export default function ManageStudents() {
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getStudents({ page: 1, limit: 200 });
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
        await createStudent(values);
        message.success('Tạo học sinh thành công');
      } else {
        await updateStudent(editing.row.student_id, values);
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
      title: `Xóa học sinh ${row.student_id}?`,
      content: 'Thao tác này sẽ xóa cascade các bản ghi liên quan.',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteStudent(row.student_id);
          message.success('Đã xóa');
          load();
        } catch {
          message.error('Không xóa được');
        }
      }
    });
  };

  const columns = [
    { title: 'Mã HS', dataIndex: 'student_id' },
    { title: 'Họ tên', dataIndex: 'full_name' },
    { title: 'Giới tính', dataIndex: 'gender', render: (v) => (v === 1 ? 'Nam' : v === 0 ? 'Nữ' : '--') },
    { title: 'Tuổi', dataIndex: 'enrollment_age', render: (v) => v ?? '--' },
    { title: 'Khoảng cách', dataIndex: 'distance_to_school', render: (v) => v ?? '--' },
    { title: 'Mồ côi', dataIndex: 'is_orphan', render: (v) => (v ? 'Có' : 'Không') },
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
      <PageHeader title="Quản lý DIM_STUDENTS" items={[{ label: 'Quản lý' }, { label: 'DIM_STUDENTS' }]} />

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
          <Table rowKey="student_id" columns={columns} dataSource={rows} />
        )}
      </Card>

      <Modal
        open={!!editing}
        title={editing?.mode === 'create' ? 'Thêm học sinh' : 'Cập nhật học sinh'}
        onCancel={() => setEditing(null)}
        onOk={onSubmit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="student_id" label="Mã HS" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input disabled={editing?.mode === 'edit'} />
          </Form.Item>
          <Form.Item name="full_name" label="Họ tên" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="enrollment_age" label="Tuổi vào lớp 10" rules={[{ type: 'number', transform: (v) => (v === '' ? undefined : Number(v)) }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính" rules={[{ type: 'number', transform: (v) => (v === '' ? undefined : Number(v)) }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="ethnicity_code" label="Dân tộc" rules={[{ type: 'number', transform: (v) => (v === '' ? undefined : Number(v)) }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="distance_to_school" label="Khoảng cách">
            <Input />
          </Form.Item>
          <Form.Item name="is_orphan" label="Mồ côi" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
