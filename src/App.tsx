/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  // Link
  useLocation,
  useHistory,
} from "react-router-dom";
import "./App.scss";
import { DataStructureManager } from "./views/ConceptualRecurrencePlot/DataStructureMaker/DataStructureManager";
import Timeline from "./views/Timeline/Timeline";
import ConceptualRecurrencePlot from "./views/ConceptualRecurrencePlot/ConceptualRecurrencePlot";
import ConceptualRecurrencePlotTwo from "./views/ConceptualRecurrencePlot/ConceptualRecurrencePlotTwo";
import ConcecptualRecurrencePlotThree from "./views/ConceptualRecurrencePlot/ConceptualRecurrencePlotThree";
import ConceptualRecurrencePlotFour from "./views/ConceptualRecurrencePlot/ConceptualRecurrencePlotFour";
import Home from "./views/Home/Home";
import FunctionComponentTemplate from "./views/FunctionComponentTemplate/FunctionComponentTemplate";
import ClassComponentTemplate from "./views/ClassComponentTemplate/ClassComponentTemplate";
import TranscriptViewerM from "./views/TranscriptViewerM/TranscriptViewerM";
import TranscriptSubjectTest from "./views/TranscriptSubjectTest/TranscriptSubjectTest";
import SubjectTestEnd from "./views/SubjectTestEnd/SubjectTestEnd";
import SampleViewOfTopicSegmentation from "./views/SampleViewOfTopicSegmentation/SampleViewOfTopicSegmentation";
import Header from "./views/Header/Header";
import TranscriptViewer from "./views/ConceptualRecurrencePlot/TranscriptViewer/TranscriptViewer";

function App() {
  const [
    dataStructureManager,
    setDataStructureManager,
  ] = useState<DataStructureManager | null>(null);
  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/class-component-template">
            <ClassComponentTemplate />
          </Route>
          <Route path="/function-component-template">
            <FunctionComponentTemplate />
          </Route>
          <Route path="/transcripter-viewer-m">
            <TranscriptViewerM zxcvzxcv="ccccccc" />
          </Route>
          <Route path="/timeline">
            <Timeline></Timeline>
          </Route>
          <Route path="/sample-of-topic-segmentation">
            <SampleViewOfTopicSegmentation></SampleViewOfTopicSegmentation>
          </Route>
          <Route path="/test-for-manual-topic-segmentation">
            <TranscriptSubjectTest />
          </Route>
          <Route path="/subject-test-end">
            <SubjectTestEnd />
          </Route>
          <Route path="/bubble_chart">
            <div className="root-div">
              <Header />
              <div
                style={{
                  marginTop: "50px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* @ts-ignore */}
                  <ConceptualRecurrencePlotTwo></ConceptualRecurrencePlotTwo>
                  {/* @ts-ignore */}
                  <ConceptualRecurrencePlot key="ConceptualRecurrencePlot"></ConceptualRecurrencePlot>
                  {/* @ts-ignore */}
                  <ConcecptualRecurrencePlotThree></ConcecptualRecurrencePlotThree>
                  {/* @ts-ignore */}
                  <ConceptualRecurrencePlotFour></ConceptualRecurrencePlotFour>
                </div>
              </div>
            </div>
          </Route>
          <Route path="/">
            <Home />
          </Route>
          <Route path="/sample">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
