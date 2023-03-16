/* eslint-disable no-unused-vars */
import _ from "lodash";
import {
  makeParticipants,
  Participant,
  ParticipantDict,
} from "../../../common_functions/makeParticipants";
import { DebateDataSet } from "../../../interfaces/DebateDataInterface";
import {
  SimilarityBlock,
  UtteranceIndexSentenceIndexTotalSentenceIndexDict,
  UtteranceObjectForDrawing,
} from "../interfaces";
import {
  makeManualTGs,
  // getBasicIncomeManualSmallEGTitles,
  getFullScriptEGTitles,
  getBasicIncomeManualMiddleEGTitles,
  getBasicIncomeManualBigEGTitles,
  getSatManualBigEGTitles,
  getMilitaryManualBigEGTitles,
} from "./makeManualEGs";
import UtteranceObjectsForDrawingManager from "./UtteranceObjectsForDrawingManager";
import { SimilarityBlockManager } from "./SimilarityBlockManager";
import { DebateName } from "../DataImporter";

export interface DataStructureSet {
  // utteranceObjectsForDrawing: UtteranceObjectForDrawing[];
  utteranceObjectsForDrawingManager: UtteranceObjectsForDrawingManager;
  participants: Participant[];
  participantDict: ParticipantDict;
  // conceptSimilarityBlocks: SimilarityBlock[];
  // conceptSimilarityMatrix: SimilarityBlock[][];
  similarityBlockManager: SimilarityBlockManager;
  maxSimilarityScore: number;
  utteranceIndexSentenceIndexTotalSentenceIndexDict: UtteranceIndexSentenceIndexTotalSentenceIndexDict;
}
export interface DataSetOfManualTGs {
  manualSmallEGs: SimilarityBlock[][][];
  manualMiddleEGs: SimilarityBlock[][][];
  manualFullEGs: SimilarityBlock[][][];
  manualBigEGs: SimilarityBlock[][][];
  manualSmallEGTitles: string[];
  manualMiddleEGTitles: string[];
  manualBigEGTitles: string[];
  manualFullEGTitles: string[];
}
export class DataStructureManager {
  private _dataStructureSet: DataStructureSet;
  private _datasetOfManualEGs: DataSetOfManualTGs;

  constructor(debateName: DebateName, debateDataSet: DebateDataSet) {
    const utteranceObjectsForDrawingManager = new UtteranceObjectsForDrawingManager(
      debateDataSet.utteranceObjects
    );
    const utteranceObjectsForDrawing =
      utteranceObjectsForDrawingManager.utteranceObjectsForDrawing;

    // const utteranceObjectsForDrawing = makeUtteranceObjectsForDrawing(
    //   debateDataSet.utteranceObjects
    // );

    const participants: Participant[] = makeParticipants(
      debateName,
      debateDataSet.utteranceObjects
    );
    const participantDict: ParticipantDict = _.keyBy(
      participants,
      (participant) => participant.name
    );

    const similarityBlockManager = new SimilarityBlockManager(
      debateDataSet.conceptMatrixTransposed,
      utteranceObjectsForDrawing,
      debateDataSet.keytermObjects,
      participantDict
    );
    const conceptSimilarityBlocks: SimilarityBlock[] =
      similarityBlockManager.similarityBlocks;
    const conceptSimilarityMatrix: SimilarityBlock[][] =
      similarityBlockManager.similarityBlockGroup;

    const maxSimilarityScore: number = _.maxBy(
      conceptSimilarityBlocks,
      (conceptSimilarityBlock) => conceptSimilarityBlock.similarity
    )!.similarity;
    // const maxSimilarityScore: number = parseInt(
    //   _.maxBy(
    //     conceptSimilarityBlocks,
    //     (conceptSimilarityBlock) => conceptSimilarityBlock.similarityScore
    //   )?.similarityScore.toFixed(0)!
    // );

    // make utterance_index => sentence_index => total_sentence_index
    const utteranceIndexSentenceIndexTotalSentenceIndexDict: UtteranceIndexSentenceIndexTotalSentenceIndexDict = {};
    let totalSentenceIndex: number = 0;
    _.forEach(
      debateDataSet.utteranceObjects,
      (utteranceObject, utteranceIndex) => {
        utteranceIndexSentenceIndexTotalSentenceIndexDict[utteranceIndex] = {};
        _.forEach(
          utteranceObject.sentenceObjects,
          (sentenceObject, sentenceIndex) => {
            utteranceIndexSentenceIndexTotalSentenceIndexDict[utteranceIndex][
              sentenceIndex
            ] = totalSentenceIndex;
            totalSentenceIndex++;
          }
        );
      }
    );

    // dataset of manual engagement groups
    let manualSmallEGs: SimilarityBlock[][][] = [];
    let manualMiddleEGs: SimilarityBlock[][][] = [];
    let manualBigEGs: SimilarityBlock[][][] = [];
    let manualFullEGs: SimilarityBlock[][][] = [];
    // let manualSmallEGTitles: string[] = [];
    let manualFullEGTitles: string[] = [];
    let manualMiddleEGTitles: string[] = [];
    let manualBigEGTitles: string[] = [];
    if (debateName === "기본소득") {
      manualSmallEGs = makeManualTGs(conceptSimilarityMatrix, [
        0,
        22,
        47,
        52,
        68,
        73,
        79,
        97,
        132,
        134,
        177,
        185,
      ]);
      manualMiddleEGs = makeManualTGs(conceptSimilarityMatrix, [
        // 0,
        // 22,
        // 47,
        69,
        97,
        133,
        // 134,
        //177,
      ]);
      manualBigEGs = makeManualTGs(conceptSimilarityMatrix, [
        0,
        22,
        47,
        69,
        133,
        177,
      ]);
      manualFullEGs = makeManualTGs(conceptSimilarityMatrix, [0, 185]);
      // manualSmallEGTitles = getBasicIncomeManualSmallEGTitles();
      manualFullEGTitles = getFullScriptEGTitles();
      // console.log(manualFullEGs);
      manualMiddleEGTitles = getBasicIncomeManualMiddleEGTitles();
      manualBigEGTitles = getBasicIncomeManualBigEGTitles();
    } else if (debateName === "기본소득clipped") {
      manualSmallEGs = makeManualTGs(conceptSimilarityMatrix, [
        0,
        22,
        47,
        52,
        68,
        73,
        79,
        97,
      ]);
      manualFullEGs = makeManualTGs(conceptSimilarityMatrix, [0, 97]);
      // manualMiddleEGs = makeManualTGs(conceptSimilarityMatrix, [
      //   0,
      //   22,
      //   47,
      //   69,
      //   79,
      //   97,
      //   132,
      //   134,
      //   177,
      // ]);
      // manualBigEGs = makeManualTGs(conceptSimilarityMatrix, [
      //   0,
      //   22,
      //   47,
      //   69,
      //   133,
      //   177,
      // ]);
      // manualSmallEGTitles = getBasicIncomeManualSmallEGTitles();
      // manualMiddleEGTitles = getBasicIncomeManualMiddleEGTitles();
      // manualBigEGTitles = getBasicIncomeManualBigEGTitles();
    } else if (debateName === "정시확대") {
      manualBigEGs = makeManualTGs(conceptSimilarityMatrix, [
        0,
        15,
        35,
        139,
        159,
        244,
        293,
        313,
      ]);
      manualBigEGTitles = getSatManualBigEGTitles();
    } else if (debateName === "모병제") {
      manualBigEGs = makeManualTGs(conceptSimilarityMatrix, [
        0,
        10,
        15,
        36,
        57,
        78,
        93,
        108,
        138,
        175,
      ]);
      manualBigEGTitles = getMilitaryManualBigEGTitles();
    } else if (debateName === "sample") {
      manualSmallEGs = makeManualTGs(conceptSimilarityMatrix, [0, 5]);
    }

    this._dataStructureSet = {
      // utteranceObjectsForDrawing,
      utteranceObjectsForDrawingManager,
      participants,
      participantDict,
      // conceptSimilarityBlocks,
      // conceptSimilarityMatrix,
      similarityBlockManager,
      maxSimilarityScore,
      utteranceIndexSentenceIndexTotalSentenceIndexDict,
    };
    //@ts-ignore
    this._datasetOfManualEGs = {
      manualSmallEGs,
      manualMiddleEGs,
      manualBigEGs,
      manualFullEGs,
      // manualSmallEGTitles,
      manualFullEGTitles,
      manualMiddleEGTitles,
      manualBigEGTitles,
    };
  }

  public get dataStructureSet() {
    return this._dataStructureSet;
  }
  public get datasetOfManualEGs() {
    return this._datasetOfManualEGs;
  }
}
