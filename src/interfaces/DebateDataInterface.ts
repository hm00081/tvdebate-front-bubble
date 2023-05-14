import { SentenceIndexLexicalChainsDict } from "../classes/LCseg/LCseg";

export interface UtteranceObject {
  name: string;
  utterance: string;
  evaluateAgainst: string; // -1: 반대, 0: 중립:, 1: 찬성
  findDisagreeScale: number; // 추후 이름 변경
  topicStartPoint?: boolean;
  topicEndPoint?: boolean;
  sentenceObjects: SentenceObject[];
}

export interface SentenceObject {
  sentence: string;
  sentiment: number;
  singleTermCountDict: TermCountDict;
  compoundTermCountDict: TermCountDict;
  allTermCountDict?: CategoryTermCountDict;
  time?: string;
}

export interface CategoryTermCountDict {
  [category: string]: TermCountDict;
}

export interface CategoryTermCount {
  category: string;
  count: number;
}

export interface TermCountDict {
  [term: string]: number;
}

export interface KeytermObject {
  name: string;
  frequency: number;
  index: number;
}

export interface StopwordDict {
  [stopword: string]: boolean;
}

export interface DebateDataSet {
  utteranceObjects: UtteranceObject[];
  conceptMatrixTransposed: number[][];
  similarityMatrix: number[][];
  termUtteranceBooleanMatrixTransposed: number[][];
  termList: string[];
  keytermObjects: KeytermObject[];
  stopwordDict: StopwordDict;
  frequencyVector: number[];
}

export interface EvaluationDataSet {
  sentenceIndexLexicalChainsDict: SentenceIndexLexicalChainsDict;
  sentenceIndexesForSegmentsOfPeople: number[];
}

export interface DataReqBody {
  debateName: string;
}
