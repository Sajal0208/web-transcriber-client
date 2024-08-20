'use client';
import { FileUpload } from "@/components/file-upload";
import TranscriptionButton from "@/components/transcription-button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  return (
    <main className="flex flex-col text-gray-300 items-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <HeroSection />
    </main>
  );
}

const HeroSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<{
    text: string;
    timestamp: string;
  }[]>([]);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [showTimestamps, setShowTimestamps] = useState<boolean>(false);

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

  return (
    <div className="flex flex-col mt-20 text-gray-300 items-center justify-center w-full max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Web Transcriber</h1>
        <p className="text-xl text-gray-400">Transform your audio into text with ease</p>
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
            {(transcription.length > 0 || file) ? <motion.button
              onClick={() => {
                setFile(null);
                setTranscription([]);
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Clear
            </motion.button> : null}
          </motion.div>
        )}
      </AnimatePresence>
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