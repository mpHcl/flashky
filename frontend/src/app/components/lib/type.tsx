import { JSX } from "react";

export type Route = {
  name: string;
  route: string;
  submenu?: boolean;
  icon?: JSX.Element;
  subroutes?: Route[];
}