// This shows colored status labels like PENDING, ACTIVE etc.

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors: Record<string, string> = {
    ACTIVE:    "bg-green-100 text-green-800",
    PENDING:   "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
    EXPIRED:   "bg-gray-100 text-gray-800",
    APPROVED:  "bg-green-100 text-green-800",
    REJECTED:  "bg-red-100 text-red-800",
    PAID:      "bg-green-100 text-green-800",
    FAILED:    "bg-red-100 text-red-800",
    ADMIN:     "bg-blue-100 text-blue-800",  
    USER:      "bg-gray-100 text-gray-700",  
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium
      ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}