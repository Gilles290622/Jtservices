import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, TrendingDown, Receipt, Users } from 'lucide-react';

const tabs = [
  { id: 'sales', label: 'Ventes', icon: ShoppingCart },
  { id: 'stock', label: 'Stock', icon: Package },
  { id: 'expenses', label: 'Dépenses', icon: TrendingDown },
  { id: 'invoices', label: 'Factures', icon: Receipt },
  { id: 'customers', label: 'Clients', icon: Users },
];

const TabNavigation = ({ activeTab, setActiveTab }) => (
  <div className="flex justify-center mb-8">
    <div className="bg-muted rounded-lg p-1">
      <div className="flex space-x-1">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 transition-colors duration-200 ${
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>
    </div>
  </div>
);

export default TabNavigation;