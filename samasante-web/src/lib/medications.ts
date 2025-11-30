// Common medications database for Senegal/West Africa
export const COMMON_MEDICATIONS = [
    // Antibiotics
    { name: "Amoxicilline", category: "Antibiotique", commonDosages: ["500mg", "1g"], frequencies: ["3 fois/jour", "2 fois/jour"] },
    { name: "Azithromycine", category: "Antibiotique", commonDosages: ["250mg", "500mg"], frequencies: ["1 fois/jour"] },
    { name: "Ciprofloxacine", category: "Antibiotique", commonDosages: ["500mg", "750mg"], frequencies: ["2 fois/jour"] },
    { name: "Métronidazole", category: "Antibiotique", commonDosages: ["250mg", "500mg"], frequencies: ["3 fois/jour"] },

    // Pain & Fever
    { name: "Paracétamol", category: "Antalgique", commonDosages: ["500mg", "1g"], frequencies: ["3 fois/jour", "4 fois/jour"] },
    { name: "Ibuprofène", category: "Anti-inflammatoire", commonDosages: ["200mg", "400mg"], frequencies: ["3 fois/jour"] },
    { name: "Diclofénac", category: "Anti-inflammatoire", commonDosages: ["50mg", "75mg"], frequencies: ["2 fois/jour"] },

    // Cardiovascular
    { name: "Amlodipine", category: "Antihypertenseur", commonDosages: ["5mg", "10mg"], frequencies: ["1 fois/jour"] },
    { name: "Enalapril", category: "Antihypertenseur", commonDosages: ["5mg", "10mg", "20mg"], frequencies: ["1 fois/jour", "2 fois/jour"] },
    { name: "Atorvastatine", category: "Hypolipémiant", commonDosages: ["10mg", "20mg", "40mg"], frequencies: ["1 fois/jour le soir"] },
    { name: "Aspirine", category: "Antiagrégant", commonDosages: ["75mg", "100mg"], frequencies: ["1 fois/jour"] },

    // Diabetes
    { name: "Metformine", category: "Antidiabétique", commonDosages: ["500mg", "850mg", "1g"], frequencies: ["2 fois/jour", "3 fois/jour"] },
    { name: "Glibenclamide", category: "Antidiabétique", commonDosages: ["5mg"], frequencies: ["1 fois/jour", "2 fois/jour"] },

    // Gastrointestinal
    { name: "Oméprazole", category: "Antiulcéreux", commonDosages: ["20mg", "40mg"], frequencies: ["1 fois/jour"] },
    { name: "Ranitidine", category: "Antiulcéreux", commonDosages: ["150mg"], frequencies: ["2 fois/jour"] },
    { name: "Dompéridone", category: "Antiémétique", commonDosages: ["10mg"], frequencies: ["3 fois/jour"] },

    // Respiratory
    { name: "Salbutamol", category: "Bronchodilatateur", commonDosages: ["100µg/dose"], frequencies: ["2 bouffées 3-4 fois/jour"] },
    { name: "Prednisone", category: "Corticoïde", commonDosages: ["5mg", "20mg"], frequencies: ["1 fois/jour le matin"] },

    // Antihistamines
    { name: "Cétirizine", category: "Antihistaminique", commonDosages: ["10mg"], frequencies: ["1 fois/jour"] },
    { name: "Loratadine", category: "Antihistaminique", commonDosages: ["10mg"], frequencies: ["1 fois/jour"] },

    // Vitamins & Supplements
    { name: "Acide folique", category: "Vitamine", commonDosages: ["5mg"], frequencies: ["1 fois/jour"] },
    { name: "Fer (Sulfate ferreux)", category: "Supplément", commonDosages: ["200mg"], frequencies: ["1 fois/jour"] },
    { name: "Vitamine D3", category: "Vitamine", commonDosages: ["1000UI", "2000UI"], frequencies: ["1 fois/jour"] },

    // Antimalarials
    { name: "Artéméther + Luméfantrine", category: "Antipaludique", commonDosages: ["20mg/120mg"], frequencies: ["2 fois/jour pendant 3 jours"] },
    { name: "Quinine", category: "Antipaludique", commonDosages: ["300mg", "600mg"], frequencies: ["3 fois/jour"] },
]

// Prescription templates for common conditions
export const PRESCRIPTION_TEMPLATES = [
    {
        id: "hypertension",
        name: "Hypertension artérielle",
        diagnosis: "Hypertension artérielle essentielle",
        medications: [
            { medicationName: "Amlodipine", dosage: "5mg", frequency: "1 fois/jour le matin", duration: "30 jours", instructions: "À prendre à heure fixe" },
            { medicationName: "Aspirine", dosage: "100mg", frequency: "1 fois/jour", duration: "30 jours", instructions: "Après le repas" },
        ]
    },
    {
        id: "diabetes",
        name: "Diabète type 2",
        diagnosis: "Diabète de type 2",
        medications: [
            { medicationName: "Metformine", dosage: "850mg", frequency: "2 fois/jour", duration: "30 jours", instructions: "Pendant les repas" },
            { medicationName: "Glibenclamide", dosage: "5mg", frequency: "1 fois/jour le matin", duration: "30 jours", instructions: "Avant le petit-déjeuner" },
        ]
    },
    {
        id: "infection_respiratoire",
        name: "Infection respiratoire",
        diagnosis: "Infection des voies respiratoires supérieures",
        medications: [
            { medicationName: "Amoxicilline", dosage: "1g", frequency: "3 fois/jour", duration: "7 jours", instructions: "Bien respecter la durée du traitement" },
            { medicationName: "Paracétamol", dosage: "1g", frequency: "3 fois/jour si besoin", duration: "5 jours", instructions: "En cas de fièvre ou douleur" },
        ]
    },
    {
        id: "gastrite",
        name: "Gastrite / Reflux",
        diagnosis: "Gastrite / Reflux gastro-œsophagien",
        medications: [
            { medicationName: "Oméprazole", dosage: "20mg", frequency: "1 fois/jour le matin", duration: "30 jours", instructions: "À jeun, 30 min avant le petit-déjeuner" },
            { medicationName: "Dompéridone", dosage: "10mg", frequency: "3 fois/jour", duration: "10 jours", instructions: "Avant les repas" },
        ]
    },
    {
        id: "paludisme",
        name: "Paludisme simple",
        diagnosis: "Paludisme simple à Plasmodium falciparum",
        medications: [
            { medicationName: "Artéméther + Luméfantrine", dosage: "20mg/120mg", frequency: "2 fois/jour", duration: "3 jours", instructions: "Prendre avec un repas gras" },
            { medicationName: "Paracétamol", dosage: "1g", frequency: "3 fois/jour si besoin", duration: "3 jours", instructions: "En cas de fièvre" },
        ]
    },
]

export function searchMedications(query: string) {
    if (!query || query.length < 2) return []

    const lowerQuery = query.toLowerCase()
    return COMMON_MEDICATIONS.filter(med =>
        med.name.toLowerCase().includes(lowerQuery) ||
        med.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 10)
}

export function getMedicationByName(name: string) {
    return COMMON_MEDICATIONS.find(med =>
        med.name.toLowerCase() === name.toLowerCase()
    )
}
