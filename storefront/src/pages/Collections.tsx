import { Link } from 'react-router-dom';
import banner1 from '@/assets/banners/Gemini_Generated_Image_4ce0xr4ce0xr4ce0.png';
import banner2 from '@/assets/banners/Gemini_Generated_Image_9pi7s99pi7s99pi7.png';
import banner3 from '@/assets/banners/Gemini_Generated_Image_aqnfq3aqnfq3aqnf.png';
import banner4 from '@/assets/banners/Gemini_Generated_Image_le0w0kle0w0kle0w.png';

const collections = [
  {
    id: 'minimalist',
    name: 'Minimalist Vibes',
    description: 'Clean, simple, and aesthetic. Less is more.',
    image: banner1,
    tags: ['Essential', 'Timeless', 'Versatile'],
    color: 'from-slate-900 to-slate-700',
  },
  {
    id: 'streetwear',
    name: 'Street Culture',
    description: 'Bold statements, urban energy, and raw authenticity.',
    image: banner2,
    tags: ['Edgy', 'Bold', 'Statement'],
    color: 'from-zinc-900 to-zinc-700',
  },
  {
    id: 'tech',
    name: 'Tech Inspired',
    description: 'Futuristic designs for the digital generation.',
    image: banner3,
    tags: ['Modern', 'Innovation', 'Digital'],
    color: 'from-gray-900 to-gray-700',
  },
  {
    id: 'creative',
    name: 'Creative Souls',
    description: 'Express yourself. Art meets fashion.',
    image: banner4,
    tags: ['Artistic', 'Unique', 'Expressive'],
    color: 'from-neutral-900 to-neutral-700',
  },
];

export default function Collections() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
            FIND YOUR VIBE
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Identity-driven collections for Gen Z. Express who you are without saying a word.
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/store/techstore/products?collection=${collection.id}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Background Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-t ${collection.color} opacity-60 group-hover:opacity-70 transition-opacity duration-300`} />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="transform transition-transform duration-300 group-hover:translate-y-[-8px]">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {collection.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">
                    {collection.name}
                  </h2>

                  {/* Description */}
                  <p className="text-white/90 text-lg mb-4 drop-shadow-md">
                    {collection.description}
                  </p>

                  {/* CTA Button */}
                  <div className="flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all duration-300">
                    <span className="text-lg">EXPLORE COLLECTION</span>
                    <svg
                      className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-black text-white py-16 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Can't Pick Just One?
          </h3>
          <p className="text-gray-300 text-lg mb-8">
            Browse all products and filter by your mood, style, or vibe.
          </p>
          <Link
            to="/store/techstore/products"
            className="inline-block px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            SHOP ALL PRODUCTS
          </Link>
        </div>
      </div>
    </div>
  );
}
