/* eslint-disable no-unused-vars */
import _ from "lodash";
import { ParticipantDict } from "../../../common_functions/makeParticipants";
import {
  TermCountDict,
  UtteranceObject,
} from "../../../interfaces/DebateDataInterface";
import { TermType } from "../DataImporter";

export interface ParticipantCount {
  name: string;
  count: number;
  sentiment: number; // sum of sentiments of sentences
  evaluateAgainst?: string;
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
    utteranceObjectsOfEG: UtteranceObject[],
    participantDict: ParticipantDict,
    termType: TermType
  ) {
    //console.log("utteranceObjectsOfEG", utteranceObjectsOfEG);
    // object for deepcopy
    const defaultParticipantNameCountDict: {
      [name: string]: ParticipantCount;
    } = {};
    _.chain(participantDict)
      .map((participant) => participant.name)
      .forEach((name) => {
        defaultParticipantNameCountDict[name] = {
          name,
          count: 0,
          sentiment: 0,
        };
      })
      .value();

    _.forEach(utteranceObjectsOfEG, (utteranceObject) => {
      _.forEach(utteranceObject.sentenceObjects, (sentenceObject) => {
        const termCountDict =
          termType !== "compound_term"
            ? (sentenceObject.singleTermCountDict as TermCountDict)
            : (sentenceObject.compoundTermCountDict as TermCountDict);
        _.forEach(termCountDict, (count, term) => {
          if (!(term in this.termCountDictOfEG)) {
            this.termCountDictOfEG[term] = 0;
          }
          this.termCountDictOfEG[term] += termCountDict[term];

          if (!(term in this.termBooleanCountDictOfEG)) {
            this.termBooleanCountDictOfEG[term] = 0;
          }
          this.termBooleanCountDictOfEG[term] += 1;

          if (!(term in this.termCountDetailDictOfEG)) {
            this.termCountDetailDictOfEG[term] = _.cloneDeep(
              defaultParticipantNameCountDict
            );
          }
          this.termCountDetailDictOfEG[term][utteranceObject.name].count +=
            termCountDict[term];
          this.termCountDetailDictOfEG[term][utteranceObject.name].sentiment +=
            sentenceObject.sentiment;
          this.termCountDetailDictOfEG[term][
            utteranceObject.name
          ].evaluateAgainst = utteranceObject.evaluateAgainst;

          if (!(term in this.termBooleanCountDetailDictOfEG)) {
            this.termBooleanCountDetailDictOfEG[term] = _.cloneDeep(
              defaultParticipantNameCountDict
            );
          }
          this.termBooleanCountDetailDictOfEG[term][
            utteranceObject.name
          ].count += 1;
          this.termBooleanCountDetailDictOfEG[term][
            utteranceObject.name
          ].sentiment += sentenceObject.sentiment;
          this.termBooleanCountDetailDictOfEG[term][
            utteranceObject.name
          ].evaluateAgainst = utteranceObject.evaluateAgainst; // evaluateAgainst 값을 추가
        });
      });
    });
    //console.log(this.termBooleanCountDetailDictOfEG);
    //console.log(this.termCountDetailDictOfEG);
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
