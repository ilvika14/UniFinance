import { BarLoader } from "react-spinners";

export default function AccountLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <BarLoader width="200" color="#34d399" />
    </div>
  );
}
