import React, { useState } from 'react';
import { Doctor } from '../types';
import { X, Calendar, Clock, Video, MapPin, CheckCircle } from 'lucide-react';
import { Button } from './Button';

interface BookingModalProps {
  doctor: Doctor;
  onClose: () => void;
  onConfirm: (date: string, time: string, type: 'video' | 'in-person') => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ doctor, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [apptType, setApptType] = useState<'video' | 'in-person'>('video');
  const [step, setStep] = useState(1);

  // Generate next 3 days
  const dates = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      value: d.toISOString().split('T')[0]
    };
  });

  const handleConfirm = () => {
    onConfirm(selectedDate, selectedTime, apptType);
    setStep(2);
    // Auto close after success
    setTimeout(onClose, 2000);
  };

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Booked!</h2>
          <p className="text-slate-600">Your appointment with {doctor.name} is confirmed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-semibold text-slate-800">Book Appointment</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-center space-x-4 mb-6">
             <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary-100" />
             <div>
               <h3 className="font-bold text-slate-900">{doctor.name}</h3>
               <p className="text-primary-600 text-sm">{doctor.specialty}</p>
             </div>
          </div>

          <div className="space-y-6">
            {/* Visit Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Consultation Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setApptType('video')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${apptType === 'video' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                >
                  <Video className="mb-1 w-5 h-5" />
                  <span className="text-sm font-medium">Video Call</span>
                </button>
                <button 
                  onClick={() => setApptType('in-person')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${apptType === 'in-person' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                >
                  <MapPin className="mb-1 w-5 h-5" />
                  <span className="text-sm font-medium">In-Clinic</span>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> Select Date
              </label>
              <div className="grid grid-cols-3 gap-2">
                {dates.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => setSelectedDate(date.value)}
                    className={`px-2 py-2 text-xs font-medium rounded-lg border transition-colors ${
                      selectedDate === date.value
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {date.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className={!selectedDate ? 'opacity-50 pointer-events-none' : ''}>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" /> Available Slots
              </label>
              <div className="grid grid-cols-3 gap-2">
                {doctor.availability.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-2 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      selectedTime === time
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex justify-between items-center mb-4 text-sm">
            <span className="text-slate-600">Total</span>
            <span className="font-bold text-lg">${doctor.price}</span>
          </div>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedDate || !selectedTime}
            className="w-full"
            size="lg"
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
};