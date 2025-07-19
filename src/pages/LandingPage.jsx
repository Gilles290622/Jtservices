import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Folder, ShoppingCart, FileText, ArrowRight } from 'lucide-react';

const projects = [
  {
    name: 'La Foi',
    description: 'Plateforme de streaming de contenu inspirant et édifiant.',
    icon: <Video className="h-8 w-8 text-orange-400" />,
    link: '/auth/la-foi',
    color: 'from-orange-500 to-amber-500',
  },
  {
    name: 'Fichiers',
    description: 'Gestionnaire de fichiers sécurisé pour tous vos documents importants.',
    icon: <Folder className="h-8 w-8 text-blue-400" />,
    link: '/fichiers',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Caisse',
    description: 'Solution de point de vente pour gérer vos ventes, stock et clients.',
    icon: <ShoppingCart className="h-8 w-8 text-green-400" />,
    link: '/auth/caisse',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Factures',
    description: 'Création de devis et factures pour les artisans et professionnels.',
    icon: <FileText className="h-8 w-8 text-indigo-400" />,
    link: '/auth/factures',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    name: 'Journal Financiers',
    description: 'Gestion des journaux financiers.',
    icon: <FileText className="h-8 w-8 text-red-400" />,
    link: '/auth/journal-financiers',
    color: 'from-red-500 to-pink-500',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-slate-900 to-transparent opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-slate-900 to-transparent opacity-20"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center z-10 mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-gray-100 mb-4">
          JTS Services
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
          Votre portail unique pour des applications puissantes et dédiées. Choisissez un service pour commencer.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 z-10 w-full max-w-7xl">
        {projects.map((project, i) => (
          <motion.div
            key={project.name}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <Link to={project.link} className="block h-full group">
              <div className="h-full bg-slate-900 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 flex flex-col">
                <div className={`h-1.5 bg-gradient-to-r ${project.color}`} />
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    {project.icon}
                  </div>
                  <h2 className="text-xl font-bold text-gray-100 mb-2">{project.name}</h2>
                  <p className="text-gray-400 text-sm flex-grow mb-6">{project.description}</p>
                  <div className="mt-auto text-right">
                     <span className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors duration-300 flex items-center justify-end">
                        Accéder au service
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                     </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="absolute bottom-4 right-4 z-10">
        <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          Administration
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;