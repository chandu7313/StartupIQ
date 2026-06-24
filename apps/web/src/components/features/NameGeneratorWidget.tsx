'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, Heart, RefreshCw } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { toast } from 'sonner';

interface GeneratedName {
  name: string;
  tagline: string;
  domain_com: string;
  domain_in: string;
  rationale: string;
  com_status?: 'checking' | 'available' | 'taken';
  in_status?: 'checking' | 'available' | 'taken';
}

interface Props {
  idea: string;
  industry: string;
  geography: string;
}

export function NameGeneratorWidget({ idea, industry, geography }: Props) {
  const [names, setNames] = useState<GeneratedName[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedNames, setSavedNames] = useState<string[]>([]);

  // Load saved names from local storage
  React.useEffect(() => {
    const saved = localStorage.getItem('ventureforge_saved_names');
    if (saved) {
      try {
        setSavedNames(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleSave = (name: string) => {
    setSavedNames(prev => {
      const newSaved = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
      localStorage.setItem('ventureforge_saved_names', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const checkDomain = async (domain: string, index: number, tld: 'com' | 'in') => {
    try {
      const res = await apiClient(`/api/v1/tools/domain-check?domain=${domain}`);
      const isAvailable = res.data.available;
      
      setNames(prev => {
        const copy = [...prev];
        if (tld === 'com') {
          copy[index].com_status = isAvailable ? 'available' : 'taken';
        } else {
          copy[index].in_status = isAvailable ? 'available' : 'taken';
        }
        return copy;
      });
    } catch (err) {
      setNames(prev => {
        const copy = [...prev];
        if (tld === 'com') {
          copy[index].com_status = 'taken';
        } else {
          copy[index].in_status = 'taken';
        }
        return copy;
      });
    }
  };

  const generateNames = async () => {
    setLoading(true);
    setNames([]);
    try {
      const response = await apiClient('/api/v1/tools/name-generator', {
        method: 'POST',
        data: { idea, industry, geo: geography },
      });
      
      const generatedNames: GeneratedName[] = response.data.map((n: any) => ({
        ...n,
        com_status: 'checking',
        in_status: 'checking'
      }));
      
      setNames(generatedNames);

      // Async check domains so UI doesn't block
      generatedNames.forEach((n, idx) => {
        checkDomain(n.domain_com, idx, 'com');
        checkDomain(n.domain_in, idx, 'in');
      });

    } catch (err: any) {
      toast.error(err.message || 'Failed to generate names. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDomainBadge = (domain: string, status?: 'checking' | 'available' | 'taken') => {
    const isAvailable = status === 'available';
    const isChecking = status === 'checking';
    const isTaken = status === 'taken';

    return (
      <a
        href={isAvailable ? `https://www.namecheap.com/domains/registration/results/?domain=${domain}` : '#'}
        target={isAvailable ? '_blank' : '_self'}
        rel="noopener noreferrer"
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border transition-colors ${
          isChecking ? 'bg-gray-800 text-gray-400 border-gray-700' :
          isAvailable ? 'bg-green-900/30 text-green-400 border-green-800/50 hover:bg-green-900/50 cursor-pointer' :
          'bg-red-900/20 text-red-400/50 border-red-900/30 cursor-not-allowed line-through'
        }`}
      >
        <Globe size={12} className="mr-1" />
        {domain}
      </a>
    );
  };

  return (
    <div className="bg-surface-container-low rounded-xl border border-surface-container p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold font-headline flex items-center text-on-surface">
            <Sparkles className="mr-2 text-primary" size={20} />
            AI Startup Naming Engine
          </h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Discover highly brandable, locally relevant names with instant domain checks.
          </p>
        </div>
        <button
          onClick={generateNames}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="mr-2 animate-spin" size={18} />
          ) : names.length > 0 ? (
            <RefreshCw className="mr-2" size={18} />
          ) : null}
          {loading ? 'Generating...' : names.length > 0 ? 'Regenerate' : 'Generate Names'}
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-container-high rounded-xl animate-pulse"></div>
          ))}
        </div>
      )}

      {!loading && names.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {names.map((n, idx) => {
            const isSaved = savedNames.includes(n.name);
            return (
              <div key={idx} className="bg-surface-container rounded-xl p-5 border border-surface-container-high hover:border-primary/50 transition-colors relative group">
                <button 
                  onClick={() => toggleSave(n.name)}
                  className="absolute top-4 right-4 text-on-surface-variant hover:text-red-400 transition-colors"
                >
                  <Heart size={18} className={isSaved ? 'fill-red-500 text-red-500' : ''} />
                </button>
                <h4 className="text-xl font-extrabold font-headline text-on-surface mb-1 pr-8 tracking-tight">{n.name}</h4>
                <p className="text-sm font-medium text-on-surface-variant mb-3">{n.tagline}</p>
                <p className="text-xs text-on-surface-variant/80 mb-4 line-clamp-2" title={n.rationale}>{n.rationale}</p>
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {renderDomainBadge(n.domain_com, n.com_status)}
                  {renderDomainBadge(n.domain_in, n.in_status)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
