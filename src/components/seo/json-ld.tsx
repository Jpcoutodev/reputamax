/**
 * Injeta JSON-LD (schema.org) no HTML. Renderizado em Server Component, o
 * script vai direto no HTML inicial — visível para os crawlers sem JS.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // conteúdo controlado por nós (sem entrada de usuário) — seguro
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
