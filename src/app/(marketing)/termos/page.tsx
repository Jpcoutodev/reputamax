import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Condições de uso da plataforma Reputamax: serviço, conta, planos, responsabilidades e regras de uso.",
  alternates: { canonical: "/termos" },
};

const CONTACT_EMAIL = "contato@reputamax.app";

export default function TermosPage() {
  return (
    <LegalPage title="Termos de Uso" updatedAt="13 de junho de 2026">
      <p>
        Estes Termos de Uso regem o acesso e a utilização da plataforma{" "}
        <strong>Reputamax</strong>. Ao criar uma conta ou usar nossos serviços, você
        declara que leu e concorda com estes Termos e com a nossa{" "}
        <Link href="/privacidade">Política de Privacidade</Link>.
      </p>

      <h2>1. O serviço</h2>
      <p>
        O Reputamax é uma plataforma de gestão de reputação para negócios locais que
        oferece: diagnóstico da reputação no Google, página de avaliação
        inteligente, geração de QR code, painel de métricas e sugestões de resposta a
        avaliações com inteligência artificial.
      </p>

      <h2>2. Conta e elegibilidade</h2>
      <ul>
        <li>
          Você deve fornecer informações verdadeiras e manter seus dados de acesso em
          sigilo. É responsável por toda atividade realizada em sua conta.
        </li>
        <li>
          Você deve ter capacidade legal para contratar e representar o negócio que
          cadastra na plataforma.
        </li>
      </ul>

      <h2>3. Planos, trial e pagamento</h2>
      <ul>
        <li>
          Oferecemos um período de teste gratuito de 14 dias, sem necessidade de
          cartão de crédito.
        </li>
        <li>
          Os planos pagos (Essencial — R$ 97/mês e Pro — R$ 197/mês) dão acesso aos
          recursos descritos no momento da contratação. Valores e funcionalidades
          podem mudar mediante aviso prévio.
        </li>
        <li>
          O processamento de pagamentos poderá ser disponibilizado futuramente; até
          lá, o uso permanece em regime de teste gratuito.
        </li>
      </ul>

      <h2>4. Uso aceitável</h2>
      <p>Você concorda em não:</p>
      <ul>
        <li>Usar a plataforma para fins ilícitos ou que violem direitos de terceiros.</li>
        <li>
          Inserir conteúdo falso, ofensivo ou que infrinja propriedade intelectual.
        </li>
        <li>
          Tentar burlar mecanismos de segurança, sobrecarregar a infraestrutura ou
          acessar dados de outros usuários.
        </li>
      </ul>

      <h2>5. Avaliações e integração com o Google</h2>
      <p>
        A página de avaliação ajuda a coletar a opinião dos seus clientes e a
        direcioná-los aos canais adequados. Você é o único responsável por utilizar a
        ferramenta em conformidade com as políticas do Google e com a legislação
        aplicável, incluindo as regras sobre solicitação de avaliações. O Reputamax não
        cria avaliações falsas nem manipula notas.
      </p>

      <h2>6. Inteligência artificial</h2>
      <p>
        Análises de diagnóstico e sugestões de resposta são geradas por inteligência
        artificial e têm caráter de apoio. Elas podem conter imprecisões. Você deve
        revisar todo conteúdo antes de publicá-lo ou enviá-lo. As métricas do
        diagnóstico são estimativas baseadas em dados públicos e não constituem
        garantia de resultado.
      </p>

      <h2>7. Propriedade intelectual</h2>
      <p>
        A marca, o software, o design e os conteúdos do Reputamax são protegidos por
        direitos de propriedade intelectual. O uso da plataforma não transfere
        qualquer desses direitos a você. Os dados do seu negócio e dos seus clientes
        permanecem seus.
      </p>

      <h2>8. Limitação de responsabilidade</h2>
      <p>
        O serviço é fornecido &ldquo;no estado em que se encontra&rdquo;. Não garantimos
        resultados específicos de reputação, posicionamento ou aumento de clientes. Na
        máxima extensão permitida em lei, o Reputamax não se responsabiliza por danos
        indiretos decorrentes do uso ou da indisponibilidade da plataforma.
      </p>

      <h2>9. Cancelamento</h2>
      <p>
        Você pode encerrar sua conta a qualquer momento. Podemos suspender ou encerrar
        contas que violem estes Termos. O tratamento dos dados após o encerramento
        segue a nossa <Link href="/privacidade">Política de Privacidade</Link>.
      </p>

      <h2>10. Alterações dos termos</h2>
      <p>
        Podemos atualizar estes Termos periodicamente. Mudanças relevantes serão
        comunicadas pelo site ou por e-mail. O uso continuado após a alteração
        representa concordância com a nova versão.
      </p>

      <h2>11. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica
        eleito o foro do domicílio do usuário para dirimir eventuais controvérsias,
        conforme a legislação consumerista aplicável.
      </p>

      <h2>12. Contato</h2>
      <p>
        Dúvidas sobre estes Termos:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
