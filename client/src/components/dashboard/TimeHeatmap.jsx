export default function TimeHeatmap({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-500 text-sm">
        No time data yet
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  function getIntensity(count) {
    const ratio = count / maxCount;
    if (ratio === 0) return 'bg-gray-800 border-gray-700';
    if (ratio < 0.2) return 'bg-red-900/40 border-red-800/50';
    if (ratio < 0.4) return 'bg-red-800/60 border-red-700/60';
    if (ratio < 0.6) return 'bg-red-700/80 border-red-600/70';
    if (ratio < 0.8) return 'bg-red-600 border-red-500';
    return 'bg-red-500 border-red-400';
  }

  function formatHour(h) {
    if (h === 0) return '12a';
    if (h < 12) return `${h}a`;
    if (h === 12) return '12p';
    return `${h - 12}p`;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {data.map((item) => (
          <div key={item.hour} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded border ${getIntensity(item.count)} transition-colors cursor-default`}
              title={`${formatHour(item.hour)}: ${item.count} rant${item.count !== 1 ? 's' : ''}`}
            />
            <span className="text-[10px] text-gray-600">{formatHour(item.hour)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          {['bg-gray-800', 'bg-red-900/40', 'bg-red-800/60', 'bg-red-700/80', 'bg-red-600', 'bg-red-500'].map((c, i) => (
            <div key={i} className={`w-4 h-4 rounded ${c}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
