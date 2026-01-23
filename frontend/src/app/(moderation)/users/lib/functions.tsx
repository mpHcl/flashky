import { Chip } from "@mui/material";
import { User } from "./types";

export const userCardHeaderAction = (user: User) => {
  let label = user.active ? "Active" : "Inactive";
  let color: "error" | "success" | "warning" = user.active ? "success" : "error";
  return (<Chip sx={{ width: 150 }} label={label} color={color} />)
};