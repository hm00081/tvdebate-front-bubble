/* eslint-disable no-unused-vars */
import {
  DebateDataSet,
  EvaluationDataSet,
  UtteranceObject,
} from "../interfaces/DebateDataInterface";
import { SentenceObject } from "../interfaces/DebateDataInterface";
import Pk from "./evaluation_metrics/Pk";
import WindowDiff from "./evaluation_metrics/WindowDiff";
import LCseg from "./LCseg/LCseg";
import _ from "lodash";
import {
  SimilarityBlock,
  UtteranceIndexSentenceIndexTotalSentenceIndexDict,
} from "../views/ConceptualRecurrencePlot/interfaces";
import { make1EngagementGroup } from "../views/ConceptualRecurrencePlot/DataStructureMaker/make1EngagementGroup";

/**
 * Evaluation including LCseg model & evaluation metrics
 */
export default class Evaluation {
  public lcseg: LCseg;
  public readonly pk: Pk;
  public readonly windowDiff: WindowDiff;

  private readonly totalSentenceObjects: SentenceObject[] = [];
  private readonly sentenceIndexUtteranceIndexDict: {
    [sentenceIndex: number]: number;
  } = {};

  public constructor(
    private debateDataSet: DebateDataSet,
    evaluationDataSet: EvaluationDataSet
  ) {
    // make sentenceIndex_utteranceIndex_dict;
    _.forEach(
      debateDataSet.utteranceObjects,
      (utteranceObject, utteranceIndex) => {
        _.forEach(
          utteranceObject.sentenceObjects,
          (sentenceObject, sentenceIndex) => {
            this.totalSentenceObjects.push(sentenceObject);
            this.sentenceIndexUtteranceIndexDict[
              this.totalSentenceObjects.length - 1
            ] = utteranceIndex;
          }
        );
      }
    );

    this.lcseg = new LCseg(
      debateDataSet.termList,
      debateDataSet.frequencyVector,
      debateDataSet.utteranceObjects,
      evaluationDataSet.sentenceIndexLexicalChainsDict
    );
    // console.log(
    //   "evaluationDataSet.sentenceIndexesForSegmentsOfPeople",
    //   evaluationDataSet.sentenceIndexesForSegmentsOfPeople
    // );
    this.pk = new Pk(
      evaluationDataSet.sentenceIndexesForSegmentsOfPeople,
      this.totalSentenceObjects
    );
    this.windowDiff = new WindowDiff(
      evaluationDataSet.sentenceIndexesForSegmentsOfPeople,
      this.totalSentenceObjects
    );
  }

  public makeGroupsInCRP(
    totalSimilarityBlockGroup: SimilarityBlock[][],
    segmentSentenceIndexes: number[]
  ): SimilarityBlock[][][] {
    // find utteranceIndexes by segmentSentenceIndexes
    const segmentUtteranceIndexes: number[] = [0];
    _.forEach(segmentSentenceIndexes, (sentenceIndex, index) => {
      let segmentUtteranceIndex: number = -1;

      if (index < segmentSentenceIndexes.length - 1) {
        segmentUtteranceIndex = this.sentenceIndexUtteranceIndexDict[
          sentenceIndex + 1
        ];
      } else {
        segmentUtteranceIndex = this.sentenceIndexUtteranceIndexDict[
          sentenceIndex
        ];
      }

      segmentUtteranceIndexes.push(segmentUtteranceIndex);
    });
    // console.log("segmentUtteranceIndexes", segmentUtteranceIndexes);
    // segmentUtteranceIndexes.push(this.debateDataSet.utteranceObjects.length);

    // split groups by segmentUtteranceIndexes
    const segmentGroups: SimilarityBlock[][][] = [];
    for (let i = 0; i < segmentUtteranceIndexes.length - 1; i++) {
      if (
        segmentUtteranceIndexes[i] !== segmentUtteranceIndexes[i + 1] &&
        segmentUtteranceIndexes[i] <
          this.debateDataSet.utteranceObjects.length - 1
      ) {
        const segmentGroup = make1EngagementGroup(
          totalSimilarityBlockGroup,
          segmentUtteranceIndexes[i],
          segmentUtteranceIndexes[i + 1]
        );
        segmentGroups.push(segmentGroup);
      }
    }

    return segmentGroups;
  }

  /**
   * convert topic_groups to sentence_indexes in first of adjacent utterances
   * @param topicGroups
   * @param utteranceIndexSentenceIndexTotalSentenceIndexDict
   * @returns
   */
  public makeGroupsToSentenceIndexesInFirst(
    topicGroups: SimilarityBlock[][][],
    utteranceIndexSentenceIndexTotalSentenceIndexDict: UtteranceIndexSentenceIndexTotalSentenceIndexDict
  ) {
    const utteranceIndexesOfSegments: number[] = _.map(
      topicGroups,
      (topicGroup) => topicGroup[0][0].columnUtteranceIndex
    );

    const sentenceIndexesOfSegments = _.map(
      utteranceIndexesOfSegments,
      (utteranceIndex) =>
        utteranceIndexSentenceIndexTotalSentenceIndexDict[utteranceIndex][0]
    );

    return sentenceIndexesOfSegments;
  }

  /**
   * convert topic_groups to sentence_indexes in middle of adjacent utterances
   * @param topicGroups
   * @param utteranceObjects
   * @param utteranceIndexSentenceIndexTotalSentenceIndexDict
   * @returns
   */
  public makeGroupsToSentenceIndexesInMiddle(
    topicGroups: SimilarityBlock[][][],
    utteranceObjects: UtteranceObject[],
    utteranceIndexSentenceIndexTotalSentenceIndexDict: UtteranceIndexSentenceIndexTotalSentenceIndexDict
  ): number[] {
    const utteranceIndexesOfSegments: number[] = _.map(
      topicGroups,
      (topicGroup) =>
        // start index of topic group
        topicGroup[0][0].columnUtteranceIndex
    );

    const sentenceIndexesOfSegments: number[] = [0];
    for (let i = 1; i < utteranceIndexesOfSegments.length; i++) {
      // find "middle sentence" vs first sentence
      const utteranceIndex = utteranceIndexesOfSegments[i];

      let middleSentenceIndexInUtterance: number = 0;
      if (utteranceObjects[utteranceIndex].sentenceObjects.length % 2 === 1) {
        middleSentenceIndexInUtterance =
          (utteranceObjects[utteranceIndex].sentenceObjects.length - 1) / 2;
      } else {
        middleSentenceIndexInUtterance =
          utteranceObjects[utteranceIndex].sentenceObjects.length / 2 - 1;
      }

      const sentenceIndexInUtterances =
        utteranceIndexSentenceIndexTotalSentenceIndexDict[utteranceIndex][
          middleSentenceIndexInUtterance
        ];

      sentenceIndexesOfSegments.push(sentenceIndexInUtterances);
    }

    return sentenceIndexesOfSegments;
  }
}
