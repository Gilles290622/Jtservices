import React from 'react';
import { File, FileText, FileImage, FileVideo, FileAudio, FileArchive, FileSpreadsheet, FileQuestion as FilePresentation, FileCode, Database, Layers } from 'lucide-react';

const FileIcon = ({ mimeType, className }) => {
  const baseClassName = "h-16 w-16 mb-2";
  const combinedClassName = `${baseClassName} ${className || ''}`;

  if (!mimeType) return <File className={`${combinedClassName} text-slate-500`} />;

  if (mimeType.startsWith('image/')) {
    if (mimeType === 'image/vnd.adobe.photoshop') {
       return <Layers className={`${combinedClassName} text-blue-800`} />;
    }
    return <FileImage className={`${combinedClassName} text-purple-500`} />;
  }
  if (mimeType.startsWith('video/')) {
    return <FileVideo className={`${combinedClassName} text-orange-500`} />;
  }
  if (mimeType.startsWith('audio/')) {
    return <FileAudio className={`${combinedClassName} text-pink-500`} />;
  }

  switch (mimeType) {
    case 'application/x-photoshop':
      return <Layers className={`${combinedClassName} text-blue-800`} />;
    case 'text/plain':
      return <FileText className={`${combinedClassName} text-slate-600`} />;
    case 'application/pdf':
      return <FileText className={`${combinedClassName} text-red-500`} />;
    case 'application/json':
      return <FileCode className={`${combinedClassName} text-yellow-500`} />;
    case 'text/html':
    case 'text/css':
    case 'text/javascript':
    case 'application/javascript':
    case 'application/x-httpd-php':
    case 'text/php':
      return <FileCode className={`${combinedClassName} text-indigo-500`} />;
    case 'application/sql':
      return <Database className={`${combinedClassName} text-cyan-500`} />;
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return <FileText className={`${combinedClassName} text-blue-500`} />;
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return <FileSpreadsheet className={`${combinedClassName} text-green-500`} />;
    case 'application/vnd.ms-powerpoint':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return <FilePresentation className={`${combinedClassName} text-yellow-600`} />;
    case 'application/zip':
    case 'application/x-rar-compressed':
    case 'application/x-7z-compressed':
    case 'application/gzip':
      return <FileArchive className={`${combinedClassName} text-gray-500`} />;
    default:
      return <File className={`${combinedClassName} text-slate-500`} />;
  }
};

export default FileIcon;