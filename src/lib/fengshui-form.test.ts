import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createInitialForm, toAnalyzeRequest, toggleOption, type FengshuiFormState } from './fengshui-form.js';

test('toggleOption adds and removes selected values without duplicates', () => {
  assert.deepEqual(toggleOption(['采光'], '睡眠'), ['采光', '睡眠']);
  assert.deepEqual(toggleOption(['采光', '睡眠'], '采光'), ['睡眠']);
});

test('toAnalyzeRequest converts mobile form strings into API payload', () => {
  const form: FengshuiFormState = {
    ...createInitialForm(),
    communityName: '江南里',
    location: '广东省深圳市南山区',
    orientation: '南',
    orientationNote: '朝向按中介标注，未用罗盘复核',
    floor: '12',
    totalFloors: '28',
    nearbyRiver: '有河流',
    riverNote: '小区东侧约300米有河',
    dominantIndustry: '互联网/科技',
    industryNote: '周边以科技园和办公楼为主',
    nearbyCompanies: '字节跳动、阿里云',
    personName: '张三',
    birthPlace: '浙江杭州',
    fiveElementsInfo: '朋友说我五行偏缺木水，但不确定',
    workIndustry: '互联网产品经理',
    floorPlanNotes: '南向阳台，入户见客厅',
  };

  const payload = toAnalyzeRequest(form);

  assert.equal(payload.house.floor, 12);
  assert.equal(payload.house.totalFloors, 28);
  assert.equal(payload.house.orientation, '南');
  assert.equal(payload.house.orientationNote, '朝向按中介标注，未用罗盘复核');
  assert.equal(payload.house.communityName, '江南里');
  assert.equal(payload.house.location, '广东省深圳市南山区');
  assert.equal(payload.house.nearbyRiver, '有河流');
  assert.equal(payload.house.riverNote, '小区东侧约300米有河');
  assert.equal(payload.house.dominantIndustry, '互联网/科技');
  assert.equal(payload.house.industryNote, '周边以科技园和办公楼为主');
  assert.equal(payload.house.nearbyCompanies, '字节跳动、阿里云');
  assert.equal(payload.resident.personName, '张三');
  assert.equal(payload.resident.birthPlace, '浙江杭州');
  assert.equal(payload.resident.fiveElementsInfo, '朋友说我五行偏缺木水，但不确定');
  assert.equal(payload.resident.workIndustry, '互联网产品经理');
});
