'use client';
import DashboardLayout from '../components/DashboardLayout';
import { Folder, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// --- DUMMY DATA ---
const stats = {
  activePortfolios: 24,
  activeCustomers: 18,
  newMatches: 7,
};

const recentMatches = [
  {
    id: 1,
    customer: 'Ahmet Yılmaz',
    property: 'Caddebostan 3+1 Daire',
    matchRate: 92,
  },
  {
    id: 2,
    customer: 'Zeynep Kaya',
    property: 'Bostancı 2+1 Bahçeli Ev',
    matchRate: 88,
  },
  {
    id: 3,
    customer: 'Mustafa Öztürk',
    property: 'Ataşehir 1+1 Rezidans',
    matchRate: 85,
  },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Folder}
          label="Aktif Portföy"
          value={stats.activePortfolios}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Aktif Müşteri"
          value={stats.activeCustomers}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Yeni Eşleşme (Haftalık)"
          value={stats.newMatches}
          color="purple"
        />
      </div>

      {/* Recent Matches */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Son Eşleşmeler
        </h2>
        <div className="space-y-4">
          {recentMatches.map((match) => (
            <MatchItem key={match.id} match={match} />
          ))}
          {recentMatches.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>Henüz eşleşme bulunmuyor.</p>
            </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/matches"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Tüm Eşleşmeleri Gör →
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300',
    purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const MatchItem = ({ match }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-4 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="font-semibold text-gray-800 dark:text-white">
          {match.customer}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ile <span className="font-medium">{match.property}</span> portföyü eşleşti.
        </p>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Uyum</p>
          <p className="font-bold text-lg text-green-600 dark:text-green-400">
            {match.matchRate}%
          </p>
        </div>
        <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
          İncele
        </button>
      </div>
    </div>
  </div>
);