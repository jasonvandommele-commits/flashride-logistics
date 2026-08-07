import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const data = await request.json();

    const {
        nom,
        telephone,
        email,
        prestation,
        vehicule,
        depart,
        arrivee,
        marchandise,
        message,
        date,
        volume,
        client,
      } = data;

    const result = await resend.emails.send({
      from: "Flashride Logistics <contact@flashride-logistics.fr>",
      to: "contact@flashride-logistics.fr",
      subject: "Nouvelle demande de transport Flashride Logistics",

      html: `
        <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">
          <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px;">

            <h1 style="color:#111;">
              Flashride Logistics
            </h1>

            <h2>
              Nouvelle demande de devis transport 🚚
            </h2>

            <hr>

            <h3>Informations client</h3>

            <p><strong>Nom / Entreprise :</strong> ${nom}</p>
            <p><strong>Téléphone :</strong> ${telephone}</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Type de client :</strong> ${client}</p>
            <p><strong>Date souhaitée :</strong> ${date}</p>
            <p><strong>Volume :</strong> ${volume}</p>
            
            <h3>Détails du transport</h3>

            <p><strong>Prestation :</strong> ${prestation}</p>
            <p><strong>Véhicule :</strong> ${vehicule}</p>
            <p><strong>Départ :</strong> ${depart}</p>
            <p><strong>Arrivée :</strong> ${arrivee}</p>
            <p><strong>Marchandise :</strong> ${marchandise}</p>

            <h3>Message du client</h3>

            <p>
              ${message}
            </p>

            <hr>

            <p>
              📞 Contacter rapidement le client pour établir le devis.
            </p>

          </div>
        </div>
      `,
    });

const customerEmail = await resend.emails.send({
  from: "Flashride Logistics <contact@flashride-logistics.fr>",
  to: email,
  subject: "Votre demande de transport a bien été reçue - Flashride Logistics",

  html: `
    <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:30px;">
      <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;">

        <h1>Flashride Logistics</h1>

        <h2>Merci pour votre demande 🚚</h2>

        <p>
          Bonjour ${nom},
        </p>

        <p>
          Nous confirmons la bonne réception de votre demande de transport.
          Notre équipe va étudier votre besoin et reviendra vers vous rapidement.
        </p>

        <h3>Récapitulatif :</h3>

        <p><strong>Prestation :</strong> ${prestation}</p>
        <p><strong>Départ :</strong> ${depart}</p>
        <p><strong>Arrivée :</strong> ${arrivee}</p>
        <p><strong>Date souhaitée :</strong> ${date}</p>
        <p><strong>Volume :</strong> ${volume}</p>
        
        <hr>

        <p>
          Merci de votre confiance.
        </p>

        <p>
          Flashride Logistics
        </p>

      </div>
    </div>
  `,
});

    console.log(result, customerEmail);

    return Response.json({
      success: true,
    });

  } catch (error) {
    console.log(error);

    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}