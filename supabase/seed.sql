with seeded as (
  insert into public.wine_references
    (domain, cuvee, appellation, region, country, color, grape_varieties, source, review_status, confidence_score)
  values
    ('Château Poujeaux', 'Grand vin', 'Moulis-en-Médoc', 'Bordeaux', 'France', 'Rouge', array['Cabernet Sauvignon', 'Merlot', 'Petit Verdot'], 'seed', 'verified', 0.95),
    ('Domaine Leflaive', 'Bourgogne Blanc', 'Bourgogne', 'Bourgogne', 'France', 'Blanc', array['Chardonnay'], 'seed', 'verified', 0.95),
    ('Champagne Billecart-Salmon', 'Brut Réserve', 'Champagne', 'Champagne', 'France', 'Effervescent', array['Pinot Noir', 'Chardonnay', 'Meunier'], 'seed', 'verified', 0.94),
    ('Domaine Tempier', 'La Migoua', 'Bandol', 'Provence', 'France', 'Rouge', array['Mourvèdre', 'Grenache', 'Cinsault'], 'seed', 'verified', 0.93),
    ('Clos Rougeard', 'Les Poyeux', 'Saumur-Champigny', 'Loire', 'France', 'Rouge', array['Cabernet Franc'], 'seed', 'verified', 0.94),
    ('Domaine Huet', 'Le Mont Demi-Sec', 'Vouvray', 'Loire', 'France', 'Blanc', array['Chenin Blanc'], 'seed', 'verified', 0.93),
    ('Château d’Yquem', 'Sauternes', 'Sauternes', 'Bordeaux', 'France', 'Liquoreux', array['Sémillon', 'Sauvignon Blanc'], 'seed', 'verified', 0.96),
    ('Ott', 'Clos Mireille Rosé', 'Côtes de Provence', 'Provence', 'France', 'Rose', array['Grenache', 'Cinsault', 'Syrah'], 'seed', 'verified', 0.90)
  on conflict (reference_key) do update
    set color = excluded.color,
        grape_varieties = excluded.grape_varieties,
        review_status = 'verified',
        confidence_score = greatest(public.wine_references.confidence_score, excluded.confidence_score),
        updated_at = now()
  returning id, domain, cuvee
),
vintages(domain, cuvee, vintage, drink_from, drink_to, estimated_value) as (
  values
    ('Château Poujeaux', 'Grand vin', 2016, 2022, 2032, 40.00),
    ('Domaine Leflaive', 'Bourgogne Blanc', 2020, 2024, 2028, 52.00),
    ('Champagne Billecart-Salmon', 'Brut Réserve', 2024, 2024, 2027, 49.00),
    ('Domaine Tempier', 'La Migoua', 2019, 2025, 2034, 46.00),
    ('Clos Rougeard', 'Les Poyeux', 2017, 2026, 2037, 260.00),
    ('Domaine Huet', 'Le Mont Demi-Sec', 2018, 2023, 2035, 58.00),
    ('Château d’Yquem', 'Sauternes', 2011, 2025, 2060, 420.00),
    ('Ott', 'Clos Mireille Rosé', 2023, 2024, 2027, 32.00)
)
insert into public.wine_vintages
  (reference_id, vintage, drink_from, drink_to, estimated_value)
select seeded.id, vintages.vintage, vintages.drink_from, vintages.drink_to, vintages.estimated_value
from seeded
join vintages using (domain, cuvee)
on conflict (reference_id, vintage) do update
  set drink_from = excluded.drink_from,
      drink_to = excluded.drink_to,
      estimated_value = excluded.estimated_value,
      updated_at = now();
