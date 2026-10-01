import React from 'react';
import { 
  Zap, 
  Wind, 
  Droplet, 
  Hammer, 
  Paintbrush, 
  Building2, 
  Flame, 
  Boxes, 
  Trees, 
  Bug, 
  Bike, 
  Car, 
  Truck, 
  ShieldAlert, 
  Cpu, 
  Shirt, 
  HeartHandshake, 
  Scissors, 
  Sparkles, 
  Trash2,
  LayoutGrid,
  Check
} from 'lucide-react';
import { SERVICE_CATEGORIES, getSubCategories } from '../data/categories';
import { ServiceCategory } from '../types';
import { triggerHaptic } from '../utils/feedback';

interface CategoryFilterProps {
  selectedCategory: ServiceCategory | 'All';
  selectedSubCategory?: string | 'All';
  onSelectCategory: (cat: ServiceCategory | 'All') => void;
  onSelectSubCategory?: (subCat: string | 'All') => void;
}

// Icon mapping covering all 20 categories with distinct colors
const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5 text-amber-500" />,
  Wind: <Wind className="w-5 h-5 text-cyan-500" />,
  Droplet: <Droplet className="w-5 h-5 text-sky-500" />,
  Hammer: <Hammer className="w-5 h-5 text-orange-500" />,
  Paintbrush: <Paintbrush className="w-5 h-5 text-purple-500" />,
  Building2: <Building2 className="w-5 h-5 text-stone-700" />,
  Flame: <Flame className="w-5 h-5 text-red-500" />,
  Boxes: <Boxes className="w-5 h-5 text-indigo-500" />,
  Trees: <Trees className="w-5 h-5 text-emerald-600" />,
  Bug: <Bug className="w-5 h-5 text-lime-600" />,
  Bike: <Bike className="w-5 h-5 text-teal-600" />,
  Car: <Car className="w-5 h-5 text-blue-600" />,
  Truck: <Truck className="w-5 h-5 text-amber-600" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-rose-600" />,
  Cpu: <Cpu className="w-5 h-5 text-violet-600" />,
  Shirt: <Shirt className="w-5 h-5 text-pink-500" />,
  HeartHandshake: <HeartHandshake className="w-5 h-5 text-rose-500" />,
  Scissors: <Scissors className="w-5 h-5 text-fuchsia-600" />,
  Sparkles: <Sparkles className="w-5 h-5 text-yellow-500" />,
  Trash2: <Trash2 className="w-5 h-5 text-emerald-700" />
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  selectedSubCategory = 'All',
  onSelectCategory,
  onSelectSubCategory,
}) => {
  const currentSubCategories = selectedCategory !== 'All' ? getSubCategories(selectedCategory) : [];

  return (
    <div className="py-2 space-y-2">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-1.5">
          <h2 className="text-xs font-black text-black uppercase tracking-wider">
            Job Categories
          </h2>
          <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
            20 Services
          </span>
        </div>
        {selectedCategory !== 'All' && (
          <button
            onClick={() => {
              triggerHaptic('light');
              onSelectCategory('All');
              if (onSelectSubCategory) onSelectSubCategory('All');
            }}
            className="text-xs font-extrabold text-red-600 hover:underline"
          >
            Show All Services
          </button>
        )}
      </div>

      {/* Horizontal Carousel of Main Categories */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar scroll-smooth">
        {/* All Services Card */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onSelectCategory('All');
            if (onSelectSubCategory) onSelectSubCategory('All');
          }}
          className={`flex flex-col items-center justify-center min-w-[72px] p-2.5 rounded-2xl border transition-all active:scale-95 shrink-0 ${
            selectedCategory === 'All'
              ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-600/20'
              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-300 shadow-xs'
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
            className={`text-[9px] mt-0.5 font-bold ${
              selectedCategory === 'All' ? 'text-white/80' : 'text-stone-400'
            }`}
          >
            All Areas
          </span>
        </button>

        {/* Individual 20 Categories */}
        {SERVICE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('light');
                onSelectCategory(cat.id);
                if (onSelectSubCategory) onSelectSubCategory('All');
              }}
              className={`flex flex-col items-center justify-center min-w-[78px] max-w-[90px] p-2 rounded-2xl border transition-all active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-600/20'
                  : 'bg-white text-stone-800 border-stone-200 hover:border-stone-300 shadow-xs'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition ${
                  isSelected ? 'bg-white/20' : 'bg-stone-50'
                }`}
              >
                {isSelected ? (
                  <span className="text-white brightness-200">{ICON_MAP[cat.iconName] || <Zap className="w-5 h-5" />}</span>
                ) : (
                  ICON_MAP[cat.iconName] || <Zap className="w-5 h-5 text-stone-600" />
                )}
              </div>
              <span className="text-[11px] font-black text-center leading-tight truncate w-full px-0.5">
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

      {/* Sub-Category Selector Row (Requirement: Clicking main category allows selecting sub-category) */}
      {selectedCategory !== 'All' && currentSubCategories.length > 0 && (
        <div className="px-4 pt-1 animate-in fade-in duration-200">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-2.5 shadow-xs">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-black text-stone-600 uppercase tracking-wider">
                Select {selectedCategory} Sub-Category:
              </span>
              {selectedSubCategory !== 'All' && (
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    if (onSelectSubCategory) onSelectSubCategory('All');
                  }}
                  className="text-[10px] font-bold text-red-600 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {/* All Subcategories Pill */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  if (onSelectSubCategory) onSelectSubCategory('All');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1 ${
                  selectedSubCategory === 'All'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300'
                }`}
              >
                {selectedSubCategory === 'All' && <Check className="w-3 h-3 text-red-400" />}
                <span>All {selectedCategory}</span>
              </button>

              {/* Specific Subcategory Pills */}
              {currentSubCategories.map((sub) => {
                const isSubSelected = selectedSubCategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => {
                      triggerHaptic('light');
                      if (onSelectSubCategory) onSelectSubCategory(sub);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 ${
                      isSubSelected
                        ? 'bg-red-600 text-white shadow-xs font-black'
                        : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    {isSubSelected && <Check className="w-3 h-3 text-white" />}
                    <span>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
