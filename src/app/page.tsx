'use client';
import { FileUpload } from "@/components/file-upload";
import TranscriptionButton from "@/components/transcription-button";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  return (
    <main className="flex flex-col text-gray-400 items-center min-h-screen bg-black">
      <HeroSection />
    </main>
  );
}

const HeroSection = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFile(newFiles[0]);
  };

  const handleTranscription = () => {
    console.log(file);
  };

  return (
    <div className="flex flex-col mt-10 text-gray-400 items-center justify-center bg-black">
      <h1 className="text-4xl font-bold">Web Transcriber</h1>
      <p className="text-lg">Convert your mp3 files to text</p>
      <FileUpload file={file} setFile={setFile} accept="audio/*" onChange={handleFileChange} />
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4 mt-4"
          >
            <TranscriptionButton file={file} onClick={handleTranscription} />
            <motion.button
              onClick={() => setFile(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-2  rounded-full  transition-colors"
            >
              Clear
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
