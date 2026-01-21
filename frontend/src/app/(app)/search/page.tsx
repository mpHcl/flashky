import Search from "@/app/components/Search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const params = await searchParams
  const query = params.q ?? "";
  return <Search query={query} />;
}