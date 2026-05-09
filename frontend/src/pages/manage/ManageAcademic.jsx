import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Form, Input, Modal, Skeleton, Space, Table, message } from 'antd';

import PageHeader from '../../components/PageHeader.jsx';
import { createAcademic, deleteAcademic, getAcademic, updateAcademic } from '../../api/academic.js';

export default function ManageAcademic() {
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAcademic({ page: 1, limit: 200 });
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
        await createAcademic(values);
        message.success('Tạo bản ghi học tập thành công');
      } else {
        await updateAcademic(editing.row.record_id, values);
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
      title: `Xóa record_id=${row.record_id}?`,
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteAcademic(row.record_id);
          message.success('Đã xóa');
          load();
        } catch {
          message.error('Không xóa được');
        }
      }
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'record_id', width: 80 },
    { title: 'Mã HS', dataIndex: 'student_id' },
    { title: 'Năm học', dataIndex: 'academic_year' },
    { title: 'Lớp', dataIndex: 'class_id', render: (v) => v ?? '--' },
    { title: 'GPA', dataIndex: 'gpa', render: (v) => v ?? '--' },
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
      <PageHeader title="Quản lý FACT_ACADEMIC" items={[{ label: 'Quản lý' }, { label: 'FACT_ACADEMIC' }]} />

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
          <Table rowKey="record_id" columns={columns} dataSource={rows} />
        )}
      </Card>

      <Modal
        open={!!editing}
        title={editing?.mode === 'create' ? 'Thêm FACT_ACADEMIC' : 'Cập nhật FACT_ACADEMIC'}
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
          <Form.Item name="class_id" label="Lớp">
            <Input />
          </Form.Item>
          <Form.Item name="score_math" label="Toán">
            <Input />
          </Form.Item>
          <Form.Item name="score_literature" label="Văn">
            <Input />
          </Form.Item>
          <Form.Item name="score_english" label="Anh">
            <Input />
          </Form.Item>
          <Form.Item name="gpa" label="GPA">
            <Input />
          </Form.Item>
          <Form.Item name="failed_subjects_count" label="Failed subjects">
            <Input />
          </Form.Item>
          <Form.Item name="critical_failed_count" label="Critical failed">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
