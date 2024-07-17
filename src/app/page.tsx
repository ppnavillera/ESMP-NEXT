import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1 className="font-bold text-red-200 text-6xl text-center">Hello!</h1>
      <nav className="border-gray-900 border">
        <ul>
          <li>
            <Link className="border border-black" href="/player">
              player
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
