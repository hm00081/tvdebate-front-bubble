/* eslint-disable no-unused-vars */
import React, {
  Ref,
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
} from "react";
import "./ConceptualRecurrencePlot.scss";
import _ from "lodash";
import { SimilarityBlock, UtteranceObjectForDrawing } from "./interfaces";
import { makeEngagementGroups } from "./DataStructureMaker/makeEngagementGroups";
import { D3Drawer } from "./Drawers/D3Drawer";
import ConceptualMapModal from "./ConceptualMapModal/ConceptualMapModal";
import Controllers from "./Controllers/Controllers";
import store from "../../redux/store";
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
import ConceptualMapControllers from "../ConceptualRecurrencePlot/ConceptualMapModal/ConceptualMapControllers/ConceptualMapControllers";
import { ConceptualMapDrawer } from "./ConceptualMapModal/ConceptualMapDrawer";
import { GraphDataStructureMaker } from "./ConceptualMapModal/GraphDataStructureMaker";
import * as math from "mathjs";
import { ParticipantDict } from "../../common_functions/makeParticipants";
import { UtteranceObject } from "../../interfaces/DebateDataInterface";
import { Modal } from "antd";
import styles from "../ConceptualRecurrencePlot/ConceptualMapModal/ConceptualMapModal.module.scss";

const modalContentWidth: number = 800;
const modalContentHeight: number = 600;
const conceptualMapDivClassName: string = "conceptual-map";

export interface ConceptualMapModalRef {
  openModal: (modalTitle: string, engagementGroup: SimilarityBlock[][]) => void;
}
interface ComponentProps {
  participantDict: ParticipantDict;
  utteranceObjects: UtteranceObject[];
  termUtteranceBooleanMatrixTransposed: number[][];
  termList: string[];
  termType: TermType;
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

  useEffect(() => {
    const modalPadding = 24;
    const controllerWidth = 200;
    setConceptualMapDrawer(
      new ConceptualMapDrawer(
        `.${conceptualMapDivClassName}`,
        modalContentWidth - modalPadding * 2 - controllerWidth,
        modalContentHeight - modalPadding * 2,
        props.participantDict
      )
    );
  }, []); // deps

  useEffect(() => {
    if (conceptualMapDrawer) {
      conceptualMapDrawer.setParticipantDict(props.participantDict);
    }
  }, [props.participantDict]);

  useEffect(() => {
    openModal: (modalTitle: string, engagementGroup: SimilarityBlock[][]) => {
      setModalVisible(true);
      setModalTitle(modalTitle);
      // console.log("engagementGroup", engagementGroup);
      conceptualMapDrawer!.removeDrawing();

      const graphDataStructureMaker = new GraphDataStructureMaker(
        engagementGroup,
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
      // console.log("nodeLinkDict", nodeLinkDict);

      conceptualMapDrawer!.setGraphData(nodeLinkDict);
      conceptualMapDrawer!.updateGraph();

      const maxCooccurrence = _.max(
        _.map(
          cooccurrenceMatrixOfEG,
          (cooccurrenceVector) => _.orderBy(cooccurrenceVector, [], ["desc"])[1] // TODO [0] or [1]
        )
      ) as number;

      setStandardTermCountToGenerateNode(ceiledMedian);
      setMaxCooccurrence(maxCooccurrence);
      setGraphDataStructureMaker(graphDataStructureMaker);
    };
  });

  // Import Debate Data
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
        // const debateDataset = new DataImporter(
        //   debateNameOfQuery,
        //   termTypeOfQuery
        // ).debateDataSet as DebateDataSet;
        const dataImporter = new DataImporter(
          debateNameOfQuery,
          termTypeOfQuery
        );

        const dataStructureMaker = new DataStructureManager(
          debateNameOfQuery,
          dataImporter.debateDataSet!
        );

        // console.log("dataImporter", dataImporter);
        // console.log("dataStructureMaker", dataStructureMaker);

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
      const conceptSimilarityBlocks =
        dataStructureSet.similarityBlockManager.similarityBlocks;
      const conceptSimilarityMatrix =
        dataStructureSet.similarityBlockManager.similarityBlockGroup;
      const manualBigEGs = datasetOfManualEGs.manualBigEGs;
      const manualBigEGTitles = datasetOfManualEGs.manualBigEGTitles;
      const manualMiddleEGs = datasetOfManualEGs.manualMiddleEGs;
      const manualMiddleEGTitles = datasetOfManualEGs.manualMiddleEGTitles;
      const manualSmallEGs = datasetOfManualEGs.manualSmallEGs;
      const manualSmallEGTitles = datasetOfManualEGs.manualSmallEGTitles;
      const manualFullEGs = datasetOfManualEGs.manualFullEGs;
      const manualFullEGTitles = datasetOfManualEGs.manualFullEGTitles;
      const maxSimilarityScore = dataStructureSet.maxSimilarityScore;
      const topicGroups = combinedEGsMaker!.makeByNumOfSegments(4);

      // settings of d3Drawer
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
        // console.log("mouseEvent", tooltipDatum);
        // setTooltipDatum({
        //   utteranceObjectForDrawing,
        //   transform: tooltipDatum.transform,
        //   visible: true,
        // });

        setMouseoveredUtterance(utteranceObjectForDrawing);
        setTooltipVisible(true);
      };
      d3Drawer.participantBlocksDrawer.mouseoutLisener = () => {
        // setTooltipDatum({
        //   ...tooltipDatum,
        //   visible: false,
        // });
      };

      // Engagement Group Drawer's Settings
      d3Drawer.topicGroupsDrawer.topicGroups = topicGroups;
      d3Drawer.topicGroupsDrawer.onTitleClicked = (
        mouseEvent: MouseEvent,
        engagementGroup: SimilarityBlock[][],
        engagementGroupIndex: number
      ) => {
        // conceptualMapModalRef.current?.openModal(
        //   `Engagement Group ${engagementGroupIndex}`,
        //   engagementGroup
        // );
        const extractedKeytermObjects = extractKeytermsFromEngagementGroup(
          engagementGroup,
          debateDataset.conceptMatrixTransposed,
          debateDataset.keytermObjects,
          10
        );

        conceptualMapModalRef.current?.openModal(
          `${_.map(extractedKeytermObjects, (o) => o.name)}`,
          engagementGroup
        );
      };
      d3Drawer.topicGroupsDrawer.visible = false;

      // Manual Small Engagement Group Drawer's Settings
      d3Drawer.manualSmallTGsDrawer.topicGroups = manualSmallEGs;
      d3Drawer.manualSmallTGsDrawer.topicGroupTitles = manualSmallEGTitles;
      d3Drawer.manualSmallTGsDrawer.onTitleClicked = (
        mouseEvent: MouseEvent,
        engagementGroup: SimilarityBlock[][],
        engagementGroupIndex: number
      ) => {
        conceptualMapModalRef.current?.openModal(
          `Manual Small Engagement Group ${engagementGroupIndex}`,
          engagementGroup
        );
      };
      d3Drawer.manualSmallTGsDrawer.visible = false;

      // Manual Middle Engagement Group Drawer's Settings
      d3Drawer.manualMiddleTGsDrawer.topicGroups = manualMiddleEGs;
      d3Drawer.manualMiddleTGsDrawer.topicGroupTitles = manualMiddleEGTitles;
      d3Drawer.manualMiddleTGsDrawer.onTitleClicked = (
        mouseEvent: MouseEvent,
        engagementGroup: SimilarityBlock[][],
        engagementGroupIndex: number
      ) => {
        conceptualMapModalRef.current?.openModal(
          `${manualMiddleEGTitles[engagementGroupIndex]}`,
          engagementGroup
        );
      };
      d3Drawer.manualMiddleTGsDrawer.visible = true;

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
      d3Drawer.manualBigTGsDrawer.visible = true;

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

      d3Drawer.centerConceptualRecurrentPlot();
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
    <div className="root-div">
      <Header />
      {/* <div ref={modalRef}></div> */}
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
      ></ConceptualMapModal>
      <ParticipantTooltip
        utteranceObjectForDrawing={mouseoveredUtterance}
        transform={transform}
        visible={tooltipVisible}
        d3Drawer={d3Drawer}
        debateDataset={debateDataset}
      />
      {/* <TranscriptViewer
        dataStructureMaker={dataStructureManager}
      ></TranscriptViewer> */}
    </div>
  );
}

export default ConceptualRecurrencePlot;
