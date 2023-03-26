/* eslint-disable no-unused-vars */
import { Button, Checkbox } from "antd";
import React, { useState } from "react";
import styles from "./Home.module.scss";
import { Link } from "react-router-dom";
import Axios from "axios";
import {
  aiopenAccessKey,
  nodeExpressAddress,
  pythonFlaskAddress,
} from "../../constants/constants";
import { TermType } from "../ConceptualRecurrencePlot/DataImporter";
import { style } from "d3-selection";

interface ComponentProps {}

function Home(props: ComponentProps) {
  const [termType, setTermType] = useState<TermType>("compound_term");

  return (
    <div className={styles.home}>
      <div className={styles.serviceTitle}>MDVis</div>

      <div className={styles.links}>
        <Button
          className={styles.button}
          href={`/coocurence_matrix?debate_name=기본소득&term_type=${termType}`}
        >
          기본소득
        </Button>
        <Button
          className={styles.button}
          href={`/coocurence_matrix?debate_name=정시확대&term_type=${termType}`}
        >
          정시 확대
        </Button>
      </div>
      <div className={styles.links}>
        <Button
          className={styles.button}
          href={`/coocurence_matrix?debate_name=모병제&term_type=${termType}`}
        >
          모병제
        </Button>
      </div>

      <div className={styles.links}>
      </div>
    </div>
  );
}

export default Home;
