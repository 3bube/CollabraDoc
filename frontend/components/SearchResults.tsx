"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { documentApi } from "@/lib/api";

export function SearchResults() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const docs = await documentApi.search(query);
      setResults(docs);
    } catch (err: any) {
      setError(err.message || "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Search by title or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="space-y-4">
        {results.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <Link href={`/doc/${doc.id}`} className="block">
                <h3 className="font-medium text-lg mb-1">{doc.title}</h3>
                <p className="text-muted-foreground">
                  Last modified: {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && !loading && query && !error && (
          <p>No results found for "{query}"</p>
        )}
      </div>
    </div>
  );
}
