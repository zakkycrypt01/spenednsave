'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Trash2, Copy, Check, Eye } from 'lucide-react';

interface WithdrawalMessage {
  id: string;
  name: string;
  withdrawalType: 'standard' | 'emergency' | 'scheduled' | 'batch';
  message: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
}

const WITHDRAWAL_TYPES = [
  { id: 'standard', label: 'Standard Withdrawal', icon: '💳' },
  { id: 'emergency', label: 'Emergency Withdrawal', icon: '🚨' },
  { id: 'scheduled', label: 'Scheduled Withdrawal', icon: '⏰' },
  { id: 'batch', label: 'Batch Withdrawal', icon: '📦' }
];

const AVAILABLE_VARIABLES = [
  { name: 'amount', label: 'Withdrawal Amount', example: '$1,250.00' },
  { name: 'date', label: 'Withdrawal Date', example: 'January 17, 2026' },
  { name: 'time', label: 'Withdrawal Time', example: '2:30 PM' },
  { name: 'recipient', label: 'Recipient Address', example: '0x742d...3E8Db' },
  { name: 'guardianName', label: 'Guardian Name', example: 'Sarah Johnson' },
  { name: 'vaultName', label: 'Vault Name', example: 'Emergency Fund' },
  { name: 'count', label: 'Withdrawal Count', example: '5 of 10' }
];

const SAMPLE_MESSAGES: WithdrawalMessage[] = [
  {
    id: '1',
    name: 'Standard Notification',
    withdrawalType: 'standard',
    message: 'You are withdrawing {{amount}} from {{vaultName}}. This transaction was initiated on {{date}} at {{time}}.',
    variables: ['amount', 'vaultName', 'date', 'time'],
    isActive: true,
    createdAt: '2026-01-10'
  },
  {
    id: '2',
    name: 'Emergency Alert',
    withdrawalType: 'emergency',
    message: 'EMERGENCY WITHDRAWAL: {{amount}} is being withdrawn. Guardian {{guardianName}} has approved this emergency transaction. Initiated at {{time}} on {{date}}.',
    variables: ['amount', 'guardianName', 'time', 'date'],
    isActive: true,
    createdAt: '2026-01-12'
  },
  {
    id: '3',
    name: 'Scheduled Reminder',
    withdrawalType: 'scheduled',
    message: 'Your scheduled withdrawal of {{amount}} is confirmed for {{date}}. Recipient: {{recipient}}. Reference: {{count}}.',
    variables: ['amount', 'date', 'recipient', 'count'],
    isActive: false,
    createdAt: '2026-01-08'
  }
];

export function CustomWithdrawalMessages() {
  const [messages, setMessages] = useState<WithdrawalMessage[]>(SAMPLE_MESSAGES);
  const [showForm, setShowForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WithdrawalMessage | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    withdrawalType: 'standard',
    message: '',
    variables: [] as string[]
  });

  const getWithdrawalTypeLabel = (typeId: string) => {
    return WITHDRAWAL_TYPES.find(t => t.id === typeId)?.label || typeId;
  };

  const getWithdrawalTypeIcon = (typeId: string) => {
    return WITHDRAWAL_TYPES.find(t => t.id === typeId)?.icon || '📝';
  };

  const handleAddMessage = () => {
    if (formData.name && formData.message) {
      const generateId = () => String(Math.random()).slice(2, 11);
      const newMessage: WithdrawalMessage = {
        id: generateId(),
        name: formData.name,
        withdrawalType: formData.withdrawalType as 'standard' | 'emergency' | 'scheduled' | 'batch',
        message: formData.message,
        variables: extractVariables(formData.message),
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setMessages([newMessage, ...messages]);
      setFormData({ name: '', withdrawalType: 'standard', message: '', variables: [] });
      setShowForm(false);
    }
  };

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const found = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      found.add(match[1]);
    }
    return Array.from(found);
  };

  const generatePreview = (msg: WithdrawalMessage) => {
    let preview = msg.message;
    const examples: Record<string, string> = {
      amount: '$2,500.00',
      date: 'January 17, 2026',
      time: '3:45 PM',
      recipient: '0x742d35Cc6634C0532925a3b844Bc8e7595f3E8Db',
      guardianName: 'Michael Chen',
      vaultName: 'Savings Vault',
      count: '3 of 5'
    };
    
    Object.entries(examples).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return preview;
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
      setPreview('');
    }
  };

  const handleToggleActive = (id: string) => {
    setMessages(messages.map(m =>
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const handleCopyMessage = (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (msg) {
      navigator.clipboard.writeText(msg.message);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Custom Withdrawal Messages
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Create personalized messages for different types of vault withdrawals. Use template variables to customize content.
        </p>
      </div>

      {/* Available Variables Info */}
      <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">Available Template Variables:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {AVAILABLE_VARIABLES.map(v => (
            <div key={v.name} className="text-xs text-blue-800 dark:text-blue-200">
              <code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">{`{{${v.name}}}`}</code>
              <span className="ml-2">{v.label}</span>
              <span className="text-blue-600 dark:text-blue-400 ml-1">({v.example})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Message Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Message
        </button>
      )}

      {/* Add Message Form */}
      {showForm && (
        <div className="bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Message Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Emergency Withdrawal Alert"
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Withdrawal Type
            </label>
            <select
              value={formData.withdrawalType}
              onChange={(e) => setFormData({ ...formData, withdrawalType: e.target.value })}
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {WITHDRAWAL_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Message Template
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Type your message here. Use {{variable}} syntax for dynamic content. Example: {{amount}} from {{vaultName}}"
              rows={4}
              className="w-full px-4 py-2 bg-white dark:bg-surface-dark border border-surface-border dark:border-gray-700 rounded-lg text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddMessage}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors"
            >
              Save Message
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`bg-white dark:bg-surface-dark border rounded-lg p-4 transition-all cursor-pointer ${
              selectedMessage?.id === msg.id
                ? 'border-primary dark:border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-surface-border dark:border-gray-700 hover:border-primary/50'
            }`}
            onClick={() => {
              setSelectedMessage(msg);
              setPreview(generatePreview(msg));
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getWithdrawalTypeIcon(msg.withdrawalType)}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{msg.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {getWithdrawalTypeLabel(msg.withdrawalType)} • Created {msg.createdAt}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-mono line-clamp-2 bg-slate-50 dark:bg-slate-900/20 p-2 rounded">
                  {msg.message}
                </p>
                {msg.variables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {msg.variables.map(v => (
                      <span key={v} className="text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light px-2 py-1 rounded">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyMessage(msg.id);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title="Copy message"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActive(msg.id);
                  }}
                  className={`p-2 rounded transition-colors ${
                    msg.isActive
                      ? 'bg-success/10 text-success hover:bg-success/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={msg.isActive ? 'Active' : 'Inactive'}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMessage(msg.id);
                  }}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      {selectedMessage && preview && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-surface-border dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Preview</h3>
          <div className="bg-white dark:bg-surface-dark rounded-lg p-4 border border-surface-border dark:border-gray-700">
            <p className="text-slate-900 dark:text-white text-sm leading-relaxed">{preview}</p>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
            This is how the message will appear during a {getWithdrawalTypeLabel(selectedMessage.withdrawalType).toLowerCase()}.
          </p>
        </div>
      )}
    </div>
  );
}
