
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Calculator, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  photographer: string;
  model: string;
  date: string;
  status: string;
}

interface Sale {
  sessionId: string;
  seller: string;
  photosQuantity: number;
  saleValue: number;
  paymentMethod: 'pix' | 'cartao' | 'dinheiro';
  saleStatus: 'VD' | 'D' | 'NV';
  clientName: string;
  clientEmail: string;
  clientWhatsapp: string;
  timestamp: string;
}

const Goals = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [photographers, setPhotographers] = useState<string[]>([]);
  const [sellers, setSellers] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedSessions = localStorage.getItem('photoSessions');
    const savedSales = localStorage.getItem('photoSales');
    const savedPhotographers = localStorage.getItem('photographers');
    const savedSellers = localStorage.getItem('sellers');
    const savedGoal = localStorage.getItem('dailyGoal');
    
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedPhotographers) setPhotographers(JSON.parse(savedPhotographers));
    if (savedSellers) setSellers(JSON.parse(savedSellers));
    if (savedGoal) setDailyGoal(savedGoal);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getTodaySales = () => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(sale => sale.timestamp.split('T')[0] === today);
  };

  const getTodaySessions = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(session => session.date === today);
  };

  const handleSaveGoal = () => {
    if (!dailyGoal || parseFloat(dailyGoal) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, digite um valor válido para a meta.",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('dailyGoal', dailyGoal);
    toast({
      title: "Sucesso",
      description: "Meta diária salva com sucesso!",
    });
  };

  const getGoalStats = () => {
    const goal = parseFloat(dailyGoal) || 0;
    const todaySales = getTodaySales();
    const currentRevenue = todaySales.reduce((sum, sale) => sum + sale.saleValue, 0);
    const pendingSessions = getTodaySessions().filter(session => 
      !sales.some(sale => sale.sessionId === session.id)
    );
    
    const goalPerSeller = goal / Math.max(sellers.length, 1);
    const goalPerPhotographer = goal / Math.max(photographers.length, 1);
    const remaining = goal - currentRevenue;
    const suggestionPerPending = pendingSessions.length > 0 ? remaining / pendingSessions.length : 0;
    const progress = goal > 0 ? (currentRevenue / goal) * 100 : 0;

    return {
      goal,
      currentRevenue,
      remaining,
      pendingSessions: pendingSessions.length,
      suggestionPerPending,
      goalPerSeller,
      goalPerPhotographer,
      progress
    };
  };

  const getSellerProgress = () => {
    const todaySales = getTodaySales();
    const goalPerSeller = parseFloat(dailyGoal) / Math.max(sellers.length, 1) || 0;
    
    return sellers.map(seller => {
      const sellerSales = todaySales.filter(sale => sale.seller === seller);
      const revenue = sellerSales.reduce((sum, sale) => sum + sale.saleValue, 0);
      const progress = goalPerSeller > 0 ? (revenue / goalPerSeller) * 100 : 0;
      
      return {
        name: seller,
        revenue,
        goal: goalPerSeller,
        progress,
        remaining: Math.max(goalPerSeller - revenue, 0)
      };
    });
  };

  const getPhotographerProgress = () => {
    const todaySales = getTodaySales();
    const goalPerPhotographer = parseFloat(dailyGoal) / Math.max(photographers.length, 1) || 0;
    
    return photographers.map(photographer => {
      const photographerSales = todaySales.filter(sale => {
        const session = sessions.find(s => s.id === sale.sessionId);
        return session?.photographer === photographer;
      });
      const revenue = photographerSales.reduce((sum, sale) => sum + sale.saleValue, 0);
      const progress = goalPerPhotographer > 0 ? (revenue / goalPerPhotographer) * 100 : 0;
      
      return {
        name: photographer,
        revenue,
        goal: goalPerPhotographer,
        progress,
        remaining: Math.max(goalPerPhotographer - revenue, 0)
      };
    });
  };

  const stats = getGoalStats();
  const sellerProgress = getSellerProgress();
  const photographerProgress = getPhotographerProgress();

  return (
    <div className="space-y-6">
      {/* Configuração da Meta */}
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
            <Target size={20} />
            Meta Diária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label className="text-gray-300">Valor da Meta (R$)</Label>
              <Input
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                type="number"
                step="0.01"
                placeholder="Ex: 5000,00"
                className="bg-gray-600 border-gray-500 text-white"
              />
            </div>
            <Button 
              onClick={handleSaveGoal}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Salvar Meta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progresso Geral */}
      {parseFloat(dailyGoal) > 0 && (
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-lg text-blue-300">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.goal)}</p>
                <p className="text-gray-400 text-sm">Meta do Dia</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.currentRevenue)}</p>
                <p className="text-gray-400 text-sm">Vendido</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{formatCurrency(stats.remaining)}</p>
                <p className="text-gray-400 text-sm">Restante</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{stats.progress.toFixed(1)}%</p>
                <p className="text-gray-400 text-sm">Progresso</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-600 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.progress, 100)}%` }}
              ></div>
            </div>
            
            {stats.pendingSessions > 0 && (
              <Card className="bg-gray-600 border-gray-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator size={16} className="text-blue-400" />
                    <span className="text-blue-300 font-medium">Sugestão para Atingir a Meta</span>
                  </div>
                  <p className="text-white">
                    Com <span className="font-bold text-yellow-400">{stats.pendingSessions}</span> ensaios pendentes, 
                    cada um deve ser vendido por aproximadamente <span className="font-bold text-green-400">{formatCurrency(stats.suggestionPerPending)}</span>
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progresso por Vendedor */}
      {parseFloat(dailyGoal) > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                <Users size={20} />
                Meta por Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sellerProgress.map((seller) => (
                <div key={seller.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{seller.name}</span>
                    <span className="text-sm text-gray-400">
                      {formatCurrency(seller.revenue)} / {formatCurrency(seller.goal)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(seller.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{seller.progress.toFixed(1)}%</span>
                    <span className="text-red-400">Falta: {formatCurrency(seller.remaining)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                <TrendingUp size={20} />
                Meta por Fotógrafo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {photographerProgress.map((photographer) => (
                <div key={photographer.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{photographer.name}</span>
                    <span className="text-sm text-gray-400">
                      {formatCurrency(photographer.revenue)} / {formatCurrency(photographer.goal)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(photographer.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{photographer.progress.toFixed(1)}%</span>
                    <span className="text-red-400">Falta: {formatCurrency(photographer.remaining)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Goals;
