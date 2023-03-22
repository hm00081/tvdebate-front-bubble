import { ParticipantDict } from "../../../common_functions/makeParticipants";
/* eslint-disable no-unused-vars */
// import { participantDict } from "./../DataStructureMaker/index";
// NodeLink Diagram를 그리기 위한 정보가 들어있는 Drawer Data.ts
import * as d3 from "d3";
import { LinkDatum, NodeDatum, NodeLinkDict } from "./GraphDataStructureMaker";
import { ParticipantCount } from "./TermCountDictOfEGMaker";
import {
  makeArcDAttribute,
  makeDrag,
  makePieData,
  makeSimulation,
  SvgGSelectionsMaker,
} from "./ConceptualMapDrawerInternalFunctions";
import _ from "lodash";
import tinygradient from "tinygradient";

export class ConceptualMapDrawer {
  private conceptualMapDivSelection: null | d3.Selection<
    d3.BaseType,
    unknown,
    HTMLElement,
    any
  > = null;
  private svgSelection: null | d3.Selection<
    SVGSVGElement,
    MouseEvent,
    HTMLElement,
    any
  > = null;
  private svgGSelection: null | d3.Selection<
    SVGGElement,
    DragEvent,
    HTMLElement,
    any
  > = null;
  private linksGSelection!: d3.Selection<
    SVGLineElement,
    LinkDatum,
    SVGGElement,
    unknown
  >;
  private nodesGSelection!: d3.Selection<
    SVGCircleElement | SVGGElement,
    NodeDatum,
    SVGGElement,
    unknown
  >;
  private nodePiesGSelection!: d3.Selection<
    SVGGElement,
    NodeDatum,
    SVGGElement,
    unknown
  >;
  private circlesOfNodePiesGSelection!: d3.Selection<
    SVGGElement,
    NodeDatum,
    SVGGElement,
    unknown
  >;
  private nodeTextsGSelection!: d3.Selection<
    SVGTextElement,
    NodeDatum,
    SVGGElement,
    unknown
  >;
  private _nodeLinkDict: NodeLinkDict | null = null;
  private _nodeSizeMultiplier: number = 1;
  private _sentimentMarkerVisible: boolean = false;
  private gradient = tinygradient(
    { r: 196, g: 67, b: 67 },
    { r: 79, g: 198, b: 66 }
  );

  public constructor(
    private readonly coneptualMapDivClassName: string,
    private readonly svgWidth: number,
    private readonly svgHeight: number,
    private _participantDict: ParticipantDict
  ) {}

  public setGraphData(nodeLinkDict: NodeLinkDict) {
    this._nodeLinkDict = nodeLinkDict;
  }
  public setNodeSizeMultiplier(nodeSizeMultiplier: number) {
    this._nodeSizeMultiplier = nodeSizeMultiplier;
  }
  public setParticipantDict(participantDict: ParticipantDict) {
    this._participantDict = participantDict;
  }
  public set sentimentMarkerVisible(sentimentMarkerVisible: boolean) {
    this._sentimentMarkerVisible = sentimentMarkerVisible;
  }

  public updateGraph() {
    const nodes = this._nodeLinkDict!.nodes;
    const links = this._nodeLinkDict!.links;
    // console.log(nodes, links, "hello");
    const nodeSizeMultiplier = this._nodeSizeMultiplier;
    // select root div
    if (this.conceptualMapDivSelection === null) {
      // div conceptualMapDivClassName
      this.conceptualMapDivSelection = d3.select(this.coneptualMapDivClassName);
    }

    // make SVG and G elements
    if (this.svgSelection === null) {
      const svgGSelectionsMaker = new SvgGSelectionsMaker(
        this.conceptualMapDivSelection,
        this.svgWidth,
        this.svgHeight
      );
      this.svgSelection = svgGSelectionsMaker.appendSvgSelection();
      this.svgGSelection = svgGSelectionsMaker.appendSvgGSelection();
      this.linksGSelection = svgGSelectionsMaker.appendLinksGSelection();
      this.nodePiesGSelection = svgGSelectionsMaker.appendNodePiesGSelection();
      this.circlesOfNodePiesGSelection = svgGSelectionsMaker.appendCirclesOfNodePiesGSelection();
      //@ts-ignore
      this.nodesGSelection = svgGSelectionsMaker.appendNodesGSelection();
      this.nodeTextsGSelection = svgGSelectionsMaker.appendTextsGSelection();
    }

    const simulation = makeSimulation(nodes, links);

    // drag event listener
    const drag = makeDrag();

    // Draw elements
    // Update drawing links
    this.linksGSelection = this.linksGSelection
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.count) / 1.5)
      .text((d) => `${d.count}`);

    // Update drawing nodePies
    this.nodePiesGSelection = this.nodePiesGSelection.data(nodes).join("g");
    const that = this;
    this.nodePiesGSelection.each(function (nodeDatum) {
      //console.log(nodeDatum.participantCounts);
      // plus arcPath = conToVi처럼 영역을 Topic으로 쌓면 재밌을것같음.
      const arcsSelection = d3
        .select(this)
        .selectAll<SVGPathElement, d3.PieArcDatum<ParticipantCount>>("path")
        .data(makePieData(nodeDatum.participantCounts))
        .join("path")
        .attr("fill", (d) => that._participantDict[d.data.name].color)
        .attr("d", (d) => makeArcDAttribute(d, nodeDatum, nodeSizeMultiplier));
      // .sort(function (a, b) {
      //   return d3.descending(a.data.count, b.data.count);
      // });
      // each  = d3-selection 함수., d3 내장
      arcsSelection.each(function (arcDatum) {
        d3.select(this)
          .selectAll<HTMLTitleElement, d3.PieArcDatum<ParticipantCount>>(
            "title"
          )
          .data([arcDatum])
          .join("title")
          .text(
            (d) =>
              `발화자: ${d.data.name}, 발화 횟수: ${d.data.count}, sentiment: ${d.data.sentiment}, test:}`
          );
      });
    });

    // Update drawing sentiment_circles of nodePies
    this.circlesOfNodePiesGSelection = this.circlesOfNodePiesGSelection
      .data(nodes)
      .join("g");
    this.circlesOfNodePiesGSelection.each(function (nodeDatum) {
      // find the circle's position (x, y)
      // supplies: total count, the current count, distance
      // ratio = ((front_counts) + (1/2* current_count) / total_count)
      // x_position = distance * cos(ratio * 2PI)
      // y_position = distance * sin(ratio * 2PI)
      const ratios = _.map(
        nodeDatum.participantCounts,
        (participantCount, i) => {
          const totalCount: number = _.reduce(
            nodeDatum.participantCounts,
            (reduced, participantCount) => reduced + participantCount.count,
            0
          );
          let frontCount: number = 0;
          for (let j = 0; j < i; j++) {
            frontCount += nodeDatum.participantCounts[j].count;
          }
          return (frontCount + participantCount.count / 2) / totalCount;
        }
      );
      const distance = Math.sqrt(nodeDatum.count * nodeSizeMultiplier) + 6;

      const sentimentCirclesSelection = d3
        .select(this)
        .selectAll("circle")
        .data(nodeDatum.participantCounts)
        .join("circle")
        .attr("r", 2)
        .attr(
          "cx",
          (d, i) => Math.cos(2 * Math.PI * ratios[i] - 0.5 * Math.PI) * distance
        )
        .attr(
          "cy",
          (d, i) => Math.sin(2 * Math.PI * ratios[i] - 0.5 * Math.PI) * distance
        )
        .attr("fill", (d) => {
          if (nodeDatum.id === "매출" && d.name === "이재명") {
            console.log("!", d);
          }

          if (d.count > 0 && that._sentimentMarkerVisible) {
            // let scaledSentiment: number;
            // if (d.sentiment > 1) {
            //   scaledSentiment = 1;
            // } else if (d.sentiment < -1) {
            //   scaledSentiment = -1;
            // } else {
            //   scaledSentiment = d.sentiment;
            // }
            // scaledSentiment = scaledSentiment / 2 + 0.5;
            // return that.gradient.rgbAt(scaledSentiment).toHexString();
            // 감성분석 결과 색상 조절.
            // 발화 정도에 따른 세분화해보는 것도 쫗아보임!!!
            if (d.sentiment > 0.75) {
              return "rgba(79, 198, 66, 1)"; // green: 긍정
            } else if (d.sentiment > 0.5) {
              return "rgba(79, 198, 66, 0.5)"; // light-green: 긍정
            } else if (d.sentiment > 0.3) {
              return "rgba(79, 198, 66, 0.3)"; // light-green: 긍정
            } else if (d.sentiment < -0.75) {
              return "rgba(196, 67, 67, 1)"; // red: 부정
            } else if (d.sentiment < -0.5) {
              return "rgba(196, 67, 67, 0.5)"; // light-red: 부정
            } else if (d.sentiment < -0.3) {
              return "rgba(196, 67, 67, 0.3)"; // light-red: 부정
            } else {
              return "rgba(255, 190, 15, 1)"; // 중립
            }
          } else {
            return "none";
          }
        });
    });

    // Update drawing nodes
    // 중앙의 count를 보여주는 circle node
    this.nodesGSelection = this.nodesGSelection
      //.data(nodes)
      .data(nodes)
      .join("circle")
      .attr("stroke-width", 1)
      .attr("r", (d) => Math.sqrt(d.count * nodeSizeMultiplier))
      .attr("fill", "rgb(55, 55, 55)")
      //@ts-ignore
      .call(drag(simulation));

    this.nodesGSelection.each(function (nodeDatum) {
      d3.select(this)
        .selectAll<HTMLTitleElement, NodeDatum>("title")
        //.attr("fill", "rgb(255, 255, 255)")
        .data([nodeDatum])
        .join("title")
        .text((d) => `count: ${d.count}`);
    });

    // Update text of nodes
    this.nodeTextsGSelection = this.nodeTextsGSelection
      .data(nodes)
      .join("text")
      .attr("font-size", (d) => 4 * Math.log(2 * nodeSizeMultiplier * d.count))
      .text((d) => d.id);

    // Animate the graph
    simulation.on("tick", () => {
      this.linksGSelection
        .attr("x1", (d) => (d.source as NodeDatum).x!)
        .attr("y1", (d) => (d.source as NodeDatum).y!)
        .attr("x2", (d) => (d.target as NodeDatum).x!)
        .attr("y2", (d) => (d.target as NodeDatum).y!)
        .text((d) => `${d.count}`);

      this.nodePiesGSelection.attr(
        "transform",
        (d) => `translate(${d.x} ${d.y})`
      );
      this.circlesOfNodePiesGSelection.attr(
        "transform",
        (d) => `translate(${d.x} ${d.y})`
      );

      this.nodesGSelection.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

      this.nodeTextsGSelection
        .attr("x", (d) => d.x!)
        .attr(
          "y",
          (d) => d.y! + 6 * Math.log(2 * nodeSizeMultiplier * d.count)
        );
    });
  }

  public removeDrawing() {
    if (this.conceptualMapDivSelection !== null) {
      this.svgSelection!.remove();
      this.svgSelection = null;
    }
  }
}
