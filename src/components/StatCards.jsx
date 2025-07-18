import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCards = ({ stats }) => {
  const statItems = [
    { title: 'Revenu Total', value: `${stats.totalRevenue.toFixed(2)} €`, icon: DollarSign, color: 'text-green-500' },
    { title: 'Dépenses Totales', value: `${stats.totalExpenses.toFixed(2)} €`, icon: TrendingDown, color: 'text-red-500' },
    { title: 'Bénéfice', value: `${stats.profit.toFixed(2)} €`, icon: TrendingUp, color: 'text-blue-500' },
    { title: 'Stock faible', value: stats.lowStockProductsCount, icon: AlertTriangle, color: 'text-yellow-500' }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {statItems.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatCards;