'use client'

import React, { useEffect, useState } from 'react'
import { billingService, PricingPlan } from '@/lib/billing'
import { Check, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
    const [plans, setPlans] = useState<PricingPlan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await billingService.getPlans()
                setPlans(data)
            } catch (error) {
                console.error('Failed to fetch plans', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPlans()
    }, [])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Plans Tarifaires Flexibles
                    </h2>
                    <p className="mt-4 text-xl text-gray-600">
                        Choisissez le plan adapté à la taille de votre établissement de santé.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                        >
                            <div className="px-6 py-8">
                                <h3 className="text-2xl font-bold text-gray-900 text-center">
                                    {plan.name}
                                </h3>
                                <div className="mt-4 flex justify-center items-baseline">
                                    <span className="text-5xl font-extrabold text-primary">
                                        {plan.monthlyPrice.toLocaleString()}
                                    </span>
                                    <span className="ml-1 text-xl text-gray-500">FCFA/mois</span>
                                </div>
                                <p className="mt-4 text-center text-gray-500 text-sm">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="px-6 pb-8 bg-gray-50">
                                <ul className="mt-6 space-y-4">
                                    {plan.features?.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <Check className="h-6 w-6 text-green-500" />
                                            </div>
                                            <p className="ml-3 text-base text-gray-700">{feature}</p>
                                        </li>
                                    ))}
                                    {plan.includesChat && (
                                        <li className="flex items-start">
                                            <Check className="h-6 w-6 text-green-500" />
                                            <p className="ml-3 text-base text-gray-700 font-medium">Chat Médical Inclus</p>
                                        </li>
                                    )}
                                    {plan.includesPharmacy && (
                                        <li className="flex items-start">
                                            <Check className="h-6 w-6 text-green-500" />
                                            <p className="ml-3 text-base text-gray-700 font-medium">Gestion Pharmacie Incluse</p>
                                        </li>
                                    )}
                                </ul>
                                <div className="mt-8">
                                    <Link
                                        href={`/auth/register-organization?plan=${plan.slug}`}
                                        className="block w-full bg-primary text-white text-center rounded-md py-3 font-semibold hover:bg-primary/90 transition"
                                    >
                                        Commencer l'essai
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
