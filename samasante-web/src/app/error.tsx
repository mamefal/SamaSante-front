'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Error boundary caught:', error)
    }, [error])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 rounded-full bg-red-100 p-3">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>

                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                            Une erreur est survenue
                        </h2>

                        <p className="mb-6 text-gray-600">
                            Nous sommes désolés, quelque chose s&apos;est mal passé. Veuillez réessayer.
                        </p>

                        {error.message && (
                            <div className="mb-6 w-full rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-700 font-mono break-words">
                                    {error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 w-full">
                            <Button
                                onClick={reset}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                Réessayer
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="outline"
                                className="flex-1"
                            >
                                Retour à l&apos;accueil
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
