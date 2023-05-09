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
import { ConceptualMapDrawer, HierarchyDatum } from "../ConceptualMapDrawer";
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
import * as d3 from "d3";
import TranscriptViewer from "../../TranscriptViewer/TranscriptViewer";
import { makeManualMTGs } from "../../DataStructureMaker/makeManualEGs";

const modalContentWidth: number = 1200;
const modalContentHeight: number = 600;
const CirclePackingMapDivClassName: string = "conceptual-map";

export interface CirclePackingModalRef {
  openModal: (
    selectedSvgIndex: number,
    engagementGroup: SimilarityBlock[][]
    //engagementGroupTwo: SimilarityBlock[][]
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
  const circlePackingMapDivId = `circle-packing-map-div-${selectedSvgIndex}`;
  const barChartDivRef = useRef<HTMLDivElement>(null);
  const barChartDivId = `bar-chart-div-${selectedSvgIndex}`;
  const transcriptViewerRef = useRef<typeof TranscriptViewer>(null);
  const [circleKeywords, setCircleKeywords] = useState<string[] | null>(null);
  const [circleData, setCircleData] = useState<
    d3.HierarchyCircularNode<HierarchyDatum>[]
  >([]);

  interface CombinedIndexMap {
    [key: number]: number;
  }

  let combinedIndexMap: CombinedIndexMap = {
    0: 18,
    15: 37,
    24: 58,
    56: 79,
    73: 106,
    94: 126,
    146: 183,
  };

  const handleWindowResize = () => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerWidth);
  };

  useEffect(() => {
    if (
      selectedSvgIndex >= 0 &&
      selectedSvgIndex < Object.keys(combinedIndexMap).length
    ) {
      let startIndex = parseInt(
        Object.keys(combinedIndexMap)[selectedSvgIndex]
      );
      let endIndex = combinedIndexMap[startIndex] - 1;

      console.log(startIndex, endIndex);
      <TranscriptViewer
        dataStructureMaker={props.dataStructureManager}
        selectedRange={{
          startIndex: startIndex,
          endIndex: endIndex,
        }}
      />;
    }
  }, [selectedSvgIndex]);

  useEffect(() => {
    if (
      props.dataStructureManager &&
      props.dataStructureManager.datasetOfManualEGs
    ) {
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
      //engagementGroupTwo: SimilarityBlock[][]
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
      const circlePackingMapDivId = `circle-packing-map-div-${selectedSvgIndex}`;

      if (conceptualMapDrawer) {
        conceptualMapDrawer.removeDrawing();
      }

      const newConceptualMapDrawer = new ConceptualMapDrawer(
        `#${circlePackingMapDivId}`,
        modalContentWidth,
        modalContentHeight,
        props.participantDict
      );
      console.log("ConceptualMapDrawer data:", engagementGroup);
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
        conceptualMapDrawer.updateGraph().then(() => {
          const nodeSizeMultiplierOnModal = 5;
          const fontSizeMultiplierOnModal = 3;
          const positionScalingFactor = 0.7;

          const circleData = conceptualMapDrawer.circlePackingGSelection
            .selectAll<SVGGElement, d3.HierarchyCircularNode<HierarchyDatum>>(
              "g.filtered-leavess-group"
            )
            .selectAll<
              SVGCircleElement,
              d3.HierarchyCircularNode<HierarchyDatum>
            >("circle")
            .data();

          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;

          circleData.forEach((node) => {
            const cx = node.x;
            const cy = node.y;
            const r = node.data.count;
            minX = Math.min(minX, cx - r);
            minY = Math.min(minY, cy - r);
            maxX = Math.max(maxX, cx + r);
            maxY = Math.max(maxY, cy + r);
          });

          const dataWidth = maxX - minX;
          const dataHeight = maxY - minY;

          conceptualMapDrawer
            .svgSelection!.attr("width", modalContentWidth - 470)
            .attr("height", modalContentHeight - 30)
            .attr("viewBox", `${minX} ${minY} ${dataWidth} ${dataHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

          conceptualMapDrawer.circlePackingGSelection
            .selectAll<SVGGElement, d3.HierarchyCircularNode<HierarchyDatum>>(
              "g.filtered-leavess-group"
            )
            .selectAll<
              SVGCircleElement,
              d3.HierarchyCircularNode<HierarchyDatum>
            >("circle")
            .attr("r", (d) => d.data.count * nodeSizeMultiplierOnModal + 2);
          //.attr("cx", (d) => d.x * positionScalingFactor)
          //.attr("cy", (d) => d.y * positionScalingFactor);

          conceptualMapDrawer.circlePackingGSelection
            .selectAll<SVGGElement, d3.HierarchyCircularNode<HierarchyDatum>>(
              "g.filtered-leavess-group"
            )
            .selectAll<
              SVGTextElement,
              d3.HierarchyCircularNode<HierarchyDatum>
            >("text")
            //.attr("x", (d) => d.x * positionScalingFactor)
            .attr("y", (d) => {
              const radius = d.data.count * nodeSizeMultiplierOnModal;
              const fontSize = d.data.count * fontSizeMultiplierOnModal * 0.8;
              const radiusFactor = 1; // 원의 반지름에 대한 비율을 조정합니다.
              const fontSizeFactor = 1; // font-size에 대한 비율을 조정합니다.

              return (
                d.y + radius * radiusFactor + fontSize * fontSizeFactor + 9
              );
            })
            .style("font-size", (d) => {
              if (d.data.count > 3) {
                // return d.data.count * nodeSizeMultiplierOnModal * 0.8;
                return 12;
              } else {
                // return d.data.count * nodeSizeMultiplierOnModal * 1.3;
                return 12;
              }
            });
        });

        const circleData = conceptualMapDrawer.circlePackingGSelection
          .selectAll<SVGGElement, d3.HierarchyCircularNode<HierarchyDatum>>(
            "g.filtered-leavess-group"
          )
          .selectAll<
            SVGCircleElement,
            d3.HierarchyCircularNode<HierarchyDatum>
          >("circle")
          .data();

        setCircleData(circleData);
        // circleData에서 keyword만 추출하여 배열로 만들기
        const extractedKeywords = circleData.map((node) => node.data.id);

        // 상태 변수를 설정
        setCircleKeywords(extractedKeywords);

        const countById = new Map<string, number>();

        circleData.forEach((circleNode) => {
          const parentId = circleNode.parent?.data.id;
          if (parentId) {
            const currentCount = countById.get(parentId) || 0;
            countById.set(parentId, currentCount + circleNode.data.count);
          }
        });
        drawBarChart(countById, selectedSvgIndex);
      }
    }
  }, [modalVisible, selectedSvgIndex, engagementGroup]);
  //console.log(engagementGroup);
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
        if (barChartDivRef.current) {
          barChartDivRef.current.innerHTML = ""; // 이 부분을 추가하여 이전 바 차트를 지웁니다.
        }
        if (conceptualMapDrawer) {
          conceptualMapDrawer.removeDrawing();
          setConceptualMapDrawer(null);
        }
        // 이 부분을 추가하여 이전 서클 패킹 그래프를 지웁니다.
        if (svgRef.current) {
          d3.select(svgRef.current).selectAll("*").remove();
        }
      }}
      maskClosable={false}
    >
      <div ref={modalRef}>
        <div
          style={{
            display: "flex",
            //alignItems: "center",
            flexDirection: "column",
            justifyContent: "space-around",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <div
              style={{ marginLeft: "110px", transform: "translateX(0px)" }}
              ref={circlePackingMapDivRef}
              id={circlePackingMapDivId}
            ></div>
            <div
              style={{
                width: "133px",
                marginLeft: "0px",
                marginRight: "400px",
              }}
              ref={barChartDivRef}
              id={barChartDivId}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "10px",
                  textAnchor: "middle",
                  textAlign: "center",
                }}
              >
                논쟁키워드 총량
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                right: 0,
                height: "565px",
                overflow: "auto", // 추가
                maxHeight: "565px",
              }}
            >
              <TranscriptViewer
                ref={transcriptViewerRef}
                dataStructureMaker={props.dataStructureManager}
                selectedRange={{
                  startIndex:
                    selectedSvgIndex >= 0
                      ? parseInt(
                          Object.keys(combinedIndexMap)[selectedSvgIndex]
                        )
                      : -1,
                  endIndex:
                    selectedSvgIndex >= 0 &&
                    selectedSvgIndex < Object.keys(combinedIndexMap).length
                      ? combinedIndexMap[
                          parseInt(
                            Object.keys(combinedIndexMap)[selectedSvgIndex]
                          )
                        ] - 1
                      : -1,
                }}
                circleKeywords={circleKeywords}
                circleData={circleData}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default forwardRef(CirclePackingModal);

function drawBarChart(
  countById: Map<string, number>,
  selectedSvgIndex: number
) {
  // 바 차트를 그리기 위한 설정
  const barChartWidth = 120;
  const barChartHeight = 550;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const barChartDivId = `bar-chart-div-${selectedSvgIndex}`;

  d3.select(`#${barChartDivId}`).select("svg").remove();
  // 바 차트의 SVG 요소 설정
  const barChartSvg = d3
    .select(`#${barChartDivId}`)
    .append("svg")
    .attr("width", barChartWidth)
    .attr("height", barChartHeight);

  const xScale = d3
    .scaleBand()
    .domain(Array.from(countById.keys()))
    .range([margin.left, barChartWidth - margin.right])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, Math.max(...Array.from(countById.values()))])
    .range([barChartHeight - margin.bottom, margin.top]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickSizeInner(2);

  barChartSvg
    .append("g")
    .attr("transform", `translate(0, ${barChartHeight - margin.bottom})`)
    .call(xAxis)
    .style("font-weight", "bold");

  barChartSvg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .style("font-size", "8.2px")
    .style("font-weight", "bold")
    .call(yAxis);

  // 바 차트의 막대 그리기
  // 막대를 위한 데이터를 바인딩하고, 막대의 속성을 설정합니다.
  const bars = barChartSvg
    .selectAll("rect")
    .data(Array.from(countById.entries()));
  //console.log(countById.entries());
  bars
    .enter()
    .append("rect")
    //@ts-ignore
    .merge(bars)
    .attr("x", (d) => xScale(d[0]) ?? 0) // 이름에 따른 x 좌표 설정
    .attr("y", (d) => yScale(d[1]) ?? 0) // 카운트에 따른 y 좌표 설정
    .attr("height", (d) =>
      //@ts-ignore
      Math.max(0, barChartHeight - margin.bottom - yScale(d[1]))
    ) // 막대의 높이 설정
    .attr("width", xScale.bandwidth()) // 막대의 너비 설정
    .attr("fill", (d) => {
      const name = d[0];

      switch (name) {
        case "이준석":
          return "#B60E3C";
        case "장경태":
          return "#00a0e2";
        case "박휘락":
          return "#C7611E";
        case "김종대":
          return "#00AB6E";
        default:
          return "rgb(251,154,153)";
      }
    });
  bars.exit().remove(); // 불필요한 막대 제거
}

function calculateIndexRanges(
  datasetOfManualEGs: any[][]
): { startIndex: number; endIndex: number }[] {
  let ranges = [];
  let startIndex = 0;

  for (let i = 0; i < datasetOfManualEGs.length; i++) {
    const endIndex = startIndex + datasetOfManualEGs[i].length - 1;
    ranges.push({ startIndex, endIndex });
    startIndex = endIndex + 1;
  }

  return ranges;
}
