/* eslint-disable no-unused-vars */
import React, {
  Ref,
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import "./ConceptualRecurrencePlot.scss";
import _ from "lodash";
import { SimilarityBlock, UtteranceObjectForDrawing } from "./interfaces";
import { makeEngagementGroups } from "./DataStructureMaker/makeEngagementGroups";
import { D3Drawer } from "./Drawers/D3Drawer";
import ConceptualMapModal from "./ConceptualMapModal/ConceptualMapModal";
import { groupEGsMaker } from "./DataStructureMaker/GroupEGsMaker";
import { useLocation } from "react-router-dom";
import TranscriptViewer from "./TranscriptViewer/TranscriptViewer";
import { CombinedState } from "redux";
import { useDispatch, useSelector } from "react-redux";
import { StandardSimilarityScoreState } from "../../redux/reducers/standardSimilarityScoreReducer";
import {
  DebateDataSet,
  EvaluationDataSet,
} from "../../interfaces/DebateDataInterface";
import { DataStructureManager } from "./DataStructureMaker/DataStructureManager";
import DataImporter, { DebateName, TermType } from "./DataImporter";
import { CHANGE_STANDARD_SIMILARITY_SCORE } from "../../redux/actionTypes";
import CombinedEGsMaker from "./DataStructureMaker/CombinedEGsMaker";
import { extractKeytermsFromEngagementGroup } from "./DataStructureMaker/extractTermsFromEngagementGroup";
import ParticipantTooltip from "../../components/ParticipantTooltip/ParticipantTooltip";
import Header from "../Header/Header";
import style from "./rootStyle.module.scss";
//import ConceptualMapControllers from "./ConceptualMapModal/ConceptualMapControllers/ConceptualMapControllers";
import { ConceptualMapDrawer } from "./ConceptualMapModal/ConceptualMapDrawer";
import { GraphDataStructureMaker } from "./ConceptualMapModal/GraphDataStructureMaker";
import * as math from "mathjs";
import { ParticipantDict } from "../../common_functions/makeParticipants";
import { UtteranceObject } from "../../interfaces/DebateDataInterface";
import ConceptualRecurrencePlotTwo from "./ConceptualRecurrencePlotThree";

const modalContentWidth: number = 800;
const modalContentHeight: number = 600;
const conceptualMapDivClassName: string = "conceptual-map";

export interface ConceptualMapModalRef {
  openModal: (modalTitle: string, engagementGroup: SimilarityBlock[][]) => void;
}
interface ComponentProps {
  engagementGroup?: SimilarityBlock[][];
  participantDict: ParticipantDict;
  utteranceObjects: UtteranceObject[];
  termUtteranceBooleanMatrixTransposed: number[][];
  termList: string[];
  termType: TermType;
  drawGraph: (index: number, engagementGroup: SimilarityBlock[][]) => void;
  manualBigEGs: SimilarityBlock[][][]; // 추가
}

function ConceptualRecurrencePlot(
  props: ComponentProps,
  ref: Ref<ConceptualMapModalRef>
) {
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
  const [d3Drawer, setD3Drawer] = useState<D3Drawer | null>(null);
  const conceptualMapModalRef = React.useRef<ConceptualMapModalRef>(null);
  const conceptualMapModalRefTwo = React.useRef<ConceptualMapModalRef>(null);
  const [manualBigEGs, setManualBigEGs] = useState<SimilarityBlock[][][]>([]);
  const [engagementGroup, setEngagementGroup] = useState<SimilarityBlock[][]>(
    []
  );
  const standardSimilarityScore = useSelector<
    CombinedState<{
      standardSimilarityScoreReducer: StandardSimilarityScoreState;
    }>,
    number
  >((state) => state.standardSimilarityScoreReducer.standardSimilarityScore);
  const dispatch = useDispatch();

  // variables for tooltip
  const [
    mouseoveredUtterance,
    setMouseoveredUtterance,
  ] = useState<UtteranceObjectForDrawing | null>(null);
  const [transform, setTransform] = useState<d3.ZoomTransform | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  // 0226
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [conceptualMapDrawer, setConceptualMapDrawer] = useState<
    ConceptualMapDrawer
  >();
  const [graphDataStructureMaker, setGraphDataStructureMaker] = useState<
    GraphDataStructureMaker
  >();
  const [showNodeNotHavingLinks, setShowNodeNotHavingLinks] = useState<boolean>(
    true
  );
  const [
    standardTermCountToGenerateNode,
    setStandardTermCountToGenerateNode,
  ] = useState<number>(0);
  const [maxOfLinksPerNode, setMaxOfLinksPerNode] = useState<number>(3);
  const [maxCooccurrence, setMaxCooccurrence] = useState<number>(0);
  const [conceptualMapDrawers, setConceptualMapDrawers] = useState<
    ConceptualMapDrawer[]
  >([]);

  const drawGraph = (index: number, engagementGroup: SimilarityBlock[][]) => {
    const conceptualMapDrawer = conceptualMapDrawers[index];

    conceptualMapDrawer!.removeDrawing();

    const graphDataStructureMaker = new GraphDataStructureMaker(
      engagementGroup,
      props.participantDict,
      props.utteranceObjects,
      props.termType
    );

    // manualBigEGs를 활용하는 로직
    // 안나옴
    const selectedManualBigEG = manualBigEGs[index];
    console.log(selectedManualBigEG);
    for (let i = 0; i < selectedManualBigEG.length; i++) {
      const engagementGroupManual = selectedManualBigEG[i];
      engagementGroup.push(engagementGroupManual); // manualBigEG를 기존 engagementGroup에 추가
    }

    const cooccurrenceMatrixOfEG = graphDataStructureMaker.getCooccurrenceMatrixOfEG();
    const ceiledMedian = Math.ceil(math.mean(cooccurrenceMatrixOfEG));

    const nodeLinkDict = graphDataStructureMaker.generateNodesAndLinks(
      ceiledMedian,
      maxOfLinksPerNode,
      showNodeNotHavingLinks
    );

    conceptualMapDrawer!.setGraphData(nodeLinkDict);
    conceptualMapDrawer!.updateGraph();
    console.log("drawGraph 함수 호출됨");
  };

  const drawGraphTwo = (
    index: number,
    engagementGroup: SimilarityBlock[][]
  ) => {
    const conceptualMapDrawer = conceptualMapDrawers[index];

    conceptualMapDrawer!.removeDrawing();

    const graphDataStructureMaker = new GraphDataStructureMaker(
      engagementGroup,
      props.participantDict,
      props.utteranceObjects,
      props.termType
    );

    // manualBigEGs를 활용하는 로직
    // 안나옴
    const selectedManualBigEG = manualBigEGs[index];
    console.log(selectedManualBigEG);
    for (let i = 0; i < selectedManualBigEG.length; i++) {
      const engagementGroupManual = selectedManualBigEG[i];
      engagementGroup.push(engagementGroupManual); // manualBigEG를 기존 engagementGroup에 추가
    }

    const cooccurrenceMatrixOfEG = graphDataStructureMaker.getCooccurrenceMatrixOfEG();
    const ceiledMedian = Math.ceil(math.mean(cooccurrenceMatrixOfEG));

    const nodeLinkDict = graphDataStructureMaker.generateNodesAndLinks(
      ceiledMedian,
      maxOfLinksPerNode,
      showNodeNotHavingLinks
    );

    conceptualMapDrawer!.setGraphData(nodeLinkDict);
    conceptualMapDrawer!.updateGraph();
    console.log("drawGraph 함수 호출됨");
  };

  useEffect(() => {
    if (conceptualMapDrawer && combinedEGsMaker) {
      const engagementGroupIndex = 0;
      const engagementGroup = combinedEGsMaker.makeByNumOfSegments(40)[
        engagementGroupIndex
      ];
      const extractedKeytermObjects = extractKeytermsFromEngagementGroup(
        engagementGroup,
        debateDataset!.conceptMatrixTransposed,
        debateDataset!.keytermObjects,
        8
      );
    }
  }, [conceptualMapDrawer, combinedEGsMaker]);

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

  useEffect(() => {
    if (dataStructureManager && debateDataset) {
      const dataStructureSet = dataStructureManager.dataStructureSet;
      const datasetOfManualEGs = dataStructureManager.datasetOfManualEGs;
      const manualBigEGs = datasetOfManualEGs.manualBigEGs;
      const manualBigEGTitles = datasetOfManualEGs.manualBigEGTitles;
      const manualFullEGs = datasetOfManualEGs.manualFullEGs;
      const manualFullEGTitles = datasetOfManualEGs.manualFullEGTitles;
      const d3Drawer = new D3Drawer(
        debateDataset,
        dataStructureSet,
        termTypeOfQuery
      );

      d3Drawer.zoomListener = (transform) => {
        setTransform(transform);
      };
      d3Drawer.participantBlocksDrawer.mouseoverListener = (
        mouseEvent,
        utteranceObjectForDrawing
      ) => {
        setMouseoveredUtterance(utteranceObjectForDrawing);
        setTooltipVisible(true);
      };
      d3Drawer.participantBlocksDrawer.mouseoutLisener = () => {};

      // Manual Big Engagement Group Drawer's Settings
      d3Drawer.manualBigTGsDrawer.topicGroups = manualBigEGs;
      d3Drawer.manualBigTGsDrawer.topicGroupTitles = manualBigEGTitles;
      d3Drawer.manualBigTGsDrawer.onTitleClicked = (
        mouseEvent: MouseEvent,
        engagementGroup: SimilarityBlock[][],
        engagementGroupIndex: number
      ) => {
        conceptualMapModalRef.current?.openModal(
          `${manualBigEGTitles[engagementGroupIndex]}`,
          engagementGroup
        );
      };
      d3Drawer.manualBigTGsDrawer.visible = false;

      // Manual Big Engagement Group Drawer's Settings
      d3Drawer.manualFullTGsDrawer.topicGroups = manualFullEGs;
      d3Drawer.manualFullTGsDrawer.topicGroupTitles = manualFullEGTitles;
      d3Drawer.manualFullTGsDrawer.onTitleClicked = (
        mouseEvent: MouseEvent,
        engagementGroup: SimilarityBlock[][],
        engagementGroupIndex: number
      ) => {
        conceptualMapModalRef.current?.openModal(
          `${manualFullEGTitles}`,
          engagementGroup
        );
      };
      d3Drawer.manualFullTGsDrawer.visible = true;

      d3Drawer.manualPeopleTGsDrawer.onTitleClicked = (
        mouseEvent: MouseEvent,
        engagementGroup: SimilarityBlock[][],
        engagementGroupIndex: number
      ) => {
        conceptualMapModalRef.current?.openModal(
          `Manual People Engagement Group ${engagementGroupIndex}`,
          engagementGroup
        );
      };

      //d3Drawer.centerConceptualRecurrentPlot();
      d3Drawer.participantBlocksDrawer.update();
      d3Drawer.insistenceMarkersDrawer.update();
      // similarityBlocksDrawer 그리는 곳
      d3Drawer!.similarityBlocksDrawer.standardHighPointOfSimilarityScore = standardSimilarityScore;
      d3Drawer.similarityBlocksDrawer.update();
      d3Drawer.topicGroupsDrawer.update();
      d3Drawer.manualSmallTGsDrawer.update();
      d3Drawer.manualMiddleTGsDrawer.update();
      d3Drawer.manualBigTGsDrawer.update();
      d3Drawer.manualFullTGsDrawer.update();
      // d3Drawer.manualPeopleTGsDrawer.update();
      // console.log("d3Drawer", d3Drawer);

      setD3Drawer(d3Drawer);
    }
  }, [dataStructureManager, debateDataset]);

  return (
    <>
      <ConceptualMapModal
        ref={conceptualMapModalRef}
        participantDict={
          dataStructureManager
            ? dataStructureManager.dataStructureSet.participantDict
            : {}
        }
        utteranceObjects={debateDataset ? debateDataset.utteranceObjects : []}
        termList={debateDataset ? debateDataset.termList : []}
        termUtteranceBooleanMatrixTransposed={
          debateDataset
            ? debateDataset.termUtteranceBooleanMatrixTransposed
            : []
        }
        termType={termTypeOfQuery}
        drawGraph={(index, engagementGroup) =>
          drawGraph(index, engagementGroup)
        }
        manualBigEGs={manualBigEGs}
        engagementGroup={engagementGroup}
        //@ts-ignore
        dataStructureManager={dataStructureManager}
      ></ConceptualMapModal>
    </>
  );
}

export default ConceptualRecurrencePlot;
//0424 수정
//export default forwardRef(ConceptualRecurrencePlot);
