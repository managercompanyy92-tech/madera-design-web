// src/components/CatalogPage.jsx
import { useState, useMemo } from "react";
import catalogCategories from "@/data/catalogCategories";
import { catalogItems } from "@/utils/catalogItems"; // как у тебя сейчас

const CatalogPage = () => {
  const [activeCategoryId, setActiveCategoryId] = useState("kitchens");

  const activeCategory = useMemo(
    () =>
      catalogCategories.find((cat) => cat.id === activeCategoryId) ??
      catalogCategories[0],
    [activeCategoryId]
  );

  const activeItems = useMemo(
    () => catalogItems.filter((item) => item.categoryId === activeCategoryId),
    [activeCategoryId]
  );

  return (
    <main className="min-h-screen bg-black text-white pb-32">
      {/* Шапка каталога */}
      <section className="px-4 sm:px-6 lg:px-10 pt-10 pb-6 max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-wide mb-3">
          Каталог мебели
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 max-w-2xl">
          Выберите категорию — покажем реализованные решения, поможем
          прикинуть бюджет и адаптировать идею под вашу планировку.
        </p>
      </section>

      {/* Витрина категорий */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
          {catalogCategories.map((cat) => {
            const isActive = cat.id === activeCategoryId;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryId(cat.id)}
                className={[
                  "relative group overflow-hidden rounded-3xl border transition-all duration-200 text-left",
                  "bg-gradient-to-b from-zinc-900/80 via-zinc-900/95 to-black",
                  isActive
                    ? "border-amber-400/80 shadow-[0_0_40px_rgba(251,146,60,0.35)]"
                    : "border-zinc-800 hover:border-amber-300/70 hover:shadow-[0_0_30px_rgba(251,146,60,0.25)]"
                ].join(" ")}
              >
                {/* Фон-обложка */}
                <div className="absolute inset-0">
                  <img
                    src={cat.cover}
                    alt={cat.name}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />
                </div>

                {/* Контент карточки */}
                <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-amber-300/80">
                      Madera Design
                    </span>
                    {isActive && (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/50">
                        выбранo
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    <h2 className="text-lg sm:text-xl font-semibold mb-1">
                      {cat.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-200/85 mb-2">
                      {cat.tagline}
                    </p>
                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-300/80">
                      <span className="truncate pr-2">{cat.benefit}</span>
                      <span className="whitespace-nowrap bg-black/40 px-2 py-1 rounded-full border border-white/10">
                        {cat.statsLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Блок выбранной категории + карточки проектов */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">
              {activeCategory.name}
            </h2>
            <p className="text-sm text-zinc-300">{activeCategory.tagline}</p>
          </div>
          <div className="mt-2 sm:mt-0 text-xs text-zinc-400">
            Показано решений:{" "}
            <span className="text-amber-300 font-medium">
              {activeItems.length}
            </span>
          </div>
        </div>

        {/* Сетка карточек внутри выбранной категории */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {activeItems.map((item) => (
            <article
              key={item.id}
              className="group rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950/80 hover:border-amber-300/70 hover:shadow-[0_0_30px_rgba(251,146,60,0.25)] transition-all duration-200"
            >
              <div className="relative h-40 sm:h-44">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="text-sm sm:text-base font-semibold mb-1 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-3 mb-3">
                  {item.description || item.excerpt}
                </p>
                {item.tags && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-300/90"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default CatalogPage;
