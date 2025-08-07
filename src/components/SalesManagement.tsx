
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, DollarSign, Send, ExternalLink, Filter, MessageCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  photographer: string;
  model: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed';
  folderPath?: string;
}

interface PaymentMethod {
  method: 'pix' | 'cartao' | 'dinheiro';
  value: number;
}

interface Sale {
  sessionId: string;
  seller: string;
  photosQuantity: number;
  saleValue: number;
  paymentMethods: PaymentMethod[];
  saleStatus: 'VD' | 'D' | 'NV';
  clientName: string;
  clientEmail: string;
  clientWhatsapp: string;
  timestamp: string;
  deliveryStatus?: 'pending' | 'sent';
  photoType?: 'selected' | 'complete' | 'courtesy' | 'none';
}

const SalesManagement = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [sellers, setSellers] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'not_sold' | 'sold_pending' | 'sold_sent'>('all');
  const { toast } = useToast();

  // Form states
  const [seller, setSeller] = useState('');
  const [photosQuantity, setPhotosQuantity] = useState('');
  const [saleValue, setSaleValue] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([{ method: 'pix', value: 0 }]);
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
    setPhotosQuantity('selected');
    setSaleValue('');
    setPaymentMethods([{ method: 'pix', value: 0 }]);
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
      setPhotosQuantity(existingSale.photoType || 'selected');
      setSaleValue(existingSale.saleValue.toString());
      setPaymentMethods(existingSale.paymentMethods || [{ method: 'pix', value: existingSale.saleValue }]);
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
    if (!selectedSession) {
      toast({
        title: "Erro",
        description: "Sessão não selecionada.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields based on status
    if (saleStatus === 'VD' && (!photosQuantity || !saleValue)) {
      toast({
        title: "Erro",
        description: "Para vendas concluídas, preencha tipo de ensaio e valor.",
        variant: "destructive"
      });
      return;
    }

    if (saleStatus === 'NV') {
      // For "not seen" status, no seller validation needed
    } else if (!seller) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um vendedor.",
        variant: "destructive"
      });
      return;
    }

    const saleData: Sale = {
      sessionId: selectedSession.id,
      seller: saleStatus === 'NV' ? '' : seller,
      photosQuantity: saleStatus === 'VD' ? (photosQuantity === 'complete' ? 1 : 0) : 0,
      saleValue: saleStatus === 'VD' ? parseFloat(saleValue) : 0,
      paymentMethods: saleStatus === 'VD' ? paymentMethods : [],
      saleStatus,
      clientName,
      clientEmail,
      clientWhatsapp,
      timestamp: new Date().toISOString(),
      deliveryStatus: saleStatus === 'VD' ? 'pending' : undefined,
      photoType: saleStatus === 'VD' ? (photosQuantity as 'selected' | 'complete') : saleStatus === 'D' ? (photosQuantity as 'courtesy' | 'none') : undefined
    };

    const updatedSales = sales.filter(sale => sale.sessionId !== selectedSession.id);
    updatedSales.push(saleData);
    
    localStorage.setItem('photoSales', JSON.stringify(updatedSales));
    setSales(updatedSales);
    
    // Update session status
    const updatedSessions = sessions.map(session => 
      session.id === selectedSession.id 
        ? { ...session, status: saleStatus === 'VD' ? 'completed' as const : saleStatus === 'D' ? 'in_progress' as const : 'pending' as const }
        : session
    );
    localStorage.setItem('photoSessions', JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
    
    // Dispara evento para atualizar relatórios
    window.dispatchEvent(new Event('localStorageUpdate'));
    
    setIsDialogOpen(false);
    resetForm();
    setSelectedSession(null);
    
    toast({
      title: "Sucesso",
      description: "Venda registrada com sucesso!",
    });
  };

  const handleDelivery = async (sessionId: string) => {
    const sale = sales.find(s => s.sessionId === sessionId);
    
    // Copy email to clipboard
    if (sale?.clientEmail) {
      try {
        await navigator.clipboard.writeText(sale.clientEmail);
        toast({
          title: "E-mail copiado",
          description: `${sale.clientEmail} copiado para a área de transferência.`,
        });
      } catch (error) {
        console.error('Failed to copy email:', error);
      }
    }
    
    // Open WeTransfer
    window.open('https://wetransfer.com/', '_blank');
    
    // Try to open file explorer with different approaches
    try {
      // Method 1: Create invisible file input
      const input = document.createElement('input');
      input.type = 'file';
      input.style.display = 'none';
      input.multiple = true;
      input.webkitdirectory = false;
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
      document.body.appendChild(input);
      
      // Add event listener before triggering click
      input.addEventListener('cancel', () => {
        document.body.removeChild(input);
      });
      
      input.click();
      
      // Clean up after a delay
      setTimeout(() => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }, 1000);
    } catch (error) {
      console.log('Method 1 failed, trying alternative approaches');
      
      // Method 2: Try different file input approach
      try {
        const input2 = document.createElement('input');
        input2.type = 'file';
        input2.multiple = true;
        input2.click();
      } catch (error2) {
        console.log('File explorer opening methods failed:', error2);
      }
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
      description: "WeTransfer aberto, e-mail copiado e status atualizado.",
    });
  };

  const handleWhatsApp = async (sessionId: string) => {
    const sale = sales.find(s => s.sessionId === sessionId);
    
    if (sale?.clientWhatsapp) {
      const cleanWhatsapp = sale.clientWhatsapp.replace(/\D/g, '');
      const whatsappUrl = `https://web.whatsapp.com/send?phone=55${cleanWhatsapp}`;
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "WhatsApp Web aberto",
        description: `Conversa com ${sale.clientWhatsapp} iniciada.`,
      });
    } else {
      toast({
        title: "WhatsApp não disponível",
        description: "Número de WhatsApp não cadastrado para este cliente.",
        variant: "destructive"
      });
    }
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

  const getSortedSessions = () => {
    const sessionsWithSales = sessions.map(session => {
      const saleInfo = getSaleInfo(session.id);
      return { session, saleInfo };
    });

    // Sort by priority: not sold > sold pending > sold sent
    return sessionsWithSales.sort((a, b) => {
      if (!a.saleInfo && !b.saleInfo) return 0;
      if (!a.saleInfo) return -1;
      if (!b.saleInfo) return 1;
      
      if (a.saleInfo.saleStatus === 'VD' && b.saleInfo.saleStatus === 'VD') {
        if (a.saleInfo.deliveryStatus === 'pending' && b.saleInfo.deliveryStatus === 'sent') return -1;
        if (a.saleInfo.deliveryStatus === 'sent' && b.saleInfo.deliveryStatus === 'pending') return 1;
        return 0;
      }
      
      if (a.saleInfo.saleStatus === 'VD') return 1;
      if (b.saleInfo.saleStatus === 'VD') return -1;
      
      return 0;
    });
  };

  const getFilteredSessions = () => {
    const sortedSessions = getSortedSessions();
    
    if (filterStatus === 'all') return sortedSessions;
    
    return sortedSessions.filter(({ saleInfo }) => {
      switch (filterStatus) {
        case 'not_sold':
          return !saleInfo || saleInfo.saleStatus !== 'VD';
        case 'sold_pending':
          return saleInfo && saleInfo.saleStatus === 'VD' && saleInfo.deliveryStatus === 'pending';
        case 'sold_sent':
          return saleInfo && saleInfo.saleStatus === 'VD' && saleInfo.deliveryStatus === 'sent';
        default:
          return true;
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-lg text-blue-300 flex items-center justify-between">
            Gestão de Vendas
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(value: 'all' | 'not_sold' | 'sold_pending' | 'sold_sent') => setFilterStatus(value)}>
                <SelectTrigger className="w-48 bg-gray-600 border-gray-500 text-white">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-600 border-gray-500">
                  <SelectItem value="all" className="text-white hover:bg-gray-500">Todos</SelectItem>
                  <SelectItem value="not_sold" className="text-white hover:bg-gray-500">Não Vendidos</SelectItem>
                  <SelectItem value="sold_pending" className="text-white hover:bg-gray-500">Vendidos - Pendentes</SelectItem>
                  <SelectItem value="sold_sent" className="text-white hover:bg-gray-500">Vendidos - Enviados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhum ensaio disponível para venda.</p>
          ) : (
            <div className="space-y-3">
              {getFilteredSessions().map(({ session, saleInfo }) => (
                <div key={session.id} className="p-4 bg-gray-600 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 flex-1">
                      <div>
                        <span className="text-xs text-gray-400">Fotógrafo:</span>
                        <p className="text-white font-medium">{session.photographer}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Modelo:</span>
                        <p className="text-white font-medium">{session.model}</p>
                      </div>
                      
                      {saleInfo && (
                        <>
                          <div>
                            <span className="text-xs text-gray-400">Vendedor:</span>
                            <p className="text-white">{saleInfo.seller}</p>
                          </div>
                          {saleInfo.saleStatus === 'VD' && (
                            <div>
                              <span className="text-xs text-gray-400">Valor:</span>
                              <p className="text-green-400 font-medium">{formatCurrency(saleInfo.saleValue)}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-xs text-gray-400">Status:</span>
                            <p className={`font-medium ${getStatusColor(saleInfo.saleStatus)}`}>
                              {getStatusText(saleInfo.saleStatus)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {saleInfo && saleInfo.saleStatus === 'VD' && saleInfo.deliveryStatus === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelivery(session.id)}
                            className="bg-green-600 hover:bg-green-700 border-green-500 text-white"
                          >
                            <Send size={16} />
                            WeTransfer
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWhatsApp(session.id)}
                            className="bg-green-500 hover:bg-green-600 border-green-400 text-white"
                          >
                            <Send size={16} />
                            WhatsApp
                          </Button>
                        </div>
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
                  
                   {/* Payment info for sold items */}
                   {saleInfo && saleInfo.saleStatus === 'VD' && saleInfo.paymentMethods && saleInfo.paymentMethods.length > 0 && (
                     <div className="mt-3 pt-3 border-t border-gray-500">
                       <div className="flex flex-wrap gap-2">
                         <span className="text-xs text-gray-400">Pagamento:</span>
                         {saleInfo.paymentMethods.map((payment, index) => (
                           <span key={index} className="text-blue-300 text-sm">
                             {getPaymentMethodText(payment.method)}: {formatCurrency(payment.value)}
                             {index < saleInfo.paymentMethods.length - 1 && ' + '}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Client contact info */}
                   {saleInfo && (saleInfo.clientEmail || saleInfo.clientWhatsapp) && (
                     <div className="mt-3 pt-3 border-t border-gray-500">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                         {saleInfo.clientEmail && (
                           <div>
                             <span className="text-xs text-gray-400">E-mail:</span>
                             <p className="text-blue-300 text-sm">{saleInfo.clientEmail}</p>
                           </div>
                         )}
                         {saleInfo.clientWhatsapp && (
                           <div>
                             <span className="text-xs text-gray-400">WhatsApp:</span>
                             <p className="text-green-300 text-sm">{saleInfo.clientWhatsapp}</p>
                           </div>
                         )}
                       </div>
                     </div>
                   )}
                </div>
              ))}
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
              {saleStatus !== 'NV' && (
                <div>
                  <Label className="text-gray-300">Vendedor *</Label>
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
              )}
              
              <div>
                <Label className="text-gray-300">Status da Venda *</Label>
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
            </div>

            {/* Conditional fields for VD status */}
            {saleStatus === 'VD' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Tipo de Ensaio *</Label>
                    <Select value={photosQuantity} onValueChange={setPhotosQuantity}>
                      <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-600 border-gray-500">
                        <SelectItem value="selected" className="text-white hover:bg-gray-500">Apenas Selecionadas</SelectItem>
                        <SelectItem value="complete" className="text-white hover:bg-gray-500">Ensaio Completo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Valor da Venda (R$) *</Label>
                    <Input
                      value={saleValue}
                      onChange={(e) => setSaleValue(e.target.value)}
                      type="number"
                      step="0.01"
                      placeholder="Ex: 150,00"
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Formas de Pagamento</Label>
                    {paymentMethods.length < 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentMethods([...paymentMethods, { method: 'cartao', value: 0 }])}
                        className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white"
                      >
                        + Adicionar segunda forma
                      </Button>
                    )}
                  </div>
                  
                  {paymentMethods.map((payment, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-700 rounded-lg">
                      <div>
                        <Label className="text-gray-300 text-sm">Forma de Pagamento {index + 1}</Label>
                        <Select
                          value={payment.method}
                          onValueChange={(value: 'pix' | 'cartao' | 'dinheiro') => {
                            const newPayments = [...paymentMethods];
                            newPayments[index].method = value;
                            setPaymentMethods(newPayments);
                          }}
                        >
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
                      
                      <div>
                        <Label className="text-gray-300 text-sm">Valor (R$)</Label>
                        <Input
                          value={payment.value || ''}
                          onChange={(e) => {
                            const newPayments = [...paymentMethods];
                            newPayments[index].value = parseFloat(e.target.value) || 0;
                            setPaymentMethods(newPayments);
                          }}
                          type="number"
                          step="0.01"
                          placeholder="Ex: 40,00"
                          className="bg-gray-600 border-gray-500 text-white"
                        />
                      </div>
                      
                      {paymentMethods.length > 1 && (
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPayments = paymentMethods.filter((_, i) => i !== index);
                              setPaymentMethods(newPayments);
                            }}
                            className="border-red-500 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            Remover
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {paymentMethods.length > 1 && (
                    <div className="text-sm text-gray-400">
                      Total: {formatCurrency(paymentMethods.reduce((sum, p) => sum + (p.value || 0), 0))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Conditional fields for D status */}
            {saleStatus === 'D' && (
              <div>
                <Label className="text-gray-300">Tipo de Entrega</Label>
                <Select value={photosQuantity} onValueChange={setPhotosQuantity}>
                  <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-600 border-gray-500">
                    <SelectItem value="courtesy" className="text-white hover:bg-gray-500">Foto Cortesia</SelectItem>
                    <SelectItem value="none" className="text-white hover:bg-gray-500">Nenhuma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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
