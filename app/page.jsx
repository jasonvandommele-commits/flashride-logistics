export default function FlashrideLogisticsWebsite() {
  return (
    <main className="bg-white text-gray-900 min-h-screen">

      {/* Navigation */}
<nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md text-gray-900 shadow-md">

  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

    <div className="flex items-center gap-3">
  <img
    src="/images/IMG_0265.png"
    alt="Flashride Logistics"
    className="h-16 w-auto object-contain"
  />

  <div className="text-xl font-extrabold tracking-wide">
    <span className="text-blue-600">FLASH</span>
    <span className="text-orange-500">RIDE</span>
    <span className="text-blue-600"> LOGISTICS</span>
  </div>
</div>

          <div className="hidden md:flex gap-8 items-center text-sm font-medium">
            <a href="#" className="hover:text-orange-500 transition">
              Accueil
            </a>

            <a href="#services" className="hover:text-orange-500 transition">
              Services
            </a>

            <a href="#about" className="hover:text-orange-500 transition">
              Entreprise
            </a>

            <a href="#contact" className="hover:text-orange-500 transition">
              Contact
            </a>

            <a
              href="#devis"
              className="bg-orange-500 px-5 py-3 rounded-xl font-bold hover:bg-orange-600"
            >
              Demander un devis
            </a>
          </div>

        </div>
      </nav>


      {/* Hero */}
      <section className="pt-32 bg-gradient-to-br from-black via-slate-900 to-black text-white">

        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <p className="text-orange-400 font-bold uppercase tracking-widest mb-5">
              Transport Express Premium
            </p>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Vos livraisons
              <span className="text-orange-500">
                {" "}rapides
              </span>
              {" "}en France et en Europe.
            </h1>

            <p className="mt-8 text-xl text-gray-300 leading-relaxed">
              Flashride Logistics accompagne les entreprises avec des solutions
              de transport fiables, flexibles et adaptées aux urgences.
            </p>


            <div className="mt-10 flex flex-wrap gap-4">

              <a
                href="tel:0752988155"
                className="bg-orange-500 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600"
              >
                Appeler maintenant
              </a>


              <a
                href="#devis"
                className="border border-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-black"
              >
                Obtenir un devis
              </a>

            </div>

          </div>


          <div>
            <img
  src="/images/IMG_0255.jpeg"
  alt="Camion transport logistique"
  className="rounded-3xl shadow-2xl w-full h-[520px] object-cover"
/>
          </div>


        </div>

      </section>      
      {/* Services */}
      <section id="services" className="py-24 px-6 bg-gray-100">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Nos expertises
            </p>

            <h2 className="text-5xl font-black mt-4">
              Des solutions adaptées à vos besoins
            </h2>

            <p className="mt-5 text-gray-600 text-lg">
              Transport express, palettes et logistique professionnelle.
            </p>

          </div>


          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {[
              {
                title: "Transport express",
                text: "Livraisons urgentes avec une prise en charge rapide."
              },
              {
                title: "Transport palettes",
                text: "Acheminement sécurisé de vos marchandises."
              },
              {
                title: "Sous-traitance transport",
                text: "Un partenaire fiable pour vos besoins réguliers."
              },
              {
                title: "Livraison professionnelle",
                text: "Solutions adaptées aux entreprises."
              },
              {
                title: "Transport national",
                text: "Interventions partout en France."
              },
              {
                title: "Transport européen",
                text: "Une couverture adaptée à vos flux internationaux."
              }

            ].map((service, index) => (

              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition"
              >

                <div className="w-14 h-14 bg-orange-500 rounded-2xl mb-6"></div>

                <h3 className="text-2xl font-bold mb-3">
                  {service.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {service.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* Pourquoi nous */}
      <section className="py-24 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16">

            <p className="text-orange-500 font-bold uppercase tracking-widest">
              Notre engagement
            </p>

            <h2 className="text-5xl font-black mt-4">
              Pourquoi choisir Flashride ?
            </h2>

          </div>


          <div className="grid md:grid-cols-4 gap-6">

            {[
              ["24/7", "Disponibilité"],
              ["France", "Couverture nationale"],
              ["Europe", "Transport international"],
              ["100%", "Engagement qualité"]
            ].map((item,index)=>(

              <div
                key={index}
                className="bg-gray-100 rounded-3xl p-8 text-center"
              >

                <h3 className="text-4xl font-black text-orange-500">
                  {item[0]}
                </h3>

                <p className="mt-3 text-gray-600">
                  {item[1]}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>      
      {/* Entreprise */}
      <section id="about" className="py-24 px-6 bg-black text-white">

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <p className="text-orange-400 font-bold uppercase tracking-widest">
              Flashride Logistics
            </p>

            <h2 className="text-5xl font-black mt-5 leading-tight">
              Un partenaire transport pensé pour les professionnels.
            </h2>

            <p className="mt-8 text-gray-300 text-lg leading-relaxed">
              Nous accompagnons les entreprises avec des solutions de transport
              rapides et fiables. Notre objectif : garantir une livraison
              sécurisée, ponctuelle et adaptée à chaque besoin.
            </p>

            <p className="mt-5 text-gray-300 text-lg leading-relaxed">
              De la livraison urgente aux missions régulières, Flashride
              Logistics s'engage à fournir un service professionnel.
            </p>

          </div>


          <img
            src="https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=1200"
            alt="Logistique professionnelle"
            className="rounded-3xl shadow-2xl w-full h-[450px] object-cover"
          />

        </div>

      </section>



      {/* Devis */}
      <section id="devis" className="py-24 px-6 bg-gray-100">

        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">

            <h2 className="text-5xl font-black">
              Demandez votre devis
            </h2>

            <p className="mt-5 text-gray-600 text-lg">
              Décrivez votre besoin, nous vous répondrons rapidement.
            </p>

          </div>


          <form className="bg-white rounded-3xl shadow-xl p-8 grid md:grid-cols-2 gap-6">

            <input
              className="border rounded-xl p-4"
              placeholder="Nom / Entreprise"
            />

            <input
              className="border rounded-xl p-4"
              placeholder="Téléphone"
            />

            <input
              className="border rounded-xl p-4"
              placeholder="Email"
            />

            <input
              className="border rounded-xl p-4"
              placeholder="Ville de départ"
            />

            <input
              className="border rounded-xl p-4"
              placeholder="Ville d'arrivée"
            />

            <input
              className="border rounded-xl p-4"
              placeholder="Type de marchandise"
            />

            <textarea
              className="border rounded-xl p-4 md:col-span-2"
              placeholder="Votre demande"
              rows="5"
            />


            <button
              className="bg-orange-500 text-white font-bold text-lg rounded-xl p-4 md:col-span-2 hover:bg-orange-600"
            >
              Envoyer ma demande
            </button>

          </form>

        </div>

      </section>



      {/* Contact */}
      <section id="contact" className="py-20 px-6 bg-white">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-5xl font-black">
            Contactez-nous
          </h2>

          <div className="mt-12 grid md:grid-cols-3 gap-6">

            <div className="bg-gray-100 rounded-3xl p-8">
              <p className="text-orange-500 font-bold">
                Téléphone
              </p>
              <p className="mt-3">
                07 52 98 81 55
              </p>
            </div>


            <div className="bg-gray-100 rounded-3xl p-8">
              <p className="text-orange-500 font-bold">
                Email
              </p>
              <p className="mt-3">
                contact@flashride-logistics.com
              </p>
            </div>


            <div className="bg-gray-100 rounded-3xl p-8">
              <p className="text-orange-500 font-bold">
                Zone
              </p>
              <p className="mt-3">
                Île-de-France & Europe
              </p>
            </div>

          </div>

        </div>

      </section>



      {/* Footer */}
      <footer className="bg-black text-gray-400 py-8 text-center">

        © 2026 Flashride Logistics — Transport National & International

      </footer>


    </main>
  );
}