import { Phone, Mail, MessageCircle } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';

export default function HelpPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <BackButton />
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Help Center</h1>
                <p className="text-lg text-gray-600 mb-12">
                    We're here to help! Contact us through any of the methods below.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <a href="tel:+919999050773" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-out group" style={{ willChange: 'box-shadow' }}>
                        <Phone size={48} className="mx-auto text-primary transition-opacity duration-200 ease-out group-hover:opacity-80" />
                        <h2 className="text-xl font-bold mt-4">Call Us</h2>
                        <p className="text-gray-500 mt-2">+91 9999050773</p>
                    </a>
                    <a href="https://wa.me/919999050773" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-out group" style={{ willChange: 'box-shadow' }}>
                        <MessageCircle size={48} className="mx-auto text-primary transition-opacity duration-200 ease-out group-hover:opacity-80" />
                        <h2 className="text-xl font-bold mt-4">WhatsApp</h2>
                        <p className="text-gray-500 mt-2">Chat with us</p>
                    </a>
                    <a href="mailto:zubairsheikh15@gmail.com" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-out group" style={{ willChange: 'box-shadow' }}>
                        <Mail size={48} className="mx-auto text-primary transition-opacity duration-200 ease-out group-hover:opacity-80" />
                        <h2 className="text-xl font-bold mt-4">Email Us</h2>
                        <p className="text-gray-500 mt-2">zubairsheikh15@gmail.com</p>
                    </a>
                </div>
            </div>
        </div>
    );
}