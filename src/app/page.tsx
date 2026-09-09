"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Alojamiento {
  id: string | number;
  titulo: string;
  tipo: string;
  ubicacion: string;
  precio: number;
  calificacion: number;
  habitaciones: number;
  huespedes: number;
  detalles: string;
  imagen: string;
}

export default function Home() {
  const [alojamientos, setAlojamientos] = useState<Alojamiento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarTrailer, setMostrarTrailer] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navegación activa: 'alojamientos' | 'reservados' | 'acerca'
  const [pestanaActiva, setPestanaActiva] = useState<
    "alojamientos" | "reservados" | "acerca"
  >("alojamientos");

  // Estado del usuario autenticado
  const [usuario, setUsuario] = useState<{ nombre?: string; email: string } | null>(null);

  // Lista de alojamientos reservados por el usuario actual
  const [reservas, setReservas] = useState<Alojamiento[]>([]);

  // Ventana modal del alojamiento seleccionado
  const [alojamientoSeleccionado, setAlojamientoSeleccionado] =
    useState<Alojamiento | null>(null);

  // Mensaje de notificación temporal
  const [mensajeNotificacion, setMensajeNotificacion] = useState<string | null>(null);

  // Carga inicial: Usuario, Reservas y Alojamientos de la API
  useEffect(() => {
    // 1. Verificar sesión activa
    const userGuardado = localStorage.getItem("user");
    if (userGuardado) {
      try {
        const parsedUser = JSON.parse(userGuardado);
        setUsuario(parsedUser);

        // Cargar reservas específicas de este usuario
        const reservasGuardadas = localStorage.getItem(`reservas_${parsedUser.email}`);
        if (reservasGuardadas) {
          setReservas(JSON.parse(reservasGuardadas));
        }
      } catch (e) {
        console.error("Error al leer datos almacenados:", e);
      }
    }

    // 2. Cargar alojamientos desde la API
    setCargando(true);
    fetch("/api/alojamientos")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: No se pudo obtener la respuesta de la API`);
        }
        return res.json();
      })
      .then((data) => {
        setAlojamientos(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => {
        console.error("Error al cargar alojamientos:", err);
        setError("Ocurrió un error al cargar los alojamientos.");
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  // Manejador de cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUsuario(null);
    setReservas([]);
    setPestanaActiva("alojamientos");
  };

  // Función para reservar un alojamiento
  const handleReservar = (alojamiento: Alojamiento) => {
    if (!usuario) {
      setMensajeNotificacion("Debes iniciar sesión para realizar una reserva.");
      setTimeout(() => setMensajeNotificacion(null), 3000);
      return;
    }

    const yaEstaReservado = reservas.some((item) => item.id === alojamiento.id);

    if (yaEstaReservado) {
      setMensajeNotificacion("¡Ya has reservado este alojamiento previamente!");
      setTimeout(() => setMensajeNotificacion(null), 3000);
      return;
    }

    const nuevasReservas = [...reservas, alojamiento];
    setReservas(nuevasReservas);
    localStorage.setItem(`reservas_${usuario.email}`, JSON.stringify(nuevasReservas));

    setMensajeNotificacion(`¡Reserva confirmada para ${alojamiento.titulo}!`);
    setTimeout(() => setMensajeNotificacion(null), 3500);
  };

  // Función para cancelar una reserva
  const handleCancelarReserva = (alojamientoId: string | number) => {
    if (!usuario) return;

    const reservasFiltradas = reservas.filter((item) => item.id !== alojamientoId);
    setReservas(reservasFiltradas);
    localStorage.setItem(`reservas_${usuario.email}`, JSON.stringify(reservasFiltradas));

    setMensajeNotificacion("Reserva cancelada correctamente.");
    setTimeout(() => setMensajeNotificacion(null), 3000);
  };

  // Filtrado según la pestaña activa (Alojamientos vs Reservados)
  const listaAVisualizar = pestanaActiva === "reservados" ? reservas : alojamientos;

  const filtrados = listaAVisualizar.filter((item) => {
    return (
      item.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.ubicacion?.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Notificación Toast */}
      {mensajeNotificacion && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {mensajeNotificacion}
        </div>
      )}

      {/* Encabezado */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-slate-900 text-white font-black text-xl px-2.5 py-1 rounded-xl">
              S
            </span>
            <span className="text-xl font-black tracking-tight text-slate-900">
              StayFinder
            </span>
          </Link>

          {/* Menú de navegación */}
          <nav className="flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setPestanaActiva("alojamientos")}
              className={`transition-colors ${
                pestanaActiva === "alojamientos"
                  ? "text-slate-900 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Alojamientos
            </button>
            <button
              onClick={() => setPestanaActiva("reservados")}
              className={`flex items-center gap-1.5 transition-colors ${
                pestanaActiva === "reservados"
                  ? "text-slate-900 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Reservados
              {reservas.length > 0 && (
                <span className="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {reservas.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setPestanaActiva("acerca")}
              className={`transition-colors ${
                pestanaActiva === "acerca"
                  ? "text-slate-900 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Acerca de
            </button>
          </nav>

          {/* Estado de Autenticación */}
          <div className="flex items-center gap-3">
            {usuario ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  {usuario.nombre || usuario.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 transition-all"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold px-3.5 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 transition-all"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Banner + Buscador (Solo si no está en la pestaña Acerca de) */}
        {pestanaActiva !== "acerca" && (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black via-slate-900 to-slate-950 text-white p-8 md:p-12 shadow-xl shadow-slate-950/20">
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-200">
                Encuentra tu refugio ideal
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Hospedajes únicos para tu próxima escapada
              </h1>
            </div>

            <div className="relative z-10 mt-8 p-2 bg-white rounded-2xl shadow-lg flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="¿A dónde quieres ir? (Ej. Morelia, Cabaña...)"
                className="w-full px-4 py-3 text-slate-800 text-sm rounded-xl focus:outline-none placeholder-slate-400"
              />
              <button className="bg-slate-900 hover:bg-black text-white font-semibold px-6 py-3 text-sm rounded-xl transition-all shadow-md shadow-slate-900/20 whitespace-nowrap">
                Buscar
              </button>
            </div>
          </section>
        )}

        {/* Sección Acerca de */}
        {pestanaActiva === "acerca" ? (
          <section className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-12 space-y-6 max-w-3xl mx-auto shadow-sm">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold uppercase tracking-wider">
              ¿Qué es Airbnb / StayFinder?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Alojamiento para cada viaje
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Un modelo de alquiler turístico y hospedaje compartido (estilo <strong>Airbnb</strong>) permite a los anfitriones rentar casas, departamentos, cabañas o villas privadas a viajeros de todo el mundo.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              A diferencia de un hotel tradicional, este modelo te ofrece la oportunidad de alojarte en espacios únicos con cocina, áreas privadas, ubicaciones auténticas en pueblos o ciudades, y una experiencia mucho más personalizada y cómoda para tus vacaciones o viajes de trabajo.
            </p>
            <div className="pt-4 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setPestanaActiva("alojamientos")}
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md"
              >
                Explorar alojamientos
              </button>
            </div>
          </section>
        ) : (
          /* Galería de Tarjetas */
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {pestanaActiva === "reservados"
                    ? "Mis Alojamientos Reservados"
                    : "Alojamientos recomendados"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {cargando
                    ? "Cargando..."
                    : `Mostrando ${filtrados.length} resultados`}
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {pestanaActiva === "reservados" && filtrados.length === 0 && !cargando && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-3">
                <p className="text-slate-500 text-sm font-medium">
                  {usuario
                    ? "Aún no tienes reservaciones registradas."
                    : "Inicia sesión para ver tus reservaciones."}
                </p>
                <button
                  onClick={() => setPestanaActiva("alojamientos")}
                  className="text-xs font-bold text-slate-900 underline hover:text-black"
                >
                  Explorar alojamientos disponibles
                </button>
              </div>
            )}

            {cargando ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-slate-200 h-80 rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrados.map((item) => {
                  const reservado = reservas.some((r) => r.id === item.id);

                  return (
                    <article
                      key={item.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                          <Image
                            src={
                              item.imagen ||
                              "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80"
                            }
                            alt={item.titulo}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-sm">
                            {item.tipo || "Alojamiento"}
                          </span>
                          {reservado && (
                            <span className="absolute top-3 right-3 bg-emerald-600 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-sm">
                              ✓ Reservado
                            </span>
                          )}
                        </div>

                        <div className="p-5 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-black transition-colors">
                              {item.titulo}
                            </h3>
                            <span className="flex items-center text-xs font-semibold text-amber-600 gap-1 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
                              ★ {item.calificacion || 5} / 5
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 font-medium">
                            {item.ubicacion}
                          </p>

                          <div className="pt-2 border-t border-slate-100 space-y-1">
                            <div className="flex gap-3 text-xs text-slate-600 font-medium">
                              <span>{item.habitaciones ?? 1} habitaciones</span>
                              <span>•</span>
                              <span>{item.huespedes ?? 2} huéspedes</span>
                            </div>
                            <p className="text-[11px] text-slate-700 font-medium line-clamp-2">
                              {item.detalles}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-slate-50 mt-auto gap-2">
                        <div>
                          <span className="text-lg font-extrabold text-slate-900">
                            ${item.precio?.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {" "}
                            MXN / noche
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {reservado && pestanaActiva === "reservados" && (
                            <button
                              onClick={() => handleCancelarReserva(item.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-red-200"
                              title="Cancelar esta reservación"
                            >
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={() => setAlojamientoSeleccionado(item)}
                            className="bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-900 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
                          >
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Banner Publicitario */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-wider">
            <span>PUBLICIDAD PATROCINADA</span>
            <span className="flex items-center gap-1 font-semibold text-slate-400">
              Anuncio <span className="text-[11px]">ⓘ</span>
            </span>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden min-h-[220px] md:min-h-[240px] bg-slate-950 flex items-center p-6 md:p-10 shadow-inner">
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=1200&q=80"
                alt="Spider-Man 2"
                fill
                className="object-cover object-right md:object-center opacity-60"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
            </div>

            {!mostrarTrailer ? (
              <div className="relative z-10 max-w-lg space-y-3 text-white">
                <div>
                  <span className="inline-block bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wide">
                    TRÁILER OFICIAL
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
                  SPIDER-MAN 2
                </h2>

                <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed max-w-md">
                  &quot;Un gran poder conlleva una gran responsabilidad.&quot; Revive
                  la icónica batalla de Tobey Maguire contra el Doctor Octopus.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setMostrarTrailer(true)}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-md shadow-red-950/40"
                  >
                    <span>Ver tráiler</span>
                    <span className="text-[10px]">▶</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative z-10 w-full h-full min-h-[200px] md:min-h-[220px] flex items-center justify-center">
                <iframe
                  className="w-full h-full absolute inset-0 rounded-xl"
                  src="https://www.youtube.com/embed/1s9Yln0YwCw?autoplay=1"
                  title="SPIDER-MAN 2 Trailer (2004)"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={() => setMostrarTrailer(false)}
                  className="absolute -top-2 -right-2 z-20 bg-black/80 text-white rounded-full p-1.5 hover:bg-black text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modal de Detalles y Reserva */}
      {alojamientoSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setAlojamientoSeleccionado(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAlojamientoSeleccionado(null)}
              className="absolute top-4 right-4 z-20 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm transition-all shadow-lg"
              aria-label="Cerrar modal"
            >
              ✕
            </button>

            <div className="relative h-64 sm:h-72 w-full bg-slate-100 shrink-0">
              <Image
                src={
                  alojamientoSeleccionado.imagen ||
                  "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80"
                }
                alt={alojamientoSeleccionado.titulo}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="inline-block bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] uppercase px-2.5 py-1 rounded-full mb-2">
                  {alojamientoSeleccionado.tipo || "Alojamiento"}
                </span>
                <h2 className="text-2xl font-black leading-snug">
                  {alojamientoSeleccionado.titulo}
                </h2>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Ubicación
                  </p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    {alojamientoSeleccionado.ubicacion}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Calificación
                    </p>
                    <p className="text-sm font-bold text-amber-600 mt-0.5">
                      ★ {alojamientoSeleccionado.calificacion || 5} / 5
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Distribución del espacio
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="block text-lg font-bold text-slate-900">
                      {alojamientoSeleccionado.habitaciones ?? 1}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Habitaciones</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="block text-lg font-bold text-slate-900">
                      {alojamientoSeleccionado.huespedes ?? 2}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Huéspedes máx.</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center col-span-2 sm:col-span-1">
                    <span className="block text-lg font-bold text-slate-900">
                      100%
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Verificado</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Detalles & Servicios incluidos
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {alojamientoSeleccionado.detalles ||
                    "Este hospedaje cuenta con excelentes instalaciones, acabados de primera calidad y buena conectividad a servicios básicos."}
                </p>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <span className="text-xl font-extrabold text-slate-900">
                  ${alojamientoSeleccionado.precio?.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {" "}
                  MXN / noche
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAlojamientoSeleccionado(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all"
                >
                  Cerrar
                </button>
                {reservas.some((r) => r.id === alojamientoSeleccionado.id) ? (
                  <button
                    onClick={() => {
                      handleCancelarReserva(alojamientoSeleccionado.id);
                      setAlojamientoSeleccionado(null);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-red-900/20"
                  >
                    Cancelar reservación
                  </button>
                ) : (
                  <button
                    onClick={() => handleReservar(alojamientoSeleccionado)}
                    className="bg-slate-900 hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-slate-900/20"
                  >
                    Reservar ahora
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pie de página */}
      <footer className="border-t border-slate-200/80 bg-white mt-16 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© 2026 StayFinder - Proyecto Next.js</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600">
              Privacidad
            </a>
            <a href="#" className="hover:text-slate-600">
              Términos
            </a>
            <a href="#" className="hover:text-slate-600">
              Soporte
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}