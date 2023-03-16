/* eslint-disable no-unused-vars */
import _ from "lodash";
import { hexToRgb } from "../../../common_functions/hexToRgb";
import { ParticipantDict } from "../../../common_functions/makeParticipants";
import { SentenceObject } from "../../../interfaces/DebateDataInterface";
import { UtteranceObjectForDrawing } from "../interfaces";
import { SimilarityBlock } from "../interfaces";
import { Tooltip } from "antd";

export type ColoringSelfSimilarities =
  | "none"
  | "oneColor"
  | "participantColors";

export class SimilarityBlocksDrawer {
  private readonly conceptSimilarityRectGSelection!: d3.Selection<
    SVGGElement,
    MouseEvent,
    HTMLElement,
    any
  >;

  private _coloringSelfSimilarities: ColoringSelfSimilarities = "none";
  private _showEngagementPoint: boolean = false;
  private _coloringRebuttal: boolean = true; // 토론의 주장과 반박 연쇄 일어나는 구간 색상 부여
  private _standardHighPointOfSimilarityScore!: number;
  private _findDisagreeScaleScore!: number;
  private _clickListener:
    | ((e: MouseEvent, d: SimilarityBlock) => void)
    | null = null;

  public constructor(
    private readonly utteranceObjectsForDrawing: UtteranceObjectForDrawing[],
    private readonly similarityBlocks: SimilarityBlock[],
    private readonly similarityBlockGroup: SimilarityBlock[][],
    private readonly participantDict: ParticipantDict,
    svgSelection: d3.Selection<SVGGElement, MouseEvent, HTMLElement, any>
  ) {
    //
    this.conceptSimilarityRectGSelection = svgSelection.append("g");
  }

  public set standardHighPointOfSimilarityScore(
    standardHighPointOfSimilarityScore: number
  ) {
    this._standardHighPointOfSimilarityScore = standardHighPointOfSimilarityScore;
  }

  public set findDisagreeScaleScore(findDisagreeScaleScore: number) {
    this._findDisagreeScaleScore = findDisagreeScaleScore;
  }

  public applyColorRatioSettingByTopSimilarityBlock() {
    const mostHighSimilarityBlock = _.maxBy(
      this.similarityBlocks,
      (similarityBlock) => similarityBlock.weight * similarityBlock.similarity
    )!;
    this._standardHighPointOfSimilarityScore =
      mostHighSimilarityBlock.weight * mostHighSimilarityBlock.similarity;
  }

  // public applyColorRatioSettingByTopDisagreeBlock() {
  //   const mostHighDisagreeBlock = _.maxBy(
  //     this.similarityBlocks
  //     // (similarityBlock) => similarityBlock.
  //   );
  // }

  public update() {
    const similarityRectGSelectionDataBound = this.conceptSimilarityRectGSelection
      .selectAll<SVGRectElement, unknown>("rect")
      .data(this.similarityBlocks)
      .style("fill", (d) => {
        return d.visible
          ? // ? fillColorOfSimilarityBlock(
            //     d,
            //     this.utteranceObjectsForDrawing,
            //     this.similarityBlockGroup,
            //     this.participantDict,
            //     this._standardHighPointOfSimilarityScore,
            //     this._coloringSelfSimilarities,
            //     this._coloringRebuttal
            //   )
            "none"
          : "none";
      })
      .style("stroke-width", 3)
      .style("stroke", (d) =>
        this._showEngagementPoint && d.engagementPoint ? "rgb(0, 0, 255)" : null
      );

    similarityRectGSelectionDataBound
      .enter()
      .append("rect")
      .attr("x", (d) => d.beginningPointOfX)
      .attr("y", (d) => d.beginningPointOfY)
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .style("fill", (d) => {
        return d.visible
          ? // ? fillColorOfSimilarityBlock(
            //     d,
            //     this.utteranceObjectsForDrawing,
            //     this.similarityBlockGroup,
            //     this.participantDict,
            //     this._standardHighPointOfSimilarityScore,
            //     this._coloringSelfSimilarities,
            //     this._coloringRebuttal
            //   )
            "none"
          : "none";
      })
      .style("stroke-width", 3)
      .style("stroke", (d) =>
        this._showEngagementPoint && d.engagementPoint ? "rgb(0, 0, 255)" : null
      )
      .on("click", (e, d) => {
        const mouseEvent = (e as unknown) as MouseEvent;
        mouseEvent.stopPropagation();
        const similarityBlock = (d as unknown) as SimilarityBlock;

        if (this._clickListener) {
          this._clickListener(mouseEvent, similarityBlock);
        }
      })
      .append("title")
      .text(
        (d) =>
          `findArgument: ${d.refutation},\n주장발화자Index: ${
            d.rowUtteranceIndex
          },\n반박발화자Index: ${d.columnUtteranceIndex},\nsimilarityScore: ${
            d.similarity
          },\nkeywords: ${_.map(
            d.mainKeytermObjects,
            (mainKeytermObject) => `${mainKeytermObject.name}`
          )}`
      );

    similarityRectGSelectionDataBound.exit().remove();

    function fillColorOfSimilarityBlock(
      similarityBlock: SimilarityBlock,
      utteranceObjectsForDrawing: UtteranceObjectForDrawing[],
      conceptSimilarityMatrix: SimilarityBlock[][],
      participantDict: ParticipantDict,
      limitConstant: number,
      coloringSelfSimilarities: ColoringSelfSimilarities,
      coloringRebuttal: boolean
    ): string {
      let opacity: number = 0;

      // Adjust Opacity
      // 주장 반박 구간 색칠
      const weightedSimilarity =
        similarityBlock.weight * similarityBlock.similarity;
      if (weightedSimilarity > limitConstant) {
        opacity = 1;
      } else {
        opacity = weightedSimilarity / limitConstant;
      }
      // 1123 투명도 조절하기.
      // let color = `rgba(150, 100, 100, 0.25)`;
      // let color = `rgba(79, 198, 66, ${opacity})`;
      // let color = `rgba(247, 191, 100, ${opacity * 1.5})`; // 피라미드 색상
      let color = `rgba(247, 191, 100, ${opacity})`; // 피라미드 색상

      const rowUtteranceObject =
        utteranceObjectsForDrawing[similarityBlock.rowUtteranceIndex];
      const colUtteranceObject =
        utteranceObjectsForDrawing[similarityBlock.columnUtteranceIndex];

      // Update Coloring Self Similarities
      if (!similarityBlock.other) {
        switch (coloringSelfSimilarities) {
          case "oneColor":
            color = `rgba(198, 66, 66, ${opacity})`;
            break;
          case "participantColors":
            // eslint-disable-next-line no-case-declarations
            const rgb = hexToRgb(
              participantDict[rowUtteranceObject.name].color
            );
            color = `rgba(${rgb!.r}, ${rgb!.g}, ${rgb!.b}, ${opacity})`;
            // color = `rgba(198, 66, 66, ${opacity})`;
            break;
        }
      }

      // Update Coloring Rebuttal
      if (coloringRebuttal && similarityBlock.refutation) {
        // color = `rgba(198, 66, 66, ${opacity})`;
        color = `rgba(255, 0, 0, ${opacity})`;
      }

      return color;
    }
  }

  public set coloringSelfSimilarities(
    coloringSelfSimilarities: ColoringSelfSimilarities
  ) {
    this._coloringSelfSimilarities = coloringSelfSimilarities;
  }

  public set showEngagementPoint(showEngagementPoint: boolean) {
    this._showEngagementPoint = showEngagementPoint;
    console.log("setter inner", this._showEngagementPoint);
  }

  public set coloringRebuttal(coloringRebuttal: boolean) {
    this._coloringRebuttal = coloringRebuttal;
  }

  public set clickListener(
    mouseoverListener: (e: MouseEvent, d: SimilarityBlock) => void
  ) {
    this._clickListener = mouseoverListener;
  }
}
