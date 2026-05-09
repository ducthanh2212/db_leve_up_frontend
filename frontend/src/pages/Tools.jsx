import React, { useState } from 'react';
import { Button, Card, Col, Form, InputNumber, Row, Select, Space, Typography, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import PageHeader from '../components/PageHeader.jsx';
import { downloadTemplate, exportTable, generateData, importCsv } from '../api/tools.js';

const TABLES = [
  { value: 'dim_students', label: 'DIM_STUDENTS' },
  { value: 'dim_family', label: 'DIM_FAMILY' },
  { value: 'fact_academic', label: 'FACT_ACADEMIC' },
  { value: 'fact_behavior', label: 'FACT_BEHAVIOR' },
  { value: 'fact_enrollment', label: 'FACT_ENROLLMENT' }
];

export default function Tools() {
  const [table, setTable] = useState('dim_students');
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form] = Form.useForm();

  const onImport = async () => {
    if (!file) return message.warning('Chọn file trước');
    try {
      setImporting(true);
      const res = await importCsv(table, file);
      message.success(`Import xong: ${res.success} success, ${res.failed} failed`);
    } catch (e) {
      message.error(e?.response?.data?.detail || 'Import thất bại');
    } finally {
      setImporting(false);
    }
  };

  const onGenerate = async () => {
    try {
      const values = await form.validateFields();
      setGenerating(true);
      const res = await generateData(values);
      message.success('Đã sinh dữ liệu mẫu');
      // eslint-disable-next-line no-console
      console.log(res);
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.detail || 'Generate thất bại');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <PageHeader title="⚙️ Công cụ dữ liệu" items={[{ label: 'Công cụ' }]} />

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="📥 Import CSV">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <span>Bảng đích:</span>
                <Select value={table} onChange={setTable} options={TABLES} style={{ width: 220 }} />
              </Space>

              <Upload
                beforeUpload={(f) => {
                  setFile(f);
                  return false;
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Chọn file CSV</Button>
              </Upload>

              <Space>
                <Button onClick={() => downloadTemplate(table)}>Xem header mẫu</Button>
                <Button type="primary" onClick={onImport} loading={importing}>
                  Import ngay
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="🤖 Sinh dữ liệu mẫu">
            <Form
              form={form}
              layout="vertical"
              initialValues={{ n_students: 500, seed: 42 }}
              onFinish={onGenerate}
            >
              <Form.Item
                name="n_students"
                label="Số học sinh"
                rules={[{ required: true, message: 'Bắt buộc' }]}
              >
                <InputNumber min={10} max={5000} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="seed" label="Seed" rules={[{ required: true, message: 'Bắt buộc' }]}>
                <InputNumber min={0} max={10000000} style={{ width: '100%' }} />
              </Form.Item>

              <Typography.Paragraph type="secondary">
                Lưu ý: hiện backend generate sẽ INSERT thêm (không auto xóa data cũ).
              </Typography.Paragraph>

              <Button type="primary" htmlType="submit" loading={generating}>
                🔄 Sinh dữ liệu mẫu
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Card title="📤 Export" style={{ marginTop: 16 }}>
        <Space>
          <Select value={table} onChange={setTable} options={TABLES} style={{ width: 220 }} />
          <Button onClick={() => exportTable(table)}>📥 Export CSV</Button>
        </Space>
      </Card>
    </div>
  );
}
