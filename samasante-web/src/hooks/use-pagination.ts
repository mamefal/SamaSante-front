import { useState, useEffect } from 'react'

export function usePagination<T>(
    items: T[],
    itemsPerPage: number = 10
) {
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(items.length / itemsPerPage)

    const currentItems = items.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const goToPage = (page: number) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages))
        setCurrentPage(pageNumber)
    }

    const nextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }

    const previousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1))
    }

    // Reset to page 1 when items change
    useEffect(() => {
        setCurrentPage(1)
    }, [items.length])

    return {
        currentPage,
        totalPages,
        currentItems,
        goToPage,
        nextPage,
        previousPage,
        itemsPerPage,
        totalItems: items.length,
    }
}
