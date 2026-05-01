import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { walletApi } from '@/lib/escrow-api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Clock, TrendingUp, DollarSign, Shield, Ban,
} from 'lucide-react';
import type { Transaction, TransactionType } from '@/types/escrow';

const txTypeConfig: Record<TransactionType, { icon: React.ElementType; color: string; label: string }> = {
  payment: { icon: ArrowDownLeft, color: 'text-success', label: 'Payment Received' },
  escrow_hold: { icon: Shield, color: 'text-primary', label: 'Escrow Hold' },
  escrow_release: { icon: TrendingUp, color: 'text-success', label: 'Escrow Release' },
  refund: { icon: Ban, color: 'text-destructive', label: 'Refund' },
  withdrawal: { icon: ArrowUpRight, color: 'text-warning', label: 'Withdrawal' },
  withdrawal_fee: { icon: DollarSign, color: 'text-muted-foreground', label: 'Withdrawal Fee' },
};

export default function SellerWalletPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '', iban: '', swiftCode: '' });

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.getMyWallet(),
    enabled: !!user,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => walletApi.getTransactions(),
    enabled: !!user,
  });

  const withdrawMutation = useMutation({
    mutationFn: () => walletApi.withdraw({
      amount: parseFloat(withdrawAmount),
      currency: wallet?.currency || 'USD',
      bankDetails,
    }),
    onSuccess: () => {
      toast({ title: t('escrow.withdrawalSubmitted', 'Withdrawal request submitted') });
      setWithdrawOpen(false);
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: () => toast({ title: t('common.error'), variant: 'destructive' }),
  });

  const wallet = walletData?.data;
  const transactions = txData?.data || [];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('escrow.wallet', 'Wallet')}</h1>
        <p className="text-muted-foreground">{t('escrow.walletDesc', 'Manage your earnings and withdrawals')}</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {walletLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            <Card className="border-success/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Wallet className="h-5 w-5 text-success" />
                  </div>
                  <span className="text-sm text-muted-foreground">{t('escrow.available', 'Available Balance')}</span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {wallet?.currency || 'USD'} {(wallet?.availableBalance || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{t('escrow.pending', 'Pending (Escrow)')}</span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {wallet?.currency || 'USD'} {(wallet?.pendingBalance || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">{t('escrow.totalEarnings', 'Total Earnings')}</span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {wallet?.currency || 'USD'} {((wallet?.availableBalance || 0) + (wallet?.pendingBalance || 0)).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Withdraw Button */}
      <div className="flex justify-end">
        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogTrigger asChild>
            <Button disabled={!wallet || wallet.availableBalance <= 0}>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              {t('escrow.withdraw', 'Withdraw Funds')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('escrow.withdrawFunds', 'Withdraw Funds')}</DialogTitle>
              <DialogDescription>
                {t('escrow.withdrawDesc', 'Enter the amount and bank details for withdrawal')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('escrow.amount', 'Amount')} ({wallet?.currency || 'USD'})</Label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={wallet?.availableBalance}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('escrow.maxWithdraw', 'Max')}: {wallet?.currency} {wallet?.availableBalance?.toLocaleString()}
                </p>
              </div>
              <div>
                <Label>{t('escrow.bankName', 'Bank Name')}</Label>
                <Input value={bankDetails.bankName} onChange={(e) => setBankDetails(p => ({ ...p, bankName: e.target.value }))} />
              </div>
              <div>
                <Label>{t('escrow.accountNumber', 'Account Number')}</Label>
                <Input value={bankDetails.accountNumber} onChange={(e) => setBankDetails(p => ({ ...p, accountNumber: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>IBAN</Label>
                  <Input value={bankDetails.iban} onChange={(e) => setBankDetails(p => ({ ...p, iban: e.target.value }))} />
                </div>
                <div>
                  <Label>SWIFT</Label>
                  <Input value={bankDetails.swiftCode} onChange={(e) => setBankDetails(p => ({ ...p, swiftCode: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setWithdrawOpen(false)}>{t('common.cancel')}</Button>
              <Button
                onClick={() => withdrawMutation.mutate()}
                disabled={withdrawMutation.isPending || !withdrawAmount || !bankDetails.bankName || !bankDetails.accountNumber}
              >
                {withdrawMutation.isPending ? t('common.loading') : t('escrow.confirmWithdraw', 'Confirm Withdrawal')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>{t('escrow.transactionHistory', 'Transaction History')}</CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('escrow.noTransactions', 'No transactions yet')}</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const config = txTypeConfig[tx.type];
                const TxIcon = config.icon;
                const isPositive = ['payment', 'escrow_release'].includes(tx.type);
                return (
                  <div key={tx._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted`}>
                        <TxIcon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{config.label}</p>
                        <p className="text-xs text-muted-foreground">{tx.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        {isPositive ? '+' : '-'}{tx.currency} {Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
