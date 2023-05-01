/* eslint-disable no-unused-vars */
import _ from "lodash";
import { ParticipantDict } from "../../../common_functions/makeParticipants";
import { UtteranceObject } from "../../../interfaces/DebateDataInterface";
// import {
//   termList,
//   termUtteranceBooleanMatrixTransposed,
//   utteranceObjects,
// } from "../DataImporter";

import { SimilarityBlock } from "../interfaces";

export interface ParticipantCount {
  name: string;
  count: number;
}

export interface TermCountDict {
  [term: string]: number;
}

export interface TermCountDetailDict {
  [term: string]: {
    [name: string]: ParticipantCount;
  };
}

export class TermCountDictOfEGMaker {
  private readonly termCountDictOfEG: TermCountDict = {};
  private readonly termBooleanCountDictOfEG: TermCountDict = {};
  private readonly termCountDetailDictOfEG: TermCountDetailDict = {};
  private readonly termBooleanCountDetailDictOfEG: TermCountDetailDict = {};

  public constructor(
    engagementGroup: SimilarityBlock[][],
    participantDict: ParticipantDict,
    utteranceObjects: UtteranceObject[],
    termUtteranceBooleanMatrixTransposed: number[][],
    termList: string[]
  ) {
    // object for deepcopy
    const defaultParticipantNameCountDict: {
      [name: string]: ParticipantCount;
    } = {};
    _.chain(participantDict)
      .map((participant) => participant.name)
      .forEach((name) => {
        defaultParticipantNameCountDict[name] = { name, count: 0 };
      })
      .value();

    _.forEach(engagementGroup, (verticalSimilarityBlocks, lineIndexOfEG) => {
      const utteranceIndex: number =
        verticalSimilarityBlocks[0].rowUtteranceIndex - 1;

      const utteranceObject = utteranceObjects[utteranceIndex];

      // find terms
      const termBooleans = termUtteranceBooleanMatrixTransposed[utteranceIndex];

      _.forEach(termBooleans, (termBoolean, termIndex) => {
        if (termBoolean === 1) {
          const term = termList[termIndex];
          const termCountFromUtterance = [
            ...utteranceObject.utterance.matchAll(new RegExp(term, "g")),
          ].length;
          if (!(term in this.termCountDictOfEG)) {
            this.termCountDictOfEG[term] = 0;
          }
          this.termCountDictOfEG[term] += termCountFromUtterance;

          if (!(term in this.termBooleanCountDictOfEG)) {
            this.termBooleanCountDictOfEG[term] = 0;
          }
          this.termBooleanCountDictOfEG[term] += 1;

          if (!(term in this.termBooleanCountDetailDictOfEG)) {
            this.termBooleanCountDetailDictOfEG[term] = _.cloneDeep(
              defaultParticipantNameCountDict
            );
          }
          this.termBooleanCountDetailDictOfEG[term][
            utteranceObject.name
          ].count += 1;

          if (!(term in this.termCountDetailDictOfEG)) {
            this.termCountDetailDictOfEG[term] = _.cloneDeep(
              defaultParticipantNameCountDict
            );
          }
          this.termCountDetailDictOfEG[term][
            utteranceObject.name
          ].count += termCountFromUtterance;
        }
      });
    });
  }

  public getTermCountDictOfEG() {
    return this.termCountDictOfEG;
  }

  public getTermBooleanCountDictOfEG() {
    return this.termBooleanCountDictOfEG;
  }

  public getTermBooleanCountDetailDictOfEG() {
    return this.termBooleanCountDetailDictOfEG;
  }

  public getTermCountDetailDictOfEG() {
    return this.termCountDetailDictOfEG;
  }
}
