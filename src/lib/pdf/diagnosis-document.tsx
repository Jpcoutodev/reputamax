import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { BusinessSearchResult, DiagnosisResult } from "@/lib/providers/types";

// Cores da marca (mesmas do design system)
const COLORS = {
  navy: "#1a1a2e",
  primary: "#4F46E5",
  text: "#16161d",
  muted: "#6b7280",
  border: "#e5e7eb",
  surface: "#f8f8fb",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
  white: "#ffffff",
};

function scoreColor(score: number): string {
  if (score >= 80) return COLORS.success;
  if (score >= 50) return COLORS.warning;
  return COLORS.danger;
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Reputacao saudavel";
  if (score >= 50) return "Reputacao com potencial desperdicado";
  return "Reputacao em risco";
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 48,
    fontSize: 10,
    color: COLORS.text,
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: COLORS.navy,
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  headerBrand: { color: COLORS.white, fontSize: 14, fontFamily: "Helvetica-Bold" },
  headerSub: { color: "#a5a5b8", fontSize: 9, marginTop: 2 },
  body: { paddingHorizontal: 40 },
  businessName: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  businessMeta: { fontSize: 9, color: COLORS.muted, marginBottom: 20 },

  scoreRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  scoreCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: { fontSize: 28, fontFamily: "Helvetica-Bold" },
  scoreLabel: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  summary: { fontSize: 10, lineHeight: 1.5, color: COLORS.text, marginBottom: 24 },

  metricsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
  },
  metricLabel: { fontSize: 7.5, color: COLORS.muted, marginBottom: 4 },
  metricValue: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  metricHint: { fontSize: 7, color: COLORS.muted, marginTop: 2 },

  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 10 },
  section: { marginBottom: 22 },

  themeRow: { marginBottom: 9 },
  themeHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  themeName: { fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  themePct: { fontSize: 9, color: COLORS.muted },
  barTrack: { height: 6, backgroundColor: COLORS.surface, borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
  themeExample: { fontSize: 8, color: COLORS.muted, fontStyle: "italic", marginTop: 3 },

  issueCard: {
    borderWidth: 1,
    borderColor: "#fde0c8",
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    flexDirection: "row",
    gap: 6,
  },
  issueNum: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: COLORS.warning },
  issueText: { fontSize: 9.5, flex: 1, lineHeight: 1.4 },

  recRow: { flexDirection: "row", gap: 8, marginBottom: 7, alignItems: "flex-start" },
  recNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#eef2ff",
    color: COLORS.primary,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingTop: 4,
  },
  recText: { fontSize: 9.5, flex: 1, lineHeight: 1.4 },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: COLORS.muted,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  cta: {
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    padding: 16,
    marginTop: 4,
  },
  ctaTitle: { color: COLORS.white, fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  ctaText: { color: "#a5a5b8", fontSize: 9, lineHeight: 1.4 },
});

interface Props {
  business: BusinessSearchResult;
  result: DiagnosisResult;
  generatedAt: string;
}

export function DiagnosisDocument({ business, result, generatedAt }: Props) {
  const color = scoreColor(result.score);
  const gap = result.ratingGapVsCompetitors;
  const dateStr = new Date(generatedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const metrics = [
    {
      label: "Nota no Google",
      value: business.rating.toFixed(1),
      hint: `${business.reviewCount} avaliacoes`,
      color: COLORS.text,
    },
    {
      label: "Taxa de resposta",
      value: result.responseDataAvailable ? `${result.responseRatePct}%` : "—",
      hint: result.responseDataAvailable ? "das avaliacoes" : "indisponivel",
      color: !result.responseDataAvailable
        ? COLORS.muted
        : result.responseRatePct >= 70
          ? COLORS.success
          : result.responseRatePct >= 40
            ? COLORS.warning
            : COLORS.danger,
    },
    {
      label: "Avaliacoes/mes",
      value: String(result.reviewsPerMonth),
      hint: `potencial: ${result.expectedReviewsPerMonth}`,
      color: COLORS.text,
    },
    {
      label: "Gap vs. concorrentes",
      value: `${gap > 0 ? "+" : ""}${gap.toFixed(1)}`,
      hint: "diferenca de nota",
      color: gap >= 0 ? COLORS.success : COLORS.danger,
    },
  ];

  return (
    <Document
      title={`Diagnostico de reputacao - ${business.name}`}
      author="Reputamax"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.headerBrand}>Reputamax</Text>
          <Text style={styles.headerSub}>
            Diagnostico de reputacao no Google - {dateStr}
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.businessMeta}>
            {[business.category, business.address].filter(Boolean).join(" - ")}
          </Text>

          {/* Score + resumo */}
          <View style={styles.scoreRow}>
            <View style={[styles.scoreCircle, { borderColor: color }]}>
              <Text style={[styles.scoreNumber, { color }]}>{result.score}</Text>
              <Text style={{ fontSize: 7, color: COLORS.muted }}>de 100</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.scoreLabel, { color }]}>
                {scoreLabel(result.score)}
              </Text>
            </View>
          </View>
          <Text style={styles.summary}>{result.summary}</Text>

          {/* Metricas */}
          <View style={styles.metricsRow}>
            {metrics.map((m) => (
              <View key={m.label} style={styles.metricCard}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
                <Text style={styles.metricHint}>{m.hint}</Text>
              </View>
            ))}
          </View>

          {/* Temas de sentimento */}
          {result.sentimentThemes.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>O que os clientes mais comentam</Text>
              {result.sentimentThemes.map((theme) => (
                <View key={theme.theme} style={styles.themeRow} wrap={false}>
                  <View style={styles.themeHead}>
                    <Text style={styles.themeName}>{theme.theme}</Text>
                    <Text style={styles.themePct}>{theme.pct}% das avaliacoes</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.min(100, theme.pct)}%`,
                          backgroundColor:
                            theme.type === "critica" ? COLORS.danger : COLORS.success,
                        },
                      ]}
                    />
                  </View>
                  {theme.examples[0] ? (
                    <Text style={styles.themeExample}>
                      &quot;{theme.examples[0].slice(0, 160)}&quot;
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {/* Problemas criticos */}
          {result.criticalIssues.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Problemas criticos</Text>
              {result.criticalIssues.map((issue, i) => (
                <View key={i} style={styles.issueCard} wrap={false}>
                  <Text style={styles.issueNum}>!</Text>
                  <Text style={styles.issueText}>{issue}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Recomendacoes */}
          {result.recommendations.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recomendacoes</Text>
              {result.recommendations.map((rec, i) => (
                <View key={i} style={styles.recRow} wrap={false}>
                  <Text style={styles.recNum}>{i + 1}</Text>
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* CTA */}
          <View style={styles.cta} wrap={false}>
            <Text style={styles.ctaTitle}>Pronto para resolver isso?</Text>
            <Text style={styles.ctaText}>
              O Reputamax automatiza o pedido de avaliacoes a todos os clientes,
              responde tudo com IA e te alerta sobre notas baixas na hora - tudo que
              este relatorio recomenda. 14 dias gratis, sem cartao. reputamax.app
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Reputamax - Gestao de reputacao para negocios locais</Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
