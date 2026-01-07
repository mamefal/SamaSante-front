'use client'

import React, { useEffect, useState } from 'react'
import { billingService, Invoice } from '@/lib/billing'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, Download, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

export default function HospitalBillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [subscription, setSubscription] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [invoicesData, subData] = await Promise.all([
                    billingService.getInvoices(),
                    billingService.getSubscriptions(),
                ])
                setInvoices(invoicesData)
                // Assuming the first active subscription is the current one
                setSubscription(subData[0])
            } catch (error) {
                console.error('Failed to fetch billing data', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // ...

    const handlePay = async (invoiceId: number) => {
        // TODO: Integrate Payment Modal
        toast.info('Redirection vers la passerelle de paiement...', {
            description: "Simulation: Paiement validé avec succès !",
            duration: 3000,
        })
        const data = {
            invoiceId,
            amount: 0, // Should come from invoice
            paymentMethod: 'mobile_money'
        }
        // await billingService.payInvoice(data)
    }

    const handleDownloadInvoice = (invoiceNumber: string) => {
        toast.success(`Téléchargement de la facture ${invoiceNumber}`, {
            description: "Le PDF est en cours de génération."
        })
    }

    // ...

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50/30 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Facturation & Paiements</h1>
                    <p className="text-muted-foreground">Gérez vos abonnements et factures.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Abonnement Actuel</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{subscription?.plan || 'Aucun'}</div>
                        <p className="text-xs text-muted-foreground">
                            {subscription?.status === 'active' ? 'Actif' : 'Inactif'}
                        </p>
                    </CardContent>
                </Card>
                {/* Add more stats cards if needed */}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historique des Factures</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>N° Facture</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{format(new Date(invoice.dueDate), 'dd MMM yyyy', { locale: fr })}</TableCell>
                                    <TableCell>{invoice.amount} FCFA</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                            {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {invoice.status !== 'paid' && (
                                            <Button size="sm" onClick={() => handlePay(invoice.id)} className="mr-2">
                                                Payer
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(invoice.invoiceNumber)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {invoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                        Aucune facture trouvée
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
