'use client';
import { FileUpload } from "@/components/file-upload";
import TranscriptionButton from "@/components/transcription-button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypewriterEffectSmooth } from "@/components/typewriter-effect";

export default function Home() {
  return (
    <main className="flex flex-col text-gray-300 items-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <HeroSection />
    </main>
  );
}

const words = [
  { text: "Transform" },
  { text: "your" },
  { text: "audio" },
  { text: "into" },
  { text: "text" },
  { text: "with" },
  { text: "ease" }
]

const HeroSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<{
    text: string;
    timestamp: string;
  }[]>([]);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [showTimestamps, setShowTimestamps] = useState<boolean>(false);
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFile(null);
    setTranscription([]);
    setFile(newFiles[0]);
  };

  const handleTranscription = async () => {
    if (!file) {
      return;
    }

    setIsTranscribing(true);
    setTranscription([]);

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('modelName', 'tiny.en');
    formData.append('options', JSON.stringify({ gen_file_txt: true, gen_file_subtitle: true, gen_file_vtt: true }));

    try {
      const response = await fetch('http://localhost:4000/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.body) {
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);

        const lines = chunk.split('\n');

        try {
          const data = JSON.parse(chunk);
          if (data && typeof data === 'object' && 'id' in data) {
            setTranscriptionId(data.id);
          }
        } catch (error) {
          // If parsing fails, it's not JSON
          console.log('Chunk is not JSON:', chunk);
        }

        const newTranscriptions = lines.map(line => {
          const [timestamp, text] = line.split(']   ');
          const formattedTimestamp = timestamp.replace('[', '').trim();
          return { timestamp: formattedTimestamp, text };
        }).filter(({ timestamp, text }) => {
          return timestamp !== "" && text !== undefined;
        });

        setTranscription(prev => [...prev, ...newTranscriptions]);
      }
    } catch (error) {
      console.error('Error transcribing file:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDownload = (format: string) => {
    try {
      fetch(`http://localhost:4000/api/download/${transcriptionId}/${format}`, {
        headers: {
          responseType: "blob",
        },
        method: "GET",
      })
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  return (
    <div className="flex flex-col mt-20 text-gray-300 items-center justify-center w-full max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Web Transcriber</h1>
        <TypewriterEffectSmooth words={words} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <FileUpload file={file} setFile={setFile} accept="audio/*" onChange={handleFileChange} />
      </motion.div>
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4 mt-8"
          >
            {transcription.length === 0 ? <TranscriptionButton file={file} onClick={handleTranscription} isTranscribing={isTranscribing} /> : null}
            {((transcription.length > 0 || file) && !isTranscribing) ? <button
              onClick={() => {
                setFile(null);
                setTranscription([]);
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-400"
            >
              Clear
            </button> : null}
          </motion.div>
        )}
      </AnimatePresence>
      {(transcription.length > 0 && !isTranscribing) && (
        <div className="flex flex-row flex-wrap gap-4 mt-8">
          <a href={`http://localhost:4000/api/download/${transcriptionId}/srt`} target="_blank" rel="noopener noreferrer">
            <button onClick={() => handleDownload('srt')} className="p-[3px] relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
              <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                .SRT
              </div>
            </button>
          </a>
          <a href={`http://localhost:4000/api/download/${transcriptionId}/vtt`} target="_blank" rel="noopener noreferrer">
            <button onClick={() => handleDownload('vtt')} className="p-[3px] relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
              <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                .VTT
              </div>
            </button>
          </a>
          <a href={`http://localhost:4000/api/download/${transcriptionId}/txt`} target="_blank" rel="noopener noreferrer">
            <button onClick={() => handleDownload('txt')} className="p-[3px] relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
              <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
                .TXT
              </div>
            </button>
          </a>
        </div>
      )}
      <TranscriptionPreview transcription={transcription} />
    </div>
  );
};

const TranscriptionPreview = ({ transcription }: { transcription: { text: string; timestamp: string }[] }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-12 rounded-lg p-6"
    >
      <div className="space-y-4">
        {transcription.map(({ text, timestamp }, index) => (
          <TranscriptionLine key={`${timestamp}-${index}`} text={text} timestamp={timestamp} />
        ))}
      </div>
    </motion.div>
  );
};

const TranscriptionLine = ({ text, timestamp }: { text: string; timestamp: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-b border-gray-700 pb-2"
    >
      <p className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full font-mono text-sm">{timestamp}</p>
      <p className="text-sm text-gray-300 flex-1">{text}</p>
    </motion.div>
  );
};

