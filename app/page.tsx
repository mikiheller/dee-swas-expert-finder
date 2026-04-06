import ExpertDirectory from "./components/ExpertDirectory";
import type { Expert } from "./components/ExpertDirectory";
import expertsData from "../data/experts.json";

export default function Home() {
  return <ExpertDirectory experts={expertsData as Expert[]} />;
}
