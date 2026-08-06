import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

console.log(
  "API KEY PRESENT:",
  process.env.RESEND_API_KEY ? "YES" : "NO"
);

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

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "jasonvandommele@icloud.com",
      subject: "Nouvelle demande de transport Flashride Logistics",
      html: `
        <h2>Nouvelle demande de transport</h2>

        <p><strong>Nom / Entreprise :</strong> ${nom}</p>
        <p><strong>Téléphone :</strong> ${telephone}</p>
        <p><strong>Email :</strong> ${email}</p>

        <p><strong>Prestation :</strong> ${prestation}</p>
        <p><strong>Véhicule :</strong> ${vehicule}</p>

        <p><strong>Date :</strong> ${data.date}</p>
        <p><strong>Volume :</strong> ${data.volume}</p>

        <p><strong>Départ :</strong> ${depart}</p>
        <p><strong>Arrivée :</strong> ${arrivee}</p>

        <p><strong>Marchandise :</strong> ${marchandise}</p>

        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `,
    });

    console.log(result);

    return Response.json({
      success: true,
      result,
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