import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Image as ImageIcon, Award, Users, CheckCircle, Flag } from 'lucide-react';
import heroImage from '../assets/anandamoyee about us  img 02.png';
import video1 from '../assets/WhatsApp Video 2026-02-24 at 5.11.36 PM.mp4';
import video2 from '../assets/WhatsApp Video 2026-02-24 at 5.15.19 PM.mp4';
import galleryNew1 from '../assets/WhatsApp Image 2026-02-25 at 12.19.13 PM (1).jpeg';
import galleryNew2 from '../assets/WhatsApp Image 2026-02-25 at 12.19.13 PM.jpeg';
import galleryNew3 from '../assets/WhatsApp Image 2026-02-25 at 12.19.14 PM.jpeg';
import galleryNew4 from '../assets/WhatsApp Image 2026-02-25 at 12.23.59 PM.jpeg';

const AboutUs = () => {
    const galleryImages = [
        { url: galleryNew1, title: 'Rice Processing Unit' },
        { url: galleryNew2, title: 'Advanced Machinery' },
        { url: galleryNew3, title: 'Quality Inspection' },
        { url: galleryNew4, title: 'Industrial Installation' },
        { url: 'https://www.ricemillingmachinery.com/wp-content/uploads/2022/12/300t_rice_mill_equipments_cost.webp', title: '300T Rice Mill Installation' },
    ];

    return (
        <div className="bg-white">
            {/* Hero Section - Single Full Image */}
            <section className="w-full overflow-hidden">
                <img
                    src={heroImage}
                    alt="About Us Hero"
                    className="w-full h-auto block"
                />
            </section>

            {/* Video Gallery Section - Primary Focus */}
            <section className="py-20 md:py-32 bg-[#fff9c4] text-gray-900 relative overflow-hidden">
                {/* Decorative background glows */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full filter blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[100px] pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-brand-blue/[0.02] to-transparent pointer-events-none"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
                        <div className="flex items-center justify-center gap-3 text-brand-blue mb-4">
                            <Play size={24} fill="currentColor" />
                            <span className="font-black tracking-[0.2em] uppercase text-sm md:text-base">Experience Our Work</span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black uppercase mb-6 text-gray-900">
                            See Us <span className="text-brand-blue italic">In Action</span>
                        </h2>
                        <div className="w-32 h-2 bg-primary mx-auto rounded-full shadow-lg"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-14 max-w-6xl mx-auto">
                        {/* Video 1 */}
                        <div className="group relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white border border-gray-100 hover:border-brand-blue/40 transition-all duration-700 transform hover:-translate-y-4">
                            <div className="aspect-video relative overflow-hidden">
                                <video
                                    src={video1}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 group-hover:opacity-40 transition-opacity duration-700"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                    <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-2 opacity-80">Our Pride</p>
                                    <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider group-hover:text-primary transition-colors duration-300">World Class Manufacturing</h3>
                                </div>
                            </div>
                        </div>

                        {/* Video 2 */}
                        <div className="group relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white border border-gray-100 hover:border-brand-blue/40 transition-all duration-700 transform hover:-translate-y-4">
                            <div className="aspect-video relative overflow-hidden">
                                <video
                                    src={video2}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 group-hover:opacity-40 transition-opacity duration-700"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                    <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-2 opacity-80">Success Stories</p>
                                    <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider group-hover:text-primary transition-colors duration-300">Transforming Farmer Lives</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section - Premium Masonry-style Grid */}
            <section className="py-20 md:py-32 relative">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 md:mb-24">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 text-brand-blue mb-4">
                                <ImageIcon size={28} />
                                <span className="font-black tracking-[0.2em] uppercase text-sm md:text-base">Visual Journey</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 uppercase">Our <span className="text-brand-blue italic">Presence</span></h2>
                        </div>
                        <div className="hidden lg:flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-3xl font-black text-gray-900 leading-none">1M+</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Global Community</p>
                            </div>
                            <div className="w-px h-12 bg-gray-200"></div>
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-xl ring-2 ring-gray-50">
                                        <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="Profile" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {galleryImages.map((img, index) => (
                            <div
                                key={index}
                                className={`group relative overflow-hidden rounded-[2.5rem] bg-gray-100 shadow-xl transition-all duration-700 hover:shadow-2xl ${index % 3 === 0 ? 'lg:row-span-2 aspect-[3/4]' : 'aspect-square sm:aspect-video'}`}
                            >
                                <img
                                    src={img.url}
                                    alt={img.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                {/* Glassmorphism Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 md:p-10 pointer-events-none">
                                    <div className="translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                                        <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-3 flex items-center gap-2">
                                            <div className="w-6 h-[2px] bg-primary"></div>
                                            Anandamoyee India
                                        </p>
                                        <h4 className="text-white font-black text-xl md:text-2xl uppercase tracking-tight">{img.title}</h4>
                                    </div>
                                </div>
                                {/* Magnify icon reveal */}
                                <div className="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                                    <ImageIcon className="text-white" size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative background shapes */}
                <div className="absolute top-1/2 left-0 w-64 h-64 bg-brand-blue/5 rounded-full filter blur-[80px] -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full filter blur-[100px] translate-x-1/3"></div>
            </section>

            {/* Final CTA Slogan */}
            <section className="bg-brand-blue py-16 border-t-8 border-primary">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex flex-col items-center gap-6">
                        <Users className="text-primary w-16 h-16" />
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
                            Trusted by <span className="text-primary">1M+</span> Farmers
                        </h2>
                        <Link to="/" className="bg-primary hover:bg-yellow-400 text-black px-16 py-5 rounded-full font-black text-xl md:text-2xl transition-all transform hover:scale-110 shadow-2xl uppercase tracking-tighter text-center">
                            Check All Products
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
