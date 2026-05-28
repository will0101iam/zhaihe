import { Compass, Download, Home, ShieldCheck, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { FengshuiAnalyzeResponse } from '../../shared/fengshui.js';
import { getReportSourceLabel } from '../lib/report-source.js';
import { downloadDataUrl, generateShareCardImage, OFFICIAL_SHARE_URL } from '../lib/share-card.js';

type ReportViewProps = {
  report: FengshuiAnalyzeResponse;
  notice?: string;
};

export default function ReportView({ report, notice }: ReportViewProps) {
  const [isGeneratingShareCard, setIsGeneratingShareCard] = useState(false);
  const reportSourceLabel = getReportSourceLabel(report.meta?.source);
  const fallbackNotice =
    report.meta?.fallbackFrom === 'deepseek' && report.meta.fallbackReason
      ? `DeepSeek 当前不可用，已自动切换：${report.meta.fallbackReason}`
      : undefined;

  async function handleDownloadShareCard() {
    setIsGeneratingShareCard(true);

    try {
      const dataUrl = await generateShareCardImage(report, OFFICIAL_SHARE_URL);
      downloadDataUrl(dataUrl, '宅合分享图.png');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '分享图生成失败，请稍后重试。');
    } finally {
      setIsGeneratingShareCard(false);
    }
  }

  return (
    <section className="report-shell" aria-label="宅合分析报告">
      {notice ? <div className="notice">{notice}</div> : null}
      <div className="score-card">
        <div>
          <span className="eyebrow">宅合指数</span>
          <h2>{report.level}</h2>
          <p>{report.summary}</p>
          <small className="report-source">本次模型渠道：{reportSourceLabel}</small>
          {fallbackNotice ? <small className="report-source report-fallback">{fallbackNotice}</small> : null}
        </div>
        <div className="score-orb">
          <strong>{report.score}</strong>
          <span>/100</span>
        </div>
      </div>

      <button className="share-card-button" type="button" onClick={handleDownloadShareCard} disabled={isGeneratingShareCard}>
        <span className="share-card-copy">
          <strong>{isGeneratingShareCard ? '正在生成分享图...' : '生成朋友圈分享图'}</strong>
          <small>带二维码，适合发给家人朋友一起看“同房不同命”</small>
        </span>
        <span className="share-card-icon" aria-hidden="true">
          <Download size={20} />
        </span>
      </button>

      <div className="split-list">
        <InfoBlock icon={<Sparkles size={18} />} title="主要加分" items={report.strengths} />
        <InfoBlock icon={<ShieldCheck size={18} />} title="需要关注" items={report.concerns} />
      </div>

      <div className="section-card">
        <div className="section-title">
          <Compass size={18} />
          <h3>改善建议</h3>
        </div>
        {report.suggestions.map((suggestion) => (
          <article className="suggestion" key={suggestion.title}>
            <strong>{suggestion.title}</strong>
            <p>{suggestion.reason}</p>
            <span>{suggestion.action}</span>
          </article>
        ))}
      </div>

      <div className="confidence-card">
        <Home size={18} />
        <div>
          <strong>置信度：{report.confidence.level}</strong>
          <p>建议补充：{report.confidence.missingInfo.join('、')}</p>
          <small>{report.disclaimer}</small>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <article className="section-card compact">
      <div className="section-title">
        {icon}
        <h3>{title}</h3>
      </div>
      <ul className="report-bullet-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
