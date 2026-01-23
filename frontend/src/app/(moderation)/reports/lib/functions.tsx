import { Chip } from "@mui/material";
import { ReportType } from "./types";

export const reportCardHeaderAction = (report: ReportType) => {
  let label: string;
  let color: "error" | "success" | "warning";
  if (report && report.verdict) {
    label = report.verdict.charAt(0).toUpperCase() + report.verdict.slice(1);
    color = report.verdict === "violation" ? "error" : "success";
  }
  else{
    label = "Pending";
    color = "warning";
  }

  return (<Chip sx={{ width: 150 }} label={label} color={color} />)
};