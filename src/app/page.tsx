'use client';

import { useState, useEffect, useRef } from 'react';
import type { PutBlobResult } from '@vercel/blob';

interface Blob {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

export default function Home() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [uploading, setUploading] = useState(false);

  async function fetchFiles() {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files.');
      }
      const data = await response.json();
      setBlobs(data);
    } catch (error) {
      console.error(error);
      alert('Error fetching files. See console for details.');
    }
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const file = event.target.files[0];
    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        throw new Error('Upload failed.');
      }

      const newBlob = (await response.json()) as PutBlobResult;
      
      // Refetch files to update the list
      await fetchFiles();

    } catch (error) {
      console.error(error);
      alert('Error uploading file. See console for details.');
    } finally {
      setUploading(false);
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Air.inc Clone</h1>
        <div>
          <input
            type="file"
            ref={inputFileRef}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <button
            onClick={() => inputFileRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {blobs.map((blob) => (
          <div key={blob.pathname} className="bg-gray-800 rounded-lg overflow-hidden">
            <a href={blob.url} target="_blank" rel="noopener noreferrer">
              {blob.pathname.match(/\.(jpeg|jpg|gif|png)$/) ? (
                <img src={blob.url} alt={blob.pathname} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 flex items-center justify-center">
                  <video src={blob.url} className="w-full h-full object-cover" controls />
                </div>
              )}
            </a>
            <div className="p-4">
              <p className="text-sm truncate">{blob.pathname}</p>
              <p className="text-xs text-gray-400">{(blob.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ))}
      </div>
       {blobs.length === 0 && (
          <div className="text-center col-span-full mt-10">
            <p className="text-gray-400">No files uploaded yet. Click the upload button to get started.</p>
          </div>
        )}
    </main>
  );
}