import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex justify-center">
      <Image
        src="/images/logo/logo.png"
        alt="WON"
        width={40}
        height={40}
        priority
      />
    </div>
  );
}
