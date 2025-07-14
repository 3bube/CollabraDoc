"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { documentApi } from "@/lib/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
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

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Search Documents</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Search by title or content..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="space-y-4">
        {results.map(doc => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <Link href={`/doc/${doc.id}`} className="hover:underline">
                <h2 className="text-lg font-semibold mb-1">{doc.title}</h2>
              </Link>
              <p className="text-sm text-muted-foreground mb-2">
                {doc.content.split("\n")[0].replace(/#+\s*/, "").slice(0, 120)}
                {doc.content.length > 120 ? "..." : ""}
              </p>
              <span className="text-xs text-muted-foreground">
                Last updated: {new Date(doc.updated_at).toLocaleString()}
              </span>
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && !loading && (
          <div className="text-muted-foreground text-center">No results found.</div>
        )}
      </div>
    </div>
  );
} 