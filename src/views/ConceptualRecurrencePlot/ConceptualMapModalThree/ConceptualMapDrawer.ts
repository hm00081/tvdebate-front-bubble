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
  createHierarchy,
  createCirclePackingLayout,
} from "./ConceptualMapDrawerInternalFunctions";
import _ from "lodash";
import tinygradient from "tinygradient";
import { SimilarityBlock, UtteranceObjectForDrawing } from "../interfaces";
import { color } from "d3";

export type HierarchyDatum = {
  name?: string;
  id: string;
  group?: string;
  booleanCount: number;
  participantCounts: ParticipantCount[];
  participantBooleanCounts: number[];
  count: number;
  children: HierarchyDatum[];
  extraInfo: string;
};

export class ConceptualMapDrawer {
  getEngagementGroups(): any {
    throw new Error("Method not implemented.");
  }
  updateData(nodeLinkDict: NodeLinkDict, nodeSizeMultiplier: number) {
    throw new Error("Method not implemented.");
  }

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
  // draw for circle packing
  private circlePackingGSelection!: d3.Selection<
    SVGCircleElement | SVGGElement,
    d3.HierarchyCircularNode<HierarchyDatum>,
    SVGGElement,
    any
  >;
  private circlePackingTextsGSelection!: d3.Selection<
    SVGTextElement,
    d3.HierarchyCircularNode<HierarchyDatum>,
    SVGGElement,
    any
  >;

  private _nodeLinkDict: NodeLinkDict | null = null;
  private _nodeSizeMultiplier: number = 1;
  private _sentimentMarkerVisible: boolean = false;
  private gradient = tinygradient(
    { r: 196, g: 67, b: 67 },
    { r: 79, g: 198, b: 66 }
  );
  nodes: any;

  public constructor(
    private readonly coneptualMapDivClassName:
      | string
      | SVGSVGElement
      | HTMLElement
      | null,
    private readonly svgWidth: number,
    private readonly svgHeight: number,
    private _participantDict: ParticipantDict,
    private onSvgClick?: (event: MouseEvent) => void //private onSvgClick?: (index: number, event: MouseEvent) => void, //@ts-ignore //private index?: number
  ) {
    this.onSvgClick = onSvgClick;
  }

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
  public getDomElementInfo() {
    return {
      //@ts-ignore
      divSelectionNode: this.conceptualMapDivSelection.node(),
      divClassName: this.coneptualMapDivClassName,
    };
  }

  public updateGraph(
    filterCondition: string[] = [
      "이준석",
      "장경태",
      "김종대",
      "박휘락",
      "진행자",
    ]
  ) {
    if (this._nodeLinkDict === null) {
      console.warn("NodeLinkDict is null, skipping updateGraph.");
      return;
    }

    const nodes = this._nodeLinkDict!.nodes;
    const links = this._nodeLinkDict!.links;

    const nodeSizeMultiplier = this._nodeSizeMultiplier;
    if (this.conceptualMapDivSelection === null) {
      //@ts-ignore
      this.conceptualMapDivSelection = d3.select(this.coneptualMapDivClassName);
    }
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
      //@ts-ignore
      this.circlePackingGSelection = svgGSelectionsMaker.appendCirclePackingGSelection();
      //@ts-ignore
      this.circlePackingTextsGSelection = svgGSelectionsMaker.appendCirclaPackingTextsGSelection();
    }
    // drag event listener
    const drag = makeDrag();

    function transformData(nodes: NodeDatum[]): Map<string, HierarchyDatum[]> {
      const transformedData: HierarchyDatum[] = [];

      nodes.forEach((node) => {
        if (node.group === "term" || node.group === "keyterm") {
          node.participantCounts.forEach((participant) => {
            const existingChild = transformedData.find(
              (child) => child.id === participant.name
            );
            if (existingChild) {
              existingChild.children.push({
                name: node.name,
                id: `${node.id}`,
                count: participant.count,
                booleanCount: 0,
                participantCounts: [],
                participantBooleanCounts: [],
                children: [],
                extraInfo: "Example extra information",
              });
              existingChild.count += participant.count;
            } else {
              transformedData.push({
                name: participant.name,
                id: participant.name,
                booleanCount: 0,
                participantCounts: [],
                participantBooleanCounts: [],
                children: [
                  {
                    name: node.name,
                    id: `${node.id}`,
                    count: participant.count,
                    booleanCount: 0,
                    participantCounts: [],
                    participantBooleanCounts: [],
                    children: [],
                    extraInfo: "Example extra information",
                  },
                ],
                count: participant.count,
                extraInfo: "",
              });
            }
          });
        }
      });
      const groupedData = d3.group(transformedData, (d) => d.id);
      return groupedData;
    }

    const createPackLayout = (
      data: HierarchyDatum
    ): d3.HierarchyCircularNode<HierarchyDatum> => {
      const rootHierarchy = d3.hierarchy<HierarchyDatum>(data);
      const hierarchicalData = rootHierarchy
        .sum((d) => d.count || 0)
        .sort((a, b) => (b.data.count || 0) - (a.data.count || 0));
      //@ts-ignore
      return d3.pack().size([this.svgWidth, this.svgHeight]).padding(1.5)(
        hierarchicalData
      );
    };

    function checkHierarchyDatum(obj: HierarchyDatum) {
      if (!obj || !obj.children) {
        console.error("HierarchyDatum or HierarchyDatum.children is undefined");
        return;
      } else {
        obj.children.forEach((child, index) => {
          if (!child) {
            console.error(`HierarchyDatum.children[${index}] is undefined`);
          }
        });
      }
    }

    function checkHierarchyCircularNodeLeaf(
      obj: d3.HierarchyCircularNode<HierarchyDatum>
    ) {
      if (!obj) {
        console.error("HierarchyCircularNode is undefined");
      } else {
        if (!obj.data) {
          console.error("HierarchyCircularNode.data is undefined");
        } else {
          checkHierarchyDatum(obj.data);
        }
      }
    }

    const groupedData = transformData(nodes);

    const speakers = Array.from(groupedData.keys());

    const dataBySpeaker = speakers.map((speaker) => {
      return {
        id: speaker,
        children: groupedData.get(speaker) || [],
      };
    });

    const packLayouts = dataBySpeaker.map((speakerData) => {
      return createPackLayout({
        id: speakerData.id,
        booleanCount: 0,
        participantCounts: [],
        participantBooleanCounts: [],
        count: 0,
        extraInfo: "",
        children: speakerData.children,
      });
    });
    // console.log("Pack layouts:", packLayouts);

    const getSpeakerCenters = (
      speakers: string[],
      width: number,
      height: number
    ) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 3;
      const angleStep = (2 * Math.PI) / speakers.length;

      const speakerCenters = new Map<string, { x: number; y: number }>();
      speakers.forEach((speaker, index) => {
        const x = centerX + radius * Math.cos(index * angleStep);
        const y = centerY + radius * Math.sin(index * angleStep);
        speakerCenters.set(speaker, { x, y });
      });

      return speakerCenters;
    };

    const speakerCenters = getSpeakerCenters(
      speakers,
      this.svgWidth,
      this.svgHeight
    );

    const leaves = packLayouts
      .flatMap((layout) => layout.leaves())
      .filter((d) => d !== undefined);

    leaves.forEach((leaf) => {
      const speaker = leaf.parent?.data.id;
      if (speaker) {
        const center = speakerCenters.get(speaker);
        if (center) {
          leaf.x += center.x - this.svgWidth / 2;
          leaf.y += center.y - this.svgHeight / 2;
        }
      }
    });

    const filteredLeaves = leaves.filter(
      (d) =>
        (d.parent?.data.id === "박휘락" || d.parent?.data.id === "김종대") &&
        d.data.count > 0
    );

    const simulation = makeSimulation(leaves);

    const colorScale = d3
      .scaleOrdinal<number, string>()
      .domain([1, 2, 3, 4, 5])
      .range([
        "#B60E3C", // 이
        "#00a0e2", // 장
        "#C7611E", // 박
        "#00AB6E", // 김
        "rgb(251,154,153)",
      ]);

    if (this.onSvgClick) {
      this.svgSelection
        .attr("viewBox", `0 0 ${this.svgWidth} ${this.svgHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .on("click", (event: MouseEvent) => {
          this.onSvgClick!(event);
          console.log("svg clicked");
        });
    }

    const groups = this.circlePackingGSelection
      .selectAll<SVGGElement, d3.HierarchyCircularNode<HierarchyDatum>>("g")
      .data(
        filteredLeaves,
        (d: d3.HierarchyCircularNode<HierarchyDatum>) =>
          d.data.id || d.data.name!
      )
      .join("g");

    groups
      .append("circle")
      .attr("stroke-width", 0.5)
      .attr("cx", (d: d3.HierarchyCircularNode<HierarchyDatum>) => d.x)
      .attr("cy", (d: d3.HierarchyCircularNode<HierarchyDatum>) => d.y)
      .attr(
        "r",
        (d) =>
          // Math.max(Math.sqrt(d.data.count * nodeSizeMultiplier), 2)
          d.data.count * nodeSizeMultiplier + 2
      )
      .attr("fill", (d) => {
        const name = d.parent?.data.id;
        if (name) {
          if (name === "이준석") {
            return "none";
          } else if (name === "장경태") {
            return "none";
          } else if (name === "박휘락") {
            return colorScale(3);
          } else if (name === "김종대") {
            return colorScale(4);
          } else {
            return "none";
          }
        } else {
          return colorScale(1);
        }
      });
    //.call(drag(simulation));

    groups
      .append("title")
      .text(
        (d) =>
          `발화자: ${d.parent?.data.id}count: ${d.data.count} keyword: ${d.data.id}`
      );

    groups
      .append("text")
      .text((d) => d.data.id || "")
      .attr("fill", (d) => {
        const name = d.parent?.data.id;
        if (name) {
          if (name === "이준석") {
            return "none";
          } else if (name === "장경태") {
            return "none";
          } else if (name === "박휘락") {
            return "black";
          } else if (name === "김종대") {
            return "black";
          } else {
            return "none";
          }
        } else {
          return "black";
        }
      })
      .style("font-size", (d) => d.data.count * nodeSizeMultiplier + 2)
      .style("font-weight", "bold")
      .attr("stroke-width", 0)
      .attr("text-anchor", "middle")
      .attr("x", (d: d3.HierarchyCircularNode<HierarchyDatum>) => d.x)
      .attr(
        "y",
        (d: d3.HierarchyCircularNode<HierarchyDatum>) =>
          d.y +
          Math.max(Math.sqrt(d.data.count * nodeSizeMultiplier), 2) +
          10 +
          8
      );

    // // Animate the graph
    // simulation.on("tick", () => {
    //   this.circlePackingTextsGSelection
    //     .attr("x", (d: d3.HierarchyCircularNode<HierarchyDatum>) => d.x)
    //     .attr("y", (d: d3.HierarchyCircularNode<HierarchyDatum>) => d.y);

    //   // 수정 코드 2
    //   groups.attr(
    //     "transform",
    //     (d: d3.HierarchyCircularNode<HierarchyDatum>) =>
    //       `translate(${d.x},${d.y})`
    //   );
    // });
  }

  public removeDrawing() {
    if (this.conceptualMapDivSelection !== null) {
      this.svgSelection!.remove();
    }
  }
}
