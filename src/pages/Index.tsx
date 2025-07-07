
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Users, FileText, Settings, Trophy, Target } from 'lucide-react';
import SessionRegistration from '@/components/SessionRegistration';
import SalesManagement from '@/components/SalesManagement';
import Reports from '@/components/Reports';
import Configuration from '@/components/Configuration';
import Rankings from '@/components/Rankings';
import Goals from '@/components/Goals';

const Index = () => {
  const [activeTab, setActiveTab] = useState("sessions");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl text-center mb-2 text-zinc-50 font-semibold">Controle de Ensaios Capture Fotografia</h1>
          <p className="text-center text-gray-400">
            Gestão completa de ensaios e vendas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800 mb-6">
            <TabsTrigger value="sessions" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Camera size={16} />
              Ensaios
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users size={16} />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="rankings" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Trophy size={16} />
              Rankings
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Target size={16} />
              Metas
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText size={16} />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Settings size={16} />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400">Cadastro de Ensaios</CardTitle>
              </CardHeader>
              <CardContent>
                <SessionRegistration />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400">Gestão de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <SalesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rankings">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400">Rankings e Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <Rankings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400">Controle de Metas</CardTitle>
              </CardHeader>
              <CardContent>
                <Goals />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400">Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <Reports />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400">Configurações</CardTitle>
              </CardHeader>
              <CardContent>
                <Configuration />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
