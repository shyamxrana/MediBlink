'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { DOCTORS, MOCK_PRESCRIPTIONS } from '@/services/mockDataClient';
import { Doctor, Specialty, Appointment, User, Prescription } from '@/types';
import { DoctorCard } from '@/components/DoctorCard';
import { AIAssistant } from '@/components/AIAssistant';
import { BookingModal } from '@/components/BookingModal';
import { Button } from '@/components/Button';
import { authService } from '@/services/authService';
import { AuthModal } from '@/components/AuthModal';
import { 
  Stethoscope, 
  LayoutGrid, 
  Calendar, 
  Pill, 
  Search, 
  Menu, 
  X, 
  Video, 
  MessageSquare,
  MapPin,
  Shield,
  Clock,
  Activity,
  Users,
  Star,
  Check,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  LogOut,
  User as UserIcon
} from 'lucide-react';

// Simple Router State
type View = 'home' | 'doctors' | 'dashboard' | 'ai-triage';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingDoctorBooking, setPendingDoctorBooking] = useState<Doctor | null>(null);

  // Initialize Auth
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Appointments State - Persisted to LocalStorage
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load appointments from local storage on load
  useEffect(() => {
    const saved = localStorage.getItem('mediblink_appointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
  }, []);

  // Save appointments whenever they change
  useEffect(() => {
    localStorage.setItem('mediblink_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Filter Doctors
  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter((doc: Doctor) => {
      const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSpecialty && matchesSearch;
    });
  }, [selectedSpecialty, searchQuery]);

  // Filter appointments for current user
  const userAppointments = useMemo(() => {
    return appointments.filter(a => a.userId === user?.id);
  }, [appointments, user]);

  const onBookClick = (doctor: Doctor) => {
    if (!user) {
      setPendingDoctorBooking(doctor);
      setIsAuthModalOpen(true);
    } else {
      setSelectedDoctor(doctor);
    }
  };

  const handleBookConfirm = (date: string, time: string, type: 'video' | 'in-person') => {
    if (!selectedDoctor || !user) return;
    
    const newAppt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorSpecialty: selectedDoctor.specialty,
      date,
      time,
      status: 'upcoming',
      type
    };
    
    setAppointments(prev => [...prev, newAppt]);
    setSelectedDoctor(null);
    setCurrentView('dashboard');
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
    
    // If user was trying to book, continue booking flow
    if (pendingDoctorBooking) {
      setSelectedDoctor(pendingDoctorBooking);
      setPendingDoctorBooking(null);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('home');
  };

  const NavLink = ({ view, label, icon: Icon }: { view: View, label: string, icon: any }) => (
    <button 
      onClick={() => {
        if (view === 'dashboard' && !user) {
          setIsAuthModalOpen(true);
        } else {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-blue-50 text-[#037BBA] font-medium' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-[#037BBA]'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0C4A6E] flex flex-col font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
              <div className="bg-[#0284C7] p-2 rounded-lg mr-2">
                <Stethoscope className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-[#0284C7]">MediBlink</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLink view="home" label="Home" icon={LayoutGrid} />
              <NavLink view="doctors" label="Find Doctors" icon={Search} />
              <NavLink view="ai-triage" label="AI Assistant" icon={MessageSquare} />
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              
              {user ? (
                <>
                  <NavLink view="dashboard" label="Dashboard" icon={Calendar} />
                  <div className="flex items-center ml-4 pl-4 border-l border-slate-200 space-x-3">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-slate-700">{user.name}</span>
                      <span className="text-xs text-slate-500">Patient</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center border border-primary-200">
                      <UserIcon size={16} />
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="ml-4 pl-4 border-l border-slate-200">
                   <button onClick={() => setIsAuthModalOpen(true)} className="inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-[#037BBA] hover:bg-[#02639a] text-white px-4 py-2 shadow-sm">Login / Register</button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
            <NavLink view="home" label="Home" icon={LayoutGrid} />
            <NavLink view="doctors" label="Find Doctors" icon={Search} />
            <NavLink view="ai-triage" label="AI Assistant" icon={MessageSquare} />
            {user ? (
               <>
                 <NavLink view="dashboard" label="My Dashboard" icon={Calendar} />
                 <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50">
                    <LogOut size={18} />
                    <span>Logout ({user.name})</span>
                 </button>
               </>
            ) : (
              <Button className="w-full mt-4  bg-[#037BBA] hover:bg-[#02639a]" onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}>
                Login / Register
              </Button>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <div>
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white py-24 px-4 overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
              <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-10 md:mb-0">
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                    Book Medical Appointments in a <span className="text-[#BAE6FD] italic">Blink</span>.
                  </h1>
                  <p className="text-xl text-[#BAE6FD] mb-8 max-w-lg">
                    Connect with top-rated specialists instantly. Experience the future of healthcare with AI-powered triage and seamless booking.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="font-bold text-white hover:text-black border-2 hover:border-[#BAE6FD] bg-transparent hover:bg-[#02639a]" onClick={() => setCurrentView('doctors')}>
                      Find a Doctor
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 backdrop-blur-sm" onClick={() => setCurrentView('ai-triage')}>
                      <MessageSquare className="mr-2 w-5 h-5" /> Try AI Triage
                    </Button>
                  </div>
                  <div className="mt-8 flex items-center gap-4 text-sm text-primary-100">
                    <div className="flex -space-x-2">
                      <img className="w-8 h-8 rounded-full border-2 border-primary-900" src="https://picsum.photos/30/30?random=1" alt="User" />
                      <img className="w-8 h-8 rounded-full border-2 border-primary-900" src="https://picsum.photos/30/30?random=2" alt="User" />
                      <img className="w-8 h-8 rounded-full border-2 border-primary-900" src="https://picsum.photos/30/30?random=3" alt="User" />
                    </div>
                    <p>Trusted by 10,000+ patients</p>
                  </div>
                </div>
                <div className="md:w-1/2 flex justify-center">
                   <div className="relative w-full max-w-md aspect-square bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center p-8 border border-white/20 shadow-2xl animate-fade-in">
                      <img src="https://picsum.photos/seed/doctorhero/600/600" alt="Doctor" className="rounded-full shadow-lg object-cover w-full h-full border-4 border-white/50" />
                      
                      {/* Floating Badge */}
                      <div className="absolute -bottom-4 right-10 bg-white text-slate-900 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow z-20">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Video className="text-green-600 w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Telemedicine</p>
                          <p className="text-xs text-slate-500">Available 24/7</p>
                        </div>
                      </div>

                      {/* Floating Badge 2 */}
                      <div className="absolute top-10 -left-4 bg-white text-slate-900 p-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow z-20" style={{ animationDelay: '1s' }}>
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Check className="text-blue-600 w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">Verified Doctors</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="max-w-7xl mx-auto px-4 py-16 -mt-10 relative z-20">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: 'Find Specialists', desc: 'Browse profiles of top doctors across all specialties.', icon: Search, action: () => setCurrentView('doctors'), color: 'bg-blue-500' },
                  { title: 'AI Health Assistant', desc: 'Not sure what you need? Let our AI guide you.', icon: MessageSquare, action: () => setCurrentView('ai-triage'), color: 'bg-purple-500' },
                  { title: 'Manage Health', desc: 'Track appointments and prescriptions in one place.', icon: Calendar, action: () => {
                     if (user) setCurrentView('dashboard');
                     else setIsAuthModalOpen(true);
                  }, color: 'bg-teal-500' },
                ].map((item, idx) => (
                  <div key={idx} onClick={item.action} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-start">
                    <div className={`w-14 h-14 ${item.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 mb-4 flex-grow">{item.desc}</p>
                    <div className="text-[] font-semibold flex items-center text-sm group-hover:underline">
                      Get Started <ArrowRight size={16} className="ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white py-12 border-y border-slate-100">
               <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  {[
                    { label: 'Verified Doctors', value: '500+' },
                    { label: 'Happy Patients', value: '10k+' },
                    { label: 'Monthly Visits', value: '25k+' },
                    { label: 'Years of Service', value: '15' }
                  ].map((stat, idx) => (
                    <div key={idx}>
                      <p className="text-3xl md:text-4xl font-extrabold text-[#037BBA]">{stat.value}</p>
                      <p className="text-slate-500 font-medium mt-1">{stat.label}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Why Choose Us */}
            <div className="py-20 px-4 bg-slate-50">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Healthcare Reimagined</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    We're building a new kind of healthcare experience. One that is accessible, affordable, and centered around you.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { icon: Shield, title: 'Secure & Private', text: 'Your health data is protected with enterprise-grade encryption and HIPAA compliance.' },
                    { icon: Clock, title: '24/7 Availability', text: 'Access medical care whenever you need it, day or night, weekends and holidays.' },
                    { icon: Activity, title: 'Smart Triage', text: 'Our AI technology helps identify your needs instantly and routes you to the right care.' },
                    { icon: Users, title: 'Expert Team', text: 'Every doctor on our platform is board-certified and rigorously vetted for quality.' },
                  ].map((feature, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                        <feature.icon size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{feature.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="py-20 px-4 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="md:w-1/2">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                      alt="Doctor using tablet" 
                      className="rounded-2xl shadow-2xl"
                    />
                  </div>
                  <div className="md:w-1/2">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Simple Steps to Better Health</h2>
                    <div className="space-y-8">
                      {[
                        { step: '01', title: 'Search & Select', text: 'Find a specialist by name, specialty, or use our AI to get a recommendation.' },
                        { step: '02', title: 'Book Instantly', text: 'Choose a time that works for you. No phone calls, no waiting on hold.' },
                        { step: '03', title: 'Get Care', text: 'Consult via high-quality video or visit in-person. Get prescriptions digitally.' },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-700 font-bold text-xl rounded-full flex items-center justify-center">
                            {item.step}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h3>
                            <p className="text-slate-600">{item.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
                      <Button size="lg" onClick={() => setCurrentView('doctors')}>Start Booking Now</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="py-20 px-4 bg-primary-900 text-white">
               <div className="max-w-7xl mx-auto">
                 <h2 className="text-3xl font-bold text-center mb-12">What Our Patients Say</h2>
                 <div className="grid md:grid-cols-3 gap-8">
                   {[
                     { name: 'Sarah J.', role: 'Patient', quote: "MediBlink saved me a trip to the ER. The AI correctly identified my issue and I saw a specialist within an hour.", img: "https://randomuser.me/api/portraits/women/44.jpg" },
                     { name: 'Michael T.', role: 'Parent', quote: "Booking a pediatrician for my son was so easy. The video call quality was excellent and the doctor was amazing.", img: "https://randomuser.me/api/portraits/men/32.jpg" },
                     { name: 'Elena R.', role: 'Patient', quote: "I love having all my prescriptions and appointments in one dashboard. It makes managing my chronic condition much simpler.", img: "https://randomuser.me/api/portraits/women/68.jpg" },
                   ].map((review, i) => (
                     <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10">
                       <div className="flex gap-1 text-yellow-400 mb-4">
                         {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                       </div>
                       <p className="text-primary-50 mb-6 italic">"{review.quote}"</p>
                       <div className="flex items-center gap-3">
                         <img src={review.img} alt={review.name} className="w-10 h-10 rounded-full border border-white/30" />
                         <div>
                           <p className="font-bold text-sm">{review.name}</p>
                           <p className="text-xs text-primary-200">{review.role}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        )}

        {currentView === 'doctors' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Find Your Specialist</h2>
                <p className="text-slate-500 mt-1">Book an appointment with top rated doctors.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                   <input 
                    type="text" 
                    placeholder="Search doctors..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
                   />
                 </div>
                 <select 
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value as Specialty | 'All')}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                 >
                   <option value="All">All Specialties</option>
                   {Object.values(Specialty).map(s => (
                     <option key={s} value={s}>{s}</option>
                   ))}
                 </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDoctors.map((doctor: Doctor) => (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                  onBook={onBookClick} 
                />
              ))}
            </div>
            {filteredDoctors.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-500 text-lg">No doctors found matching your criteria.</p>
                <Button variant="ghost" onClick={() => {setSearchQuery(''); setSelectedSpecialty('All');}}>Clear Filters</Button>
              </div>
            )}
          </div>
        )}

        {currentView === 'ai-triage' && (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">AI Health Assistant</h2>
              <p className="text-slate-600">
                Describe your symptoms, and our AI will analyze your needs and recommend the best specialists for you.
              </p>
            </div>
            <AIAssistant onDoctorSelect={(id) => {
              const doc = DOCTORS.find((d: Doctor) => d.id === id);
              if (doc) {
                // Determine if we need to log in to see details/book? 
                // For now, let's just select them, and clicking book later will trigger auth
                setSelectedDoctor(doc);
              }
            }} />
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-bold text-slate-900">Welcome, {user?.name}</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Appointments */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <Calendar className="mr-2 text-primary-600" /> My Appointments
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {userAppointments.length === 0 ? (
                    <div className="text-center py-8">
                       <p className="text-slate-500 italic mb-4">No upcoming appointments.</p>
                       <Button variant="outline" size="sm" onClick={() => setCurrentView('doctors')}>Find a Doctor</Button>
                    </div>
                  ) : (
                    userAppointments.map(appt => (
                      <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-primary-200 transition-colors">
                        <div className="mb-4 sm:mb-0">
                          <p className="font-bold text-slate-900">{appt.doctorName}</p>
                          <p className="text-sm text-slate-500">{appt.doctorSpecialty}</p>
                          <div className="flex items-center mt-2 text-xs font-medium text-slate-600">
                            <span className="bg-white px-2 py-1 rounded border border-slate-200 mr-2">
                              {new Date(appt.date).toLocaleDateString()} at {appt.time}
                            </span>
                            <span className={`flex items-center ${appt.type === 'video' ? 'text-purple-600' : 'text-blue-600'}`}>
                              {appt.type === 'video' ? <Video size={14} className="mr-1"/> : <MapPin size={14} className="mr-1"/>}
                              {appt.type === 'video' ? 'Video Call' : 'In-Clinic'}
                            </span>
                          </div>
                        </div>
                        <div>
                          {appt.type === 'video' ? (
                            <Button size="sm">Join Call</Button>
                          ) : (
                            <Button size="sm" variant="secondary">Directions</Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Prescriptions */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <Pill className="mr-2 text-primary-600" /> Active Prescriptions
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* For demo purposes, we show mock prescriptions for everyone, but in real app would link to user ID */}
                  {MOCK_PRESCRIPTIONS.map((p: Prescription) => (
                    <div key={p.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">{p.medication}</p>
                        <p className="text-sm text-slate-600">{p.dosage}</p>
                        <p className="text-xs text-slate-400 mt-1">Prescribed by {p.doctorName}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-2">
                          Active
                        </span>
                        <br/>
                        <button className="text-xs text-primary-600 hover:underline">Refill</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-4">
                <div className="bg-primary-600 p-1.5 rounded mr-2">
                  <Stethoscope className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white">MediBlink</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Making healthcare accessible, affordable, and efficient for everyone.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-primary-400 transition-colors"><Facebook size={20} /></a>
                <a href="#" className="hover:text-primary-400 transition-colors"><Twitter size={20} /></a>
                <a href="#" className="hover:text-primary-400 transition-colors"><Instagram size={20} /></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">For Patients</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setCurrentView('doctors')} className="hover:text-white transition-colors">Find a Doctor</button></li>
                <li><button onClick={() => setCurrentView('ai-triage')} className="hover:text-white transition-colors">AI Health Assistant</button></li>
                <li><button onClick={() => { if(user) setCurrentView('dashboard'); else setIsAuthModalOpen(true); }} className="hover:text-white transition-colors">My Appointments</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Health Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Newsletter</h4>
              <p className="text-xs text-slate-400 mb-2">Subscribe to get the latest health tips.</p>
              <div className="flex">
                <input type="email" placeholder="Email address" className="bg-slate-800 border-none text-white text-sm rounded-l-md px-3 py-2 w-full focus:ring-1 focus:ring-primary-500" />
                <button className="bg-primary-600 text-white px-3 py-2 rounded-r-md hover:bg-primary-700 text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} MediBlink Healthcare Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* AI Floating Action Button & Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
        {isWidgetOpen && (
          <div className="w-[350px] md:w-[400px] animate-fade-in-up origin-bottom-right shadow-2xl rounded-2xl">
             <AIAssistant 
                className="h-[500px]" 
                onDoctorSelect={(id) => {
                  const doc = DOCTORS.find((d: Doctor) => d.id === id);
                  if (doc) {
                    // Logic to handle selection from chat:
                    if (!user) {
                      setPendingDoctorBooking(doc);
                      // Close widget so modal isn't covered? Optional.
                      setIsAuthModalOpen(true);
                    } else {
                      setSelectedDoctor(doc);
                    }
                  }
                }} 
             />
          </div>
        )}
        <button
          onClick={() => setIsWidgetOpen(!isWidgetOpen)}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center relative ${isWidgetOpen ? 'bg-slate-800 rotate-90' : 'bg-primary-600 hover:bg-primary-700'}`}
        >
          {isWidgetOpen ? (
             <X className="text-white w-6 h-6" />
          ) : (
             <>
               <MessageSquare className="text-white w-6 h-6" />
               <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
             </>
          )}
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Booking Modals */}
      {selectedDoctor && (
        <BookingModal 
          doctor={selectedDoctor} 
          onClose={() => setSelectedDoctor(null)}
          onConfirm={handleBookConfirm}
        />
      )}
    </div>
  );
}