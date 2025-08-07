
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  photographer: string;
  model: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed';
}

const SessionRegistration = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [photographers, setPhotographers] = useState<string[]>([]);
  const [selectedPhotographer, setSelectedPhotographer] = useState('');
  const [modelName, setModelName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedSessions = localStorage.getItem('photoSessions');
    const savedPhotographers = localStorage.getItem('photographers');
    
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
    if (savedPhotographers) {
      setPhotographers(JSON.parse(savedPhotographers));
    }
  };

  const saveSessions = (newSessions: Session[]) => {
    localStorage.setItem('photoSessions', JSON.stringify(newSessions));
    setSessions(newSessions);
  };

  const handleAddSession = () => {
    if (!selectedPhotographer || !modelName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um fotógrafo e digite o nome do modelo.",
        variant: "destructive"
      });
      return;
    }

    const newSession: Session = {
      id: Date.now().toString(),
      photographer: selectedPhotographer,
      model: modelName.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    const updatedSessions = [...sessions, newSession];
    saveSessions(updatedSessions);
    
    setSelectedPhotographer('');
    setModelName('');
    
    toast({
      title: "Sucesso",
      description: "Ensaio cadastrado com sucesso!",
    });
  };

  const handleDeleteSession = (id: string) => {
    const updatedSessions = sessions.filter(session => session.id !== id);
    saveSessions(updatedSessions);
    
    toast({
      title: "Ensaio removido",
      description: "Ensaio excluído com sucesso.",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Finalizado';
      default: return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'in_progress': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Cadastro */}
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-lg text-blue-300">Novo Ensaio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="photographer" className="text-gray-300">Fotógrafo</Label>
              <Select value={selectedPhotographer} onValueChange={setSelectedPhotographer}>
                <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                  <SelectValue placeholder="Selecione o fotógrafo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-600 border-gray-500">
                  {photographers.map((photographer) => (
                    <SelectItem key={photographer} value={photographer} className="text-white hover:bg-gray-500">
                      {photographer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="model" className="text-gray-300">Nome do Modelo</Label>
              <Input
                id="model"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSession();
                  }
                }}
                placeholder="Digite o nome do modelo"
                className="bg-gray-600 border-gray-500 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAddSession}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={16} className="mr-2" />
            Cadastrar Ensaio
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Ensaios */}
      <Card className="bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="text-lg text-blue-300">Ensaios Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhum ensaio cadastrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
                      <div>
                        <span className="text-xs text-gray-400">Status:</span>
                        <p className={`font-medium ${getStatusColor(session.status)}`}>
                          {getStatusText(session.status)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSession(session.id)}
                    className="ml-3"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionRegistration;
