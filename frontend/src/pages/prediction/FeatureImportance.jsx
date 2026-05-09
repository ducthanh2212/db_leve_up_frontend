import React from 'react';
import { Card, Typography } from 'antd';

import PageHeader from '../../components/PageHeader.jsx';

export default function FeatureImportance() {
  return (
    <div>
      <PageHeader title="📊 Feature Importance" items={[{ label: 'Dự báo' }, { label: 'Phân tích' }]} />
      <Card>
        <Typography.Text type="secondary">
          Backend hiện chưa expose feature importance global (2.10). Bạn có thể dùng SHAP per-student ở màn Hồ sơ.
        </Typography.Text>
      </Card>
    </div>
  );
}
