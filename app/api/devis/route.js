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
    } = data;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "contact@flashride-logistics.com",
      subject: "Nouvelle demande de transport Flashride Logistics",
      html: `
        <h2>Nouvelle demande de transport</h2>

        <p><strong>Nom / Entreprise :</strong> ${nom}</p>
        <p><strong>Téléphone :</strong> ${telephone}</p>
        <p><strong>Email :</strong> ${email}</p>

        <p><strong>Prestation :</strong> ${prestation}</p>
        <p><strong>Véhicule :</strong> ${vehicule}</p>

        <p><strong>Départ :</strong> ${depart}</p>
        <p><strong>Arrivée :</strong> ${arrivee}</p>

        <p><strong>Marchandise :</strong> ${marchandise}</p>

        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `,
    });

    return Response.json({
      success: true,
    });

  } catch (error) {
    return Response.json(
      {
        error: "Erreur lors de l'envoi",
      },
      {
        status: 500,
      }
    );
  }
}
