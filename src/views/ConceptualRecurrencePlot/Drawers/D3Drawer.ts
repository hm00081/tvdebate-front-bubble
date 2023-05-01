import { UncertainIconDrawer } from "./UncertainIconDrawer";
import { TermType } from "../DataImporter";
import { DataStructureSet } from "../DataStructureMaker/DataStructureManager";
import { DebateDataSet } from "../../../interfaces/DebateDataInterface";
/* eslint-disable no-unused-vars */
import { SimilarityBlocksDrawer } from "./SimilarityBlocksDrawer"; // 유사도 노드
import { ParticipantBlocksDrawer } from "./ParticipantBlocksDrawer"; // 참가자 노드
import { UtteranceObjectForDrawing, SimilarityBlock } from "../interfaces";
import * as d3 from "d3";
import _ from "lodash";
import { TopicGroupsDrawer } from "./TopicGroupsDrawer";
import { D3ZoomEvent, zoomTransform } from "d3";
import { ParticipantDict } from "../../../common_functions/makeParticipants";
import { KeytermObject } from "../../../interfaces/DebateDataInterface";
import { InsistenceMarkersDrawer } from "./InsistenceMarkersDrawer";
import { RefutationIconDrawer } from "./RefutationIconDrawer";
import { InsistenceIconDrawer } from "./InsistenceIconDrawer";

export class D3Drawer {
  private readonly conceptRecurrencePlotDiv!: d3.Selection<
    HTMLDivElement,
    any,
    HTMLElement,
    any
  >;
  private readonly svgSelection!: d3.Selection<
    SVGSVGElement,
    MouseEvent,
    HTMLElement,
    any
  >;
  private readonly svgGSelection!: d3.Selection<
    SVGGElement,
    MouseEvent,
    HTMLElement,
    any
  >;

  // 접근 제한자 public, private, protected
  // public: 어디에서나 접근할 수 있으며 생략 가능한 default 값
  // private: 해당 클래스의 인스턴스에서만 접근 가능
  // protected: 해당 클래스 혹은 서브클래스의 인스턴스에서만 접근이 가능
  // this는 자신이 속한 객체 또는 자신이 생성할 인스턴스를 가리키는 자기 참조 변수(self-reference variable)
  public readonly participantBlocksDrawer: ParticipantBlocksDrawer;
  public readonly insistenceMarkersDrawer: InsistenceMarkersDrawer;
  public readonly refutationIconDrawer: RefutationIconDrawer;
  public readonly insistenceIconDrawer: InsistenceIconDrawer;
  public readonly uncertainIconDrawer: UncertainIconDrawer;
  public readonly similarityBlocksDrawer: SimilarityBlocksDrawer;
  public readonly topicGroupsDrawer: TopicGroupsDrawer;
  public readonly manualSmallTGsDrawer: TopicGroupsDrawer;
  public readonly manualMiddleTGsDrawer: TopicGroupsDrawer;
  public readonly manualBigTGsDrawer: TopicGroupsDrawer;
  public readonly manualPeopleTGsDrawer: TopicGroupsDrawer;
  public readonly manualFullTGsDrawer: TopicGroupsDrawer;
  public readonly lcsegEGsDrawer: TopicGroupsDrawer;
  private readonly svgWidth: number;
  private readonly svgHeight: number;
  // private readonly svgRotate: number;
  // private _svgBackgroundClickListener?: (event: MouseEvent) => void;
  private _zoomListener: ((transform: d3.ZoomTransform) => void) | null = null;

  public constructor(
    // private readonly utteranceObjectsForDrawing: UtteranceObjectForDrawing[],
    // conceptSimilarityBlocks: SimilarityBlock[],
    // conceptSimilarityGroup: SimilarityBlock[][],
    // participantDict: ParticipantDict,
    // conceptMatrixTransposed: number[][],
    // keytermObjects: KeytermObject[],
    // termList: string[],
    // termUtteranceBooleanMatrixTransposed: number[][]
    private readonly debateDataSet: DebateDataSet,
    private readonly dataStructureSet: DataStructureSet,
    private readonly termType: TermType
  ) {
    // declare variables
    this.conceptRecurrencePlotDiv = d3.select(".concept-recurrence-plot");
    this.svgWidth = this.conceptRecurrencePlotDiv.node()!.clientWidth;
    this.svgHeight = this.conceptRecurrencePlotDiv.node()!.clientHeight;
    // 그려질 svg 영역
    // this.svgSelection = this.conceptRecurrencePlotDiv
    //   .select<SVGSVGElement>("svg")
    //   .attr("width", this.svgWidth * 2) // topic select 구간
    //   .attr("height", this.svgHeight)
    //   .attr("transform", "translate(24, 23) scale(1, 1)");
    this.svgSelection = this.conceptRecurrencePlotDiv.select<SVGSVGElement>(
      "svg"
    );
    //.attr("transform", "translate(" + 19 + "," + margin.top + ")")
    //.attr("transform", "scale(1, -1) rotate(-45)")
    // 임시로 45도 돌려놓음 현재
    // zoom event 일어나는 곳
    // .call(
    //   d3
    //     .zoom<SVGSVGElement, D3ZoomEvent<SVGSVGElement, any>>()
    //     .on("zoom", (event) => {
    //       //@ts-ignore
    //       this.svgGSelection.attr("transform", () => event.transform);
    //       if (this._zoomListener) {
    //         this._zoomListener(event.transform);
    //       }
    //     })
    // );

    this.svgGSelection = this.svgSelection.select(".svgG");

    this.participantBlocksDrawer = new ParticipantBlocksDrawer(
      dataStructureSet.utteranceObjectsForDrawingManager.utteranceObjectsForDrawing,
      dataStructureSet.participantDict,
      dataStructureSet.similarityBlockManager.similarityBlocks,
      debateDataSet.conceptMatrixTransposed,
      debateDataSet.keytermObjects,
      this.svgGSelection
    ); // 참가자 drawer
    this.insistenceMarkersDrawer = new InsistenceMarkersDrawer(
      dataStructureSet.utteranceObjectsForDrawingManager.utteranceObjectsForDrawing,
      dataStructureSet.similarityBlockManager.similarityBlockGroup,
      this.svgGSelection
    );
    this.refutationIconDrawer = new RefutationIconDrawer(
      dataStructureSet.utteranceObjectsForDrawingManager.utteranceObjectsForDrawing,
      this.svgGSelection
    );
    this.insistenceIconDrawer = new InsistenceIconDrawer(
      dataStructureSet.utteranceObjectsForDrawingManager.utteranceObjectsForDrawing,
      this.svgGSelection
    );
    this.uncertainIconDrawer = new UncertainIconDrawer(
      dataStructureSet.utteranceObjectsForDrawingManager.utteranceObjectsForDrawing,
      this.svgGSelection
    );
    this.similarityBlocksDrawer = new SimilarityBlocksDrawer(
      dataStructureSet.utteranceObjectsForDrawingManager.utteranceObjectsForDrawing,
      dataStructureSet.similarityBlockManager.similarityBlocks,
      dataStructureSet.similarityBlockManager.similarityBlockGroup,
      dataStructureSet.participantDict,
      this.svgGSelection
    );

    this.similarityBlocksDrawer.clickListener = (
      e: MouseEvent,
      d: SimilarityBlock
    ) => {
      this.refutationIconDrawer.similarityBlock = null;
      this.insistenceIconDrawer.similarityBlock = null;
      this.uncertainIconDrawer.similarityBlock = null;

      if (d.refutation) {
        this.refutationIconDrawer.similarityBlock = d;

        const colUtteranceObject = this.dataStructureSet
          .utteranceObjectsForDrawingManager.utteranceObjectsForDrawing[
          d.columnUtteranceIndex
        ];
        if (colUtteranceObject.insistence) {
          this.insistenceIconDrawer.similarityBlock = d;
        } else {
          // unknown insistence
          this.uncertainIconDrawer.similarityBlock = d;
        }
      }

      this.refutationIconDrawer.update();
      this.insistenceIconDrawer.update();
      this.uncertainIconDrawer.update();
    };

    this.participantBlocksDrawer.clickListener = () => {
      this.similarityBlocksDrawer.update();
    };
    this.topicGroupsDrawer = new TopicGroupsDrawer(
      this.svgGSelection,
      debateDataSet,
      dataStructureSet,
      termType
    );
    this.manualSmallTGsDrawer = new TopicGroupsDrawer(
      this.svgGSelection,
      debateDataSet,
      dataStructureSet,
      termType
    );
    this.manualSmallTGsDrawer.color = "#424242";
    this.manualMiddleTGsDrawer = new TopicGroupsDrawer(
      this.svgGSelection,
      debateDataSet,
      dataStructureSet,
      termType
    );
    this.manualMiddleTGsDrawer.color = "#939393";
    this.manualFullTGsDrawer = new TopicGroupsDrawer(
      this.svgGSelection,
      debateDataSet,
      dataStructureSet,
      termType
    );
    this.manualFullTGsDrawer.color = "#000000";
    this.manualBigTGsDrawer = new TopicGroupsDrawer(
      this.svgGSelection,
      debateDataSet,
      dataStructureSet,
      termType
    );
    this.manualBigTGsDrawer.color = "#ff0000";
    this.manualPeopleTGsDrawer = new TopicGroupsDrawer(
      this.svgGSelection,
      debateDataSet,
      dataStructureSet,
      termType
    );
    this.manualPeopleTGsDrawer.color = "#c";
    this.lcsegEGsDrawer = new TopicGroupsDrawer(
      this.svgGSelection,
      debateDataSet,
      dataStructureSet,
      termType
    );
    this.lcsegEGsDrawer.color = "#cc9900";

    this.svgSelection.on("click", (event) => {
      console.log("svg clicked", event);
      // show all similarityBlocks
      _.forEach(
        dataStructureSet.similarityBlockManager.similarityBlocks,
        (similarityBlock) => {
          similarityBlock.visible = true;
        }
      );
      this.similarityBlocksDrawer.update();
      this.participantBlocksDrawer.emptySelectedParticipants();

      this.insistenceIconDrawer.similarityBlock = null;
      this.insistenceIconDrawer.update();
      this.refutationIconDrawer.similarityBlock = null;
      this.refutationIconDrawer.update();
      this.uncertainIconDrawer.similarityBlock = null;
      this.uncertainIconDrawer.update();
    });
  }

  public centerConceptualRecurrentPlot() {
    const utteranceObjectsForDrawing = this.dataStructureSet
      .utteranceObjectsForDrawingManager.utteranceObjectsForDrawing;
    if (utteranceObjectsForDrawing.length !== 0) {
      const lastUtteranceObjectForDrawing =
        utteranceObjectsForDrawing[utteranceObjectsForDrawing.length - 1];

      const minusWidth =
        lastUtteranceObjectForDrawing.beginningPointOfXY +
        lastUtteranceObjectForDrawing.width;
      const minusHeight =
        lastUtteranceObjectForDrawing.beginningPointOfXY +
        lastUtteranceObjectForDrawing.width;
      const adjustedWidth = (this.svgWidth - minusWidth) / 2 - 750;
      const adjustedHeight = (this.svgHeight - minusHeight + 140) / 2 - 50;
      // const adjustedWidth = -550;
      // const adjustedHeight = this.svgHeight / 4;

      this.svgGSelection
        .attr("transform", `translate(${adjustedWidth}, ${adjustedHeight})`)
        .style("");
      if (this._zoomListener) {
        const element = document.createElement("div");
        const transform = zoomTransform(element);
        this._zoomListener(transform.translate(adjustedWidth, adjustedHeight));
      }
    } else {
      console.warn("no utteranceObjectsForDrawing");
    }
  }

  public set zoomListener(zoomListener: (transform: d3.ZoomTransform) => void) {
    this._zoomListener = zoomListener;
  }
}
