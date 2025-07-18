"use client";

import React, { Suspense } from "react";
import { SearchResults } from "@/components/SearchResults";

export default function SearchPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Search Documents</h1>
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
