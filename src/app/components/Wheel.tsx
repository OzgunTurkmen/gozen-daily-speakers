"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface WheelProps {
  speakers: string[];
  onSpinComplete: (winner: string) => void;
  isSpinning: boolean;
}

export default function Wheel({ speakers, onSpinComplete, isSpinning }: WheelProps) {
  const [rotation, setRotation] = useState(0);
  const [prevSpinning, setPrevSpinning] = useState(false);
  const [key, setKey] = useState(0); // Animasyonu sıfırlamak için key

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  const ANIMATION_DURATION = 3; // Animasyon süresi (saniye)

  // Çarkı döndür
  useEffect(() => {
    if (isSpinning && !prevSpinning && speakers.length > 0) {
      // Rastgele bir konuşmacı seç
      const randomIndex = Math.floor(Math.random() * speakers.length);
      const selectedSpeaker = speakers[randomIndex];
      
      // Rastgele dönüş hızı (2-4 saniye arası)
      const randomDuration = 2 + Math.random() * 2;
      setAnimationDuration(randomDuration);
      
      // Çarkın dönüş açısını hesapla
      const segmentSize = 360 / speakers.length;
      const extraSpins = 3 + Math.floor(Math.random() * 5); // 3-7 tur arası rastgele
      
      // Seçilen konuşmacının segmentinin pointer'a gelmesi için gereken açı
      // Pointer alt kısımda olduğu için, 0 derece alt kısma denk gelir
      // Çark saat yönünde döndüğü için, seçilen konuşmacının indeksini doğrudan kullanabiliriz
      const extraDegrees = randomIndex * segmentSize;
      
      // Toplam rotasyon: Tam turlar + seçilen konuşmacının açısı
      const newRotation = 360 * extraSpins + extraDegrees;
      
      console.log(`Seçilen konuşmacı: ${selectedSpeaker}, index: ${randomIndex}, açı: ${extraDegrees}, yeni rotasyon: ${newRotation}, süre: ${randomDuration}`);
      
      // Önce rotasyonu sıfırla, sonra yeni rotasyonu ayarla
      setRotation(0);
      setKey(prev => prev + 1); // Key'i değiştirerek animasyonu sıfırla
      
      // Bir sonraki render'da yeni rotasyonu ayarla
      setTimeout(() => {
        setRotation(newRotation);
        
        // Animasyon bittikten sonra kazananı bildir
        setTimeout(() => {
          onSpinComplete(selectedSpeaker);
        }, randomDuration * 1000);
      }, 10);
    }
    setPrevSpinning(isSpinning);
  }, [isSpinning, speakers, prevSpinning, onSpinComplete]);

  const degreesPerSpeaker = speakers.length > 0 ? 360 / speakers.length : 0;
  
  // Rastgele animasyon süresi için state
  const [animationDuration, setAnimationDuration] = useState(ANIMATION_DURATION);

  return (
    <div className="relative w-[600px] h-[600px]">
      <div className="absolute inset-0 rounded-full border-8 border-gray-300 shadow-lg"></div>
      <motion.div
        key={key} // Her animasyon için yeni bir key
        className="absolute w-full h-full rounded-full overflow-hidden"
        animate={{ rotate: rotation }}
        initial={{ rotate: 0 }} // Başlangıç rotasyonu her zaman 0
        transition={{ duration: animationDuration, ease: "easeOut" }}
        style={{ transformOrigin: "center center" }}
      >
        {speakers.map((speaker, index) => {
          // Her segment için başlangıç açısı
          // 0 derece alt kısma denk gelir
          const startAngle = index * degreesPerSpeaker;
          
          return (
            <div
              key={speaker}
              className={`absolute w-full h-1/2 ${colors[index % colors.length]} border-t border-gray-200`}
              style={{
                transform: `rotate(${startAngle}deg)`,
                transformOrigin: "50% 100%",
                clipPath: speakers.length > 1 ? `polygon(
                  50% 100%,
                  ${50 - 50 * Math.tan(Math.PI / speakers.length)}% 0%,
                  ${50 + 50 * Math.tan(Math.PI / speakers.length)}% 0%
                )` : 'none',
              }}
            >
              <div
                className="absolute w-full text-center"
                style={{
                  top: '25%',
                  left: '50%',
                  transform: `translateX(-50%) rotate(${-startAngle - degreesPerSpeaker / 2}deg)`,
                }}
              >
                <span className="text-white font-bold text-xl px-2 py-1 rounded inline-block transform -translate-y-1/2">
                  {speaker}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md z-20 border-2 border-gray-300"></div>
      
      {/* Pointer (üçgen) */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-12 h-16 z-30">
        <div className="w-0 h-0 
                      border-b-[48px] border-b-red-600
                      border-l-[24px] border-l-transparent
                      border-r-[24px] border-r-transparent
                      filter drop-shadow-md">
        </div>
      </div>
    </div>
  );
}
