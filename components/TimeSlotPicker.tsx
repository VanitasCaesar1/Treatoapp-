import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCapacitor } from '@/lib/capacitor';

interface TimeSlotPickerProps {
    slots: string[];
    selectedSlot: string | null;
    onSelectSlot: (slot: string) => void;
    loading?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
    slots,
    selectedSlot,
    onSelectSlot,
    loading = false
}) => {
    const capacitor = useCapacitor();

    const handleSlotClick = (slot: string) => {
        capacitor.lightHaptic();
        onSelectSlot(slot);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-3 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-11 bg-gray-100 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No slots available for this date
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-3">
            {slots.map((slot) => (
                <Button
                    key={slot}
                    variant="outline"
                    className={`
                        rounded-full border-gray-200 touch-target
                        ${selectedSlot === slot
                            ? 'bg-medical-blue hover:bg-medical-blue-dark text-white border-medical-blue shadow-md scale-105'
                            : 'hover:border-gray-900 hover:bg-gray-50 text-gray-700'
                        }
                        transition-all duration-200 font-medium
                        active:scale-95 tap-highlight-none
                    `}
                    onClick={() => handleSlotClick(slot)}
                >
                    {slot.slice(0, 5)}
                </Button>
            ))}
        </div>
    );
};

export default TimeSlotPicker;
