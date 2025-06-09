import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6 sm:px-8 lg:px-10">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Politique de confidentialité</h1>
                <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            </div>
            
            <div className="prose lg:prose-lg xl:prose-xl text-gray-700">
                <p className="text-xl leading-relaxed mb-8">
                    Chez KaraLearn, la protection de vos données personnelles est une priorité absolue. Cette politique explique comment nous collectons, utilisons et protégeons vos informations dans le respect des réglementations en vigueur.
                </p>
                
                <div className="space-y-10">
                    <section className="border-l-4 border-blue-500 pl-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Informations collectées</h2>
                        <p className="leading-relaxed">
                            Dans le cadre de notre service, nous pouvons collecter : votre nom complet, adresse e-mail, âge, niveau d'étude, ainsi que toutes données nécessaires à la personnalisation de votre expérience d'apprentissage et à la gestion optimale de votre compte.
                        </p>
                    </section>
                    
                    <section className="border-l-4 border-blue-500 pl-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Utilisation des informations</h2>
                        <p className="leading-relaxed">
                            Vos informations nous permettent de : 
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Fournir un service personnalisé adapté à votre profil</li>
                                <li>Améliorer continuellement notre plateforme</li>
                                <li>Vous informer des nouveautés et fonctionnalités pertinentes</li>
                                <li>Assurer un support technique efficace</li>
                            </ul>
                        </p>
                    </section>
                    
                    <section className="border-l-4 border-blue-500 pl-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Partage des informations</h2>
                        <p className="leading-relaxed">
                            Nous nous engageons à ne jamais commercialiser vos données personnelles. Un partage strictement limité peut intervenir avec :
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Prestataires techniques (hébergement, paiement sécurisé)</li>
                                <li>Autorités légales sur requête officielle</li>
                            </ul>
                        </p>
                    </section>
                    
                    <section className="border-l-4 border-blue-500 pl-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Sécurité des données</h2>
                        <p className="leading-relaxed">
                            Nous implémentons des protocoles de sécurité avancés incluant :
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Chiffrement des données sensibles</li>
                                <li>Sauvegardes régulières</li>
                                <li>Contrôles d'accès stricts</li>
                                <li>Audits de sécurité périodiques</li>
                            </ul>
                        </p>
                    </section>
                    
                    <section className="border-l-4 border-blue-500 pl-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Modifications de la politique</h2>
                        <p className="leading-relaxed">
                            Toute mise à jour significative fera l'objet d'une notification transparente via :
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Notification par email</li>
                                <li>Avis visible sur notre plateforme</li>
                                <li>Date de dernière modification clairement indiquée</li>
                            </ul>
                        </p>
                    </section>
                </div>
                
                <div className="mt-12 bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Vos droits</h3>
                    <p className="text-blue-900">
                        Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour toute demande, contactez notre DPO à <span className="font-medium">dpo@karalearn.com</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;