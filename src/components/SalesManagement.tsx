
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, DollarSign, Send, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  photographer: string;
  model: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed';
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
  deliveryStatus?: 'pending' | 'sent';
}

const SalesManagement = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [sellers, setSellers] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form states
  const [seller, setSeller] = useState('');
  const [photosQuantity, setPhotosQuantity] = useState('');
  const [saleValue, setSaleValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro'>('pix');
  const [saleStatus, setSaleStatus] = useState<'VD' | 'D' | 'NV'>('VD');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedSessions = localStorage.getItem('photoSessions');
    const savedSales = localStorage.getItem('photoSales');
    const savedSellers = localStorage.getItem('sellers');
    
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
    if (savedSellers) {
      setSellers(JSON.parse(savedSellers));
    }
  };

  const resetForm = () => {
    setSeller('');
    setPhotosQuantity('');
    setSaleValue('');
    setPaymentMethod('pix');
    setSaleStatus('VD');
    setClientName('');
    setClientEmail('');
    setClientWhatsapp('');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    
    // Load existing sale data if available
    const existingSale = sales.find(sale => sale.sessionId === session.id);
    if (existingSale) {
      setSeller(existingSale.seller);
      setPhotosQuantity(existingSale.photosQuantity.toString());
      setSaleValue(existingSale.saleValue.toString());
      setPaymentMethod(existingSale.paymentMethod);
      setSaleStatus(existingSale.saleStatus);
      setClientName(existingSale.clientName);
      setClientEmail(existingSale.clientEmail);
      setClientWhatsapp(existingSale.clientWhatsapp);
    } else {
      resetForm();
    }
    
    setIsDialogOpen(true);
  };

  const handleSaveSale = () => {
    if (!selectedSession || !seller || !photosQuantity || !saleValue) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const saleData: Sale = {
      sessionId: selectedSession.id,
      seller,
      photosQuantity: parseInt(photosQuantity),
      saleValue: parseFloat(saleValue),
      paymentMethod,
      saleStatus,
      clientName,
      clientEmail,
      clientWhatsapp,
      timestamp: new Date().toISOString(),
      deliveryStatus: saleStatus === 'VD' ? 'pending' : undefined
    };

    const updatedSales = sales.filter(sale => sale.sessionId !== selectedSession.id);
    updatedSales.push(saleData);
    
    localStorage.setItem('photoSales', JSON.stringify(updatedSales));
    setSales(updatedSales);
    
    setIsDialogOpen(false);
    resetForm();
    setSelectedSession(null);
    
    toast({
      title: "Sucesso",
      description: "Venda registrada com sucesso!",
    });
  };

  const handleDelivery = (sessionId: string) => {
    // Open WeTransfer
    window.open('https://wetransfer.com/', '_blank');
    
    // Try to open file explorer (works in some browsers with user interaction)
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.style.display = 'none';
      input.multiple = true;
      input.webkitdirectory = true;
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    } catch (error) {
      console.log('Could not open file explorer automatically');
    }

    // Update delivery status
    const updatedSales = sales.map(sale => 
      sale.sessionId === sessionId 
        ? { ...sale, deliveryStatus: 'sent' as const }
        : sale
    );
    
    localStorage.setItem('photoSales', JSON.stringify(updatedSales));
    setSales(updatedSales);
    
    toast({
      title: "Entrega iniciada",
      description: "WeTransfer aberto e status atualizado para enviado.",
    });
  };

  const getSaleInfo = (sessionId: string) => {
    return sales.find(sale => sale.sessionId === sessionId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VD': return 'text-green-400';
      case 'D': return 'text-yellow-400';
      case 'NV': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'VD': return 'Vendido';
      case 'D': return 'Desistência';
      case 'NV': return 'Não Visto';
      default: return 'Pendente';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'cartao': return 'Cartão';
      case 'dinheiro': return 'Dinheiro';
      default: return method;
    }
  };

  const getDeliveryStatusColor = (status?: string) => {
    switch (status) {
      case 'sent': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getDeliveryStatusText = (status?: string) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'pending': return 'Pendente';
      default: return '-';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-lg text-blue-300">Gestão de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhum ensaio disponível para venda.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const saleInfo = getSaleInfo(session.id);
                return (
                  <div key={session.id} className="p-4 bg-gray-600 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                        <div>
                          <span className="text-xs text-gray-400">Fotógrafo:</span>
                          <p className="text-white font-medium">{session.photographer}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Modelo:</span>
                          <p className="text-white font-medium">{session.model}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Data:</span>
                          <p className="text-white">{new Date(session.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        
                        {saleInfo && (
                          <>
                            <div>
                              <span className="text-xs text-gray-400">Vendedor:</span>
                              <p className="text-white">{saleInfo.seller}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400">Valor:</span>
                              <p className="text-green-400 font-medium">{formatCurrency(saleInfo.saleValue)}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400">Status:</span>
                              <p className={`font-medium ${getStatusColor(saleInfo.saleStatus)}`}>
                                {getStatusText(saleInfo.saleStatus)}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-400">Entrega:</span>
                              <p className={`font-medium ${getDeliveryStatusColor(saleInfo.deliveryStatus)}`}>
                                {getDeliveryStatusText(saleInfo.deliveryStatus)}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {saleInfo && saleInfo.saleStatus === 'VD' && saleInfo.deliveryStatus === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelivery(session.id)}
                            className="bg-green-600 hover:bg-green-700 border-green-500 text-white"
                          >
                            <Send size={16} />
                            Enviar
                          </Button>
                        )}
                        
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSession(session)}
                              className="bg-blue-600 hover:bg-blue-700 border-blue-500 text-white"
                            >
                              {saleInfo ? <Edit size={16} /> : <DollarSign size={16} />}
                              {saleInfo ? 'Editar' : 'Vender'}
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para edição/cadastro de venda */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-400">
              {selectedSession ? `Venda - ${selectedSession.photographer} / ${selectedSession.model}` : 'Registrar Venda'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Vendedor</Label>
                <Select value={seller} onValueChange={setSeller}>
                  <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                    <SelectValue placeholder="Selecione o vendedor" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-600 border-gray-500">
                    {sellers.map((sellerName) => (
                      <SelectItem key={sellerName} value={sellerName} className="text-white hover:bg-gray-500">
                        {sellerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300">Quantidade de Fotos</Label>
                <Input
                  value={photosQuantity}
                  onChange={(e) => setPhotosQuantity(e.target.value)}
                  type="number"
                  placeholder="Ex: 10"
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Valor da Venda (R$)</Label>
                <Input
                  value={saleValue}
                  onChange={(e) => setSaleValue(e.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="Ex: 150,00"
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>
              
              <div>
                <Label className="text-gray-300">Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={(value: 'pix' | 'cartao' | 'dinheiro') => setPaymentMethod(value)}>
                  <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-600 border-gray-500">
                    <SelectItem value="pix" className="text-white hover:bg-gray-500">PIX</SelectItem>
                    <SelectItem value="cartao" className="text-white hover:bg-gray-500">Cartão</SelectItem>
                    <SelectItem value="dinheiro" className="text-white hover:bg-gray-500">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Status da Venda</Label>
              <Select value={saleStatus} onValueChange={(value: 'VD' | 'D' | 'NV') => setSaleStatus(value)}>
                <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-600 border-gray-500">
                  <SelectItem value="VD" className="text-white hover:bg-gray-500">VD - Vendido</SelectItem>
                  <SelectItem value="D" className="text-white hover:bg-gray-500">D - Desistência</SelectItem>
                  <SelectItem value="NV" className="text-white hover:bg-gray-500">NV - Não Visto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 border-t border-gray-600 pt-4">
              <h4 className="text-blue-300 font-medium">Dados do Cliente</h4>
              
              <div>
                <Label className="text-gray-300">Nome</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">E-mail</Label>
                  <Input
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    type="email"
                    placeholder="email@exemplo.com"
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">WhatsApp</Label>
                  <Input
                    value={clientWhatsapp}
                    onChange={(e) => setClientWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-600">
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
              className="border-gray-500 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveSale}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              Salvar Venda
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesManagement;
