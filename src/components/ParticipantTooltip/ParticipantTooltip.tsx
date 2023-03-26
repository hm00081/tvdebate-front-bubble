/**
 * Tooltip for Participant Rect
 */

/* eslint-disable no-unused-vars */
import { Popover, Tooltip } from "antd";
import { PopoverProps } from "antd/lib/popover";
import _ from "lodash";
// import { transform } from "lodash";
import React, { useEffect, useState, Ref } from "react";
import { findTopValueIndexes } from "../../common_functions/findTopValueIndexes";
import { DebateDataSet } from "../../interfaces/DebateDataInterface";
import { D3Drawer } from "../../views/ConceptualRecurrencePlot/Drawers/D3Drawer";
import { UtteranceObjectForDrawing } from "../../views/ConceptualRecurrencePlot/interfaces";
import styles from "./ParticipantTooltip.module.scss";

export interface SvgTooltipRef {}

interface ComponentProps {
  utteranceObjectForDrawing: UtteranceObjectForDrawing | null;
  // mouseoveredUtteranceIndex: number;
  transform: d3.ZoomTransform | null;
  visible: boolean;
  d3Drawer: D3Drawer | null;
  debateDataset: DebateDataSet | null;
}

function ParticipantTooltip(props: ComponentProps, ref: Ref<SvgTooltipRef>) {
  const [visible, setVisible] = useState<boolean>(false);
  useEffect(() => {
    setVisible(props.visible);
  }, [props.visible]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: props.transform
          ? `translate(${props.transform.x}px, ${props.transform.y}px) scale(${props.transform.k})`
          : "",
      }}
    >
      <Popover
        title={() => {
          if (props.debateDataset && props.utteranceObjectForDrawing) {
            const i = _.findIndex(
              props.debateDataset.utteranceObjects,
              (utteranceObject) =>
                utteranceObject.utterance ===
                props.utteranceObjectForDrawing!.utterance
            );

            const conceptVectorOfUtterance =
              props.debateDataset.conceptMatrixTransposed[i];

            const numOfMainKeyterms = 3;
            const topValueIndexes = findTopValueIndexes(
              conceptVectorOfUtterance,
              numOfMainKeyterms
            );
            const mainKeytermObjects = _.map(
              topValueIndexes,
              (topValueIndex) =>
                props.debateDataset!.keytermObjects[topValueIndex]
            );
            console.log(mainKeytermObjects);
            let mainKeytermsString: string = ""; //툴팁 주요 용어
            if (mainKeytermObjects.length <= numOfMainKeyterms) {
              mainKeytermsString = _.reduce(
                mainKeytermObjects,
                (result, keytermObject) => {
                  return `${result} ${keytermObject.name}`;
                },
                ""
              );
            }
            // console.log(mainKeytermsString);
            // return `${props.utteranceObjectForDrawing.name}`;
            return `${props.utteranceObjectForDrawing.name}  [${mainKeytermsString} ]`;
          } else {
            return "";
          }
        }}
        content={
          props.utteranceObjectForDrawing
            ? props.utteranceObjectForDrawing.utterance
            : ""
        }
        // trigger="click"
        open={visible}
        onOpenChange={handleVisibleChange}
        overlayClassName={styles.popover}
      >
        <div
          style={{
            position: "absolute",
            left: getPosition(props.utteranceObjectForDrawing),
            //top: getPosition(props.utteranceObjectForDrawing),
            //width: getWidth(props.utteranceObjectForDrawing),
            //height: getWidth(props.utteranceObjectForDrawing),
            // backgroundColor: "yellow",
          }}
          onClick={(mouseEvent) => {
            if (props.d3Drawer && props.utteranceObjectForDrawing) {
              props.d3Drawer.participantBlocksDrawer.click(
                mouseEvent,
                props.utteranceObjectForDrawing
              );
            }
          }}
        ></div>
      </Popover>
    </div>
  );

  function getPosition(
    utteranceObjectForDrawing: UtteranceObjectForDrawing | null
  ) {
    let position: number = 0;
    // const lastUtteranceObjectForDrawing =
    if (utteranceObjectForDrawing) {
      position = utteranceObjectForDrawing.beginningPointOfXY;
    }
    return position;
  }

  function getWidth(
    utteranceObjectForDrawing: UtteranceObjectForDrawing | null
  ) {
    let width: number = 0;
    if (utteranceObjectForDrawing) {
      width = utteranceObjectForDrawing.width + 50;
    }
    return width;
  }

  function getHeight(
    utteranceObjectForDrawing: UtteranceObjectForDrawing | null
  ) {
    let height: number = 0;
    if (utteranceObjectForDrawing) {
      height = utteranceObjectForDrawing.height + 50;
    }
    return height;
  }

  function handleVisibleChange(visible: boolean) {
    setVisible(visible);
  }
}

export default ParticipantTooltip;
