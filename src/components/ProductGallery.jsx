'use client';

import { useState } from 'react';
import Image from 'next/image';

// ================= YOUTUBE UTILS =================

// 🔥 Lấy ID từ mọi loại link youtube
function getYoutubeId(url) {
  try {
    const u = new URL(url);

    // watch?v=
    if (u.searchParams.get('v')) {
      return u.searchParams.get('v');
    }

    // youtu.be/xxx
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1);
    }

    // embed/xxx
    if (u.pathname.includes('/embed/')) {
      return u.pathname.split('/embed/')[1];
    }

    return null;
  } catch {
    return null;
  }
}

// 🔥 Convert sang embed
function getYoutubeEmbed(url) {
  const id = getYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : '';
}

// 🔥 Thumbnail youtube
function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/0.jpg` : '/no-image.png';
}

function isValidProductImageUrl(url) {
  if (!url) return false;
  if (url.startsWith('/')) return true;

  try {
    const parsed = new URL(url);
    return parsed.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}

function resolveMediaUrl(src) {
  if (!src || !isValidProductImageUrl(src)) {
    return '/no-image.png';
  }
  return src;
}

// ================= COMPONENT =================

export default function ProductGallery({ items = [] }) {
  const [active, setActive] = useState(items[0]);
  const [zoomStyle, setZoomStyle] = useState({});
  const [showLightbox, setShowLightbox] = useState(false);
  if (!active) return null;

  // ================= ZOOM =================
  const handleMouseMove = (e) => {
    if (active.type !== 'image') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transform: 'scale(1)' });
  };
  return (
    <div>
      {/* ================= MAIN ================= */}
      <div
        className="border p-4 mb-3 bg-white overflow-hidden cursor-pointer"
        onClick={() => setShowLightbox(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* IMAGE */}
        {active.type === 'image' && (
          <div className="relative w-full h-75">
            <Image
              src={resolveMediaUrl(active.src)}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain transition duration-200"
              style={zoomStyle}
            />
          </div>
        )}

        {/* VIDEO FILE */}
        {active.type === 'video' && (
          <video
            src={active.src}
            controls
            className="w-full h-75 object-contain"
          />
        )}

        {/* YOUTUBE */}
        {active.type === 'youtube' && (
          <iframe
            src={getYoutubeEmbed(active.src)}
            className="w-full h-75"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}
      </div>

      {/* ================= THUMB ================= */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {items.slice(0, 9).map((item, i) => {
          const thumb =
            item.type === 'youtube'
              ? getYoutubeThumbnail(item.src)
              : item.thumbnail || resolveMediaUrl(item.src);

          return (
            <div
              key={i}
              onClick={() => setActive(item)}
              className={`border p-1 cursor-pointer relative bg-white ${
                active.src === item.src ? 'border-green-500' : ''
              }`}
            >
              {/* ICON PLAY */}
              {(item.type === 'video' || item.type === 'youtube') && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xl">
                  ▶
                </div>
              )}

              <div className="relative w-full h-17.5">
                <Image
                  src={thumb}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= LIGHTBOX ================= */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowLightbox(false)}
        >
          {/* IMAGE */}
          {active.type === 'image' && (
            <div className="relative max-w-[90%] max-h-[90%] w-full h-full">
              <Image
                src={resolveMediaUrl(active.src)}
                alt=""
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
          )}

          {/* YOUTUBE */}
          {active.type === 'youtube' && (
            <iframe
              src={getYoutubeEmbed(active.src)}
              className="w-[90%] h-[80%]"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          )}
        </div>
      )}
    </div>
  );
}
