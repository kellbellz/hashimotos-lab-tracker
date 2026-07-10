import { MARKERS } from '../data/markers.js';
import { amz } from '../data/affiliateConfig.js';

export const STATUS = {
  CRITICAL: 'critical',
  CONCERN: 'concern',
  OPTIMAL: 'optimal',
  UNKNOWN: 'unknown',
};

export function analyzeMarker(marker, value, optimalOverride) {
  if (value === null || value === undefined || value === '') {
    return { status: STATUS.UNKNOWN, direction: null, message: null };
  }

  const num = parseFloat(value);
  if (isNaN(num)) return { status: STATUS.UNKNOWN, direction: null, message: null };

  const { standard } = marker;
  const optimal = optimalOverride || marker.optimal;

  if (standard.low !== undefined && num < standard.low) {
    return { status: STATUS.CRITICAL, direction: 'low', message: marker.lowConcern };
  }
  if (standard.high !== undefined && num > standard.high) {
    return { status: STATUS.CRITICAL, direction: 'high', message: marker.highConcern };
  }
  if (optimal) {
    if (optimal.low !== undefined && num < optimal.low) {
      return { status: STATUS.CONCERN, direction: 'low', message: marker.lowConcern };
    }
    if (optimal.high !== undefined && num > optimal.high) {
      return { status: STATUS.CONCERN, direction: 'high', message: marker.highConcern };
    }
  }

  return { status: STATUS.OPTIMAL, direction: null, message: null };
}

function getActiveMarkers(perspective) {
  if (!perspective || perspective.id === 'hashimotos') {
    return MARKERS.filter(m => !m.perspectiveOnly || m.perspectiveOnly.length === 0);
  }
  return MARKERS.filter(m => {
    if (!m.perspectiveOnly || m.perspectiveOnly.length === 0) return true;
    return m.perspectiveOnly.includes(perspective.id);
  });
}

export function analyzeAllMarkers(values, perspective) {
  const results = [];
  const activeMarkers = getActiveMarkers(perspective);
  for (const marker of activeMarkers) {
    const value = values[marker.id];
    if (value === null || value === undefined || value === '') continue;
    const optimalOverride = perspective?.optimalOverrides?.[marker.id];
    const analysis = analyzeMarker(marker, value, optimalOverride);
    results.push({ marker, value: parseFloat(value), ...analysis });
  }
  return results;
}

// Round to 3 significant figures for display
function r(n) {
  return parseFloat(n.toPrecision(3));
}

export function generateTakeaways(results, perspective) {
  const takeaways = [];

  const get = (id) => results.find(r => r.marker.id === id);
  const tsh      = get('tsh');
  const ft4      = get('ft4');
  const ft3      = get('ft3');
  const rt3      = get('rt3');
  const tpoAb    = get('tpo_ab');
  const tgAb     = get('tg_ab');
  const vitd     = get('vitd');
  const ferritin = get('ferritin');
  const b12      = get('b12');
  const crp      = get('crp');

  const critical = results.filter(r => r.status === STATUS.CRITICAL);
  const concerns = results.filter(r => r.status === STATUS.CONCERN);

  const isFertility      = perspective?.id === 'fertility';
  const isPcos           = perspective?.id === 'pcos';
  const isUndiagnosed    = perspective?.id === 'undiagnosed';
  const isMenopause      = perspective?.id === 'menopause';
  const isPostmenopause  = perspective?.id === 'postmenopause';
  const isAnyMenopause   = isMenopause || isPostmenopause;

  // ─── Undiagnosed perspective ─────────────────────────────────────────────────
  if (isUndiagnosed) {
    // If antibodies are elevated: lead with diagnostic framing
    if (tpoAb && (tpoAb.status === STATUS.CRITICAL || tpoAb.status === STATUS.CONCERN)) {
      takeaways.push({
        priority: 'high',
        icon: '🔍',
        title: `TPO Antibodies Are ${r(tpoAb.value)} - This Strongly Suggests Hashimoto's`,
        detail: `Elevated TPO antibodies are the defining marker of Hashimoto's thyroiditis - they confirm your immune system is producing antibodies that attack your own thyroid. This result doesn't mean you're dangerously ill, but it is a significant finding that deserves a real conversation with your doctor. What to do: (1) Book an appointment and say these words: "I have elevated TPO antibodies and I'd like to understand if I have Hashimoto's." (2) Ask for a complete thyroid panel if you haven't had one: TSH, Free T3, Free T4, and Reverse T3. (3) Ask about a thyroid ultrasound - it can show the characteristic changes that Hashimoto's causes to thyroid tissue. (4) Know that early diagnosis means you can start making lifestyle changes (diet, Vitamin D, selenium) now, before more thyroid tissue is affected.`,
      });
    }

    if (tgAb && (tgAb.status === STATUS.CRITICAL || tgAb.status === STATUS.CONCERN)) {
      takeaways.push({
        priority: 'high',
        icon: '🔍',
        title: `TG Antibodies Are ${r(tgAb.value)} - Another Sign of Possible Hashimoto's`,
        detail: `Elevated TG (Thyroglobulin) antibodies are a second type of Hashimoto's antibody - they attack the protein your thyroid uses to make hormones. Some people have TG antibodies elevated without TPO antibodies, so it's important to test both. What to do: (1) Discuss this result specifically with your doctor - ask whether the combination of your thyroid hormone values and these antibodies points to Hashimoto's. (2) If you haven't had TPO antibodies tested, ask for that too - having both helps confirm the picture. (3) Ask for an ultrasound if your doctor hasn't ordered one yet.`,
      });
    }

    // If no antibodies tested: make it the top priority
    if (!tpoAb && !tgAb) {
      takeaways.push({
        priority: 'high',
        icon: '🔍',
        title: "The Test That Can Answer Your Question: TPO and TG Antibodies",
        detail: "TSH alone can't tell you whether you have Hashimoto's - it can look completely normal while Hashimoto's is actively damaging your thyroid. The tests that actually diagnose it are TPO antibodies (Anti-Thyroid Peroxidase) and TG antibodies (Anti-Thyroglobulin). Many doctors don't order these automatically. You may need to ask: \"I've been reading about Hashimoto's and I'd like to be tested for TPO and thyroglobulin antibodies - can we add these to my next blood draw?\" Most labs can run both from a single blood sample.",
      });
    }

    // General Hashimoto's symptom education if TSH looks okay
    if ((!tsh || tsh.status === STATUS.OPTIMAL) && (!tpoAb || tpoAb.status === STATUS.OPTIMAL)) {
      takeaways.push({
        priority: 'medium',
        icon: '💡',
        title: "Normal Labs Don't Always Rule Out Hashimoto's",
        detail: "Hashimoto's is tricky - antibodies can be elevated for years, causing symptoms, before TSH or other hormone levels shift enough to be flagged as abnormal. If you're experiencing persistent fatigue, unexplained weight changes, brain fog, hair loss, feeling cold all the time, or mood shifts - even with 'normal' labs - it's worth specifically asking your doctor about Hashimoto's. Common symptoms that get dismissed: waking up exhausted after a full night's sleep, hair coming out in handfuls, feeling mentally slow or forgetful, and being sensitive to cold temperatures.",
      });
    }
  }

  // ─── TSH out of standard range ──────────────────────────────────────────────
  if (tsh && tsh.status === STATUS.CRITICAL && tsh.direction === 'high') {
    takeaways.push({
      priority: 'high',
      icon: '🚨',
      title: `TSH is ${r(tsh.value)} - Your Thyroid Is Struggling`,
      detail: `Your TSH of ${r(tsh.value)} is above the upper limit of 4.0, which means your thyroid isn't making enough hormone. Think of TSH like a distress signal - the higher it is, the louder your body is calling for help. What to do: (1) Call your doctor soon - don't wait for your next scheduled checkup. You likely need to start or increase thyroid medication. (2) Ask them to also check your Free T3 and Free T4 at the same time. (3) Write down your symptoms before the appointment so you don't forget anything.${isFertility ? ' (4) Make sure your doctor knows you are trying to conceive - the TSH target during fertility treatment is under 2.5, which requires a more aggressive medication adjustment.' : ''}`,
    });
  }

  if (tsh && tsh.status === STATUS.CRITICAL && tsh.direction === 'low') {
    takeaways.push({
      priority: 'high',
      icon: '⚠️',
      title: `TSH is ${r(tsh.value)} - You May Be Taking Too Much Thyroid Medication`,
      detail: `Your TSH of ${r(tsh.value)} is below the lower limit of 0.4, which can mean you're getting more thyroid hormone than your body needs. Too much thyroid hormone over time can cause bone loss and an irregular heartbeat. What to do: (1) Contact your doctor to review your current medication dose. (2) Watch for signs: a racing heart, feeling hot when others aren't, anxiety, shaking hands, or unexplained weight loss. (3) Ask for a follow-up TSH test 6–8 weeks after any dose change.`,
    });
  }

  // TSH concern - fertility perspective gets its own version
  if (tsh && tsh.status === STATUS.CONCERN && tsh.direction === 'high') {
    if (isFertility) {
      takeaways.push({
        priority: 'high',
        icon: '🌱',
        title: `TSH is ${r(tsh.value)} - This Needs to Be Under 2.5 Before Trying to Conceive`,
        detail: `When trying to get pregnant, most fertility specialists recommend getting TSH below 2.5 - and ideally between 0.5 and 2.0. A TSH of ${r(tsh.value)} raises the risk of miscarriage, especially in the first trimester when the baby depends completely on your thyroid hormone before its own thyroid develops. Many regular doctors won't treat TSH under 4.0, but fertility guidelines are stricter. What to do: (1) Tell your doctor specifically that you are trying to conceive - those words change the target range they should aim for. (2) Ask about a small dose increase to get TSH under 2.5 before trying. (3) Ask for Free T4 and Free T3 to be tested alongside TSH.`,
      });
    } else {
      takeaways.push({
        priority: 'medium',
        icon: '📈',
        title: `TSH is ${r(tsh.value)} - Normal on Paper, But Not Ideal for Hashimoto's`,
        detail: `Your TSH of ${r(tsh.value)} falls within the standard "normal" range (under 4.0), but most Hashimoto's specialists aim for 1.0–2.5. Many people feel their best when TSH is between 1 and 2. What to do: (1) Bring this up at your next doctor's appointment - especially if you're still feeling tired, foggy, or gaining weight despite being on medication. (2) Write down your symptoms beforehand. A TSH between 2.5 and 4.0 combined with ongoing symptoms is a reasonable reason to ask about a small dose adjustment.`,
      });
    }
  }

  // ─── T4→T3 Conversion pattern ────────────────────────────────────────────────
  if (
    ft3 && (ft3.status === STATUS.CRITICAL || ft3.status === STATUS.CONCERN) &&
    ft4 && (ft4.status === STATUS.OPTIMAL || ft4.status === STATUS.CONCERN) &&
    tsh && (tsh.status === STATUS.OPTIMAL || tsh.status === STATUS.CONCERN)
  ) {
    takeaways.push({
      priority: 'high',
      icon: '🔄',
      title: `Free T3 is ${r(ft3.value)} - Your Body May Not Be Converting Thyroid Hormone Properly`,
      detail: `Your TSH (${r(tsh.value)}) and Free T4 (${r(ft4.value)}) look okay, but your Free T3 of ${r(ft3.value)} is lower than it should be (target: ${ft3.marker.optimal.low}+). Here's what's happening: T4 is a "storage" hormone your body needs to convert into T3, which is the form your cells actually run on. This pattern suggests the conversion isn't working well. This is very common in Hashimoto's and is often why people still feel awful even when their doctor says their labs look fine. What to do: (1) Ask your doctor about adding T3 medication directly (it's called liothyronine or Cytomel), or switching to a natural thyroid medication like Armour Thyroid that already contains both hormones. (2) Make sure your selenium, ferritin, and zinc levels are good - your body needs these to make the conversion. (3) Don't eat too little - severe calorie restriction slows down this conversion.`,
    });
  }

  // ─── Elevated TPO Antibodies ─────────────────────────────────────────────────
  if (tpoAb && (tpoAb.status === STATUS.CRITICAL || tpoAb.status === STATUS.CONCERN) && !isUndiagnosed) {
    const xAboveOptimal = (tpoAb.value / 9).toFixed(1);
    const severity = tpoAb.status === STATUS.CRITICAL ? 'well above' : 'above';

    if (isFertility) {
      takeaways.push({
        priority: 'high',
        icon: '⚠️',
        title: `TPO Antibodies Are ${r(tpoAb.value)} - This Is a Miscarriage Risk Factor`,
        detail: `High TPO antibodies significantly increase the risk of miscarriage and preterm birth - even when your thyroid function looks normal on paper. The antibodies cause inflammation that can interfere with implantation and early pregnancy. This is one of the most important things to address before trying to conceive. What to do: (1) Tell your OB about this number and ask whether your TSH target should be under 1.5 during pregnancy. (2) Work on lowering antibodies now: selenium 200 mcg/day (look for "selenomethionine" on the label), strict gluten-free diet, and getting Vitamin D to 60–80 ng/mL. (3) Ask your doctor about low-dose levothyroxine - some studies show treating even mild thyroid issues in women with elevated TPO antibodies reduces miscarriage risk. (4) Once pregnant, ask for your thyroid to be checked every 4–6 weeks - antibodies can shift rapidly during pregnancy.`,
      });
    } else {
      takeaways.push({
        priority: 'high',
        icon: '🛡️',
        title: `TPO Antibodies are ${r(tpoAb.value)} - Your Immune System Is Attacking Your Thyroid`,
        detail: `Your TPO antibodies of ${r(tpoAb.value)} IU/mL are ${severity} the standard limit of 34 (and ${xAboveOptimal}× the ideal level of 9). These antibodies are your immune system mistakenly attacking your own thyroid tissue - the higher the number, the more active the attack. Steps that have been shown to lower antibody levels: (1) Take selenium 200 mcg/day - look for "selenomethionine" on the label, not selenite. Studies show this can cut antibody levels in half within 3 months. (2) Cut out gluten completely for at least 3 months - not just "less gluten," but fully gluten-free. Many people see a big drop in antibodies from this alone. (3) Get your Vitamin D up to 50–80 ng/mL - low Vitamin D directly makes the immune attack worse. (4) Ask your doctor about a medication called Low Dose Naltrexone (LDN) - it's showing promise for calming autoimmune conditions. (5) Retest your antibodies in 3–6 months to see if these changes are working.`,
      });
    }
  }

  // ─── Elevated TG Antibodies ───────────────────────────────────────────────────
  if (tgAb && (tgAb.status === STATUS.CRITICAL || tgAb.status === STATUS.CONCERN) && !isUndiagnosed) {
    takeaways.push({
      priority: 'high',
      icon: '🛡️',
      title: `TG Antibodies are ${r(tgAb.value)} - Autoimmune Attack on Your Thyroid Confirmed`,
      detail: `Your TG antibodies of ${r(tgAb.value)} IU/mL are above the normal range. These are a second type of antibody that attack a different part of your thyroid - the protein it uses to make hormone. This confirms your immune system is actively damaging your thyroid tissue. What to do: (1) Follow the same steps as for TPO antibodies: selenium, cutting out gluten, and getting your Vitamin D up. (2) Ask your doctor whether your other autoimmune markers should be checked - elevated TG antibodies sometimes appear alongside other autoimmune conditions. (3) Retest in 3–6 months after making changes.${isFertility ? ' (4) Tell your OB about your TG antibodies before conceiving - these raise miscarriage risk and your thyroid should be monitored closely once pregnant.' : ''}`,
    });
  }

  // ─── Antibody + Low Vitamin D connection ─────────────────────────────────────
  const hasHighAntibodies = (tpoAb && tpoAb.status !== STATUS.OPTIMAL) || (tgAb && tgAb.status !== STATUS.OPTIMAL);
  if (hasHighAntibodies && vitd && (vitd.status === STATUS.CRITICAL || vitd.status === STATUS.CONCERN)) {
    const targetRange = isFertility ? '60–80' : '50–80';
    const dose = vitd.value < 30 ? '5,000–10,000' : '2,000–5,000';
    takeaways.push({
      priority: 'high',
      icon: '🔗',
      title: `Low Vitamin D + High Antibodies - These Two Are Connected`,
      detail: `Your Vitamin D of ${r(vitd.value)} ng/mL and your high antibodies aren't separate problems - Vitamin D is one of the main things that tells your immune system to calm down. Research shows that getting Vitamin D up to the ${targetRange} range can actually lower your antibody levels. What to do: (1) Start a Vitamin D3 supplement combined with K2 - for your level, a good starting dose is ${dose} IU of D3 per day, paired with 100–200 mcg of K2. Always take D3 with K2 - K2 makes sure the calcium goes to your bones, not your arteries. (2) Take it with a meal that has some fat in it - Vitamin D absorbs much better that way. (3) Retest your Vitamin D in 8–12 weeks and adjust until you land in the ${targetRange} range.`,
    });
  } else if (vitd && (vitd.status === STATUS.CRITICAL || vitd.status === STATUS.CONCERN)) {
    const targetRange = isFertility ? '60–80' : '50–80';
    const dose = vitd.value < 30 ? '5,000–10,000' : '2,000–5,000';
    takeaways.push({
      priority: isFertility ? 'high' : 'medium',
      icon: '☀️',
      title: isFertility
        ? `Vitamin D is ${r(vitd.value)} - Should Be 60–80 ng/mL Before Conceiving`
        : `Vitamin D is ${r(vitd.value)} - Too Low for Good Immune Health`,
      detail: isFertility
        ? `Vitamin D plays a direct role in fertility - it helps with implantation, supports healthy fetal development, and reduces miscarriage risk. For trying to conceive, the target is higher: 60–80 ng/mL. Low Vitamin D also worsens TPO antibody activity. What to do: (1) Start Vitamin D3 + K2 - at your level, a good dose is ${dose} IU of D3 per day with 100–200 mcg of K2. (2) Take with a meal containing fat. (3) Retest in 8 weeks and adjust until you're in the 60–80 range before trying.`
        : `Your Vitamin D of ${r(vitd.value)} ng/mL is below the ideal 50–80 range for Hashimoto's. Low Vitamin D makes it harder for your immune system to regulate itself and is linked to worse symptoms. What to do: (1) Start a Vitamin D3 + K2 supplement - a good starting dose for your level is ${dose} IU of D3 per day with 100–200 mcg of K2. (2) Take it with a meal that contains fat - Vitamin D needs fat to absorb properly. (3) Retest in 8–12 weeks. Don't stop at just "above 30" - aim for 50–80.`,
    });
  }

  // ─── Low Ferritin ─────────────────────────────────────────────────────────────
  if (ferritin && (ferritin.status === STATUS.CRITICAL || ferritin.status === STATUS.CONCERN)) {
    const isVeryLow = ferritin.status === STATUS.CRITICAL;
    if (isFertility) {
      takeaways.push({
        priority: 'high',
        icon: '🩸',
        title: `Ferritin is ${r(ferritin.value)} - Needs to Be 90+ Before Pregnancy`,
        detail: `For trying to conceive, ferritin should be at least 90 ng/mL - ideally 100+. Pregnancy doubles your iron requirements starting in the first trimester, and going in iron-depleted leads to severe fatigue, increased miscarriage risk, low birth weight, and very difficult postpartum recovery. What to do: (1) Start building iron stores now - don't wait until you're pregnant. Look for "iron bisglycinate" (a gentler form that won't upset your stomach like regular iron pills). (2) Take it with Vitamin C and at least 4 hours away from your thyroid medication. (3) Retest every 2–3 months until you reach 90+.`,
      });
    } else {
      takeaways.push({
        priority: ferritin.status === STATUS.CRITICAL ? 'high' : 'medium',
        icon: '🩸',
        title: `Ferritin is ${r(ferritin.value)} - Your Iron Stores Are ${isVeryLow ? 'Very' : 'Too'} Low`,
        detail: `Your ferritin of ${r(ferritin.value)} ng/mL is below the 70–90 level your thyroid needs to work properly. Ferritin measures how much iron your body has stored - and low iron is one of the most common and overlooked reasons people with Hashimoto's still feel exhausted, lose hair, and have brain fog, even when their other labs look okay. It also makes it harder for your body to convert thyroid hormone into the usable form. What to do: (1) Ask your doctor about an iron supplement - look for "iron bisglycinate," which is a gentler form that won't upset your stomach the way regular iron pills can. (2) Take your iron with Vitamin C (a glass of orange juice or a 500 mg Vitamin C tablet) - it helps your body absorb significantly more iron. (3) Take iron at least 4 hours away from your thyroid medication - iron blocks thyroid hormone from being absorbed. (4) Skip calcium supplements, antacids, and coffee for at least 2 hours after taking iron. (5) Retest your ferritin every 3 months until it reaches 70–100.`,
      });
    }
  }

  // ─── Low B12 ──────────────────────────────────────────────────────────────────
  if (b12 && (b12.status === STATUS.CRITICAL || b12.status === STATUS.CONCERN)) {
    takeaways.push({
      priority: b12.status === STATUS.CRITICAL ? 'high' : 'medium',
      icon: '⚡',
      title: `Vitamin B12 is ${r(b12.value)} - Below the Level Your Body Needs`,
      detail: `Your B12 of ${r(b12.value)} pg/mL is below the ideal 500 level for protecting your nerves and energy. People with Hashimoto's tend to be low in B12 because the same autoimmune process can affect how well your stomach absorbs it. Low B12 causes fatigue, brain fog, tingling or numbness in hands and feet, and mood problems - which all look a lot like Hashimoto's symptoms, making it easy to miss. What to do: (1) Get a B12 supplement, but make sure it says "methylcobalamin" on the label - not "cyanocobalamin." The methylcobalamin form is ready for your body to use right away. (2) Place the tablet under your tongue and let it dissolve - this gets it into your bloodstream directly, without needing your stomach to absorb it. Take 1,000 mcg per day. (3) If your B12 stays low even after months of supplements, ask your doctor about B12 injections and whether your stomach might have trouble absorbing B12. (4) Retest in 3 months. Aim for 500–900.${isFertility ? ' Note: B12 and folate work together for a healthy pregnancy - make sure both are in good range.' : ''}`,
    });
  }

  // ─── Reverse T3 ───────────────────────────────────────────────────────────────
  // Only flag high RT3 - low RT3 is clinically favorable (good T4→T3 conversion).
  if (rt3 && rt3.direction === 'high' && (rt3.status === STATUS.CRITICAL || rt3.status === STATUS.CONCERN)) {
    const ratio = ft3 ? (ft3.value / rt3.value).toFixed(2) : null;
    const ratioOk = ratio ? parseFloat(ratio) >= 0.2 : null;
    takeaways.push({
      priority: 'medium',
      icon: '🚫',
      title: `Reverse T3 is ${r(rt3.value)} - Your Thyroid Hormone Is Being Blocked`,
      detail: `Your Reverse T3 of ${r(rt3.value)} is above the ideal level of 15. Think of Reverse T3 as a "dummy key" - it fits into the same lock as your active thyroid hormone (T3) but doesn't actually open the door. When Reverse T3 is high, it blocks your real T3 from working, leaving you feeling hypothyroid even when other numbers look fine.${ratio ? ` Your Free T3 to Reverse T3 ratio is ${ratio} - ideally this should be above 0.20, so yours is ${ratioOk ? 'just within range' : 'below where it should be'}.` : ''} Common causes: ongoing stress, inflammation, low iron stores, or eating too little. What to do: (1) Consider a home stress hormone (cortisol) test - high cortisol is one of the biggest drivers of high Reverse T3. Ask your doctor about a home saliva test where you collect samples 4 times in one day. (2) Make sure your ferritin is above 70 - low iron raises Reverse T3. (3) If you're only on levothyroxine (T4-only medication), ask your doctor about adding T3 or switching to a natural thyroid medication. (4) Don't cut calories too severely - this directly raises Reverse T3.`,
    });
  }

  // ─── Elevated CRP ─────────────────────────────────────────────────────────────
  if (crp && (crp.status === STATUS.CRITICAL || crp.status === STATUS.CONCERN)) {
    const highRisk = crp.value > 3.0;
    takeaways.push({
      priority: crp.status === STATUS.CRITICAL ? 'high' : 'medium',
      icon: '🔥',
      title: `Inflammation Marker (CRP) is ${r(crp.value)} - Your Body Is Inflamed`,
      detail: `Your CRP of ${r(crp.value)} mg/L is ${highRisk ? 'in the high-risk range (above 3.0)' : 'above the ideal level of 1.0'}. CRP is a protein your body makes when it's inflamed - and ongoing inflammation makes your immune system more aggressive, raises your antibody levels, and makes it harder to convert thyroid hormone.${isFertility ? ' Inflammation also interferes with implantation and early pregnancy.' : ''} What to do: (1) Remove the biggest food triggers first: cut out gluten and dairy completely for at least 3 months. These two foods are the most common drivers of inflammation in Hashimoto's. (2) Add omega-3 fish oil - 2 to 3 grams per day. This is one of the most studied natural anti-inflammatories. (3) Try a turmeric/curcumin supplement - make sure the label says it contains black pepper extract, which helps your body absorb it. Take 500 mg twice a day. (4) Protect your sleep - even one bad night raises CRP measurably. Aim for 7–9 hours. (5) Ask your doctor to check for hidden gut infections like H. pylori (a stomach bacteria) - these are a very common but often overlooked cause of high CRP in Hashimoto's. (6) Retest CRP in 3 months to see if it's coming down.`,
    });
  }

  // ─── PCOS-specific takeaways ─────────────────────────────────────────────────
  if (isPcos) {
    const fastingInsulin = get('fasting_insulin');
    const freeTesto      = get('free_testosterone');
    const dheas          = get('dheas');
    const shbg           = get('shbg');
    const hba1c          = get('hba1c');

    if (fastingInsulin && (fastingInsulin.status === STATUS.CRITICAL || fastingInsulin.status === STATUS.CONCERN)) {
      takeaways.push({
        priority: 'high',
        icon: '📊',
        title: `Fasting Insulin is ${r(fastingInsulin.value)} - Insulin Resistance Is Likely Driving Your PCOS`,
        detail: `Your fasting insulin of ${r(fastingInsulin.value)} uIU/mL is above the ideal level of 8. Insulin resistance is the core problem in most PCOS cases - when insulin is too high, it signals your ovaries to make more testosterone, which disrupts ovulation, causes acne and hair changes, and makes weight loss much harder. Combined with Hashimoto's, high insulin also drives more inflammation. What to do: (1) Start myo-inositol + d-chiro-inositol (often sold as a 40:1 blend) - this supplement has been well-studied for PCOS and works similarly to metformin without the side effects. A common dose is 2,000–4,000 mg per day. (2) Cut out refined carbs and added sugar - white bread, white rice, sweets, and juice are the biggest blood sugar drivers. (3) Add protein to every meal - it blunts the blood sugar spike from carbs. (4) Walk for 10 minutes after meals - even a short walk after eating significantly reduces insulin spikes.`,
      });
    }

    if (hba1c && (hba1c.status === STATUS.CRITICAL || hba1c.status === STATUS.CONCERN)) {
      takeaways.push({
        priority: hba1c.status === STATUS.CRITICAL ? 'high' : 'medium',
        icon: '🍬',
        title: `HbA1c is ${r(hba1c.value)}% - Your 3-Month Blood Sugar Average Is Too High`,
        detail: `Your HbA1c of ${r(hba1c.value)}% shows that your blood sugar has been running higher than ideal over the past 3 months. This feeds insulin resistance, which drives PCOS hormones up and worsens Hashimoto's inflammation - it's a feedback loop. What to do: (1) Swap refined carbs for whole foods - brown rice instead of white, vegetables instead of bread where you can. (2) Never eat carbs alone - always pair them with protein or fat to slow the blood sugar rise. (3) Consider myo-inositol (2,000–4,000 mg/day) - it directly improves how your cells respond to insulin. (4) Ask your doctor whether your level warrants a prescription - at ${r(hba1c.value)}%, it's worth a conversation. (5) Retest in 3 months.`,
      });
    }

    if (freeTesto && (freeTesto.status === STATUS.CRITICAL || freeTesto.status === STATUS.CONCERN)) {
      takeaways.push({
        priority: 'high',
        icon: '📉',
        title: `Free Testosterone is ${r(freeTesto.value)} - This Is Driving Your PCOS Symptoms`,
        detail: `Your free testosterone of ${r(freeTesto.value)} pg/mL is above the ideal of 2.2. This elevated testosterone is what drives the most visible PCOS symptoms - acne, extra facial or body hair, thinning hair on your scalp, and irregular periods. High insulin is the main thing pushing your testosterone up. What to do: (1) Reducing insulin (through diet, inositol supplementation, and exercise) is the most effective long-term approach. (2) Spearmint tea - 2 cups per day - has been shown in studies to lower androgen levels in women with PCOS. (3) Ask your doctor to also test your SHBG - low SHBG makes the same amount of testosterone cause more symptoms.`,
      });
    }

    if (shbg && shbg.status === STATUS.CONCERN && shbg.direction === 'low') {
      takeaways.push({
        priority: 'medium',
        icon: '🔓',
        title: `SHBG is ${r(shbg.value)} - More Free Hormones Are Active Than Your Numbers Suggest`,
        detail: `Your SHBG of ${r(shbg.value)} nmol/L is below the ideal range. SHBG is like a "cage" that holds sex hormones in your blood - when it's low, more testosterone (and other hormones) are free and active, even if your total testosterone number looks normal. Low SHBG is directly caused by high insulin. As you bring insulin levels down through diet and supplementation, SHBG naturally rises and hormone symptoms improve.`,
      });
    }

    if (dheas && (dheas.status === STATUS.CRITICAL || dheas.status === STATUS.CONCERN) && dheas.direction === 'high') {
      takeaways.push({
        priority: 'medium',
        icon: '😤',
        title: `DHEA-S is ${r(dheas.value)} - Your Adrenal Glands May Be the Source of Your Androgens`,
        detail: `Your elevated DHEA-S of ${r(dheas.value)} ug/dL suggests your adrenal glands - not your ovaries - may be producing too many androgens. This is called "adrenal PCOS" and it responds to different treatment. The most common cause is chronic stress and poor sleep. What to do: (1) Focus on stress reduction - this isn't optional. Cortisol directly tells your adrenal glands to produce more DHEA-S. (2) Prioritize 7–9 hours of sleep - even one week of poor sleep measurably raises adrenal androgens. (3) Tell your doctor specifically that your DHEA-S is elevated - this changes the treatment approach compared to ovarian PCOS.`,
      });
    }

    // Hashimoto's + PCOS amplification note
    const hasPcosResults = [fastingInsulin, freeTesto, shbg, hba1c, dheas].some(
      r => r && r.status !== STATUS.OPTIMAL && r.status !== STATUS.UNKNOWN
    );
    if (hasPcosResults && (tpoAb || tgAb || tsh)) {
      takeaways.push({
        priority: 'medium',
        icon: '🔁',
        title: "Hashimoto's and PCOS Amplify Each Other - Treating Both Together Matters",
        detail: "These two conditions share the same root problem: chronic inflammation and immune system imbalance. High insulin from PCOS drives more inflammation, which makes Hashimoto's worse. Thyroid dysfunction slows your metabolism, which makes insulin resistance worse. That's why people with both conditions often feel like they can't get either under control - they need to be treated together. Combining thyroid optimization with insulin management (diet, inositol, exercise) is far more effective than treating them separately.",
      });
    }
  }

  // ─── Fertility-specific takeaways ────────────────────────────────────────────
  if (isFertility) {
    const folate = get('folate');

    if (folate && (folate.status === STATUS.CRITICAL || folate.status === STATUS.CONCERN)) {
      takeaways.push({
        priority: 'high',
        icon: '🌿',
        title: `Folate is ${r(folate.value)} - Critical to Raise Before Conception`,
        detail: `Folate is one of the most important nutrients to have topped up before you get pregnant. The baby's neural tube (which becomes the brain and spinal cord) forms in the first 28 days - often before you even know you're pregnant. Low folate raises the risk of neural tube defects and early miscarriage. What to do: (1) Start a prenatal vitamin now - not when you get pregnant, now. (2) Look for one that says "methylfolate" or "5-MTHF" on the label, not just "folic acid." Methylfolate is already in the form your body can use. A lot of people have trouble converting regular folic acid - methylfolate bypasses this step. (3) Aim to get your levels up at least 3 months before trying to conceive. (4) Also make sure your B12 is good - folate and B12 work together.`,
      });
    }

    // Always suggest starting a prenatal in fertility mode
    if (!tpoAb && !tgAb) {
      takeaways.push({
        priority: 'high',
        icon: '🔬',
        title: 'Get TPO and TG Antibodies Tested Before Trying to Conceive',
        detail: "Thyroid antibodies should be checked before any pregnancy attempt - they're a significant miscarriage risk factor that many doctors don't routinely test. Ask specifically for \"TPO antibodies and TG antibodies\" at your next blood draw.",
      });
    }
  }

  // ─── General blood / cardiometabolic markers ─────────────────────────────────
  const hemoglobin = get('hemoglobin');
  const cholesterol = get('cholesterol_total');
  const triglycerides = get('triglycerides');
  const glucose = get('fasting_glucose');
  const alt = get('alt');

  if (hemoglobin && (hemoglobin.status === STATUS.CRITICAL || hemoglobin.status === STATUS.CONCERN)) {
    takeaways.push({
      priority: hemoglobin.status === STATUS.CRITICAL ? 'high' : 'medium',
      icon: '🩸',
      title: `Hemoglobin is ${r(hemoglobin.value)} - Anemia Can Mimic and Worsen Thyroid Symptoms`,
      detail: `Your hemoglobin of ${r(hemoglobin.value)} g/dL is below the ideal level. Anemia and low thyroid produce almost identical symptoms - fatigue, hair loss, brain fog, and feeling cold - which is why low hemoglobin often goes unnoticed in Hashimoto's patients. It also impairs the conversion of T4 to the active T3 hormone your body runs on. What to do: (1) Ask your doctor to check your ferritin (iron stores) and B12 - these are the two most common causes. (2) If iron-deficient: look for "iron bisglycinate" supplements, take with Vitamin C, and avoid taking within 4 hours of thyroid medication. (3) If B12-related: take methylcobalamin (not cyanocobalamin) dissolved under your tongue. (4) Retest in 2–3 months.`,
    });
  }

  if (cholesterol && (cholesterol.status === STATUS.CRITICAL || cholesterol.status === STATUS.CONCERN)) {
    takeaways.push({
      priority: 'medium',
      icon: '💛',
      title: `Total Cholesterol is ${r(cholesterol.value)} - Often a Sign of Undertreated Hypothyroidism`,
      detail: `Your total cholesterol of ${r(cholesterol.value)} mg/dL is above the ideal range. This is one of the most common - and overlooked - signs that your thyroid isn't optimized. Thyroid hormone directly controls the liver receptors that clear LDL from your bloodstream. When thyroid levels drop, cholesterol rises. Many people are prescribed cholesterol medication without first optimizing their thyroid. What to do: (1) If your TSH is above 2.5 or your Free T4/T3 are low, talk to your doctor about optimizing your thyroid medication first. (2) Add omega-3 fish oil (2–3 grams/day) - well-studied for lowering cholesterol. (3) Reduce refined carbs and trans fats. (4) Recheck cholesterol 3 months after any thyroid medication adjustment.`,
    });
  }

  if (triglycerides && (triglycerides.status === STATUS.CRITICAL || triglycerides.status === STATUS.CONCERN)) {
    takeaways.push({
      priority: 'medium',
      icon: '📈',
      title: `Triglycerides Are ${r(triglycerides.value)} - Elevated by Both Hypothyroidism and Insulin Resistance`,
      detail: `Your triglycerides of ${r(triglycerides.value)} mg/dL are above the ideal level of 100. Two of the most common causes are undertreated hypothyroidism (the thyroid regulates how your liver handles fat) and insulin resistance (excess sugar gets converted to triglycerides). In Hashimoto's, these often occur together. What to do: (1) Ask your doctor to check your thyroid levels and fasting insulin - both can drive this up. (2) Cut out refined carbs and added sugar - these are directly converted to triglycerides. (3) Add omega-3 fish oil (2–3 grams/day). (4) Even a 30-minute walk after your largest meal significantly reduces post-meal triglyceride spikes.${isPcos ? ' With PCOS, addressing insulin resistance with inositol supplementation can also help.' : ''}`,
    });
  }

  if (glucose && (glucose.status === STATUS.CRITICAL || glucose.status === STATUS.CONCERN)) {
    takeaways.push({
      priority: glucose.status === STATUS.CRITICAL ? 'high' : 'medium',
      icon: '🍬',
      title: `Fasting Glucose is ${r(glucose.value)} - Blood Sugar Is Running Higher Than Ideal`,
      detail: `Your fasting glucose of ${r(glucose.value)} mg/dL is above the optimal range of 85. Even mild blood sugar elevation drives chronic inflammation that worsens Hashimoto's antibody levels and makes insulin resistance worse over time. What to do: (1) Never eat carbohydrates alone - always pair them with protein, fat, or fiber to blunt the blood sugar rise. (2) Cut out the biggest spikes: white bread, white rice, juice, sweetened drinks, and processed snacks. (3) Walk for 10 minutes after your biggest meal - even a short walk dramatically lowers blood sugar spikes. (4) Ask your doctor to also check your HbA1c (3-month blood sugar average) and fasting insulin for a more complete picture.${isPcos ? ' With PCOS, myo-inositol (2,000–4,000 mg/day) can significantly improve insulin sensitivity.' : ''}`,
    });
  }

  if (alt && (alt.status === STATUS.CRITICAL || alt.status === STATUS.CONCERN)) {
    takeaways.push({
      priority: alt.status === STATUS.CRITICAL ? 'high' : 'medium',
      icon: '🫀',
      title: `Liver Enzyme (ALT) is ${r(alt.value)} - Thyroid Disease Affects Liver Function`,
      detail: `Your ALT of ${r(alt.value)} IU/L is above the optimal level of 25. The liver and thyroid are closely linked - hypothyroidism slows the liver's ability to process fats and can lead to non-alcoholic fatty liver disease (NAFLD), while high antibody levels drive systemic inflammation that strains liver cells. What to do: (1) Ask your doctor to check whether your thyroid levels are optimal - improving thyroid function often brings liver enzymes down. (2) Avoid alcohol and unnecessary over-the-counter pain relievers (especially acetaminophen) while ALT is elevated. (3) If you haven't had an abdominal ultrasound to check for fatty liver, it's worth asking. (4) An anti-inflammatory diet (low refined carbs, high vegetables, omega-3s) directly supports liver health.`,
    });
  }

  // ─── "Consider testing" prompts for missing key markers ──────────────────────
  if (tsh && !ft3) {
    takeaways.push({
      priority: 'medium',
      icon: '🔬',
      title: 'You Should Also Be Testing Free T3',
      detail: `You have a TSH result but no Free T3. This matters because TSH can look perfectly normal while your Free T3 - the hormone your body actually runs on - is too low. This is one of the most common reasons people with Hashimoto's still feel terrible even when their doctor says everything looks fine. At your next appointment, ask to add: Free T3, Free T4, and Reverse T3 to your blood work.`,
    });
  }

  if ((tsh || ft3 || ft4) && !tpoAb && !tgAb && !isFertility && !isUndiagnosed) {
    takeaways.push({
      priority: 'medium',
      icon: '🔬',
      title: "You Haven't Tested Your Thyroid Antibodies Yet",
      detail: "You have thyroid hormone results but no antibody numbers. Antibodies are what actually confirm whether your thyroid problem is autoimmune (Hashimoto's) and show how actively your immune system is attacking. Many doctors only check TSH and never look at antibodies, leaving the root cause undiagnosed. Ask your doctor specifically for: \"TPO antibodies and Thyroglobulin antibodies.\"",
    });
  }

  // ─── Multiple nutrient deficiencies compound each other ───────────────────────
  const lowNutrients = [ferritin, vitd, b12].filter(r => r && (r.status === STATUS.CRITICAL || r.status === STATUS.CONCERN));
  if (lowNutrients.length >= 2 && !takeaways.find(t => t.title.includes('Two Are Connected'))) {
    takeaways.push({
      priority: 'medium',
      icon: '🧩',
      title: `${lowNutrients.length} Nutrients Are Low - They Make Each Other Worse`,
      detail: `Your ${lowNutrients.map(r => r.marker.name).join(', ')} are all low - and these don't just cause problems separately, they pile on top of each other. Low ferritin makes it harder to convert thyroid hormone. Low Vitamin D makes your immune system more aggressive. Low B12 drains your energy and affects your brain. Fixing all of them at once - rather than one at a time - often leads to a noticeable improvement in how you feel, even before any thyroid medication changes.`,
    });
  }

  // ─── Perimenopause / Postmenopause ────────────────────────────────────────────
  if (isAnyMenopause) {
    const estradiol   = get('estradiol');
    const progesterone = get('progesterone');
    const fsh         = get('fsh');
    const cortisolAm  = get('cortisol_am');
    const dheas       = get('dheas');

    // Symptom overlap callout - always show when in a menopause perspective and
    // any thyroid marker is out of range, so the user understands the picture.
    const hasThyroidConcern = [tsh, ft3, ft4].some(
      m => m && (m.status === STATUS.CRITICAL || m.status === STATUS.CONCERN)
    );
    if (hasThyroidConcern || results.length >= 2) {
      takeaways.push({
        priority: 'high',
        icon: '🔄',
        title: 'Hashimoto\'s + Menopause: Separating Overlapping Symptoms',
        detail: `Hashimoto's and ${isMenopause ? 'perimenopause' : 'postmenopause'} share nearly identical symptoms - fatigue, brain fog, weight gain, mood changes, poor sleep, and joint pain. The problem is that standard thyroid tests may look "normal" while both conditions are actively causing symptoms. The key is tracking both thyroid and hormone markers together, which is what this perspective helps you do. If you're still feeling bad despite managed thyroid labs, declining estrogen is often the missing piece. What to do: (1) Bring both your thyroid labs and hormone labs to your doctor at the same time. (2) Ask specifically: "Are my remaining symptoms more likely from my thyroid or from my hormone levels?" (3) A functional medicine doctor or a menopause-trained OB-GYN can often see the full picture more clearly than a standard endocrinologist.`,
      });
    }

    // Rising / high FSH in perimenopause
    if (isMenopause && fsh && (fsh.status === STATUS.CRITICAL || fsh.status === STATUS.CONCERN)) {
      takeaways.push({
        priority: 'medium',
        icon: '📈',
        title: `FSH is ${r(fsh.value)} - Your Perimenopause Transition Is Underway`,
        detail: `Follicle Stimulating Hormone (FSH) rises as your ovaries begin producing less estrogen. An FSH above 10 on day 2–3 of your cycle is an early sign of perimenopause. FSH above 30 on two tests taken 60+ days apart officially confirms menopause. This result is not a warning - it's information about where you are in the transition. What it means for your thyroid: estrogen changes affect how thyroid hormone is bound and used in your body. Some women find their thyroid symptoms shift during this time even without changes to their medication dose. What to do: (1) Ask your doctor to track FSH and estradiol at the same time as your next thyroid panel. (2) If you're still having periods, testing on day 2–3 of your cycle gives the most consistent FSH baseline. (3) Note whether your symptoms change at different points in your cycle - this pattern is clinically useful.`,
      });
    }

    // Low estradiol (perimenopause) - missed estrogen contribution to symptoms
    if (isMenopause && estradiol && (estradiol.status === STATUS.CRITICAL || estradiol.status === STATUS.CONCERN) && estradiol.direction === 'low') {
      takeaways.push({
        priority: 'medium',
        icon: '📉',
        title: `Estradiol is Low at ${r(estradiol.value)} pg/mL - Estrogen Depletion Is Affecting Your Symptoms`,
        detail: `Your estradiol is below 50 pg/mL, which means you're spending significant time in an estrogen-deficient state. Low estrogen causes hot flashes, night sweats, poor sleep, brain fog, vaginal dryness, and joint pain - almost identical to hypothyroid symptoms. If your thyroid labs look managed but you still feel bad, low estrogen is often what's left. What to do: (1) Ask your doctor specifically about hormone therapy (HRT) - modern HRT is much safer than older formulations and is very effective for these symptoms. (2) There is growing evidence that bioidentical estradiol (the patch or gel form) may also help stabilize thyroid function during the transition. (3) Don't wait years to address this - early hormone support during perimenopause offers the most protective benefits for brain, bone, and heart health.`,
      });
    }

    // Low progesterone (perimenopause)
    if (isMenopause && progesterone && progesterone.direction === 'low' && (progesterone.status === STATUS.CRITICAL || progesterone.status === STATUS.CONCERN)) {
      takeaways.push({
        priority: 'medium',
        icon: '😴',
        title: `Progesterone is Low at ${r(progesterone.value)} ng/mL - The Sleep & Calm Hormone Is Dropping`,
        detail: `Progesterone is usually the first hormone to decline in perimenopause, often years before periods become irregular. It's the hormone that promotes sleep, reduces anxiety, and helps balance estrogen. When it drops, the result is insomnia, anxiety, irritability, and heavy periods - all of which can make thyroid symptoms significantly worse. Low progesterone also reduces cellular thyroid activity, meaning your thyroid medication may feel less effective. What to do: (1) Ask your doctor about bioidentical progesterone (not progestin - ask for "progesterone" by name, also called Prometrium). Taken at night, it has a natural sleep-promoting effect. (2) Testing progesterone on day 18–22 of your cycle (mid-luteal phase) gives the most meaningful result. (3) Improving progesterone often has a faster symptom impact than estrogen changes - many women notice better sleep within 2–3 weeks.`,
      });
    }

    // High morning cortisol in menopause
    if (isAnyMenopause && cortisolAm && cortisolAm.direction === 'high' && (cortisolAm.status === STATUS.CRITICAL || cortisolAm.status === STATUS.CONCERN)) {
      takeaways.push({
        priority: 'medium',
        icon: '⚡',
        title: `Morning Cortisol is High at ${r(cortisolAm.value)} mcg/dL - Stress Hormones Are Amplified`,
        detail: `Estrogen normally helps buffer the cortisol stress response. As estrogen declines, cortisol spikes become more intense and last longer. High cortisol directly suppresses thyroid function - it raises Reverse T3, lowers Free T3, and makes your cells less responsive to thyroid hormone. In other words, high cortisol can make your thyroid medication feel like it stopped working. What to do: (1) Prioritize sleep as a non-negotiable - cortisol spikes worsen dramatically with sleep deprivation, and poor sleep is often caused by dropping progesterone. (2) Avoid high-intensity exercise after 3 PM - this can spike cortisol at the wrong time. Morning strength training is better. (3) Ask your doctor about a 4-point saliva cortisol test to see your full daily cortisol rhythm. (4) Adaptogens like ashwagandha (check with your doctor first) can help blunt cortisol spikes.`,
      });
    }

    // Postmenopause bone health: low Vitamin D is more urgent
    if (isPostmenopause && vitd && (vitd.status === STATUS.CRITICAL || vitd.status === STATUS.CONCERN)) {
      takeaways.push({
        priority: 'high',
        icon: '🦴',
        title: `Vitamin D is ${r(vitd.value)} - Bone Loss Risk Is High Without Estrogen`,
        detail: `After menopause, estrogen no longer helps protect your bones - now Vitamin D becomes your most important bone-protecting tool. With Vitamin D at ${r(vitd.value)} ng/mL and no estrogen support, your bones are losing density faster than they're building it. This increases your fracture risk significantly. What to do: (1) Start a Vitamin D3 + K2 supplement - at your level, aim for 4,000–5,000 IU of D3 per day paired with 200 mcg of K2 MK-7. K2 is critical because it directs calcium to your bones instead of your arteries. (2) Ask your doctor about a bone density scan (DEXA scan) if you haven't had one - it's recommended for all women within 2 years of menopause. (3) Get your Vitamin D retested in 8–12 weeks. The target in postmenopause is 60–80 ng/mL. (4) Weight-bearing exercise (walking, strength training) is the other essential piece - even 20–30 minutes daily makes a measurable difference to bone density.`,
      });
    }

    // Postmenopause cardiovascular: cholesterol or glucose elevated
    const cholesterol = get('cholesterol_total');
    const glucose     = get('fasting_glucose');
    const hba1c       = get('hba1c');
    const hasCardioRisk = isPostmenopause && (
      (cholesterol && cholesterol.status !== STATUS.OPTIMAL) ||
      (glucose && glucose.status !== STATUS.OPTIMAL) ||
      (hba1c && hba1c.status !== STATUS.OPTIMAL)
    );
    if (hasCardioRisk) {
      const flagged = [cholesterol, glucose, hba1c].filter(m => m && m.status !== STATUS.OPTIMAL).map(m => m.marker.name);
      takeaways.push({
        priority: 'high',
        icon: '❤️',
        title: `Cardiovascular Risk Is Elevated: ${flagged.join(', ')} Need Attention`,
        detail: `Estrogen was protective for your heart - it kept cholesterol in a healthy ratio, reduced inflammation, and helped keep blood vessels flexible. After menopause, that protection is gone, and cardiovascular disease becomes the #1 health risk for women. Your ${flagged.join(' and ')} ${flagged.length > 1 ? 'are' : 'is'} outside the ideal range. Combined with Hashimoto's-related inflammation, this needs attention. What to do: (1) Ask your doctor for a full cardiovascular risk assessment - this includes LDL, HDL, triglycerides, blood pressure, and ideally a high-sensitivity CRP (hs-CRP). (2) A Mediterranean-style diet has the strongest evidence for cardiovascular protection after menopause - whole foods, olive oil, fish, vegetables, and minimal processed sugar. (3) If you haven't discussed hormone therapy, ask your doctor - starting HRT within 10 years of menopause (the "window of opportunity") has cardiovascular protective effects. (4) Exercise is as powerful as medication for cardiovascular risk - 150 minutes of moderate activity per week is the target.`,
      });
    }

    // Low DHEA-S in menopause/postmenopause
    if (isAnyMenopause && dheas && dheas.direction === 'low' && dheas.status !== STATUS.OPTIMAL) {
      takeaways.push({
        priority: 'medium',
        icon: '⚙️',
        title: `DHEA-S is Low at ${r(dheas.value)} - Adrenal Support May Help`,
        detail: `DHEA-S is a hormone made by your adrenal glands that declines naturally with age and accelerates around menopause. Low DHEA-S contributes to fatigue, poor immune function, low libido, and reduced muscle mass. In the context of Hashimoto's, low DHEA-S can worsen the immune imbalance that drives thyroid antibody attacks. What to do: (1) Ask your doctor about low-dose DHEA supplementation - this is one of the few hormones that can be safely supplemented based on lab results. (2) Do not self-supplement without testing, as too much DHEA can convert to testosterone and cause acne or hair changes. (3) Prioritize sleep and reduce high-intensity chronic stress - these are the biggest lifestyle drivers of DHEA decline. (4) Retest in 3–6 months after any intervention.`,
      });
    }
  }

  // ─── All optimal ──────────────────────────────────────────────────────────────
  if (critical.length === 0 && concerns.length === 0 && results.length > 0) {
    takeaways.push({
      priority: 'good',
      icon: '✅',
      title: 'Your Labs Look Well-Controlled - Keep It Up',
      detail: "All of your results are in the ideal range. That's genuinely great news. Keep checking in regularly - Hashimoto's can shift during stressful periods, illness, pregnancy, or major life changes. If you're on medication, retest every 6–12 months, or sooner if you start feeling off.",
    });
  }

  // Red (high) takeaways always surface first
  const priorityOrder = { high: 0, medium: 1, good: 2 };
  takeaways.sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));

  return takeaways;
}

// Generate the 3 most important concrete next steps from lab results.
export function generateTopActions(results, perspective) {
  const candidates = [];

  const get = (id) => results.find(r => r.marker.id === id);
  const tsh      = get('tsh');
  const ft3      = get('ft3');
  const ft4      = get('ft4');
  const rt3      = get('rt3');
  const tpoAb    = get('tpo_ab');
  const tgAb     = get('tg_ab');
  const vitd     = get('vitd');
  const ferritin = get('ferritin');
  const b12      = get('b12');
  const crp      = get('crp');

  const isFertility     = perspective?.id === 'fertility';
  const isPcos          = perspective?.id === 'pcos';
  const isUndiagnosed   = perspective?.id === 'undiagnosed';
  const isMenopause     = perspective?.id === 'menopause';
  const isPostmenopause = perspective?.id === 'postmenopause';
  const isAnyMenopause  = isMenopause || isPostmenopause;

  // ── Doctor / medication actions ─────────────────────────────────────────────
  if (tsh && tsh.status === STATUS.CRITICAL && tsh.direction === 'high') {
    candidates.push({
      weight: 100,
      label: 'Call Your Doctor',
      title: `Contact your doctor about your TSH of ${r(tsh.value)}`,
      detail: `A TSH above 4.0 requires prompt medical attention - you likely need to start or increase thyroid medication.${isFertility ? ' Tell them you are trying to conceive - this makes it even more urgent.' : ''}`,
    });
  }

  if (tsh && tsh.status === STATUS.CRITICAL && tsh.direction === 'low') {
    candidates.push({
      weight: 100,
      label: 'Call Your Doctor',
      title: `Contact your doctor about your TSH of ${r(tsh.value)}`,
      detail: 'TSH below 0.4 suggests over-medication - your doctor needs to review and likely reduce your dose.',
    });
  }

  // Fertility: TSH above 2.5 is high-priority even if not CRITICAL
  if (isFertility && tsh && tsh.value > 2.5 && tsh.status !== STATUS.CRITICAL) {
    candidates.push({
      weight: 98,
      label: 'Call Your Doctor',
      title: "Tell your doctor you're trying to conceive - TSH must be under 2.5",
      detail: `Your TSH of ${r(tsh.value)} is above the fertility target of 2.5. Say the words "I am trying to conceive" - this changes the treatment threshold your doctor should be working toward.`,
    });
  }

  if (
    ft3 && (ft3.status === STATUS.CRITICAL || ft3.status === STATUS.CONCERN) &&
    ft4 && ft4.status !== STATUS.CRITICAL &&
    tsh && tsh.status !== STATUS.CRITICAL
  ) {
    candidates.push({
      weight: 90,
      label: 'Ask Your Doctor',
      title: 'Ask your doctor about T3 medication at your next appointment',
      detail: `Your Free T3 of ${r(ft3.value)} suggests your body isn't converting thyroid hormone properly - ask about adding T3 medication (called liothyronine or Cytomel) or switching to a natural thyroid medication like Armour Thyroid.`,
    });
  }

  if (tsh && tsh.status === STATUS.CONCERN && tsh.direction === 'high' && !isFertility) {
    candidates.push({
      weight: 70,
      label: 'Ask Your Doctor',
      title: 'Ask your doctor about adjusting your medication dose',
      detail: `Your TSH of ${r(tsh.value)} is higher than the ideal range of 1–2.5 for Hashimoto's - bring a list of your symptoms and ask whether a small dose increase makes sense.`,
    });
  }

  if (tpoAb && tpoAb.status === STATUS.CRITICAL) {
    if (isFertility) {
      candidates.push({
        weight: 95,
        label: 'Ask Your Doctor',
        title: 'Ask your OB about TPO antibodies and miscarriage risk',
        detail: `High TPO antibodies are a significant miscarriage risk factor - ask your OB about monitoring your thyroid every 4–6 weeks once pregnant and whether low-dose thyroid medication before conception is appropriate.`,
      });
    } else {
      candidates.push({
        weight: 85,
        label: 'Ask Your Doctor',
        title: 'Ask your doctor about selenium and Low Dose Naltrexone (LDN)',
        detail: `With antibodies at ${r(tpoAb.value)}, ask your doctor to recommend a selenium supplement (200 mcg/day - look for "selenomethionine" on the label) and whether LDN might be right for you.`,
      });
    }
  }

  // ── Undiagnosed actions ─────────────────────────────────────────────────────
  if (isUndiagnosed) {
    if (!tpoAb && !tgAb) {
      candidates.push({
        weight: 100,
        label: 'Get Tested',
        title: 'Ask for TPO and TG antibody tests at your next blood draw',
        detail: "These two tests are the only way to confirm Hashimoto's - TSH alone can't tell you. Ask your doctor to add \"TPO antibodies and thyroglobulin antibodies\" to your next blood draw.",
      });
    }

    if (tpoAb && tpoAb.status !== STATUS.OPTIMAL) {
      candidates.push({
        weight: 98,
        label: 'Ask Your Doctor',
        title: "Tell your doctor about your elevated antibodies and ask about Hashimoto's",
        detail: `Your TPO antibodies of ${r(tpoAb.value)} are elevated - come prepared to ask: "Could I have Hashimoto's thyroiditis based on these results, and what should we do next?"`,
      });
      candidates.push({
        weight: 80,
        label: 'Ask Your Doctor',
        title: 'Ask for a thyroid ultrasound',
        detail: "An ultrasound can show the characteristic texture changes that Hashimoto's causes to thyroid tissue - it's painless and gives your doctor important diagnostic information.",
      });
    }

    if (tsh && (tsh.status === STATUS.CRITICAL || tsh.status === STATUS.CONCERN) && tsh.direction === 'high') {
      candidates.push({
        weight: 92,
        label: 'Ask Your Doctor',
        title: `Ask about Hashimoto's - your TSH of ${r(tsh.value)} is above the ideal range`,
        detail: "Hashimoto's is the most common reason TSH runs high in women. Ask specifically for TPO and TG antibody tests to confirm or rule it out.",
      });
    }

    if (tsh && !ft3) {
      candidates.push({
        weight: 85,
        label: 'Get Tested',
        title: 'Ask for a complete panel: Free T3, Free T4, and Reverse T3',
        detail: "TSH is just a screening test - Free T3, Free T4, and Reverse T3 show how well your thyroid is actually functioning. Many doctors only run TSH, but the full picture matters for diagnosis.",
      });
    }
  }

  // ── PCOS actions ────────────────────────────────────────────────────────────
  if (isPcos) {
    const fastingInsulin = get('fasting_insulin');
    const freeTesto      = get('free_testosterone');
    const hba1c          = get('hba1c');

    if (fastingInsulin && (fastingInsulin.status === STATUS.CRITICAL || fastingInsulin.status === STATUS.CONCERN)) {
      candidates.push({
        weight: 92,
        label: 'Start Today',
        title: 'Start myo-inositol + d-chiro-inositol (40:1 blend), 2,000–4,000 mg/day',
        detail: `Your fasting insulin of ${r(fastingInsulin.value)} points to insulin resistance - this supplement is the most studied natural treatment for PCOS and lowers insulin without side effects.`,
        products: [
          { role: 'Best quality', name: 'Ovasitol Inositol Powder (40:1 blend)', url: amz('ovasitol inositol powder 40:1') },
          { role: 'Best value', name: 'Wholesome Story Myo-Inositol + D-Chiro', url: amz('wholesome story myo inositol d-chiro inositol') },
        ],
      });
    }

    if (hba1c && (hba1c.status === STATUS.CRITICAL || hba1c.status === STATUS.CONCERN)) {
      candidates.push({
        weight: 88,
        label: 'Change Your Diet',
        title: 'Cut refined carbs and always eat protein with every meal',
        detail: `Your HbA1c of ${r(hba1c.value)}% shows blood sugar running high - removing white bread, white rice, and sugary drinks while adding protein to every meal is the fastest way to bring it down.`,
      });
    }

    if (freeTesto && (freeTesto.status === STATUS.CRITICAL || freeTesto.status === STATUS.CONCERN)) {
      candidates.push({
        weight: 75,
        label: 'Start Today',
        title: 'Drink 2 cups of spearmint tea daily to lower androgen levels',
        detail: `Your free testosterone of ${r(freeTesto.value)} is driving PCOS symptoms - studies show spearmint tea at this dose noticeably lowers androgens in women with PCOS within 30 days.`,
        products: [
          { role: 'Best quality', name: 'Traditional Medicinals Organic Spearmint Tea', url: amz('traditional medicinals organic spearmint tea') },
          { role: 'Best value', name: 'Bigelow Spearmint Herbal Tea', url: amz('bigelow spearmint herbal tea') },
        ],
      });
    }
  }

  // ── Fertility actions ───────────────────────────────────────────────────────
  if (isFertility) {
    const folate = get('folate');

    if (folate && (folate.status === STATUS.CRITICAL || folate.status === STATUS.CONCERN)) {
      candidates.push({
        weight: 92,
        label: 'Start Today',
        title: "Start a prenatal vitamin with methylfolate - not regular folic acid",
        detail: `Your folate is low and the baby's neural tube forms in the first 28 days of pregnancy. Start a prenatal with methylfolate (look for "5-MTHF" on the label) now - at least 3 months before trying.`,
        products: [
          { role: 'Best quality', name: 'Thorne Basic Prenatal (with methylfolate)', url: amz('thorne basic prenatal methylfolate') },
          { role: 'Best value', name: 'Garden of Life mykind Organics Prenatal', url: amz('garden of life mykind organics prenatal methylfolate') },
        ],
      });
    } else {
      candidates.push({
        weight: 78,
        label: 'Start Today',
        title: "Start a prenatal vitamin with methylfolate now - before you're pregnant",
        detail: "The baby's neural tube forms before most people know they're pregnant - start a prenatal with methylfolate (5-MTHF on the label, not just folic acid) at least 3 months before trying to conceive.",
        products: [
          { role: 'Best quality', name: 'Thorne Basic Prenatal (with methylfolate)', url: amz('thorne basic prenatal methylfolate') },
          { role: 'Best value', name: 'Garden of Life mykind Organics Prenatal', url: amz('garden of life mykind organics prenatal methylfolate') },
        ],
      });
    }
  }

  // ── High-leverage supplement actions ────────────────────────────────────────
  const vitdLow = vitd && (vitd.status === STATUS.CRITICAL || vitd.status === STATUS.CONCERN);
  const hasHighAb = (tpoAb && tpoAb.status !== STATUS.OPTIMAL) || (tgAb && tgAb.status !== STATUS.OPTIMAL);

  if (vitdLow && hasHighAb) {
    const dose = vitd.value < 30 ? '5,000–10,000 IU' : '2,000–5,000 IU';
    candidates.push({
      weight: 88,
      label: 'Start Today',
      title: `Start Vitamin D3 + K2 - ${dose} D3 with 100–200 mcg K2 daily`,
      detail: `Your Vitamin D of ${r(vitd.value)} combined with high antibodies is the most impactful thing you can fix right now - getting your Vitamin D up directly lowers antibody levels. Take it with a meal that has some fat in it.`,
      products: [
        { role: 'Best quality', name: 'Thorne Vitamin D/K2 Liquid', url: amz('thorne vitamin d k2 liquid') },
        { role: 'Best value', name: 'NatureWise Vitamin D3+K2 2000IU', url: amz('naturewise vitamin d3 k2 supplement') },
      ],
    });
  } else if (vitdLow) {
    const dose = vitd.value < 30 ? '5,000–10,000 IU' : '2,000–5,000 IU';
    candidates.push({
      weight: isFertility ? 85 : 72,
      label: 'Start Today',
      title: `Start Vitamin D3 + K2 - ${dose} D3 with 100–200 mcg K2 daily`,
      detail: `Your Vitamin D of ${r(vitd.value)} is below where it needs to be${isFertility ? ' for fertility and a healthy pregnancy' : ''} - take with a meal containing fat for best absorption and retest in 8–12 weeks.`,
      products: [
        { role: 'Best quality', name: 'Thorne Vitamin D/K2 Liquid', url: amz('thorne vitamin d k2 liquid') },
        { role: 'Best value', name: 'NatureWise Vitamin D3+K2 2000IU', url: amz('naturewise vitamin d3 k2 supplement') },
      ],
    });
  }

  if (tpoAb && tpoAb.status !== STATUS.OPTIMAL && !(vitdLow && hasHighAb)) {
    candidates.push({
      weight: 80,
      label: 'Start Today',
      title: 'Start selenium 200 mcg/day - look for "selenomethionine" on the label',
      detail: `Studies show selenium at this dose can cut TPO antibody levels in half within 3 months. Make sure the label says "selenomethionine" - not selenite, which is a less effective form.`,
      products: [
        { role: 'Best quality', name: 'Thorne Selenomethionine 200mcg', url: amz('thorne selenomethionine 200mcg') },
        { role: 'Best value', name: 'NOW Selenium Selenomethionine 200mcg', url: amz('now foods selenium selenomethionine 200mcg') },
      ],
    });
  }

  if (ferritin && (ferritin.status === STATUS.CRITICAL || ferritin.status === STATUS.CONCERN)) {
    candidates.push({
      weight: isFertility ? 85 : 75,
      label: 'Start Today',
      title: 'Start an iron supplement - look for "iron bisglycinate"',
      detail: `Your ferritin of ${r(ferritin.value)} is too low${isFertility ? ' - needs to be 90+ before pregnancy' : ' for your thyroid to work well'}. Iron bisglycinate is the gentlest form - take it with Vitamin C and at least 4 hours away from your thyroid medication.`,
      products: [
        { role: 'Best quality', name: 'Thorne Iron Bisglycinate', url: amz('thorne iron bisglycinate supplement') },
        { role: 'Best value', name: 'Sports Research Iron Bisglycinate', url: amz('sports research iron bisglycinate') },
      ],
    });
  }

  if (b12 && (b12.status === STATUS.CRITICAL || b12.status === STATUS.CONCERN)) {
    candidates.push({
      weight: 65,
      label: 'Start Today',
      title: 'Start B12 - 1,000 mcg/day, dissolved under your tongue',
      detail: `Your B12 of ${r(b12.value)} is below ideal. Look for "methylcobalamin" on the label (not cyanocobalamin), and let the tablet dissolve under your tongue so it absorbs directly into your bloodstream.`,
      products: [
        { role: 'Best quality', name: 'Jarrow Methyl B-12 5000mcg Sublingual', url: amz('jarrow methyl b12 5000 sublingual lozenge') },
        { role: 'Best value', name: 'NOW B-12 Methylcobalamin 1000mcg Sublingual', url: amz('now foods b12 methylcobalamin sublingual 1000mcg') },
      ],
    });
  }

  // ── Diet actions ─────────────────────────────────────────────────────────────
  if (hasHighAb && crp && crp.status !== STATUS.OPTIMAL) {
    candidates.push({
      weight: 90,
      label: 'Change Your Diet',
      title: 'Cut out gluten completely for 3 months',
      detail: `Your high antibodies and elevated inflammation (CRP ${r(crp.value)}) both point to gluten as a likely trigger - this means fully gluten-free, not just "less bread." Retest your antibodies after 3 months.`,
    });
  } else if (hasHighAb) {
    candidates.push({
      weight: 91,
      label: 'Change Your Diet',
      title: 'Cut out gluten completely for 3 months',
      detail: 'Going fully gluten-free is the single best-studied diet change for lowering TPO antibodies. Commit to strict elimination - even small amounts can keep inflammation going - and retest at 3 months.',
    });
  }

  // ── Lab testing gaps ─────────────────────────────────────────────────────────
  if (tsh && !ft3) {
    candidates.push({
      weight: 68,
      label: 'Get Tested',
      title: 'Ask for Free T3 and Reverse T3 at your next blood draw',
      detail: "TSH alone misses the most common Hashimoto's problem - your TSH can look normal while your active thyroid hormone (Free T3) is too low. Ask your doctor to add Free T3, Free T4, and Reverse T3.",
    });
  }

  if ((tsh || ft3) && !tpoAb && !tgAb) {
    candidates.push({
      weight: isFertility ? 90 : 74,
      label: 'Get Tested',
      title: 'Ask for TPO and TG antibody tests',
      detail: `These two tests confirm whether your thyroid problem is autoimmune and show how actively your immune system is attacking.${isFertility ? ' They are also important miscarriage risk markers - get them tested before trying to conceive.' : ' Most doctors only order TSH - you may have to ask for these specifically.'}`,
    });
  }

  if (rt3 && rt3.direction === 'high' && rt3.status !== STATUS.OPTIMAL) {
    candidates.push({
      weight: 60,
      label: 'Get Tested',
      title: 'Do a home cortisol (stress hormone) test',
      detail: `Your elevated Reverse T3 of ${r(rt3.value)} is often caused by high stress hormones. Ask your doctor about a home saliva test where you collect samples 4 times throughout one day - it shows how your cortisol rises and falls.`,
    });
  }

  if (crp && crp.status === STATUS.CRITICAL) {
    candidates.push({
      weight: 66,
      label: 'Get Tested',
      title: "Ask your doctor to check for a stomach bacteria called H. pylori",
      detail: `Your inflammation marker (CRP ${r(crp.value)}) is high - H. pylori is a very common stomach infection that silently drives inflammation in Hashimoto's patients and is completely treatable once found.`,
    });
  }

  // ── Menopause / Postmenopause actions ────────────────────────────────────────
  if (isAnyMenopause) {
    const estradiol  = get('estradiol');
    const fsh        = get('fsh');
    const cortisolAm = get('cortisol_am');

    // Request a combined thyroid + hormone panel
    const missingHormones = !estradiol && !fsh;
    if (missingHormones) {
      candidates.push({
        weight: 88,
        label: 'Ask Your Doctor',
        title: 'Ask for a combined thyroid + hormone panel at your next blood draw',
        detail: `You've uploaded thyroid results but no hormone markers. Ask your doctor to add FSH, estradiol${isMenopause ? ', and progesterone (tested on day 18–22 of your cycle)' : ''} alongside your next thyroid panel - having both together is what shows the full picture of why you still feel symptoms even with managed thyroid labs.`,
      });
    }

    // Low estradiol action
    if (estradiol && estradiol.direction === 'low' && estradiol.status !== STATUS.OPTIMAL) {
      candidates.push({
        weight: 85,
        label: 'Ask Your Doctor',
        title: 'Have a focused conversation about hormone therapy (HRT)',
        detail: `Your estradiol of ${r(estradiol.value)} pg/mL is low${isMenopause ? ' for perimenopause' : ' for postmenopause'}. Ask your doctor: "Is hormone therapy appropriate for me?" Modern transdermal estradiol (patch or gel) combined with bioidentical progesterone is very different from older pill-form HRT - it's safer and highly effective for the overlapping symptoms of menopause and Hashimoto's.`,
      });
    }

    // High cortisol action
    if (cortisolAm && cortisolAm.direction === 'high' && cortisolAm.status !== STATUS.OPTIMAL) {
      candidates.push({
        weight: 72,
        label: 'Get Tested',
        title: 'Do a 4-point saliva cortisol test to see your full daily stress pattern',
        detail: `Your morning cortisol of ${r(cortisolAm.value)} mcg/dL is elevated. A single AM blood cortisol only shows one snapshot - a 4-point saliva test (morning, noon, afternoon, bedtime) reveals how your cortisol rises and falls throughout the day. This pattern tells your doctor far more about adrenal function than a single value. Ask for this, or order a home saliva kit your doctor can review.`,
      });
    }

    // Postmenopause DEXA scan
    if (isPostmenopause) {
      const vitd = get('vitd');
      const needsBoneScan = !vitd || vitd.status !== STATUS.OPTIMAL;
      if (needsBoneScan) {
        candidates.push({
          weight: 80,
          label: 'Ask Your Doctor',
          title: "Ask about a DEXA bone density scan if you haven't had one",
          detail: "A DEXA scan is recommended for all women within 2 years of menopause. It takes about 10 minutes and tells you exactly where your bone density stands so you can address any loss early - before it becomes a fracture risk.",
        });
      }
    }
  }

  candidates.sort((a, b) => b.weight - a.weight);
  return candidates.slice(0, 3);
}

export function sortByUrgency(results) {
  const order = { [STATUS.CRITICAL]: 0, [STATUS.CONCERN]: 1, [STATUS.OPTIMAL]: 2 };
  return [...results].sort((a, b) => {
    const statusDiff = order[a.status] - order[b.status];
    const priorityDiff = (a.marker.priority || 99) - (b.marker.priority || 99);
    return statusDiff !== 0 ? statusDiff : priorityDiff;
  });
}
