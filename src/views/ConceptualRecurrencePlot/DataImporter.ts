import * as math from "mathjs";
import { SentenceIndexLexicalChainsDict } from "../../classes/LCseg/LCseg";
import {
  DebateDataSet,
  EvaluationDataSet,
  KeytermObject,
  StopwordDict,
  UtteranceObject,
} from "../../interfaces/DebateDataInterface";
export type TermType = "single_term" | "compound_term";
export type DebateName =
  | "sample"
  | "기본소득"
  | "정시확대"
  | "모병제"
  | "기본소득clipped"
  | "정시확대clipped"
  | "모병제clipped"
  | "집값"
  | "정년연장";

/* eslint-disable no-unused-vars */
export default class DataImporter {
  private _debateDataset: DebateDataSet | null = null;
  private _evaluationDataSet: EvaluationDataSet | null = null;

  public constructor(debateName: DebateName, termType: TermType) {
    if (
      debateName === "sample" ||
      debateName === "기본소득" ||
      debateName === "정시확대" ||
      debateName === "모병제" ||
      debateName === "기본소득clipped" ||
      debateName === "정시확대clipped" ||
      debateName === "모병제clipped"
    ) {
      const utteranceObjects: UtteranceObject[] = require(`../../data/${debateName}/utterance_objects.json`);
      const stopwordDict: StopwordDict = require(`../../data/${debateName}/stopword_dict.json`);
      const conceptMatrix: number[][] = require(`../../data/${debateName}/${termType}/concept_matrix.json`);
      const conceptMatrixTransposed = math.transpose(conceptMatrix);
      const keytermObjects: KeytermObject[] = require(`../../data/${debateName}/${termType}/keyterm_objects.json`);
      const similarityMatrix: number[][] = require(`../../data/${debateName}/${termType}/similarity_matrix.json`);
      const termList: string[] = require(`../../data/${debateName}/${termType}/term_list.json`);
      const termUtteranceBooleanMatrix: number[][] = require(`../../data/${debateName}/${termType}/term_utterance_boolean_matrix.json`);
      const termUtteranceBooleanMatrixTransposed = math.transpose(
        termUtteranceBooleanMatrix
      );
      const frequencyVector: number[] = require(`../../data/${debateName}/${termType}/frequency_vector.json`);
      const sentenceIndexLexicalChainsDict: SentenceIndexLexicalChainsDict = require(`../../data/${debateName}/${termType}/sentenceindex_lexicalchains_dict.json`);
      // TODO we can change individual result.
      // const sentenceIndexesForSegmentsOfPeople: number[] = require(`../../data/${debateName}/evaluation_results/merged_by_utterance_base.json`);
      // const sentenceIndexesForSegmentsOfPeople: number[] = require(`../../data/${debateName}/evaluation_results/merged_by_sentence_base.json`);
      const sentenceIndexesForSegmentsOfPeople: number[] = require(`../../data/${debateName}/evaluation_results/merged_by_close_sentence.json`);
      // const sentenceIndexesForSegmentsOfPeople: number[] = require(`../../data/${debateName}/evaluation_results/junwoo.json`);

      this._debateDataset = {
        conceptMatrixTransposed,
        keytermObjects,
        similarityMatrix,
        stopwordDict,
        termList,
        termUtteranceBooleanMatrixTransposed,
        utteranceObjects,
        frequencyVector,
      };

      this._evaluationDataSet = {
        sentenceIndexLexicalChainsDict,
        sentenceIndexesForSegmentsOfPeople,
      };
    }
  }

  public get debateDataSet() {
    return this._debateDataset;
  }

  public get evaluationDataSet() {
    return this._evaluationDataSet;
  }
}
