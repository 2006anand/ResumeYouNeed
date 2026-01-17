import React, { useState } from 'react';
import { UploadCloud, FileType, CheckCircle, XCircle } from 'lucide-react';
import { FileData } from '../types';

interface FileUploaderProps {
  label: string;
  onFileSelect: (file: FileData | null) => void;
  accept?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  onFileSelect,
  accept = ".pdf,.docx,.txt"
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      setFileName(null);
      onFileSelect(null);
      return;
    }

    const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
       if (!file.name.endsWith('.docx') && !file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
         setError("Invalid file type. Please upload PDF, DOCX, or TXT.");
         return;
       }
    }

    // Limit to 5MB to ensure fast processing and avoid browser/API payload limits with inline base64
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large (Max 5MB).");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      onFileSelect({
        name: file.name,
        type: file.type || 'application/octet-stream',
        data: base64Data
      });
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full group">
      <label className="block text-lg font-extrabold text-slate-800 dark:text-slate-200 mb-3 tracking-tight">
        {label}
      </label>
      <div className={`
        relative border-2 border-dashed rounded-xl p-8 transition-all duration-300
        ${error ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800' : fileName ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-700 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800 hover:bg-indigo-50/10 dark:hover:bg-slate-700'}
      `}>
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept={accept}
        />
        <div className="flex flex-col items-center justify-center text-center space-y-3 pointer-events-none">
          {error ? (
            <>
              <XCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </>
          ) : fileName ? (
            <>
              <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 p-2 rounded-full">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-sm text-indigo-900 dark:text-indigo-200 font-semibold truncate max-w-[200px]">{fileName}</p>
              <p className="text-xs text-indigo-500 dark:text-indigo-400">Click to replace</p>
            </>
          ) : (
            <>
              <div className={`p-3 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-slate-600 transition-colors duration-300`}>
                <UploadCloud className="w-6 h-6 text-slate-400 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">PDF, DOCX, TXT (Max 5MB)</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
