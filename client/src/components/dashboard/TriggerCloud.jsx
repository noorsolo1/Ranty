export default function TriggerCloud({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        No trigger keywords yet
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  function getFontSize(count) {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'text-2xl font-bold';
    if (ratio > 0.6) return 'text-xl font-semibold';
    if (ratio > 0.4) return 'text-lg font-medium';
    if (ratio > 0.2) return 'text-base';
    return 'text-sm font-light';
  }

  function getColor(count) {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'text-red-400';
    if (ratio > 0.6) return 'text-orange-400';
    if (ratio > 0.4) return 'text-yellow-400';
    if (ratio > 0.2) return 'text-blue-400';
    return 'text-gray-400';
  }

  // Shuffle for natural cloud look
  const shuffled = [...data].sort(() => Math.random() - 0.5);

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center py-4">
      {shuffled.map((item) => (
        <span
          key={item.keyword}
          className={`${getFontSize(item.count)} ${getColor(item.count)} cursor-default hover:opacity-80 transition-opacity`}
          title={`${item.keyword}: ${item.count} times`}
        >
          {item.keyword}
        </span>
      ))}
    </div>
  );
}
