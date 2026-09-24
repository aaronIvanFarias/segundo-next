export default function PagoCancelado() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-3xl font-bold text-red-500">El pago fue cancelado ❌</h1>
      <p className="text-gray-600">No se realizó ningún cargo. Puedes volver a intentarlo cuando quieras.</p>
    </div>
  );
}