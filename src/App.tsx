import { useState } from 'react';
import { StatementForm } from './components/StatementForm';
import { StatementPreview } from './components/StatementPreview';
import { StatementFormData, StatementData } from './types/statement.types';
import { statementService } from './services/statement.service';

type AppState = 'form' | 'generating' | 'preview';

function App() {
  const [appState, setAppState] = useState<AppState>('form');
  const [statementData, setStatementData] = useState<StatementData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const handleFormSubmit = async (formData: StatementFormData) => {
    setAppState('generating');
    setError(null);
    setProgress('Initializing...');

    try {
      setProgress('Calculating block numbers...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress('Fetching wallet balances...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress('Fetching transaction history...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress('Retrieving historical prices...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress('Processing transactions...');
      const data = await statementService.generateStatement(formData);

      setProgress('Statement generated successfully!');
      setStatementData(data);
      setAppState('preview');
    } catch (err) {
      console.error('Error generating statement:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while generating the statement. Please try again.'
      );
      setAppState('form');
    }
  };

  const handleBack = () => {
    setAppState('form');
    setStatementData(null);
    setError(null);
    setProgress('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Crypto Wallet Statement Generator
          </h1>
          <p className="text-gray-400 text-lg">
            Generate professional bank statements for your cryptocurrency wallet
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4">
            <h3 className="text-red-500 font-semibold mb-2">Error</h3>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Form State */}
        {appState === 'form' && (
          <StatementForm onSubmit={handleFormSubmit} loading={false} />
        )}

        {/* Generating State */}
        {appState === 'generating' && (
          <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="inline-block">
                <svg
                  className="animate-spin h-16 w-16 text-blue-500 mx-auto mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Generating Statement...
              </h2>
              <p className="text-gray-400 mb-4">{progress}</p>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                This may take a few moments depending on the number of transactions...
              </p>
            </div>
          </div>
        )}

        {/* Preview State */}
        {appState === 'preview' && statementData && (
          <StatementPreview data={statementData} onBack={handleBack} />
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            Data sourced from Alchemy API • Historical prices from CoinGecko
          </p>
          <p className="mt-2">
            Always verify blockchain data independently. This tool is for informational
            purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
