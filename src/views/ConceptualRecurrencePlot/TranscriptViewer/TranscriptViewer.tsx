/* eslint-disable no-unused-vars */
import _ from "lodash";
import React, { forwardRef, useEffect, useMemo } from "react";
import { DataStructureManager } from "../DataStructureMaker/DataStructureManager";
import { UtteranceObjectForDrawing } from "../interfaces";
import styles from "./TranscriptViewer.module.scss";
import { getBackgroundColorOfSentenceSpan } from "./TranscriptViewerUtils";
import { HierarchyDatum } from "./../ConceptualMapModalTwo/ConceptualMapDrawer";
interface ComponentProps {
  dataStructureMaker: DataStructureManager | null;
  selectedRange?: { startIndex: number; endIndex: number };
  circleKeywords?: string[] | null;
  circleData?: d3.HierarchyCircularNode<HierarchyDatum>[];
}

function TranscriptViewer(props: ComponentProps, ref: any) {
  const {
    dataStructureMaker,
    selectedRange,
    circleKeywords,
    circleData,
  } = props;

  const filteredUtterances = useMemo(() => {
    if (dataStructureMaker) {
      const utterances =
        dataStructureMaker.dataStructureSet.utteranceObjectsForDrawingManager
          .utteranceObjectsForDrawing;

      if (selectedRange) {
        return utterances.slice(
          selectedRange.startIndex,
          selectedRange.endIndex + 1
        );
      }

      return utterances;
    }

    return [];
  }, [dataStructureMaker, selectedRange]);

  // 키워드들을 하이라이팅하는 함수를 추가합니다.
  function highlightKeywords(
    text: string,
    keywords: string[],
    circleData?: d3.HierarchyCircularNode<HierarchyDatum>[]
  ) {
    let highlightedText = text;
    if (!circleData) {
      return highlightedText;
    }
    keywords.forEach((keyword) => {
      //console.log("Keyword:", keyword);
      const parentNode = circleData.find((node) => node.data.id === keyword)
        ?.parent;
      // const personName = parentNode?.data.id.split("-")[0];
      // // 화자별 색상적용코드
      // const personColor =
      //   // convert color
      //   //@ts-ignore
      //   dataStructureMaker?.dataStructureSet.participantDict[personName]
      //     ?.color || "yellow";

      // const rgbaPersonColor = `rgba(${parseInt(
      //   personColor.slice(1, 3),
      //   16
      // )}, ${parseInt(personColor.slice(3, 5), 16)}, ${parseInt(
      //   personColor.slice(5, 7),
      //   16
      // )}, 0.9)`; // Opacity
      //고정된 색상
      const personColor = "yellow";
      const rgbaPersonColor = "rgba(255, 255, 0, 0.64)"; // Opacity (yellow with 0.9 opacity)

      //fixed code
      const regex = new RegExp(`(${keyword})`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        `<mark style="background-color: ${rgbaPersonColor}">$1</mark>`
      );
    });
    return highlightedText;
  }

  console.log("circleKeywords:", circleKeywords);
  console.log("circleData:", circleData);

  return (
    <div className={styles.transcriptViewerWrapper}>
      <div className={styles.transcriptViewer}>
        {filteredUtterances
          // .filter((utteranceObject) => {
          //   if (!circleData) {
          //     return true;
          //   }

          //   // circleData에서 발화자 이름을 찾습니다.
          //   const speakerNode = circleData.find(
          //     (node) => node.data.id === utteranceObject.name
          //   );

          //   // 발화자가 선택된 이준석 또는 김종대인 경우에만 표시합니다.
          //   return speakerNode !== undefined;
          // })
          .map((utteranceObject, index) => (
            <div style={{ marginBottom: "12px" }} key={`utterance-${index}`}>
              <div
                style={{
                  color: dataStructureMaker!.dataStructureSet.participantDict[
                    utteranceObject.name
                  ].color,
                }}
              >
                [ {utteranceObject.name} ]
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    circleKeywords && circleData
                      ? highlightKeywords(
                          utteranceObject.utterance,
                          circleKeywords,
                          circleData
                        )
                      : utteranceObject.utterance,
                }}
              />
              {/* {getSentenceSpans(utteranceObject)} */}
            </div>
          ))}
      </div>
    </div>
  );
}

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

export default forwardRef(TranscriptViewer);
