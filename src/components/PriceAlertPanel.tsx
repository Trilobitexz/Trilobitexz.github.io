import React, { useState } from 'react';
import { PriceAlert } from '../hooks/useFirebaseSync';
import { Bell, BellOff, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceAlertPanelProps {
  symbol: string;
  currentPrice: number;
  alerts: PriceAlert[];
  addAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
  setAlertActive: (id: string, active: boolean) => void;
  deleteAlert: (id: string) => void;
}

export default function PriceAlertPanel({ symbol, currentPrice, alerts, addAlert, setAlertActive, deleteAlert }: PriceAlertPanelProps) {
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  
  const symbolAlerts = alerts.filter(a => a.symbol === symbol);

  const handleAdd = (condition: 'above' | 'below') => {
    const val = parseFloat(targetPriceInput);
    if (!isNaN(val) && val > 0) {
      addAlert(symbol, val, condition);
      setTargetPriceInput('');
    }
  };

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 shadow-sm w-full font-sans text-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-[#30363D] pb-3 text-[#C9D1D9]">
        <Bell className="w-4 h-4 text-[#58A6FF]" />
        <h3 className="font-semibold">{symbol} 雲端價格警報</h3>
        <span className="text-xs text-[#8B949E] ml-auto">當前價格: <span className="font-mono">{currentPrice?.toFixed(2) || '---'}</span></span>
      </div>

      <div className="flex gap-2 mb-4 items-center flex-wrap sm:flex-nowrap">
        <label className="text-[12px] text-[#8B949E] shrink-0 font-medium">通知觸發條件：</label>
        <input 
          type="number"
          placeholder="目標價..."
          value={targetPriceInput}
          onChange={(e) => setTargetPriceInput(e.target.value)}
          className="bg-[#010409] border border-[#30363D] px-3 py-1.5 md:py-1.5 rounded text-[#C9D1D9] text-[16px] sm:text-sm focus:outline-none focus:border-[#58A6FF] flex-1 max-w-[150px] min-h-[44px] sm:min-h-0"
        />
        <button 
          onClick={() => handleAdd('above')}
          className="flex items-center gap-1.5 px-3 py-1.5 md:py-1.5 bg-[#238636]/10 text-emerald-400 hover:bg-[#238636]/30 border border-[#238636]/20 rounded transition-colors min-h-[44px] sm:min-h-0 min-w-[max-content] justify-center flex-1 sm:flex-none"
        >
          <TrendingUp className="w-3.5 h-3.5" /> 向上突破
        </button>
        <button 
          onClick={() => handleAdd('below')}
          className="flex items-center gap-1.5 px-3 py-1.5 md:py-1.5 bg-[#DA3633]/10 text-rose-400 hover:bg-[#DA3633]/30 border border-[#DA3633]/20 rounded transition-colors min-h-[44px] sm:min-h-0 min-w-[max-content] justify-center flex-1 sm:flex-none"
        >
          <TrendingDown className="w-3.5 h-3.5" /> 向下突破
        </button>
      </div>

      {symbolAlerts.length > 0 ? (
        <ul className="space-y-2 mt-4 max-h-[200px] overflow-y-auto pr-1">
          {symbolAlerts.map(alert => (
             <li key={alert.id} className="flex items-center justify-between bg-[#0D1117] px-3 py-2 rounded-lg border border-[#30363D] group">
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setAlertActive(alert.id, !alert.isActive)}
                   className={`p-1.5 rounded-full ${alert.isActive ? 'bg-[#58A6FF]/20 text-[#58A6FF]' : 'bg-[#30363D] text-[#8B949E]'}`}
                   title={alert.isActive ? "暫停警報" : "啟用警報"}
                 >
                   {alert.isActive ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                 </button>
                 <div className="flex items-center gap-1 text-[13px]">
                   <span className="text-[#8B949E]">當價格</span>
                   <span className={`font-semibold ${alert.condition === 'above' ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {alert.condition === 'above' ? '≥ (大於等於)' : '≤ (小於等於)'}
                   </span>
                   <span className="font-mono text-[#C9D1D9] font-bold">{alert.targetPrice.toFixed(2)}</span>
                 </div>
               </div>
               <button 
                 onClick={() => deleteAlert(alert.id)}
                 className="text-[#8B949E] hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
             </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-xs text-[#8B949E] py-4 italic border-t border-[#30363D]/50 mt-4">
          目前沒有設定任何警報。新增價格條件，當達到時將顯示瀏覽器通知。
        </div>
      )}
    </div>
  );
}
