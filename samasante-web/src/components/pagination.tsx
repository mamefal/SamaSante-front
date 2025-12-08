"use client"

import { useState } from "react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    itemsPerPage?: number
    totalItems?: number
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
}: PaginationProps) {
    const [inputPage, setInputPage] = useState("")

    const handlePageInput = (e: React.FormEvent) => {
        e.preventDefault()
        const page = parseInt(inputPage)
        if (page >= 1 && page <= totalPages) {
            onPageChange(page)
            setInputPage("")
        }
    }

    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const showPages = 5

        if (totalPages <= showPages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i)
                pages.push("...")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push("...")
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
                pages.push("...")
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            {/* Info */}
            {totalItems !== undefined && itemsPerPage !== undefined && (
                <div className="text-sm text-muted-foreground">
                    Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} à{" "}
                    {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} résultats
                </div>
            )}

            {/* Pagination */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Précédent
                </button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) =>
                        page === "..." ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === page
                                        ? "bg-blue-600 text-white"
                                        : "border border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Suivant
                </button>

                {/* Quick jump */}
                <form onSubmit={handlePageInput} className="hidden sm:flex items-center gap-2 ml-4">
                    <span className="text-sm text-muted-foreground">Aller à</span>
                    <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={inputPage}
                        onChange={(e) => setInputPage(e.target.value)}
                        placeholder={currentPage.toString()}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </form>
            </div>
        </div>
    )
}
