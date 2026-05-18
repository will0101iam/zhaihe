import { useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, Camera, Compass, Loader2, MapPinned, ScrollText } from 'lucide-react';
import OptionChips from '@/components/OptionChips';
import ReportView from '@/components/ReportView';
import { analyzeFengshui } from '@/lib/analyze-api';
import { createInitialForm, toAnalyzeRequest, type FengshuiFormState } from '@/lib/fengshui-form';
import type { FengshuiAnalyzeResponse } from '../../shared/fengshui.js';

const orientations = ['东', '南', '西', '北', '东南', '东北', '西南', '西北'] as const;
const riverOptions = ['有河流', '有湖泊', '无明显水体'] as const;
const industries = ['住宅为主', '商业/写字楼', '互联网/科技', '金融办公', '教育/学校', '医疗/医院', '工厂/制造', '物流仓储', '文旅/公园'] as const;
const stages = ['识宅', '观局', '合人', '出策'];

export default function Home() {
  const [form, setForm] = useState<FengshuiFormState>(() => createInitialForm());
  const [report, setReport] = useState<FengshuiAnalyzeResponse | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const orientationNote = form.orientationNote ?? '';
  const riverNote = form.riverNote ?? '';
  const industryNote = form.industryNote ?? '';
  const fiveElementsInfo = form.fiveElementsInfo ?? '';
  const workIndustry = form.workIndustry ?? '';

  const completedCount = useMemo(() => {
    return [
      form.communityName,
      form.location,
      form.orientation,
      orientationNote,
      form.floor || form.totalFloors,
      form.nearbyRiver,
      riverNote,
      form.dominantIndustry,
      industryNote,
      form.nearbyCompanies,
      form.personName,
      form.birthPlace,
      fiveElementsInfo,
      form.floorPlanNotes || form.floorPlanImage,
    ].filter(Boolean).length;
  }, [form, fiveElementsInfo, industryNote, orientationNote, riverNote]);

  function updateForm(patch: Partial<FengshuiFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function handleImage(file?: File) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateForm({ floorPlanImage: String(reader.result) });
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsAnalyzing(true);

    try {
      const result = await analyzeFengshui(toAnalyzeRequest(form));
      setReport(result.report);
      setNotice(result.notice ?? '');
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '分析失败，请稍后重试。');
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="compass-mark" aria-hidden="true">
          <Compass size={72} />
        </div>
        <p className="seal">宅合 ZhaiHe</p>
        <h1>看房前，先看这套宅与你合不合。</h1>
        <p className="hero-copy">
          结合小区所在地、外局水体、周边产业、公司环境、姓名出生地与五行信息，生成一份大师直断的人宅匹配报告。
        </p>
        <a className="hero-action" href="#assess">
          开始合宅
          <ArrowDown size={16} />
        </a>
      </section>

      <section className="principles" aria-label="产品说明">
        <article>
          <span>看址</span>
          <p>省市区、小区名字、水体、产业和公司都纳入外局判断。</p>
        </article>
        <article>
          <span>合人</span>
          <p>姓名、出生地、五行信息和工作行业一起看。</p>
        </article>
        <article>
          <span>避坑</span>
          <p>把传统说法翻译成现实居住提醒。</p>
        </article>
      </section>

      <form className="assess-card" id="assess" onSubmit={handleSubmit}>
        <div className="card-heading">
          <span className="eyebrow">一炷茶时间</span>
          <h2>填写看房信息</h2>
          <p>已完成 {completedCount}/13 项，信息越完整，报告越稳。</p>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="communityName">小区/楼盘名字</label>
          <input
            id="communityName"
            placeholder="例如：江南里、滨江壹号院"
            required
            value={form.communityName}
            onChange={(event) => updateForm({ communityName: event.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="location">小区所在省市区</label>
          <input
            id="location"
            placeholder="例如：广东省深圳市南山区"
            required
            value={form.location}
            onChange={(event) => updateForm({ location: event.target.value })}
          />
        </div>

        <label className="upload-box">
          <input accept="image/*" type="file" onChange={(event) => handleImage(event.target.files?.[0])} />
          {form.floorPlanImage ? (
            <img alt="户型图预览" src={form.floorPlanImage} />
          ) : (
            <span>
              <Camera size={24} />
              上传户型图，可跳过
            </span>
          )}
        </label>

        <div className="field-group">
          <label className="field-label" htmlFor="floorPlanNotes">户型补充</label>
          <textarea
            id="floorPlanNotes"
            placeholder="例如：南向阳台，入户见客厅，厨房在西北，卫生间在东侧"
            value={form.floorPlanNotes}
            onChange={(event) => updateForm({ floorPlanNotes: event.target.value })}
          />
        </div>

        <OptionChips label="房屋朝向" options={[...orientations]} value={form.orientation} onChange={(value) => updateForm({ orientation: value as FengshuiFormState['orientation'] })} />

        <div className="field-group">
          <label className="field-label" htmlFor="orientationNote">朝向补充备注</label>
          <input
            id="orientationNote"
            placeholder="例如：不确定朝向 / 中介说是东南 / 手机罗盘测过"
            value={orientationNote}
            onChange={(event) => updateForm({ orientationNote: event.target.value })}
          />
        </div>

        <div className="inline-fields">
          <label>
            <span>所在楼层</span>
            <input inputMode="numeric" placeholder="12" value={form.floor} onChange={(event) => updateForm({ floor: event.target.value })} />
          </label>
          <label>
            <span>总楼层</span>
            <input inputMode="numeric" placeholder="28" value={form.totalFloors} onChange={(event) => updateForm({ totalFloors: event.target.value })} />
          </label>
        </div>

        <OptionChips
          label="附近有没有河流"
          options={[...riverOptions]}
          value={form.nearbyRiver}
          onChange={(value) => updateForm({ nearbyRiver: value as FengshuiFormState['nearbyRiver'] })}
        />

        <div className="field-group">
          <label className="field-label" htmlFor="riverNote">水体补充备注</label>
          <input
            id="riverNote"
            placeholder="例如：不确定有没有河 / 东侧300米有河 / 南边有人工湖"
            value={riverNote}
            onChange={(event) => updateForm({ riverNote: event.target.value })}
          />
        </div>

        <OptionChips
          label="旁边产业以什么为主"
          options={[...industries]}
          value={form.dominantIndustry}
          onChange={(value) => updateForm({ dominantIndustry: value as string })}
        />

        <div className="field-group">
          <label className="field-label" htmlFor="industryNote">产业补充备注</label>
          <input
            id="industryNote"
            placeholder="例如：不确定产业类型 / 附近很多办公楼 / 楼下偏餐饮商业"
            value={industryNote}
            onChange={(event) => updateForm({ industryNote: event.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="nearbyCompanies">附近有哪些公司</label>
          <input
            id="nearbyCompanies"
            placeholder="例如：字节跳动、阿里云、某某产业园"
            required
            value={form.nearbyCompanies}
            onChange={(event) => updateForm({ nearbyCompanies: event.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="personName">你的名字</label>
          <input
            id="personName"
            placeholder="例如：张三"
            required
            value={form.personName}
            onChange={(event) => updateForm({ personName: event.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="birth">出生年份或生肖，选填</label>
          <input id="birth" placeholder="例如：1990 / 马 / 不填也可以" value={form.birthYearOrZodiac} onChange={(event) => updateForm({ birthYearOrZodiac: event.target.value })} />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="birthPlace">出生在哪里</label>
          <input
            id="birthPlace"
            placeholder="例如：浙江杭州 / 四川成都"
            required
            value={form.birthPlace}
            onChange={(event) => updateForm({ birthPlace: event.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="fiveElementsInfo">五行信息</label>
          <input
            id="fiveElementsInfo"
            placeholder="例如：不知道 / 朋友说我喜木火 / 八字软件说水旺土弱"
            required
            value={fiveElementsInfo}
            onChange={(event) => updateForm({ fiveElementsInfo: event.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="workIndustry">工作行业</label>
          <input id="workIndustry" placeholder="例如：互联网 / 金融 / 教育 / 医疗 / 自由职业" value={workIndustry} onChange={(event) => updateForm({ workIndustry: event.target.value })} />
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        <button
          className="submit-button"
          disabled={
            isAnalyzing ||
            !form.communityName ||
            !form.location ||
            !form.dominantIndustry ||
            !form.nearbyCompanies ||
            !form.personName ||
            !form.birthPlace ||
            !fiveElementsInfo
          }
          type="submit"
        >
          {isAnalyzing ? <Loader2 className="spin" size={18} /> : <ScrollText size={18} />}
          {isAnalyzing ? '正在合宅...' : '生成宅合报告'}
        </button>
      </form>

      {isAnalyzing ? (
        <section className="reading-panel">
          <div className="reading-compass">
            <Compass size={48} />
          </div>
          <div className="stage-row">
            {stages.map((stage) => (
              <span key={stage}>{stage}</span>
            ))}
          </div>
          <p>正在把传统风水语言转译成居住建议，请稍候。</p>
        </section>
      ) : null}

      <div ref={reportRef}>{report ? <ReportView notice={notice} report={report} /> : null}</div>

      <footer className="site-footer">
        <MapPinned size={16} />
        <span>结果仅供传统文化与居住决策参考。真正买房仍需结合验房、预算、通勤和家庭决策。</span>
      </footer>
    </main>
  );
}
