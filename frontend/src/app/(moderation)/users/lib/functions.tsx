import { Chip } from "@mui/material";
import { User } from "./types";

export const userCardHeaderAction = (user: User) => {
  const label = user.active ? "Active" : "Inactive";
  const color: "error" | "success" = user.active ? "success" : "error";
  return (<Chip sx={{ width: 150 }} label={label} color={color} />)
};