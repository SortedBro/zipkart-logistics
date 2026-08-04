// Alert.jsx — Supports both calling patterns:
//   <Alert error={error} />                 (old pattern)
//   <Alert type="error" message={errorMsg} /> (new pattern)
//   <Alert type="success" message={msg} />
export default function Alert({ error, success, type, message }) {
  const isError = type === 'error' || (error && !success);
  const isSuccess = type === 'success' || (success && !error);

  const text = message || error || success;
  if (!text) return null;

  return (
    <div
      className={`mb-4 rounded-lg px-4 py-3 text-sm border ${
        isError
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-green-50 border-green-200 text-green-800'
      }`}
    >
      {isError ? '⚠️ ' : '✅ '}
      {text}
    </div>
  );
}
