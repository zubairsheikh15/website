import { Phone, Mail, MessageCircle, Heart } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-12 py-8 px-4 border-t border-white/20">
            <div className="container max-w-screen-2xl mx-auto">
                <div className="glass-panel px-6 py-6 flex flex-col items-center gap-4">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-2 group">
                        <img 
                            src="/logo.png" 
                            alt="Zee Crown" 
                            width={56} 
                            height={56} 
                            className="object-contain transform group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="font-bold text-lg text-dark-gray dark:text-white group-hover:text-primary transition-colors duration-300">
                            Zee Crown
                        </span>
                    </div>

                    {/* Contact Links */}
                    <div className="flex items-center justify-center gap-6 text-gray-600 text-sm flex-wrap">
                        <a 
                            href="tel:+919999050773" 
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                        >
                            <Phone size={18} className="group-hover:rotate-12 transition-transform duration-300" /> 
                            <span className="font-medium">Call</span>
                        </a>
                        <a 
                            href="mailto:zubairsheikh15@gmail.com" 
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                        >
                            <Mail size={18} className="group-hover:rotate-12 transition-transform duration-300" /> 
                            <span className="font-medium">Mail</span>
                        </a>
                        <a 
                            href="https://wa.me/919999050773" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 hover:bg-green-500 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                        >
                            <MessageCircle size={18} className="group-hover:rotate-12 transition-transform duration-300" /> 
                            <span className="font-medium">WhatsApp</span>
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="flex items-center gap-2 text-gray-500 text-xs mt-2">
                        <p>&copy; {currentYear} Zee Crown. All Rights Reserved.</p>
                        <span className="text-gray-400">Made with</span>
                        <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
