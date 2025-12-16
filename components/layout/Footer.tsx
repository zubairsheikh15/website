import { Phone, Mail, MessageCircle } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="text-center py-6 px-4">
            <div className="container max-w-screen-2xl mx-auto">
                <div className="glass-panel px-6 py-5 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    <Image src="/icon.png" alt="Zee Crown" width={30} height={30} />
                    <span className="font-semibold text-lg text-dark-gray">Zee Crown</span>
                </div>

                <div className="flex items-center justify-center gap-5 text-gray-600 text-sm">
                    <a href="tel:+919999050773" className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Phone size={16} /> Call
                    </a>
                    <a href="mailto:zubairsheikh15@gmail.com" className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Mail size={16} /> Mail
                    </a>
                    <a href="https://wa.me/919999050773" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageCircle size={16} /> WhatsApp
                    </a>
                </div>

                <p className="text-gray-500 text-xs mt-2">
                    &copy; {currentYear} Zee Crown. All Rights Reserved.
                </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
