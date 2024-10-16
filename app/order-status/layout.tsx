export default function OrderStatusLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="order-status-layout">
        {children}
      </div>
    );
  }