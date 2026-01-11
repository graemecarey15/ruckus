interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
