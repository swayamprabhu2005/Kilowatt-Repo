import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api/client';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { History, Clock } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: () => apiFetch<any[]>('/activity?limit=50'),
  });

  return (
    <div className="space-y-6 animate-enter">
      <div>
        <h2 className="text-xl font-bold text-ink tracking-tight">Activity & Audit Log</h2>
        <p className="text-xs text-ink-secondary mt-0.5">Immutable audit record of catalogue modifications and channel actions</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-surface-border text-ink-secondary font-semibold uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="p-4">Entity</th>
                <th className="p-4">Action</th>
                <th className="p-4">Operator</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-surface-muted/60 transition-colors">
                  <td className="p-4 font-mono font-medium text-ink capitalize">{a.entityType}</td>
                  <td className="p-4">
                    <Badge variant="neutral" className="uppercase font-mono text-[10px]">
                      {a.action}
                    </Badge>
                  </td>
                  <td className="p-4 text-ink-secondary">{a.userName}</td>
                  <td className="p-4 text-ink-muted font-mono text-[11px] max-w-xs truncate">
                    {JSON.stringify(a.details)}
                  </td>
                  <td className="p-4 text-right text-ink-muted">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!isLoading && activities.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-ink-muted">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-terracotta-500" />
                    <p className="font-semibold text-ink text-sm">No activity records logged yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
