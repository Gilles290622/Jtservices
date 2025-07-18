import React from "react";

const ShareInterface = ({ fileUrl }) => {
  const message = `Voici le fichier à consulter : ${fileUrl}`;
  const encodedMessage = encodeURIComponent(message);

  const whatsappWebLink = `https://web.whatsapp.com/send?text=${encodedMessage}`;
  const whatsappMobileLink = `https://wa.me/?text=${encodedMessage}`;
  const gmailLink = `mailto:?subject=Partage de fichier&body=${encodedMessage}`;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const whatsappLink = isMobile ? whatsappMobileLink : whatsappWebLink;

  return (
    <div className="p-6 rounded-2xl shadow-lg border max-w-xl mx-auto bg-white">
      <h2 className="text-xl font-bold mb-4 text-center">Partager le fichier</h2>
      <div className="flex flex-col space-y-4 text-center">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
        >
          Partager via WhatsApp
        </a>
        <a
          href={gmailLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Partager par Email
        </a>
        <a
          href={fileUrl}
          download
          className="px-4 py-2 rounded-lg border text-gray-800 hover:bg-gray-100"
        >
          Télécharger le fichier
        </a>
      </div>
    </div>
  );
};

export default ShareInterface;