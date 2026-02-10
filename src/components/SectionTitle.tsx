interface SectionTitleProps {
  children: React.ReactNode;
}

const SectionTitle = ({ children }: SectionTitleProps) => (
  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary border-b-2 border-primary/20 pb-1 mb-4">
    {children}
  </h3>
);

export default SectionTitle;
