import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import RantCard from '../components/rants/RantCard';

export default function RantLogPage() {
  const [rants, setRants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const res = await apiClient.get('/rants', { params });
      setRants(res.data.rants);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setError('Failed to load rants.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchRants();
  }, [fetchRants]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function clearSearch() {
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Rant Log</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total rants</p>
        </div>
        <Link to="/record" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
            <path d="M19 10h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0z" />
          </svg>
          New Rant
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search transcripts..."
          className="input-field flex-1"
        />
        {search && (
          <button type="button" onClick={clearSearch} className="btn-secondary px-3">
            ✕
          </button>
        )}
        <button type="submit" className="btn-secondary px-4">
          Search
        </button>
      </form>

      {search && (
        <p className="text-sm text-gray-400 mb-4">
          Showing results for "{search}" · {total} found
        </p>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-1/4 mb-3" />
              <div className="h-3 bg-gray-700 rounded mb-1" />
              <div className="h-3 bg-gray-700 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : rants.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🎙</div>
          <p className="text-gray-400 mb-4">
            {search ? 'No rants match your search.' : "You haven't recorded any rants yet."}
          </p>
          {!search && (
            <Link to="/record" className="btn-primary">
              Record your first rant
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {rants.map((rant) => (
            <RantCard key={rant.id} rant={rant} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-1 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-gray-400 text-sm">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="btn-secondary px-3 py-1 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
