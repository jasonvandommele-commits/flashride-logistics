export default function Reviews() {
  const reviews = [
    {
      name: "Audrey",
      date: "Il y a 3 mois",
      service: "Débarrasser des encombrants",
      text: "Parfait, rapide, efficace et serviable"
    },
    {
      name: "Ismaïl",
      date: "Il y a 3 mois",
      service: "Vider un box et livrer à mon domicile",
      text: "Top, mec génial ! Efficacité garantie"
    },
    {
      name: "Amelia",
      date: "Il y a 3 mois",
      service: "Déplacer un meuble",
      text: "Amazing job! Thank you!"
    },
    {
      name: "Violaine",
      date: "Il y a 3 mois",
      service: "Déplacer un meuble",
      text: "Très bien. Personne très sympathique et efficace."
    },
    {
      name: "Sirine",
      date: "Il y a 4 mois",
      service: "Louer un camion avec chauffeur",
      clientRegulier: true,
      text: "Agréable, magnifique, gentil, ponctuel"
    },
    {
      name: "Sharon",
      date: "Il y a 6 mois",
      service: "Aide au déménagement",
      text: "Super prestataire gentil et discret professionnel et méthodique arrive à l'heure je recommande x100"
    },
    {
      name: "Ella",
      date: "Il y a 6 mois",
      service: "Moving a piece of furniture",
      text: "Very professional and reliable!"
    },
    {
      name: "Sylvie",
      date: "Il y a 6 mois",
      service: "Déplacer un meuble",
      text: "TOP, Jason est vraiment SUPER, à l'heure au RV, très soigneux, très patient, vraiment à recommander."
    },
    {
      name: "Fernanda",
      date: "Il y a un an",
      service: "Débarrasser des encombrants",
      text: "J'ai fait appel à ce prestataire pour un enlèvement d'encombrants et je suis très satisfaite du service. Il a été ponctuel, efficace et surtout très sympa. Il a pris le temps de m'expliquer certaines choses, ce que j'ai vraiment apprécié. Je recommande sans hésiter !"
    },
    {
      name: "Hadjare",
      date: "Il y a un an",
      service: "Louer un camion avec chauffeur",
      text: "Jason a été très professionnel, ponctuel et m'a surtout énormément aidé pour mon déménagement. Il a été sympathique durant le trajet. Je le recommande fortement. Vos affaires seront déplacées en toute sécurité."
    },
    {
      name: "Maurice",
      date: "Il y a un an",
      service: "Enlèvement de déchets verts",
      text: "Prestataire parfait pour débarrassage d'encombrant jardin, équipé d'un camion de 20m³ pour le stockage. Recommandé, rapide et efficace."
    },
    {
      name: "Vincent",
      date: "Il y a un an",
      service: "Démonter, transporter, remonter un meuble",
      text: "Jason est un vrai pro, super volontaire et très sympa"
    },
    {
      name: "Christelle",
      date: "Il y a un an",
      service: "Débarrasser 2 matelas deux personnes",
      text: "Ponctuel et travail bien fait"
    },
    {
      name: "Sarah",
      date: "Il y a un an",
      service: "Louer un camion avec chauffeur",
      text: "Ponctuel, soigneux, efficace et très sympathique"
    },
    {
      name: "Sirine",
      date: "Il y a un an",
      service: "Louer un camion avec chauffeur",
      clientRegulier: true,
      text: "Il est super gentil et il est venu à l'heure"
    },
    {
      name: "Claudia",
      date: "Il y a un an",
      service: "Louer un camion avec chauffeur",
      clientRegulier: true,
      text: "Jason est arrivé à l'heure et a effectué le service de déménagement avec rapidité et efficacité. Il a été très aimable, attentif tout au long de l'intervention, et s'est montré toujours prêt à aider au-delà de ce qui était demandé. C'est une personne de confiance que je recommande sans hésitation."
    }
  ];

  return (
    <section className="py-24 px-6 bg-gray-100">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-orange-500 font-bold uppercase tracking-widest">
            Avis clients
          </p>

          <h2 className="text-3xl md:text-5xl font-black mt-4">
            Ce que nos clients en disent
          </h2>

          <div className="mt-5 flex items-center justify-center gap-2 text-lg">
            <span className="text-orange-500 font-black text-2xl">5,0 ★</span>
            <span className="text-gray-600">— 16 avis vérifiés sur Yoojo</span>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 scrollbar-hide">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition duration-300 flex flex-col shrink-0 w-[85%] sm:w-[380px] snap-start"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-orange-500">★★★★★</div>
                <span className="text-xs text-gray-400">{review.date}</span>
              </div>

              <p className="text-gray-700 leading-relaxed flex-grow italic">
                "{review.text}"
              </p>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{review.name}</p>
                  {review.clientRegulier && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                      Client régulier
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{review.service}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

