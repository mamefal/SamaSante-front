'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function DoctorError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Doctor section error:', error)
    }, [error])

    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-md text-center">
                <div className="mb-4 inline-flex rounded-full bg-red-100 p-3">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>

                <h2 className="mb-2 text-2xl font-bold">
                    Erreur dans l&apos;espace médecin
                </h2>

                <p className="mb-6 text-gray-600">
                    Une erreur est survenue lors du chargement de cette page.
                </p>

                <div className="flex gap-3 justify-center">
                    <Button onClick={reset}>
                        Réessayer
                    </Button>
                    <Button onClick={() => window.location.href = '/doctor'} variant="outline">
                        Retour au dashboard
                    </Button>
                </div>
            </div>
        </div>
    )
}
