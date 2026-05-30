import QRCode from 'qrcode';
import type { FengshuiAnalyzeResponse } from '../../shared/fengshui.js';
import { deriveViralReport, type ShareTemplateId } from './report-viral.js';

export type ShareCardPayload = {
  template: ShareTemplateId;
  score: number;
  shareTitle: string;
  relationshipTag: string;
  relationshipType: string;
  relationshipSubtitle: string;
  elementRelation: string;
  livingAdvice: string;
  riskHint: string;
  oneLineVerdict: string;
  shareHook: string;
  highlights: string[];
  watchouts: string[];
  shareUrl: string;
};

export const OFFICIAL_SHARE_URL = 'https://zhaihe.top';

const CARD_WIDTH = 900;
const CARD_HEIGHT = 1360;
const CARD_PADDING = 64;
const INK = '#102522';
const PAPER = '#f8f0e3';
const SEAL = '#be4a2f';
const GOLD = '#c59a52';
const MUTED = 'rgba(16, 37, 34, 0.68)';
const LIGHT_CARD = 'rgba(255, 255, 255, 0.72)';

export function buildShareCardPayload(
  report: FengshuiAnalyzeResponse,
  shareUrl: string,
  template: ShareTemplateId = 'story',
): ShareCardPayload {
  const viral = deriveViralReport(report);

  return {
    template,
    score: report.score,
    shareTitle: '你和这个房子的关系',
    relationshipTag: viral.relationshipTag,
    relationshipType: viral.relationshipType,
    relationshipSubtitle: viral.relationshipSubtitle,
    elementRelation: viral.elementRelation,
    livingAdvice: truncateText(viral.livingAdvice, 28),
    riskHint: truncateText(viral.riskHint, 28),
    oneLineVerdict: truncateText(viral.oneLineVerdict, 65),
    shareHook: viral.shareHook,
    highlights: report.strengths.slice(0, 2),
    watchouts: report.concerns.slice(0, 2),
    shareUrl,
  };
}

export async function generateShareCardImage(
  report: FengshuiAnalyzeResponse,
  shareUrl: string,
  template: ShareTemplateId = 'story',
): Promise<string> {
  const payload = buildShareCardPayload(report, shareUrl, template);
  const qrDataUrl = await QRCode.toDataURL(payload.shareUrl, {
    margin: 1,
    width: 240,
    color: {
      dark: INK,
      light: '#fff7ea',
    },
  });

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('当前浏览器不支持生成分享图。');
  }

  drawShareCard(context, payload, await loadImage(qrDataUrl));
  return canvas.toDataURL('image/png');
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function drawShareCard(context: CanvasRenderingContext2D, payload: ShareCardPayload, qrImage: HTMLImageElement) {
  drawBackground(context);
  drawHeader(context, payload);

  if (payload.template === 'rednote') {
    drawRednoteHero(context, payload);
    drawChecklistPanel(context, payload, 560);
    drawQuotePanel(context, payload.relationshipSubtitle, payload.shareHook, 880, SEAL);
  } else if (payload.template === 'story') {
    drawStoryHero(context, payload);
    drawInsightCard(context, '主要加分', payload.highlights, 520, SEAL, 'PLUS');
    drawInsightCard(context, '需要关注', payload.watchouts, 770, INK, 'WATCH');
  } else {
    drawWechatHero(context, payload);
    drawChecklistPanel(context, payload, 560);
    drawQuotePanel(context, '一句话判断', payload.oneLineVerdict, 880, INK);
  }

  drawFooter(context, payload, qrImage);
}

function drawBackground(context: CanvasRenderingContext2D) {
  context.fillStyle = PAPER;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const gradient = context.createRadialGradient(740, 80, 20, 740, 80, 460);
  gradient.addColorStop(0, 'rgba(197, 154, 82, 0.28)');
  gradient.addColorStop(1, 'rgba(197, 154, 82, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.strokeStyle = 'rgba(16, 37, 34, 0.12)';
  context.lineWidth = 2;
  roundRect(context, 34, 34, CARD_WIDTH - 68, CARD_HEIGHT - 68, 36);
  context.stroke();

  context.fillStyle = 'rgba(190, 74, 47, 0.06)';
  circle(context, 790, 180, 150);
  context.fill();
}

function drawHeader(context: CanvasRenderingContext2D, payload: ShareCardPayload) {
  context.fillStyle = SEAL;
  context.font = '700 34px "Songti SC", "Noto Serif SC", serif';
  context.fillText('宅合 ZhaiHe', CARD_PADDING, 105);

  context.fillStyle = MUTED;
  context.font = '26px "PingFang SC", sans-serif';
  const subtitle =
    payload.template === 'rednote'
      ? '适合发小红书的关系结果卡'
      : payload.template === 'story'
        ? '适合转给家人朋友一起看的长图版'
        : '买房前，先看这套房和你合不合';
  context.fillText(subtitle, CARD_PADDING, 150);
}

function drawWechatHero(context: CanvasRenderingContext2D, payload: ShareCardPayload) {
  roundRect(context, CARD_PADDING, 195, CARD_WIDTH - CARD_PADDING * 2, 300, 38);
  context.fillStyle = INK;
  context.fill();

  context.fillStyle = GOLD;
  context.font = '700 28px "PingFang SC", sans-serif';
  context.fillText(payload.shareTitle, CARD_PADDING + 36, 257);

  context.fillStyle = PAPER;
  context.font = '700 62px "Songti SC", "Noto Serif SC", serif';
  context.fillText(payload.relationshipTag, CARD_PADDING + 36, 334);

  context.fillStyle = 'rgba(248, 240, 227, 0.74)';
  context.font = '26px "PingFang SC", sans-serif';
  drawWrappedText(context, payload.relationshipType, CARD_PADDING + 36, 390, 500, 38, 1);
  drawWrappedText(context, payload.oneLineVerdict, CARD_PADDING + 36, 430, 500, 38, 2);

  context.strokeStyle = GOLD;
  context.lineWidth = 3;
  circle(context, 720, 342, 78);
  context.stroke();

  context.fillStyle = PAPER;
  context.font = '700 68px "PingFang SC", sans-serif';
  context.textAlign = 'center';
  context.fillText(String(payload.score), 720, 339);
  context.font = '24px "PingFang SC", sans-serif';
  context.fillText('/100', 720, 384);
  context.textAlign = 'left';
}

function drawRednoteHero(context: CanvasRenderingContext2D, payload: ShareCardPayload) {
  roundRect(context, CARD_PADDING, 195, CARD_WIDTH - CARD_PADDING * 2, 320, 42);
  context.fillStyle = 'rgba(255, 255, 255, 0.82)';
  context.fill();

  drawPill(context, 'REDNOTE', CARD_PADDING + 34, 245, SEAL);
  context.fillStyle = INK;
  context.font = '700 62px "Songti SC", "Noto Serif SC", serif';
  context.fillText(payload.relationshipTag, CARD_PADDING + 34, 332);

  context.fillStyle = SEAL;
  context.font = '700 30px "PingFang SC", sans-serif';
  context.fillText(payload.relationshipType, CARD_PADDING + 34, 385);

  context.fillStyle = MUTED;
  context.font = '26px "PingFang SC", sans-serif';
  drawWrappedText(context, payload.oneLineVerdict, CARD_PADDING + 34, 438, 520, 38, 2);

  context.strokeStyle = SEAL;
  context.lineWidth = 3;
  circle(context, 720, 348, 82);
  context.stroke();

  context.fillStyle = INK;
  context.font = '700 70px "PingFang SC", sans-serif';
  context.textAlign = 'center';
  context.fillText(String(payload.score), 720, 346);
  context.font = '24px "PingFang SC", sans-serif';
  context.fillText('/100', 720, 390);
  context.textAlign = 'left';
}

function drawStoryHero(context: CanvasRenderingContext2D, payload: ShareCardPayload) {
  roundRect(context, CARD_PADDING, 195, CARD_WIDTH - CARD_PADDING * 2, 260, 42);
  context.fillStyle = INK;
  context.fill();

  context.fillStyle = GOLD;
  context.font = '700 28px "PingFang SC", sans-serif';
  context.fillText('同房不同命', CARD_PADDING + 36, 252);

  context.fillStyle = PAPER;
  context.font = '700 60px "Songti SC", "Noto Serif SC", serif';
  context.fillText(payload.relationshipTag, CARD_PADDING + 36, 328);

  context.font = '26px "PingFang SC", sans-serif';
  drawWrappedText(context, payload.shareHook, CARD_PADDING + 36, 384, 520, 38, 2);

  context.fillStyle = PAPER;
  context.font = '700 40px "PingFang SC", sans-serif';
  context.textAlign = 'center';
  context.fillText(`${payload.score}/100`, 720, 328);
  context.textAlign = 'left';
}

function drawChecklistPanel(context: CanvasRenderingContext2D, payload: ShareCardPayload, y: number) {
  roundRect(context, CARD_PADDING, y, CARD_WIDTH - CARD_PADDING * 2, 270, 30);
  context.fillStyle = LIGHT_CARD;
  context.fill();

  context.strokeStyle = 'rgba(16, 37, 34, 0.08)';
  context.lineWidth = 2;
  context.stroke();

  const rows: Array<[string, string]> = [
    ['五行关系', payload.elementRelation],
    ['居住建议', payload.livingAdvice],
    ['风险提醒', payload.riskHint],
  ];

  context.fillStyle = INK;
  context.font = '700 34px "Songti SC", "Noto Serif SC", serif';
  context.fillText('结果重点', CARD_PADDING + 30, y + 50);

  let rowY = y + 102;
  for (const [label, value] of rows) {
    context.fillStyle = SEAL;
    context.font = '700 22px "PingFang SC", sans-serif';
    context.fillText(label, CARD_PADDING + 30, rowY);

    context.fillStyle = MUTED;
    context.font = '26px "PingFang SC", sans-serif';
    drawWrappedText(context, value, CARD_PADDING + 150, rowY, CARD_WIDTH - CARD_PADDING * 2 - 190, 34, 1);
    rowY += 62;
  }
}

function drawQuotePanel(context: CanvasRenderingContext2D, title: string, body: string, y: number, accent: string) {
  roundRect(context, CARD_PADDING, y, CARD_WIDTH - CARD_PADDING * 2, 145, 30);
  context.fillStyle = 'rgba(255, 255, 255, 0.78)';
  context.fill();

  context.fillStyle = accent;
  context.font = '700 24px "PingFang SC", sans-serif';
  context.fillText(title, CARD_PADDING + 30, y + 42);

  context.fillStyle = INK;
  context.font = '700 34px "Songti SC", "Noto Serif SC", serif';
  drawWrappedText(context, body, CARD_PADDING + 30, y + 90, CARD_WIDTH - CARD_PADDING * 2 - 60, 40, 2);
}

function drawInsightCard(context: CanvasRenderingContext2D, title: string, items: string[], y: number, accent: string, tag: string) {
  roundRect(context, CARD_PADDING, y, CARD_WIDTH - CARD_PADDING * 2, 205, 30);
  context.fillStyle = LIGHT_CARD;
  context.fill();

  context.strokeStyle = 'rgba(16, 37, 34, 0.08)';
  context.lineWidth = 2;
  context.stroke();

  drawPill(context, tag, CARD_PADDING + 30, y + 38, accent);

  context.fillStyle = INK;
  context.font = '700 34px "Songti SC", "Noto Serif SC", serif';
  context.fillText(title, CARD_PADDING + 130, y + 55);

  const visibleItems = items.length > 0 ? items : ['信息仍需补充，建议重新生成更完整的报告。'];
  let currentY = y + 105;

  for (const [index, item] of visibleItems.entries()) {
    context.fillStyle = accent;
    context.font = '700 24px "PingFang SC", sans-serif';
    context.fillText(`0${index + 1}`, CARD_PADDING + 32, currentY);

    context.fillStyle = MUTED;
    context.font = '26px "PingFang SC", sans-serif';
    currentY = drawWrappedText(context, item, CARD_PADDING + 86, currentY, CARD_WIDTH - CARD_PADDING * 2 - 116, 34, 1) + 38;
  }
}

function drawFooter(context: CanvasRenderingContext2D, payload: ShareCardPayload, qrImage: HTMLImageElement) {
  const qrSize = 178;
  roundRect(context, CARD_PADDING, 1065, CARD_WIDTH - CARD_PADDING * 2, 205, 30);
  context.fillStyle = 'rgba(255, 255, 255, 0.78)';
  context.fill();

  context.drawImage(qrImage, CARD_WIDTH - CARD_PADDING - qrSize - 28, 1092, qrSize, qrSize);

  context.fillStyle = INK;
  context.font = '700 32px "Songti SC", "Noto Serif SC", serif';
  context.fillText('扫码测测你的宅合结果', CARD_PADDING + 30, 1125);

  context.fillStyle = MUTED;
  context.font = '24px "PingFang SC", sans-serif';
  drawWrappedText(context, payload.shareHook, CARD_PADDING + 30, 1172, 430, 36, 2);

  context.fillStyle = 'rgba(16, 37, 34, 0.46)';
  context.font = '20px "PingFang SC", sans-serif';
  context.fillText(shortenUrl(payload.shareUrl), CARD_PADDING + 30, 1252);
}

function drawPill(context: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
  roundRect(context, x, y - 24, 78, 38, 999);
  context.fillStyle = `${color}22`;
  context.fill();

  context.fillStyle = color;
  context.font = '700 18px "PingFang SC", sans-serif';
  context.textAlign = 'center';
  context.fillText(text, x + 39, y + 1);
  context.textAlign = 'left';
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const chars = Array.from(text);
  let line = '';
  let currentY = y;
  let lines = 0;

  for (const char of chars) {
    const testLine = line + char;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines += 1;
      context.fillText(lines === maxLines ? `${line.slice(0, -1)}…` : line, x, currentY);
      if (lines >= maxLines) {
        return currentY;
      }
      line = char;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) {
    context.fillText(line, x, currentY);
  }

  return currentY;
}

function truncateText(text: string, maxLength: number): string {
  const chars = Array.from(text.trim());
  return chars.length > maxLength ? `${chars.slice(0, maxLength - 1).join('')}…` : chars.join('');
}

function shortenUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('二维码生成失败，请稍后重试。'));
    image.src = src;
  });
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function circle(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
}
