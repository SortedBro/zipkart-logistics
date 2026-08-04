import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import Alert from '../../components/Alert.jsx';

export default function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.get('/documents');
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Documents Vault</h1>
            <p className="text-sm text-slate-500">Centralized storage for RCs, Insurance, PUCs, Driving Licenses, Contracts, and Permits.</p>
          </div>
          <Link
            to="/documents/new"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            + Upload Document
          </Link>
        </div>

        {error && <Alert type="error" message={error} />}

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading document vault...</div>
        ) : documents.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No documents stored in vault yet. Click "Upload Document" to add files.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      {doc.documentType}
                    </span>
                    {doc.expiryDate && (
                      <span className="text-xs text-slate-400 font-medium">
                        Exp: {new Date(doc.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{doc.title}</h3>
                  <div className="text-xs text-slate-500 mt-1">
                    {doc.truck && `Vehicle: ${doc.truck.number}`}
                    {doc.driver && `Driver: ${doc.driver.name}`}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-brand-600 hover:text-brand-800"
                  >
                    View / Download →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
