/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

'use client';

import React from 'react';
import { toSearchParamNumber, toSearchParamString } from '@/utils/searchParams';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

/**
 * Example component demonstrating safe search parameter handling
 *
 * This component shows how to safely handle search parameters in client components
 * to avoid common bugs with string[] parameters.
 */
export default function SearchParamsExample() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Safely extract search parameters
  const query = toSearchParamString(searchParams.get('query'), '');
  const page = toSearchParamNumber(searchParams.get('page'), 1);
  const category = toSearchParamString(searchParams.get('category'), 'all');

  // Local state
  const [searchQuery, setSearchQuery] = useState(query);
  const [currentPage, setCurrentPage] = useState(page);
  const [selectedCategory, setSelectedCategory] = useState(category);

  // Update URL when filters change
  const updateFilters = () => {
    // Create a URLSearchParams object
    const params = new URLSearchParams();

    // Add parameters only if they have values
    if (searchQuery) {
      params.set('query', searchQuery);
    }

    params.set('page', currentPage.toString());

    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    // Create the URL with search parameters
    const url = `${window.location.pathname}?${params.toString()}`;

    // Navigate to the new URL
    router.push(url);
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1 on new search
    updateFilters();
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateFilters();
  };

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to page 1 on category change
    updateFilters();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Search Example</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2 mb-4">
          <label htmlFor="search-input" className="sr-only">
            Search query
          </label>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 p-2 border rounded"
            aria-label="Enter search query"
            title="Enter your search terms"
          />

          <label htmlFor="category-select" className="sr-only">
            Select category
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="p-2 border rounded"
            aria-label="Select search category"
            title="Choose a category to filter search results"
          >
            <option value="all">All Categories</option>
            <option value="vehicles">Vehicles</option>
            <option value="drivers">Drivers</option>
            <option value="weights">Weights</option>
          </select>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Search
          </button>
        </div>
      </form>

      <div className="mb-4">
        <p>Current Filters:</p>
        <ul className="list-disc pl-5">
          <li>Query: {query || '(none)'}</li>
          <li>Page: {page}</li>
          <li>Category: {category}</li>
        </ul>
      </div>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1">Page {currentPage}</span>
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
