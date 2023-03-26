/* eslint-disable no-unused-vars */
import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  // Link
  useLocation,
  useHistory,
} from "react-router-dom";
import "./App.scss";

import Timeline from "./views/Timeline/Timeline";
import ConceptualRecurrencePlot from "./views/ConceptualRecurrencePlot/ConceptualRecurrencePlot";
import Home from "./views/Home/Home";
import FunctionComponentTemplate from "./views/FunctionComponentTemplate/FunctionComponentTemplate";
import ClassComponentTemplate from "./views/ClassComponentTemplate/ClassComponentTemplate";
import TranscriptViewerM from "./views/TranscriptViewerM/TranscriptViewerM";
import TranscriptSubjectTest from "./views/TranscriptSubjectTest/TranscriptSubjectTest";
import DescriptionForManualTopicSegmentation from "./views/TestDescription/TestDescription";
import VideoSubjectTest from "./views/VideoSubjectTest/VideoSubjectTest";
import SubjectTestEnd from "./views/SubjectTestEnd/SubjectTestEnd";
import SampleViewOfTopicSegmentation from "./views/SampleViewOfTopicSegmentation/SampleViewOfTopicSegmentation";

function App() {
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
          <Route path="/video-subject-test">
            <VideoSubjectTest />
          </Route>
          <Route path="/test-description">
            <DescriptionForManualTopicSegmentation />
          </Route>
          <Route path="/coocurence_matrix">
            {/* @ts-ignore */}
            <ConceptualRecurrencePlot></ConceptualRecurrencePlot>
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
