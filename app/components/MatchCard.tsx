'use client';

import { Check, X, Phone, Mail, Eye } from 'lucide-react';

interface MatchCardProps {
  name: string;
  score: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  contact?: {
    phone: string;
    email: string;
  };
  onViewDetails?: () => void;
  type: 'customer' | 'property';
}

export default function MatchCard({
  name,
  score,
  matchedCriteria,
  unmatchedCriteria,
  contact,
  onViewDetails,
  type,
}: MatchCardProps) {
  const getScoreColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getScoreBgColor = () => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800';
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800';
    return 'bg-orange-50 dark:bg-orange-900/50 border-orange-200 dark:border-orange-800';
  };

  return (
    <div className={`border-2 rounded-xl p-5 ${getScoreBgColor()} hover:shadow-lg transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h3>
          {contact && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {contact.phone}
              </span>
              {contact.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {contact.email}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Skor Badge */}
        <div className="flex flex-col items-center">
          <div className={`${getScoreColor()} text-white px-4 py-2 rounded-full font-bold text-lg`}>
            %{score}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">Uyumlu</span>
        </div>
      </div>

      {/* Uyan Kriterler */}
      {matchedCriteria.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-1">
            <Check className="w-4 h-4" />
            Uyan Kriterler:
          </h4>
          <div className="flex flex-wrap gap-2">
            {matchedCriteria.map((criteria, index) => (
              <span
                key={index}
                className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {criteria}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Uymayan Kriterler */}
      {unmatchedCriteria.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-1">
            <X className="w-4 h-4" />
            Uymayan Kriterler:
          </h4>
          <div className="flex flex-wrap gap-2">
            {unmatchedCriteria.map((criteria, index) => (
              <span
                key={index}
                className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {criteria}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t dark:border-gray-700">
        {type === 'customer' && contact && (
          <>
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              Telefonu Göster
            </button>
            <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Mail At
            </button>
          </>
        )}
        {type === 'property' && (
          <button
            onClick={onViewDetails}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Portföyü Gör
          </button>
        )}
      </div>
    </div>
  );
}