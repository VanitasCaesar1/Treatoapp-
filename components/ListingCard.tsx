'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ListingCardProps {
    doctor: {
        id: string;
        name: string;
        specialty: string;
        qualification: string;
        hospitalName: string;
        image?: string;
        rating?: number;
        price?: number;
        distance?: string;
        dates?: string;
        experience?: number;
    };
}

export default function ListingCard({ doctor }: ListingCardProps) {
    const [isFavorite, setIsFavorite] = React.useState(false);

    React.useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(doctor.id));
    }, [doctor.id]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();

        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        let newFavorites;

        if (favorites.includes(doctor.id)) {
            newFavorites = favorites.filter((id: string) => id !== doctor.id);
        } else {
            newFavorites = [...favorites, doctor.id];
        }

        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);
    };

    return (
        <Link href={`/doctor/${doctor.id}`} className="block group cursor-pointer">
            <div className="flex flex-col gap-3">
                {/* Image Container */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                    {doctor.image ? (
                        <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-300">
                            <Avatar className="h-24 w-24">
                                <AvatarFallback className="text-2xl">{doctor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    )}

                    {/* Favorite Button */}
                    <button
                        onClick={toggleFavorite}
                        className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                    >
                        <Heart
                            className={`w-6 h-6 transition-colors ${isFavorite
                                ? 'text-airbnb-red fill-airbnb-red stroke-airbnb-red'
                                : 'text-white fill-black/50 stroke-white'
                                }`}
                        />
                    </button>

                    {/* Guest Favorite Badge (Optional) */}
                    {doctor.rating && doctor.rating > 4.8 && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                            <span className="text-xs font-semibold text-black">Guest favorite</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 truncate pr-2">{doctor.name}</h3>
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-black text-black" />
                            <span className="text-sm font-light">{doctor.rating || 'New'}</span>
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm font-light truncate">
                        {doctor.specialty} · {doctor.experience ? `${doctor.experience} yrs exp` : doctor.qualification}
                    </p>
                    <p className="text-xs text-gray-400 truncate mb-1">{doctor.hospitalName}</p>

                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="font-semibold text-gray-900">₹{doctor.price || 500}</span>
                        <span className="text-gray-900 font-light">consultation</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
