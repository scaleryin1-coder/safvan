import React from 'react';
import { 
  Zap, 
  Droplet, 
  Hammer, 
  Car, 
  Building2, 
  Paintbrush, 
  Cpu, 
  Sparkles, 
  Flame,
  LayoutGrid
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../data/mockData';
import { ServiceCategory } from '../types';
import { triggerHaptic } from '../utils/feedback';

interface CategoryFilterProps {
  selectedCategory: ServiceCategory | 'All';
  onSelectCategory: (cat: ServiceCategory | 'All') => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5 text-amber-500" />,
  Droplet: <Droplet className="w-5 h-5 text-sky-500" />,
  Hammer: <Hammer className="w-5 h-5 text-orange-500" />,
  Car: <Car className="w-5 h-5 text-emerald-500" />,
  Building2: <Building2 className="w-5 h-5 text-stone-700" />,
  Paintbrush: <Paintbrush className="w-5 h-5 text-purple-500" />,
  Cpu: <Cpu className="w-5 h-5 text-blue-500" />,
  Sparkles: <Sparkles className="w-5 h-5 text-teal-500" />,
  Flame: <Flame className="w-5 h-5 text-red-500" />
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-4 mb-2">
        <h2 className="text-xs font-black text-black uppercase tracking-wider">
          Job Categories
        </h2>
        {selectedCategory !== 'All' && (
          <button
            onClick={() => {
              triggerHaptic('light');
              onSelectCategory('All');
            }}
            className="text-xs font-extrabold text-red-600 hover:underline"
          >
            Show All
          </button>
        )}
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar scroll-smooth">
        {/* All Services Card */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onSelectCategory('All');
          }}
          className={`flex flex-col items-center justify-center min-w-[70px] p-2.5 rounded-2xl border transition-all active:scale-95 shrink-0 ${
            selectedCategory === 'All'
              ? 'bg-red-600 text-white border-red-600 shadow-sm'
              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-300'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition ${
              selectedCategory === 'All' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-black text-center leading-tight">All Jobs</span>
          <span
            className={`text-[9px] mt-0.5 ${
              selectedCategory === 'All' ? 'text-white/80' : 'text-stone-400'
            }`}
          >
            Verified
          </span>
        </button>

        {/* Individual Categories */}
        {SERVICE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('light');
                onSelectCategory(cat.id);
              }}
              className={`flex flex-col items-center justify-center min-w-[76px] p-2.5 rounded-2xl border transition-all active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-stone-800 border-stone-200 hover:border-stone-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition ${
                  isSelected ? 'bg-white/20' : 'bg-stone-50'
                }`}
              >
                {isSelected ? (
                  <span className="text-white brightness-200">{ICON_MAP[cat.iconName]}</span>
                ) : (
                  ICON_MAP[cat.iconName]
                )}
              </div>
              <span className="text-[11px] font-black text-center leading-tight line-clamp-1 max-w-[70px]">
                {cat.name}
              </span>
              <span
                className={`text-[9px] font-bold mt-0.5 ${
                  isSelected ? 'text-white/80' : 'text-stone-400'
                }`}
              >
                {cat.avgRate}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
