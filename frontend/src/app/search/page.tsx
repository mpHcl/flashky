import SearchClient from "../components/searchclient";

export default async function Search({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const params = await searchParams
  const query = params.q ?? "";
  return <SearchClient query={query} />;
}