
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Users, Camera } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Configuration = () => {
  const [photographers, setPhotographers] = useState<string[]>([]);
  const [sellers, setSellers] = useState<string[]>([]);
  const [newPhotographer, setNewPhotographer] = useState('');
  const [newSeller, setNewSeller] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedPhotographers = localStorage.getItem('photographers');
    const savedSellers = localStorage.getItem('sellers');
    
    if (savedPhotographers) {
      setPhotographers(JSON.parse(savedPhotographers));
    } else {
      // Fotógrafos padrão baseados no exemplo
      const defaultPhotographers = ['Ramon', 'Anne', 'Gabriel', 'Fabricio'];
      setPhotographers(defaultPhotographers);
      localStorage.setItem('photographers', JSON.stringify(defaultPhotographers));
    }
    
    if (savedSellers) {
      setSellers(JSON.parse(savedSellers));
    } else {
      // Vendedores padrão baseados no exemplo
      const defaultSellers = ['Ingrid', 'Wiliam'];
      setSellers(defaultSellers);
      localStorage.setItem('sellers', JSON.stringify(defaultSellers));
    }
  };

  const addPhotographer = () => {
    if (!newPhotographer.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o nome do fotógrafo.",
        variant: "destructive"
      });
      return;
    }
    
    if (photographers.includes(newPhotographer.trim())) {
      toast({
        title: "Erro",
        description: "Este fotógrafo já está cadastrado.",
        variant: "destructive"
      });
      return;
    }

    const updatedPhotographers = [...photographers, newPhotographer.trim()];
    setPhotographers(updatedPhotographers);
    localStorage.setItem('photographers', JSON.stringify(updatedPhotographers));
    setNewPhotographer('');
    
    toast({
      title: "Sucesso",
      description: "Fotógrafo adicionado com sucesso!",
    });
  };

  const removePhotographer = (photographer: string) => {
    const updatedPhotographers = photographers.filter(p => p !== photographer);
    setPhotographers(updatedPhotographers);
    localStorage.setItem('photographers', JSON.stringify(updatedPhotographers));
    
    toast({
      title: "Removido",
      description: "Fotógrafo removido com sucesso.",
    });
  };

  const addSeller = () => {
    if (!newSeller.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o nome do vendedor.",
        variant: "destructive"
      });
      return;
    }
    
    if (sellers.includes(newSeller.trim())) {
      toast({
        title: "Erro",
        description: "Este vendedor já está cadastrado.",
        variant: "destructive"
      });
      return;
    }

    const updatedSellers = [...sellers, newSeller.trim()];
    setSellers(updatedSellers);
    localStorage.setItem('sellers', JSON.stringify(updatedSellers));
    setNewSeller('');
    
    toast({
      title: "Sucesso",
      description: "Vendedor adicionado com sucesso!",
    });
  };

  const removeSeller = (seller: string) => {
    const updatedSellers = sellers.filter(s => s !== seller);
    setSellers(updatedSellers);
    localStorage.setItem('sellers', JSON.stringify(updatedSellers));
    
    toast({
      title: "Removido",
      description: "Vendedor removido com sucesso.",
    });
  };

  const clearAllData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.clear();
      loadData(); // Recarrega com dados padrão
      
      toast({
        title: "Dados limpos",
        description: "Todos os dados foram removidos e o sistema foi reiniciado.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuração de Fotógrafos */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
              <Camera size={20} />
              Fotógrafos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newPhotographer}
                onChange={(e) => setNewPhotographer(e.target.value)}
                placeholder="Nome do fotógrafo"
                className="bg-gray-600 border-gray-500 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addPhotographer()}
              />
              <Button 
                onClick={addPhotographer}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={16} />
              </Button>
            </div>
            
            <div className="space-y-2">
              {photographers.map((photographer) => (
                <div key={photographer} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                  <span className="text-white">{photographer}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removePhotographer(photographer)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              {photographers.length === 0 && (
                <p className="text-gray-400 text-center py-2">Nenhum fotógrafo cadastrado</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuração de Vendedores */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
              <Users size={20} />
              Vendedores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSeller}
                onChange={(e) => setNewSeller(e.target.value)}
                placeholder="Nome do vendedor"
                className="bg-gray-600 border-gray-500 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addSeller()}
              />
              <Button 
                onClick={addSeller}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={16} />
              </Button>
            </div>
            
            <div className="space-y-2">
              {sellers.map((seller) => (
                <div key={seller} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                  <span className="text-white">{seller}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSeller(seller)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              {sellers.length === 0 && (
                <p className="text-gray-400 text-center py-2">Nenhum vendedor cadastrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Área de Perigo */}
      <Card className="bg-gray-700 border-red-600">
        <CardHeader>
          <CardTitle className="text-lg text-red-400">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              Esta ação irá remover todos os dados salvos no sistema, incluindo ensaios, vendas e configurações.
            </p>
            <Button 
              onClick={clearAllData}
              variant="destructive"
              className="w-full"
            >
              <Trash2 size={16} className="mr-2" />
              Limpar Todos os Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-lg text-blue-300">Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-300">
            <p><strong>Versão:</strong> 1.0.0</p>
            <p><strong>Armazenamento:</strong> Local (sem internet necessária)</p>
            <p><strong>Dados salvos:</strong> Navegador local</p>
            <p className="text-yellow-400 mt-4">
              ⚠️ Os dados são salvos apenas neste navegador. Para backup, utilize os relatórios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuration;
