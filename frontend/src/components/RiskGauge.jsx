import React from 'react';
import { Progress, Tooltip } from 'antd';

function colorByRisk(pct) {
  if (pct >= 70) return '#ff4d4f';
  if (pct >= 40) return '#faad14';
  return '#52c41a';
}

export default function RiskGauge({ probDropout }) {
  if (probDropout === null || probDropout === undefined) {
    return (
      <Tooltip title="Chưa có dự báo. Hãy train model và chạy Predict All.">
        <span>--</span>
      </Tooltip>
    );
  }
  const pct = Math.round(Number(probDropout) * 100);
  return (
    <Tooltip title={`P(Dropout) = ${pct}%`}>
      <Progress
        percent={pct}
        size="small"
        showInfo
        strokeColor={colorByRisk(pct)}
      />
    </Tooltip>
  );
}
