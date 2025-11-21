// src/components/PolicyModal.jsx
import { motion } from 'framer-motion';
import { XIcon } from '../utils/icons'; // Assuming XIcon is in utils/icons

const PolicyModal = ({ title, content, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-card p-8 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-border"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <XIcon size={24} />
                </button>
                <h2 className="text-3xl font-bold text-center text-foreground mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {title}
                </h2>
                <div className="text-muted-foreground text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
            </motion.div>
        </motion.div>
    );
};

export default PolicyModal;