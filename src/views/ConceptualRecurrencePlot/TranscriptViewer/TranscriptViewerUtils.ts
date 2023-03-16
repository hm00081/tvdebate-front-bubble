/* eslint-disable no-unused-vars */

import _ from "lodash";
import { SentenceObject } from "../../../interfaces/DebateDataInterface";

export function getBackgroundColorOfSentenceSpan(
  sentenceObject: SentenceObject,
  sentenceSentimentStandard: number
) {
  let backgroundColor: string = "none";
  if (sentenceObject.sentiment >= sentenceSentimentStandard) {
    backgroundColor = `rgba(79, 198, 66, ${sentenceObject.sentiment})`;
  } else if (sentenceObject.sentiment <= -sentenceSentimentStandard) {
    backgroundColor = `rgba(198, 66, 66, ${-sentenceObject.sentiment})`;
  }

  return backgroundColor;
}
