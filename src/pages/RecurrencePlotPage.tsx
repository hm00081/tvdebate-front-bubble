import React from "react";
import Header from "../views/Header/Header";
import ConceptualRecurrencePlot from "../views/ConceptualRecurrencePlot/ConceptualRecurrencePlot";
import ConceptualRecurrencePlotTwo from "../views/ConceptualRecurrencePlot/ConceptualRecurrencePlotTwo";
import ConcecptualRecurrencePlotThree from "../views/ConceptualRecurrencePlot/ConceptualRecurrencePlotThree";
import ConceptualRecurrencePlotFour from "../views/ConceptualRecurrencePlot/ConceptualRecurrencePlotFour";

export default function PlotPage() {
  return (
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
          <ConceptualRecurrencePlot></ConceptualRecurrencePlot>
          {/* @ts-ignore */}
          <ConcecptualRecurrencePlotThree></ConcecptualRecurrencePlotThree>
          {/* @ts-ignore */}
          <ConceptualRecurrencePlotFour></ConceptualRecurrencePlotFour>
        </div>
      </div>
    </div>
  );
}
