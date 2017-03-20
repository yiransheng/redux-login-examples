import React from "react";

export default ({ loading }) => {
  const style = loading ? {} : { visibility: "hidden" };
  return (
    <div className="loading_bar_container" style={style}>
      <div className="loading_bar" />
    </div>
  );
};
