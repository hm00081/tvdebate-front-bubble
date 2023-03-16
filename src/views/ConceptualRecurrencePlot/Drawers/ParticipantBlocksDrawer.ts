/* eslint-disable no-unused-vars */
import { ParticipantDict } from "../../../common_functions/makeParticipants";
import { SimilarityBlock, UtteranceObjectForDrawing } from "../interfaces";
import { Participant } from "../../../common_functions/makeParticipants";
import _ from "lodash";
import { KeytermObject } from "../../../interfaces/DebateDataInterface";
import { findTopValueIndexes } from "../../../common_functions/findTopValueIndexes";

export class ParticipantBlocksDrawer {
  private readonly participantRectGSlection!: d3.Selection<
    SVGGElement,
    MouseEvent,
    HTMLElement,
    any
  >;
  private selectedParticipants: Participant[] = [];
  private _clickListener: null | (() => void) = null;
  private _mouseoverListener:
    | null
    | ((
        mouseEvent: MouseEvent,
        utteranceObjectForDrawing: UtteranceObjectForDrawing
      ) => void) = null;
  private _mouseoutListener: null | (() => void) = null;

  public constructor(
    private readonly utteranceObjectsForDrawing: UtteranceObjectForDrawing[],
    private readonly participantDict: ParticipantDict,
    private readonly conceptSimilarityBlocks: SimilarityBlock[],
    private readonly conceptMatrixTransposed: number[][],
    private readonly keytermObjects: KeytermObject[],
    svgSelection: d3.Selection<SVGGElement, MouseEvent, HTMLElement, any>
  ) {
    this.participantRectGSlection = svgSelection.append("g");
  }

  public update() {
    const participantRectGSlectionDataBound = this.participantRectGSlection
      .selectAll<SVGRectElement, UtteranceObjectForDrawing>("rect")
      .data(this.utteranceObjectsForDrawing)
      .join("rect")
      .attr("transform", "rotate(-135) scale(-1, 1)");

    participantRectGSlectionDataBound.call(
      setAttributes.bind(
        this,
        participantRectGSlectionDataBound,
        this.participantDict,
        this.conceptMatrixTransposed,
        this.keytermObjects
      )
    );

    function setAttributes(
      this: ParticipantBlocksDrawer,
      selection: d3.Selection<
        SVGRectElement,
        UtteranceObjectForDrawing,
        SVGGElement,
        unknown
      >,
      participantDict: { [participant: string]: Participant },
      conceptMatrixTransposed: number[][],
      keytermObjects: KeytermObject[]
    ) {
      selection // utterance_objects 데이터 적용
        .attr("x", (d) => d.beginningPointOfXY)
        .attr("y", (d) => d.beginningPointOfXY)
        .attr("width", (d) => d.width) // 노드 두께
        .attr("height", (d) => d.width) // 노드 높이
        .style("fill", (d) => participantDict[d.name].color)
        // .on("click", (e, u) => {
        //   const mouseEvent = (e as unknown) as MouseEvent;
        //   mouseEvent.stopPropagation();
        //   const selectedParticipant = (u as unknown) as UtteranceObjectForDrawing;
        //   this.click(mouseEvent, selectedParticipant);
        // })
        .on("mouseover", (e, u) => {
          const mouseEvent = (e as unknown) as MouseEvent;
          mouseEvent.stopPropagation();
          const utteranceObjectForDrawing = (u as unknown) as UtteranceObjectForDrawing;

          // TODO adjust transcript-view
          if (this._mouseoverListener) {
            this._mouseoverListener(mouseEvent, utteranceObjectForDrawing);
          }
        })
        .on("mouseout", (e, u) => {
          if (this._mouseoutListener) {
            this._mouseoutListener();
          }
        });
      // TODO
      // .append("title")
      // .text((d, i) => {
      //   const conceptVectorOfUtterance = conceptMatrixTransposed[i];

      //   const topValueIndexes = findTopValueIndexes(
      //     conceptVectorOfUtterance,
      //     3
      //   );
      //   const mainKeytermObjects = _.map(
      //     topValueIndexes,
      //     (topValueIndex) => keytermObjects[topValueIndex]
      //   );

      //   const mainKeytermsString = _.reduce(
      //     mainKeytermObjects,
      //     (result, keytermObject) => {
      //       return `${result} ${keytermObject.name}`;
      //     },
      //     ""
      //   );

      //   return `main_keyterms:${mainKeytermsString}\n${d.name} : ${d.utterance}`;
      // });
    }
  }

  public click(
    e: MouseEvent | React.MouseEvent<HTMLDivElement, MouseEvent>,
    u: UtteranceObjectForDrawing
  ) {
    const mouseEvent = e;
    mouseEvent.stopPropagation();
    const selectedParticipant = u;

    this.selectedParticipants.push(
      this.participantDict[selectedParticipant.name]
    );

    console.log("this.selectedParticipants", this.selectedParticipants);

    if (this.selectedParticipants.length === 1) {
      // remain same participant's similairity_block. remove other participant's similarity_block
      _.forEach(this.conceptSimilarityBlocks, (similarityBlock) => {
        const rowParticipantName = this.utteranceObjectsForDrawing[
          similarityBlock.rowUtteranceIndex
        ].name;
        const colParticipantName = this.utteranceObjectsForDrawing[
          similarityBlock.columnUtteranceIndex
        ].name;
        if (
          selectedParticipant.name === rowParticipantName ||
          selectedParticipant.name === colParticipantName
        ) {
          similarityBlock.visible = true;
        } else {
          similarityBlock.visible = false;
        }
      });
    } else if (this.selectedParticipants.length === 2) {
      //
      const participant1 = this.selectedParticipants[0];
      const participant2 = this.selectedParticipants[1];

      _.forEach(this.conceptSimilarityBlocks, (similarityBlock) => {
        const rowParticipantName = this.utteranceObjectsForDrawing[
          similarityBlock.rowUtteranceIndex
        ].name;
        const colParticipantName = this.utteranceObjectsForDrawing[
          similarityBlock.columnUtteranceIndex
        ].name;
        if (
          (rowParticipantName === participant1.name &&
            colParticipantName === participant2.name) ||
          (rowParticipantName === participant2.name &&
            colParticipantName === participant1.name) ||
          (rowParticipantName === participant1.name &&
            colParticipantName === participant1.name) ||
          (rowParticipantName === participant2.name &&
            colParticipantName === participant2.name)
        ) {
          similarityBlock.visible = true;
        } else {
          similarityBlock.visible = false;
        }
      });
    }

    // drawSimilarityBlocks
    if (this._clickListener) {
      this._clickListener();
    }
  }

  public emptySelectedParticipants() {
    this.selectedParticipants = [];
  }

  public set clickListener(clickListener: () => void) {
    this._clickListener = clickListener;
  }

  public set mouseoverListener(
    mouseoverListener: (
      mouseEvent: MouseEvent,
      utteranceObjectForDrawing: UtteranceObjectForDrawing
    ) => void
  ) {
    this._mouseoverListener = mouseoverListener;
  }

  public set mouseoutLisener(mouseoutListener: () => void) {
    this._mouseoutListener = mouseoutListener;
  }
}
