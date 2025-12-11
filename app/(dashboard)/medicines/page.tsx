'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Pill, ChevronRight, Loader2, AlertCircle, Thermometer, HeartPulse, Brain, Bone, Eye, Baby, ShieldAlert, X, Plus, Check, AlertTriangle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { SkeletonCard } from '@/components/ui/skeleton';
import { showToast } from '@/lib/utils/toast';

interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  strength?: string;
  form?: string;
  manufacturer?: string;
  category?: string;
  description?: string;
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'severe' | 'moderate' | 'mild';
  description: string;
  management: string;
}

interface InteractionResult {
  interactions: DrugInteraction[];
  has_severe: boolean;
  has_moderate: boolean;
  message: string;
}

// Common ailment categories with icons
const AILMENT_CATEGORIES = [
  { name: 'Fever & Pain', icon: Thermometer, color: 'text-red-600', bg: 'bg-red-50' },
  { name: 'Heart & BP', icon: HeartPulse, color: 'text-pink-600', bg: 'bg-pink-50' },
  { name: 'Mental Health', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Bone & Joint', icon: Bone, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Eye Care', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Child Care', icon: Baby, color: 'text-green-600', bg: 'bg-green-50' },
];

// Common medicines for quick access (fallback if API fails)
const COMMON_MEDICINES: Medicine[] = [
  { id: '1', name: 'Paracetamol', generic_name: 'Acetaminophen', strength: '500mg', form: 'Tablet', category: 'Pain Relief' },
  { id: '2', name: 'Ibuprofen', generic_name: 'Ibuprofen', strength: '400mg', form: 'Tablet', category: 'Anti-inflammatory' },
  { id: '3', name: 'Cetirizine', generic_name: 'Cetirizine HCl', strength: '10mg', form: 'Tablet', category: 'Antihistamine' },
  { id: '4', name: 'Omeprazole', generic_name: 'Omeprazole', strength: '20mg', form: 'Capsule', category: 'Antacid' },
  { id: '5', name: 'Metformin', generic_name: 'Metformin HCl', strength: '500mg', form: 'Tablet', category: 'Diabetes' },
  { id: '6', name: 'Amlodipine', generic_name: 'Amlodipine Besylate', strength: '5mg', form: 'Tablet', category: 'Blood Pressure' },
  { id: '7', name: 'Azithromycin', generic_name: 'Azithromycin', strength: '500mg', form: 'Tablet', category: 'Antibiotic' },
  { id: '8', name: 'Pantoprazole', generic_name: 'Pantoprazole', strength: '40mg', form: 'Tablet', category: 'Antacid' },
  { id: '9', name: 'Montelukast', generic_name: 'Montelukast Sodium', strength: '10mg', form: 'Tablet', category: 'Respiratory' },
  { id: '10', name: 'Vitamin D3', generic_name: 'Cholecalciferol', strength: '60000 IU', form: 'Capsule', category: 'Supplement' },
];

export default function MedicinesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>(COMMON_MEDICINES);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Drug Interaction Checker State
  const [showInteractionChecker, setShowInteractionChecker] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [interactionResult, setInteractionResult] = useState<InteractionResult | null>(null);
  const [checkingInteractions, setCheckingInteractions] = useState(false);

  // Fetch common medicines on mount
  useEffect(() => {
    const fetchCommonMedicines = async () => {
      try {
        const data = await api.get('/medicines/search', { limit: 20 });
        if (data.medicines && data.medicines.length > 0) {
          setMedicines(data.medicines);
        }
      } catch (error) {
        console.error('Failed to fetch medicines:', error);
        // Keep fallback data
      } finally {
        setInitialLoading(false);
      }
    };
    fetchCommonMedicines();
  }, []);

  // Search medicines
  const searchMedicines = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      // Reset to common medicines
      setMedicines(COMMON_MEDICINES);
      return;
    }

    setLoading(true);
    try {
      const data = await api.get('/medicines/search', { q: query, limit: 20 });
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMedicines(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchMedicines]);

  // Add medicine to interaction checker
  const addToInteractionChecker = (medicineName: string) => {
    if (selectedMedicines.includes(medicineName)) {
      showToast.info('Medicine already added', 'med-exists');
      return;
    }
    if (selectedMedicines.length >= 10) {
      showToast.error('Maximum 10 medicines allowed', 'max-meds');
      return;
    }
    setSelectedMedicines([...selectedMedicines, medicineName]);
    setInteractionResult(null); // Clear previous results
    showToast.success(`Added ${medicineName}`, 'med-added');
  };

  const removeFromInteractionChecker = (medicineName: string) => {
    setSelectedMedicines(selectedMedicines.filter(m => m !== medicineName));
    setInteractionResult(null);
  };

  // Check drug interactions
  const checkInteractions = async () => {
    if (selectedMedicines.length < 2) {
      showToast.error('Add at least 2 medicines to check interactions', 'min-meds');
      return;
    }

    setCheckingInteractions(true);
    try {
      const response = await fetch('/api/medicines/check-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ medicines: selectedMedicines }),
      });

      if (response.ok) {
        const data = await response.json();
        setInteractionResult(data);
        if (data.has_severe) {
          showToast.error('Severe interactions found!', 'severe-interaction');
        } else if (data.has_moderate) {
          showToast.info('Moderate interactions found', 'moderate-interaction');
        } else if (data.interactions.length === 0) {
          showToast.success('No known interactions found', 'no-interactions');
        }
      } else {
        throw new Error('Failed to check interactions');
      }
    } catch (error) {
      console.error('Failed to check interactions:', error);
      showToast.error('Failed to check interactions', 'check-error');
    } finally {
      setCheckingInteractions(false);
    }
  };

  // Filter by category
  const filteredMedicines = selectedCategory
    ? medicines.filter(m => m.category?.toLowerCase().includes(selectedCategory.toLowerCase()))
    : medicines;

  return (
    <div className="min-h-screen pb-24">
      <div className="p-4 space-y-5">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Pill className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Medicines</h1>
            <p className="text-xs text-gray-500">Search medicines & health products</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicines by name..."
            className="pl-10 h-12 bg-white border-gray-200 rounded-2xl"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              !selectedCategory
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All
          </button>
          {AILMENT_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                selectedCategory === cat.name
                  ? "bg-emerald-600 text-white"
                  : `${cat.bg} ${cat.color} hover:opacity-80`
              )}
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Drug Interaction Checker Toggle */}
        <div 
          onClick={() => setShowInteractionChecker(!showInteractionChecker)}
          className={cn(
            "rounded-2xl p-4 cursor-pointer transition-all border",
            showInteractionChecker 
              ? "bg-amber-50 border-amber-200" 
              : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100 hover:border-amber-200"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Drug Interaction Checker</h3>
                <p className="text-xs text-gray-500">Check if your medicines interact</p>
              </div>
            </div>
            <ChevronRight className={cn(
              "h-5 w-5 text-gray-400 transition-transform",
              showInteractionChecker && "rotate-90"
            )} />
          </div>
        </div>

        {/* Drug Interaction Checker Panel */}
        {showInteractionChecker && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Selected Medicines</h4>
              <span className="text-xs text-gray-500">{selectedMedicines.length}/10</span>
            </div>

            {/* Selected Medicines Pills */}
            {selectedMedicines.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedMedicines.map((med) => (
                  <div 
                    key={med}
                    className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    <Pill className="h-3.5 w-3.5" />
                    {med}
                    <button 
                      onClick={() => removeFromInteractionChecker(med)}
                      className="ml-1 hover:bg-amber-200 rounded-full p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Tap on medicines below to add them for interaction check
              </p>
            )}

            {/* Check Button */}
            <Button
              onClick={checkInteractions}
              disabled={selectedMedicines.length < 2 || checkingInteractions}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-11"
            >
              {checkingInteractions ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Check Interactions
                </>
              )}
            </Button>

            {/* Interaction Results */}
            {interactionResult && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900">Results</h4>
                
                {interactionResult.interactions.length === 0 ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">No Known Interactions</p>
                      <p className="text-xs text-green-600">These medicines appear safe to take together</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {interactionResult.interactions.map((interaction, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "rounded-xl p-4 border",
                          interaction.severity === 'severe' && "bg-red-50 border-red-200",
                          interaction.severity === 'moderate' && "bg-amber-50 border-amber-200",
                          interaction.severity === 'mild' && "bg-yellow-50 border-yellow-200"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            interaction.severity === 'severe' && "bg-red-100",
                            interaction.severity === 'moderate' && "bg-amber-100",
                            interaction.severity === 'mild' && "bg-yellow-100"
                          )}>
                            <AlertTriangle className={cn(
                              "h-4 w-4",
                              interaction.severity === 'severe' && "text-red-600",
                              interaction.severity === 'moderate' && "text-amber-600",
                              interaction.severity === 'mild' && "text-yellow-600"
                            )} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                "text-xs font-bold uppercase px-2 py-0.5 rounded",
                                interaction.severity === 'severe' && "bg-red-200 text-red-800",
                                interaction.severity === 'moderate' && "bg-amber-200 text-amber-800",
                                interaction.severity === 'mild' && "bg-yellow-200 text-yellow-800"
                              )}>
                                {interaction.severity}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900 text-sm">
                              {interaction.drug1} + {interaction.drug2}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{interaction.description}</p>
                            <p className="text-xs text-gray-500 mt-2 italic">
                              💡 {interaction.management}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Always consult a doctor before taking any medication. This is for informational purposes only.
          </p>
        </div>

        {/* Medicines List */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3 px-1">
            {searchQuery ? `Results for "${searchQuery}"` : 'Common Medicines'}
          </h2>

          {initialLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : filteredMedicines.length > 0 ? (
            <div className="space-y-3">
              {filteredMedicines.map((med) => (
                <div
                  key={med.id}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Pill className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{med.name}</h3>
                      {med.generic_name && (
                        <p className="text-xs text-gray-500">{med.generic_name}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {med.form && (
                          <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {med.form}
                          </span>
                        )}
                        {med.strength && (
                          <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {med.strength}
                          </span>
                        )}
                        {med.category && (
                          <span className="text-xs font-medium bg-emerald-50 px-2 py-0.5 rounded text-emerald-600">
                            {med.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {showInteractionChecker && (
                      <button
                        onClick={() => addToInteractionChecker(med.name)}
                        className={cn(
                          "p-2 rounded-xl transition-colors",
                          selectedMedicines.includes(med.name)
                            ? "bg-amber-100 text-amber-600"
                            : "bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                        )}
                      >
                        {selectedMedicines.includes(med.name) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">No medicines found</h3>
              <p className="text-sm text-gray-500">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
