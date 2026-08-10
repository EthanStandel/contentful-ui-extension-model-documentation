type Page<T> = { items: Array<T>; total: number };

// The CMA caps `limit` at 100.
const PAGE_SIZE = 100;

/**
 * Reads every page of a paginated CMA collection.
 *
 * The first page is fetched alone to learn `total` and the page size the server
 * actually applied; every remaining page is then requested concurrently, so the
 * whole read costs two round trips rather than one per page.
 */
export const fetchAllPages = async <T extends { sys: { id: string } }>(
  fetchPage: (pagination: { limit: number; skip: number }) => Promise<Page<T>>,
) => {
  const first = await fetchPage({ limit: PAGE_SIZE, skip: 0 });

  // Stride by what the server actually returned rather than by PAGE_SIZE, so a
  // lower server-side cap doesn't leave gaps between the concurrent pages.
  const stride = first.items.length;
  if (!stride || stride >= first.total) return first.items;

  const skips = Array<number>();
  for (let skip = stride; skip < first.total; skip += stride) skips.push(skip);

  const rest = await Promise.all(
    skips.map((skip) => fetchPage({ limit: stride, skip })),
  );

  const merged = [first, ...rest].flatMap((page) => page.items);

  // A write landing between the first request and the concurrent ones shifts
  // every subsequent offset, which can put one entity on two pages.
  return Array.from(
    new Map(merged.map((item) => [item.sys.id, item])).values(),
  );
};
