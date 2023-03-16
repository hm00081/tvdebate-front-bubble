/* eslint-disable no-unused-vars */
import _ from "lodash";
import { SentenceObject } from "../../interfaces/DebateDataInterface";

/**
 * WindowDiff for Evaluation of Topic Segmentation
 */

export default class WindowDiff {
  private readonly k: number;

  public constructor(
    private readonly sentenceIndexesForSegmentsOfPeople: number[],
    private readonly totalSentenceObjects: SentenceObject[]
  ) {
    // number of real topic segments / 2
    this.k = sentenceIndexesForSegmentsOfPeople.length / 2;
  }

  public makeWindowDiffBasedOnSentence(
    sentenceIndexesForSegmentOfModel: number[]
  ) {
    let count: number = 0;
    for (let i = 0; i < this.totalSentenceObjects.length - this.k; i++) {
      const numberOfBoundariesOfHuman = this.makeB(
        i,
        this.k,
        this.sentenceIndexesForSegmentsOfPeople
      );
      const numberOfBoundariesOfModel = this.makeB(
        i,
        this.k,
        sentenceIndexesForSegmentOfModel
      );

      count += Math.abs(numberOfBoundariesOfHuman - numberOfBoundariesOfModel);
    }

    return count / (this.totalSentenceObjects.length - this.k);
  }

  private makeB(i: number, k: number, sentenceIndexesForSegments: number[]) {
    const filtered1 = _.filter(
      sentenceIndexesForSegments,
      (sentenceIndex) => sentenceIndex >= i
    );
    const filtered2 = _.filter(
      sentenceIndexesForSegments,
      (sentenceIndex) => sentenceIndex > i + k
    );

    return filtered1.length - filtered2.length;
  }
}
