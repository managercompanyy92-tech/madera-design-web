// src/pages/catalog/index.js

import React from "react";
import { catalogCategories } from "../../utils/catalogCategories";

export default function CatalogPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050505" }}>
      {/* Заголовок */}
      <section style={{ width: "100%", padding: "40px 0 56px" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 300,
              color: "#F3ECE0",
              marginBottom: "8px",
            }}
          >
            Каталог мебели
          </h1>

          <p
            style={{
              maxWidth: "520px",
              fontSize: "14px",
              lineHeight: 1.5,
              color: "#A8A19A",
              margin: 0,
            }}
          >
            Выберите категорию — дальше покажем вдохновляющие идеи,
            а затем поможем посчитать стоимость и оформить заказ.
          </p>
        </div>
      </section>

      {/* Сетка 3x2 */}
      <section style={{ width: "100%", paddingBottom: "72px" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "24px",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {catalogCategories.map((item) => (
              <a
                key={item.id}
                href={`/catalog/${item.id}`}
                style={{
                  position: "relative",
                  display: "block",
                  borderRadius: "18px",
                  overflow: "hidden",
                  background:
                    "radial-gradient(circle at top, #2b2218, #050505 60%)",
                  textDecoration: "none",
                }}
              >
                {/* Изображение */}
                <div
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%", // 16:9
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "scale(1.02)",
                      transition: "transform 0.5s ease-out, opacity 0.5s",
                    }}
                  />

                  {/* Градиент */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.25), transparent)",
                    }}
                  />
                </div>

                {/* Название категории */}
                <div
                  style={{
                    position: "absolute",
                    left: "20px",
                    right: "20px",
                    bottom: "18px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: 300,
                      color: "#F6EFE2",
                      margin: 0,
                    }}
                  >
                    {item.title}
                  </h2>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
                }
