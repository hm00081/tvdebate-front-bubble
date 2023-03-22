/* eslint-disable no-unused-vars */
import * as d3 from "d3";
// import { D3ZoomEvent } from "d3";
import { LinkDatum, NodeDatum } from "./GraphDataStructureMaker";
import { ParticipantCount } from "./TermCountDictOfEGMaker";
import vis from "vis";

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
      .attr("width", this.svgWidth * 1.5)
      .attr("height", this.svgHeight)
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
          .selectAll<SVGTextElement, NodeDatum>("text")
      );
    } else {
      throw new Error("svgSelection is not appended yet");
    }
  }
}
// node에 대한 interaction
// d3-force 정도 조절이 필요해보임.
export function makeSimulation(nodes: NodeDatum[], links: LinkDatum[]) {
  return (
    d3
      .forceSimulation<NodeDatum>(nodes)
      .force(
        "link",
        d3.forceLink<NodeDatum, LinkDatum>(links).id((d) => d.id)
      )
      .force("charge", d3.forceManyBody().strength(-28))
      //.force("center", d3.forceCenter())
      .force("x", d3.forceX())
      .force("y", d3.forceY())
    //.on('tick', )
  );
} //d3-force

export function makeDrag() {
  return (simulation: d3.Simulation<NodeDatum, undefined>) => {
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
      .drag<SVGCircleElement, NodeDatum>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };
}

// do Make Compound!!
export const makePieData = d3
  .pie<ParticipantCount>()
  .sort(function (a, b) {
    return d3.descending(a.count, b.count);
  })
  .value((d) => d.count);

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
