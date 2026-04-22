import React from "react";
import { Doctor } from "../types";
import { Star, Clock, Award } from "lucide-react";
import { Button } from "./Button";

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-slate-700 flex items-center shadow-sm">
          <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
          {doctor.rating}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4">
          <span className="text-xs font-bold tracking-wider text-primary-600 uppercase bg-primary-50 px-2 py-1 rounded-md">
            {doctor.specialty}
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-2">
            {doctor.name}
          </h3>
          <div className="flex items-center text-slate-500 text-sm mt-1">
            <Award className="w-4 h-4 mr-1" />
            <span>{doctor.experience} years exp.</span>
          </div>
        </div>

        <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-grow">
          {doctor.bio}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400 text-sm">Consultation</span>
            <span className="text-lg font-bold text-slate-900">
              ${doctor.price}
            </span>
          </div>
          <Button onClick={() => onBook(doctor)} className="w-full">
            Book Appointment 
          </Button>
        </div>
      </div>
    </div>
  );
};
