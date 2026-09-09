import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dbAlojamientos = await prisma.property.findMany();

    const alojamientos = dbAlojamientos.map((item: any) => ({
      id: item.id,
      titulo: item.title,
      tipo: item.type ?? "Alojamiento",
      ubicacion: item.location,
      precio: item.price,
      calificacion: item.rating ?? 4.8,
      habitaciones: item.bedrooms ?? 1,
      huespedes: item.guests ?? 2,
      detalles: item.details ?? "",
      imagen: item.imageUrl || "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80",
    }));

    return NextResponse.json(alojamientos);
  } catch (error) {
    console.error("Error en BD:", error);
    return NextResponse.json([], { status: 500 });
  }
}