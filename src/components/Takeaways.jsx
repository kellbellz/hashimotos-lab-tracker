const priorityStyles = {
  high:   { wrapper: 'bg-rose-50 border-rose-100',     title: 'text-rose-900',    detail: 'text-rose-800' },
  medium: { wrapper: 'bg-amber-50 border-amber-100',   title: 'text-amber-900',   detail: 'text-amber-800' },
  good:   { wrapper: 'bg-emerald-50 border-emerald-100', title: 'text-emerald-900', detail: 'text-emerald-800' },
};

export function Takeaways({ takeaways }) {
  if (!takeaways.length) return null;

  return (
    <div className="space-y-3">
      {takeaways.map((t, i) => {
        const styles = priorityStyles[t.priority] || priorityStyles.medium;
        return (
          <div key={i} className={`rounded-2xl border p-5 ${styles.wrapper}`}>
            <div className={`font-bold flex items-center gap-2.5 text-sm leading-snug ${styles.title}`}>
              <span className="text-xl">{t.icon}</span>
              {t.title}
            </div>
            <p className={`text-sm mt-2 leading-relaxed ${styles.detail}`}>{t.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
