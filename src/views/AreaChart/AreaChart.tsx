import React, {
  Ref,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as d3 from "d3";
import { ParticipantDict } from "../../common_functions/makeParticipants";
import {
  DebateDataSet,
  UtteranceObject,
  EvaluationDataSet,
} from "../../interfaces/DebateDataInterface";
import DataImporter from "../ConceptualRecurrencePlot/DataImporter";
import { DataStructureManager } from "../ConceptualRecurrencePlot/DataStructureMaker/DataStructureManager";
import CombinedEGsMaker from "../ConceptualRecurrencePlot/DataStructureMaker/CombinedEGsMaker";
import {
  ConceptualMapDrawer,
  HierarchyDatum,
} from "../ConceptualRecurrencePlot/ConceptualMapModal/ConceptualMapDrawer";

// interface AreaChartProps {
//   participantDict: ParticipantDict;
//   utteranceObjects: UtteranceObject[];
//   //termType: TermType;
//   relationships: string[][];
//   dataStructureManager: DataStructureManager;
// }

interface IData {
  x: number;
  y: number;
  group: string;
  name: string;
}

const AreaChart: React.FC<IData> = (props) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const data: IData[] = [
    { x: 1, y: 10, group: "찬성", name: "이준석" },
    { x: 2, y: 20, group: "찬성", name: "이준석" },
    { x: 3, y: 30, group: "찬성", name: "이준석" },
    { x: 4, y: 40, group: "찬성", name: "이준석" },
    { x: 5, y: 30, group: "찬성", name: "이준석" },
    { x: 6, y: 20, group: "찬성", name: "이준석" },
    { x: 7, y: 10, group: "찬성", name: "이준석" },
    { x: 1, y: 15, group: "찬성", name: "박휘락" },
    { x: 2, y: 25, group: "찬성", name: "박휘락" },
    { x: 3, y: 35, group: "찬성", name: "박휘락" },
    { x: 4, y: 45, group: "찬성", name: "박휘락" },
    { x: 5, y: 35, group: "찬성", name: "박휘락" },
    { x: 6, y: 25, group: "찬성", name: "박휘락" },
    { x: 7, y: 15, group: "찬성", name: "박휘락" },
    { x: 1, y: 16, group: "반대", name: "김종대" },
    { x: 2, y: 26, group: "반대", name: "김종대" },
    { x: 3, y: 36, group: "반대", name: "김종대" },
    { x: 4, y: 46, group: "반대", name: "김종대" },
    { x: 5, y: 36, group: "반대", name: "김종대" },
    { x: 6, y: 26, group: "반대", name: "김종대" },
    { x: 7, y: 16, group: "반대", name: "김종대" },
    { x: 1, y: 11, group: "반대", name: "장경태" },
    { x: 2, y: 21, group: "반대", name: "장경태" },
    { x: 3, y: 31, group: "반대", name: "장경태" },
    { x: 4, y: 41, group: "반대", name: "장경태" },
    { x: 5, y: 31, group: "반대", name: "장경태" },
    { x: 6, y: 21, group: "반대", name: "장경태" },
    { x: 7, y: 11, group: "반대", name: "장경태" },
  ];

  const getColorByName = (name: string) => {
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
        return "#000000"; // default color for names not listed
    }
  };
  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    const maxY = d3.max(data, (d) => d.y);
    const xLabels = [
      "논쟁1",
      "논쟁2",
      "논쟁3",
      "논쟁4",
      "논쟁5",
      "논쟁6",
      "논쟁7",
    ];
    //const xScale = d3.scaleLinear().domain([1, 7]).range([0, 310]);
    const xScale = d3.scalePoint().domain(xLabels).range([0, 310]).padding(0.5);
    //@ts-ignore
    const yScale = d3.scaleLinear().domain([0, maxY]).range([200, 0]);

    const names = Array.from(new Set(data.map((d) => d.name)));

    const maxValues: Record<string, number> = {};
    names.forEach((name) => {
      maxValues[name] =
        d3.max(
          data.filter((d) => d.name === name),
          (d) => d.y
        ) || 0;
    });
    names.sort((a, b) => maxValues[b] - maxValues[a]);
    names.forEach((name) => {
      const nameData = data.filter((d) => d.name === name);

      // Initialize cumulative y values
      const cumulativeY: Record<number, number> = {}; // Move this line into the forEach loop

      // Update cumulative y values
      nameData.forEach((d) => {
        cumulativeY[d.x] = (cumulativeY[d.x] || 0) + d.y;
      });
      //@ts-ignore
      const area = d3
        .area<IData>()
        //@ts-ignore
        // .x((d) => xScale(d.x))
        .x((d) => xScale(`논쟁${d.x}`))
        .y0((d) => yScale(cumulativeY[d.x] - d.y))
        .y1((d) => yScale(cumulativeY[d.x]))
        .curve(d3.curveMonotoneX);

      svg
        .append("path")
        .datum(nameData)
        .attr("fill", () => hexToRgba(getColorByName(name), 1))
        .attr("d", area);
    });

    svg
      .append("g")
      .attr("transform", "translate(0," + 200 + ")") // 이 부분은 y축의 위치를 조정합니다. 500은 svg의 높이에 따라 조정해야 합니다.
      .call(d3.axisBottom(xScale)); // x축

    svg.append("g").call(d3.axisLeft(yScale)); // y축
  }, []);

  // Function to convert hex color to rgba
  const hexToRgba = (hex: string, opacity: number) => {
    let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div style={{ width: "330px", height: "200px" }}>
      <svg ref={ref} width={330} height={180} />
    </div>
  );
};

export default AreaChart;
