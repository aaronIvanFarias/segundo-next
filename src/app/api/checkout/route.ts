import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const { alojamiento } = await req.json();

    if (!alojamiento) {
      return NextResponse.json(
        { error: "Faltan datos del alojamiento" },
        { status: 400 }
      );
    }

    // Base URL tomada de tu .env.local
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Crear la sesión de checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: alojamiento.titulo,
              description: `${alojamiento.tipo || "Alojamiento"} en ${alojamiento.ubicacion}`,
              images: alojamiento.imagen ? [alojamiento.imagen] : [],
            },
            unit_amount: Math.round(alojamiento.precio * 100), // Stripe requiere el monto en centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/pago-exitoso?id=${alojamiento.id}`,
      cancel_url: `${baseUrl}/pago-cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error en Stripe Checkout:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al procesar el pago" },
      { status: 500 }
    );
  }
}