
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Copy, Download } from 'lucide-react';
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

const Reports = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [photographers, setPhotographers] = useState<string[]>([]);
  const [sellers, setSellers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    // Listener para atualizações do localStorage
    const handleStorageChange = () => {
      loadData();
    };
    
    // Escuta mudanças no localStorage de outras abas/componentes
    window.addEventListener('storage', handleStorageChange);
    
    // Escuta eventos customizados para mudanças na mesma aba
    window.addEventListener('localStorageUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleStorageChange);
    };
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

  const getTodayDate = () => {
    return new Date().toLocaleDateString('pt-BR');
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getTodaySales = () => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(sale => sale.timestamp.split('T')[0] === today);
  };

  const getTodaySessions = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(session => session.date === today);
  };

  const generatePartialReport = () => {
    const todaySales = getTodaySales();
    const todaySessions = getTodaySessions();
    
    // Cálculos por fotógrafo
    const photographerStats = photographers.map(photographer => {
      const photographerSessions = todaySessions.filter(session => session.photographer === photographer);
      const photographerSales = todaySales.filter(sale => {
        const session = sessions.find(s => s.id === sale.sessionId);
        return session?.photographer === photographer;
      });
      
      const totalValue = photographerSales.reduce((sum, sale) => sum + sale.saleValue, 0);
      
      return {
        name: photographer,
        value: totalValue,
        folders: photographerSessions.length
      };
    });

    // Cálculos por vendedor
    const sellerStats = sellers.map(seller => {
      const sellerSales = todaySales.filter(sale => sale.seller === seller);
      const totalValue = sellerSales.reduce((sum, sale) => sum + sale.saleValue, 0);
      
      return {
        name: seller,
        value: totalValue
      };
    });

    // Contadores de status
    const vdCount = todaySales.filter(sale => sale.saleStatus === 'VD').length;
    const dCount = todaySales.filter(sale => sale.saleStatus === 'D').length;
    const nvCount = todaySales.filter(sale => sale.saleStatus === 'NV').length;
    
    const totalFolders = todaySessions.length;
    const totalSold = todaySales.reduce((sum, sale) => sum + sale.saleValue, 0);
    const foldersToShow = todaySessions.filter(session => 
      !sales.some(sale => sale.sessionId === session.id)
    ).length;

    const report = `*Ranking ALCHYMIST ${getTodayDate()}
atualizado: ${getCurrentTime()}*
 
**Fotógrafos**
 
${photographerStats.map(p => 
  `${p.name}: ${formatCurrency(p.value)} / ${p.folders} pastas`
).join('\n')}

**Vendedores**

${sellerStats.map(s => 
  `${s.name}: ${formatCurrency(s.value)}`
).join('\n')}

Pastas a mostrar: ${foldersToShow}

VD: ${vdCount}
NV: ${nvCount}
D: ${dCount}

Total de pastas: ${totalFolders}
Total vendido: ${formatCurrency(totalSold)}`;

    return report;
  };

  const generateFinalReport = () => {
    const todaySales = getTodaySales();
    const todaySessions = getTodaySessions();
    
    // Totais por forma de pagamento
    const pixTotal = todaySales.filter(sale => sale.paymentMethod === 'pix')
      .reduce((sum, sale) => sum + sale.saleValue, 0);
    const cardTotal = todaySales.filter(sale => sale.paymentMethod === 'cartao')
      .reduce((sum, sale) => sum + sale.saleValue, 0);
    const cashTotal = todaySales.filter(sale => sale.paymentMethod === 'dinheiro')
      .reduce((sum, sale) => sum + sale.saleValue, 0);
    
    const totalRevenue = pixTotal + cardTotal + cashTotal;

    // Cálculos por fotógrafo
    const photographerStats = photographers.map(photographer => {
      const photographerSessions = todaySessions.filter(session => session.photographer === photographer);
      const photographerSales = todaySales.filter(sale => {
        const session = sessions.find(s => s.id === sale.sessionId);
        return session?.photographer === photographer;
      });
      
      const totalValue = photographerSales.reduce((sum, sale) => sum + sale.saleValue, 0);
      
      return {
        name: photographer,
        value: totalValue,
        folders: photographerSessions.length
      };
    });

    // Cálculos por vendedor
    const sellerStats = sellers.map(seller => {
      const sellerSales = todaySales.filter(sale => sale.seller === seller);
      const totalValue = sellerSales.reduce((sum, sale) => sum + sale.saleValue, 0);
      const folders = sellerSales.length;
      
      return {
        name: seller,
        value: totalValue,
        folders: folders
      };
    });

    // Contadores de status
    const vdCount = todaySales.filter(sale => sale.saleStatus === 'VD').length;
    const dCount = todaySales.filter(sale => sale.saleStatus === 'D').length;
    const nvCount = todaySales.filter(sale => sale.saleStatus === 'NV').length;
    
    const totalFolders = todaySessions.length;
    // Média apenas das vendas VD
    const vdSales = todaySales.filter(sale => sale.saleStatus === 'VD');
    const averageValue = vdSales.length > 0 ? totalRevenue / vdSales.length : 0;

    const report = `*Faturamento ALCHYMIST ${getTodayDate()}*

*${formatCurrency(totalRevenue)}*

Cartão: ${formatCurrency(cardTotal)}
Pix: ${formatCurrency(pixTotal)}
Dinheiro: ${formatCurrency(cashTotal)}

*Fotógrafos*

${photographerStats.map(p => 
  `${p.name}: ${formatCurrency(p.value)} / ${p.folders} pastas`
).join('\n')}

*Vendedor*

${sellerStats.map(s => 
  `${s.name}: ${formatCurrency(s.value)} / ${s.folders} pastas`
).join('\n')}

Nv: ${nvCount}
D: ${dCount}
VD: ${vdCount}
Total de Pastas: ${totalFolders}
Média: ${formatCurrency(averageValue)}`;

    return report;
  };

  const copyToClipboard = (text: string, reportType: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: `${reportType} copiado para a área de transferência.`,
      });
    }).catch(() => {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o relatório.",
        variant: "destructive"
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Relatório Parcial */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
              <FileText size={20} />
              Relatório Parcial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                {generatePartialReport()}
              </pre>
            </div>
            <Button 
              onClick={() => copyToClipboard(generatePartialReport(), "Relatório parcial")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Copy size={16} className="mr-2" />
              Copiar Relatório Parcial
            </Button>
          </CardContent>
        </Card>

        {/* Relatório Final */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
              <Download size={20} />
              Relatório Final
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                {generateFinalReport()}
              </pre>
            </div>
            <Button 
              onClick={() => copyToClipboard(generateFinalReport(), "Relatório final")}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Copy size={16} className="mr-2" />
              Copiar Relatório Final
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Rápido */}
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-lg text-blue-300">Resumo do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {getTodaySessions().length}
              </p>
              <p className="text-gray-400 text-sm">Ensaios Hoje</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {getTodaySales().length}
              </p>
              <p className="text-gray-400 text-sm">Vendas Hoje</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {formatCurrency(getTodaySales().reduce((sum, sale) => sum + sale.saleValue, 0))}
              </p>
              <p className="text-gray-400 text-sm">Faturamento</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {getTodaySales().filter(sale => sale.saleStatus === 'VD').length}
              </p>
              <p className="text-gray-400 text-sm">Vendidos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
