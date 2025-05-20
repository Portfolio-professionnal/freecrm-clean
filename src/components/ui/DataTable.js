'use client';

import { useState, forwardRef } from 'react';
import { FiChevronUp, FiChevronDown, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import Button from './Button';

const DataTable = forwardRef(
  (
    {
      columns,
      data,
      onRowClick,
      actions,
      sortable = true,
      filterable = true,
      pagination = true,
      itemsPerPageOptions = [10, 25, 50, 100],
      defaultItemsPerPage = 10,
      emptyMessage = 'Aucune donnée disponible',
      isLoading = false,
      rowClassName,
    },
    ref
  ) => {
    // État pour le tri
    const [sortConfig, setSortConfig] = useState({
      key: null,
      direction: 'asc',
    });

    // État pour les filtres
    const [filters, setFilters] = useState({});
    const [showFilters, setShowFilters] = useState(false);

    // État pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

    // Fonction pour trier les données
    const sortedData = () => {
      if (!sortConfig.key) return filteredData();

      return [...filteredData()].sort((a, b) => {
        if (a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === null) return -1;
        if (a[sortConfig.key] === undefined) return 1;
        if (b[sortConfig.key] === undefined) return -1;

        const aValue = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
        const bValue = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    };

    // Fonction pour filtrer les données
    const filteredData = () => {
      return data.filter((item) => {
        return Object.keys(filters).every((key) => {
          if (!filters[key]) return true;
          
          const filterValue = filters[key].toLowerCase();
          const itemValue = item[key];
          
          if (itemValue === null || itemValue === undefined) return false;
          
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(filterValue);
          } else if (typeof itemValue === 'number') {
            return itemValue.toString().includes(filterValue);
          } else if (typeof itemValue === 'boolean') {
            return itemValue.toString() === filterValue;
          } else if (itemValue instanceof Date) {
            return itemValue.toISOString().includes(filterValue);
          }
          
          return false;
        });
      });
    };

    // Fonction pour changer le tri
    const handleSort = (key) => {
      if (!sortable) return;
      
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };

    // Fonction pour changer le filtre
    const handleFilterChange = (key, value) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
      setCurrentPage(1); // Revenir à la première page lors du filtrage
    };

    // Fonction pour réinitialiser les filtres
    const handleResetFilters = () => {
      setFilters({});
      setShowFilters(false);
    };

    // Données paginées
    const paginatedData = () => {
      const sorted = sortedData();
      if (!pagination) return sorted;
      
      const startIndex = (currentPage - 1) * itemsPerPage;
      return sorted.slice(startIndex, startIndex + itemsPerPage);
    };

    // Nombre total de pages
    const totalPages = Math.ceil(sortedData().length / itemsPerPage);

    // Changer de page
    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

    // Changer le nombre d'éléments par page
    const handleItemsPerPageChange = (e) => {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1); // Revenir à la première page
    };

    // Rendu du composant
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg" ref={ref}>
        {/* Filtres et actions */}
        <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div className="flex items-center">
            {filterable && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FiFilter />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filtres
                </Button>
              </div>
            )}
          </div>
          
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">Filtres</h3>
              <Button
                variant="ghost"
                size="xs"
                icon={<FiX />}
                onClick={handleResetFilters}
              >
                Réinitialiser
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {columns
                .filter((column) => column.filterable !== false)
                .map((column) => (
                  <div key={`filter-${column.key}`} className="flex flex-col">
                    <label
                      htmlFor={`filter-${column.key}`}
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      {column.header}
                    </label>
                    <input
                      id={`filter-${column.key}`}
                      type="text"
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      placeholder={`Filtrer par ${column.header.toLowerCase()}`}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      sortable && column.sortable !== false
                        ? 'cursor-pointer hover:bg-gray-100'
                        : ''
                    }`}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.header}</span>
                      {sortable &&
                        column.sortable !== false &&
                        sortConfig.key === column.key && (
                          <span>
                            {sortConfig.direction === 'asc' ? (
                              <FiChevronUp className="h-4 w-4" />
                            ) : (
                              <FiChevronDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    <div className="flex justify-center items-center">
                      <svg
                        className="animate-spin h-5 w-5 text-primary-500 mr-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Chargement...
                    </div>
                  </td>
                </tr>
              ) : paginatedData().length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData().map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className={`${
                      onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                    } ${typeof rowClassName === 'function' ? rowClassName(row) : rowClassName || ''}`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((column) => (
                      <td
                        key={`${row.id || rowIndex}-${column.key}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center text-sm text-gray-700 mb-3 sm:mb-0">
              <span>
                Affichage de{' '}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                à{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, sortedData().length)}
                </span>{' '}
                sur <span className="font-medium">{sortedData().length}</span>{' '}
                résultats
              </span>
            </div>
            <div className="flex items-center">
              <select
                className="mr-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} par page
                  </option>
                ))}
              </select>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Précédent</span>
                  <FiChevronUp className="h-5 w-5 transform rotate-90" />
                </button>

                {/* Afficher les pages */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    // Moins de 5 pages, afficher toutes les pages
                    pageNum = i + 1;
                  } else {
                    // Plus de 5 pages, afficher un sous-ensemble
                    if (currentPage <= 3) {
                      // Début de la pagination
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // Fin de la pagination
                      pageNum = totalPages - 4 + i;
                    } else {
                      // Milieu de la pagination
                      pageNum = currentPage - 2 + i;
                    }
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === pageNum
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Suivant</span>
                  <FiChevronDown className="h-5 w-5 transform rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';

export default DataTable;