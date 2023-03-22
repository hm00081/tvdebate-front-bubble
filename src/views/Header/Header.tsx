import style from "./Header.module.scss";
import React from "react";

export default function Header() {
  return (
    <a className={style.mainLink}>
      <div className={style.navi}>MetaDebateVis</div>
    </a>
  );
}
