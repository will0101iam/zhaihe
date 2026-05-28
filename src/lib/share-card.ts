import QRCode from 'qrcode';
import type { FengshuiAnalyzeResponse } from '../../shared/fengshui.js';

export type ShareCardPayload = {
  score: number;
  level: string;
  summary: string;
  strengths: string[];
  concerns: string[];
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

export function buildShareCardPayload(report: FengshuiAnalyzeResponse, shareUrl: string): ShareCardPayload {
  return {
    score: report.score,
    level: report.level,
    summary: truncateText(report.summary, 65),
    strengths: report.strengths.slice(0, 2),
    concerns: report.concerns.slice(0, 2),
    shareUrl,
  };
}

export async function generateShareCardImage(report: FengshuiAnalyzeResponse, shareUrl: string): Promise<string> {
  const payload = buildShareCardPayload(report, shareUrl);
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
  drawHeader(context);
  drawHero(context, payload);
  drawInsightCard(context, '主要加分', payload.strengths, 560, SEAL, 'PLUS');
  drawInsightCard(context, '需要关注', payload.concerns, 805, INK, 'WATCH');
  drawFooter(context, payload.shareUrl, qrImage);
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

function drawHeader(context: CanvasRenderingContext2D) {
  context.fillStyle = SEAL;
  context.font = '700 34px "Songti SC", "Noto Serif SC", serif';
  context.fillText('宅合 ZhaiHe', CARD_PADDING, 105);

  context.fillStyle = MUTED;
  context.font = '26px "PingFang SC", sans-serif';
  context.fillText('买房前，先看这套房和你合不合', CARD_PADDING, 150);
}

function drawHero(context: CanvasRenderingContext2D, payload: ShareCardPayload) {
  roundRect(context, CARD_PADDING, 195, CARD_WIDTH - CARD_PADDING * 2, 300, 38);
  context.fillStyle = INK;
  context.fill();

  context.fillStyle = GOLD;
  context.font = '700 28px "PingFang SC", sans-serif';
  context.fillText('同房不同命', CARD_PADDING + 36, 257);

  context.fillStyle = PAPER;
  context.font = '700 62px "Songti SC", "Noto Serif SC", serif';
  context.fillText(payload.level, CARD_PADDING + 36, 334);

  context.fillStyle = 'rgba(248, 240, 227, 0.74)';
  context.font = '26px "PingFang SC", sans-serif';
  drawWrappedText(context, payload.summary, CARD_PADDING + 36, 390, 500, 38, 2);

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

function drawFooter(context: CanvasRenderingContext2D, shareUrl: string, qrImage: HTMLImageElement) {
  const qrSize = 178;
  roundRect(context, CARD_PADDING, 1065, CARD_WIDTH - CARD_PADDING * 2, 205, 30);
  context.fillStyle = 'rgba(255, 255, 255, 0.78)';
  context.fill();

  context.drawImage(qrImage, CARD_WIDTH - CARD_PADDING - qrSize - 28, 1092, qrSize, qrSize);

  context.fillStyle = INK;
  context.font = '700 32px "Songti SC", "Noto Serif SC", serif';
  context.fillText('扫码测测你的宅合指数', CARD_PADDING + 30, 1125);

  context.fillStyle = MUTED;
  context.font = '24px "PingFang SC", sans-serif';
  drawWrappedText(context, '同一套房，不同人住，结果可能完全不一样。', CARD_PADDING + 30, 1172, 430, 36, 2);

  context.fillStyle = 'rgba(16, 37, 34, 0.46)';
  context.font = '20px "PingFang SC", sans-serif';
  context.fillText(shortenUrl(shareUrl), CARD_PADDING + 30, 1252);
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
