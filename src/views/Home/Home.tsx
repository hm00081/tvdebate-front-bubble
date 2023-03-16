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
      {/* <Checkbox
        className={styles.checkbox}
        defaultChecked
        onChange={(event) => {
          console.log(event.target.checked);
          if (event.target.checked) {
            setTermType("compound_term");
          } else {
            setTermType("single_term");
          }
        }}
      >
        use compound_term
      </Checkbox> */}

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
        {/* <Button
          className={styles.button}
          href={`/coocurence_matrix?debate_name=sample&term_type=${termType}`}
        >
          기본소득
        </Button> */}
      </div>
      <div className={styles.links}>
        <Button
          className={styles.button}
          href={`/coocurence_matrix?debate_name=모병제&term_type=${termType}`}
        >
          모병제
        </Button>
        {/* <Button
          className={styles.button}
          href="/coocurence_matrix?debate_name=?"
        >
          (Not Activated) 집 값, 과연 이번엔 잡힐까?
        </Button> */}
      </div>

      <div className={styles.links}>
        {/* <Button
          className={styles.button}
          href={`/coocurence_matrix?debate_name=sample&term_type=${termType}`}
        >
          sample
        </Button> */}
      </div>

      {/* <div className={styles.apiTestTitle}>API Test</div>

      <div className={styles.apiButtons}>
        <Button
          className={styles.apiButton}
          onClick={() => {
            Axios.get(nodeExpressAddress)
              .then((response) => {
                console.log("response", response);
              })
              .catch((error) => {
                console.error("error", error);
              });
          }}
        >
          Node Express Server API Test
        </Button>

        <Button
          className={styles.apiButton}
          onClick={() => {
            Axios.get(pythonFlaskAddress)
              .then((response) => {
                console.log("response", response);
              })
              .catch((error) => {
                console.error("error", error);
              });
          }}
        >
          Flask Server API Test
        </Button>

        <Button
          className={styles.apiButton}
          onClick={() => {
            // http://aiopen.etri.re.kr:8000/WiseNLU
            // http://aiopen.etri.re.kr:8000/WiseNLU_spoken
            Axios.post("http://aiopen.etri.re.kr:8000/WiseNLU", {
              access_key: aiopenAccessKey,
              argument: {
                analysis_code: "morp",
                // analysis_code: "dparse",
                text:
                  // "관료들만 아는 암호 같은 거 하지 말고, 이런 생각이 들어서 그 재난지원금에서는 저는 그런 중요한 민주주의적 효과를 발견했습니다.",
                  // "소득을 정부에서 뭔가 주려면 서류 작업을 열심히 해야 되고 내가 재산이 얼마인지 가서 보고해야 되고 내가 취업하려고 어디 가서 이력서 냈다는 거 내야 되고 이런 것들이 있었는데 그것이 없는 재난지원금이란 걸 모든 사람들한테 딱 주니까 이것만 해도 정말 천지개벽할 경험인 거죠.",
                  "이게 결국에는 소득을 지급하고 지급하는 쪽이 있고요. 그 다음에 이 재원을 마련하는 쪽이 있지 않습니까? 양쪽이 다 있어요.",
              },
            })
              .then((response) => {
                console.log("response", response);
              })
              .catch((error) => {
                console.error("errlr", error);
              });
          }}
        >
          AI-Open API Test
        </Button>
      </div> */}

      {/* <div className={styles.evaluationTitle}>Evaluation</div> */}
      {/* <Button>
        <Link to="/test-description?debate_name=기본소득clipped">
          Description of Evaluation
        </Link>
      </Button> */}
    </div>
  );
}

export default Home;
