/* eslint-disable no-unused-vars */
import React, {
  forwardRef,
  Ref,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import { useLocation } from "react-router-dom";
import styles from "./ConceptualMapModal.module.scss";
import { ConceptualMapDrawer } from "./ConceptualMapDrawer";
import { SimilarityBlock, UtteranceObjectForDrawing } from "../interfaces";
import { GraphDataStructureMaker } from "./GraphDataStructureMaker";
import * as math from "mathjs";
import _ from "lodash";
import ConceptualMapControllers from "./ConceptualMapControllers/ConceptualMapControllers";
import { ParticipantDict } from "../../../common_functions/makeParticipants";
import {
  DebateDataSet,
  UtteranceObject,
  EvaluationDataSet,
} from "../../../interfaces/DebateDataInterface";
import DataImporter, { DebateName, TermType } from "../DataImporter";
import { DataStructureManager } from "../DataStructureMaker/DataStructureManager";
import CombinedEGsMaker from "../DataStructureMaker/CombinedEGsMaker";
import { useSelector, useDispatch } from "react-redux";
import { CHANGE_STANDARD_SIMILARITY_SCORE } from "../../../redux/actionTypes";
import CirclePackingModal, {
  CirclePackingModalRef,
} from "./CirclePackingModal/CirclePackingModal";

const conceptualMapDivClassName: string = "conceptual-map";

export interface circlePackingMapModalRef {
  openModal: (modalTitle: string, engagementGroup: SimilarityBlock[][]) => void;
}

interface ComponentProps {
  engagementGroup: SimilarityBlock[][];
  participantDict: ParticipantDict;
  utteranceObjects: UtteranceObject[];
  termUtteranceBooleanMatrixTransposed: number[][];
  termList: string[];
  termType: TermType;
  drawGraph: (
    index: number,
    engagementGroup: SimilarityBlock[][],
    manualBigEGs: SimilarityBlock[][][]
  ) => void;
  manualBigEGs: SimilarityBlock[][][]; // 추가
  dataStructureManager: DataStructureManager;
}

function ConceptualMapModal(
  props: ComponentProps,
  ref: Ref<circlePackingMapModalRef>
) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [maxOfLinksPerNode, setMaxOfLinksPerNode] = useState<number>(3);
  const [showNodeNotHavingLinks, setShowNodeNotHavingLinks] = useState<boolean>(
    true
  );
  // migration to CRP to CMM
  const query = new URLSearchParams(useLocation().search);
  const debateNameOfQuery = query.get("debate_name") as DebateName;
  const termTypeOfQuery = query.get("term_type") as TermType;
  const [debateDataset, setDebateDataset] = useState<DebateDataSet | null>(
    null
  );
  const [
    dataStructureManager,
    setDataStructureManager,
  ] = useState<DataStructureManager | null>(null);
  const [
    evaluationDataSet,
    setEvaluationDataSet,
  ] = useState<EvaluationDataSet | null>(null);
  const [
    combinedEGsMaker,
    setCombinedEGsMaker,
  ] = useState<CombinedEGsMaker | null>(null);
  const [conceptualMapDrawers, setConceptualMapDrawers] = useState<
    ConceptualMapDrawer[]
  >([]);
  const [engagementGroups, setEngagementGroups] = useState<
    SimilarityBlock[][][]
  >([]);
  const [manualBigEGsFromDSM, setManualBigEGsFromDSM] = useState<
    SimilarityBlock[][][]
  >([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerWidth);
  const circlePackingMapModalRef = React.useRef<CirclePackingModalRef>(null);
  const svgWidth = windowWidth / 15;
  const relationships = [["박휘락", "장경태"]];
  const dispatch = useDispatch();

  const findDataIndex = (element: HTMLElement | null): number | null => {
    if (!element) return null;
    const divSelectionElement = element.closest(".divSelection");
    console.log("divSelectionElement:", divSelectionElement);
    //@ts-ignore
    if (divSelectionElement && divSelectionElement.dataset.index) {
      //@ts-ignore
      return parseInt(divSelectionElement.dataset.index);
    }
    return null;
  };

  const handleSvgClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const targetElement = event.target as HTMLElement;
    const dataIndex = findDataIndex(targetElement);
    if (
      circlePackingMapModalRef.current &&
      manualBigEGsFromDSM.length > 0 &&
      dataIndex !== null
    ) {
      const selectedEngagementGroup = manualBigEGsFromDSM[dataIndex];
      circlePackingMapModalRef.current.openModal(
        dataIndex,
        selectedEngagementGroup
      );
    }
  };

  const drawGraph = (index: number, relationship: string[]) => {
    const conceptualMapDrawer = conceptualMapDrawers[index];
    if (conceptualMapDrawer) {
      conceptualMapDrawer.removeDrawing();

      const selectedManualBigEG = manualBigEGsFromDSM[index];
      const graphDataStructureMaker = new GraphDataStructureMaker(
        selectedManualBigEG,
        props.participantDict,
        props.utteranceObjects,
        props.termType
      );

      const cooccurrenceMatrixOfEG = graphDataStructureMaker.getCooccurrenceMatrixOfEG();
      const ceiledMedian = Math.ceil(math.mean(cooccurrenceMatrixOfEG));

      const nodeLinkDict = graphDataStructureMaker.generateNodesAndLinks(
        ceiledMedian,
        maxOfLinksPerNode,
        showNodeNotHavingLinks
      );

      conceptualMapDrawer.setGraphData(nodeLinkDict);
      conceptualMapDrawer.updateGraph(relationship);
    }
  };
  const handleWindowResize = () => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  useEffect(() => {
    if (dataStructureManager) {
      const datasetOfManualEGs = dataStructureManager.datasetOfManualEGs;
      const manualBigEGs = datasetOfManualEGs.manualBigEGs;
      setManualBigEGsFromDSM(manualBigEGs);
    }
  }, [dataStructureManager]);

  useEffect(() => {
    const modalContentElement = modalRef.current;
    if (modalContentElement) {
      modalContentElement.addEventListener("click", handleSvgClick);
    }
    return () => {
      if (modalContentElement) {
        modalContentElement.removeEventListener("click", handleSvgClick);
      }
    };
  }, []);

  useEffect(() => {
    if (dataStructureManager && manualBigEGsFromDSM.length > 0) {
      setEngagementGroups(manualBigEGsFromDSM);
      const newConceptualMapDrawers = manualBigEGsFromDSM.map((_, index) => {
        const newConceptualMapDrawer: ConceptualMapDrawer = new ConceptualMapDrawer(
          `.${conceptualMapDivClassName}-${index}`,
          svgWidth,
          svgWidth,
          props.participantDict,
          handleSvgClick
        );
        if (conceptualMapDrawers.length > 0) {
          conceptualMapDrawers.forEach((drawer) => drawer.removeDrawing());
        }
        return newConceptualMapDrawer;
      });

      setConceptualMapDrawers(newConceptualMapDrawers);
    }
  }, [dataStructureManager, manualBigEGsFromDSM]);

  useEffect(() => {
    if (
      conceptualMapDrawers.length > 0 &&
      combinedEGsMaker &&
      manualBigEGsFromDSM.length > 0
    ) {
      let dataIndex = 0;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 10; j++) {
          drawGraph(dataIndex, relationships[i % 4]);
          dataIndex++;
        }
      }
    }
  }, [conceptualMapDrawers, combinedEGsMaker, manualBigEGsFromDSM]);

  useEffect(() => {
    if (!dataStructureManager) {
      if (
        debateNameOfQuery === "sample" ||
        debateNameOfQuery === "기본소득" ||
        debateNameOfQuery === "정시확대" ||
        debateNameOfQuery === "모병제" ||
        debateNameOfQuery === "기본소득clipped" ||
        debateNameOfQuery === "정시확대clipped" ||
        debateNameOfQuery === "모병제clipped"
      ) {
        const dataImporter = new DataImporter(
          debateNameOfQuery,
          termTypeOfQuery
        );

        const dataStructureMaker = new DataStructureManager(
          debateNameOfQuery,
          dataImporter.debateDataSet!
        );

        const combinedEGsMaker = new CombinedEGsMaker(
          dataStructureMaker.dataStructureSet.similarityBlockManager.similarityBlockGroup,
          dataImporter.debateDataSet!.utteranceObjects
        );
        dispatch({
          type: CHANGE_STANDARD_SIMILARITY_SCORE,
          payload: {
            standardSimilarityScore:
              dataStructureMaker.dataStructureSet.maxSimilarityScore,
          },
        });

        setDebateDataset(dataImporter.debateDataSet);
        setDataStructureManager(dataStructureMaker);
        setCombinedEGsMaker(combinedEGsMaker);
        setEvaluationDataSet(dataImporter.evaluationDataSet);
      }
    }
  }, []);

  return (
    <>
      <div className={styles.conceptualMapModalContent} ref={modalRef}>
        <div
          className="concept-recurrence-plot"
          style={{
            marginLeft: "0px",
            display: "fle-direction",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {Array.from({ length: 1 }).map((_, relationshipIndex) => {
            return (
              <div key={relationshipIndex} style={{ display: "flex" }}>
                <div
                  style={{
                    //border: "1.5px solid black",
                    width: "50px", // 작은 직사각형의 너비를 조절하세요.
                    height: svgWidth * 1.3, // 작은 직사각형의 높이를 조절하세요.
                    alignItems: "center",
                    flexDirection: "column",
                    justifyContent: "center",
                    display: "flex",
                    margin: "5px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  박휘락
                  <br />
                  &
                  <br />
                  장경태
                </div>
                {Array.from({ length: 10 }).map((_, index) => {
                  const dataIndex = relationshipIndex * 10 + index;
                  return (
                    <div
                      style={{
                        border: "1.5px solid black",
                        width: svgWidth * 1.03,
                        height: svgWidth * 1.3,
                        alignItems: "center",
                        margin: "3px",
                      }}
                      key={dataIndex}
                      data-index={dataIndex}
                      className={`divSelection ${conceptualMapDivClassName}-${dataIndex}`}
                    >
                      <div className="topicPos">{modalTitle}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <CirclePackingModal
        ref={circlePackingMapModalRef}
        participantDict={props.participantDict}
        utteranceObjects={props.utteranceObjects}
        termType={props.termType}
        relationships={relationships}
        dataStructureManager={props.dataStructureManager}
      />
    </>
  );
}

export default forwardRef(ConceptualMapModal);
