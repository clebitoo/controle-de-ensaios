
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Users, DollarSign } from 'lucide-react';

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

const Rankings = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [photographers, setPhotographers] = useState<string[]>([]);
  const [sellers, setSellers] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedSessions = localStorage.getItem('photoSessions');
    const savedSales = localStorage.getItem('photoSales');
    const savedPhotographers = localStorage.getItem('photographers');
    const savedSellers = localStorage.getItem('sellers');
    
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedPhotographers) setPhotographers(JSON.parse(savedPhotographers));
    if (savedSellers) setSellers(JSON.parse(savedSellers));
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

  // Estatísticas por status
  const getStatusStats = () => {
    const todaySales = getTodaySales();
    const vdCount = todaySales.filter(sale => sale.saleStatus === 'VD').length;
    const dCount = todaySales.filter(sale => sale.saleStatus === 'D').length;
    const nvCount = todaySales.filter(sale => sale.saleStatus === 'NV').length;
    const totalSessions = getTodaySessions().length;
    
    return { vdCount, dCount, nvCount, totalSessions };
  };

  // Ranking de fotógrafos por quantidade de pastas
  const getPhotographersByFolders = () => {
    const todaySessions = getTodaySessions();
    
    return photographers.map(photographer => {
      const photographerSessions = todaySessions.filter(session => session.photographer === photographer);
      return {
        name: photographer,
        folders: photographerSessions.length
      };
    }).sort((a, b) => b.folders - a.folders);
  };

  // Ranking de fotógrafos por valor
  const getPhotographersByValue = () => {
    const todaySales = getTodaySales();
    
    return photographers.map(photographer => {
      const photographerSales = todaySales.filter(sale => {
        const session = sessions.find(s => s.id === sale.sessionId);
        return session?.photographer === photographer;
      });
      
      const totalValue = photographerSales.reduce((sum, sale) => sum + sale.saleValue, 0);
      
      return {
        name: photographer,
        value: totalValue
      };
    }).sort((a, b) => b.value - a.value);
  };

  // Top 3 vendas de maior valor
  const getTopSalesByValue = () => {
    const todaySales = getTodaySales();
    return todaySales
      .sort((a, b) => b.saleValue - a.saleValue)
      .slice(0, 3)
      .map(sale => {
        const session = sessions.find(s => s.id === sale.sessionId);
        return {
          seller: sale.seller,
          value: sale.saleValue,
          model: session?.model || 'N/A',
          photographer: session?.photographer || 'N/A'
        };
      });
  };

  // Ranking de vendedores por quantidade de ensaios
  const getSellersByQuantity = () => {
    const todaySales = getTodaySales();
    
    return sellers.map(seller => {
      const sellerSales = todaySales.filter(sale => sale.seller === seller);
      return {
        name: seller,
        quantity: sellerSales.length
      };
    }).sort((a, b) => b.quantity - a.quantity);
  };

  // Ranking de vendedores por valor
  const getSellersByValue = () => {
    const todaySales = getTodaySales();
    
    return sellers.map(seller => {
      const sellerSales = todaySales.filter(sale => sale.seller === seller);
      const totalValue = sellerSales.reduce((sum, sale) => sum + sale.saleValue, 0);
      
      return {
        name: seller,
        value: totalValue
      };
    }).sort((a, b) => b.value - a.value);
  };

  const statusStats = getStatusStats();
  const photographersByFolders = getPhotographersByFolders();
  const photographersByValue = getPhotographersByValue();
  const topSales = getTopSalesByValue();
  const sellersByQuantity = getSellersByQuantity();
  const sellersByValue = getSellersByValue();

  return (
    <div className="space-y-6">
      {/* Status dos Ensaios */}
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-lg text-blue-300">Status dos Ensaios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{statusStats.vdCount}</p>
              <p className="text-gray-400 text-sm">Vendidos (VD)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">{statusStats.dCount}</p>
              <p className="text-gray-400 text-sm">Desistências (D)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">{statusStats.nvCount}</p>
              <p className="text-gray-400 text-sm">Não Vistos (NV)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">{statusStats.totalSessions}</p>
              <p className="text-gray-400 text-sm">Total Ensaios</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rankings de Fotógrafos */}
        <div className="space-y-4">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                <Users size={20} />
                Fotógrafos - Por Pastas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {photographersByFolders.map((photographer, index) => (
                  <div key={photographer.name} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                        #{index + 1}
                      </span>
                      <span className="text-white">{photographer.name}</span>
                    </div>
                    <span className="text-blue-400 font-medium">{photographer.folders} pastas</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                <DollarSign size={20} />
                Fotógrafos - Por Valor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {photographersByValue.map((photographer, index) => (
                  <div key={photographer.name} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                        #{index + 1}
                      </span>
                      <span className="text-white">{photographer.name}</span>
                    </div>
                    <span className="text-green-400 font-medium">{formatCurrency(photographer.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rankings de Vendedores */}
        <div className="space-y-4">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                <Trophy size={20} />
                Top 3 Maiores Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topSales.map((sale, index) => (
                  <div key={index} className="p-3 bg-gray-600 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-orange-400'}`}>
                        #{index + 1}
                      </span>
                      <span className="text-green-400 font-bold">{formatCurrency(sale.value)}</span>
                    </div>
                    <p className="text-white text-sm">{sale.seller} - {sale.photographer}/{sale.model}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                <TrendingUp size={20} />
                Vendedores - Por Quantidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sellersByQuantity.map((seller, index) => (
                  <div key={seller.name} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-orange-400'}`}>
                        #{index + 1}
                      </span>
                      <span className="text-white">{seller.name}</span>
                    </div>
                    <span className="text-blue-400 font-medium">{seller.quantity} vendas</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                <DollarSign size={20} />
                Vendedores - Por Valor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sellersByValue.map((seller, index) => (
                  <div key={seller.name} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-orange-400'}`}>
                        #{index + 1}
                      </span>
                      <span className="text-white">{seller.name}</span>
                    </div>
                    <span className="text-green-400 font-medium">{formatCurrency(seller.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Rankings;
