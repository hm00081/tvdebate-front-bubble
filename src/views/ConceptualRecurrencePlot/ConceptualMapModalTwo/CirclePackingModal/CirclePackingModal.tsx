import React, {
  Ref,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import styles from "./CirclePackingModal.module.scss";
import { ConceptualMapDrawer } from "../ConceptualMapDrawer";
import { GraphDataStructureMaker } from "../GraphDataStructureMaker";
import * as math from "mathjs";
import { SimilarityBlock, UtteranceObjectForDrawing } from "../../interfaces";
import DataImporter, { DebateName, TermType } from "../../DataImporter";
import {
  DebateDataSet,
  UtteranceObject,
  EvaluationDataSet,
} from "../../../../interfaces/DebateDataInterface";
import { ParticipantDict } from "../../../../common_functions/makeParticipants";
import { Modal } from "antd";
import { DataStructureManager } from "../../DataStructureMaker/DataStructureManager";

const modalContentWidth: number = 800;
const modalContentHeight: number = 600;
const CirclePackingMapDivClassName: string = "conceptual-map";

export interface CirclePackingModalRef {
  openModal: (
    selectedSvgIndex: number,
    engagementGroup: SimilarityBlock[][]
  ) => void;
}

interface CirclePackingModalProps {
  participantDict: ParticipantDict;
  utteranceObjects: UtteranceObject[];
  termType: TermType;
  relationships: string[][];
  dataStructureManager: DataStructureManager;
}

function CirclePackingModal(
  props: CirclePackingModalProps,
  ref: Ref<CirclePackingModalRef>
) {
  const modalRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // ConceptualMapModal에서 사용한 변수들
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerWidth);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const modalPadding = 24;
  const maxOfLinksPerNode = 3;
  const showNodeNotHavingLinks = true;
  const [selectedSvgIndex, setSelectedSvgIndex] = useState(0);
  const [
    conceptualMapDrawer,
    setConceptualMapDrawer,
  ] = useState<ConceptualMapDrawer | null>(null);
  const [engagementGroup, setEngagementGroup] = useState<SimilarityBlock[][]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const circlePackingMapDivRef = useRef<HTMLDivElement>(null);
  const getCirclePackingMapDivClassName = () => {
    return `${CirclePackingMapDivClassName}-${selectedSvgIndex}`;
  };
  const circlePackingMapDivId = `circle-packing-map-div-${selectedSvgIndex}`;
  const handleWindowResize = () => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerWidth);
  };

  useEffect(() => {
    if (
      props.dataStructureManager &&
      props.dataStructureManager.datasetOfManualEGs
    ) {
      // dataStructureManager를 사용하는 코드
      console.log(
        props.dataStructureManager.datasetOfManualEGs.manualBigEGTitles
      );
    } else {
      console.log("dataStructureManager or datasetOfManualEGs is null");
    }
  }, [props.dataStructureManager]);

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  useImperativeHandle(ref, () => ({
    openModal: (
      selectedSvgIndex: number,
      engagementGroup: SimilarityBlock[][]
    ) => {
      console.log("openModal called with index:", selectedSvgIndex);
      setCurrentIndex(selectedSvgIndex);
      setModalVisible(true);
      setSelectedSvgIndex(selectedSvgIndex);
      setEngagementGroup(engagementGroup);
    },
  }));

  useEffect(() => {
    if (modalVisible && selectedSvgIndex >= 0 && engagementGroup) {
      console.log("Drawing graph for index:", selectedSvgIndex);
      const modalPadding = 24;
      const conrollerWidth = 200;

      if (conceptualMapDrawer) {
        conceptualMapDrawer.removeDrawing();
      }

      const newConceptualMapDrawer = new ConceptualMapDrawer(
        `#${circlePackingMapDivId}`,
        modalContentWidth - modalPadding * 2 - conrollerWidth,
        modalContentHeight - modalPadding * 2,
        props.participantDict
      );
      setConceptualMapDrawer(newConceptualMapDrawer);

      const graphDataStructureMaker = new GraphDataStructureMaker(
        engagementGroup,
        props.participantDict,
        props.utteranceObjects,
        props.termType
      );

      const cooccurrenceMatrixOfEG = graphDataStructureMaker.getCooccurrenceMatrixOfEG();
      let ceiledMedian = 0;
      try {
        ceiledMedian = Math.ceil(math.mean(cooccurrenceMatrixOfEG));
      } catch (error) {}

      const nodeLinkDict = graphDataStructureMaker.generateNodesAndLinks(
        ceiledMedian,
        maxOfLinksPerNode,
        showNodeNotHavingLinks
      );

      if (conceptualMapDrawer) {
        conceptualMapDrawer.setGraphData(nodeLinkDict);
        conceptualMapDrawer.updateGraph();
      }
    }
  }, [modalVisible, selectedSvgIndex, engagementGroup, circlePackingMapDivId]);

  useEffect(() => {
    // 그려지는 상황인가??
    if (conceptualMapDrawer) {
      conceptualMapDrawer.setParticipantDict(props.participantDict);
    }
  }, [props.participantDict]);

  return (
    <Modal
      title={
        props.dataStructureManager &&
        props.dataStructureManager.datasetOfManualEGs
          ? props.dataStructureManager.datasetOfManualEGs.manualBigEGTitles[
              selectedSvgIndex
            ]
          : "Loading..."
      }
      width={modalContentWidth}
      bodyStyle={{ height: modalContentHeight, position: "relative" }}
      open={modalVisible}
      onCancel={() => {
        setModalVisible(false);
        if (circlePackingMapDivRef.current) {
          circlePackingMapDivRef.current.innerHTML = "";
        }
        if (conceptualMapDrawer) {
          conceptualMapDrawer.removeDrawing();
          setConceptualMapDrawer(null);
        }
      }}
      maskClosable={false}
    >
      <div ref={modalRef}>
        <div className={styles.modalContent}>
          <div ref={circlePackingMapDivRef} id={circlePackingMapDivId}></div>
        </div>
      </div>
    </Modal>
  );
}

export default forwardRef(CirclePackingModal);
