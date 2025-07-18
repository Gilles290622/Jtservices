import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CreditCard } from 'lucide-react';
import StreamingUserManagement from './StreamingUserManagement';
import StreamingSubscriptionManagement from './StreamingSubscriptionManagement';

const SubscriberManagement = () => {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800">
        <TabsTrigger value="users">
          <Users className="mr-2 h-4 w-4" />
          Tous les utilisateurs
        </TabsTrigger>
        <TabsTrigger value="approvals">
          <CreditCard className="mr-2 h-4 w-4" />
          Approbations manuelles
        </TabsTrigger>
      </TabsList>
      <TabsContent value="users" className="mt-4">
        <StreamingUserManagement />
      </TabsContent>
      <TabsContent value="approvals" className="mt-4">
        <StreamingSubscriptionManagement />
      </TabsContent>
    </Tabs>
  );
};

export default SubscriberManagement;