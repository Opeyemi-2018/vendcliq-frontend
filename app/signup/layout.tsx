import Logo from "@/components/Logo";

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="scroll-smooth relative">
      <div className="text-black absolute left-20 top-10">
        <Logo />
      </div>
      <div className="">
        <main className="">{children}</main>
      </div>
    </div>
  );
}
