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
      "Com dois movimentos: primeiro, sua página de avaliação inteligente direciona clientes satisfeitos para o Google e intercepta críticas em privado — assim os elogios viram estrelas públicas e os problemas chegam só pra você resolver. Segundo, a IA te ajuda a responder 100% das avaliações, o que melhora sua imagem e seu posicionamento na busca local.",
  },
  {
    question: "É seguro conectar minha conta Google?",
    answer:
      'Sim. Usamos a conexão oficial do Google (OAuth), a mesma tecnologia de "Entrar com Google" que você já usa em outros apps. Não temos acesso à sua senha e você pode revogar a permissão a qualquer momento direto na sua conta Google.',
  },
];
