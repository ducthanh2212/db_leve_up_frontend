import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Descriptions, Empty, Skeleton, Space, Table, Tag, Tabs, Typography, message } from 'antd';
import { Link, useParams } from 'react-router-dom';

import PageHeader from '../components/PageHeader.jsx';
import TargetBadge from '../components/TargetBadge.jsx';
import RiskGauge from '../components/RiskGauge.jsx';
import { getStudentById } from '../api/students.js';
import { getPrediction, explainStudent } from '../api/ml.js';
import { getFamily } from '../api/family.js';
import { getAcademic } from '../api/academic.js';
import { getBehavior } from '../api/behavior.js';
import { getOccupations } from '../api/lookups.js';

export default function StudentDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [explain, setExplain] = useState(null);
  const [family, setFamily] = useState(null);
  const [academic, setAcademic] = useState([]);
  const [behavior, setBehavior] = useState([]);
  const [occupationMap, setOccupationMap] = useState({});
  const debug = (window?.location?.search || '').includes('debug=1');

  const decodeOccupation = (code) => {
    if (code === null || code === undefined || code === '') return '--';
    const key = String(code);
    return occupationMap[key] || `Mã ${code}`;
  };

  const academicColumns = useMemo(
    () => [
  { title: 'Năm học', dataIndex: 'academic_year', key: 'academic_year', width: 120 },
  { title: 'Lớp', dataIndex: 'class_id', key: 'class_id', width: 90 },
      {
        title: 'GPA',
        dataIndex: 'gpa',
        key: 'gpa',
        width: 90,
        render: (v) => (v === null || v === undefined ? '--' : Number(v).toFixed(2)),
      },
  { title: 'Toán', dataIndex: 'score_math', key: 'score_math', width: 90 },
  { title: 'Văn', dataIndex: 'score_literature', key: 'score_literature', width: 90 },
  { title: 'Anh', dataIndex: 'score_english', key: 'score_english', width: 90 },
  { title: 'Môn trượt', dataIndex: 'failed_subjects_count', key: 'failed_subjects_count', width: 100 },
    ],
    []
  );

  const behaviorColumns = useMemo(
    () => [
  { title: 'Năm học', dataIndex: 'academic_year', key: 'academic_year', width: 120 },
  { title: 'Học kỳ', dataIndex: 'semester', key: 'semester', width: 90 },
      { title: 'Vắng (ngày)', dataIndex: 'absent_days', key: 'absent_days', width: 110 },
  { title: 'Bài tập', dataIndex: 'total_assignments', key: 'total_assignments', width: 110 },
  { title: 'Online (giờ)', dataIndex: 'total_time_online', key: 'total_time_online', width: 120 },
  { title: 'Xu hướng', dataIndex: 'engagement_trend', key: 'engagement_trend', width: 100 },
    ],
    []
  );

  const topFactors = useMemo(() => {
    // Best-effort normalization because explain payload might vary.
    const raw = explain?.data ?? explain;
    const arr =
      raw?.top_features ||
      raw?.top ||
      raw?.features ||
      raw?.items ||
      (Array.isArray(raw) ? raw : null);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((x) => {
        if (Array.isArray(x) && x.length >= 2) return { name: String(x[0]), value: x[1] };
        if (typeof x === 'object' && x) return { name: x.feature || x.name || x.key, value: x.shap_value ?? x.value ?? x.score };
        return null;
      })
      .filter(Boolean)
      .slice(0, 12);
  }, [explain]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
  if (debug) console.log('[StudentDetail] loading', { id });
        const s = await getStudentById(id);
        if (!mounted) return;
        setStudent(s);
  if (debug) console.log('[StudentDetail] student loaded', s);

        // Fetch related data (family/academic/behavior) using dedicated endpoints.
        try {
          const occRes = await getOccupations('vi');
          const items = occRes?.data || [];
          const map = {};
          for (const it of items) {
            if (it?.code === null || it?.code === undefined) continue;
            map[String(it.code)] = it.name || it.name_vi || it.name_en || String(it.code);
          }
          setOccupationMap(map);
          if (debug) console.log('[StudentDetail] occupations loaded', map);
        } catch {
          if (debug) console.log('[StudentDetail] occupations failed');
          setOccupationMap({});
        }

        try {
          const famRes = await getFamily({ student_id: id, page: 1, limit: 1 });
          if (debug) console.log('[StudentDetail] family raw', famRes);
          const famItem = Array.isArray(famRes) ? famRes[0] : famRes?.[0];
          setFamily(famItem || null);
        } catch {
          if (debug) console.log('[StudentDetail] family failed');
          setFamily(null);
        }

        try {
          const acaRes = await getAcademic({ student_id: id, page: 1, limit: 200 });
          if (debug) console.log('[StudentDetail] academic raw', acaRes);
          setAcademic(Array.isArray(acaRes) ? acaRes : []);
        } catch {
          if (debug) console.log('[StudentDetail] academic failed');
          setAcademic([]);
        }

        try {
          const behRes = await getBehavior({ student_id: id, page: 1, limit: 200 });
          if (debug) console.log('[StudentDetail] behavior raw', behRes);
          setBehavior(Array.isArray(behRes) ? behRes : []);
        } catch {
          if (debug) console.log('[StudentDetail] behavior failed');
          setBehavior([]);
        }

        try {
          const p = await getPrediction(id);
          setPrediction(p);
        } catch {
          if (debug) console.log('[StudentDetail] prediction failed');
          setPrediction(null);
        }

        try {
          const e = await explainStudent(id);
          setExplain(e);
        } catch {
          if (debug) console.log('[StudentDetail] explain failed');
          setExplain(null);
        }
      } catch {
        message.error('Không tải được hồ sơ học sinh');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <Skeleton active />;
  if (!student) return <Empty description="Không tìm thấy học sinh" />;

  return (
    <div>
      <PageHeader
        title={`👤 ${student.full_name} — ${student.student_id}`}
        items={[{ label: 'Học sinh', to: '/students' }, { label: student.student_id }]}
      />

      <Space style={{ marginBottom: 16 }}>
        <Button>
          <Link to="/students">← Quay lại danh sách</Link>
        </Button>
        <Space>
          <Typography.Text>
            TARGET thực: <TargetBadge value={student.target} />
          </Typography.Text>
        </Space>
        <Space>
          <Typography.Text>
            Dự báo ML: <RiskGauge probDropout={prediction?.prob_dropout ?? null} />
          </Typography.Text>
        </Space>
      </Space>

      <Tabs
        items={[
          {
            key: 'info',
            label: 'Thông tin',
            children: (
              <Card>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Mã HS">{student.student_id}</Descriptions.Item>
                  <Descriptions.Item label="Họ tên">{student.full_name}</Descriptions.Item>
                  <Descriptions.Item label="Tuổi vào lớp 10">{student.enrollment_age ?? '--'}</Descriptions.Item>
                  <Descriptions.Item label="Giới tính">{student.gender === 1 ? 'Nam' : student.gender === 0 ? 'Nữ' : '--'}</Descriptions.Item>
                  <Descriptions.Item label="Dân tộc">{student.ethnicity_code ?? '--'}</Descriptions.Item>
                  <Descriptions.Item label="Khoảng cách">{student.distance_to_school ?? '--'}</Descriptions.Item>
                  <Descriptions.Item label="Mồ côi">{student.is_orphan ? 'Có' : 'Không'}</Descriptions.Item>
                </Descriptions>
              </Card>
            )
          },
          {
            key: 'family',
            label: 'Gia đình',
            children: (
              <Card>
                {family ? (
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Nghề bố">{decodeOccupation(family.father_occupation_code)}</Descriptions.Item>
                    <Descriptions.Item label="Nghề mẹ">{decodeOccupation(family.mother_occupation_code)}</Descriptions.Item>
                    <Descriptions.Item label="Tuổi bố">{family.father_age ?? '--'}</Descriptions.Item>
                    <Descriptions.Item label="Tuổi mẹ">{family.mother_age ?? '--'}</Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="Chưa có dữ liệu gia đình" />
                )}
              </Card>
            )
          },
          {
            key: 'academic',
            label: 'Học tập',
            children: (
              <Card>
                {academic?.length ? (
                  <Table
                    size="small"
                    rowKey={(r, idx) => r.academic_result_id || r.id || `${idx}`}
                    columns={academicColumns}
                    dataSource={academic}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 900 }}
                  />
                ) : (
                  <Empty description="Chưa có dữ liệu học tập" />
                )}
              </Card>
            )
          },
          {
            key: 'behavior',
            label: 'Hành vi',
            children: (
              <Card>
                {behavior?.length ? (
                  <Table
                    size="small"
                    rowKey={(r, idx) => r.behavior_id || r.id || `${idx}`}
                    columns={behaviorColumns}
                    dataSource={behavior}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 900 }}
                  />
                ) : (
                  <Empty description="Chưa có dữ liệu hành vi" />
                )}
              </Card>
            )
          },
          {
            key: 'prediction',
            label: 'Dự báo & Tư vấn',
            children: (
              <Card>
                {!prediction ? (
                  <Typography.Text type="secondary">
                    Chưa có dự báo. Hãy train model và chạy Predict All.
                  </Typography.Text>
                ) : (
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      📊 Kết quả dự báo
                    </Typography.Title>
                    <Descriptions bordered size="small" column={2}>
                      <Descriptions.Item label="Xác suất bỏ học">{((prediction?.prob_dropout ?? 0) * 100).toFixed(1)}%</Descriptions.Item>
                      <Descriptions.Item label="Mức rủi ro">
                        {prediction?.prob_dropout === null || prediction?.prob_dropout === undefined ? (
                          '--'
                        ) : prediction.prob_dropout >= 0.7 ? (
                          <Tag color="red">Cao</Tag>
                        ) : prediction.prob_dropout >= 0.4 ? (
                          <Tag color="orange">Trung bình</Tag>
                        ) : (
                          <Tag color="green">Thấp</Tag>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Dự báo (nhị phân)">{prediction?.pred_label ?? prediction?.predicted_label ?? '--'}</Descriptions.Item>
                      <Descriptions.Item label="Model">{prediction?.model_version ?? prediction?.model_name ?? '--'}</Descriptions.Item>
                    </Descriptions>

                    <Typography.Title level={5} style={{ margin: 0 }}>
                      🔍 Nguyên nhân gốc rễ (Top features)
                    </Typography.Title>
                    {topFactors.length ? (
                      <Table
                        size="small"
                        rowKey={(r, idx) => `${r.name}-${idx}`}
                        pagination={false}
                        columns={[
                          { title: 'Yếu tố', dataIndex: 'name', key: 'name' },
                          {
                            title: 'Tác động',
                            dataIndex: 'value',
                            key: 'value',
                            width: 160,
                            render: (v) => (v === null || v === undefined ? '--' : Number(v).toFixed(4)),
                          },
                        ]}
                        dataSource={topFactors}
                      />
                    ) : explain ? (
                      <Typography.Text type="secondary">
                        Có dữ liệu giải thích, nhưng chưa chuẩn hoá được định dạng để hiển thị.
                      </Typography.Text>
                    ) : (
                      <Typography.Text type="secondary">Chưa có giải thích SHAP.</Typography.Text>
                    )}
                  </Space>
                )}
              </Card>
            )
          }
        ]}
      />
    </div>
  );
}
