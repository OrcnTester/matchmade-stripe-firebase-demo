// src/app/page.tsx
export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  const sp = (await searchParams) ?? {};
  const v = sp.view;
  const view = Array.isArray(v) ? v[0] : v ?? "default";

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">MatchMade</h1>
      <p className="text-sm text-gray-600">Current view: {view}</p>
      {/* ... geri kalan içerik ... */}
    </main>
  );
}
