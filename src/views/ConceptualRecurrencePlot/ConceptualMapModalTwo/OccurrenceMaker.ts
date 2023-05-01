import _ from "lodash";
import * as math from "mathjs";
import {
  SentenceObject,
  TermCountDict,
  UtteranceObject,
} from "../../../interfaces/DebateDataInterface";

export interface OccurrenceDict {
  [term: string]: number;
}

export class OccurrenceMaker {
  private _occurrenceVector: number[];
  private _cooccurrenceMatrix: number[][];

  constructor(
    utteranceOjbectsOfEG: UtteranceObject[],
    termListOfEG: string[],
    termCountDictType: "singleTermCountDict" | "compoundTermCountDict",
    sentenceWindow: number
  ) {
    const occurrenceDict: OccurrenceDict = {};
    const termCountDictsOfWS: TermCountDict[] = [];

    const windowSentenceElements: SentenceObject[] = [];
    _.forEach(utteranceOjbectsOfEG, (utteranceOjbect) => {
      // _.forEach( collection, [iteratee = _.identity] )
      _.forEach(utteranceOjbect.sentenceObjects, (sentenceObject) => {
        // make windowSentences
        if (windowSentenceElements.length === sentenceWindow) {
          const termCountDictOfWS: TermCountDict = _.reduce<
            SentenceObject,
            TermCountDict
          >(
            windowSentenceElements,
            (termCountDictOfWS, windowSentenceElement) => {
              _.forEach(
                windowSentenceElement[termCountDictType],
                (count, term) => {
                  if (term in termCountDictOfWS) {
                    termCountDictOfWS[term] += count;
                  } else {
                    termCountDictOfWS[term] = count;
                  }
                }
              );
              return termCountDictOfWS;
            },
            {}
          );

          termCountDictsOfWS.push(termCountDictOfWS);

          windowSentenceElements.shift();
          windowSentenceElements.push(sentenceObject);
        } else if (windowSentenceElements.length < sentenceWindow) {
          windowSentenceElements.push(sentenceObject);
        }

        // make occurrenceDict
        _.forEach(termListOfEG, (term) => {
          if (sentenceObject.sentence.search(term) !== -1) {
            if (term in occurrenceDict) occurrenceDict[term] += 1;
            else occurrenceDict[term] = 1;
          }
        });
      });
    });

    // make occurrenceVector
    this._occurrenceVector = _.map(termListOfEG, (term) => {
      return occurrenceDict[term];
    });

    // make cooccurrenceMatrix
    this._cooccurrenceMatrix = math.zeros([
      termListOfEG.length,
      termListOfEG.length,
    ]) as number[][];
    _.forEach(termListOfEG, (term1, term1Index) => {
      _.forEach(termListOfEG, (term2, term2Index) => {
        _.forEach(termCountDictsOfWS, (termCountDictOfWS) => {
          if (
            term1 in termCountDictOfWS &&
            term2 in termCountDictOfWS &&
            term1 != term2
          ) {
            this._cooccurrenceMatrix[term1Index][term2Index] += 1;
          }
        });
      });
    });
  }

  public get occurrenceVector(): number[] {
    console.log(this._occurrenceVector);
    return this._occurrenceVector;
  }
  public get cooccurrenceMatrix(): number[][] {
    return this._cooccurrenceMatrix;
  }
}
