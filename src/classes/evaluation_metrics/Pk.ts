import _ from "lodash";
import { SentenceObject } from "../../interfaces/DebateDataInterface";

/**
 * Pk for Evaluation of Topic Segmentation
 */
/* eslint-disable no-unused-vars */

export default class Pk {
  private readonly k: number;

  public constructor(
    private readonly sentenceIndexesForSegmentsOfPeople: number[],
    private readonly totalSentenceObjects: SentenceObject[]
  ) {
    // number of real topic segments / 2
    this.k = sentenceIndexesForSegmentsOfPeople.length / 2;
    // this.k = 10;
  }

  public makePkBasedOnSentence(sentenceIndexesForSegmentsOfModel: number[]) {
    let count: number = 0;
    for (let i = 0; i < this.totalSentenceObjects.length - this.k; i++) {
      const deltaOfHuman = this.makeDelta(
        i,
        this.k,
        this.sentenceIndexesForSegmentsOfPeople
      );
      const deltaOfModel = this.makeDelta(
        i,
        this.k,
        sentenceIndexesForSegmentsOfModel
      );

      if (deltaOfHuman !== deltaOfModel) {
        count++;
      }
    }

    return count / (this.totalSentenceObjects.length - this.k);
  }

  private makeDelta(
    i: number,
    k: number,
    sentenceIndexesForSegments: number[]
  ): 1 | 0 {
    // [1, 3, 5, 7, 9]
    // find (i)'s order in manualSentenceIndexesOfSegments
    const index1 = _.find(
      sentenceIndexesForSegments,
      (sentenceIndex) => sentenceIndex >= i
    );
    // find (i+k)'s order in manualSentenceIndexesOfSegments
    const index2 = _.find(
      sentenceIndexesForSegments,
      (sentenceIndex) => sentenceIndex > i + k
    );

    if (index1 === index2) {
      // same topic: 1
      return 1;
    } else {
      // not same topic: 0
      return 0;
    }
  }

  // maybe deprecated?
  // public makePkBasedOnUtterance() {
  //   // implement math equation
  // }
}
