/** Conteúdo da landing reaproveitado entre a renderização e o JSON-LD (FAQPage). */

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "Preciso de conhecimento técnico?",
    answer:
      "Nenhum. Você busca seu negócio, recebe o diagnóstico e o Reputamax faz o resto: página de avaliação pronta, QR code pra imprimir e respostas sugeridas pela IA. Se você usa WhatsApp, sabe usar o Reputamax.",
  },
  {
    question: "O diagnóstico é realmente grátis?",
    answer:
      "Sim, e sem pegadinha: não pedimos cartão de crédito nem criação de conta para ver o relatório completo. O diagnóstico é nossa forma de mostrar o valor do produto antes de você decidir.",
  },
  {
    question: "Funciona para qualquer tipo de negócio?",
    answer:
      "Funciona para qualquer negócio local com perfil no Google: restaurantes, clínicas, salões, academias, oficinas, pet shops, hotéis e muito mais. Se seus clientes te procuram no Google, o Reputamax é pra você.",
  },
  {
    question: "Como o sistema faz minha nota subir?",
    answer:
      "Sua nota sobe por volume, não por filtro. O Reputamax convida todos os seus clientes a avaliar de forma consistente — e como a maioria dos clientes de um bom negócio é satisfeita, o volume de avaliações positivas reais faz sua média crescer naturalmente. Além disso, respondemos cada avaliação com IA e te alertamos sobre notas baixas na hora, para você resolver o problema direto com o cliente. Não selecionamos quem avalia: todos recebem o mesmo convite, em conformidade com as políticas do Google.",
  },
  {
    question: "O Reputamax compra avaliações ou cria avaliações falsas?",
    answer:
      "Não. Comprar avaliações, oferecer recompensas em troca de nota ou criar avaliações falsas são práticas proibidas pelas políticas do Google e podem resultar na remoção de avaliações, suspensão do perfil e penalização na busca. O Reputamax trabalha de forma 100% legítima: convida todos os seus clientes reais a avaliar de forma voluntária e honesta, sem nenhum tipo de incentivo. Sua nota sobe pelo volume real de clientes satisfeitos, não por manipulação.",
  },
  {
    question: "É seguro conectar minha conta Google?",
    answer:
      'Sim. Usamos a conexão oficial do Google (OAuth), a mesma tecnologia de "Entrar com Google" que você já usa em outros apps. Não temos acesso à sua senha e você pode revogar a permissão a qualquer momento direto na sua conta Google.',
  },
];
