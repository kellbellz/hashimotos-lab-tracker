const priorityStyles = {
  high: { wrapper: 'bg-red-50 border-red-200', title: 'text-red-900', detail: 'text-red-800' },
  medium: { wrapper: 'bg-amber-50 border-amber-200', title: 'text-amber-900', detail: 'text-amber-800' },
  good: { wrapper: 'bg-green-50 border-green-200', title: 'text-green-900', detail: 'text-green-800' },
};

export function Takeaways({ takeaways }) {
  if (!takeaways.length) return null;

  return (
    <div className="space-y-3">
      {takeaways.map((t, i) => {
        const styles = priorityStyles[t.priority] || priorityStyles.medium;
        return (
          <div key={i} className={`rounded-xl border p-4 ${styles.wrapper}`}>
            <div className={`font-semibold flex items-center gap-2 ${styles.title}`}>
              <span className="text-lg">{t.icon}</span>
              {t.title}
            </div>
            <p className={`text-sm mt-1.5 leading-relaxed ${styles.detail}`}>{t.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
