// src/components/CatalogGrid.jsx

import Image from "next/image";
import Link from "next/link";
import { catalogCategories } from "@/utils/catalogCategories";

export default function CatalogGrid() {
  return (
    <section className="w-full bg-[#111111] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        
        <h1 className="mb-12 text-3xl md:text-4xl font-light tracking-tight text-[#F0ECE2]">
          Каталог Madera Design
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {catalogCategories.map((item) => (
            <Link
              key={item.id}
              href={`/catalog/${item.id}`}
              className="group block relative overflow-hidden rounded-xl"
            >
              {/* Image wrapper */}
              <div className="relative aspect-[16/9]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                {/* Title */}
                <div className="absolute bottom-5 left-6">
                  <h2 className="text-xl md:text-2xl font-light text-[#F5EDE0]">
                    {item.name}
                  </h2>
                </div>
              </div>

              {/* Subtle hover glow */}
              <div className="absolute inset-0 bg-white/0 transition duration-500 group-hover:bg-white/5"></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
