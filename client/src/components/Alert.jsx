export default function Alert({ error, success }) {
  if (!error && !success) return null;
  return (
    <div
      className={`mb-4 rounded-lg px-4 py-3 text-sm border ${
        error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
      }`}
    >
      {error || success}
    </div>
  );
}
