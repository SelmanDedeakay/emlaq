// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Folder, Users, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { portfolioService } from '../services/portfolio.service';
import { customerService } from '../services/customer.service';
import { matchPropertyToCustomers } from '../utils/matching';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    activePortfolios: 0,
    activeCustomers: 0,
    newMatches: 0,
  });
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load portfolios and customers
      const [portfolios, customers] = await Promise.all([
        portfolioService.getAll(),
        customerService.getAll(),
      ]);

      // Calculate stats
      const activePortfolios = portfolios?.filter(p => p.status !== 'satildi').length || 0;
      const activeCustomers = customers?.filter(c => c.status === 'aktif').length || 0;

      // Calculate matches for all portfolios
      let allMatches: any[] = [];
      
      if (portfolios && customers) {
        portfolios.forEach(property => {
          // Transform property to match expected format
          const transformedProperty = {
            id: property.id,
            status: property.status,
            type: property.type,
            location: {
              il: property.il,
              ilce: property.ilce,
              mahalle: property.mahalle,
            },
            price: property.price,
            details: {
              rooms: property.rooms,
              squareMeters: property.square_meters,
            },
            features: property.features || {},
          };

          const matches = matchPropertyToCustomers(transformedProperty, customers);
          
          // Add matches with score >= 70
          matches.forEach(match => {
            if (match.score >= 70) {
              const customer = customers.find(c => c.id === match.id);
              if (customer) {
                allMatches.push({
                  property: property.title,
                  propertyId: property.id,
                  customer: customer.name,
                  customerId: customer.id,
                  matchRate: match.score,
                  createdAt: property.created_at,
                });
              }
            }
          });
        });
      }

      // Sort by match rate and take top 5
      allMatches.sort((a, b) => b.matchRate - a.matchRate);
      const topMatches = allMatches.slice(0, 5);

      // Count matches from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newMatches = allMatches.filter(m => 
        new Date(m.createdAt) >= sevenDaysAgo
      ).length;

      setStats({
        activePortfolios,
        activeCustomers,
        newMatches,
      });
      setRecentMatches(topMatches);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hoş Geldiniz, {profile?.full_name || 'Emlakçı'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          İşte bugünkü özet bilgileriniz
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Folder}
          label="Aktif Portföy"
          value={stats.activePortfolios}
          color="blue"
          href="/portfolio"
        />
        <StatCard
          icon={Users}
          label="Aktif Müşteri"
          value={stats.activeCustomers}
          color="green"
          href="/customers"
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
          🎯 En İyi Eşleşmeler
        </h2>
        <div className="space-y-4">
          {recentMatches.map((match, index) => (
            <MatchItem key={index} match={match} />
          ))}
          {recentMatches.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">Henüz eşleşme bulunmuyor.</p>
              <p className="text-sm">
                Portföy ve müşteri ekleyerek eşleşmeleri görebilirsiniz.
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <Link
                  href="/portfolio"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Portföy Ekle
                </Link>
                <Link
                  href="/customers"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Müşteri Ekle
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

type StatColor = 'blue' | 'green' | 'purple';

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number | string;
  color: StatColor;
  href?: string;
}) => {
  const colors: Record<StatColor, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300',
    purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300',
  };

  const card = (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 cursor-pointer">
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

  return href ? <Link href={href}>{card}</Link> : card;
};

const MatchItem = ({ match }: any) => {
  const getMatchColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 dark:text-green-400';
    if (rate >= 75) return 'text-blue-600 dark:text-blue-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
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
            <p className={`font-bold text-lg ${getMatchColor(match.matchRate)}`}>
              {match.matchRate}%
            </p>
          </div>
          <Link
            href={`/portfolio/${match.propertyId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            İncele
          </Link>
        </div>
      </div>
    </div>
  );
};