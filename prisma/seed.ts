import { prisma } from "../src/lib/prisma";

async function main() {
  // Limpia los registros anteriores para evitar duplicados en la BD
  await prisma.property.deleteMany({});

  await prisma.property.createMany({
    data: [
      {
        title: "Cabaña Bosque del Chico",
        type: "Cabaña",
        location: "Mineral del Chico, Hidalgo",
        price: 1800,
        rating: 4.9,
        bedrooms: 2,
        guests: 4,
        details: "Increíble cabaña rodeada de naturaleza y chimenea de leña.",
        imageUrl: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80",
      },
      {
        title: "Loft Moderno Centro Histórico",
        type: "Departamento",
        location: "Morelia, Michoacán",
        price: 1200,
        rating: 4.8,
        bedrooms: 1,
        guests: 2,
        details: "Ubicado a 5 minutos de la Catedral con vista panorámica.",
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=80",
      },
      {
        title: "Villa Frente al Mar",
        type: "Villa",
        location: "Zihuatanejo, Guerrero",
        price: 3500,
        rating: 5.0,
        bedrooms: 3,
        guests: 6,
        details: "Alberca privada con vista al océano y acceso directo a la playa.",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80",
      },
      {
        title: "Glamping Vista a la Montaña",
        type: "Glamping",
        location: "Tepoztlán, Morelos",
        price: 2100,
        rating: 4.7,
        bedrooms: 1,
        guests: 2,
        details: "Domo geodésico de lujo con jacuzzi exterior al aire libre.",
        imageUrl: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=500&q=80",
      },
      {
        title: "Casa de Campo Bosque del Lago",
        type: "Cabaña",
        location: "Valle de Bravo, Estado de México",
        price: 2400,
        rating: 4.9,
        bedrooms: 3,
        guests: 6,
        details: "Hermosa residencia alpina con embarcadero privado y asador.",
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500&q=80",
      },
      {
        title: "Penthouse con Terrazas Urbanas",
        type: "Departamento",
        location: "Ciudad de México, CDMX",
        price: 2900,
        rating: 4.8,
        bedrooms: 2,
        guests: 4,
        details: "Departamento de lujo en la zona Roma-Condesa con vista 360°.",
        imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80",
      },
      {
        title: "Residencia Rústica Tequila",
        type: "Villa",
        location: "Tequila, Jalisco",
        price: 2100,
        rating: 4.6,
        bedrooms: 2,
        guests: 5,
        details: "Hospedaje rodeado de campos de agave con arquitectura tradicional.",
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80",
      },
      {
        title: "Estudio Bohemio cerca del Mar",
        type: "Departamento",
        location: "Tulum, Quintana Roo",
        price: 2200,
        rating: 4.9,
        bedrooms: 1,
        guests: 2,
        details: "Espacio sustentable en la selva maya con alberca cenote privada.",
        imageUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=500&q=80",
      },
    ],
  });

  console.log("Seed completado exitosamente con 8 alojamientos únicos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });