/* eslint-disable no-unused-vars */
import { Checkbox } from "antd";
import React from "react";
import SliderWithInput from "../../../../components/SliderWithInput/SliderWithInput";
import { ConceptualMapDrawer } from "../ConceptualMapDrawer";
import { GraphDataStructureMaker } from "../GraphDataStructureMaker";
import styles from "./ConceptualMapControllers.module.scss";

interface ComponentProps {
  // props
  conceptualMapDrawer?: ConceptualMapDrawer;
  graphDataStructureMaker?: GraphDataStructureMaker;
  maxCooccurrence: number;
  maxCount: number;
  maxCountNode: number;
  standardTermCount: number;
  maxOfLinksPerNode: number;
  showNodeForCount: boolean; // 노드 필터링
  showNodeNotHavingLinks: boolean; // 링크 관계 필터링
  maxCountPerNodesSliderListener: (changedValue: number) => void;
  standardTermCountSliderListener: (changedValue: number) => void;
  maxOfLinksPerNodeSliderListener: (changedValue: number) => void;
  showNodeNotHavingLinksCheckboxListener: (checked: boolean) => void;
  //showSentimentAnalysisCheckboxListener: (checked: boolean) => void;
}
interface ComponentState {
  nodeSizeMultiplier: number;
}

class ConceptualMapControllers extends React.Component<
  ComponentProps,
  ComponentState
> {
  constructor(props: ComponentProps) {
    super(props);
    this.state = {
      nodeSizeMultiplier: 1,
    };
  }

  render() {
    return (
      <div className={styles.conceptualMapControllers}>
        {/* <div>Change Node Size</div>
        <SliderWithInput
          min={1}
          max={10}
          value={this.state.nodeSizeMultiplier}
          onChangeListener={(changedValue) => {
            this.props.conceptualMapDrawer!.setNodeSizeMultiplier(changedValue);
            this.props.conceptualMapDrawer!.updateGraph();

            this.setState({
              nodeSizeMultiplier: changedValue,
            });
          }}
        ></SliderWithInput> */}

        <div>동시 발생 횟수별 링크 수</div>
        <SliderWithInput
          min={0}
          max={this.props.maxCooccurrence}
          value={this.props.standardTermCount}
          onChangeListener={(changedValue) => {
            // Make new nodes, links
            this.props.graphDataStructureMaker;
            const nodesAndLinks = this.props.graphDataStructureMaker!.generateNodesAndLinks(
              changedValue,
              this.props.maxOfLinksPerNode,
              this.props.showNodeNotHavingLinks
            );
            // console.log(nodesAndLinks);
            this.props.conceptualMapDrawer!.setGraphData(nodesAndLinks);
            this.props.conceptualMapDrawer!.updateGraph();

            this.props.standardTermCountSliderListener(changedValue);
          }}
        ></SliderWithInput>

        {/* <div>노드 카운트 필터링</div>
        <SliderWithInput
          min={0}
          max={100}
          value={this.props.maxCountNode}
          onChangeListener={(changedValue) => {
            // Make new nodes, links
            this.props.graphDataStructureMaker;
            const nodesAndLinks = this.props.graphDataStructureMaker!.generateNodesAndLinks(
              changedValue,
              this.props.maxOfLinksPerNode,
              this.props.showNodeForCount
            );
            // console.log(nodesAndLinks);
            this.props.conceptualMapDrawer!.setGraphData(nodesAndLinks);
            this.props.conceptualMapDrawer!.updateGraph();

            this.props.maxCountPerNodesSliderListener(changedValue);
          }}
        ></SliderWithInput> */}

        <div>Number of Links per a Node</div>
        <SliderWithInput
          min={0}
          max={10}
          value={this.props.maxOfLinksPerNode}
          onChangeListener={(changedValue) => {
            // make new nodes, links
            const nodesAndLinks = this.props.graphDataStructureMaker!.generateNodesAndLinks(
              this.props.standardTermCount,
              changedValue,
              this.props.showNodeNotHavingLinks
            );
            this.props.conceptualMapDrawer!.setGraphData(nodesAndLinks);
            this.props.conceptualMapDrawer!.updateGraph();

            this.props.maxOfLinksPerNodeSliderListener(changedValue);
          }}
        ></SliderWithInput>

        <Checkbox
          className={styles.checkbox}
          defaultChecked
          onChange={(event) => {
            const showNodeNotHavingLinks = event.target.checked;
            // make new nodes, links
            const nodesAndLinks = this.props.graphDataStructureMaker!.generateNodesAndLinks(
              this.props.standardTermCount,
              this.props.maxOfLinksPerNode,
              showNodeNotHavingLinks
            );
            this.props.conceptualMapDrawer!.setGraphData(nodesAndLinks);
            this.props.conceptualMapDrawer!.updateGraph();

            this.props.showNodeNotHavingLinksCheckboxListener(
              showNodeNotHavingLinks
            );
          }}
        >
          Visible Node Without Link
        </Checkbox>

        <Checkbox
          className={styles.checkbox}
          // defaultChecked
          onChange={(event) => {
            this.props.conceptualMapDrawer!.sentimentMarkerVisible =
              event.target.checked;
            this.props.conceptualMapDrawer!.updateGraph();
          }}
        >
          Visible Sentiment Analysis
        </Checkbox>
        {/* Delete Minimum Keyword + 세부 인터랙션이 필요한 곳에 대한 컴포넌트 만들 수 있다.*/}

        {/* <div style={{ marginBottom: 12 }}>
          checkbox for &apos;at least 1 link or not&apos;
        </div> */}
      </div>
    );
  }
}

export default ConceptualMapControllers;
