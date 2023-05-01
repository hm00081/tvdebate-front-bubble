/* eslint-disable no-unused-vars */
import _ from "lodash";
import React, { useEffect } from "react";
import { DataStructureManager } from "../DataStructureMaker/DataStructureManager";
import { UtteranceObjectForDrawing } from "../interfaces";
import styles from "./TranscriptViewer.module.scss";
import { getBackgroundColorOfSentenceSpan } from "./TranscriptViewerUtils";

interface ComponentProps {
  dataStructureMaker: DataStructureManager | null;
}

function TranscriptViewer(props: ComponentProps) {
  return (
    <div className={styles.transcriptViewerWrapper}>
      <div className={styles.transcriptViewer}>
        {props.dataStructureMaker ? (
          _.map(
            props.dataStructureMaker.dataStructureSet
              .utteranceObjectsForDrawingManager.utteranceObjectsForDrawing,
            (utteranceObject, index) => {
              return (
                <div
                  style={{ marginBottom: "12px" }}
                  key={`utterance-${index}`}
                >
                  <div
                    style={{
                      color: props.dataStructureMaker!.dataStructureSet
                        .participantDict[utteranceObject.name].color,
                    }}
                  >
                    [ {utteranceObject.name} ]
                  </div>
                  <div>{utteranceObject.utterance}</div>
                  {/* {getSentenceSpans(utteranceObject)} */}
                </div>
              );
            }
          )
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// TODO we can use it to color text for sentiment
function getSentenceSpans(utteranceObject: UtteranceObjectForDrawing) {
  return _.map(utteranceObject.sentenceObjects, (sentenceObject) => {
    return (
      <span
        style={{
          // marginRight: 2,
          backgroundColor: getBackgroundColorOfSentenceSpan(
            sentenceObject,
            0.25
          ),
        }}
      >
        {sentenceObject.sentence + " "}
      </span>
    );
  });
}

export default TranscriptViewer;
