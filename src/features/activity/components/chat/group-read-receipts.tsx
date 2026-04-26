import { memo } from "react";
import { CheckCheck } from "lucide-react";

interface Reader {
  id: string;
  fullName: string;
  avatarUrl: string;
  readAt: string;
}

interface GroupReadReceiptsProps {
  readers: Reader[];
}

/**
 * GroupReadReceipts - Shows who has read a message in a group.
 */
export const GroupReadReceipts = memo(function GroupReadReceipts({
  readers,
}: GroupReadReceiptsProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-bold text-ink">Read by</h3>
        <div className="flex items-center gap-1 text-micro font-bold text-forge-teal uppercase tracking-widest bg-forge-teal/5 px-2 py-0.5 rounded-full border border-forge-teal/10">
          <CheckCheck size={12} />
          {readers.length} members
        </div>
      </div>

      <div className="flex flex-col gap-1 max-h-75 overflow-y-auto pr-1 scrollbar-none">
        {readers.map((reader) => (
          <div
            key={reader.id}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors group"
          >
            <img
              src={reader.avatarUrl}
              alt={reader.fullName}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-border/20 group-hover:ring-forge-teal/40 transition-colors"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink truncate group-hover:text-forge-teal transition-colors">
                {reader.fullName}
              </p>
              <p className="text-micro text-slate-muted">
                Read {reader.readAt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
