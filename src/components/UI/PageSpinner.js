import Spinner from "./Spinner";
import React from "react";

export default function PageSpinner () {
  return (
    <p className="page-loading">
      <Spinner/>
    </p>
  );
}