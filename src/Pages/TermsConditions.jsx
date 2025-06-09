import React from 'react';

const TermsAndConditions = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6 sm:px-8 lg:px-10">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Conditions Générales d'Utilisation</h1>
                <div className="w-24 h-1 bg-indigo-600 mx-auto"></div>
                <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                    Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                </p>
            </div>
            
            <div className="prose lg:prose-lg text-gray-700 space-y-10">
                <section className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
                    <p className="text-lg leading-relaxed mb-6">
                        Bienvenue sur KaraLearn. En accédant et en utilisant notre plateforme, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation. Nous vous invitons à les lire attentivement.
                    </p>
                </section>

                <section className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
                        Introduction
                    </h2>
                    <div className="space-y-4">
                        <p>
                            KaraLearn est une plateforme éducative innovante qui a pour mission :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>D'améliorer l'expérience d'apprentissage des élèves</li>
                            <li>De faciliter la communication entre élèves, enseignants et parents</li>
                            <li>De fournir des outils pédagogiques adaptés</li>
                            <li>De promouvoir l'éducation numérique</li>
                        </ul>
                    </div>
                </section>

                <section className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                        Accès au service
                    </h2>
                    <div className="space-y-4">
                        <p>
                            L'accès aux fonctionnalités de KaraLearn nécessite la création d'un compte utilisateur. En créant un compte, vous vous engagez à :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Fournir des informations exactes et à jour</li>
                            <li>Protéger la confidentialité de vos identifiants</li>
                            <li>Ne pas partager votre compte avec des tiers</li>
                            <li>Nous informer immédiatement de toute utilisation non autorisée</li>
                        </ul>
                        <p className="italic text-gray-600">
                            KaraLearn se réserve le droit de suspendre ou de résilier tout compte ne respectant pas ces obligations.
                        </p>
                    </div>
                </section>

                <section className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
                        Propriété intellectuelle
                    </h2>
                    <div className="space-y-4">
                        <p>
                            L'ensemble des contenus présents sur KaraLearn, comprenant notamment :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Les textes, articles et documents pédagogiques</li>
                            <li>Les interfaces graphiques et designs</li>
                            <li>Les vidéos, images et illustrations</li>
                            <li>Les logiciels et bases de données</li>
                        </ul>
                        <p>
                            sont la propriété exclusive de KaraLearn ou de ses concédants de licence et sont protégés par les lois en vigueur sur la propriété intellectuelle.
                        </p>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <p className="text-yellow-700">
                                Toute reproduction, modification ou exploitation non autorisée est strictement interdite et peut donner lieu à des poursuites judiciaires.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
                        Limitation de responsabilité
                    </h2>
                    <div className="space-y-4">
                        <p>
                            KaraLearn s'efforce de fournir un service de qualité mais ne peut garantir :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>L'absence totale d'interruption de service</li>
                            <li>L'exactitude absolue de tous les contenus</li>
                            <li>La compatibilité avec tous les dispositifs techniques</li>
                        </ul>
                        <p>
                            En aucun cas KaraLearn ne pourra être tenue responsable des dommages directs, indirects, accessoires ou spéciaux résultant de l'utilisation ou de l'impossibilité d'utiliser le service.
                        </p>
                    </div>
                </section>

                <section className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">5</span>
                        Modifications des conditions
                    </h2>
                    <div className="space-y-4">
                        <p>
                            KaraLearn peut modifier les présentes Conditions Générales d'Utilisation pour prendre en compte :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>L'évolution législative et réglementaire</li>
                            <li>L'ajout de nouvelles fonctionnalités</li>
                            <li>L'amélioration des services existants</li>
                        </ul>
                        <p>
                            Les utilisateurs seront informés des modifications par email au moins 15 jours avant leur entrée en vigueur. En cas de désaccord avec les nouvelles conditions, l'utilisateur peut résilier son compte avant la date d'application.
                        </p>
                    </div>
                </section>

                <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Acceptation des conditions</h3>
                    <p className="text-gray-600">
                        En utilisant KaraLearn, vous reconnaissez avoir pris connaissance des présentes Conditions Générales d'Utilisation et vous vous engagez à les respecter intégralement.
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                        Pour toute question relative à ces conditions, veuillez contacter notre service juridique à <span className="font-medium">legal@karalearn.com</span>.
                    </p>
                </section>
            </div>
        </div>
    );
}

export default TermsAndConditions;