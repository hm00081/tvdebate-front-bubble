/* eslint-disable no-unused-vars */
import * as d3 from "d3";
// import { D3ZoomEvent } from "d3";
import { LinkDatum, NodeDatum } from "./GraphDataStructureMaker";
import { ParticipantCount } from "./TermCountDictOfEGMaker";
import { HierarchyNode } from "d3-hierarchy";
import vis from "vis";

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

export class SvgGSelectionsMaker {
  private svgSelection: null | d3.Selection<
    SVGSVGElement,
    any,
    HTMLElement,
    any
  > = null; // default
  private svgGSelection: null | d3.Selection<
    SVGGElement,
    DragEvent,
    HTMLElement,
    any
  > = null; // default

  public constructor(
    private readonly conceptualMapDivSelection: d3.Selection<
      d3.BaseType,
      unknown,
      HTMLElement,
      any
    >,
    private readonly svgWidth: number,
    private readonly svgHeight: number
  ) {}

  public appendSvgSelection() {
    this.svgSelection = this.conceptualMapDivSelection
      .append("svg")
      .attr("width", this.svgWidth * 1.3) // 진짜 사이즈 지정
      .attr("height", this.svgHeight * 1.3) // 진짜 사이즈 지정
      .attr(
        "viewBox",
        `${-this.svgWidth / 2}, ${-this.svgHeight / 2}, ${this.svgWidth}, ${
          this.svgHeight
        }`
      )
      .call(
        d3.zoom<SVGSVGElement, any>().on("zoom", (event) => {
          this.svgGSelection!.attr("transform", () => event.transform);
        })
      );

    return this.svgSelection;
  }
  public appendSvgGSelection() {
    this.svgGSelection = this.svgSelection!.append("g");

    return this.svgGSelection;
  }

  public appendLinksGSelection() {
    if (this.svgGSelection !== null) {
      return this.svgGSelection
        .append("g")
        .attr("stroke", "#999") // link-color
        .attr("stroke-opacity", 0.5) // linkOpacity
        .attr("curve", 0.2)
        .style("display", "none") // 안보이게 설정해둠.
        .selectAll<SVGLineElement, LinkDatum>("line");
    } else {
      throw new Error("svgSelection is not appended yet");
    }
  }

  public appendNodePiesGSelection() {
    if (this.svgGSelection !== null) {
      return this.svgGSelection
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.3)
        .style("display", "none") // 안보이게 설정해둠.
        .selectAll<SVGGElement, NodeDatum>("g");
    } else {
      throw new Error("svgSelection is not appended yet");
    }
  }

  public appendCirclesOfNodePiesGSelection() {
    if (this.svgGSelection !== null) {
      return (
        this.svgGSelection
          .append("g")
          //.attr("stroke", "#fff")
          .selectAll<SVGGElement, NodeDatum>("g")
          .style("display", "none") // 안보이게 설정해둠.
      );
    } else {
      throw new Error("svgSelection is not appended yet");
    }
  }
  // 노드 주위 쌓는 것.
  public appendNodesGSelection() {
    if (this.svgGSelection !== null) {
      return this.svgGSelection
        .append("g") // apend g htmlelement
        .attr("stroke", "#fff") // white
        .attr("stroke-width", 0.1)
        .style("display", "none") // 안보이게 설정해둠.
        .selectAll<SVGCircleElement, NodeDatum>("circle");
    } else {
      throw new Error("svgSelection is not appended yet");
    }
  }

  public appendTextsGSelection() {
    if (this.svgGSelection !== null) {
      return (
        this.svgGSelection
          .append("g")
          .attr("text-anchor", "middle")
          // .style("user-select", "none")
          .style("pointer-events", "none")
          .style("display", "none") // 안보이게 설정해둠.
          .selectAll<SVGTextElement, NodeDatum>("text")
      );
    } else {
      throw new Error("svgSelection is not appended yet");
    }
  }

  // 기존 코드: appendCirclePackingGSelection
  // public appendCirclePackingGSelection() {
  //   if (this.svgGSelection !== null) {
  //     const circlePackingG = this.svgGSelection
  //       .append("g")
  //       .attr("stroke", "#fff")
  //       .attr("stroke-width", 0.7)
  //       .style("display", "inline"); // "display" 속성을 "block"으로 변경
  //     const circles = circlePackingG.selectAll<
  //       SVGCircleElement,
  //       d3.HierarchyCircularNode<HierarchyDatum>
  //     >("circle");
  //     console.log(circles);
  //     //@ts-ignore
  //     return circles;
  //   } else {
  //     throw new Error("svgGSelection is not appended yet");
  //   }
  // }

  // 수정 코드
  public appendCirclePackingGSelection() {
    if (this.svgGSelection !== null) {
      const circlePackingG = this.svgGSelection
        .append("g")
        .attr("stroke", "#fff")
        .style("display", "inline"); // "display" 속성을 "block"으로 변경
      return circlePackingG;
    } else {
      throw new Error("svgGSelection is not appended yet");
    }
  }

  public appendCirclaPackingTextsGSelection() {
    if (this.svgGSelection !== null) {
      return this.svgGSelection
        .append("g")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .selectAll<SVGTextElement, d3.HierarchyCircularNode<HierarchyDatum>>(
          "text"
        )
        .join("text")
        .style("display", "inline"); // "display" 속성을 "block"으로 변경;
    } else {
      throw new Error("svgSelection is not appended yet");
    }
  }
}
// node에 대한 interaction
// 충돌 방지 힘 정의
export function makeSimulation(
  nodes: d3.HierarchyCircularNode<HierarchyDatum>[]
) {
  const collideForce = d3
    .forceCollide<d3.HierarchyCircularNode<HierarchyDatum>>()
    .radius((d) => d.r);

  return d3
    .forceSimulation<d3.HierarchyCircularNode<HierarchyDatum>>(nodes)
    .force("charge", d3.forceManyBody().strength(-20))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("collide", collideForce);
}
//d3-force

export function makeDrag() {
  return (
    simulation: d3.Simulation<
      d3.HierarchyCircularNode<HierarchyDatum>,
      undefined
    >
  ) => {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag<SVGCircleElement, d3.HierarchyCircularNode<HierarchyDatum>>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };
}

// 계층 구조를 사용하여 원의 위치와 크기를 계산하는 함수
// createCirclePackingLayout: 주어진 계층 데이터와 지름을 사용하여 원의 크기와 위치를 계산.
export function createCirclePackingLayout(
  root: HierarchyNode<any>,
  diameter: number
) {
  const pack = d3.pack().size([diameter, diameter]);
  return pack(root);
}

// 계층 데이터를 생성하는 함수
export function createHierarchy(data: NodeDatum[]) {
  const root = d3
    .hierarchy({ children: data } as any) // inser any type.
    .sum((d: HierarchyNode<NodeDatum>) => d.data.count) // 이 줄에 타입 어노테이션을 추가했습니다.
    .sort((a, b) => b.data.count - a.data.count);
  return root;
}

// do Make Compound!!
export const makePieData = d3
  .pie<ParticipantCount>()
  .sort(function (a, b) {
    return d3.descending(a.count, b.count);
  })
  .value((d) => d.count);
//console.log(makePieData);
export function makeArcDAttribute(
  d: d3.PieArcDatum<ParticipantCount>,
  nodeDatum: NodeDatum,
  nodeSizeMultiplier: number
) {
  const arcMaker = d3
    .arc<d3.PieArcDatum<ParticipantCount>>()
    .innerRadius(0)
    .outerRadius(Math.sqrt(nodeDatum.count * nodeSizeMultiplier) + 3);

  return arcMaker(d);
}
