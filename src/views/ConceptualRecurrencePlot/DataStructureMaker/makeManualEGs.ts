import _ from "lodash";
import { SimilarityBlock } from "../interfaces";
import { make1EngagementGroup as make1TopicGroup } from "./make1EngagementGroup";

export function makeManualTGs(
  totalSimilarityBlockGroup: SimilarityBlock[][],
  startRowIndexesForSplit: number[]
): SimilarityBlock[][][] {
  const manualTGs: SimilarityBlock[][][] = [];

  for (let i = 0; i < startRowIndexesForSplit.length; i++) {
    const startRowIndex = startRowIndexesForSplit[i];
    const endRowIndex =
      i < startRowIndexesForSplit.length - 1
        ? startRowIndexesForSplit[i + 1]
        : totalSimilarityBlockGroup.length;
    const topicGroup = make1TopicGroup(
      totalSimilarityBlockGroup,
      startRowIndex,
      endRowIndex
    );
    manualTGs.push(topicGroup);
  }

  return manualTGs;
}

export function makeManualMTGs(
  totalSimilarityBlockGroup: SimilarityBlock[][],
  startRowIndexesForSplit: number[]
): SimilarityBlock[][][] {
  const manualTGs: SimilarityBlock[][][] = [];

  for (let i = 0; i < startRowIndexesForSplit.length; i++) {
    const startRowIndex = startRowIndexesForSplit[i];
    const endRowIndex =
      i < startRowIndexesForSplit.length - 1
        ? startRowIndexesForSplit[i + 1]
        : totalSimilarityBlockGroup.length;
    const topicGroup = make1TopicGroup(
      totalSimilarityBlockGroup,
      startRowIndex,
      endRowIndex
    );
    manualTGs.push(topicGroup);
  }

  return manualTGs;
}

// export function getBasicIncomeManualSmallEGTitles(): string[] {
//   return [
//     "찬반 of '긴급재난지원금 경제적 효과'",
//     "기본소득 정의 및 평가",
//     "보수진영에서 기본소득이 이슈화된 이유는?",
//     "안심소득 소개 및 이해과정",
//     "찬반(증세 및 조세저항) of '안심소득 vs 기본소득'",
//     "찬반(증세,경제 효과) of '안심소득 vs 기본소득' in '이재명 vs 오세훈'",
//     "현실적 방안인지 찬반 of '안심소득 vs 기본소득'",
//     "기본소득, 안심소득의 '기존 복지 제도 통합'에 대해 서로들 오해하고 있음 => 서로 의견 주고 받음..",
//     "시청자 의견 소개",
//     "기본소득의 실현가능성 찬반",
//     "'미래의 노동공급과 생존'에 대한 서로 다른 복지정책의 접근",
//     "기본소득의 근로의욕 반대 의견 및 팩트체크",
//   ];
// }

export function getFullScriptEGTitles(): string[] {
  return ["전체 토론 스크립트"];
}

export function getBasicIncomeManualMiddleEGTitles(): string[] {
  return [
    // "찬반 of '긴급재난지원금 경제적 효과'",
    // "기본소득 정의 및 평가",
    // "안심소득 소개 및 이해과정",
    "안심소득 vs 기본소득의 찬반(증세, 조세저항, 경제 효과)대립",
    // "안심소득 vs 기본소득의 현실적 방안",
    "기본소득, 안심소득의 '기존 복지 제도 통합'에 대한 의견 대립",
    // "시청자 의견 소개",
    // "기본소득 실현가능방법 '증세'의 찬반",
    // "기본소득의 노동공급, 근로의욕에 대한 긍정 vs 부정",
  ];
}

export function getBasicIncomeManualBigEGTitles(): string[] {
  return [
    "찬반 of '긴급재난지원금 경제적 효과'",
    "기본소득 정의 및 평가",
    "안심소득 소개 및 이해과정",
    "안심소득 vs 기본소득",
    "기본소득 실현가능방법 '증세'의 찬반",
    "기본소득의 노동공급, 근로의욕에 대한 긍정 vs 부정",
  ];
}

export function getInsistenceRefutationEGTitles(): string[] {
  return [
    "주장반박구긴1",
    "주장반박구긴2",
    "주장반박구긴3",
    "주장반박구긴4",
    "주장반박구간5",
    "주장반박구긴6",
  ];
} // 주장과 반박 구간 나눠주는 요소도 추가해야 쉽게 보일듯함.

export function getSatManualSmallEGTitles(): string[] {
  return [];
}

export function getSatManualMiddleEGTitles(): string[] {
  return [];
}

export function getSatManualBigEGTitles(): string[] {
  return [
    "정시확대 방침에 대한 참가자들의 의견소개",
    "전교조의 수시에 대한 입장(학생부교과전형) 및 (부정적)반응",
    "학생부종합전형 보완 vs 수능 정시 확대",
    "선생님들의 학종에 관한 역량 필요성 찬반",
    "사교육 문제에 대한 정시 vs 학종",
    "학생들의 혼란을 줄여줘야 하지 않겠느냐에 대한 의견",
    "모든 고등학교를 일반고 전환에 대한 의견",
    "이번 대입개편안에 대한 필수요소에 대해 각자의 의견",
  ];
}

export function getMilitaryManualSmallEGTitles(): string[] {
  return [];
}

export function getMilitaryManualMiddleEGTitles(): string[] {
  return [];
}

export function getMilitaryManualBigEGTitles(): string[] {
  return [
    "토론 시작",
    "모병제는 정치적 선거용?",
    "인구절벽과 군인 수 문제",
    "군인 수에 대한 문제",
    "모병제로 인한 신분제 부활",
    "모병제로 인한 질적 향상",
    "군 간부 인력 확충 ",
    "여성 징집과 모병",
    "군대 계급별 예산 이슈",
    "군문화 개선안 마무리 발언",
  ];
}

/**
 * Deprecated
 * @param conceptSimilarityMatrix
 * @param startUtteranceIndex
 * @param endUtteranceIndex
 */
export function make1EngagementGroupByUtteranceIndex(
  conceptSimilarityMatrix: SimilarityBlock[][],
  startUtteranceIndex: number,
  endUtteranceIndex: number
): SimilarityBlock[][] {
  return _.chain(conceptSimilarityMatrix)
    .slice(startUtteranceIndex, endUtteranceIndex - 1)
    .map((similarityBlocksIn1Row) => {
      return _.slice(
        similarityBlocksIn1Row,
        startUtteranceIndex,
        similarityBlocksIn1Row.length
      );
    })
    .value();
}
