import React, { useState } from 'react';
import { Chain, SUPPORTED_CHAINS, DEFAULT_CHAINS } from '../types/chain.types';
import { Plus, X } from 'lucide-react';

interface ChainSelectorProps {
  selectedChains: Chain[];
  onChange: (chains: Chain[]) => void;
  disabled?: boolean;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  selectedChains,
  onChange,
  disabled = false,
}) => {
  const [showAddChains, setShowAddChains] = useState(false);

  const handleToggleChain = (chain: Chain) => {
    const isSelected = selectedChains.some((c) => c.id === chain.id);

    if (isSelected) {
      // Don't allow removing all chains
      if (selectedChains.length === 1) {
        return;
      }
      onChange(selectedChains.filter((c) => c.id !== chain.id));
    } else {
      onChange([...selectedChains, chain]);
    }
  };

  const availableChains = SUPPORTED_CHAINS.filter(
    (chain) => !selectedChains.some((c) => c.id === chain.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Selected Networks</h2>
        {availableChains.length > 0 && (
          <button
            onClick={() => setShowAddChains(!showAddChains)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            {showAddChains ? (
              <>
                <X size={16} />
                Cancel
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Network
              </>
            )}
          </button>
        )}
      </div>

      {/* Selected Chains */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {selectedChains.map((chain) => (
          <div
            key={chain.id}
            className="flex items-center justify-between p-4 rounded-lg border-2 transition-colors"
            style={{
              borderColor: chain.color,
              backgroundColor: `${chain.color}15`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: chain.color }}
              />
              <div>
                <div className="font-semibold text-white">{chain.name}</div>
                <div className="text-xs text-gray-400">{chain.symbol}</div>
              </div>
            </div>
            {selectedChains.length > 1 && (
              <button
                onClick={() => handleToggleChain(chain)}
                className="p-1 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
                title="Remove network"
              >
                <X size={16} className="text-red-400" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Chains Modal/Section */}
      {showAddChains && availableChains.length > 0 && (
        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-3">
            Add Additional Networks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableChains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  handleToggleChain(chain);
                  setShowAddChains(false);
                }}
                className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-600 hover:border-gray-500 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chain.color }}
                />
                <div>
                  <div className="font-semibold text-white">{chain.name}</div>
                  <div className="text-xs text-gray-400">{chain.symbol}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-400">
        {selectedChains.length} network{selectedChains.length !== 1 ? 's' : ''} selected
        {selectedChains.length === 1 && ' (minimum 1 required)'}
      </p>
    </div>
  );
};
