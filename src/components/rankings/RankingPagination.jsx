export default function RankingPagination({ page, hasMore, loading, onPage }) {
  return <nav aria-label="Paginación" className="flex items-center justify-between gap-3 pt-4 text-sm">
    <button type="button" disabled={loading || page <= 1} onClick={() => onPage(page - 1)} className="cursor-pointer rounded-lg border border-gray-700 px-4 py-2 hover:border-purple-500 disabled:cursor-default disabled:opacity-40">Anterior</button>
    <span>Página {page}</span>
    <button type="button" disabled={loading || !hasMore} onClick={() => onPage(page + 1)} className="cursor-pointer rounded-lg border border-gray-700 px-4 py-2 hover:border-purple-500 disabled:cursor-default disabled:opacity-40">Siguiente</button>
  </nav>;
}
