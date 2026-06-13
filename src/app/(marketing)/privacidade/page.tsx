import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Reputamax coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.",
  alternates: { canonical: "/privacidade" },
};

const CONTACT_EMAIL = "contato@reputamax.app";

export default function PrivacidadePage() {
  return (
    <LegalPage title="Política de Privacidade" updatedAt="13 de junho de 2026">
      <p>
        Esta Política de Privacidade explica como o <strong>Reputamax</strong>{" "}
        (&ldquo;Reputamax&rdquo;, &ldquo;nós&rdquo;) coleta, usa, compartilha e protege dados
        pessoais, em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de
        Dados — LGPD). Ao usar nosso site e serviços, você concorda com as práticas
        descritas aqui.
      </p>

      <h2>1. Quem é o controlador dos dados</h2>
      <p>
        O Reputamax é o controlador dos dados pessoais tratados em sua plataforma.
        Para qualquer assunto relacionado a privacidade, fale com nosso encarregado
        (DPO) pelo e-mail <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. Quais dados coletamos</h2>
      <p>Coletamos diferentes dados conforme a sua relação com a plataforma:</p>
      <ul>
        <li>
          <strong>Diagnóstico gratuito:</strong> o nome do negócio pesquisado e, se
          você optar por receber o relatório completo, seu e-mail e, opcionalmente,
          seu WhatsApp.
        </li>
        <li>
          <strong>Conta de usuário:</strong> seu nome, e-mail e senha (armazenada de
          forma criptografada). Se você usar &ldquo;Entrar com Google&rdquo;, recebemos
          os dados básicos do perfil autorizados por você.
        </li>
        <li>
          <strong>Dados do negócio:</strong> nome, categoria, endereço, identificador
          do Google e configurações da sua página de avaliação.
        </li>
        <li>
          <strong>Avaliações públicas:</strong> dados de avaliações já públicas no
          Google (autor, nota e texto), obtidos por APIs oficiais.
        </li>
        <li>
          <strong>Respostas da página de avaliação:</strong> quando um cliente final
          avalia pelo seu link/QR code, registramos a nota e, em caso de feedback
          privado, o texto e o contato que ele opcionalmente informar.
        </li>
        <li>
          <strong>Dados de navegação:</strong> métricas anônimas de uso (páginas
          visitadas, identificador de sessão) para entender e melhorar o produto.
        </li>
      </ul>

      <h2>3. Como usamos os dados</h2>
      <ul>
        <li>Gerar o diagnóstico de reputação e enviar o relatório solicitado.</li>
        <li>Criar e manter sua conta e prestar os serviços contratados.</li>
        <li>
          Gerar análises e sugestões de resposta com inteligência artificial a partir
          das avaliações do seu negócio.
        </li>
        <li>Enviar comunicações sobre o serviço, novidades e suporte.</li>
        <li>Garantir segurança, prevenir fraudes e cumprir obrigações legais.</li>
      </ul>

      <h2>4. Bases legais</h2>
      <p>
        Tratamos dados com base na execução de contrato (prestação do serviço), no
        consentimento (ex.: envio do relatório por e-mail), no legítimo interesse
        (melhoria do produto e segurança) e no cumprimento de obrigações legais,
        conforme o art. 7º da LGPD.
      </p>

      <h2>5. Compartilhamento com terceiros</h2>
      <p>
        Não vendemos seus dados. Compartilhamos o estritamente necessário com
        prestadores que viabilizam o serviço:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — banco de dados, autenticação e armazenamento.
        </li>
        <li>
          <strong>Google</strong> — login (OAuth) e dados públicos de avaliações
          (Google Places / Business Profile).
        </li>
        <li>
          <strong>Provedores de IA</strong> — análise de texto e geração de respostas
          (ex.: MiniMax, e, quando habilitado, OpenAI ou Anthropic).
        </li>
        <li>
          <strong>Vercel</strong> — hospedagem da aplicação.
        </li>
      </ul>
      <p>
        Esses parceiros podem processar dados em servidores fora do Brasil. Nesses
        casos, adotamos salvaguardas para garantir proteção compatível com a LGPD.
      </p>

      <h2>6. Retenção</h2>
      <p>
        Mantemos os dados pelo tempo necessário às finalidades descritas ou conforme
        exigido por lei. Encerrada a conta, os dados associados são eliminados ou
        anonimizados, salvo obrigação legal de retenção.
      </p>

      <h2>7. Seus direitos</h2>
      <p>
        Conforme a LGPD, você pode solicitar a qualquer momento: confirmação da
        existência de tratamento, acesso, correção, anonimização, portabilidade,
        eliminação dos dados, informação sobre compartilhamentos e revogação do
        consentimento. Para exercer esses direitos, escreva para{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Usamos cookies essenciais para autenticação e funcionamento do site, além de
        identificadores de sessão para métricas de uso. Você pode gerenciar cookies
        nas configurações do seu navegador; desativá-los pode afetar funcionalidades.
      </p>

      <h2>9. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger os dados, incluindo
        criptografia em trânsito, controle de acesso e isolamento de dados por conta.
        Nenhum sistema é 100% imune, mas trabalhamos continuamente para reduzir riscos.
      </p>

      <h2>10. Alterações desta política</h2>
      <p>
        Podemos atualizar esta política periodicamente. Mudanças relevantes serão
        comunicadas pelo site ou por e-mail. A data de última atualização está no topo
        desta página.
      </p>

      <h2>11. Contato</h2>
      <p>
        Dúvidas sobre privacidade ou proteção de dados:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
