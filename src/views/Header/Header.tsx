import style from "./Header.module.scss";
import React from "react";

interface LegendProps {
  color: string;
  label: string;
}

const participantColors = [
  { color: "#B60E3C", label: "이준석" },
  { color: "#C7611E", label: "박휘락" },
  { color: "#00AB6E", label: "김종대" },
  { color: "#00a0e2", label: "장경태" },
  //{ color: "#808080", label: "사회자" },
];

const topicColors = [
  // { color: "rgba(29, 29, 29, 1)", label: "대주제" },
  // { color: "rgba(255, 0, 0, 1)", label: "주제" },
  { color: "#400000", label: "논쟁" },
  { color: "#ff0000", label: "논쟁구간" },
  // { color: "rgba(97, 64, 65, 1)", label: "논쟁" },
];

const LegendItem: React.FC<LegendProps> = ({ color, label }) => {
  // const isOutlineOnly = label === "대주제" || label === "소주제";
  const isOutlineOnly = label === "논쟁구간";
  const rotateRectWidth = Math.sqrt(32);
  const transform = isOutlineOnly
    ? "translate(8, 11.5) rotate(45) translate(-8, -8)"
    : "";
  const labelStyle =
    label === "논쟁"
      ? { marginTop: "5px", marginRight: "11px" }
      : { marginTop: "5px" };

  return (
    <>
      <svg
        width="16"
        height="16"
        style={{ marginTop: "7.5px", marginRight: "5px", marginLeft: "8px" }}
      >
        <circle
          r={isOutlineOnly ? 5.5 : 7}
          cx={8}
          cy={8}
          fill={isOutlineOnly ? "none" : color}
          transform={transform}
          stroke={color}
          strokeWidth="1"
        />
      </svg>
      <div style={labelStyle}>{label}</div>
    </>
  );
};

export default function Header() {
  return (
    <a className={style.mainLink}>
      <div className={style.navi}>MetaDebateVis</div>
      <div className={style.naviTwo}>
        <h3 style={{ marginLeft: "5px", marginTop: "11.5px" }}>Legends:</h3>
        <div style={{ display: "flex", alignItems: "center" }}>
          {participantColors.map((item, i) => (
            <LegendItem
              key={i}
              color={item.color}
              label={item.label}
            ></LegendItem>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "-50px",
            marginLeft: "-327px",
          }}
        >
          {/* {topicColors.map((item, i) => (
            <LegendItem
              key={i}
              color={item.color}
              label={item.label}
            ></LegendItem>
          ))} */}
        </div>
      </div>
    </a>
  );
}
