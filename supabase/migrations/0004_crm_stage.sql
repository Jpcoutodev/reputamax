-- Reputamax — fase manual no CRM (v4)
-- Execute no SQL Editor do Supabase (depois da 0003).

-- Fase definida manualmente pelo admin no CRM.
-- NULL = fase automática (derivada de lead_email / converted_business_id).
-- Valores: diagnostico | lead | contatado | negociacao | cliente | perdido
alter table diagnostics add column crm_stage text;
